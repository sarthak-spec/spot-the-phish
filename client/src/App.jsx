import { API_URL } from "./api";
import { useState } from "react";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";
import Quiz from "./Quiz";

function App() {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Admin authentication state
  const [adminToken, setAdminToken] = useState(null);

  const checkUrl = async (event) => {
    event.preventDefault();

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const response = await fetch(
        "`${API_URL}/api/check-url`,",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ url }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to check URL");
      }

      setResult(data);
    } catch (err) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const riskColors = {
    Low: "#22c55e",
    Medium: "#f59e0b",
    High: "#ef4444",
  };

  return (
    <div className="app">
      <header className="header">
        <div className="logo">🛡️ Spot the Phish</div>
        <span className="header-label">
          Phishing Awareness Platform
        </span>
      </header>

      <main className="main">
        <div className="hero">
          <span className="eyebrow">STAY SAFE ONLINE</span>

          <h1>
            Spot the Phish
            <br />
            Before It Spreads.
          </h1>

          <p>
            Check suspicious links, understand warning signs,
            and protect yourself from phishing attacks.
          </p>
        </div>

        <section className="checker-card">
          <h2>Check a suspicious URL</h2>
          <p>
            Paste a website link below to analyze its URL patterns.
          </p>

          <form onSubmit={checkUrl} className="checker-form">
            <input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              required
            />

            <button type="submit" disabled={loading}>
              {loading ? "Analyzing..." : "Check URL"}
            </button>
          </form>

          {error && <p className="error">{error}</p>}

          {result && (
            <div className="result">
              <div className="result-top">
                <h3>Analysis Result</h3>

                <span
                  className="risk-badge"
                  style={{
                    backgroundColor:
                      riskColors[result.riskLevel],
                  }}
                >
                  {result.riskLevel} Risk
                </span>
              </div>

              <div className="score">
                <strong>{result.score}/100</strong>
                <span>Heuristic risk score</span>
              </div>

              <div className="progress">
                <div
                  className="progress-fill"
                  style={{
                    width: `${result.score}%`,
                    backgroundColor:
                      riskColors[result.riskLevel],
                  }}
                />
              </div>

              <h4>Detected Signals</h4>

              <ul>
                {result.signals.map((signal, index) => (
                  <li key={index}>{signal}</li>
                ))}
              </ul>

              <h4>Recommendation</h4>
              <p>{result.recommendation}</p>

              <p className="disclaimer">
                This is a basic URL-pattern analysis,
                not a guarantee of website safety.
              </p>
            </div>
          )}
        </section>

        <Quiz />

        {/* Admin authentication */}
        {adminToken ? (
          <div>
            <button
  type="button"
  className="admin-logout-btn"
  onClick={() => setAdminToken(null)}
>
  <span>↪</span> Logout Admin
</button>

            <AdminDashboard token={adminToken} />
          </div>
        ) : (
          <AdminLogin onLogin={setAdminToken} />
        )}

        <footer>
          Spot the Phish · Educational Cybersecurity Project
        </footer>
      </main>
    </div>
  );
}

export default App;
