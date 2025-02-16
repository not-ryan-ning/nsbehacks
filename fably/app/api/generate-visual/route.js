import { visualDescriptionPrompt } from '@/utils/prompts';

export async function POST(request) {
    try {
        const { text } = await request.json();

        if (!text) {
            return Response.json({ error: 'Text is required' }, { status: 400 });
        }

        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
            },
            body: JSON.stringify({
                model: "gpt-4o",
                ...visualDescriptionPrompt(text)
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error?.message || 'Failed to generate visual description');
        }

        const data = await response.json();
        const visual = data.choices[0].message.content.trim();

        return Response.json({ visual });
    } catch (error) {
        console.error('Visual generation error:', error);
        return Response.json({
            error: 'Failed to generate visual description',
            details: error.message
        }, { status: 500 });
    }
}
