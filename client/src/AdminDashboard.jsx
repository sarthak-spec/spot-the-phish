

import { useEffect, useState } from "react";

function AdminDashboard({ token }) {
  const [stats, setStats] = useState(null);
  const [recentScans, setRecentScans] = useState([]);
  const [recentQuizzes, setRecentQuizzes] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scansError, setScansError] = useState("");
  const [quizzesError, setQuizzesError] = useState("");

  useEffect(() => {
    async function fetchStats() {
      try {
       const response = await fetch(
  "http://127.0.0.1:8000/api/admin/stats",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        if (!response.ok) {
          throw new Error("Failed to fetch statistics");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Unable to load statistics");
        }

        setStats(data.stats);
      } catch (err) {
        console.error(err);
        setError("Could not load dashboard statistics.");
      } finally {
        setLoading(false);
      }
    }

    async function fetchRecentScans() {
      try {
       const response = await fetch(
  "http://127.0.0.1:8000/api/admin/recent-scans",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
        if (!response.ok) {
          throw new Error("Failed to fetch recent scans");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Unable to load recent scans");
        }

        setRecentScans(data.scans);
      } catch (err) {
        console.error(err);
        setScansError("Could not load recent URL scans.");
      }
    }

    async function fetchRecentQuizzes() {
      try {
       const response = await fetch(
  "http://127.0.0.1:8000/api/admin/recent-quizzes",
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);

        if (!response.ok) {
          throw new Error("Failed to fetch recent quizzes");
        }

        const data = await response.json();

        if (!data.success) {
          throw new Error("Unable to load quiz activity");
        }

        setRecentQuizzes(data.quizzes);
      } catch (err) {
        console.error(err);
        setQuizzesError("Could not load recent quiz activity.");
      }
    }

       fetchStats();
    fetchRecentScans();
    fetchRecentQuizzes();
  }, [token]);
  
  if (loading) {
    return (
      <section className="admin-dashboard">
        <h2>Loading dashboard...</h2>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-dashboard">
        <h2>Admin Dashboard</h2>
        <p role="alert">{error}</p>
      </section>
    );
  }

  const cards = [
    {
      title: "Total URL Scans",
      value: stats.totalScans
    },
    {
      title: "Low Risk URLs",
      value: stats.lowRisk
    },
    {
      title: "Medium Risk URLs",
      value: stats.mediumRisk
    },
    {
      title: "High Risk URLs",
      value: stats.highRisk
    },
    {
      title: "Quiz Attempts",
      value: stats.totalQuizAttempts
    },
    {
      title: "Average Quiz Score",
      value: `${stats.averageQuizScore}%`
    }
  ];

  return (
    <section className="admin-dashboard">
      <h2>Admin Dashboard</h2>

      <p>
        Monitor phishing URL scans and awareness quiz
        performance.
      </p>

      {/* Statistics Cards */}
      <div className="admin-stats-grid">
        {cards.map((card) => (
          <div className="admin-stat-card" key={card.title}>
            <h3>{card.title}</h3>
            <p className="admin-stat-value">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent URL Scans */}
      <div className="admin-recent-scans">
        <h3>Recent URL Scans</h3>

        {scansError && (
          <p role="alert">{scansError}</p>
        )}

        {!scansError && recentScans.length === 0 && (
          <p>No URL scans found yet.</p>
        )}

        {recentScans.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>URL</th>
                  <th>Risk Level</th>
                  <th>Score</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {recentScans.map((scan) => (
                  <tr key={scan._id}>
                    <td className="admin-url">
                      {scan.url}
                    </td>

                    <td>
                      <span
                        className={`risk-badge ${scan.riskLevel.toLowerCase()}`}
                      >
                        {scan.riskLevel}
                      </span>
                    </td>

                    <td>{scan.score}/100</td>

                    <td>
                      {new Date(scan.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent Quiz Activity */}
      <div className="admin-recent-quizzes">
        <h3>Recent Quiz Activity</h3>

        {quizzesError && (
          <p role="alert">{quizzesError}</p>
        )}

        {!quizzesError && recentQuizzes.length === 0 && (
          <p>No quiz attempts found yet.</p>
        )}

        {recentQuizzes.length > 0 && (
          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Score</th>
                  <th>Percentage</th>
                  <th>Completed At</th>
                </tr>
              </thead>

              <tbody>
                {recentQuizzes.map((quiz) => (
                  <tr key={quiz._id}>
                    <td>
                      {quiz.score}/{quiz.totalQuestions}
                    </td>

                    <td>{quiz.percentage}%</td>

                    <td>
                      {new Date(quiz.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

export default AdminDashboard;
