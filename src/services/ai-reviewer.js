import { GoogleGenerativeAI } from '@google/generative-ai';

class AIReviewer {
    constructor(apiKey) {
        this.genAI = new GoogleGenerativeAI(apiKey);
        this.model = this.genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    }

    async reviewCode(changes) {
        const reviews = [];
        
        for (const change of changes) {
            const prompt = this.buildReviewPrompt(change);
            try {
                const result = await this.model.generateContent({
                    contents: [{
                        role: "user",
                        parts: [{
                            text: prompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 1000,
                    },
                });

                const response = await result.response;
                reviews.push({
                    file: change.new_path,
                    review: response.text()
                });
            } catch (error) {
                console.error(`Error reviewing ${change.new_path}:`, error.message);
                reviews.push({
                    file: change.new_path,
                    review: "Error occurred during review."
                });
            }
        }

        return reviews;
    }

    buildReviewPrompt(change) {
        return `As a senior software engineer, please review the following code changes:

File: ${change.new_path}
Changes:
\`\`\`
${change.diff}
\`\`\`

Please provide a concise but thorough code review that covers:
1. Code quality and adherence to best practices
2. Potential bugs or edge cases
3. Performance optimizations
4. Readability and maintainability
5. Any security concerns
Suggest improvements and explain your reasoning for each suggestion.

Format your response in markdown with easy to understand and short.`;
    }
}

export default AIReviewer; 