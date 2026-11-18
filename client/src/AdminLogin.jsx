
import { useState } from "react";

function AdminLogin({ onLogin }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/api/admin/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ username, password })
        }
      );

      const data = await response.json();

      if (!response.ok || !data.success || !data.token) {
        throw new Error(data.message || "Login failed.");
      }

      onLogin(data.token);
    } catch (err) {
      setError(err.message || "Unable to log in.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="admin-login">
      <h2>Admin Login</h2>
      <p>Sign in to access the administrator dashboard.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="admin-username">Username</label>
        <input
          id="admin-username"
          type="text"
          autoComplete="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <label htmlFor="admin-password">Password</label>
        <input
          id="admin-password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {error && <p role="alert">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Signing in..." : "Login"}
        </button>
      </form>
    </section>
  );
}

export default AdminLogin;
