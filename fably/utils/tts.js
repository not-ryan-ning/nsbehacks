const ELEVEN_LABS_API_URL = 'https://api.elevenlabs.io/v1';
const DEFAULT_VOICE_ID = 'XUUzbXUrNRSPyhvz0zPi';

let currentAudio = null;
let isPlaying = false;

async function convertTextToSpeech(text, voiceId) {
    const apiKey = process.env.NEXT_PUBLIC_ELEVEN_LABS_API_KEY;
    if (!apiKey) {
        throw new Error('ElevenLabs API key is not configured');
    }

    try {
        const response = await fetch(
            `${ELEVEN_LABS_API_URL}/text-to-speech/${voiceId}`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': apiKey,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.statusText}`);
        }

        return await response.blob();
    } catch (error) {
        console.error('Error generating speech:', error);
        throw error;
    }
}

/**
 * Narrates a story by converting its lines to speech
 * @param {Array<{text: string, isTranslation: boolean}>} storyLines - Array of story lines
 * @param {string} voiceId - The ID of the voice to use
 * @param {Object} options - Options for narration
 * @param {number} options.pauseBetweenLines - Pause duration between lines in ms
 * @param {function} options.onLineStart - Callback when a line starts
 * @param {function} options.onLineEnd - Callback when a line ends
 */
export async function narrateStory(storyLines, voiceId = DEFAULT_VOICE_ID, options = {}) {
    const {
        pauseBetweenLines = 1000,
        onLineStart = () => { },
        onLineEnd = () => { }
    } = options;

    if (isPlaying) {
        stopNarration();
    }

    isPlaying = true;
    const mainLines = storyLines.filter(line => !line.isTranslation);

    for (let i = 0; i < mainLines.length; i++) {
        if (!isPlaying) break;

        try {
            onLineStart(i);
            // Use simple blob conversion instead of MediaSource
            const audioBlob = await convertTextToSpeech(mainLines[i].text, voiceId);
            currentAudio = new Audio(URL.createObjectURL(audioBlob));

            await new Promise((resolve, reject) => {
                currentAudio.onended = () => {
                    URL.revokeObjectURL(currentAudio.src); // Clean up
                    onLineEnd(i);
                    resolve();
                };
                currentAudio.onerror = reject;
                currentAudio.play();
            });

            if (i < mainLines.length - 1 && isPlaying) {
                await new Promise(resolve => setTimeout(resolve, pauseBetweenLines));
            }
        } catch (error) {
            console.error(`Error narrating line ${i}:`, error);
            throw error;
        }
    }

    isPlaying = false;
}

/**
 * Stops the current narration
 */
export function stopNarration() {
    isPlaying = false;
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }
}

/**
 * Pauses the current narration
 */
export function pauseNarration() {
    if (currentAudio) {
        currentAudio.pause();
    }
}

/**
 * Resumes the current narration
 */
export function resumeNarration() {
    if (currentAudio) {
        currentAudio.play();
    }
}

// Helper function to get available voices
export async function getAvailableVoices() {
    const apiKey = process.env.ELEVEN_LABS_API_KEY;

    try {
        const response = await fetch(
            `${ELEVEN_LABS_API_URL}/voices`,
            {
                headers: {
                    'xi-api-key': apiKey
                }
            }
        );

        if (!response.ok) {
            throw new Error(`Failed to fetch voices: ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error fetching voices:', error);
        throw error;
    }
}


