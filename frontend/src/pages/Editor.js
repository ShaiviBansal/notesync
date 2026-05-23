import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../api";

export default function Editor() {
	const { docId } = useParams();
	const navigate = useNavigate();
	const [document, setDocument] = useState(null);
	const [content, setContent] = useState("");
	const [title, setTitle] = useState("");
	const [connected, setConnected] = useState(false);
	const [collaborators, setCollaborators] = useState(0);
	const [saved, setSaved] = useState(true);
	const wsRef = useRef(null);
	const isRemoteUpdate = useRef(false);

	useEffect(() => {
		fetchDocument();
		connectWebSocket();
		return () => {
			if (wsRef.current) wsRef.current.close();
		};
	}, [docId]);

	const fetchDocument = async () => {
		try {
			const res = await API.get(`/documents/${docId}`);
			setDocument(res.data);
			setContent(res.data.content || "");
			setTitle(res.data.title || "");
		} catch {
			navigate("/dashboard");
		}
	};

	const connectWebSocket = () => {
		const ws = new WebSocket(`ws://127.0.0.1:8000/ws/${docId}`);
		wsRef.current = ws;

		ws.onopen = () => {
			setConnected(true);
		};

		ws.onmessage = (event) => {
			const payload = JSON.parse(event.data);
			if (payload.type === "content") {
				isRemoteUpdate.current = true;
				setContent(payload.content);
			}
			if (payload.type === "collaborators") {
				setCollaborators(payload.count);
			}
		};

		ws.onclose = () => {
			setConnected(false);
		};

		ws.onerror = () => {
			setConnected(false);
		};
	};

	const handleContentChange = (e) => {
		const newContent = e.target.value;
		setContent(newContent);
		setSaved(false);

		if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
			wsRef.current.send(
				JSON.stringify({
					type: "content",
					content: newContent,
				}),
			);
		}
	};

	const handleTitleBlur = async () => {
		try {
			await API.patch(`/documents/${docId}`, { title });
			setSaved(true);
		} catch (err) {
			console.error(err);
		}
	};

	const copyShareLink = () => {
		if (document?.share_token) {
			const link = `${window.location.origin}/shared/${document.share_token}`;
			navigator.clipboard.writeText(link);
			alert("Share link copied to clipboard!");
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<button style={styles.backBtn} onClick={() => navigate("/dashboard")}>
					← Back
				</button>
				<input
					style={styles.titleInput}
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					onBlur={handleTitleBlur}
					placeholder="Untitled"
				/>
				<div style={styles.headerRight}>
					<span style={saved ? styles.savedBadge : styles.unsavedBadge}>
						{saved ? "Saved" : "Saving..."}
					</span>
					<span
						style={connected ? styles.connectedBadge : styles.disconnectedBadge}
					>
						{connected ? "● Live" : "○ Offline"}
					</span>
					<button style={styles.shareBtn} onClick={copyShareLink}>
						Share
					</button>
				</div>
			</div>

			<div style={styles.editorWrapper}>
				<textarea
					style={styles.textarea}
					value={content}
					onChange={handleContentChange}
					placeholder="Start writing..."
					spellCheck={true}
				/>
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		flexDirection: "column",
		height: "100vh",
		backgroundColor: "#fff",
	},
	header: {
		display: "flex",
		alignItems: "center",
		padding: "12px 24px",
		borderBottom: "1px solid #eee",
		gap: "16px",
	},
	backBtn: {
		padding: "6px 12px",
		backgroundColor: "#f3f4f6",
		border: "1px solid #ddd",
		borderRadius: "4px",
		cursor: "pointer",
		fontSize: "13px",
	},
	titleInput: {
		flex: 1,
		fontSize: "18px",
		fontWeight: "600",
		border: "none",
		outline: "none",
		color: "#1a1a1a",
	},
	headerRight: { display: "flex", alignItems: "center", gap: "12px" },
	savedBadge: { fontSize: "12px", color: "#16a34a" },
	unsavedBadge: { fontSize: "12px", color: "#f59e0b" },
	connectedBadge: { fontSize: "12px", color: "#2563eb", fontWeight: "600" },
	disconnectedBadge: { fontSize: "12px", color: "#9ca3af" },
	shareBtn: {
		padding: "6px 14px",
		backgroundColor: "#2563eb",
		color: "white",
		border: "none",
		borderRadius: "4px",
		cursor: "pointer",
		fontSize: "13px",
	},
	editorWrapper: {
		flex: 1,
		padding: "40px",
		maxWidth: "800px",
		width: "100%",
		margin: "0 auto",
		boxSizing: "border-box",
	},
	textarea: {
		width: "100%",
		height: "100%",
		border: "none",
		outline: "none",
		fontSize: "16px",
		lineHeight: "1.7",
		resize: "none",
		fontFamily: "Georgia, serif",
		color: "#1a1a1a",
	},
};
