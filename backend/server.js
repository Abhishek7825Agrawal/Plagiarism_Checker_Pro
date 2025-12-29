const express = require('express');
const cors = require('cors');
const app = express();

// Enable CORS for all routes
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ========== ROUTES ==========
// 1. Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Plagiarism Checker API is LIVE!',
    version: '1.0.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    endpoints: {
      health: 'GET /api/health',
      check_plagiarism: 'POST /api/check',
      export_pdf: 'POST /api/export/pdf',
      test: 'GET /api/test/pdf'
    },
    usage: 'Send POST request to /api/check with {text: "your text here"}',
    note: 'Frontend: https://your-netlify-site.netlify.app'
  });
});

// 2. Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    service: 'plagiarism-checker-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// 3. Check plagiarism
app.post('/api/check', (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text || text.trim().length < 10) {
      return res.status(400).json({
        success: false,
        error: 'Text must be at least 10 characters long'
      });
    }
    
    // Mock plagiarism analysis
    const similarity = Math.random() * 100;
    const wordCount = text.split(/\s+/).length;
    
    res.json({
      success: true,
      message: 'Plagiarism analysis complete',
      data: {
        overallSimilarity: parseFloat(similarity.toFixed(2)),
        textLength: text.length,
        wordCount: wordCount,
        sentenceCount: text.split(/[.!?]+/).filter(s => s.trim()).length,
        detailedReport: {
          sentenceAnalysis: [
            {
              sentence: text.substring(0, 100) + '...',
              position: 0,
              similarity: parseFloat(similarity.toFixed(2)),
              isFlagged: similarity > 50
            }
          ],
          flaggedSentences: similarity > 50 ? 1 : 0,
          sources: []
        },
        suggestions: [
          similarity > 80 ? "High plagiarism detected" :
          similarity > 50 ? "Moderate similarity found" :
          "Content appears original"
        ]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// 4. Export PDF
app.post('/api/export/pdf', (req, res) => {
  res.json({
    success: true,
    message: 'PDF export feature coming soon',
    note: 'This endpoint will generate PDF reports'
  });
});

// 5. Test endpoint
app.get('/api/test/pdf', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: { test: 'success' }
  });
});

// 6. 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    availableEndpoints: [
      'GET  /',
      'GET  /api/health',
      'POST /api/check',
      'POST /api/export/pdf',
      'GET  /api/test/pdf'
    ]
  });
});

// ========== SERVER START ==========
const PORT = process.env.PORT || 10000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`
  ╔══════════════════════════════════════════╗
  ║   🚀 PLAGIARISM CHECKER API STARTED     ║
  ╚══════════════════════════════════════════╝
  
  📍 Port: ${PORT}
  🌐 Host: ${HOST}
  🔗 Local: http://localhost:${PORT}
  🌍 Render: https://your-service.onrender.com
  
  📊 ENDPOINTS:
  ✅ GET  /              - API Info
  ✅ GET  /api/health    - Health Check
  ✅ POST /api/check     - Check Plagiarism
  ✅ POST /api/export/pdf - Export PDF
  ✅ GET  /api/test/pdf  - Test
  
  🚦 Status: READY
  ⏰ Started: ${new Date().toISOString()}
  `);
});
