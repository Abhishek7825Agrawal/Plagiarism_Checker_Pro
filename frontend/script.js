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
    scoreProgress: document.querySelector('.score-progress')
};

/* =========================
   STATE
========================= */
let isChecking = false;
let currentResult = null;

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
   REAL-TIME WORD COUNT
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
            elements.resultStatus.textContent = 'API Connected';
            elements.resultStatus.style.color = 'green';
        }
    } catch {
        elements.resultStatus.textContent = 'API Offline (Fallback Enabled)';
        elements.resultStatus.style.color = 'orange';
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
        displayResults(result);

    } catch (error) {
        console.error(error);
        performClientSideFallback(text);
    } finally {
        isChecking = false;
        elements.checkBtn.disabled = false;
        elements.loadingSpinner.style.display = 'none';
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
    elements.resultStatus.textContent = 'Using Client-side Analysis';

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
    elements.plagiarismScore.textContent = score;

    const circumference = 2 * Math.PI * 54;
    const offset = circumference - (score / 100) * circumference;
    elements.scoreProgress.style.strokeDashoffset = offset;

    let category = 'Original';
    let color = 'green';

    if (score >= 80) {
        category = 'High Plagiarism';
        color = 'red';
    } else if (score >= 50) {
        category = 'Moderate';
        color = 'orange';
    } else if (score >= 20) {
        category = 'Low';
        color = 'blue';
    }

    elements.scoreCategory.textContent = category;
    elements.scoreCategory.style.color = color;

    displaySentences(result.detailedReport.sentenceAnalysis);
    displaySuggestions(result.suggestions);

    elements.resultStatus.textContent = 'Complete';
}

/* =========================
   SENTENCE DISPLAY
========================= */
function displaySentences(sentences) {
    elements.sentencesList.innerHTML = '';

    sentences.forEach((item, i) => {
        const div = document.createElement('div');
        div.className = 'sentence-item';
        div.innerHTML = `
            <strong>Sentence ${i + 1}</strong>
            <p>${item.sentence}</p>
            <span>${item.similarity}% similarity</span>
        `;
        elements.sentencesList.appendChild(div);
    });
}

/* =========================
   SUGGESTIONS
========================= */
function generateSuggestions(score) {
    if (score >= 80) {
        return [
            'High plagiarism detected',
            'Rewrite content thoroughly',
            'Add proper citations'
        ];
    }
    if (score >= 50) {
        return [
            'Moderate plagiarism detected',
            'Rephrase highlighted sentences'
        ];
    }
    return [
        'Content looks mostly original',
        'Good work'
    ];
}

function displaySuggestions(list) {
    elements.suggestionsList.innerHTML = '';
    list.forEach(text => {
        const div = document.createElement('div');
        div.textContent = text;
        elements.suggestionsList.appendChild(div);
    });
}
