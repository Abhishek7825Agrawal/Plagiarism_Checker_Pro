const natural = require('natural');
const stringSimilarity = require('string-similarity');
const webSearchService = require('./webSearchService');
const { extractSentences, tokenizeText, createNGrams } = require('../utils/textUtils');

class PlagiarismService {
    constructor() {
        this.tokenizer = new natural.WordTokenizer();
        this.tfidf = new natural.TfIdf();
        this.similarityThreshold = 0.7; // 70% similarity considered plagiarism
    }

    async analyzeText(text, options = {}) {
        const {
            language = 'en',
            checkWeb = false,
            requestId
        } = options;

        // Start analysis
        const analysisStart = Date.now();
        
        // 1. Local text analysis
        const localAnalysis = this.analyzeLocal(text);
        
        // 2. Web search (if enabled)
        let webResults = [];
        if (checkWeb) {
            webResults = await this.checkAgainstWeb(text);
        }

        // 3. Calculate overall score
        const overallScore = this.calculateOverallScore(localAnalysis, webResults);
        
        // 4. Generate detailed report
        const report = this.generateReport(text, localAnalysis, webResults, overallScore);

        const processingTime = Date.now() - analysisStart;

        return {
            textLength: text.length,
            wordCount: text.split(/\s+/).length,
            overallPlagiarism: overallScore,
            processingTime: `${processingTime}ms`,
            detailedReport: report,
            suggestions: this.generateSuggestions(overallScore, report)
        };
    }

    analyzeLocal(text) {
        const sentences = extractSentences(text);
        const results = [];

        // Compare each sentence with others in the text
        for (let i = 0; i < sentences.length; i++) {
            for (let j = i + 1; j < sentences.length; j++) {
                const similarity = this.calculateSentenceSimilarity(
                    sentences[i], 
                    sentences[j]
                );
                
                if (similarity > this.similarityThreshold) {
                    results.push({
                        type: 'internal',
                        sentence1: sentences[i],
                        sentence2: sentences[j],
                        similarity: similarity * 100,
                        position: { i, j }
                    });
                }
            }
        }

        return {
            internalMatches: results,
            sentenceCount: sentences.length
        };
    }

    async checkAgainstWeb(text) {
        try {
            // Extract key phrases for web search
            const keyPhrases = this.extractKeyPhrases(text);
            const results = [];

            // Search for each key phrase (limit to 3 to avoid rate limiting)
            for (const phrase of keyPhrases.slice(0, 3)) {
                const webMatches = await webSearchService.searchPhrase(phrase);
                results.push(...webMatches);
            }

            return results;
        } catch (error) {
            console.error('Web search error:', error);
            return [];
        }
    }

    extractKeyPhrases(text) {
        const sentences = extractSentences(text);
        // Extract nouns and important words
        const importantSentences = sentences
            .filter(s => s.split(/\s+/).length >= 5)
            .sort((a, b) => b.length - a.length);
        
        return importantSentences.slice(0, 5);
    }

    calculateSentenceSimilarity(s1, s2) {
        // Multiple similarity measures
        const jaccardSimilarity = this.jaccardIndex(s1, s2);
        const cosineSimilarity = this.cosineSimilarity(s1, s2);
        const levenshteinSimilarity = this.normalizedLevenshtein(s1, s2);

        // Weighted average
        return (jaccardSimilarity * 0.4 + 
                cosineSimilarity * 0.4 + 
                levenshteinSimilarity * 0.2);
    }

    jaccardIndex(s1, s2) {
        const set1 = new Set(s1.toLowerCase().split(/\W+/));
        const set2 = new Set(s2.toLowerCase().split(/\W+/));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    cosineSimilarity(s1, s2) {
        const tokens1 = this.tokenizer.tokenize(s1.toLowerCase());
        const tokens2 = this.tokenizer.tokenize(s2.toLowerCase());
        
        const allTokens = [...new Set([...tokens1, ...tokens2])];
        const vector1 = allTokens.map(t => tokens1.filter(x => x === t).length);
        const vector2 = allTokens.map(t => tokens2.filter(x => x === t).length);
        
        const dotProduct = vector1.reduce((sum, val, i) => sum + val * vector2[i], 0);
        const magnitude1 = Math.sqrt(vector1.reduce((sum, val) => sum + val * val, 0));
        const magnitude2 = Math.sqrt(vector2.reduce((sum, val) => sum + val * val, 0));
        
        if (magnitude1 === 0 || magnitude2 === 0) return 0;
        return dotProduct / (magnitude1 * magnitude2);
    }

    normalizedLevenshtein(s1, s2) {
        const distance = natural.LevenshteinDistance(s1, s2, {});
        const maxLength = Math.max(s1.length, s2.length);
        return maxLength === 0 ? 1 : 1 - (distance / maxLength);
    }

    calculateOverallScore(localAnalysis, webResults) {
        let totalScore = 0;
        let weight = 0;

        // Internal matches weight
        if (localAnalysis.internalMatches.length > 0) {
            const avgInternalSimilarity = localAnalysis.internalMatches
                .reduce((sum, match) => sum + match.similarity, 0) / 
                localAnalysis.internalMatches.length;
            totalScore += avgInternalSimilarity * 0.3;
            weight += 0.3;
        }

        // Web matches weight
        if (webResults.length > 0) {
            const avgWebSimilarity = webResults
                .reduce((sum, result) => sum + result.similarity, 0) / 
                webResults.length;
            totalScore += avgWebSimilarity * 0.7;
            weight += 0.7;
        }

        return weight > 0 ? Math.min(100, totalScore / weight) : 0;
    }

    generateReport(text, localAnalysis, webResults, overallScore) {
        const sentences = extractSentences(text);
        const report = {
            overallScore,
            sentenceAnalysis: [],
            flaggedSentences: [],
            sources: []
        };

        // Analyze each sentence
        sentences.forEach((sentence, index) => {
            let maxSimilarity = 0;
            let source = null;

            // Check against web results
            webResults.forEach(result => {
                const similarity = this.calculateSentenceSimilarity(sentence, result.snippet);
                if (similarity > maxSimilarity && similarity > this.similarityThreshold) {
                    maxSimilarity = similarity;
                    source = {
                        type: 'web',
                        url: result.url,
                        similarity: similarity * 100
                    };
                }
            });

            report.sentenceAnalysis.push({
                sentence,
                position: index,
                similarity: maxSimilarity * 100,
                isFlagged: maxSimilarity > this.similarityThreshold,
                source
            });

            if (maxSimilarity > this.similarityThreshold) {
                report.flaggedSentences.push({
                    sentence,
                    position: index,
                    similarity: maxSimilarity * 100,
                    source
                });
            }
        });

        // Collect unique sources
        report.sources = [...new Set(webResults.map(r => r.url))];

        return report;
    }

    generateSuggestions(score, report) {
        const suggestions = [];
        
        if (score > 80) {
            suggestions.push(
                "⚠️ High plagiarism detected. Consider rewriting large portions.",
                "📚 Cite your sources properly.",
                "🔄 Paraphrase more effectively."
            );
        } else if (score > 50) {
            suggestions.push(
                "⚠️ Moderate plagiarism detected. Review flagged sentences.",
                "📝 Use more original content.",
                "🔍 Add proper citations where needed."
            );
        } else if (score > 20) {
            suggestions.push(
                "✅ Minor similarities detected. Consider rewording some phrases.",
                "📖 Ensure proper quotation marks for direct quotes."
            );
        } else {
            suggestions.push(
                "✅ Excellent! Content appears to be mostly original.",
                "📝 Keep up the good work!"
            );
        }

        // Add specific suggestions based on flagged sentences
        if (report.flaggedSentences.length > 0) {
            suggestions.push(`📌 ${report.flaggedSentences.length} sentences need review.`);
        }

        return suggestions;
    }

    async compareMultipleDocuments(documents) {
        const results = [];
        
        for (let i = 0; i < documents.length; i++) {
            for (let j = i + 1; j < documents.length; j++) {
                const similarity = this.calculateTextSimilarity(
                    documents[i], 
                    documents[j]
                );
                
                results.push({
                    doc1: i + 1,
                    doc2: j + 1,
                    similarity: similarity * 100,
                    status: similarity > this.similarityThreshold ? 'SUSPICIOUS' : 'OK'
                });
            }
        }

        return results;
    }

    calculateTextSimilarity(text1, text2) {
        // Use multiple methods for better accuracy
        const methods = [
            this.cosineSimilarity(text1, text2),
            this.jaccardIndex(text1, text2),
            stringSimilarity.compareTwoStrings(text1, text2)
        ];
        
        // Return average
        return methods.reduce((sum, val) => sum + val, 0) / methods.length;
    }
}

module.exports = new PlagiarismService();