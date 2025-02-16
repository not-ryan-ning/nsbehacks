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
                story_type: formData.mood
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error submitting reader data:', error);
        throw error;
    }
};
