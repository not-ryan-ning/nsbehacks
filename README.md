# Fably

An interactive storytelling platform that preserves indigenous languages and cultures by using interactive fables and conversations to teach them to children, with the power of AI.

## Demo Video

<iframe 
    width="787" 
    height="556" 
    src="https://www.youtube.com/embed/ghpsJSNnOHU" 
    title="Fabley Hackathon Demo: AI-Powered Interactive Folklore Experience" 
    frameborder="0" 
    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
    referrerpolicy="strict-origin-when-cross-origin" 
    allowfullscreen>
</iframe>

## Why It Matters

With over 7,000 languages worldwide, but only a few actively taught, children in indigenous communities lack engaging language tools. As elders pass, cultural knowledge is lost forever. Unlike traditional language apps that rely on memorization through flashcards and drills, Fably recognizes that language is learned through real conversation and cultural context.

Indigenous languages thrive in oral traditions, not textbooks. Our AI speaks authentically, detects when a child loses focus, and adapts—rephrasing and simplifying vocabulary to keep them engaged. Fably doesn't just teach a language—it tells a story.

## Features

- Interactive storytelling with dynamic page transitions
- 3D avatar narrator using Three.js
- Real-time text-to-speech narration
- Multilingual support (Currently: Swahili, Chinese, English)
- Attention tracking with webcam
- Progress tracking and story state management
- AI-powered adaptive storytelling
- Real-time engagement monitoring and content adaptation

## Tech Stack

### Frontend
- Next.js 13
- React Three Fiber
- Azure Speech Services
- TailwindCSS
- WebGL
- TypeScript

### AI & Machine Learning
- Gemini AI models for context-aware storytelling
- Deep learning computer vision (OpenCV) for facial expression analysis
- LLMs for natural language processing
- Microsoft Azure Speech Services for narration
- Real-time engagement detection and content adaptation

## Technical Implementation

Our platform combines LLMs, deep learning, and computer vision at its core. We leverage:
- Gemini AI models for context-aware multilingual storytelling
- Deep learning CV model using OpenCV for real-time facial expression analysis
- React frontend TypeScript application for story hosting
- Backend service managing the deep learning model
- Microsoft Azure Speech integration for natural narration

## What We Accomplished

- Support for multiple languages (Swahili, Chinese, English)
- Real-time attention tracking and story adaptation
- Interactive 3D avatar narration
- Cultural context-aware storytelling
- Seamless multilingual transitions
- Engagement-based content modification
- Natural language learning through storytelling

## Future Plans
- Support for more indigenous languages (e.g., Aboriginal languages from Canada, Yoruba)
- Enhanced cultural context integration
- Expanded story library
- Improved adaptive learning algorithms

## Getting Started

1. Clone the repository
```bash
git clone https://github.com/Dannny-Babs/Fablely.git
```

2. Install dependencies
```bash
cd fablely
npm install
```

3. Run the development server
```bash
npm run dev
```

## Environment Variables

Create a `.env.local` file with:
```
AZURE_SUBSCRIPTION_KEY=your_key_here
AZURE_REGION=your_region_here
```

## Built With
- Computer Vision
- Deep Learning
- Gemini
- LLM
- Python
- React

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.
