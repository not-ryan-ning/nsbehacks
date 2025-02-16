// utils/fetchBackground.js
export async function fetchBackgroundImage() {
    try {
      // Replace this URL with your actual AI API endpoint
      const response = await fetch('https://api.example.com/generate-image');
      const data = await response.json();
      // Assume the response contains an "imageUrl" field
      return data.imageUrl;
    } catch (error) {
      console.error('Error fetching background image:', error);
      // Return a fallback image URL
      return '/story.png';
    }
  }
  