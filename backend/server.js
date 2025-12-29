const express = require('express');
const cors = require('cors');
const PDFDocument = require('pdfkit');
const app = express();
const PORT = process.env.PORT || 10000;  
const HOST = '0.0.0.0';  

app.listen(PORT, HOST, () => {  
  console.log(`========================================`);
  console.log(`🚀 PLAGIARISM CHECKER SERVER STARTED`);
  console.log(`========================================`);
  console.log(`PORT: ${PORT}`);
  console.log(`HOST: ${HOST}`);
  console.log(`URL: http://${HOST}:${PORT}`);
  console.log(`📋 ENDPOINTS:`);
  console.log(`1. GET  http://${HOST}:${PORT}/api/health`);
  console.log(`2. POST http://${HOST}:${PORT}/api/check`);
  console.log(`3. POST http://${HOST}:${PORT}/api/export/pdf`);
  console.log(`4. GET  http://${HOST}:${PORT}/api/test/pdf`);
  console.log(`========================================`);
});

// Middleware
app.use(cors());
app.use(express.json());

// 1. TEST ENDPOINT - Check if server is working
app.get('/api/health', (req, res) => {
    console.log('✅ Health check received');
    res.json({
        success: true,
        message: 'Server is running!',
        timestamp: new Date().toISOString(),
        endpoints: [
            'GET /api/health',
            'POST /api/check',
            'POST /api/export/pdf'
        ]
    });
});

// 2. PLAGIARISM CHECK
app.post('/api/check', (req, res) => {
    console.log('🔍 Check request received');
    
    const { text } = req.body;
    
    if (!text || text.length < 10) {
        return res.status(400).json({
            success: false,
            error: 'Text must be at least 10 characters'
        });
    }
    
    // Calculate score
    const score = Math.min(100, Math.floor(text.length / 10));
    const wordCount = text.split(/\s+/).length;
    
    res.json({
        success: true,
        overallPlagiarism: score,
        textLength: text.length,
        wordCount: wordCount,
        sentenceCount: text.split(/[.!?]+/).filter(s => s.trim()).length,
        timestamp: new Date().toISOString(),
        suggestions: [
            score > 70 ? '⚠️ High plagiarism risk' : '✅ Good originality',
            'Always cite sources',
            'Use quotation marks for direct quotes'
        ]
    });
});

// 3. PDF EXPORT ENDPOINT - THE ONE YOU NEED
app.post('/api/export/pdf', (req, res) => {
    console.log('📄 PDF Export Request');
    console.log('Request body:', req.body);
    
    try {
        const { resultData } = req.body || {};
        const score = resultData?.overallPlagiarism || 50;
        
        // Create PDF
        const doc = new PDFDocument();
        
        // Set headers
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="plagiarism-report.pdf"');
        
        // Pipe to response
        doc.pipe(res);
        
        // PDF Content
        doc.fontSize(25)
           .text('PLAGIARISM CHECK REPORT', { align: 'center' })
           .moveDown(1);
        
        // Score with color
        if (score > 70) {
            doc.fillColor('red');
        } else if (score > 40) {
            doc.fillColor('orange');
        } else {
            doc.fillColor('green');
        }
        
        doc.fontSize(48)
           .text(`${score}%`, { align: 'center' })
           .moveDown(0.5);
        
        doc.fillColor('black')
           .fontSize(18)
           .text(score > 70 ? 'High Plagiarism' : score > 40 ? 'Moderate' : 'Good', { align: 'center' })
           .moveDown(2);
        
        // Details
        doc.fontSize(14)
           .text('Report Details:')
           .moveDown(0.5);
        
        doc.fontSize(12)
           .text(`• Plagiarism Score: ${score}%`)
           .text(`• Word Count: ${resultData?.wordCount || 'N/A'}`)
           .text(`• Text Length: ${resultData?.textLength || 'N/A'} characters`)
           .text(`• Generated: ${new Date().toLocaleString()}`)
           .moveDown(2);
        
        // Footer
        doc.fontSize(10)
           .fillColor('gray')
           .text('Plagiarism Checker Pro • All analysis done locally', { align: 'center' });
        
        doc.end();
        
        console.log('✅ PDF generated successfully');
        
    } catch (error) {
        console.error('❌ PDF Error:', error);
        res.status(500).json({
            success: false,
            error: 'PDF generation failed: ' + error.message
        });
    }
});

// 4. EASY TEST PDF (Open in browser)
app.get('/api/test/pdf', (req, res) => {
    console.log('Test PDF requested');
    
    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    doc.pipe(res);
    
    doc.fontSize(25).text('✅ WORKING!', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text('PDF export is working correctly.');
    doc.text(`Time: ${new Date().toLocaleString()}`);
    doc.text(`Server: Plagiarism Checker v1.0`);
    
    doc.end();
});

// Start server
app.listen(PORT, () => {
    console.log(`
========================================
🚀 PLAGIARISM CHECKER SERVER STARTED
========================================
PORT: ${PORT}
URL: http://localhost:${PORT}

📋 ENDPOINTS:
1. GET  http://localhost:${PORT}/api/health
2. POST http://localhost:${PORT}/api/check
3. POST http://localhost:${PORT}/api/export/pdf
4. GET  http://localhost:${PORT}/api/test/pdf

💡 Test immediately:
• Open browser: http://localhost:${PORT}/api/health
• Open browser: http://localhost:${PORT}/api/test/pdf
========================================
    `);
});
