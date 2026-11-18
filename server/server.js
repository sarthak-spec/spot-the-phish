import { adminAuth } from "./middleware/adminAuth.js";
import jwt from "jsonwebtoken";
import Admin from "./models/Admin.js";
import QuizResult from "./models/QuizResult.js";
import UrlScan from "./models/UrlScan.js";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected successfully!");
  })
  .catch((error) => {
    console.error("❌ MongoDB connection failed:", error.message);
  });

const app = express();

const PORT = process.env.PORT || 8000;

const allowedOrigins = [
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    }
  })
);

app.use(express.json());


app.post("/api/admin/login", async (req, res) => {
  try {
    const { username, password } = req.body ?? {};

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: "Username and password are required."
      });
    }

    const admin = await Admin.findOne({
      username: username.trim()
    }).select("+password");

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    const isPasswordCorrect = await admin.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid username or password."
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      { adminId: admin._id.toString() },
      process.env.JWT_SECRET,
      {
        expiresIn: "1h",
        algorithm: "HS256"
      }
    );

    return res.json({
      success: true,
      message: "Login successful",
      token
    });
  } catch (error) {
    console.error("Admin login error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Unable to log in."
    });
  }
});


// Health check
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Spot the Phish API is working!"
  });
});

// Phishing URL checker
app.post("/api/check-url", async (req, res) => {
  const { url } = req.body;

  if (typeof url !== "string" || !url.trim()) {
    return res.status(400).json({
      success: false,
      message: "Please enter a valid URL."
    });
  }

  if (url.length > 2048) {
    return res.status(400).json({
      success: false,
      message: "URL is too long."
    });
  }

  let parsedUrl;

  try {
    parsedUrl = new URL(url.trim());
  } catch {
    return res.status(400).json({
      success: false,
      message: "Enter a complete URL starting with https:// or http://"
    });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    return res.status(400).json({
      success: false,
      message: "Only HTTP and HTTPS URLs are supported."
    });
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const signals = [];
  let score = 0;

  if (parsedUrl.protocol === "http:") {
    score += 20;
    signals.push("Website does not use HTTPS.");
  }

  if (hostname.includes("xn--")) {
    score += 25;
    signals.push("Domain uses Punycode, which may hide lookalike characters.");
  }

  if (hostname.split(".").length > 4) {
    score += 15;
    signals.push("URL contains an unusually high number of subdomains.");
  }

  if (url.includes("@")) {
    score += 20;
    signals.push("URL contains an @ symbol, which can obscure the destination.");
  }

  const suspiciousWords = [
    "verify",
    "urgent",
    "password",
    "login",
    "account",
    "secure",
    "update"
  ];

  const matches = suspiciousWords.filter((word) =>
    (parsedUrl.pathname + parsedUrl.search).toLowerCase().includes(word)
  );

  if (matches.length > 0) {
    score += Math.min(matches.length * 10, 30);
    signals.push(
      `URL contains potentially suspicious words: ${matches.join(", ")}.`
    );
  }

  score = Math.min(score, 100);

  const riskLevel =
    score >= 60 ? "High" : score >= 30 ? "Medium" : "Low";

  
  const recommendation =
    riskLevel === "High"
      ? "Avoid entering credentials. Verify the website through an official source."
      : riskLevel === "Medium"
        ? "Proceed cautiously and verify the website address."
        : "No major URL-pattern warnings found. This does not guarantee the website is safe.";

  const finalSignals =
    signals.length > 0
      ? signals
      : ["No suspicious URL patterns detected by the basic checks."];

  // Avoid storing query parameters and fragments.
  const safeUrl = parsedUrl.origin + parsedUrl.pathname;

  try {
    const savedScan = await UrlScan.create({
      url: safeUrl,
      score,
      riskLevel,
      signals: finalSignals,
      recommendation
    });

    res.json({
      success: true,
      url: safeUrl,
      score,
      riskLevel,
      signals: finalSignals,
      recommendation,
      scanId: savedScan._id
    });
    } catch (error) {
    console.error("Failed to save URL scan:", error.message);

    res.status(500).json({
      success: false,
      message: "Unable to save scan result."
    });
  }
});

app.post("/api/quiz-result", async (req, res) => {
  try {
    const { score, totalQuestions } = req.body;

    if (
      !Number.isInteger(score) ||
      !Number.isInteger(totalQuestions) ||
      totalQuestions < 1 ||
      score < 0 ||
      score > totalQuestions
    ) {
      return res.status(400).json({
        success: false,
        message: "Invalid quiz result."
      });
    }

    const percentage = Math.round(
      (score / totalQuestions) * 100
    );

    const savedResult = await QuizResult.create({
      score,
      totalQuestions,
      percentage
    });

    res.status(201).json({
      success: true,
      message: "Quiz result saved successfully!",
      result: savedResult
    });
  } catch (error) {
    console.error("Quiz save error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to save quiz result."
    });
  }
});

app.get("/api/admin/stats", adminAuth,async (req, res) => {
  try {
    const [
      totalScans,
      lowRisk,
      mediumRisk,
      highRisk,
      totalQuizAttempts,
      quizStats
    ] = await Promise.all([
      UrlScan.countDocuments(),
      UrlScan.countDocuments({ riskLevel: "Low" }),
      UrlScan.countDocuments({ riskLevel: "Medium" }),
      UrlScan.countDocuments({ riskLevel: "High" }),
      QuizResult.countDocuments(),
      QuizResult.aggregate([
        {
          $group: {
            _id: null,
            averagePercentage: { $avg: "$percentage" }
          }
        }
      ])
    ]);

    const averageQuizScore =
      quizStats.length > 0
        ? Math.round(quizStats[0].averagePercentage)
        : 0;

    res.json({
      success: true,
      stats: {
        totalScans,
        lowRisk,
        mediumRisk,
        highRisk,
        totalQuizAttempts,
        averageQuizScore
      }
    });
  } catch (error) {
    console.error("Admin stats error:", error.message);

    res.status(500).json({
      success: false,
      message: "Failed to fetch dashboard statistics."
    });
  }
});

app.get("/api/admin/recent-scans", adminAuth, async (req, res) => {
  try {
    const recentScans = await UrlScan.find(
      {},
      {
        url: 1,
        score: 1,
        riskLevel: 1,
        createdAt: 1
      }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      scans: recentScans
    });
  } catch (error) {
    console.error(
      "Recent scans error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent scans."
    });
  }
});

app.get("/api/admin/recent-quizzes", adminAuth, async (req, res) => {
  try {
    const recentQuizzes = await QuizResult.find(
      {},
      {
        score: 1,
        totalQuestions: 1,
        percentage: 1,
        createdAt: 1
      }
    )
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      quizzes: recentQuizzes
    });
  } catch (error) {
    console.error(
      "Recent quizzes error:",
      error.message
    );

    res.status(500).json({
      success: false,
      message: "Failed to fetch recent quiz results."
    });
  }
});

// Start Express server

 // Start Express server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});
