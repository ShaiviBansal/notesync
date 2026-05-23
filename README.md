# NoteSync

A real-time collaborative notes application where multiple users can edit documents simultaneously with live sync.

## Features

- JWT-based user authentication (register, login, logout)
- Create, edit, delete, and search documents
- Real-time collaborative editing via WebSockets — changes sync instantly across all connected users
- Document persistence with PostgreSQL
- Last edited timestamps
- Share documents via unique link

## Tech Stack

**Frontend:** React, React Router, Axios  
**Backend:** Python, FastAPI, WebSockets  
**Database:** PostgreSQL (Supabase)  
**Auth:** JWT tokens with bcrypt password hashing  
**Deployment:** Vercel (frontend), Render (backend)

## Architecture

The real-time sync works via a persistent WebSocket connection per document. When a user types, the change is sent to the FastAPI WebSocket server which simultaneously saves it to PostgreSQL and broadcasts it to all other connected users on the same document — no refresh needed.

## Run Locally

### Backend

```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend
npm install
npm start
```

### Environment Variables

Create a `.env` file in the backend folder:

```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
SECRET_KEY=your_jwt_secret
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
```
