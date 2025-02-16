import * as speechsdk from 'microsoft-cognitiveservices-speech-sdk';

let speech = null;
let currentSynthesizer = null;
let currentAudio = null;

const AZURE_SUBSCRIPTION_KEY = "1ykqY1MFFfa43S0vkdBx6ZMQVJHYWQcCQ3hpXLOK4Eqq0qvF8t58JQQJ99BBACYeBjFXJ3w3AAAYACOGHa3h";
const AZURE_REGION = "eastus";

async function convertTextToSpeech(text) {
    try {
        // Set up Azure Speech config
        const speechConfig = speechsdk.SpeechConfig.fromSubscription(
            AZURE_SUBSCRIPTION_KEY,
            AZURE_REGION
        );

        // Set Swahili voice
        speechConfig.speechSynthesisVoiceName = "sw-KE-RafikiNeural";

        // Create audio config for playing audio in browser
        const audioConfig = speechsdk.AudioConfig.fromDefaultSpeakerOutput();

        // Create the synthesizer
        const synthesizer = new speechsdk.SpeechSynthesizer(speechConfig, audioConfig);
        currentSynthesizer = synthesizer;

        return new Promise((resolve, reject) => {
            // Create audio element for controlling playback
            const audio = new Audio();
            currentAudio = audio;

            synthesizer.speakTextAsync(
                text,
                result => {
                    if (result) {
                        // Convert the audio data to a Blob
                        const blob = new Blob([result.audioData], { type: 'audio/wav' });
                        audio.src = URL.createObjectURL(blob);
                        
                        resolve({
                            play: () => audio.play(),
                            pause: () => audio.pause(),
                            resume: () => audio.play(),
                            stop: () => {
                                audio.pause();
                                audio.currentTime = 0;
                                synthesizer.close();
                            }
                        });
                    }
                },
                error => {
                    console.error('Speech synthesis error:', error);
                    synthesizer.close();
                    reject(error);
                }
            );
        });
    } catch (error) {
        console.error('Azure Speech Service error:', error);
        // Fall back to browser speech if Azure fails
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
            voice.lang.startsWith('en'));
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
        // Stop any existing narration before starting a new one
        stopNarration();
        
        for (let i = 0; i < lines.length; i++) {
            if (!lines[i]?.text) continue;

            callbacks.onLineStart?.(i);
            speech = await convertTextToSpeech(lines[i].text);

            await new Promise((resolve, reject) => {
                if (currentAudio) {
                    currentAudio.onended = resolve;
                    currentAudio.onerror = reject;
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
    if (currentSynthesizer) {
        currentSynthesizer.close();
        currentSynthesizer = null;
    }
    if (currentAudio) {
        currentAudio.pause();
        currentAudio.currentTime = 0;
        currentAudio = null;
    }
}

export function pauseNarration() {
    if (speech) {
        speech.pause();
    }
    if (currentAudio) {
        currentAudio.pause();
    }
}

export function resumeNarration() {
    if (speech) {
        speech.resume();
    }
    if (currentAudio) {
        currentAudio.play();
    }
}
