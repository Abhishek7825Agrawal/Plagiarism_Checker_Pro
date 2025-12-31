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
    resultsContainer: document.querySelector('.results-container')
};

/* =========================
   STATE
========================= */
let isChecking = false;
let currentResult = null;
let isOnline = true;

/* =========================
   INIT
========================= */
document.addEventListener('DOMContentLoaded', () => {
    elements.inputText.addEventListener('input', updateWordCount);
    elements.checkBtn.addEventListener('click', checkPlagiarism);
    updateWordCount();
    checkAPIHealth();
});

/* =========================
   WORD COUNT (REAL TIME)
========================= */
function updateWordCount() {
    const text = elements.inputText.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;

    elements.wordCount.textContent = `${words} words, ${chars} chars`;
    elements.checkBtn.disabled = chars < 50;
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
        if (res.ok) {
            isOnline = true;
            elements.resultStatus.textContent = 'API Connected';
        }
    } catch {
        isOnline = false;
        elements.resultStatus.textContent = 'API Offline (Hybrid Mode)';
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

    try {
        let result;

        if (isOnline) {
            result = await checkWithAPI(text);
        } else {
            result = await checkWithFallback(text);
        }

        currentResult = result;
        await displayResults(result);

    } catch (error) {
        console.warn('Hybrid fallback triggered:', error.message);

        const result = await checkWithFallback(text);
        currentResult = result;
        await displayResults(result);

    } finally {
        isChecking = false;
        elements.checkBtn.disabled = false;
        elements.loadingSpinner.style.display = 'none';
        elements.resultStatus.textContent = 'Analysis Complete';
    }
}

/* =========================
   BACKEND CHECK (SAFE)
========================= */
async function checkWithAPI(text) {
    const controller = new AbortController();
    setTimeout(() => controller.abort(), 8000); // Render cold start safe

    const response = await fetch(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.CHECK}`,
        {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
            signal: controller.signal
        }
    );

    if (!response.ok) {
        throw new Error(`API_ERROR_${response.status}`);
    }

    const data = await response.json();

    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = Number.isFinite(data.overallPlagiarism)
        ? Math.round(data.overallPlagiarism)
        : calculateScore(sentenceAnalysis);

    return {
        overallPlagiarism: score,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        detailedReport: { sentenceAnalysis },
        suggestions: generateSuggestions(score),
        checkedAt: new Date().toISOString()
    };
}

/* =========================
   FALLBACK CHECK
========================= */
async function checkWithFallback(text) {
    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = calculateScore(sentenceAnalysis);

    return {
        overallPlagiarism: score,
        textLength: text.length,
        wordCount: text.split(/\s+/).length,
        detailedReport: { sentenceAnalysis },
        suggestions: generateSuggestions(score),
        isFallback: true,
        checkedAt: new Date().toISOString()
    };
}

/* =========================
   SENTENCE ANALYSIS (REAL)
========================= */
function generateSentenceAnalysis(text) {
    const sentences = text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 10);

    return sentences.map((sentence, index) => {
        let maxSimilarity = 0;

        for (let i = 0; i < index; i++) {
            const sim = calculateSentenceSimilarity(sentence, sentences[i]);
            if (sim > maxSimilarity) maxSimilarity = sim;
        }

        return {
            sentence,
            position: index,
            similarity: Math.round(maxSimilarity),
            category: getSimilarityCategory(maxSimilarity)
        };
    });
}

function calculateSentenceSimilarity(a, b) {
    const setA = new Set(tokenize(a));
    const setB = new Set(tokenize(b));

    const intersection = new Set([...setA].filter(x => setB.has(x)));
    const union = new Set([...setA, ...setB]);

    return union.size === 0 ? 0 : (intersection.size / union.size) * 100;
}

function tokenize(sentence) {
    return sentence
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter(Boolean);
}

function calculateScore(sentenceAnalysis) {
    if (sentenceAnalysis.length === 0) return 0;
    const total = sentenceAnalysis.reduce((s, i) => s + i.similarity, 0);
    return Math.min(Math.round(total / sentenceAnalysis.length), 100);
}

function getSimilarityCategory(sim) {
    if (sim >= 70) return 'high';
    if (sim >= 40) return 'medium';
    return 'low';
}

/* =========================
   DISPLAY RESULTS
========================= */
async function displayResults(result) {
    await animateScore(result.overallPlagiarism);
    updateScoreCategory(result.overallPlagiarism);
    displaySentences(result.detailedReport.sentenceAnalysis);
    displaySuggestions(result.suggestions);
}

/* =========================
   SCORE ANIMATION
========================= */
async function animateScore(finalScore) {
    return new Promise(resolve => {
        let current = 0;
        const step = () => {
            if (current <= finalScore) {
                elements.plagiarismScore.textContent = current;
                const circumference = 2 * Math.PI * 54;
                elements.scoreProgress.style.strokeDashoffset =
                    circumference - (current / 100) * circumference;
                current++;
                requestAnimationFrame(step);
            } else resolve();
        };
        step();
    });
}

function updateScoreCategory(score) {
    let text = 'Original';
    let color = 'var(--success)';

    if (score >= 80) { text = 'High Plagiarism'; color = 'var(--danger)'; }
    else if (score >= 50) { text = 'Moderate'; color = 'var(--warning)'; }
    else if (score >= 20) { text = 'Low'; color = 'var(--info)'; }

    elements.scoreCategory.textContent = text;
    elements.scoreCategory.style.color = color;
}

/* =========================
   SENTENCES UI
========================= */
function displaySentences(sentences) {
    elements.sentencesList.innerHTML = '';
    sentences.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = `sentence-item ${item.category}`;
        div.innerHTML = `
            <strong>Sentence ${i + 1}</strong>
            <span>${item.similarity}% similarity</span>
            <p>${item.sentence}</p>
        `;
        elements.sentencesList.appendChild(div);
    });
}

/* =========================
   SUGGESTIONS
========================= */
function generateSuggestions(score) {
    if (score >= 80) return ['Rewrite content', 'Add citations'];
    if (score >= 50) return ['Rephrase similar sentences'];
    return ['Content looks original'];
}

function displaySuggestions(list) {
    elements.suggestionsList.innerHTML = '';
    list.forEach(text => {
        const div = document.createElement('div');
        div.textContent = text;
        elements.suggestionsList.appendChild(div);
    });
}
