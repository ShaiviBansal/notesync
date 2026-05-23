// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import API from "../api";

// export default function Dashboard() {
// 	const [documents, setDocuments] = useState([]);
// 	const [title, setTitle] = useState("");
// 	const [email, setEmail] = useState("");
// 	const navigate = useNavigate();

// 	useEffect(() => {
// 		fetchDocuments();
// 		fetchUser();
// 	}, []);

// 	const fetchUser = async () => {
// 		try {
// 			const res = await API.get("/me");
// 			setEmail(res.data.email);
// 		} catch {
// 			navigate("/login");
// 		}
// 	};

// 	const fetchDocuments = async () => {
// 		try {
// 			const res = await API.get("/documents");
// 			setDocuments(res.data);
// 		} catch {
// 			navigate("/login");
// 		}
// 	};

// 	const createDocument = async (e) => {
// 		e.preventDefault();
// 		if (!title.trim()) return;
// 		try {
// 			const res = await API.post("/documents", { title });
// 			setDocuments([...documents, res.data]);
// 			setTitle("");
// 		} catch (err) {
// 			console.error(err);
// 		}
// 	};

// 	const deleteDocument = async (id) => {
// 		try {
// 			await API.delete(`/documents/${id}`);
// 			setDocuments(documents.filter((d) => d.id !== id));
// 		} catch (err) {
// 			console.error(err);
// 		}
// 	};

// 	const logout = () => {
// 		localStorage.removeItem("token");
// 		navigate("/login");
// 	};

// 	return (
// 		<div style={styles.container}>
// 			<div style={styles.header}>
// 				<h1 style={styles.logo}>NoteSync</h1>
// 				<div style={styles.userRow}>
// 					<span style={styles.email}>{email}</span>
// 					<button style={styles.logoutBtn} onClick={logout}>
// 						Logout
// 					</button>
// 				</div>
// 			</div>

// 			<div style={styles.body}>
// 				<form onSubmit={createDocument} style={styles.createForm}>
// 					<input
// 						style={styles.input}
// 						placeholder="New document title..."
// 						value={title}
// 						onChange={(e) => setTitle(e.target.value)}
// 					/>
// 					<button style={styles.createBtn} type="submit">
// 						+ Create
// 					</button>
// 				</form>

// 				{documents.length === 0 ? (
// 					<p style={styles.empty}>No documents yet. Create one above.</p>
// 				) : (
// 					<div style={styles.grid}>
// 						{documents.map((doc) => (
// 							<div key={doc.id} style={styles.card}>
// 								<div
// 									style={styles.cardTitle}
// 									onClick={() => navigate(`/editor/${doc.id}`)}
// 								>
// 									{doc.title}
// 								</div>
// 								<div style={styles.cardFooter}>
// 									<span style={styles.date}>
// 										{new Date(doc.created_at).toLocaleDateString()}
// 									</span>
// 									<button
// 										style={styles.deleteBtn}
// 										onClick={() => deleteDocument(doc.id)}
// 									>
// 										Delete
// 									</button>
// 								</div>
// 							</div>
// 						))}
// 					</div>
// 				)}
// 			</div>
// 		</div>
// 	);
// }

// const styles = {
// 	container: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
// 	header: {
// 		backgroundColor: "white",
// 		padding: "16px 32px",
// 		display: "flex",
// 		justifyContent: "space-between",
// 		alignItems: "center",
// 		boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
// 	},
// 	logo: { fontSize: "22px", fontWeight: "700", color: "#2563eb" },
// 	userRow: { display: "flex", alignItems: "center", gap: "16px" },
// 	email: { fontSize: "13px", color: "#666" },
// 	logoutBtn: {
// 		padding: "6px 14px",
// 		backgroundColor: "#f3f4f6",
// 		border: "1px solid #ddd",
// 		borderRadius: "4px",
// 		cursor: "pointer",
// 		fontSize: "13px",
// 	},
// 	body: { maxWidth: "800px", margin: "0 auto", padding: "32px 16px" },
// 	createForm: { display: "flex", gap: "8px", marginBottom: "24px" },
// 	input: {
// 		flex: 1,
// 		padding: "10px",
// 		border: "1px solid #ddd",
// 		borderRadius: "4px",
// 		fontSize: "14px",
// 	},
// 	createBtn: {
// 		padding: "10px 20px",
// 		backgroundColor: "#2563eb",
// 		color: "white",
// 		border: "none",
// 		borderRadius: "4px",
// 		cursor: "pointer",
// 		fontSize: "14px",
// 	},
// 	empty: { color: "#999", textAlign: "center", marginTop: "60px" },
// 	grid: {
// 		display: "grid",
// 		gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
// 		gap: "16px",
// 	},
// 	card: {
// 		backgroundColor: "white",
// 		borderRadius: "8px",
// 		padding: "16px",
// 		boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
// 		cursor: "pointer",
// 	},
// 	cardTitle: {
// 		fontSize: "15px",
// 		fontWeight: "600",
// 		marginBottom: "12px",
// 		color: "#1a1a1a",
// 	},
// 	cardFooter: {
// 		display: "flex",
// 		justifyContent: "space-between",
// 		alignItems: "center",
// 	},
// 	date: { fontSize: "11px", color: "#999" },
// 	deleteBtn: {
// 		fontSize: "11px",
// 		color: "#ef4444",
// 		background: "none",
// 		border: "none",
// 		cursor: "pointer",
// 	},
// };

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api";

export default function Dashboard() {
	const [documents, setDocuments] = useState([]);
	const [title, setTitle] = useState("");
	const [email, setEmail] = useState("");
	const [search, setSearch] = useState("");
	const navigate = useNavigate();

	useEffect(() => {
		fetchDocuments();
		fetchUser();
	}, []);

	const fetchUser = async () => {
		try {
			const res = await API.get("/me");
			setEmail(res.data.email);
		} catch {
			navigate("/login");
		}
	};

	const fetchDocuments = async () => {
		try {
			const res = await API.get("/documents");
			setDocuments(res.data);
		} catch {
			navigate("/login");
		}
	};

	const createDocument = async (e) => {
		e.preventDefault();
		if (!title.trim()) return;
		try {
			const res = await API.post("/documents", { title });
			setDocuments([...documents, res.data]);
			setTitle("");
		} catch (err) {
			console.error(err);
		}
	};

	const deleteDocument = async (id) => {
		try {
			await API.delete(`/documents/${id}`);
			setDocuments(documents.filter((d) => d.id !== id));
		} catch (err) {
			console.error(err);
		}
	};

	const logout = () => {
		localStorage.removeItem("token");
		navigate("/login");
	};

	const filtered = documents.filter((d) =>
		d.title.toLowerCase().includes(search.toLowerCase()),
	);

	return (
		<div style={styles.container}>
			<div style={styles.header}>
				<h1 style={styles.logo}>NoteSync</h1>
				<div style={styles.userRow}>
					<span style={styles.email}>{email}</span>
					<button style={styles.logoutBtn} onClick={logout}>
						Logout
					</button>
				</div>
			</div>

			<div style={styles.body}>
				<form onSubmit={createDocument} style={styles.createForm}>
					<input
						style={styles.input}
						placeholder="New document title..."
						value={title}
						onChange={(e) => setTitle(e.target.value)}
					/>
					<button style={styles.createBtn} type="submit">
						+ Create
					</button>
				</form>

				<input
					style={styles.searchInput}
					placeholder="Search documents..."
					value={search}
					onChange={(e) => setSearch(e.target.value)}
				/>

				{filtered.length === 0 ? (
					<p style={styles.empty}>
						{search
							? "No documents match your search."
							: "No documents yet. Create one above."}
					</p>
				) : (
					<div style={styles.grid}>
						{filtered.map((doc) => (
							<div key={doc.id} style={styles.card}>
								<div
									style={styles.cardTitle}
									onClick={() => navigate(`/editor/${doc.id}`)}
								>
									{doc.title}
								</div>
								<div style={styles.cardFooter}>
									<span style={styles.date}>
										Last edited {timeAgo(doc.updated_at)}
									</span>
									<button
										style={styles.deleteBtn}
										onClick={() => deleteDocument(doc.id)}
									>
										Delete
									</button>
								</div>
							</div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}

function timeAgo(dateStr) {
	const now = new Date();
	const date = new Date(dateStr);
	const diff = Math.floor((now - date) / 1000);
	if (diff < 60) return `${diff}s ago`;
	if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
	if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
	return `${Math.floor(diff / 86400)}d ago`;
}

const styles = {
	container: { minHeight: "100vh", backgroundColor: "#f5f5f5" },
	header: {
		backgroundColor: "white",
		padding: "16px 32px",
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
		boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
	},
	logo: { fontSize: "22px", fontWeight: "700", color: "#2563eb" },
	userRow: { display: "flex", alignItems: "center", gap: "16px" },
	email: { fontSize: "13px", color: "#666" },
	logoutBtn: {
		padding: "6px 14px",
		backgroundColor: "#f3f4f6",
		border: "1px solid #ddd",
		borderRadius: "4px",
		cursor: "pointer",
		fontSize: "13px",
	},
	body: { maxWidth: "800px", margin: "0 auto", padding: "32px 16px" },
	createForm: { display: "flex", gap: "8px", marginBottom: "12px" },
	input: {
		flex: 1,
		padding: "10px",
		border: "1px solid #ddd",
		borderRadius: "4px",
		fontSize: "14px",
	},
	searchInput: {
		width: "100%",
		padding: "10px",
		border: "1px solid #ddd",
		borderRadius: "4px",
		fontSize: "14px",
		marginBottom: "24px",
		boxSizing: "border-box",
	},
	createBtn: {
		padding: "10px 20px",
		backgroundColor: "#2563eb",
		color: "white",
		border: "none",
		borderRadius: "4px",
		cursor: "pointer",
		fontSize: "14px",
	},
	empty: { color: "#999", textAlign: "center", marginTop: "60px" },
	grid: {
		display: "grid",
		gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
		gap: "16px",
	},
	card: {
		backgroundColor: "white",
		borderRadius: "8px",
		padding: "16px",
		boxShadow: "0 1px 4px rgba(0,0,0,0.08)",
		cursor: "pointer",
	},
	cardTitle: {
		fontSize: "15px",
		fontWeight: "600",
		marginBottom: "12px",
		color: "#1a1a1a",
	},
	cardFooter: {
		display: "flex",
		justifyContent: "space-between",
		alignItems: "center",
	},
	date: { fontSize: "11px", color: "#999" },
	deleteBtn: {
		fontSize: "11px",
		color: "#ef4444",
		background: "none",
		border: "none",
		cursor: "pointer",
	},
};
