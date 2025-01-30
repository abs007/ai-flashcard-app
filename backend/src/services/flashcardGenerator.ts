import { OpenAI } from 'openai';

interface Flashcard {
    question: string;
    answer: string;
    difficulty: number;
}

export async function generateFlashcards(
    text: string,
    openai: OpenAI
): Promise<Flashcard[]> {
    try {
        // Split text into chunks if it's too long
        const chunks = splitTextIntoChunks(text, 2000);
        const allFlashcards: Flashcard[] = [];

        for (const chunk of chunks) {
            const response = await openai.chat.completions.create({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `You are a helpful AI that creates educational flashcards. Create 5 flashcards from the following text. 
            Each flashcard should have a question, answer, and difficulty level (1-5, where 1 is easiest).
            Focus on key concepts and important details. Format your response as a JSON array of objects with the following structure:
            [{"question": "...", "answer": "...", "difficulty": number}]`,
                    },
                    {
                        role: 'user',
                        content: chunk,
                    },
                ],
                temperature: 0.7,
                max_tokens: 1000,
            });

            const content = response.choices[0]?.message?.content;
            if (content) {
                try {
                    const flashcards: Flashcard[] = JSON.parse(content);
                    allFlashcards.push(...flashcards);
                } catch (error) {
                    console.error('Error parsing OpenAI response:', error);
                }
            }
        }

        return allFlashcards;
    } catch (error) {
        console.error('Error generating flashcards:', error);
        throw error;
    }
}

function splitTextIntoChunks(text: string, maxChunkSize: number): string[] {
    const words = text.split(' ');
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentSize = 0;

    for (const word of words) {
        if (currentSize + word.length + 1 <= maxChunkSize) {
            currentChunk.push(word);
            currentSize += word.length + 1;
        } else {
            chunks.push(currentChunk.join(' '));
            currentChunk = [word];
            currentSize = word.length;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join(' '));
    }

    return chunks;
} 