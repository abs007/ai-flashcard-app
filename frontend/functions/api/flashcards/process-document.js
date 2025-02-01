export const onRequest = async (context) => {
    const traceId = Math.random().toString(36).substring(7);
    console.log(`[${traceId}] Function entry - onRequest`);
    console.log(`[${traceId}] Request URL:`, context.request.url);
    console.log(`[${traceId}] Request method:`, context.request.method);
    console.log(`[${traceId}] Request headers:`, Object.fromEntries(context.request.headers.entries()));

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
        "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight
    if (context.request.method === "OPTIONS") {
        console.log(`[${traceId}] Handling OPTIONS preflight request`);
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    // Only handle POST requests
    if (context.request.method !== "POST") {
        console.log(`[${traceId}] Method not allowed:`, context.request.method);
        return new Response(JSON.stringify({
            error: "Method not allowed",
            method: context.request.method,
            allowedMethods: ["POST", "OPTIONS"],
            traceId
        }), {
            status: 405,
            headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
                "Allow": "POST, OPTIONS"
            }
        });
    }

    try {
        const contentType = context.request.headers.get('content-type');
        console.log(`[${traceId}] Content-Type:`, contentType);

        if (!contentType || !contentType.includes('multipart/form-data')) {
            console.log(`[${traceId}] Invalid Content-Type:`, contentType);
            return new Response(JSON.stringify({
                success: false,
                error: 'Content-Type must be multipart/form-data',
                receivedContentType: contentType,
                traceId
            }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        }

        console.log(`[${traceId}] Attempting to parse form data`);
        const formData = await context.request.formData();
        const file = formData.get('file');

        if (!file) {
            console.log(`[${traceId}] No file found in form data`);
            console.log(`[${traceId}] Form data keys:`, Array.from(formData.keys()));
            return new Response(JSON.stringify({
                success: false,
                error: 'No file uploaded',
                formDataKeys: Array.from(formData.keys()),
                traceId
            }), {
                status: 400,
                headers: {
                    ...corsHeaders,
                    'Content-Type': 'application/json',
                },
            });
        }

        console.log(`[${traceId}] File received:`, {
            name: file.name,
            type: file.type,
            size: file.size
        });

        // Convert file to text
        const text = await file.text();
        console.log(`[${traceId}] File text length:`, text.length);

        // Call Perplexity API
        console.log(`[${traceId}] Calling Perplexity API`);
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
            console.log(`[${traceId}] Perplexity API error:`, response.status, response.statusText);
            throw new Error(`API request failed: ${response.statusText}`);
        }

        console.log(`[${traceId}] Processing API response`);
        const data = await response.json();
        const responseContent = data.choices[0].message.content.trim();

        // Clean up the response content
        const cleanedContent = responseContent
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '')
            .trim();

        const flashcards = JSON.parse(cleanedContent);

        if (!Array.isArray(flashcards)) {
            console.log(`[${traceId}] Invalid flashcards format`);
            throw new Error('Response is not an array of flashcards');
        }

        console.log(`[${traceId}] Returning flashcards:`, flashcards.length);
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
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        });

    } catch (error) {
        console.error(`[${traceId}] Error processing request:`, error);
        console.error(`[${traceId}] Stack trace:`, error.stack);
        return new Response(JSON.stringify({
            success: false,
            error: error.message || 'Failed to process document',
            details: error.stack,
            traceId
        }), {
            status: 500,
            headers: {
                ...corsHeaders,
                'Content-Type': 'application/json',
            },
        });
    }
};

export default {
    onRequest
}; 