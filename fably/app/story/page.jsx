'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';

// Mock function to simulate AI image generation
const generateBackgroundImage = async () => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    return '/placeholder-bg.jpg'; // Replace with actual API call
};

export default function StoryPage() {
    const [progress, setProgress] = useState(0);
    const [signLanguageMode, setSignLanguageMode] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState('/story.png');
    const [storyData, setStoryData] = useState(null);

    useEffect(() => {
        // Load story data from localStorage
        const savedStoryData = localStorage.getItem('storyData');
        if (savedStoryData) {
            setStoryData(JSON.parse(savedStoryData));
        }
        
        const loadBackground = async () => {
            const imageUrl = await generateBackgroundImage();
            setBackgroundImage(imageUrl);
        };
        loadBackground();
    }, []);

    const handleNextPage = () => {
        setProgress(prev => Math.min(prev + 20, 100));
    };

    return (
        <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
            {/* Left Panel */}
            <div className="lg:w-2/3 p-4 lg:p-6 relative min-h-[60vh] lg:min-h-screen">
                <div 
                    className="h-full rounded-2xl flex flex-col relative overflow-hidden transition-all duration-500 ease-in-out"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    {/* Backdrop overlay with blur */}
                    <div className="absolute inset-0 backdrop-blur-sm bg-black/10"></div>

                    {/* Content container with glass effect */}
                    <div className="relative z-10 h-full flex flex-col p-6 lg:p-8">
                        <div className=" backdrop-blur-md bg-cover bg-no-repeat bg-center  rounded-xl p-6 lg:p-8 flex-1 border border-white/10"    style={{ backgroundImage: 'url("/story.png")' }}>
                            <h1 className="text-4xl font-bold text-white mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                                The Magic Forest
                            </h1>
                            <div className="prose prose-lg prose-invert">
                                <p className="text-white/90 text-lg leading-relaxed mb-8">
                                    {storyData?.story_content || 'Loading your story...'}
                                </p>
                            </div>
                        </div>

                        {/* Progress Bar with improved styling */}
                        <div className="mt-6 relative z-20">
                            <div className="w-full bg-white/10 backdrop-blur-md rounded-full h-3 p-[2px]">
                                <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                                    style={{ width: `${progress}%` }}
                                >
                                </div>
                            </div>
                            <p className="text-white/80 mt-2 text-sm font-medium">{progress}% Complete</p>
                        </div>

                        {/* Control Buttons with improved styling */}
                        <div className="mt-6 flex justify-between gap-4">
                            <button className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium">
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v4m1 12v-4m-9-1v-4m4 4h12" />
                                    </svg>
                                    Switch Language
                                </span>
                            </button>
                            <button 
                                onClick={handleNextPage}
                                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium"
                            >
                                <span className="flex items-center justify-center gap-2">
                                    Next Page
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="lg:w-1/3 p-4 lg:p-6 bg-slate-900/50 backdrop-blur-lg">
                <div className="h-full rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center bg-slate-800/50 border border-white/10">
                    {/* Avatar with improved container */}
                    <div className="relative w-48 h-48 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 p-1">
                        <div className="absolute inset-0 rounded-full bg-slate-950/80 backdrop-blur-sm"></div>
                        <Image 
                            src="/placeholder-avatar.png"
                            alt="Avatar"
                            width={192}
                            height={192}
                            className="rounded-full relative z-10"
                        />
                    </div>

                    {/* Sign Language Toggle with improved styling */}
                    <div className="mt-8 flex items-center space-x-4 bg-slate-900/50 p-4 rounded-xl backdrop-blur-sm">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox"
                                className="sr-only peer"
                                checked={signLanguageMode}
                                onChange={e => setSignLanguageMode(e.target.checked)}
                            />
                            <div className="w-14 h-7 bg-slate-700 peer-focus:ring-4 peer-focus:ring-blue-500/30 rounded-full peer peer-checked:after:translate-x-full peer-checked:bg-gradient-to-r peer-checked:from-blue-500 peer-checked:to-purple-500 after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all">
                            </div>
                        </label>
                        <span className="text-white font-medium">Enable Sign Language Mode</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
