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



