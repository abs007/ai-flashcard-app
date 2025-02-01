export const onRequest = async (context) => {
    const traceId = Math.random().toString(36).substring(7);
    // DEBUG-CHECKPOINT-1: Function entry
    console.log('DEBUG-CHECKPOINT-1: Function entry', {
        traceId,
        url: context.request.url,
        method: context.request.method
    });

    const corsHeaders = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, Accept, Origin, X-Requested-With",
        "Access-Control-Max-Age": "86400",
    };

    // Handle CORS preflight
    if (context.request.method === "OPTIONS") {
        // DEBUG-CHECKPOINT-2: CORS preflight
        console.log('DEBUG-CHECKPOINT-2: Handling OPTIONS request', { traceId });
        return new Response(null, {
            status: 204,
            headers: corsHeaders
        });
    }

    // Only handle POST requests
    if (context.request.method !== "POST") {
        // DEBUG-CHECKPOINT-3: Method not allowed
        console.log('DEBUG-CHECKPOINT-3: Invalid method', {
            traceId,
            method: context.request.method
        });
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
        // DEBUG-CHECKPOINT-4: Content type check
        console.log('DEBUG-CHECKPOINT-4: Checking content type', {
            traceId,
            contentType
        });

        if (!contentType || !contentType.includes('multipart/form-data')) {
            // DEBUG-CHECKPOINT-5: Invalid content type
            console.log('DEBUG-CHECKPOINT-5: Invalid content type', {
                traceId,
                contentType
            });
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

        // DEBUG-CHECKPOINT-6: Parsing form data
        console.log('DEBUG-CHECKPOINT-6: Attempting to parse form data', { traceId });
        const formData = await context.request.formData();
        const file = formData.get('file');

        if (!file) {
            // DEBUG-CHECKPOINT-7: No file found
            console.log('DEBUG-CHECKPOINT-7: No file in form data', {
                traceId,
                formDataKeys: Array.from(formData.keys())
            });
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

        // DEBUG-CHECKPOINT-8: File received
        console.log('DEBUG-CHECKPOINT-8: Processing file', {
            traceId,
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size
        });

        // Convert file to text
        const text = await file.text();
        // DEBUG-CHECKPOINT-9: File converted to text
        console.log('DEBUG-CHECKPOINT-9: File text extracted', {
            traceId,
            textLength: text.length
        });

        // DEBUG-CHECKPOINT-10: Calling Perplexity API
        console.log('DEBUG-CHECKPOINT-10: Calling AI API', { traceId });
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
            // DEBUG-CHECKPOINT-11: AI API error
            console.log('DEBUG-CHECKPOINT-11: AI API error', {
                traceId,
                status: response.status,
                statusText: response.statusText
            });
            throw new Error(`API request failed: ${response.statusText}`);
        }

        // DEBUG-CHECKPOINT-12: Processing AI response
        console.log('DEBUG-CHECKPOINT-12: Processing AI response', { traceId });
        const data = await response.json();
        const responseContent = data.choices[0].message.content.trim();

        // Clean up the response content
        const cleanedContent = responseContent
            .replace(/^```json\s*/, '')
            .replace(/\s*```$/, '')
            .trim();

        const flashcards = JSON.parse(cleanedContent);

        if (!Array.isArray(flashcards)) {
            // DEBUG-CHECKPOINT-13: Invalid flashcards format
            console.log('DEBUG-CHECKPOINT-13: Invalid flashcards format', { traceId });
            throw new Error('Response is not an array of flashcards');
        }

        // DEBUG-CHECKPOINT-14: Success
        console.log('DEBUG-CHECKPOINT-14: Returning flashcards', {
            traceId,
            count: flashcards.length
        });
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
        // DEBUG-CHECKPOINT-15: Error handling
        console.error('DEBUG-CHECKPOINT-15: Error caught', {
            traceId,
            error: error.message,
            stack: error.stack
        });
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