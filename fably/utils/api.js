import { MOCK_STORY, MOCK_PAGES } from './mockData';

const API_BASE_URL = 'http://127.0.0.1:8000';

export const submitReaderData = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/readerdata`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            // Remove credentials and CORS mode
            body: JSON.stringify({
                cultural_background: formData.culture,
                age_range: formData.listeners,
                story_length: formData.storyLength,
                story_type: formData.mood,
                language: formData.language
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error submitting reader data:', error);
        throw new Error('Failed to connect to the server. Please check your connection and try again.');
    }
};

// Validate API response format
const validateStoryData = (data) => {
    if (!data || typeof data !== 'object') throw new Error('Invalid response format');
    if (!Array.isArray(data.lines)) throw new Error('Missing lines array');
    if (typeof data.page !== 'number') throw new Error('Invalid page number');
    if (typeof data.total_pages !== 'number') throw new Error('Invalid total pages');
    return true;
};

export const getStoryPage = async (page = 1) => {
    try {
        const response = await fetch(`${API_BASE_URL}/story?page=${page}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*',
            },
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Validate response
        validateStoryData(data);

        return processStoryData(data);
    } catch (error) {
        console.error('Error fetching story page:', error);
        throw error;
    }
};


const processStoryData = (data) => ({
    lines: data.lines.map(line => ({
        text: line.replace(/[()]/g, '').trim(),
        isTranslation: line.startsWith('(')
    })),
    currentPage: data.page,
    totalPages: data.total_pages,
    hasNext: data.has_next,
    hasPrevious: data.has_previous
});

export async function fetchVisualCues(lines) {
    const prompt = `Analyze the following story lines and provide a concise description for a background illustration that captures the mood and setting of the scene:
    
  ${lines.join("\n")}
  
  Visual cue description:`;

    try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
            },
            body: JSON.stringify({
            model: "gpt-4o-mini",
            store: true,
            messages: [
                { role: "user", content: prompt }
            ]
            }),
        });

        const data = await response.json();
        console.log("OpenAI response:", data);

        if (!data.choices || data.choices.length === 0) {
            throw new Error("No choices returned from OpenAI");
        }

        return data.choices[0].text.trim();
    } catch (error) {
        console.error("Error fetching visual cues from OpenAI:", error);
        return "A serene landscape with magical lighting";
    }
}

console.log(fetchVisualCues(MOCK_STORY.lines));


export async function generateBackgroundImage(prompt) {
    const PROJECT_ID = process.env.NEXT_PUBLIC_PROJECT_ID; // Your Google Cloud project ID
    const accessToken = process.env.NEXT_PUBLIC_VERTEX_AI_TOKEN; // Access token from gcloud auth
    const endpoint = `https://us-central1-aiplatform.googleapis.com/v1/projects/${PROJECT_ID}/locations/us-central1/publishers/google/models/imagen-3.0-generate-002:predict`;

    try {
        const response = await fetch(endpoint, {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=utf-8",
                // Make sure to secure your access token
                Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({
                instances: [{ prompt }],
                parameters: { sampleCount: 1 }, // Generate one image
            }),
        });
        const data = await response.json();
        if (data.predictions && data.predictions.length > 0) {
            const base64Image = data.predictions[0].bytesBase64Encoded;
            // Return a data URL for the PNG image
            return `data:image/png;base64,${base64Image}`;
        }
        throw new Error("No predictions returned from Vertex AI");
    } catch (error) {
        console.error("Error generating background image:", error);
        // Fallback to a default background image URL
        return "/story.jpg";
    }
}



