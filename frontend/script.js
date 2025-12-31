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
    heroSection: document.querySelector('.hero-section'),
    bgAnimation: document.querySelector('.bg-animation')
};

/* =========================
   STATE
========================= */
let isChecking = false;
let currentResult = null;
let cursor = null;
let cursorFollower = null;
let isOnline = true;

/* =========================
   INITIALIZATION
========================= */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize all components
    initializeCursor();
    initializeParticles();
    initializeEventListeners();
    initializeTheme();
    initializeScrollProgress();
    
    // Initial updates
    updateWordCount();
    checkAPIHealth();
    
    // Add keyboard shortcuts
    setupKeyboardShortcuts();
    
    // Animate hero elements
    animateHero();
});

/* =========================
   CURSOR ANIMATIONS
========================= */
function initializeCursor() {
    // Create main cursor
    cursor = document.createElement('div');
    cursor.className = 'cursor';
    document.body.appendChild(cursor);
    
    // Create cursor follower
    cursorFollower = document.createElement('div');
    cursorFollower.className = 'cursor-follower';
    document.body.appendChild(cursorFollower);
    
    // Mouse move listener
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        // Delayed follower movement
        setTimeout(() => {
            cursorFollower.style.left = `${e.clientX}px`;
            cursorFollower.style.top = `${e.clientY}px`;
        }, 50);
        
        // Hover effects
        const target = e.target;
        if (target.matches('button, a, .check-btn, textarea, .sentence-item, .export-btn, .theme-toggle, .nav-link')) {
            cursor.classList.add('cursor-hover');
            cursor.style.borderColor = 'var(--primary)';
        } else {
            cursor.classList.remove('cursor-hover');
            cursor.style.borderColor = 'var(--border-color)';
        }
    });
    
    // Click animation
    document.addEventListener('mousedown', () => {
        cursor.classList.add('cursor-click');
        cursor.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-click');
        cursor.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
        cursorFollower.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
        cursorFollower.style.opacity = '1';
    });
}

/* =========================
   PARTICLE BACKGROUND
========================= */
function initializeParticles() {
    if (!elements.bgAnimation) return;
    
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        createParticle();
    }
}

function createParticle() {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random properties
    const size = Math.random() * 4 + 2;
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    const duration = Math.random() * 30 + 20;
    const delay = Math.random() * 10;
    
    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${posX}%;
        top: ${posY}%;
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
        opacity: ${Math.random() * 0.3 + 0.1};
        background: linear-gradient(45deg, 
            var(${Math.random() > 0.5 ? '--primary' : '--secondary'}),
            var(${Math.random() > 0.5 ? '--info' : '--success'})
        );
    `;
    
    elements.bgAnimation.appendChild(particle);
}

/* =========================
   SCROLL PROGRESS
========================= */
function initializeScrollProgress() {
    const scrollProgress = document.createElement('div');
    scrollProgress.className = 'scroll-progress';
    document.body.appendChild(scrollProgress);
    
    window.addEventListener('scroll', () => {
        const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
        const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
        const scrolled = Math.min((winScroll / height) * 100, 100);
        scrollProgress.style.transform = `scaleX(${scrolled / 100})`;
    });
}

/* =========================
   THEME MANAGEMENT
========================= */
function initializeTheme() {
    const themeToggle = document.querySelector('.theme-toggle');
    if (!themeToggle) return;
    
    // Check saved theme
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeIcon(savedTheme);
    
    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        // Add animation
        themeToggle.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            themeToggle.style.transform = '';
        }, 500);
        
        // Apply theme
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        updateThemeIcon(newTheme);
        
        // Add theme change animation
        document.body.style.opacity = '0.8';
        setTimeout(() => {
            document.body.style.opacity = '1';
        }, 300);
    });
}

function updateThemeIcon(theme) {
    const icon = document.querySelector('.theme-toggle i');
    if (!icon) return;
    
    icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
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
    
    // Add ripple effect to all buttons
    document.querySelectorAll('button').forEach(button => {
        button.addEventListener('click', createRippleEffect);
    });
}

/* =========================
   RIPPLE EFFECT
========================= */
function createRippleEffect(e) {
    const button = e.currentTarget;
    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;
    
    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${e.clientX - button.getBoundingClientRect().left - radius}px`;
    ripple.style.top = `${e.clientY - button.getBoundingClientRect().top - radius}px`;
    ripple.className = 'ripple';
    
    // Remove existing ripples
    const existingRipple = button.querySelector('.ripple');
    if (existingRipple) {
        existingRipple.remove();
    }
    
    button.appendChild(ripple);
    
    // Remove ripple after animation
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/* =========================
   HERO ANIMATION
========================= */
function animateHero() {
    const heroTitle = document.querySelector('.hero h2');
    const heroSubtitle = document.querySelector('.subtitle');
    const stats = document.querySelectorAll('.stat');
    
    if (heroTitle) {
        heroTitle.style.animation = 'floatUp 1s ease-out forwards';
    }
    
    if (heroSubtitle) {
        heroSubtitle.style.animation = 'floatUp 1s ease-out 0.2s forwards';
        heroSubtitle.style.opacity = '0';
    }
    
    // Animate stats
    stats.forEach((stat, index) => {
        stat.style.animation = `floatUp 0.5s ease-out ${0.3 + index * 0.1}s forwards`;
        stat.style.opacity = '0';
    });
}

/* =========================
   KEYBOARD SHORTCUTS
========================= */
function setupKeyboardShortcuts() {
    // Ctrl/Cmd + Enter to check plagiarism
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!elements.checkBtn.disabled) {
                checkPlagiarism();
            }
        }
        
        // Ctrl/Cmd + S to save
        if ((e.ctrlKey || e.metaKey) && e.key === 's') {
            e.preventDefault();
            exportResults();
        }
        
        // Escape to clear text
        if (e.key === 'Escape' && document.activeElement === elements.inputText) {
            elements.inputText.value = '';
            updateWordCount();
            elements.inputText.focus();
        }
    });
    
    // Focus textarea on /
    document.addEventListener('keydown', (e) => {
        if (e.key === '/' && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
            e.preventDefault();
            elements.inputText.focus();
        }
    });
}

/* =========================
   REAL-TIME WORD COUNT
========================= */
function updateWordCount() {
    const text = elements.inputText.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    // Add animation class
    elements.wordCount.classList.add('updating');
    
    // Animate the number change
    setTimeout(() => {
        elements.wordCount.textContent = `${words} words, ${chars} chars`;
        elements.wordCount.classList.remove('updating');
        
        // Update button state with smooth transition
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
            
            // Add ready glow effect
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
        elements.resultStatus.className = 'result-status checking';
        
        const res = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`,
            { 
                cache: 'no-store',
                timeout: 5000 
            }
        );
        
        if (res.ok) {
            isOnline = true;
            elements.resultStatus.textContent = 'API Connected';
            elements.resultStatus.className = 'result-status connected';
            
            // Show success toast
            showToast('API connected successfully!', 'success');
            
            // Pulse animation
            setTimeout(() => {
                elements.resultStatus.classList.remove('connected');
            }, 3000);
        } else {
            throw new Error('API returned non-OK status');
        }
    } catch (error) {
        isOnline = false;
        elements.resultStatus.textContent = 'API Offline (Fallback Mode)';
        elements.resultStatus.className = 'result-status offline';
        
        // Show warning toast
        showToast('Using client-side fallback mode', 'warning');
    }
}

/* =========================
   TOAST NOTIFICATIONS
========================= */
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
        <button class="toast-close">&times;</button>
    `;
    
    const container = document.querySelector('.toast-container') || createToastContainer();
    container.appendChild(toast);
    
    // Close button
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideInRight 0.3s ease reverse forwards';
            setTimeout(() => toast.remove(), 300);
        }
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        warning: 'exclamation-triangle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

function createToastContainer() {
    const container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
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
    
    // Reset previous results
    clearPreviousResults();
    
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

function clearPreviousResults() {
    elements.sentencesList.innerHTML = '';
    elements.suggestionsList.innerHTML = '';
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
   API CHECK
========================= */
async function checkWithAPI(text) {
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
            })
        }
    );

    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Enhance API data with local analysis
    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = Math.round(data.overallPlagiarism || calculateScore(sentenceAnalysis));
    
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
   FALLBACK CHECK
========================= */
async function checkWithFallback(text) {
    // Show fallback notification
    elements.resultStatus.textContent = 'Using Advanced Client-side Analysis';
    elements.resultStatus.className = 'result-status warning';
    
    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
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

/* =========================
   SCORE CALCULATION
========================= */
function calculateScore(sentenceAnalysis) {
    if (sentenceAnalysis.length === 0) return 0;
    
    const totalSimilarity = sentenceAnalysis.reduce((sum, item) => sum + item.similarity, 0);
    const avgSimilarity = totalSimilarity / sentenceAnalysis.length;
    
    // Adjust score based on text length
    const lengthFactor = Math.min(sentenceAnalysis.length / 10, 1);
    const adjustedScore = avgSimilarity * lengthFactor;
    
    return Math.min(Math.round(adjustedScore), 100);
}

/* =========================
   SENTENCE ANALYSIS
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
        
        // Check for common phrases
        const commonPhrases = [
            "in conclusion", "however", "therefore", "for example",
            "on the other hand", "as a result", "in addition"
        ];
        
        commonPhrases.forEach(phrase => {
            if (sentence.toLowerCase().includes(phrase)) {
                maxSimilarity = Math.max(maxSimilarity, 15);
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
    
    // Cosine Similarity (simplified)
    const wordFreqA = getWordFrequency(tokensA);
    const wordFreqB = getWordFrequency(tokensB);
    
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;
    
    Object.keys(wordFreqA).forEach(word => {
        magnitudeA += Math.pow(wordFreqA[word], 2);
        if (wordFreqB[word]) {
            dotProduct += wordFreqA[word] * wordFreqB[word];
        }
    });
    
    Object.keys(wordFreqB).forEach(word => {
        magnitudeB += Math.pow(wordFreqB[word], 2);
    });
    
    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);
    
    const cosine = magnitudeA > 0 && magnitudeB > 0 ? dotProduct / (magnitudeA * magnitudeB) : 0;
    
    // Combine scores
    const combinedScore = (jaccard * 0.6 + cosine * 0.4) * 100;
    
    return Math.min(Math.round(combinedScore), 100);
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

function getSimilarityCategory(similarity) {
    if (similarity >= 70) return 'high';
    if (similarity >= 40) return 'medium';
    return 'low';
}

/* =========================
   DISPLAY RESULTS
========================= */
async function displayResults(result) {
    // Animate results container
    if (elements.resultsContainer) {
        elements.resultsContainer.style.opacity = '0';
        elements.resultsContainer.style.transform = 'translateY(20px)';
        
        setTimeout(() => {
            elements.resultsContainer.style.opacity = '1';
            elements.resultsContainer.style.transform = 'translateY(0)';
            elements.resultsContainer.style.transition = 'all 0.5s ease';
        }, 100);
    }
    
    // Animate score
    await animateScore(result.overallPlagiarism);
    
    // Update category
    updateScoreCategory(result.overallPlagiarism);
    
    // Display sentences with delay
    displaySentences(result.detailedReport.sentenceAnalysis);
    
    // Display suggestions
    displaySuggestions(result.suggestions);
    
    // Update status
    elements.resultStatus.textContent = result.isFallback 
        ? 'Analysis Complete (Fallback Mode)' 
        : 'Analysis Complete';
    elements.resultStatus.className = 'result-status success';
    
    // Scroll to results
    setTimeout(() => {
        elements.resultsContainer?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
    
    // Add export button if not exists
    if (!document.querySelector('.export-btn')) {
        addExportButton();
    }
}

/* =========================
   SCORE ANIMATION
========================= */
async function animateScore(finalScore) {
    return new Promise(resolve => {
        const startScore = parseInt(elements.plagiarismScore.textContent) || 0;
        const duration = 1500;
        const startTime = Date.now();
        
        function update() {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function
            const easeOut = 1 - Math.pow(1 - progress, 3);
            const currentScore = Math.round(startScore + (finalScore - startScore) * easeOut);
            
            elements.plagiarismScore.textContent = currentScore;
            
            // Update progress circle
            const circumference = 2 * Math.PI * 54;
            const offset = circumference - (currentScore / 100) * circumference;
            elements.scoreProgress.style.strokeDashoffset = offset;
            elements.scoreProgress.style.stroke = getScoreColor(currentScore);
            
            // Pulse animation
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
   UPDATE SCORE CATEGORY
========================= */
function updateScoreCategory(score) {
    let category, color;
    
    if (score >= 80) {
        category = 'High Plagiarism';
        color = 'var(--danger)';
    } else if (score >= 50) {
        category = 'Moderate Plagiarism';
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
   DISPLAY SENTENCES
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
                        <small>Similar to: "${item.similarSentence.substring(0, 100)}..."</small>
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
   SUGGESTIONS
========================= */
function generateSuggestions(score) {
    const suggestions = [];
    
    if (score >= 80) {
        suggestions.push(
            'Consider a complete rewrite of the highlighted sections',
            'Use proper citation for borrowed ideas',
            'Add more original analysis and perspective',
            'Use quotation marks for direct quotes',
            'Paraphrase ideas in your own words'
        );
    } else if (score >= 50) {
        suggestions.push(
            'Rephrase sentences with high similarity',
            'Combine information from multiple sources',
            'Add your unique insights and analysis',
            'Use synonyms and vary sentence structure',
            'Include more supporting evidence'
        );
    } else if (score >= 20) {
        suggestions.push(
            'Review highlighted sentences for originality',
            'Add more specific examples and details',
            'Strengthen your unique voice',
            'Consider restructuring some paragraphs',
            'Add transitional phrases for better flow'
        );
    } else {
        suggestions.push(
            'Great! Content shows high originality',
            'Continue using your unique writing style',
            'Consider adding more supporting research',
            'Maintain this level of originality',
            'Share your writing process with others'
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
   EXPORT FUNCTIONALITY
========================= */
function addExportButton() {
    const exportBtn = document.createElement('button');
    exportBtn.className = 'btn-primary export-btn';
    exportBtn.innerHTML = '<i class="fas fa-download"></i> Export Results';
    exportBtn.style.marginTop = '20px';
    
    exportBtn.addEventListener('click', exportResults);
    
    const actionButtons = document.querySelector('.action-buttons');
    if (actionButtons) {
        actionButtons.appendChild(exportBtn);
    } else if (elements.resultsContainer) {
        elements.resultsContainer.appendChild(exportBtn);
    }
}

function exportResults() {
    if (!currentResult) {
        showToast('No results to export', 'warning');
        return;
    }
    
    // Show export modal
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
    if (!currentResult) return;
    
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
    report.push('PLAGIARISM CHECK REPORT');
    report.push('='.repeat(60));
    report.push('');
    report.push(`Overall Score: ${currentResult.overallPlagiarism}%`);
    report.push(`Word Count: ${currentResult.wordCount}`);
    report.push(`Text Length: ${currentResult.textLength} characters`);
    report.push(`Checked At: ${new Date(currentResult.checkedAt).toLocaleString()}`);
    report.push(`Mode: ${currentResult.isFallback ? 'Client-side Fallback' : 'API Analysis'}`);
    report.push('');
    report.push('-'.repeat(60));
    report.push('SENTENCE ANALYSIS');
    report.push('-'.repeat(60));
    report.push('');
    
    currentResult.detailedReport.sentenceAnalysis.forEach((item, index) => {
        report.push(`Sentence ${index + 1} (${item.similarity}% similarity):`);
        report.push(`  ${item.sentence}`);
        if (item.similarSentence) {
            report.push(`  Similar to: ${item.similarSentence.substring(0, 100)}...`);
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
    report.push('End of Report');
    report.push('='.repeat(60));
    
    return report.join('\n');
}

function generatePDF() {
    // Open print dialog for PDF generation
    window.print();
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
        // Recalculate anything that depends on window size
        if (cursor) {
            cursor.style.display = 'none';
            setTimeout(() => {
                cursor.style.display = 'block';
            }, 100);
        }
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
    showToast('You are offline. Using fallback mode.', 'warning');
    elements.resultStatus.textContent = 'Offline Mode';
    elements.resultStatus.className = 'result-status offline';
});

/* =========================
   CLEANUP ON PAGE UNLOAD
========================= */
window.addEventListener('beforeunload', () => {
    // Cleanup any ongoing operations
    if (isChecking) {
        return 'Plagiarism check is in progress. Are you sure you want to leave?';
    }
});
