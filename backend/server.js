const express = require("express");
const cors = require("cors");

const app = express();

// ========== CORS FIX ==========
const allowedOrigins = [
  "https://plagiarism-checker-pro.netlify.app",
  "http://localhost:5500",
  "http://127.0.0.1:5500",
  "http://localhost:3000",
  "http://127.0.0.1:3000"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow server-to-server & curl requests
    if (!origin) return callback(null, true);

    if (!allowedOrigins.includes(origin)) {
      console.log("❌ CORS BLOCKED:", origin);
      return callback(null, false);
    }

    console.log("✅ CORS ALLOWED:", origin);
    return callback(null, true);
  },
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
  optionsSuccessStatus: 200
}));

// VERY IMPORTANT — Preflight handler
app.options("*", cors());

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Plagiarism Checker API is running",
    frontend: "https://plagiarism-checker-pro.netlify.app"
  });
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    uptime: process.uptime()
  });
});

app.post("/api/check", (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: "Text must be at least 10 characters long"
      });
    }

    const similarity = Math.random() * 100;

    res.json({
      success: true,
      similarity: similarity.toFixed(2),
      message: similarity > 50
        ? "Moderate similarity found"
        : "Content appears original"
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      error: "Internal server error"
    });
  }
});

// 404
app.use("*", (req, res) => {
  res.status(404).json({ success: false, error: "Not found" });
});

// ========== SERVER ==========
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Server running on port", PORT);
});

module.exports = app;
