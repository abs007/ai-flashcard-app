exports.handler = async (event, context) => {
    // Handle CORS
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers: {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                'Access-Control-Allow-Methods': 'POST, OPTIONS'
            }
        };
    }

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({
                error: 'Method not allowed'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }

    try {
        const data = JSON.parse(event.body);
        const fileContent = data.fileContent;

        if (!fileContent) {
            return {
                statusCode: 400,
                body: JSON.stringify({
                    error: 'No file content provided'
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                }
            };
        }

        // Call Perplexity API
        const response = await fetch('https://api.perplexity.ai/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.PERPLEXITY_API_KEY}`
            },
            body: JSON.stringify({
                model: 'sonar',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert at creating educational flashcards. You must respond with ONLY a JSON array of flashcard objects. Each flashcard object must have exactly these fields: "question" (string), "answer" (string), and "difficulty" (string, one of: "easy", "medium", "hard"). Do not include any other text in your response.'
                    },
                    {
                        role: 'user',
                        content: `Create flashcards from this text: ${fileContent}`
                    }
                ]
            })
        });

        if (!response.ok) {
            throw new Error(`API request failed: ${response.statusText}`);
        }

        const aiResponse = await response.json();
        const flashcards = JSON.parse(
            aiResponse.choices[0].message.content.trim()
                .replace(/^```json\s*/, '')
                .replace(/\s*```$/, '')
                .trim()
        );

        if (!Array.isArray(flashcards)) {
            throw new Error('Invalid flashcards format');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({
                success: true,
                flashcards: flashcards
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };

    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({
                error: error.message || 'Failed to process document'
            }),
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            }
        };
    }
}; 