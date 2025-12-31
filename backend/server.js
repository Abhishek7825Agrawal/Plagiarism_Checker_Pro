const express = require('express');
const app = express();

// 1. CORS headers manually add karo
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  next();
});

app.use(express.json());

// Routes
app.post('/api/check', (req, res) => {
  const { text } = req.body;
  res.json({
    success: true,
    overallPlagiarism: Math.random() * 100,
    textLength: text?.length || 0
  });
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'healthy' });
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT} with CORS enabled`);
});
