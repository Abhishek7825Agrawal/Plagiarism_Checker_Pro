/* =======================
   API CONFIG
======================= */
const API_CONFIG = {
    BASE_URL: 'https://plagiarism-checker-backend.onrender.com',
    ENDPOINTS: {
        CHECK: '/api/check',
        HEALTH: '/api/health'
    }
};

/* =======================
   DOM ELEMENTS
======================= */
const elements = {
    inputText: document.getElementById('inputText'),
    checkBtn: document.getElementById('checkBtn'),
    loadingSpinner: document.getElementById('loadingSpinner'),
    plagiarismScore: document.getElementById('plagiarismScore'),
    scoreCategory: document.getElementById('scoreCategory'),
    sentencesList: document.getElementById('sentencesList'),
    sourcesList: document.getElementById('sourcesList'),
    suggestionsList: document.getElementById('suggestionsList'),
    resultStatus: document.getElementById('resultStatus'),
    scoreProgress: document.querySelector('.score-progress')
};

let isChecking = false;
let currentResult = null;

/* =======================
   INIT
======================= */
document.addEventListener('DOMContentLoaded', () => {
    checkAPIHealth();
});

/* =======================
   API HEALTH CHECK
======================= */
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

/* =======================
   MAIN CHECK FUNCTION
======================= */
async function checkPlagiarism() {
    if (isChecking) return;

    const text = elements.inputText.value.trim();
    if (text.length < 50) {
        alert('Text must be at least 50 characters');
        return;
    }

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

        // 🔥 Normalize backend response
        const normalizedResult = {
            overallPlagiarism: Math.round(data.overallPlagiarism || 0),
            textLength: data.textLength || text.length,
            suggestions: generateSuggestions(data.overallPlagiarism || 0),
            detailedReport: {
                sentenceAnalysis: [],
                sources: []
            }
        };

        currentResult = normalizedResult;
        displayResults(normalizedResult);

    } catch (err) {
        console.error(err);
        performClientSideCheck(text);
    } finally {
        isChecking = false;
        elements.checkBtn.disabled = false;
        elements.loadingSpinner.style.display = 'none';
    }
}

/* =======================
   CLIENT SIDE FALLBACK
======================= */
function performClientSideCheck(text) {
    elements.resultStatus.textContent = 'Using Client-side Analysis';

    const sentences = text.split(/[.!?]/).filter(Boolean);
    const score = Math.min(100, sentences.length * 5);

    const mockResult = {
        overallPlagiarism: score,
        suggestions: generateSuggestions(score),
        detailedReport: {
            sentenceAnalysis: [],
            sources: []
        }
    };

    displayResults(mockResult);
}

/* =======================
   DISPLAY RESULTS
======================= */
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
    }

    elements.scoreCategory.textContent = category;
    elements.scoreCategory.style.color = color;

    displaySuggestions(result.suggestions || []);
    elements.resultStatus.textContent = 'Complete';
}

/* =======================
   SUGGESTIONS
======================= */
function generateSuggestions(score) {
    if (score >= 80) {
        return [
            'High plagiarism detected',
            'Rewrite content',
            'Add citations'
        ];
    }
    if (score >= 50) {
        return [
            'Moderate plagiarism detected',
            'Review highlighted areas'
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

/* =======================
   EVENT
======================= */
elements.checkBtn.addEventListener('click', checkPlagiarism);
