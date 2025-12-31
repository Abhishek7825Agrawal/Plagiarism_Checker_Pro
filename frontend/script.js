/* =========================
   API CONFIGURATION
========================= */
const API_CONFIG = {
    BASE_URL: 'https://plagiarism-checker-backend.onrender.com',
    ENDPOINTS: {
        CHECK: '/api/check',
        HEALTH: '/api/health'
    }
};

/* =========================
   DOM ELEMENTS
========================= */
const elements = {
    inputText: document.getElementById('inputText'),
    wordCount: document.getElementById('wordCount'),
    checkBtn: document.getElementById('checkBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    plagiarismScore: document.getElementById('plagiarismScore'),
    scoreCategory: document.getElementById('scoreCategory'),
    sentencesList: document.getElementById('sentencesList'),
    suggestionsList: document.getElementById('suggestionsList'),
    resultStatus: document.getElementById('resultStatus'),
    scoreProgress: document.querySelector('.score-progress'),
    resultsContainer: document.querySelector('.results-container'),
    clearTextBtn: document.getElementById('clearText'),
    sampleTextBtn: document.getElementById('sampleText'),
    uploadFileBtn: document.getElementById('uploadFile'),
    fileInput: document.getElementById('fileInput'),
    clearResultsBtn: document.getElementById('clearResultsBtn'),
    exportBtn: document.getElementById('exportBtn'),
    shareBtn: document.getElementById('shareBtn'),
    tabBtns: document.querySelectorAll('.tab-btn'),
    tabContents: document.querySelectorAll('.tab-content'),
    themeToggle: document.getElementById('themeToggle')
};

/* =========================
   STATE & VARIABLES
========================= */
let isChecking = false;
let currentResult = null;
let isOnline = true;
let cursor = null;
let cursorFollower = null;
let particles = [];
let isDarkTheme = false;

/* =========================
   INITIALIZATION
========================= */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initializeElements();
    initializeEventListeners();
    initializeCursor();
    initializeParticles();
    initializeTheme();
    initializeTabs();
    
    // Initial checks
    updateWordCount();
    checkAPIHealth();
    
    // Add sample text button functionality
    setupSampleText();
});

/* =========================
   ELEMENTS INITIALIZATION
========================= */
function initializeElements() {
    // Create cursor elements if they don't exist
    if (!document.querySelector('.cursor')) {
        cursor = document.createElement('div');
        cursor.className = 'cursor';
        document.body.appendChild(cursor);
    }
    
    if (!document.querySelector('.cursor-follower')) {
        cursorFollower = document.createElement('div');
        cursorFollower.className = 'cursor-follower';
        document.body.appendChild(cursorFollower);
    }
    
    // Create toast container if it doesn't exist
    if (!document.querySelector('.toast-container')) {
        const toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }
}

/* =========================
   CURSOR ANIMATION SYSTEM
========================= */
function initializeCursor() {
    cursor = document.querySelector('.cursor');
    cursorFollower = document.querySelector('.cursor-follower');
    
    if (!cursor || !cursorFollower) return;
    
    // Mouse move listener
    document.addEventListener('mousemove', (e) => {
        if (!cursor || !cursorFollower) return;
        
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        // Delayed follower effect
        setTimeout(() => {
            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;
        }, 50);
        
        // Hover effects
        const target = e.target;
        const isInteractive = target.matches(
            'button, a, .btn-primary, .btn-secondary, .check-btn, textarea, input, select, .sentence-item, .export-btn, .theme-toggle, .nav-link'
        );
        
        if (isInteractive) {
            cursor.classList.add('cursor-hover');
            cursor.style.borderColor = 'var(--primary)';
            cursor.style.transform = 'translate(-50%, -50%) scale(1.5)';
        } else {
            cursor.classList.remove('cursor-hover');
            cursor.style.borderColor = 'var(--border-color)';
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
    
    // Click animation
    document.addEventListener('mousedown', () => {
        if (cursor) {
            cursor.classList.add('cursor-click');
            cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (cursor) {
            cursor.classList.remove('cursor-click');
            cursor.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        if (cursor) cursor.style.opacity = '0';
        if (cursorFollower) cursorFollower.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        if (cursor) cursor.style.opacity = '1';
        if (cursorFollower) cursorFollower.style.opacity = '1';
    });
}

/* =========================
   PARTICLE BACKGROUND EFFECT
========================= */
function initializeParticles() {
    const bgAnimation = document.querySelector('.bg-animation');
    if (!bgAnimation) return;
    
    // Clear existing particles
    particles.forEach(p => p.remove());
    particles = [];
    
    // Create new particles
    const particleCount = 15;
    for (let i = 0; i < particleCount; i++) {
        createParticle(bgAnimation);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 150 + 50;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = Math.random() * 40 + 20;
    const delay = Math.random() * 10;
    
    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${posX}%;
        top: ${posY}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.1 + 0.05};
        background: linear-gradient(45deg, 
            var(${Math.random() > 0.5 ? '--primary' : '--secondary'}),
            var(${Math.random() > 0.5 ? '--info' : '--success'})
        );
    `;
    
    container.appendChild(particle);
    particles.push(particle);
}

/* =========================
   THEME MANAGEMENT
========================= */
function initializeTheme() {
    const themeToggle = elements.themeToggle;
    if (!themeToggle) return;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('plagiarism-theme') || 'light';
    isDarkTheme = savedTheme === 'dark';
    applyTheme(isDarkTheme);
    
    themeToggle.addEventListener('click', () => {
        isDarkTheme = !isDarkTheme;
        applyTheme(isDarkTheme);
        
        // Add toggle animation
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 500);
    });
}

function applyTheme(isDark) {
    document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
    localStorage.setItem('plagiarism-theme', isDark ? 'dark' : 'light');
    
    // Update icon
    const icon = elements.themeToggle?.querySelector('i');
    if (icon) {
        icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
    }
}

/* =========================
   TAB SYSTEM
========================= */
function initializeTabs() {
    elements.tabBtns?.forEach(btn => {
        btn.addEventListener('click', () => {
            const tabId = btn.dataset.tab;
            switchTab(tabId);
        });
    });
}

function switchTab(tabId) {
    // Update active tab button
    elements.tabBtns?.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.tab === tabId);
    });
    
    // Show active tab content
    elements.tabContents?.forEach(content => {
        content.classList.toggle('active', content.id === `${tabId}Tab`);
    });
}

/* =========================
   EVENT LISTENERS SETUP
========================= */
function initializeEventListeners() {
    // Text area events
    elements.inputText.addEventListener('input', updateWordCount);
    elements.inputText.addEventListener('focus', () => {
        elements.inputText.parentElement.classList.add('focused');
    });
    elements.inputText.addEventListener('blur', () => {
        elements.inputText.parentElement.classList.remove('focused');
    });
    
    // Check button event
    elements.checkBtn.addEventListener('click', checkPlagiarism);
    
    // Clear text button
    elements.clearTextBtn?.addEventListener('click', () => {
        elements.inputText.value = '';
        updateWordCount();
        elements.inputText.focus();
        showToast('Text cleared', 'info');
    });
    
    // Sample text button
    elements.sampleTextBtn?.addEventListener('click', () => {
        const sampleText = `Artificial Intelligence is transforming the way we live and work. Machine learning algorithms can now recognize patterns that humans might miss. However, with great power comes great responsibility. The ethical implications of AI must be carefully considered by researchers and developers alike. We must ensure that AI systems are transparent, fair, and accountable to prevent unintended consequences.`;
        elements.inputText.value = sampleText;
        updateWordCount();
        showToast('Sample text loaded', 'info');
    });
    
    // File upload button
    elements.uploadFileBtn?.addEventListener('click', () => {
        elements.fileInput?.click();
    });
    
    elements.fileInput?.addEventListener('change', handleFileUpload);
    
    // Clear results button
    elements.clearResultsBtn?.addEventListener('click', clearResults);
    
    // Export button
    elements.exportBtn?.addEventListener('click', exportResults);
    
    // Share button
    elements.shareBtn?.addEventListener('click', shareResults);
    
    // Keyboard shortcuts
    setupKeyboardShortcuts();
}

/* =========================
   KEYBOARD SHORTCUTS
========================= */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Ctrl/Cmd + Enter to check plagiarism
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!elements.checkBtn.disabled) {
                checkPlagiarism();
            }
        }
        
        // Ctrl/Cmd + S to export
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            if (currentResult) {
                exportResults();
            }
        }
        
        // Escape to clear text
        if (e.key === 'Escape' && document.activeElement === elements.inputText) {
            elements.inputText.value = '';
            updateWordCount();
        }
    });
}

/* =========================
   FILE UPLOAD HANDLING
========================= */
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        elements.inputText.value = e.target.result;
        updateWordCount();
        showToast(`File "${file.name}" loaded`, 'success');
    };
    
    reader.onerror = function() {
        showToast('Error reading file', 'error');
    };
    
    // Check file type
    if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.readAsText(file);
    } else if (file.type.includes('pdf')) {
        showToast('PDF files require special processing', 'warning');
    } else {
        showToast('Unsupported file format', 'error');
    }
    
    // Reset file input
    event.target.value = '';
}

/* =========================
   SAMPLE TEXT SETUP
========================= */
function setupSampleText() {
    // Already handled in event listeners
}

/* =========================
   TOAST NOTIFICATIONS
========================= */
function showToast(message, type = 'info') {
    const toastContainer = document.querySelector('.toast-container') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    
    toast.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        removeToast(toast);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            removeToast(toast);
        }
    }, 5000);
    
    return toast;
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

function removeToast(toast) {
    toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

/* =========================
   WORD COUNT WITH ANIMATION
========================= */
function updateWordCount() {
    const text = elements.inputText.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    // Animate word count change
    elements.wordCount.classList.add('updating');
    
    setTimeout(() => {
        elements.wordCount.textContent = `${words} words, ${chars} chars`;
        elements.wordCount.classList.remove('updating');
        
        // Update button state with animation
        if (chars < 50) {
            elements.checkBtn.disabled = true;
            elements.checkBtn.style.opacity = '0.6';
            elements.checkBtn.style.transform = 'scale(0.98)';
            elements.checkBtn.classList.remove('pulse');
        } else {
            elements.checkBtn.disabled = false;
            elements.checkBtn.style.opacity = '1';
            elements.checkBtn.style.transform = 'scale(1)';
            elements.checkBtn.classList.add('pulse');
            
            // Add subtle glow when ready
            if (chars >= 50 && chars < 100) {
                elements.checkBtn.style.boxShadow = '0 0 20px rgba(16, 185, 129, 0.5)';
            } else {
                elements.checkBtn.style.boxShadow = '';
            }
        }
    }, 150);
}

/* =========================
   API HEALTH CHECK
========================= */
async function checkAPIHealth() {
    try {
        elements.resultStatus.textContent = 'Connecting...';
        elements.resultStatus.classList.add('checking');
        
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`,
            { 
                cache: 'no-store',
                signal: AbortSignal.timeout(5000)
            }
        );
        
        if (response.ok) {
            isOnline = true;
            elements.resultStatus.textContent = 'API Connected ✓';
            elements.resultStatus.classList.remove('checking');
            elements.resultStatus.classList.add('connected');
            
            // Show success toast
            showToast('API connected successfully!', 'success');
            
            // Remove connected class after 3 seconds
            setTimeout(() => {
                elements.resultStatus.classList.remove('connected');
            }, 3000);
        } else {
            throw new Error('API returned non-OK status');
        }
    } catch (error) {
        isOnline = false;
        elements.resultStatus.textContent = 'API Offline (Hybrid Mode)';
        elements.resultStatus.classList.remove('checking');
        elements.resultStatus.classList.add('offline');
        
        // Show warning toast
        showToast('Using hybrid mode - some features limited', 'warning');
    }
}

/* =========================
   MAIN PLAGIARISM CHECK
========================= */
async function checkPlagiarism() {
    if (isChecking) return;
    
    const text = elements.inputText.value.trim();
    if (text.length < 50) {
        showToast('Please enter at least 50 characters', 'warning');
        return;
    }
    
    // Reset previous results with animation
    clearResults();
    
    // Set checking state
    isChecking = true;
    updateUIForChecking();
    
    try {
        let result;
        
        if (isOnline) {
            result = await checkWithAPI(text);
        } else {
            result = await checkWithFallback(text);
        }
        
        currentResult = result;
        await displayResults(result);
        
        // Show success message
        showToast(`Analysis complete! Score: ${result.overallPlagiarism}%`, 'success');
        
        // Trigger confetti for low plagiarism
        if (result.overallPlagiarism < 20) {
            createConfetti();
        }
        
    } catch (error) {
        console.error('Plagiarism check failed:', error);
        showToast('Analysis failed. Using fallback mode.', 'error');
        
        const result = await checkWithFallback(text);
        currentResult = result;
        await displayResults(result);
        
    } finally {
        isChecking = false;
        updateUIAfterChecking();
    }
}

function updateUIForChecking() {
    elements.checkBtn.disabled = true;
    elements.checkBtn.innerHTML = `
        <span class="loading-spinner"></span>
        Analyzing...
    `;
    elements.loadingSpinner.style.display = 'block';
    elements.resultStatus.textContent = 'Checking for plagiarism...';
    
    // Add shimmer effect to results container
    if (elements.resultsContainer) {
        elements.resultsContainer.classList.add('shimmer');
    }
}

function updateUIAfterChecking() {
    elements.checkBtn.disabled = false;
    elements.checkBtn.innerHTML = '<i class="fas fa-search"></i> Check for Plagiarism';
    elements.loadingSpinner.style.display = 'none';
    
    // Remove shimmer effect
    if (elements.resultsContainer) {
        elements.resultsContainer.classList.remove('shimmer');
    }
}

/* =========================
   API CHECK WITH ENHANCEMENTS
========================= */
async function checkWithAPI(text) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 10000);

    const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK}`,
        {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: JSON.stringify({ 
                text,
                options: {
                    deepSearch: true,
                    checkSynonyms: true,
                    excludeQuotes: true
                }
            }),
            signal: controller.signal
        }
    );

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Enhance API data with local analysis
    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = Number.isFinite(data.overallPlagiarism)
        ? Math.round(data.overallPlagiarism)
        : calculateScore(sentenceAnalysis);
    
    return {
        overallPlagiarism: score,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        detailedReport: {
            sentenceAnalysis
        },
        suggestions: generateSuggestions(score),
        sources: data.sources || [],
        checkedAt: new Date().toISOString()
    };
}

/* =========================
   FALLBACK CHECK WITH ANIMATIONS
========================= */
async function checkWithFallback(text) {
    // Show fallback notification with animation
    elements.resultStatus.textContent = 'Using Advanced Hybrid Analysis';
    elements.resultStatus.classList.remove('checking');
    elements.resultStatus.classList.add('warning');
    
    // Simulate processing with progress animation
    await simulateProcessing();
    
    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = calculateScore(sentenceAnalysis);
    
    return {
        overallPlagiarism: score,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        detailedReport: {
            sentenceAnalysis
        },
        suggestions: generateSuggestions(score),
        sources: [],
        checkedAt: new Date().toISOString(),
        isFallback: true
    };
}

async function simulateProcessing() {
    return new Promise(resolve => {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            if (progress >= 100) {
                clearInterval(interval);
                resolve();
            }
        }, 100);
    });
}

/* =========================
   ADVANCED SENTENCE ANALYSIS
========================= */
function generateSentenceAnalysis(text) {
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);
    
    if (sentences.length === 0) return [];
    
    return sentences.map((sentence, index) => {
        let maxSimilarity = 0;
        let similarSentence = '';
        
        // Check against previous sentences
        for (let i = 0; i < index; i++) {
            const similarity = calculateSentenceSimilarity(sentence, sentences[i]);
            if (similarity > maxSimilarity) {
                maxSimilarity = similarity;
                similarSentence = sentences[i];
            }
        }
        
        // Check for common academic phrases
        const commonPhrases = [
            "in conclusion", "however", "therefore", "for example",
            "on the other hand", "as a result", "in addition",
            "it is important to", "this suggests that", "according to"
        ];
        
        commonPhrases.forEach(phrase => {
            if (sentence.toLowerCase().includes(phrase)) {
                maxSimilarity = Math.max(maxSimilarity, 10);
            }
        });
        
        return {
            sentence,
            position: index,
            similarity: Math.round(maxSimilarity),
            similarSentence: similarSentence || null,
            category: getSimilarityCategory(maxSimilarity)
        };
    });
}

function calculateSentenceSimilarity(a, b) {
    // Tokenize sentences
    const tokensA = tokenize(a);
    const tokensB = tokenize(b);
    
    if (tokensA.length === 0 || tokensB.length === 0) return 0;
    
    // Jaccard Similarity
    const setA = new Set(tokensA);
    const setB = new Set(tokensB);
    
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    const jaccard = union.size > 0 ? intersection.size / union.size : 0;
    
    // Calculate word frequency for better matching
    const wordFreqA = getWordFrequency(tokensA);
    const wordFreqB = getWordFrequency(tokensB);
    
    let score = jaccard * 100;
    
    // Boost score for longer matching sequences
    const wordsA = a.toLowerCase().split(/\s+/);
    const wordsB = b.toLowerCase().split(/\s+/);
    
    let consecutiveMatches = 0;
    for (let i = 0; i < Math.min(wordsA.length, wordsB.length); i++) {
        if (wordsA[i] === wordsB[i]) {
            consecutiveMatches++;
        } else {
            if (consecutiveMatches >= 3) {
                score += consecutiveMatches * 5;
            }
            consecutiveMatches = 0;
        }
    }
    
    return Math.min(score, 100);
}

function tokenize(sentence) {
    return sentence
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2);
}

function getWordFrequency(tokens) {
    const freq = {};
    tokens.forEach(token => {
        freq[token] = (freq[token] || 0) + 1;
    });
    return freq;
}

function calculateScore(sentenceAnalysis) {
    if (sentenceAnalysis.length === 0) return 0;
    
    const totalSimilarity = sentenceAnalysis.reduce((sum, item) => sum + item.similarity, 0);
    const avgSimilarity = totalSimilarity / sentenceAnalysis.length;
    
    // Adjust score based on text length (longer texts get slightly higher scores)
    const lengthFactor = Math.min(sentenceAnalysis.length / 10, 1.5);
    const adjustedScore = avgSimilarity * lengthFactor;
    
    return Math.min(Math.round(adjustedScore), 100);
}

function getSimilarityCategory(similarity) {
    if (similarity >= 70) return 'high';
    if (similarity >= 40) return 'medium';
    return 'low';
}

/* =========================
   DISPLAY RESULTS WITH ANIMATIONS
========================= */
async function displayResults(result) {
    // Animate results container appearance
    if (elements.resultsContainer) {
        elements.resultsContainer.style.opacity = '0';
        elements.resultsContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            elements.resultsContainer.style.opacity = '1';
            elements.resultsContainer.style.transform = 'translateY(0)';
            elements.resultsContainer.style.transition = 'all 0.5s ease';
        }, 100);
    }
    
    // Animate score with smooth counter
    await animateScore(result.overallPlagiarism);
    
    // Update category with animation
    updateScoreCategory(result.overallPlagiarism);
    
    // Display sentences with staggered animation
    displaySentences(result.detailedReport.sentenceAnalysis);
    
    // Display suggestions
    displaySuggestions(result.suggestions);
    
    // Update status with animation
    elements.resultStatus.textContent = result.isFallback 
        ? 'Analysis Complete (Hybrid Mode) ✓' 
        : 'Analysis Complete ✓';
    elements.resultStatus.classList.remove('checking', 'warning');
    elements.resultStatus.classList.add('connected');
    
    // Scroll to results with smooth animation
    setTimeout(() => {
        elements.resultsContainer?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
}

/* =========================
   SCORE ANIMATION WITH SMOOTH EASING
========================= */
async function animateScore(finalScore) {
    return new Promise(resolve => {
        const startScore = parseInt(elements.plagiarismScore.textContent) || 0;
        const duration = 1500;
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic easing function for smooth animation
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(startScore + (finalScore - startScore) * easeOut);
            
            elements.plagiarismScore.textContent = currentScore;
            
            // Update progress circle with animation
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (currentScore / 100) * circumference;
            elements.scoreProgress.style.strokeDashoffset = offset;
            elements.scoreProgress.style.stroke = getScoreColor(currentScore);
            
            // Add pulse animation during counting
            if (progress < 1) {
                elements.plagiarismScore.classList.add('animating');
                requestAnimationFrame(update);
            } else {
                elements.plagiarismScore.classList.remove('animating');
                resolve();
            }
        }
        
        update();
    });
}

function getScoreColor(score) {
    if (score >= 80) return 'var(--danger)';
    if (score >= 50) return 'var(--warning)';
    if (score >= 20) return 'var(--info)';
    return 'var(--success)';
}

/* =========================
   UPDATE SCORE CATEGORY WITH ANIMATION
========================= */
function updateScoreCategory(score) {
    let category, color;
    
    if (score >= 80) {
        category = 'High Plagiarism';
        color = 'var(--danger)';
    } else if (score >= 50) {
        category = 'Moderate Similarity';
        color = 'var(--warning)';
    } else if (score >= 20) {
        category = 'Low Similarity';
        color = 'var(--info)';
    } else {
        category = 'Original Content';
        color = 'var(--success)';
    }
    
    // Animate category change
    elements.scoreCategory.style.opacity = '0';
    elements.scoreCategory.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        elements.scoreCategory.textContent = category;
        elements.scoreCategory.style.color = color;
        elements.scoreCategory.style.opacity = '1';
        elements.scoreCategory.style.transform = 'translateY(0)';
        elements.scoreCategory.style.transition = 'all 0.3s ease';
    }, 300);
}

/* =========================
   DISPLAY SENTENCES WITH STAGGERED ANIMATIONS
========================= */
function displaySentences(sentences) {
    elements.sentencesList.innerHTML = '';
    
    if (sentences.length === 0) {
        elements.sentencesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-comment-slash"></i>
                <p>No sentences to analyze</p>
            </div>
        `;
        return;
    }
    
    sentences.forEach((item, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = `sentence-item ${item.category}`;
            
            const scoreClass = item.similarity >= 70 ? 'high' : 
                             item.similarity >= 40 ? 'medium' : 'low';
            
            div.innerHTML = `
                <div class="sentence-header">
                    <strong>Sentence ${index + 1}</strong>
                    <span class="sentence-score ${scoreClass}">
                        ${item.similarity}% similarity
                    </span>
                </div>
                <p class="sentence-text">${item.sentence}</p>
                ${item.similarSentence ? `
                    <div class="similar-sentence">
                        <small>Similar to: "${item.similarSentence.substring(0, 80)}..."</small>
                    </div>
                ` : ''}
            `;
            
            // Add entry animation
            div.style.animation = `slideInUp 0.5s ease ${index * 0.1}s forwards`;
            div.style.opacity = '0';
            
            elements.sentencesList.appendChild(div);
            
            // Add hover effect
            div.addEventListener('mouseenter', () => {
                div.style.transform = 'translateY(-2px)';
                div.style.boxShadow = 'var(--shadow-md)';
            });
            
            div.addEventListener('mouseleave', () => {
                div.style.transform = '';
                div.style.boxShadow = '';
            });
            
        }, index * 100);
    });
}

/* =========================
   SUGGESTIONS SYSTEM
========================= */
function generateSuggestions(score) {
    const suggestions = [];
    
    if (score >= 80) {
        suggestions.push(
            'Consider a complete rewrite of the highlighted sections',
            'Use proper citation for borrowed ideas and concepts',
            'Add more original analysis and personal perspective',
            'Use quotation marks for direct quotes with citations',
            'Paraphrase ideas in your own words while citing sources'
        );
    } else if (score >= 50) {
        suggestions.push(
            'Rephrase sentences with high similarity scores',
            'Combine information from multiple sources with synthesis',
            'Add your unique insights and critical analysis',
            'Use synonyms and vary sentence structure',
            'Include more supporting evidence and examples'
        );
    } else if (score >= 20) {
        suggestions.push(
            'Review highlighted sentences for potential originality issues',
            'Add more specific examples and detailed explanations',
            'Strengthen your unique voice and writing style',
            'Consider restructuring some paragraphs for better flow',
            'Add transitional phrases between ideas'
        );
    } else {
        suggestions.push(
            'Excellent! Content shows high originality and uniqueness',
            'Continue using your distinctive writing style and voice',
            'Consider adding more supporting research and references',
            'Maintain this level of originality in future work',
            'Great work on creating unique content'
        );
    }
    
    return suggestions;
}

function displaySuggestions(suggestions) {
    elements.suggestionsList.innerHTML = '';
    
    suggestions.forEach((text, index) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-text">${text}</span>
            `;
            
            // Add entry animation
            div.style.animation = `slideInUp 0.5s ease ${index * 0.15}s forwards`;
            div.style.opacity = '0';
            
            elements.suggestionsList.appendChild(div);
        }, index * 150);
    });
}

/* =========================
   CLEAR RESULTS
========================= */
function clearResults() {
    currentResult = null;
    
    // Reset score with animation
    elements.plagiarismScore.textContent = '0';
    elements.scoreCategory.textContent = 'Original';
    elements.scoreCategory.style.color = 'var(--success)';
    
    // Reset progress circle
    const circumference = 2 * Math.PI * 54;
    elements.scoreProgress.style.strokeDashoffset = circumference;
    elements.scoreProgress.style.stroke = 'var(--success)';
    
    // Clear lists
    elements.sentencesList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-file-alt"></i>
            <p>No analysis performed yet</p>
        </div>
    `;
    
    elements.suggestionsList.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-lightbulb"></i>
            <p>Waiting for analysis...</p>
        </div>
    `;
    
    // Reset status
    elements.resultStatus.textContent = 'Ready';
    elements.resultStatus.className = 'result-status';
    
    showToast('Results cleared', 'info');
}

/* =========================
   EXPORT FUNCTIONALITY
========================= */
function exportResults() {
    if (!currentResult) {
        showToast('No results to export', 'warning');
        return;
    }
    
    // Show export options modal
    showExportModal();
}

function showExportModal() {
    // Remove existing modal
    const existingModal = document.querySelector('.export-modal');
    if (existingModal) existingModal.remove();
    
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    
    modal.innerHTML = `
        <div class="export-modal-content">
            <div class="export-modal-header">
                <h3><i class="fas fa-download"></i> Export Results</h3>
                <button class="modal-close">&times;</button>
            </div>
            <div class="export-options">
                <div class="export-option" data-format="txt">
                    <div class="export-icon">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div class="export-info">
                        <h4>Text File (.txt)</h4>
                        <p>Simple text format, compatible with all editors</p>
                    </div>
                </div>
                <div class="export-option" data-format="json">
                    <div class="export-icon">
                        <i class="fas fa-code"></i>
                    </div>
                    <div class="export-info">
                        <h4>JSON Data (.json)</h4>
                        <p>Structured data for developers and APIs</p>
                    </div>
                </div>
                <div class="export-option" data-format="pdf">
                    <div class="export-icon">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div class="export-info">
                        <h4>PDF Document (.pdf)</h4>
                        <p>Formatted document suitable for printing</p>
                    </div>
                </div>
            </div>
            <div class="export-actions">
                <button class="btn-secondary" id="cancelExport">Cancel</button>
                <button class="btn-primary" id="confirmExport">Export</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.modal-close').addEventListener('click', () => modal.remove());
    modal.querySelector('#cancelExport').addEventListener('click', () => modal.remove());
    
    // Format selection
    let selectedFormat = 'txt';
    modal.querySelectorAll('.export-option').forEach(option => {
        option.addEventListener('click', () => {
            modal.querySelectorAll('.export-option').forEach(o => 
                o.classList.remove('selected')
            );
            option.classList.add('selected');
            selectedFormat = option.dataset.format;
        });
    });
    
    // Confirm export
    modal.querySelector('#confirmExport').addEventListener('click', () => {
        generateExport(selectedFormat);
        modal.remove();
        showToast(`Results exported as ${selectedFormat.toUpperCase()}`, 'success');
    });
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function generateExport(format) {
    let content, mimeType, extension;
    
    switch(format) {
        case 'json':
            content = JSON.stringify(currentResult, null, 2);
            mimeType = 'application/json';
            extension = 'json';
            break;
            
        case 'pdf':
            // For PDF, we'll create a printable HTML page
            generatePDF();
            return;
            
        case 'txt':
        default:
            content = formatTextReport();
            mimeType = 'text/plain';
            extension = 'txt';
    }
    
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    
    a.href = url;
    a.download = `plagiarism-report-${new Date().toISOString().slice(0,10)}.${extension}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function formatTextReport() {
    const report = [];
    
    report.push('='.repeat(60));
    report.push('PLAGIARISM CHECK REPORT - PlagiarismCheck Pro');
    report.push('='.repeat(60));
    report.push('');
    report.push(`Overall Score: ${currentResult.overallPlagiarism}%`);
    report.push(`Word Count: ${currentResult.wordCount}`);
    report.push(`Text Length: ${currentResult.textLength} characters`);
    report.push(`Checked At: ${new Date(currentResult.checkedAt).toLocaleString()}`);
    report.push(`Mode: ${currentResult.isFallback ? 'Hybrid Analysis' : 'API Analysis'}`);
    report.push('');
    report.push('-'.repeat(60));
    report.push('SENTENCE ANALYSIS');
    report.push('-'.repeat(60));
    report.push('');
    
    currentResult.detailedReport.sentenceAnalysis.forEach((item, index) => {
        report.push(`Sentence ${index + 1} (${item.similarity}% similarity):`);
        report.push(`  "${item.sentence}"`);
        if (item.similarSentence) {
            report.push(`  Similar to: "${item.similarSentence.substring(0, 100)}..."`);
        }
        report.push('');
    });
    
    report.push('-'.repeat(60));
    report.push('SUGGESTIONS');
    report.push('-'.repeat(60));
    report.push('');
    
    currentResult.suggestions.forEach((suggestion, index) => {
        report.push(`${index + 1}. ${suggestion}`);
    });
    
    report.push('');
    report.push('='.repeat(60));
    report.push('End of Report - Generated by PlagiarismCheck Pro');
    report.push('='.repeat(60));
    
    return report.join('\n');
}

function generatePDF() {
    // Open print dialog for PDF generation
    window.print();
}

/* =========================
   SHARE RESULTS
========================= */
function shareResults() {
    if (!currentResult) {
        showToast('No results to share', 'warning');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: 'Plagiarism Check Results',
            text: `My plagiarism score is ${currentResult.overallPlagiarism}%. Checked with PlagiarismCheck Pro.`,
            url: window.location.href
        })
        .then(() => showToast('Results shared successfully!', 'success'))
        .catch(() => showToast('Sharing cancelled', 'info'));
    } else {
        // Fallback: Copy to clipboard
        const text = `Plagiarism Score: ${currentResult.overallPlagiarism}%\nWord Count: ${currentResult.wordCount}\n\nCheck out PlagiarismCheck Pro!`;
        navigator.clipboard.writeText(text)
            .then(() => showToast('Results copied to clipboard!', 'success'))
            .catch(() => showToast('Failed to copy to clipboard', 'error'));
    }
}

/* =========================
   CONFETTI ANIMATION
========================= */
function createConfetti() {
    const colors = [
        'var(--primary)', 'var(--secondary)', 'var(--success)', 
        'var(--warning)', 'var(--info)', 'var(--danger)'
    ];
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 1;
        
        confetti.style.cssText = `
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            left: ${left}%;
            animation-duration: ${duration}s;
            animation-delay: ${delay}s;
            border-radius: ${Math.random() > 0.5 ? '50%' : '0'};
        `;
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, duration * 1000);
    }
}

/* =========================
   ERROR HANDLING
========================= */
window.addEventListener('error', (e) => {
    console.error('Global error:', e.error);
    showToast('An unexpected error occurred', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('Request failed. Please try again.', 'error');
});

/* =========================
   PERFORMANCE OPTIMIZATION
========================= */
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // Re-initialize particles on resize
        initializeParticles();
    }, 250);
});

/* =========================
   OFFLINE DETECTION
========================= */
window.addEventListener('online', () => {
    isOnline = true;
    showToast('You are back online!', 'success');
    checkAPIHealth();
});

window.addEventListener('offline', () => {
    isOnline = false;
    showToast('You are offline. Using hybrid mode.', 'warning');
    elements.resultStatus.textContent = 'Offline Mode';
    elements.resultStatus.className = 'result-status offline';
});

/* =========================
   CLEANUP ON PAGE UNLOAD
========================= */
window.addEventListener('beforeunload', () => {
    if (isChecking) {
        return 'Plagiarism check is in progress. Are you sure you want to leave?';
    }
});

/* =========================
   ADDITIONAL UTILITY FUNCTIONS
========================= */
function addRippleEffect(button) {
    button.addEventListener('click', function(e) {
        const ripple = document.createElement('span');
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        
        ripple.style.cssText = `
            position: absolute;
            border-radius: 50%;
            background: rgba(255, 255, 255, 0.7);
            transform: scale(0);
            animation: ripple 0.6s linear;
            width: ${size}px;
            height: ${size}px;
            top: ${y}px;
            left: ${x}px;
            pointer-events: none;
        `;
        
        this.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
}

// Initialize ripple effects on all buttons
document.querySelectorAll('.btn-primary, .btn-secondary, .btn-danger').forEach(btn => {
    addRippleEffect(btn);
});
