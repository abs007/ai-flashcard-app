import pdfParse from 'pdf-parse';
import { AIProcessingResult } from '../types';

interface AIGeneratedFlashcard {
    question: string;
    answer: string;
    difficulty: 'easy' | 'medium' | 'hard';
}

interface PerplexityResponse {
    choices: Array<{
        message: {
            content: string;
        };
    }>;
}

class AIService {
    private apiKey: string;
    private baseUrl = 'https://api.perplexity.ai';
    private timeout = 30000; // 30 seconds timeout

    constructor() {
        const apiKey = process.env.PERPLEXITY_API_KEY?.trim();
        if (!apiKey) {
            throw new Error('PERPLEXITY_API_KEY environment variable is missing');
        }
        // Remove any quotes that might be in the environment variable
        this.apiKey = apiKey.replace(/^["']|["']$/g, '');
    }

    async extractTextFromPDF(pdfBuffer: Buffer): Promise<string> {
        try {
            const data = await pdfParse(pdfBuffer);
            return data.text;
        } catch (error) {
            throw new Error('Failed to extract text from PDF');
        }
    }

    async generateFlashcards(text: string): Promise<AIProcessingResult> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        try {
            const response = await fetch(`${this.baseUrl}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "sonar",
                    messages: [
                        {
                            role: "system",
                            content: "You are an expert at creating educational flashcards. You must respond with ONLY a JSON array of flashcard objects. Each flashcard object must have exactly these fields: 'question' (string), 'answer' (string), and 'difficulty' (string, one of: 'easy', 'medium', 'hard'). Do not include any other text in your response."
                        },
                        {
                            role: "user",
                            content: `Create flashcards from this text: ${text}`
                        }
                    ]
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errorData = await response.text();
                throw new Error(`API request failed: ${response.statusText}. ${errorData}`);
            }

            const data = await response.json() as PerplexityResponse;
            const responseContent = data.choices[0].message.content.trim();

            try {
                // Clean up the response content by removing markdown code block syntax
                const cleanedContent = responseContent
                    .replace(/^```json\s*/, '')  // Remove opening ```json
                    .replace(/\s*```$/, '')      // Remove closing ```
                    .trim();

                const flashcards = JSON.parse(cleanedContent) as AIGeneratedFlashcard[];

                if (!Array.isArray(flashcards)) {
                    throw new Error('Response is not an array of flashcards');
                }

                return {
                    success: true,
                    flashcards: flashcards.map(card => ({
                        ...card,
                        correctCount: 0,
                        incorrectCount: 0,
                        tags: [],
                        sourceDocument: 'PDF Upload'
                    }))
                };
            } catch (parseError) {
                console.error('Failed to parse AI response:', responseContent);
                throw new Error('Invalid response format from AI service');
            }
        } catch (error: any) {
            clearTimeout(timeoutId);

            if (error.name === 'AbortError') {
                return {
                    success: false,
                    flashcards: [],
                    error: 'Request timed out. Please try again.'
                };
            }

            console.error('AI Processing Error:', error);
            return {
                success: false,
                flashcards: [],
                error: error instanceof Error ? error.message : 'Failed to generate flashcards'
            };
        }
    }
}

export const aiService = new AIService(); 