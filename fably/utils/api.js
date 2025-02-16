const API_BASE_URL = 'http://127.0.0.1:8000';

export const submitReaderData = async (formData) => {
    try {
        const response = await fetch(`${API_BASE_URL}/readerdata`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                cultural_background: formData.culture,
                age_range: formData.listeners,
                story_length: formData.storyLength,
                story_type: formData.mood,
                language: formData.language,
                language_help: formData.languageHelp || false
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

export const generateStory = async () => {
    try {
        const response = await fetch(`${API_BASE_URL}/story`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error generating story:', error);
        throw new Error('Failed to generate story. Please try again.');
    }
};

export const getStoryPage = async (pageNumber) => {
    try {
        const response = await fetch(`${API_BASE_URL}/next-page/${pageNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        if (data.paused) {
            return {
                paused: true,
                currentLine: data.current_line,
                message: data.message
            };
        }

        return processStoryData(data);
    } catch (error) {
        console.error('Error fetching story page:', error);
        throw new Error('Failed to fetch story page. Please try again.');
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
