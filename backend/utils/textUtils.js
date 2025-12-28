const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

exports.extractSentences = (text) => {
    return text
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);
};

exports.tokenizeText = (text) => {
    return tokenizer.tokenize(text.toLowerCase());
};

exports.createNGrams = (text, n = 3) => {
    const tokens = this.tokenizeText(text);
    const ngrams = [];
    
    for (let i = 0; i <= tokens.length - n; i++) {
        ngrams.push(tokens.slice(i, i + n).join(' '));
    }
    
    return ngrams;
};

exports.removeStopWords = (tokens) => {
    const stopWords = new Set([
        'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
        'of', 'with', 'by', 'is', 'are', 'was', 'were', 'be', 'been', 'being'
    ]);
    
    return tokens.filter(token => !stopWords.has(token.toLowerCase()));
};

exports.calculateReadability = (text) => {
    const sentences = this.extractSentences(text);
    const words = text.split(/\s+/);
    
    if (sentences.length === 0 || words.length === 0) {
        return { score: 0, level: 'Unknown' };
    }
    
    // Flesch Reading Ease simplified
    const wordsPerSentence = words.length / sentences.length;
    const syllablesPerWord = this.countSyllables(text) / words.length;
    
    const score = 206.835 - (1.015 * wordsPerSentence) - (84.6 * syllablesPerWord);
    
    let level = 'Very Easy';
    if (score < 60) level = 'Standard';
    if (score < 50) level = 'Fairly Difficult';
    if (score < 30) level = 'Difficult';
    if (score < 10) level = 'Very Difficult';
    
    return { score: Math.round(score), level };
};

exports.countSyllables = (text) => {
    // Simplified syllable count
    const vowels = /[aeiouy]+/gi;
    const matches = text.toLowerCase().match(vowels);
    return matches ? matches.length : 0;
};