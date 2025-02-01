export const onRequest = async (context) => {
    // Handle CORS preflight
    if (context.request.method === "OPTIONS") {
        return new Response(null, {
            status: 204,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type",
                "Access-Control-Max-Age": "86400",
            },
        });
    }

    // Only handle POST requests
    if (context.request.method !== "POST") {
        return new Response("Method not allowed", {
            status: 405,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Allow": "POST, OPTIONS"
            }
        });
    }

    try {
        const formData = await context.request.formData();
        const file = formData.get('file');

        if (!file) {
            return new Response(JSON.stringify({
                success: false,
                error: 'No file uploaded'
            }), {
                status: 400,
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*',
                },
            });
        }

        // Convert file to text
        const text = await file.text();

        // Call Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${context.env.PERPLEXITY_API_KEY}`,
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at creating educational flashcards. You must respond with ONLY a JSON array of flashcard objects. Each flashcard object must have exactly these fields: "question" (string), "answer" (string), and "difficulty" (string, one of: "easy", "medium", "hard"). Do not include any other text in your response.',
                    },
                    {
                        role: 'user',
                        content: `Create flashcards from this text: ${text}`,
                    },
                ],
            }),
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const data = await response.json();
        const responseContent = data.choices[0].message.content.trim();

        // Clean up the response content
        const cleanedContent = responseContent
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '')
            .trim();

        const flashcards = JSON.parse(cleanedContent);

        if (!Array.isArray(flashcards)) {
            throw new Error('Response is not an array of flashcards');
        }

        return new Response(JSON.stringify({
            success: true,
            flashcards: flashcards.map(card => ({
                ...card,
                correctCount: 0,
                incorrectCount: 0,
                tags: [],
                sourceDocument: 'PDF Upload',
            })),
        }), {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

    } catch (error) {
        console.error('Error processing request:', error);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to process document',
        }), {
            status: 500,
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });
    }
};

export default {
    onRequest
}; 