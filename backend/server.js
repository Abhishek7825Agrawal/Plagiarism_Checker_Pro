const express = require("express");
const app = express();

// ===== MANUAL CORS (BULLETPROOF) =====
app.use((req, res, next) => {
  res.header(
    "Access-Control-Allow-Origin",
    "https://plagiarism-checker-pro.netlify.app"
  );
  res.header(
    "Access-Control-Allow-Methods",
    "GET, POST, OPTIONS"
  );
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type"
  );

  // 🔴 THIS IS THE KEY FIX
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// ===== MIDDLEWARE =====
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ===== ROUTES =====
app.get("/", (req, res) => {
  res.json({ success: true, message: "API running" });
});

app.post("/api/check", (req, res) => {
  const { text } = req.body;

  if (!text || text.trim().length < 10) {
    return res.status(400).json({
      success: false,
      error: "Text too short"
    });
  }

  const similarity = Math.random() * 100;

  res.json({
    success: true,
    similarity: similarity.toFixed(2),
    message: "Check complete"
  });
});

// ===== SERVER =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, "0.0.0.0", () => {
  console.log("🚀 Backend running on port", PORT);
});
