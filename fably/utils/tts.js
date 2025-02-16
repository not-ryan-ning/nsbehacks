let speech = null;
let currentUtterance = null;

const ELEVENLABS_API_KEY = process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY;
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB'; // Example voice ID

async function convertTextToSpeech(text) {
    // Always use browser speech if no API key
    if (!ELEVENLABS_API_KEY) {
        return browserSpeech(text);
    }

    try {
        const response = await fetch(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'xi-api-key': ELEVENLABS_API_KEY,
                },
                body: JSON.stringify({
                    text,
                    model_id: 'eleven_monolingual_v1',
                    voice_settings: {
                        stability: 0.5,
                        similarity_boost: 0.5,
                    },
                }),
            }
        );

        if (!response.ok) {
            throw new Error(`ElevenLabs API error: ${response.status}`);
        }

        const audioBlob = await response.blob();
        const audio = new Audio(URL.createObjectURL(audioBlob));

        return {
            play: () => audio.play(),
            pause: () => audio.pause(),
            resume: () => audio.play(),
            stop: () => {
                audio.pause();
                audio.currentTime = 0;
            }
        };
    } catch (error) {
        console.warn('ElevenLabs API failed, falling back to browser speech:', error);
        return browserSpeech(text);
    }
}

function browserSpeech(text) {
    return new Promise((resolve) => {
        const utterance = new SpeechSynthesisUtterance(text);
        currentUtterance = utterance;
        utterance.rate = 0.9;
        utterance.pitch = 1;
        utterance.volume = 1;

        // Try to use a good voice if available
        const voices = speechSynthesis.getVoices();
        const englishVoice = voices.find(voice =>
            voice.lang.startsWith('en') && voice.name.includes('Female'));
        if (englishVoice) {
            utterance.voice = englishVoice;
        }

        resolve({
            play: () => speechSynthesis.speak(utterance),
            pause: () => speechSynthesis.pause(),
            resume: () => speechSynthesis.resume(),
            stop: () => speechSynthesis.cancel()
        });
    });
}

export async function narrateStory(lines, voiceId, callbacks = {}) {
    try {
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i]?.text) continue;

            callbacks.onLineStart?.(i);
            speech = await convertTextToSpeech(lines[i].text);

            await new Promise((resolve, reject) => {
                if (currentUtterance) {
                    currentUtterance.onend = resolve;
                    currentUtterance.onerror = reject;
                }
                speech.play();
            });

            callbacks.onLineEnd?.(i);
        }
    } catch (error) {
        console.error('Narration error:', error);
        stopNarration();
        throw error;
    }
}

export function stopNarration() {
    if (speech) {
        speech.stop();
        speech = null;
    }
    speechSynthesis.cancel();
}

export function pauseNarration() {
    if (speech) {
        speech.pause();
    }
    speechSynthesis.pause();
}

export function resumeNarration() {
    if (speech) {
        speech.play();
    }
    speechSynthesis.resume();
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


