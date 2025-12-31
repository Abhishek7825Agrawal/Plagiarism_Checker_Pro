const express = require('express');
const app = express();

// Manual CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, OPTIONS'
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  next();
});

app.use(express.json());

// ✅ ROOT ROUTE (THIS WAS MISSING)
app.get('/', (req, res) => {
  res.json({
    message: 'Plagiarism Checker Pro Backend is running',
    status: 'OK'
  });
});

// Routes
app.post('/api/check', (req, res) => {
  const { text } = req.body;

  if (!text || text.length < 50) {
    return res.status(400).json({
      success: false,
      error: 'Text must be at least 50 characters'
    });
  }

  res.json({
    success: true,
    overallPlagiarism: Math.floor(Math.random() * 100),
    textLength: text.length
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Render PORT (10000 OK hai)
const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
