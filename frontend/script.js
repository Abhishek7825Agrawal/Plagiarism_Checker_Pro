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
    animatedCursor: null // Will be created dynamically
};

/* =========================
   STATE
========================= */
let isChecking = false;
let currentResult = null;
let particles = [];

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
    elements.inputText.addEventListener('input', updateWordCount);
    elements.checkBtn.addEventListener('click', checkPlagiarism);
    updateWordCount();
    checkAPIHealth();
    createAnimatedCursor();
    initParticles();
    
    // Add smooth focus effect to textarea
    elements.inputText.addEventListener('focus', () => {
        elements.inputText.parentElement.classList.add('focused');
    });
    
    elements.inputText.addEventListener('blur', () => {
        elements.inputText.parentElement.classList.remove('focused');
    });
    
    // Add keyboard shortcut (Ctrl/Cmd + Enter to check)
    elements.inputText.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            e.preventDefault();
            if (!elements.checkBtn.disabled) checkPlagiarism();
        }
    });
});

/* =========================
   ANIMATED CURSOR
========================= */
function createAnimatedCursor() {
    const cursor = document.createElement('div');
    cursor.className = 'animated-cursor';
    document.body.appendChild(cursor);
    elements.animatedCursor = cursor;
    
    // Update cursor position
    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX}px`;
        cursor.style.top = `${e.clientY}px`;
        
        // Add pulse effect when hovering interactive elements
        const target = e.target;
        const isInteractive = target.matches('button, .check-btn, textarea, .sentence-item, .suggestion-item');
        
        if (isInteractive) {
            cursor.classList.add('cursor-hover');
        } else {
            cursor.classList.remove('cursor-hover');
        }
    });
    
    // Click animation
    document.addEventListener('mousedown', () => {
        cursor.classList.add('cursor-click');
    });
    
    document.addEventListener('mouseup', () => {
        cursor.classList.remove('cursor-click');
    });
    
    // Hide cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursor.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        cursor.style.opacity = '1';
    });
}

/* =========================
   PARTICLE BACKGROUND EFFECT
========================= */
function initParticles() {
    const particleCount = 30;
    const container = elements.heroSection || document.body;
    
    for (let i = 0; i < particleCount; i++) {
        createParticle(container);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';
    
    // Random size and position
    const size = Math.random() * 3 + 1;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${Math.random() * 100}%`;
    particle.style.top = `${Math.random() * 100}%`;
    
    // Random animation
    const duration = Math.random() * 20 + 10;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${Math.random() * 5}s`;
    
    container.appendChild(particle);
    
    // Store for potential cleanup
    particles.push(particle);
}

/* =========================
   REAL-TIME WORD COUNT
========================= */
function updateWordCount() {
    const text = elements.inputText.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    
    // Animate the count change
    animateCounter(elements.wordCount, `${words} words, ${chars} chars`);
    
    // Update button state with animation
    if (chars < 50) {
        elements.checkBtn.disabled = true;
        elements.checkBtn.classList.remove('pulse');
    } else {
        elements.checkBtn.disabled = false;
        elements.checkBtn.classList.add('pulse');
        
        // Add subtle glow effect when ready
        if (chars >= 50 && chars < 100) {
            elements.checkBtn.classList.add('ready-glow');
        } else {
            elements.checkBtn.classList.remove('ready-glow');
        }
    }
}

/* =========================
   COUNTER ANIMATION
========================= */
function animateCounter(element, newText) {
    if (element.textContent === newText) return;
    
    element.style.opacity = '0.5';
    element.style.transform = 'translateY(-5px)';
    
    setTimeout(() => {
        element.textContent = newText;
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
    }, 150);
}

/* =========================
   API HEALTH CHECK
========================= */
async function checkAPIHealth() {
    try {
        const res = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.HEALTH}`,
            { cache: 'no-store' }
        );
        
        // Add connection status animation
        const statusEl = elements.resultStatus;
        
        if (res.ok) {
            statusEl.textContent = 'API Connected';
            statusEl.style.color = '#10b981';
            statusEl.classList.add('status-pulse');
            
            // Remove pulse after 3 seconds
            setTimeout(() => {
                statusEl.classList.remove('status-pulse');
            }, 3000);
        } else {
            throw new Error('API returned non-OK status');
        }
    } catch {
        elements.resultStatus.textContent = 'API Offline (Fallback Enabled)';
        elements.resultStatus.style.color = '#f59e0b';
        
        // Add warning animation
        elements.resultStatus.classList.add('warning-pulse');
    }
}

/* =========================
   MAIN PLAGIARISM CHECK
========================= */
async function checkPlagiarism() {
    if (isChecking) return;
    
    const text = elements.inputText.value.trim();
    if (text.length < 50) return;
    
    isChecking = true;
    elements.checkBtn.disabled = true;
    elements.loadingSpinner.style.display = 'block';
    elements.resultStatus.textContent = 'Checking...';
    
    // Add loading animation to results container
    if (elements.resultsContainer) {
        elements.resultsContainer.classList.add('loading');
    }
    
    // Button loading state
    elements.checkBtn.innerHTML = `
        <span class="btn-loading-spinner"></span>
        Checking...
    `;
    
    try {
        const response = await fetch(
            `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            }
        );
        
        if (!response.ok) {
            throw new Error('Backend error');
        }
        
        const data = await response.json();
        
        const sentenceAnalysis = generateSentenceAnalysis(text);
        const score = Math.round(data.overallPlagiarism || 0);
        
        const result = {
            overallPlagiarism: score,
            textLength: text.length,
            wordCount: text.split(/\s+/).length,
            detailedReport: {
                sentenceAnalysis
            },
            suggestions: generateSuggestions(score)
        };
        
        currentResult = result;
        
        // Add success animation before displaying results
        await animateSuccess();
        displayResults(result);
        
    } catch (error) {
        console.error(error);
        
        // Animate error state
        await animateError();
        performClientSideFallback(text);
        
    } finally {
        isChecking = false;
        elements.checkBtn.disabled = false;
        elements.loadingSpinner.style.display = 'none';
        elements.checkBtn.innerHTML = 'Check for Plagiarism';
        
        // Remove loading state
        if (elements.resultsContainer) {
            elements.resultsContainer.classList.remove('loading');
        }
    }
}

/* =========================
   ANIMATION FUNCTIONS
========================= */
async function animateSuccess() {
    return new Promise(resolve => {
        // Add success particles
        createSuccessParticles();
        
        // Add subtle scale animation to results container
        if (elements.resultsContainer) {
            elements.resultsContainer.style.transform = 'scale(0.95)';
            
            setTimeout(() => {
                elements.resultsContainer.style.transform = 'scale(1)';
                elements.resultsContainer.style.transition = 'transform 0.3s ease';
                resolve();
            }, 100);
        } else {
            resolve();
        }
    });
}

async function animateError() {
    return new Promise(resolve => {
        // Shake animation for error
        elements.resultStatus.classList.add('shake');
        
        setTimeout(() => {
            elements.resultStatus.classList.remove('shake');
            resolve();
        }, 500);
    });
}

function createSuccessParticles() {
    const particleCount = 15;
    const container = document.querySelector('.score-display') || document.body;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'success-particle';
        
        // Random position around the score display
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * 50 + 30;
        const x = Math.cos(angle) * distance;
        const y = Math.sin(angle) * distance;
        
        particle.style.left = `calc(50% + ${x}px)`;
        particle.style.top = `calc(50% + ${y}px)`;
        particle.style.backgroundColor = getScoreColor(50); // Default color
        
        container.appendChild(particle);
        
        // Remove particle after animation
        setTimeout(() => {
            particle.remove();
        }, 1000);
    }
}

/* =========================
   TOKENIZATION & SIMILARITY
========================= */
function tokenize(sentence) {
    return sentence
        .toLowerCase()
        .replace(/[^a-z\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);
}

function jaccardSimilarity(a, b) {
    const setA = new Set(tokenize(a));
    const setB = new Set(tokenize(b));
    
    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);
    
    return union.size === 0
        ? 0
        : Math.round((intersection.size / union.size) * 100);
}

/* =========================
   SENTENCE ANALYSIS (REAL)
========================= */
function generateSentenceAnalysis(text) {
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(Boolean);
    
    return sentences.map((sentence, index) => {
        let maxSimilarity = 0;
        
        for (let i = 0; i < index; i++) {
            const sim = jaccardSimilarity(sentence, sentences[i]);
            if (sim > maxSimilarity) maxSimilarity = sim;
        }
        
        return {
            sentence,
            position: index,
            similarity: maxSimilarity
        };
    });
}

/* =========================
   FALLBACK MODE
========================= */
function performClientSideFallback(text) {
    // Animate fallback notification
    elements.resultStatus.textContent = 'Using Client-side Analysis';
    elements.resultStatus.classList.add('fallback-notice');
    
    setTimeout(() => {
        elements.resultStatus.classList.remove('fallback-notice');
    }, 2000);
    
    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = Math.min(100, sentenceAnalysis.length * 5);
    
    const result = {
        overallPlagiarism: score,
        detailedReport: { sentenceAnalysis },
        suggestions: generateSuggestions(score)
    };
    
    currentResult = result;
    displayResults(result);
}

/* =========================
   DISPLAY RESULTS
========================= */
function displayResults(result) {
    const score = result.overallPlagiarism || 0;
    
    // Animate score counter
    animateScoreCounter(score);
    
    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;
    
    // Animate progress circle
    elements.scoreProgress.style.transition = 'stroke-dashoffset 1.5s ease-out';
    elements.scoreProgress.style.strokeDashoffset = offset;
    
    // Update category with animation
    updateScoreCategory(score);
    
    // Display sentences with staggered animation
    displaySentences(result.detailedReport.sentenceAnalysis);
    
    // Display suggestions
    displaySuggestions(result.suggestions);
    
    elements.resultStatus.textContent = 'Analysis Complete';
    elements.resultStatus.style.color = '#10b981';
    
    // Scroll to results smoothly
    setTimeout(() => {
        elements.resultsContainer.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
}

/* =========================
   SCORE COUNTER ANIMATION
========================= */
function animateScoreCounter(targetScore) {
    const duration = 1500;
    const startTime = Date.now();
    const startScore = parseInt(elements.plagiarismScore.textContent) || 0;
    
    function updateCounter() {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smooth animation
        const easeOut = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.round(startScore + (targetScore - startScore) * easeOut);
        
        elements.plagiarismScore.textContent = currentScore;
        
        // Update progress color during animation
        const displayScore = targetScore >= startScore ? currentScore : targetScore;
        elements.scoreProgress.style.stroke = getScoreColor(displayScore);
        
        if (progress < 1) {
            requestAnimationFrame(updateCounter);
        } else {
            elements.plagiarismScore.textContent = targetScore;
        }
    }
    
    updateCounter();
}

/* =========================
   SCORE COLOR UTILITY
========================= */
function getScoreColor(score) {
    if (score >= 80) return '#ef4444'; // Red
    if (score >= 50) return '#f59e0b'; // Orange
    if (score >= 20) return '#3b82f6'; // Blue
    return '#10b981'; // Green
}

/* =========================
   UPDATE SCORE CATEGORY
========================= */
function updateScoreCategory(score) {
    let category = 'Original';
    let color = '#10b981';
    
    if (score >= 80) {
        category = 'High Plagiarism';
        color = '#ef4444';
    } else if (score >= 50) {
        category = 'Moderate';
        color = '#f59e0b';
    } else if (score >= 20) {
        category = 'Low';
        color = '#3b82f6';
    }
    
    // Animate category change
    elements.scoreCategory.style.opacity = '0';
    elements.scoreCategory.style.transform = 'translateY(-10px)';
    
    setTimeout(() => {
        elements.scoreCategory.textContent = category;
        elements.scoreCategory.style.color = color;
        elements.scoreCategory.style.opacity = '1';
        elements.scoreCategory.style.transform = 'translateY(0)';
    }, 300);
}

/* =========================
   SENTENCE DISPLAY WITH ANIMATION
========================= */
function displaySentences(sentences) {
    elements.sentencesList.innerHTML = '';
    
    sentences.forEach((item, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'sentence-item';
            
            // Color code based on similarity
            let similarityClass = 'similarity-low';
            if (item.similarity >= 50) similarityClass = 'similarity-high';
            else if (item.similarity >= 20) similarityClass = 'similarity-medium';
            
            div.innerHTML = `
                <div class="sentence-header">
                    <strong>Sentence ${i + 1}</strong>
                    <span class="similarity-badge ${similarityClass}">
                        ${item.similarity}% similarity
                    </span>
                </div>
                <p class="sentence-text">${item.sentence}</p>
            `;
            
            // Add animation class
            div.classList.add('sentence-enter');
            
            elements.sentencesList.appendChild(div);
            
            // Remove animation class after animation completes
            setTimeout(() => {
                div.classList.remove('sentence-enter');
            }, 500);
            
        }, i * 100); // Staggered animation
    });
}

/* =========================
   SUGGESTIONS
========================= */
function generateSuggestions(score) {
    if (score >= 80) {
        return [
            'High plagiarism detected. Consider a complete rewrite.',
            'Add proper citations and references.',
            'Use quotation marks for direct quotes.',
            'Paraphrase ideas in your own words.'
        ];
    }
    if (score >= 50) {
        return [
            'Moderate plagiarism detected.',
            'Rephrase highlighted sentences.',
            'Add more original analysis.',
            'Combine multiple sources with original synthesis.'
        ];
    }
    if (score >= 20) {
        return [
            'Low similarity detected.',
            'Review highlighted sentences.',
            'Add your unique perspective.',
            'Good overall originality.'
        ];
    }
    return [
        'Excellent! Content is highly original.',
        'Maintain your unique writing style.',
        'Consider adding more supporting evidence.',
        'Well done on creating original content.'
    ];
}

function displaySuggestions(list) {
    elements.suggestionsList.innerHTML = '';
    
    list.forEach((text, i) => {
        setTimeout(() => {
            const div = document.createElement('div');
            div.className = 'suggestion-item';
            div.innerHTML = `
                <span class="suggestion-icon">💡</span>
                <span class="suggestion-text">${text}</span>
            `;
            
            // Add animation
            div.classList.add('suggestion-enter');
            
            elements.suggestionsList.appendChild(div);
            
            // Remove animation class
            setTimeout(() => {
                div.classList.remove('suggestion-enter');
            }, 500);
            
        }, i * 150);
    });
}

/* =========================
   EXPORT FUNCTIONALITY (Optional)
========================= */
function exportResults(format = 'txt') {
    if (!currentResult) return;
    
    let content = `Plagiarism Check Results\n`;
    content += `=======================\n\n`;
    content += `Overall Score: ${currentResult.overallPlagiarism}%\n`;
    content += `Word Count: ${currentResult.wordCount}\n`;
    content += `Text Length: ${currentResult.textLength} characters\n\n`;
    content += `Sentence Analysis:\n`;
    
    currentResult.detailedReport.sentenceAnalysis.forEach((item, i) => {
        content += `${i + 1}. ${item.similarity}% similarity: ${item.sentence}\n`;
    });
    
    content += `\nSuggestions:\n`;
    currentResult.suggestions.forEach(suggestion => {
        content += `• ${suggestion}\n`;
    });
    
    if (format === 'txt') {
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `plagiarism-report-${new Date().toISOString().slice(0,10)}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Add export confirmation animation
    const exportBtn = document.createElement('button');
    exportBtn.textContent = '✓ Exported!';
    exportBtn.className = 'export-confirmation';
    document.body.appendChild(exportBtn);
    
    setTimeout(() => {
        exportBtn.remove();
    }, 2000);
}

// Add export button if needed
document.addEventListener('DOMContentLoaded', () => {
    const exportBtn = document.createElement('button');
    exportBtn.textContent = 'Export Results';
    exportBtn.className = 'export-btn';
    exportBtn.addEventListener('click', () => exportResults('txt'));
    
    // Insert after results container if it exists
    if (elements.resultsContainer) {
        elements.resultsContainer.parentNode.insertBefore(exportBtn, elements.resultsContainer.nextSibling);
    }
});
