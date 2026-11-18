import { API_URL } from "./api";
import { useState } from "react";

const questions = [
  {
    question: "Which URL is more likely to be a phishing attempt?",
    options: [
      "https://accounts.google.com",
      "https://google-login-security.example.com",
      "https://www.google.com",
      "https://support.google.com"
    ],
    answer: 1,
    explanation:
      "The actual domain is example.com, not google.com. Attackers can put trusted brand names in subdomains to mislead users."
  },
  {
    question: "You receive an email saying your account will be blocked in 10 minutes. What should you do?",
    options: [
      "Click the link immediately",
      "Reply with your password",
      "Open the official website independently and verify",
      "Forward the message to all friends"
    ],
    answer: 2,
    explanation:
      "Urgent threats are common phishing tactics. Verify through an official website or trusted contact method."
  },
  {
    question: "Does HTTPS guarantee that a website is safe?",
    options: [
      "Yes, always",
      "No, phishing websites can also use HTTPS",
      "Only on mobile phones",
      "Only for banking websites"
    ],
    answer: 1,
    explanation:
      "HTTPS encrypts the connection but does not prove that the website or its owner is trustworthy."
  },
  {
    question: "What is the safest way to handle an unfamiliar shortened link?",
    options: [
      "Click it to see where it goes",
      "Enter your login details if asked",
      "Verify the destination using a trusted method before opening",
      "Share it with classmates"
    ],
    answer: 2,
    explanation:
      "Shortened links hide their destination. Avoid opening unfamiliar links until you have verified them safely."
  },
  {
    question: "Which is a common sign of a phishing message?",
    options: [
      "Pressure to act immediately",
      "A message from a known friend",
      "A correctly spelled sentence",
      "A website using HTTPS"
    ],
    answer: 0,
    explanation:
      "Attackers frequently use urgency, fear, and threats to push people into making quick decisions."
  }
];

function Quiz() {
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState(null);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [saveError, setSaveError] = useState("");

  const question = questions[current];

  function selectAnswer(index) {
    if (selected !== null) return;

    setSelected(index);

    if (index === question.answer) {
      setScore((previous) => previous + 1);
    }
  }

async function saveQuizResult(finalScore) {
  setSaving(true);
  setSaveStatus("");
  setSaveError("");

  try {
    const response = await fetch(
      "`${API_URL}/api/quiz-result`,",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          score: finalScore,
          totalQuestions: questions.length
        })
      }
    );

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(
        data.message || "Failed to save quiz result."
      );
    }

    setSaveStatus("Quiz result saved successfully!");
  } catch (error) {
    console.error("Quiz save error:", error);
    setSaveError("Could not save your result. Please try again.");
  } finally {
    setSaving(false);
  }
}

  
function nextQuestion() {
  if (selected === null) return;

  if (current === questions.length - 1) {
    setFinished(true);
    saveQuizResult(score);
  } else {
    setCurrent((previous) => previous + 1);
    setSelected(null);
  }
}


  function restartQuiz() {
    setCurrent(0);
    setSelected(null);
    setScore(0);
    setFinished(false);
    setSaving(false);
setSaveStatus("");
setSaveError("");
  }

  
if (finished) {
  return (
    <section className="quiz-card">
      <h2>Quiz Completed!</h2>

      <p className="quiz-final-score">
        {score} / {questions.length}
      </p>

      <p>
        You answered{" "}
        {Math.round((score / questions.length) * 100)}%
        of the questions correctly.
      </p>

      {saving && <p>Saving your result...</p>}

      {saveStatus && (
        <p style={{ color: "green" }}>
          ✅ {saveStatus}
        </p>
      )}

      {saveError && (
        <div>
          <p role="alert" style={{ color: "red" }}>
            {saveError}
          </p>
          <button
            className="quiz-button"
            onClick={() => saveQuizResult(score)}
            disabled={saving}
          >
            Retry Saving
          </button>
        </div>
      )}

      <button
        className="quiz-button"
        onClick={restartQuiz}
        disabled={saving}
      >
        Try Again
      </button>
    </section>
  );
}


  return (
    <section className="quiz-card">
      <div className="quiz-heading">
        <h2>Phishing Awareness Quiz</h2>
        <span>
          Question {current + 1} of {questions.length}
        </span>
      </div>

      <div className="quiz-progress">
        <div
          className="quiz-progress-fill"
          style={{
            width: `${((current + 1) / questions.length) * 100}%`
          }}
        />
      </div>

      <h3>{question.question}</h3>

      <div className="quiz-options">
        {question.options.map((option, index) => {
          let className = "quiz-option";

          if (selected !== null) {
            if (index === question.answer) {
              className += " correct";
            } else if (index === selected) {
              className += " incorrect";
            }
          }

          return (
            <button
              key={index}
              className={className}
              onClick={() => selectAnswer(index)}
              disabled={selected !== null}
            >
              {option}
            </button>
          );
        })}
      </div>

      {selected !== null && (
        <div className="quiz-feedback">
          <strong>
            {selected === question.answer
              ? "Correct answer!"
              : "Not quite. Here's why:"}
          </strong>
          <p>{question.explanation}</p>

          <button className="quiz-button" onClick={nextQuestion}>
            {current === questions.length - 1
              ? "View Results"
              : "Next Question"}
          </button>
        </div>
      )}
    </section>
  );
}

export default Quiz;
