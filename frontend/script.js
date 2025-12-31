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
   WORD COUNT
========================= */
function updateWordCount() {
    const text = elements.inputText.value || '';
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    elements.wordCount.textContent = `${words} words, ${chars} chars`;
    elements.checkBtn.disabled = chars < 50;
}

/* =========================
   API HEALTH
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
   MAIN CHECK
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
        const result = isOnline
            ? await checkWithAPI(text)
            : await checkWithFallback(text);

        currentResult = result;
        await displayResults(result);

    } catch (error) {
        console.warn('Silent fallback:', error.message);

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
    setTimeout(() => controller.abort(), 8000);

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
        throw new Error('API not ready');
    }

    const data = await response.json();
    const sentenceAnalysis = generateSentenceAnalysis(text);

    const score = Number.isFinite(data.overallPlagiarism)
        ? Math.round(data.overallPlagiarism)
        : calculateScore(sentenceAnalysis);

    return {
        overallPlagiarism: score,
        detailedReport: { sentenceAnalysis },
        suggestions: generateSuggestions(score)
    };
}

/* =========================
   FALLBACK
========================= */
async function checkWithFallback(text) {
    const sentenceAnalysis = generateSentenceAnalysis(text);
    const score = calculateScore(sentenceAnalysis);

    return {
        overallPlagiarism: score,
        detailedReport: { sentenceAnalysis },
        suggestions: generateSuggestions(score),
        isFallback: true
    };
}

/* =========================
   SENTENCE ANALYSIS
========================= */
function generateSentenceAnalysis(text) {
    const sentences = text.split(/[.!?]+/).map(s => s.trim()).filter(s => s);
    return sentences.map((s, i) => {
        let max = 0;
        for (let j = 0; j < i; j++) {
            max = Math.max(max, similarity(s, sentences[j]));
        }
        return {
            sentence: s,
            similarity: Math.round(max),
            category: max >= 70 ? 'high' : max >= 40 ? 'medium' : 'low'
        };
    });
}

function similarity(a, b) {
    const A = new Set(a.toLowerCase().split(/\W+/));
    const B = new Set(b.toLowerCase().split(/\W+/));
    const inter = [...A].filter(x => B.has(x));
    const union = new Set([...A, ...B]);
    return union.size ? (inter.length / union.size) * 100 : 0;
}

function calculateScore(list) {
    if (!list.length) return 0;
    return Math.round(list.reduce((s, i) => s + i.similarity, 0) / list.length);
}

/* =========================
   UI
========================= */
async function displayResults(result) {
    await animateScore(result.overallPlagiarism);
    updateScoreCategory(result.overallPlagiarism);
    displaySentences(result.detailedReport.sentenceAnalysis);
    displaySuggestions(result.suggestions);
}

function animateScore(score) {
    return new Promise(r => {
        let c = 0;
        const i = setInterval(() => {
            elements.plagiarismScore.textContent = c;
            const circ = 2 * Math.PI * 54;
            elements.scoreProgress.style.strokeDashoffset =
                circ - (c / 100) * circ;
            if (c++ >= score) {
                clearInterval(i);
                r();
            }
        }, 10);
    });
}

function updateScoreCategory(score) {
    let t = 'Original';
    if (score >= 80) t = 'High Plagiarism';
    else if (score >= 50) t = 'Moderate';
    else if (score >= 20) t = 'Low';
    elements.scoreCategory.textContent = t;
}

function displaySentences(list) {
    elements.sentencesList.innerHTML = '';
    list.forEach((i, n) => {
        const d = document.createElement('div');
        d.innerHTML = `<b>Sentence ${n + 1}</b> — ${i.similarity}%<p>${i.sentence}</p>`;
        elements.sentencesList.appendChild(d);
    });
}

function generateSuggestions(score) {
    if (score >= 80) return ['Rewrite content'];
    if (score >= 50) return ['Rephrase sentences'];
    return ['Content looks original'];
}

function displaySuggestions(list) {
    elements.suggestionsList.innerHTML = '';
    list.forEach(t => {
        const d = document.createElement('div');
        d.textContent = t;
        elements.suggestionsList.appendChild(d);
    });
}
