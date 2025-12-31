/* =========================
   IMPROVED UI ENHANCEMENTS
========================= */

// Add these new variables at the top of your script
let cursor = null;
let cursorFollower = null;
let isDarkTheme = localStorage.getItem('theme') === 'dark';

/* =========================
   CURSOR ANIMATIONS
========================= */
function initCursorAnimations() {
    cursor = document.querySelector('.cursor');
    cursorFollower = document.querySelector('.cursor-follower');
    
    if (!cursor || !cursorFollower) {
        console.warn('Cursor elements not found. Creating them...');
        createCursorElements();
        cursor = document.querySelector('.cursor');
        cursorFollower = document.querySelector('.cursor-follower');
    }
    
    document.addEventListener('mousemove', (e) => {
        if (cursor && cursorFollower) {
            cursor.style.left = e.clientX + 'px';
            cursor.style.top = e.clientY + 'px';
            
            setTimeout(() => {
                cursorFollower.style.left = e.clientX + 'px';
                cursorFollower.style.top = e.clientY + 'px';
            }, 50);
        }
    });
    
    // Interactive elements
    const interactiveElements = document.querySelectorAll(
        'button, a, input, textarea, select, .checkbox, .tab-btn, .export-option, .nav-link, .theme-toggle, .btn-icon'
    );
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (cursor) cursor.classList.add('cursor-hover');
        });
        
        element.addEventListener('mouseleave', () => {
            if (cursor) cursor.classList.remove('cursor-hover');
        });
        
        element.addEventListener('mousedown', () => {
            if (cursor) cursor.classList.add('cursor-click');
        });
        
        element.addEventListener('mouseup', () => {
            if (cursor) cursor.classList.remove('cursor-click');
        });
    });
    
    // Add click ripple effect
    document.addEventListener('click', createRipple);
}

function createRipple(e) {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    
    const rect = e.target.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    
    e.target.style.position = 'relative';
    e.target.style.overflow = 'hidden';
    e.target.appendChild(ripple);
    
    setTimeout(() => ripple.remove(), 600);
}

function createCursorElements() {
    const cursorEl = document.createElement('div');
    cursorEl.className = 'cursor';
    document.body.appendChild(cursorEl);
    
    const followerEl = document.createElement('div');
    followerEl.className = 'cursor-follower';
    document.body.appendChild(followerEl);
}

/* =========================
   RESPONSIVE ENHANCEMENTS
========================= */
function initResponsiveFeatures() {
    // Dynamic font size based on viewport
    function adjustFontSizes() {
        const vw = Math.min(document.documentElement.clientWidth || window.innerWidth, 1400);
        const scale = Math.min(Math.max(vw / 1400, 0.85), 1);
        
        document.documentElement.style.setProperty('--scale-factor', scale);
        
        // Adjust specific elements
        const heroTitle = document.querySelector('.hero h2');
        if (heroTitle && vw < 768) {
            heroTitle.style.fontSize = `calc(2.5rem * ${scale})`;
        }
    }
    
    // Touch device optimizations
    function handleTouchDevice() {
        if ('ontouchstart' in window || navigator.maxTouchPoints) {
            document.body.classList.add('touch-device');
            
            // Hide cursor on touch devices
            if (cursor) cursor.style.display = 'none';
            if (cursorFollower) cursorFollower.style.display = 'none';
            
            // Add touch feedback
            const touchElements = document.querySelectorAll('button, a, .interactive');
            touchElements.forEach(el => {
                el.addEventListener('touchstart', () => {
                    el.classList.add('touch-active');
                });
                
                el.addEventListener('touchend', () => {
                    setTimeout(() => {
                        el.classList.remove('touch-active');
                    }, 150);
                });
            });
        }
    }
    
    // Scroll progress indicator
    function initScrollProgress() {
        const progressBar = document.createElement('div');
        progressBar.className = 'scroll-progress';
        document.body.appendChild(progressBar);
        
        window.addEventListener('scroll', () => {
            const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
            const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
            const scrolled = (winScroll / height) * 100;
            progressBar.style.transform = `scaleX(${scrolled / 100})`;
        });
    }
    
    // Lazy load images and content
    function initLazyLoading() {
        const lazyElements = document.querySelectorAll('[data-lazy]');
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    if (element.dataset.src) {
                        element.src = element.dataset.src;
                    }
                    if (element.dataset.bg) {
                        element.style.backgroundImage = `url(${element.dataset.bg})`;
                    }
                    element.classList.add('loaded');
                    observer.unobserve(element);
                }
            });
        }, { rootMargin: '50px' });
        
        lazyElements.forEach(el => observer.observe(el));
    }
    
    // Initialize all responsive features
    adjustFontSizes();
    window.addEventListener('resize', adjustFontSizes);
    handleTouchDevice();
    initScrollProgress();
    initLazyLoading();
}

/* =========================
   ANIMATION ENHANCEMENTS
========================= */
function initAnimations() {
    // Animate elements on scroll
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);
    
    // Observe all animatable elements
    document.querySelectorAll('.feature-card, .stat, .input-section, .results-section').forEach(el => {
        el.classList.add('will-animate');
        observer.observe(el);
    });
    
    // Hero animations
    const heroElements = document.querySelectorAll('.hero h2, .subtitle, .stat');
    heroElements.forEach((el, index) => {
        el.style.animationDelay = `${index * 0.2}s`;
        el.classList.add('animate-float');
    });
}

/* =========================
   IMPROVED SCORE ANIMATION
========================= */
function animateScore(score) {
    return new Promise(resolve => {
        const scoreElement = document.getElementById('plagiarismScore');
        const progressCircle = document.querySelector('.score-progress');
        const scoreCategory = document.getElementById('scoreCategory');
        
        if (!scoreElement || !progressCircle) {
            console.error('Score elements not found');
            resolve();
            return;
        }
        
        let current = 0;
        const duration = 1500;
        const startTime = performance.now();
        const circumference = 2 * Math.PI * 54;
        const targetOffset = circumference - (score / 100) * circumference;
        
        function updateScore(timestamp) {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function for smooth animation
            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            
            current = Math.floor(easeOutQuart * score);
            scoreElement.textContent = current;
            
            const currentOffset = circumference - (easeOutQuart * score / 100) * circumference;
            progressCircle.style.strokeDashoffset = currentOffset;
            
            // Update category dynamically
            updateScoreCategory(current);
            
            // Add pulse animation
            if (progress < 1) {
                scoreElement.classList.add('animating');
                requestAnimationFrame(updateScore);
            } else {
                scoreElement.classList.remove('animating');
                
                // Add confetti for low plagiarism scores
                if (score < 20) {
                    createConfetti();
                }
                
                // Add success animation
                scoreElement.parentElement.classList.add('pulse');
                setTimeout(() => {
                    scoreElement.parentElement.classList.remove('pulse');
                }, 1000);
                
                resolve();
            }
        }
        
        requestAnimationFrame(updateScore);
    });
}

function updateScoreCategory(score) {
    const categoryElement = document.getElementById('scoreCategory');
    if (!categoryElement) return;
    
    let category = 'Original';
    let color = 'var(--success)';
    
    if (score >= 80) {
        category = 'High Plagiarism';
        color = 'var(--danger)';
    } else if (score >= 50) {
        category = 'Moderate';
        color = 'var(--warning)';
    } else if (score >= 20) {
        category = 'Low';
        color = 'var(--info)';
    }
    
    categoryElement.textContent = category;
    categoryElement.style.color = color;
}

/* =========================
   CONFETTI EFFECT
========================= */
function createConfetti() {
    const colors = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#06b6d4'];
    
    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        
        // Random properties
        const size = Math.random() * 10 + 5;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const duration = Math.random() * 3 + 2;
        const delay = Math.random() * 1;
        
        confetti.style.width = `${size}px`;
        confetti.style.height = `${size}px`;
        confetti.style.backgroundColor = color;
        confetti.style.left = `${left}vw`;
        confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '0';
        confetti.style.animationDuration = `${duration}s`;
        confetti.style.animationDelay = `${delay}s`;
        
        document.body.appendChild(confetti);
        
        // Remove after animation
        setTimeout(() => {
            confetti.remove();
        }, (duration + delay) * 1000);
    }
}

/* =========================
   ENHANCED SENTENCE DISPLAY
========================= */
function displaySentences(list) {
    const sentencesList = document.getElementById('sentencesList');
    if (!sentencesList) return;
    
    sentencesList.innerHTML = '';
    
    list.forEach((item, index) => {
        const sentenceDiv = document.createElement('div');
        sentenceDiv.className = 'sentence-item';
        sentenceDiv.style.animationDelay = `${index * 0.1}s`;
        
        // Determine category
        let categoryClass = '';
        let scoreClass = '';
        
        if (item.similarity >= 70) {
            categoryClass = 'plagiarized';
            scoreClass = 'high';
        } else if (item.similarity >= 40) {
            categoryClass = 'suspicious';
            scoreClass = 'medium';
        } else {
            categoryClass = 'original';
            scoreClass = 'low';
        }
        
        sentenceDiv.classList.add(categoryClass);
        
        const sentenceNumber = index + 1;
        const percentage = item.similarity || 0;
        
        sentenceDiv.innerHTML = `
            <div class="sentence-header">
                <span class="sentence-number">Sentence ${sentenceNumber}</span>
                <span class="sentence-score ${scoreClass}">${percentage}%</span>
            </div>
            <div class="sentence-text">${escapeHtml(item.sentence)}</div>
        `;
        
        sentencesList.appendChild(sentenceDiv);
    });
    
    // Animate sentences in
    setTimeout(() => {
        document.querySelectorAll('.sentence-item').forEach(el => {
            el.style.animation = 'slideInUp 0.5s ease forwards';
        });
    }, 100);
}

/* =========================
   ENHANCED SUGGESTIONS
========================= */
function generateSuggestions(score) {
    const suggestions = [];
    
    if (score >= 80) {
        suggestions.push(
            'Consider completely rewriting this section',
            'Add more original analysis and insights',
            'Use multiple sources and synthesize information',
            'Cite all external sources properly'
        );
    } else if (score >= 50) {
        suggestions.push(
            'Rephrase sentences to be more original',
            'Combine multiple sources into unique content',
            'Add your own commentary and analysis',
            'Use synonyms and different sentence structures'
        );
    } else if (score >= 20) {
        suggestions.push(
            'Minor rephrasing could improve originality',
            'Add unique examples or case studies',
            'Include recent data or updated information',
            'Consider adding personal insights'
        );
    } else {
        suggestions.push(
            'Great job! Content appears highly original',
            'Maintain this level of originality throughout',
            'Consider adding references for credibility',
            'Your unique voice shines through'
        );
    }
    
    // Add general suggestions
    suggestions.push(
        'Always cite your sources properly',
        'Use plagiarism checker regularly',
        'Keep your target audience in mind',
        'Review content for clarity and flow'
    );
    
    return suggestions.slice(0, 4); // Return top 4 suggestions
}

function displaySuggestions(suggestions) {
    const suggestionsList = document.getElementById('suggestionsList');
    if (!suggestionsList) return;
    
    suggestionsList.innerHTML = '';
    
    suggestions.forEach((suggestion, index) => {
        const suggestionDiv = document.createElement('div');
        suggestionDiv.className = 'suggestion-item';
        suggestionDiv.style.animationDelay = `${index * 0.1}s`;
        
        const icons = ['lightbulb', 'check-circle', 'exclamation-triangle', 'star'];
        const icon = icons[index % icons.length];
        
        suggestionDiv.innerHTML = `
            <div class="suggestion-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="suggestion-text">${suggestion}</div>
        `;
        
        suggestionsList.appendChild(suggestionDiv);
    });
}

/* =========================
   EXPORT FUNCTIONALITY
========================= */
function initExportFeature() {
    const exportBtn = document.getElementById('exportBtn');
    if (!exportBtn) return;
    
    exportBtn.addEventListener('click', () => {
        if (!currentResult) {
            showToast('No results to export', 'warning');
            return;
        }
        
        showExportModal();
    });
}

function showExportModal() {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'export-modal';
    modal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.8);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
        backdrop-filter: blur(5px);
    `;
    
    modal.innerHTML = `
        <div class="export-modal-content" style="
            background: var(--bg-card);
            padding: 30px;
            border-radius: var(--radius-xl);
            max-width: 500px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: var(--shadow-xl);
        ">
            <div class="export-header" style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            ">
                <h3 style="margin: 0; font-size: 1.5rem;">
                    <i class="fas fa-download" style="margin-right: 10px;"></i>
                    Export Report
                </h3>
                <button class="btn-icon close-export" style="
                    background: transparent;
                    border: none;
                    font-size: 1.5rem;
                    cursor: pointer;
                    color: var(--text-secondary);
                ">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            
            <div class="export-options" style="display: grid; gap: 15px;">
                <button class="export-option pdf" style="
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                ">
                    <div class="export-icon" style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, var(--primary), var(--secondary));
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 1.5rem;
                    ">
                        <i class="fas fa-file-pdf"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 5px 0;">PDF Document</h4>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                            Professional PDF report with detailed analysis
                        </p>
                    </div>
                </button>
                
                <button class="export-option txt" style="
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                ">
                    <div class="export-icon" style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, var(--warning), var(--danger));
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 1.5rem;
                    ">
                        <i class="fas fa-file-alt"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 5px 0;">Text File</h4>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                            Simple text file with results summary
                        </p>
                    </div>
                </button>
                
                <button class="export-option json" style="
                    background: var(--bg-secondary);
                    border: 2px solid var(--border-color);
                    border-radius: var(--radius-lg);
                    padding: 20px;
                    text-align: left;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    display: flex;
                    align-items: center;
                    gap: 15px;
                ">
                    <div class="export-icon" style="
                        width: 50px;
                        height: 50px;
                        background: linear-gradient(135deg, var(--info), var(--primary));
                        border-radius: var(--radius-md);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-size: 1.5rem;
                    ">
                        <i class="fas fa-code"></i>
                    </div>
                    <div>
                        <h4 style="margin: 0 0 5px 0;">JSON Data</h4>
                        <p style="margin: 0; color: var(--text-secondary); font-size: 0.9rem;">
                            Raw data for developers and integrations
                        </p>
                    </div>
                </button>
            </div>
            
            <div class="export-footer" style="margin-top: 25px; text-align: center;">
                <button class="btn-secondary cancel-export" style="margin-top: 10px;">
                    <i class="fas fa-times"></i> Cancel
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listeners
    modal.querySelector('.close-export').addEventListener('click', () => modal.remove());
    modal.querySelector('.cancel-export').addEventListener('click', () => modal.remove());
    
    // Export option clicks
    modal.querySelector('.export-option.pdf').addEventListener('click', () => exportToPDF());
    modal.querySelector('.export-option.txt').addEventListener('click', () => exportToText());
    modal.querySelector('.export-option.json').addEventListener('click', () => exportToJSON());
    
    // Close on background click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function exportToPDF() {
    showToast('PDF export feature coming soon!', 'info');
    // Implement PDF export using pdfkit
}

function exportToText() {
    const content = `
Plagiarism Check Report
=======================

Overall Score: ${currentResult.overallPlagiarism}%
Date: ${new Date().toLocaleDateString()}
Time: ${new Date().toLocaleTimeString()}

Text Length: ${elements.inputText.value.length} characters

DETAILED ANALYSIS:
${currentResult.detailedReport.sentenceAnalysis.map((s, i) => 
    `Sentence ${i + 1}: ${s.similarity}% - ${s.sentence}`
).join('\n')}

SUGGESTIONS:
${generateSuggestions(currentResult.overallPlagiarism).join('\n• ')}

---
Generated by PlagiarismCheck Pro
https://plagiarism-checker-pro.com
    `;
    
    downloadFile(content, 'plagiarism-report.txt', 'text/plain');
}

function exportToJSON() {
    const data = {
        overallScore: currentResult.overallPlagiarism,
        analysisDate: new Date().toISOString(),
        textLength: elements.inputText.value.length,
        detailedAnalysis: currentResult.detailedReport.sentenceAnalysis,
        suggestions: generateSuggestions(currentResult.overallPlagiarism),
        metadata: {
            tool: 'PlagiarismCheck Pro',
            version: '2.0'
        }
    };
    
    downloadFile(JSON.stringify(data, null, 2), 'plagiarism-report.json', 'application/json');
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showToast('Report downloaded successfully!', 'success');
}

/* =========================
   TOAST NOTIFICATIONS
========================= */
function showToast(message, type = 'info', duration = 3000) {
    const toastContainer = document.getElementById('toastContainer') || createToastContainer();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas fa-${getToastIcon(type)}"></i>
        <span>${message}</span>
        <button class="toast-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    toastContainer.appendChild(toast);
    
    // Add close functionality
    toast.querySelector('.toast-close').addEventListener('click', () => {
        toast.remove();
    });
    
    // Auto remove after duration
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'toastSlideIn 0.3s ease reverse';
            setTimeout(() => toast.remove(), 300);
        }
    }, duration);
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
    container.id = 'toastContainer';
    container.className = 'toast-container';
    document.body.appendChild(container);
    return container;
}

/* =========================
   UTILITY FUNCTIONS
========================= */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatNumber(num) {
    return Math.round(num * 10) / 10;
}

/* =========================
   INITIALIZE EVERYTHING
========================= */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize cursor animations
    initCursorAnimations();
    
    // Initialize responsive features
    initResponsiveFeatures();
    
    // Initialize animations
    initAnimations();
    
    // Initialize export feature
    initExportFeature();
    
    // Add hover effects to all buttons
    document.querySelectorAll('button').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.transform = 'translateY(-2px)';
        });
        
        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translateY(0)';
        });
    });
    
    // Add shimmer effect to loading states
    const loadingStates = document.querySelectorAll('.loading-spinner');
    loadingStates.forEach(el => {
        el.classList.add('shimmer');
    });
});

/* =========================
   ENHANCED ERROR HANDLING
========================= */
window.addEventListener('error', (e) => {
    console.error('Application error:', e.error);
    showToast('An error occurred. Please try again.', 'error');
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('Unhandled promise rejection:', e.reason);
    showToast('Something went wrong. Please refresh.', 'error');
});

// Add this to your existing checkPlagiarism function to enhance it
async function enhancedCheckPlagiarism() {
    // Your existing check logic here...
    
    // Add loading animation
    elements.checkBtn.classList.add('pulse');
    
    // Add AI thinking animation
    const thinkingDots = document.createElement('div');
    thinkingDots.className = 'ai-thinking';
    thinkingDots.innerHTML = '<span></span><span></span><span></span>';
    elements.resultStatus.appendChild(thinkingDots);
    
    // After checking is done
    elements.checkBtn.classList.remove('pulse');
    thinkingDots.remove();
    
    // Add success animation
    elements.resultsContainer.classList.add('success-animation');
    setTimeout(() => {
        elements.resultsContainer.classList.remove('success-animation');
    }, 1000);
}

// Add CSS for new animations
const style = document.createElement('style');
style.textContent = `
    .success-animation {
        animation: successPulse 1s ease;
    }
    
    @keyframes successPulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.02); }
    }
    
    .ai-thinking span {
        display: inline-block;
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: var(--text-secondary);
        animation: thinkingDots 1.4s infinite;
    }
    
    .ai-thinking span:nth-child(1) { animation-delay: 0s; }
    .ai-thinking span:nth-child(2) { animation-delay: 0.2s; }
    .ai-thinking span:nth-child(3) { animation-delay: 0.4s; }
    
    @keyframes thinkingDots {
        0%, 100% { transform: scale(1); opacity: 1; }
        50% { transform: scale(1.5); opacity: 0.5; }
    }
    
    .touch-active {
        transform: scale(0.95);
        transition: transform 0.1s ease;
    }
    
    .will-animate {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }
    
    .animate-in {
        opacity: 1;
        transform: translateY(0);
    }
    
    .animate-float {
        animation: floatUp 0.6s ease forwards;
    }
`;
document.head.appendChild(style);
