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
    // Use mock data instead of API call
    return MOCK_PAGES[page - 1] || MOCK_PAGES[0];
};

// Remove other unused functions



