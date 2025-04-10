import azure.cognitiveservices.speech as speechsdk

# Set up Azure Speech config
speech_config = speechsdk.SpeechConfig(
    subscription= "API KEY",
    region="eastus"
)

# Choose Swahili voice
speech_config.speech_synthesis_voice_name = "sw-KE-RafikiNeural"

# Create a speech synthesizer (default plays audio)
synthesizer = speechsdk.SpeechSynthesizer(speech_config=speech_config)

# Speak the text directly
text = "Habari, hadithi inaanza hivi..."
synthesizer.speak_text_async(text).get()

print("Swahili speech played!")
