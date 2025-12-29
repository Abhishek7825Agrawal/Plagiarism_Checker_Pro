const express = require('express');
const cors = require('cors');
const app = express();

// ========== CORS FIX ==========
const allowedOrigins = [
  'https://plagiarism-check-pro.netlify.app',
  'https://plagiarism-check-pro.netlify.app/',
  'http://localhost:5500',
  'http://127.0.0.1:5500',
  'http://localhost:3000',
  'http://127.0.0.1:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      console.log('CORS Blocked:', origin);
      return callback(new Error(msg), false);
    }
    console.log('CORS Allowed:', origin);
    return callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Length', 'X-Request-ID'],
  optionsSuccessStatus: 200
}));

// Handle pre-flight requests
app.options('*', cors());

// ========== MIDDLEWARE ==========
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ========== ROUTES ==========
// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🎉 Plagiarism Checker API v1.0',
    status: 'active',
    timestamp: new Date().toISOString(),
    frontend: 'https://plagiarism-check-pro.netlify.app',
    endpoints: {
      health: 'GET /api/health',
      check: 'POST /api/check',
      export_pdf: 'POST /api/export/pdf',
      test: 'GET /api/test/pdf'
    },
    cors: {
      allowed_origins: allowedOrigins,
      status: 'enabled'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  console.log('Health check from origin:', req.headers.origin);
  res.json({
    success: true,
    status: 'healthy',
    service: 'plagiarism-checker-api',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    frontend_url: 'https://plagiarism-check-pro.netlify.app',
    message: 'API is connected and working'
  });
});

// Check plagiarism
app.post('/api/check', (req, res) => {
  console.log('Check request from:', req.headers.origin);
  
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
              sentence: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
              position: 0,
              similarity: parseFloat(similarity.toFixed(2)),
              isFlagged: similarity > 50
            }
          ],
          flaggedSentences: similarity > 50 ? 1 : 0,
          sources: []
        },
        suggestions: [
          similarity > 80 ? "⚠️ High plagiarism detected" :
          similarity > 50 ? "⚠️ Moderate similarity found" :
          "✅ Content appears original"
        ]
      },
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Check error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

// Export PDF
app.post('/api/export/pdf', (req, res) => {
  res.json({
    success: true,
    message: 'PDF export feature coming soon',
    note: 'This endpoint will generate PDF reports'
  });
});

// Test endpoint
app.get('/api/test/pdf', (req, res) => {
  res.json({
    success: true,
    message: 'Test endpoint working',
    data: { test: 'success' }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl,
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
  ║   🚀 PLAGIARISM CHECKER API v1.0        ║
  ╚══════════════════════════════════════════╝
  
  📍 Port: ${PORT}
  🌐 Host: ${HOST}
  🔗 Local: http://localhost:${PORT}
  🌍 Render: https://plagiarism-checker-backend.onrender.com
  
  🎯 FRONTEND:
  🔗 https://plagiarism-check-pro.netlify.app
  
  📊 ENDPOINTS:
  ✅ GET  /              - API Info
  ✅ GET  /api/health    - Health Check
  ✅ POST /api/check     - Check Plagiarism
  ✅ POST /api/export/pdf - Export PDF
  ✅ GET  /api/test/pdf  - Test
  
  🔧 CORS Enabled for:
  • https://plagiarism-check-pro.netlify.app
  • Localhost origins
  
  🚦 Status: READY
  ⏰ Started: ${new Date().toISOString()}
  `);
});

module.exports = app;
