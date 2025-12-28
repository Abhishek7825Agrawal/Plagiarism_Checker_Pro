const plagiarismService = require('../services/plagiarismService');
const pdfService = require('../services/pdfService');
const { v4: uuidv4 } = require('uuid');

// Add this exportPDF function
exports.exportPDF = async (req, res) => {
    try {
        const { resultData, userInfo = {} } = req.body;
        
        if (!resultData) {
            return res.status(400).json({
                success: false,
                error: 'Result data is required'
            });
        }

        // Generate PDF
        const pdfBuffer = await pdfService.generatePlagiarismReport(resultData, userInfo);
        
        // Set response headers for PDF download
        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="plagiarism-report-${Date.now()}.pdf"`,
            'Content-Length': pdfBuffer.length
        });
        
        res.send(pdfBuffer);

    } catch (error) {
        console.error('PDF export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to generate PDF report'
        });
    }
};

// Optional: Generic export function
exports.exportReport = async (req, res) => {
    try {
        const { format = 'pdf', resultData, userInfo = {} } = req.body;
        
        if (!resultData) {
            return res.status(400).json({
                success: false,
                error: 'Result data is required'
            });
        }

        if (format === 'pdf') {
            // Generate PDF
            const pdfBuffer = await pdfService.generatePlagiarismReport(resultData, userInfo);
            
            res.set({
                'Content-Type': 'application/pdf',
                'Content-Disposition': `attachment; filename="plagiarism-report-${Date.now()}.pdf"`,
                'Content-Length': pdfBuffer.length
            });
            
            res.send(pdfBuffer);
        } else if (format === 'json') {
            // JSON export
            const report = {
                timestamp: new Date().toISOString(),
                version: '1.0',
                ...resultData
            };
            
            res.set({
                'Content-Type': 'application/json',
                'Content-Disposition': `attachment; filename="plagiarism-report-${Date.now()}.json"`
            });
            
            res.json(report);
        } else {
            res.status(400).json({
                success: false,
                error: 'Unsupported format. Use "pdf" or "json"'
            });
        }

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export report'
        });
    }
};

// Your existing checkPlagiarism function remains the same
exports.checkPlagiarism = async (req, res) => {
    try {
        const { text, language = 'en', checkWeb = false } = req.body;
        
        if (!text || text.trim().length < 10) {
            return res.status(400).json({
                success: false,
                error: 'Text must be at least 10 characters'
            });
        }

        if (text.length > 10000) {
            return res.status(400).json({
                success: false,
                error: 'Text too long. Maximum 10,000 characters allowed'
            });
        }

        // Generate request ID
        const requestId = uuidv4();
        
        // Check plagiarism (using your existing service)
        const result = await plagiarismService.analyzeText(text, {
            language,
            checkWeb,
            requestId
        });

        res.json({
            success: true,
            requestId,
            timestamp: new Date().toISOString(),
            ...result
        });

    } catch (error) {
        console.error('Plagiarism check error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to check plagiarism',
            message: error.message
        });
    }
};

// Your other functions remain the same
exports.checkMultipleDocuments = async (req, res) => {
    // ... existing code ...
};

exports.getStats = async (req, res) => {
    // ... existing code ...
};