// DOM Elements
const elements = {
    inputText: document.getElementById('inputText'),
    wordCount: document.getElementById('wordCount'),
    checkBtn: document.getElementById('checkBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    plagiarismScore: document.getElementById('plagiarismScore'),
    scoreCategory: document.getElementById('scoreCategory'),
    webMatches: document.getElementById('webMatches'),
    internalMatches: document.getElementById('internalMatches'),
    sentencesList: document.getElementById('sentencesList'),
    sourcesList: document.getElementById('sourcesList'),
    suggestionsList: document.getElementById('suggestionsList'),
    resultStatus: document.getElementById('resultStatus'),
    checkWeb: document.getElementById('checkWeb'),
    clearText: document.getElementById('clearText'),
    sampleText: document.getElementById('sampleText'),
    uploadFile: document.getElementById('uploadFile'),
    fileInput: document.getElementById('fileInput'),
    exportBtn: document.getElementById('exportBtn'),
    shareBtn: document.getElementById('shareBtn'),
    clearResultsBtn: document.getElementById('clearResultsBtn'),
    themeToggle: document.getElementById('themeToggle'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    scoreProgress: document.querySelector('.score-progress'),
    cursor: document.querySelector('.cursor'),
    cursorFollower: document.querySelector('.cursor-follower'),
    toastContainer: document.getElementById('toastContainer')
};

// API Configuration - ✅ UPDATED
const API_CONFIG = {
    BASE_URL: 'https://plagiarism-checker-backend.onrender.com',
    ENDPOINTS: {
        CHECK: '/api/check',
        EXPORT_PDF: '/api/export/pdf',
        HEALTH: '/api/health',
        STATS: '/api/stats'
    }
};

// State
let currentTheme = localStorage.getItem('theme') || 'light';
let currentResult = null;
let isChecking = false;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initializeTheme();
    initializeCursor();
    initializeEventListeners();
    updateWordCount();
    checkAPIHealth();
});

// Theme Management
function initializeTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

function toggleTheme() {
    currentTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('theme', currentTheme);
    updateThemeIcon();
    showToast('Theme switched', 'success');
}

function updateThemeIcon() {
    const icon = elements.themeToggle.querySelector('i');
    icon.className = currentTheme === 'light' ? 'fas fa-moon' : 'fas fa-sun';
}

// Custom Cursor
function initializeCursor() {
    if (!elements.cursor || !elements.cursorFollower) return;
    
    document.addEventListener('mousemove', (e) => {
        elements.cursor.style.left = e.clientX + 'px';
        elements.cursor.style.top = e.clientY + 'px';
        
        elements.cursorFollower.style.left = e.clientX + 'px';
        elements.cursorFollower.style.top = e.clientY + 'px';
    });
    
    // Add hover effects
    const interactiveElements = document.querySelectorAll(
        'button, a, input, textarea, select, .checkbox, .tab-btn, .export-option'
    );
    
    interactiveElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            elements.cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
            elements.cursor.style.borderColor = 'var(--primary)';
        });
        
        el.addEventListener('mouseleave', () => {
            elements.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
            elements.cursor.style.borderColor = 'var(--primary)';
        });
    });
    
    // Click animation
    document.addEventListener('mousedown', () => {
        elements.cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        elements.cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
}

// Event Listeners
function initializeEventListeners() {
    // Text input
    elements.inputText?.addEventListener('input', updateWordCount);
    
    // Clear text
    elements.clearText?.addEventListener('click', () => {
        elements.inputText.value = '';
        updateWordCount();
        showToast('Text cleared', 'info');
    });
    
    // Load sample text
    elements.sampleText?.addEventListener('click', loadSampleText);
    
    // File upload
    elements.uploadFile?.addEventListener('click', () => elements.fileInput?.click());
    elements.fileInput?.addEventListener('change', handleFileUpload);
    
    // Check plagiarism
    elements.checkBtn?.addEventListener('click', checkPlagiarism);
    
    // Tab switching
    elements.tabBtns?.forEach(btn => {
        btn.addEventListener('click', () => switchTab(btn.dataset.tab));
    });
    
    // Action buttons
    elements.clearResultsBtn?.addEventListener('click', clearResults);
    elements.exportBtn?.addEventListener('click', showExportOptions);
    elements.shareBtn?.addEventListener('click', shareResults);
    
    // Theme toggle
    elements.themeToggle?.addEventListener('click', toggleTheme);
    
    // Enter key to check
    elements.inputText?.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            checkPlagiarism();
        }
    });
}

// Word Count
function updateWordCount() {
    const text = elements.inputText?.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    if (elements.wordCount) {
        elements.wordCount.textContent = `${words} words, ${chars} chars`;
    }
    
    // Update button state
    if (elements.checkBtn) {
        elements.checkBtn.disabled = chars < 50;
    }
}

// Sample Text
function loadSampleText() {
    const sample = `Artificial intelligence (AI) is intelligence demonstrated by machines, as opposed to the natural intelligence displayed by animals including humans. Leading AI textbooks define the field as the study of "intelligent agents": any system that perceives its environment and takes actions that maximize its chance of achieving its goals.

AI applications include advanced web search engines (e.g., Google), recommendation systems (used by YouTube, Amazon and Netflix), understanding human speech (such as Siri and Alexa), self-driving cars (e.g., Tesla), automated decision-making and competing at the highest level in strategic game systems (such as chess and Go).

The field was founded on the assumption that human intelligence "can be so precisely described that a machine can be made to simulate it". This raises philosophical arguments about the mind and the ethics of creating artificial beings endowed with human-like intelligence.`;
    
    if (elements.inputText) {
        elements.inputText.value = sample;
        updateWordCount();
        showToast('Sample text loaded', 'success');
    }
}

// File Upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const text = e.target.result;
        if (elements.inputText) {
            elements.inputText.value = text.substring(0, 10000); // Limit
            updateWordCount();
            showToast('File loaded successfully', 'success');
        }
    };
    
    reader.onerror = () => {
        showToast('Error reading file', 'error');
    };
    
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.readAsText(file);
    } else {
        showToast('Only text files (.txt) are supported', 'warning');
    }
    
    // Reset file input
    e.target.value = '';
}

// Tab Switching
function switchTab(tabId) {
    // Update tab buttons
    elements.tabBtns?.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Update tab content
    elements.tabContents?.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Tab`);
    });
}

// API Health Check
async function checkAPIHealth() {
    try {
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`);
        if (response.ok) {
            if (elements.resultStatus) {
                elements.resultStatus.textContent = 'API Connected';
                elements.resultStatus.style.color = 'var(--success)';
            }
            console.log('✅ Backend API is connected');
        }
    } catch (error) {
        if (elements.resultStatus) {
            elements.resultStatus.textContent = 'API Offline';
            elements.resultStatus.style.color = 'var(--danger)';
        }
        console.error('❌ Backend API is offline:', error);
        showToast('Backend API is offline. Some features may not work.', 'warning');
    }
}

// Main Plagiarism Check
async function checkPlagiarism() {
    if (isChecking) return;
    
    const text = elements.inputText?.value?.trim() || '';
    if (text.length < 50) {
        showToast('Text must be at least 50 characters', 'warning');
        return;
    }
    
    // Start checking
    isChecking = true;
    if (elements.checkBtn) elements.checkBtn.disabled = true;
    if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'block';
    if (elements.resultStatus) {
        elements.resultStatus.textContent = 'Checking...';
        elements.resultStatus.style.color = 'var(--warning)';
    }
    
    try {
        const payload = {
            text: text,
            language: document.getElementById('language')?.value || 'en',
            checkWeb: elements.checkWeb?.checked || false
        };
        
        console.log('📡 Sending request to:', `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK}`);
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });
        
        console.log('📥 Response status:', response.status);
        
        if (!response.ok) {
            throw new Error(`API Error: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ API response:', data);
        
        if (data.success) {
            currentResult = data;
            displayResults(data);
            showToast('Plagiarism check completed', 'success');
        } else {
            throw new Error(data.error || 'Check failed');
        }
        
    } catch (error) {
        console.error('❌ Plagiarism check error:', error);
        showToast(`Error: ${error.message}`, 'error');
        
        // Fallback to client-side check
        performClientSideCheck(text);
    } finally {
        isChecking = false;
        if (elements.checkBtn) elements.checkBtn.disabled = false;
        if (elements.loadingSpinner) elements.loadingSpinner.style.display = 'none';
    }
}

// Client-side fallback
function performClientSideCheck(text) {
    showToast('Using client-side analysis (limited)', 'info');
    
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    let plagiarizedSentences = 0;
    
    const results = sentences.map((sentence, index) => {
        const isRepeated = sentences.slice(0, index).some(s => 
            calculateSimilarity(s, sentence) > 0.8
        );
        
        if (isRepeated) plagiarizedSentences++;
        
        return {
            sentence: sentence.trim(),
            position: index,
            similarity: isRepeated ? 85 : 0,
            isFlagged: isRepeated
        };
    });
    
    const overallScore = sentences.length > 0 ? (plagiarizedSentences / sentences.length) * 100 : 0;
    
    const mockResult = {
        success: true,
        overallPlagiarism: overallScore,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        sentenceCount: sentences.length,
        detailedReport: {
            sentenceAnalysis: results,
            flaggedSentences: results.filter(r => r.isFlagged),
            sources: []
        },
        suggestions: generateSuggestions(overallScore),
        timestamp: new Date().toISOString()
    };
    
    displayResults(mockResult);
}

function calculateSimilarity(str1, str2) {
    const set1 = new Set(str1.toLowerCase().split(/\W+/));
    const set2 = new Set(str2.toLowerCase().split(/\W+/));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size === 0 ? 0 : intersection.size / union.size;
}

function generateSuggestions(score) {
    if (score >= 80) {
        return [
            "⚠️ High plagiarism detected. Consider rewriting large portions.",
            "📚 Cite your sources properly.",
            "🔄 Paraphrase more effectively."
        ];
    } else if (score >= 50) {
        return [
            "⚠️ Moderate plagiarism detected. Review flagged sentences.",
            "📝 Use more original content.",
            "🔍 Add proper citations where needed."
        ];
    } else if (score >= 20) {
        return [
            "✅ Minor similarities detected. Consider rewording some phrases.",
            "📖 Ensure proper quotation marks for direct quotes."
        ];
    } else {
        return [
            "✅ Excellent! Content appears to be mostly original.",
            "📝 Keep up the good work!"
        ];
    }
}

// Display Results
function displayResults(result) {
    // Update overall score
    const score = Math.round(result.overallPlagiarism || 0);
    if (elements.plagiarismScore) {
        elements.plagiarismScore.textContent = score;
    }
    
    // Update progress circle
    if (elements.scoreProgress) {
        const circumference = 2 * Math.PI * 54;
        const offset = circumference - (score / 100) * circumference;
        elements.scoreProgress.style.strokeDashoffset = offset;
    }
    
    // Update category
    let category = 'Original';
    let categoryColor = 'var(--success)';
    
    if (score >= 80) {
        category = 'High Plagiarism';
        categoryColor = 'var(--danger)';
    } else if (score >= 50) {
        category = 'Moderate';
        categoryColor = 'var(--warning)';
    } else if (score >= 20) {
        category = 'Low';
        categoryColor = 'var(--info)';
    }
    
    if (elements.scoreCategory) {
        elements.scoreCategory.textContent = category;
        elements.scoreCategory.style.color = categoryColor;
    }
    
    // Update breakdown
    if (elements.webMatches) elements.webMatches.textContent = '0%';
    if (elements.internalMatches) elements.internalMatches.textContent = '0%';
    
    // Display sentences
    displaySentences(result.detailedReport?.sentenceAnalysis || []);
    
    // Display sources
    displaySources(result.detailedReport?.sources || []);
    
    // Display suggestions
    displaySuggestions(result.suggestions || []);
    
    // Update status
    if (elements.resultStatus) {
        elements.resultStatus.textContent = 'Complete';
        elements.resultStatus.style.color = 'var(--success)';
    }
}

function displaySentences(sentences) {
    if (!elements.sentencesList) return;
    
    elements.sentencesList.innerHTML = '';
    
    if (!sentences || sentences.length === 0) {
        elements.sentencesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file-alt"></i>
                <p>No sentences to display</p>
            </div>
        `;
        return;
    }
    
    sentences.forEach((item, index) => {
        const similarity = Math.round(item.similarity || 0);
        let className = 'original';
        let scoreClass = 'low';
        
        if (similarity >= 80) {
            className = 'plagiarized';
            scoreClass = 'high';
        } else if (similarity >= 50) {
            className = 'suspicious';
            scoreClass = 'medium';
        }
        
        const sentenceElement = document.createElement('div');
        sentenceElement.className = `sentence-item ${className}`;
        sentenceElement.innerHTML = `
            <div class="sentence-header">
                <span class="sentence-number">Sentence ${item.position + 1}</span>
                <span class="sentence-score ${scoreClass}">${similarity}%</span>
            </div>
            <div class="sentence-text">${escapeHtml(item.sentence)}</div>
        `;
        
        elements.sentencesList.appendChild(sentenceElement);
    });
}

function displaySources(sources) {
    if (!elements.sourcesList) return;
    
    elements.sourcesList.innerHTML = '';
    
    if (!sources || sources.length === 0) {
        elements.sourcesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-search"></i>
                <p>No sources found</p>
            </div>
        `;
        return;
    }
    
    sources.forEach((source, index) => {
        const sourceElement = document.createElement('a');
        sourceElement.className = 'source-item';
        sourceElement.href = source.url || '#';
        sourceElement.target = '_blank';
        sourceElement.innerHTML = `
            <div class="source-icon">
                <i class="fas fa-external-link-alt"></i>
            </div>
            <div class="source-content">
                <div class="source-title">${escapeHtml(source.title || 'Source')}</div>
                <div class="source-url">${escapeHtml(source.url || '')}</div>
            </div>
            <div class="source-similarity">${Math.round(source.similarity || 0)}%</div>
        `;
        
        elements.sourcesList.appendChild(sourceElement);
    });
}

function displaySuggestions(suggestions) {
    if (!elements.suggestionsList) return;
    
    elements.suggestionsList.innerHTML = '';
    
    if (!suggestions || suggestions.length === 0) {
        elements.suggestionsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lightbulb"></i>
                <p>No suggestions available</p>
            </div>
        `;
        return;
    }
    
    suggestions.forEach((suggestion, index) => {
        const suggestionElement = document.createElement('div');
        suggestionElement.className = 'suggestion-item';
        suggestionElement.innerHTML = `
            <div class="suggestion-icon">
                <i class="fas fa-lightbulb"></i>
            </div>
            <div class="suggestion-text">${escapeHtml(suggestion)}</div>
        `;
        
        elements.suggestionsList.appendChild(suggestionElement);
    });
}

// Utility Functions
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Clear Results
function clearResults() {
    if (confirm('Clear all results?')) {
        if (elements.plagiarismScore) elements.plagiarismScore.textContent = '0';
        if (elements.scoreProgress) elements.scoreProgress.style.strokeDashoffset = '339.292';
        if (elements.scoreCategory) {
            elements.scoreCategory.textContent = 'Original';
            elements.scoreCategory.style.color = '';
        }
        if (elements.webMatches) elements.webMatches.textContent = '0%';
        if (elements.internalMatches) elements.internalMatches.textContent = '0%';
        
        if (elements.sentencesList) {
            elements.sentencesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-file-alt"></i>
                    <p>No analysis performed yet</p>
                </div>
            `;
        }
        
        if (elements.sourcesList) {
            elements.sourcesList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No sources found yet</p>
                </div>
            `;
        }
        
        if (elements.suggestionsList) {
            elements.suggestionsList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-lightbulb"></i>
                    <p>Waiting for analysis...</p>
                </div>
            `;
        }
        
        if (elements.resultStatus) {
            elements.resultStatus.textContent = 'Ready';
            elements.resultStatus.style.color = '';
        }
        
        currentResult = null;
        showToast('Results cleared', 'info');
    }
}

// PDF Export Function - ✅ UPDATED
async function exportAsPDF(resultData) {
    try {
        showToast('Generating PDF...', 'info');
        
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.EXPORT_PDF}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                resultData: resultData,
                userInfo: {
                    name: 'User',
                    email: 'user@example.com'
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to generate PDF');
        }

        // Create PDF blob
        const blob = await response.blob();
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plagiarism-report-${Date.now()}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('✅ PDF downloaded successfully!', 'success');
        
    } catch (error) {
        console.error('PDF export error:', error);
        showToast('❌ Error: ' + error.message, 'error');
    }
}

async function exportAsJSON(resultData) {
    try {
        const report = {
            timestamp: new Date().toISOString(),
            version: '1.0',
            ...resultData
        };
        
        const jsonStr = JSON.stringify(report, null, 2);
        const blob = new Blob([jsonStr], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plagiarism-report-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        showToast('JSON report downloaded!', 'success');
        
    } catch (error) {
        console.error('JSON export error:', error);
        showToast('Failed to export JSON', 'error');
    }
}

// Export Options Modal
function showExportOptions() {
    if (!currentResult) {
        showToast('No results to export. Please check plagiarism first.', 'warning');
        return;
    }
    
    // Remove existing modal if any
    const existingModal = document.getElementById('exportModal');
    if (existingModal) existingModal.remove();
    
    const modalHTML = `
        <div class="export-modal" id="exportModal">
            <div class="export-modal-content">
                <div class="export-modal-header">
                    <h3><i class="fas fa-file-export"></i> Export Report</h3>
                    <button class="modal-close" id="closeExportModal">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="export-options">
                    <div class="export-option" data-format="pdf">
                        <div class="export-icon pdf">
                            <i class="fas fa-file-pdf"></i>
                        </div>
                        <div class="export-info">
                            <h4>PDF Document</h4>
                            <p>Professional formatted report with charts</p>
                        </div>
                    </div>
                    <div class="export-option" data-format="json">
                        <div class="export-icon json">
                            <i class="fas fa-file-code"></i>
                        </div>
                        <div class="export-info">
                            <h4>JSON Data</h4>
                            <p>Raw data for further processing</p>
                        </div>
                    </div>
                    <div class="export-option" data-format="print">
                        <div class="export-icon print">
                            <i class="fas fa-print"></i>
                        </div>
                        <div class="export-info">
                            <h4>Print Report</h4>
                            <p>Print directly to your printer</p>
                        </div>
                    </div>
                </div>
                <div class="export-actions">
                    <button class="btn-secondary" id="cancelExport">Cancel</button>
                </div>
            </div>
        </div>
    `;
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHTML);
    
    // Add event listeners
    document.getElementById('closeExportModal').addEventListener('click', () => {
        document.getElementById('exportModal').remove();
    });
    
    document.getElementById('cancelExport').addEventListener('click', () => {
        document.getElementById('exportModal').remove();
    });
    
    // Handle export option clicks
    document.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', () => {
            const format = option.dataset.format;
            handleExport(format);
            document.getElementById('exportModal').remove();
        });
    });
}

function handleExport(format) {
    if (!currentResult) return;
    
    switch(format) {
        case 'pdf':
            exportAsPDF(currentResult);
            break;
        case 'json':
            exportAsJSON(currentResult);
            break;
        case 'print':
            window.print();
            showToast('Opening print dialog...', 'info');
            break;
    }
}

// Share Results
function shareResults() {
    if (!currentResult) {
        showToast('No results to share', 'warning');
        return;
    }
    
    const score = currentResult.overallPlagiarism || 0;
    const text = `My plagiarism check score: ${score}%\n\nChecked with Plagiarism Checker Pro`;
    
    if (navigator.share) {
        // Web Share API (mobile devices)
        navigator.share({
            title: 'Plagiarism Check Results',
            text: text,
            url: window.location.href
        }).then(() => {
            showToast('Results shared successfully!', 'success');
        }).catch(() => {
            copyToClipboard(text);
        });
    } else {
        // Fallback to clipboard
        copyToClipboard(text);
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text)
        .then(() => showToast('Results copied to clipboard!', 'success'))
        .catch(() => showToast('Failed to copy to clipboard', 'error'));
}

// Toast Notifications
function showToast(message, type = 'info') {
    // Remove existing toast container if any
    let toastContainer = document.getElementById('toastContainer');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'toastContainer';
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
        <button class="toast-close" onclick="this.parentElement.remove()">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentElement) {
            toast.style.animation = 'slideOutRight 0.3s ease forwards';
            setTimeout(() => {
                if (toast.parentElement) {
                    toast.remove();
                }
            }, 300);
        }
    }, 5000);
}

function getToastIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'error': return 'exclamation-circle';
        case 'warning': return 'exclamation-triangle';
        default: return 'info-circle';
    }
}

// Add close button animation style
const toastStyle = document.createElement('style');
toastStyle.textContent = `
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(toastStyle);
