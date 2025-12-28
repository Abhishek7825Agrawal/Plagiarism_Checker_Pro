const express = require('express');
const router = express.Router();
const checkController = require('../controllers/checkController');

// API endpoints
router.post('/check', checkController.checkPlagiarism);
router.post('/check-batch', checkController.checkMultipleDocuments);
router.get('/stats', checkController.getStats);
router.post('/export/pdf', checkController.exportPDF); // New PDF export endpoint
router.post('/export/report', checkController.exportReport); // Generic export endpoint
router.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        features: ['plagiarism-check', 'pdf-export', 'batch-comparison']
    });
});

module.exports = router;