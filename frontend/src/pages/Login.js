import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../api";

export default function Login() {
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [error, setError] = useState("");
	const navigate = useNavigate();

	const handleLogin = async (e) => {
		e.preventDefault();
		try {
			const res = await API.post(
				"/login",
				new URLSearchParams({
					username: email,
					password: password,
				}),
			);
			localStorage.setItem("token", res.data.access_token);
			navigate("/dashboard");
		} catch (err) {
			setError("Invalid email or password");
		}
	};

	return (
		<div style={styles.container}>
			<div style={styles.card}>
				<h2 style={styles.title}>Welcome back</h2>
				<form onSubmit={handleLogin}>
					<input
						style={styles.input}
						type="email"
						placeholder="Email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						required
					/>
					<input
						style={styles.input}
						type="password"
						placeholder="Password"
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						required
					/>
					{error && <p style={styles.error}>{error}</p>}
					<button style={styles.button} type="submit">
						Login
					</button>
				</form>
				<p style={styles.link}>
					Don't have an account? <Link to="/register">Register</Link>
				</p>
			</div>
		</div>
	);
}

const styles = {
	container: {
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		height: "100vh",
		backgroundColor: "#f5f5f5",
	},
	card: {
		backgroundColor: "white",
		padding: "40px",
		borderRadius: "8px",
		boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
		width: "360px",
	},
	title: { marginBottom: "24px", fontSize: "24px", fontWeight: "600" },
	input: {
		width: "100%",
		padding: "10px",
		marginBottom: "12px",
		border: "1px solid #ddd",
		borderRadius: "4px",
		fontSize: "14px",
		boxSizing: "border-box",
	},
	button: {
		width: "100%",
		padding: "10px",
		backgroundColor: "#2563eb",
		color: "white",
		border: "none",
		borderRadius: "4px",
		fontSize: "14px",
		cursor: "pointer",
	},
	error: { color: "red", fontSize: "13px", marginBottom: "8px" },
	link: { marginTop: "16px", fontSize: "13px", textAlign: "center" },
};
