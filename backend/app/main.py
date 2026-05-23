from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel
from typing import Dict, List
import json
import uuid

from app.database import supabase
from app.auth import hash_password, verify_password, create_access_token, decode_token

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# --- Connection Manager for WebSockets ---
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, document_id: str, websocket: WebSocket):
        await websocket.accept()
        if document_id not in self.active_connections:
            self.active_connections[document_id] = []
        self.active_connections[document_id].append(websocket)

    def disconnect(self, document_id: str, websocket: WebSocket):
        self.active_connections[document_id].remove(websocket)

    async def broadcast(self, document_id: str, message: str, sender: WebSocket):
        if document_id in self.active_connections:
            for connection in self.active_connections[document_id]:
                if connection != sender:
                    await connection.send_text(message)

manager = ConnectionManager()

# --- Pydantic Models ---
class UserRegister(BaseModel):
    email: str
    password: str

class DocumentCreate(BaseModel):
    title: str

class DocumentUpdate(BaseModel):
    title: str = None
    content: str = None

# --- Helper ---
def get_current_user(token: str = Depends(oauth2_scheme)):
    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")
    return payload

# --- Auth Routes ---
@app.post("/register")
def register(user: UserRegister):
    existing = supabase.table("users").select("*").eq("email", user.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    hashed = hash_password(user.password)
    result = supabase.table("users").insert({
        "email": user.email,
        "hashed_password": hashed
    }).execute()
    return {"message": "User created successfully"}

@app.post("/login")
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = supabase.table("users").select("*").eq("email", form_data.username).execute()
    if not user.data:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    u = user.data[0]
    if not verify_password(form_data.password, u["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    token = create_access_token({"sub": u["id"], "email": u["email"]})
    return {"access_token": token, "token_type": "bearer"}

@app.get("/me")
def get_me(current_user: dict = Depends(get_current_user)):
    return {"id": current_user["sub"], "email": current_user["email"]}

# --- Document Routes ---
@app.post("/documents")
def create_document(doc: DocumentCreate, current_user: dict = Depends(get_current_user)):
    result = supabase.table("documents").insert({
        "title": doc.title,
        "content": "",
        "owner_id": current_user["sub"]
    }).execute()
    return result.data[0]

@app.get("/documents")
def get_documents(current_user: dict = Depends(get_current_user)):
    owned = supabase.table("documents").select("*").eq("owner_id", current_user["sub"]).execute()
    return owned.data

@app.get("/documents/{doc_id}")
def get_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    result = supabase.table("documents").select("*").eq("id", doc_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return result.data[0]

@app.patch("/documents/{doc_id}")
def update_document(doc_id: str, update: DocumentUpdate, current_user: dict = Depends(get_current_user)):
    data = {k: v for k, v in update.dict().items() if v is not None}
    result = supabase.table("documents").update(data).eq("id", doc_id).execute()
    return result.data[0]

@app.delete("/documents/{doc_id}")
def delete_document(doc_id: str, current_user: dict = Depends(get_current_user)):
    supabase.table("documents").delete().eq("id", doc_id).execute()
    return {"message": "Deleted"}

@app.get("/documents/share/{token}")
def get_by_share_token(token: str):
    result = supabase.table("documents").select("*").eq("share_token", token).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Document not found")
    return result.data[0]

# --- WebSocket Route ---
@app.websocket("/ws/{document_id}")
async def websocket_endpoint(websocket: WebSocket, document_id: str):
    await manager.connect(document_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            payload = json.loads(data)
            # Save content to DB
            supabase.table("documents").update({
                "content": payload.get("content", ""),
                "updated_at": "now()"
            }).eq("id", document_id).execute()
            # Broadcast to all other users on same document
            await manager.broadcast(document_id, data, websocket)
    except WebSocketDisconnect:
        manager.disconnect(document_id, websocket)