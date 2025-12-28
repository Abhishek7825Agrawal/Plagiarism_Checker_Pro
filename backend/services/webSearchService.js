const axios = require('axios');
const cheerio = require('cheerio');

class WebSearchService {
    constructor() {
        // Note: For production, use proper search APIs
        // This is a simplified version
        this.searchEngines = {
            duckduckgo: 'https://html.duckduckgo.com/html/?q=',
            // Add more search engines as needed
        };
    }

    async searchPhrase(phrase) {
        try {
            const results = [];
            
            // Search DuckDuckGo (no API key needed for basic HTML)
            const searchUrl = `${this.searchEngines.duckduckgo}${encodeURIComponent(phrase)}`;
            
            const response = await axios.get(searchUrl, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                },
                timeout: 10000
            });

            const $ = cheerio.load(response.data);
            
            // Extract search results
            $('.result__body').each((index, element) => {
                if (index < 5) { // Limit to 5 results per phrase
                    const title = $(element).find('.result__title').text().trim();
                    const url = $(element).find('.result__url').text().trim();
                    const snippet = $(element).find('.result__snippet').text().trim();
                    
                    if (title && snippet && url) {
                        results.push({
                            title,
                            url,
                            snippet,
                            searchPhrase: phrase,
                            similarity: this.calculateSimilarity(phrase, snippet)
                        });
                    }
                }
            });

            return results;
        } catch (error) {
            console.error('Search error:', error.message);
            return [];
        }
    }

    calculateSimilarity(phrase, snippet) {
        // Simple similarity calculation
        const phraseWords = new Set(phrase.toLowerCase().split(/\W+/));
        const snippetWords = new Set(snippet.toLowerCase().split(/\W+/));
        
        const intersection = new Set([...phraseWords].filter(x => snippetWords.has(x)));
        return intersection.size / phraseWords.size;
    }
}

module.exports = new WebSearchService();