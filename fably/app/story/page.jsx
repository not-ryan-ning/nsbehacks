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
    const [backgroundImage, setBackgroundImage] = useState('/placeholder-bg.jpg');

    useEffect(() => {
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
            <div className="lg:w-2/3 p-6 relative min-h-[60vh] lg:min-h-screen">
                <div 
                    className="h-full rounded-2xl p-8 flex flex-col relative overflow-hidden"
                    style={{
                        backgroundImage: `url(${backgroundImage})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center'
                    }}
                >
                    <div className="bg-black bg-opacity-50 rounded-xl p-6 flex-1">
                        <h1 className="text-3xl font-bold text-white mb-4">The Magic Forest</h1>
                        <div className="text-white text-lg mb-8">
                            Once upon a time in a distant land...
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="absolute bottom-24 left-8 right-8">
                            <div className="w-full bg-gray-200 rounded-full h-2.5">
                                <div 
                                    className="bg-blue-500 h-2.5 rounded-full transition-all duration-500"
                                    style={{ width: `${progress}%` }}
                                ></div>
                            </div>
                            <p className="text-white mt-2">{progress}% Complete</p>
                        </div>

                        {/* Control Buttons */}
                        <div className="absolute bottom-8 left-8 right-8 flex justify-between">
                            <button className="px-6 py-3 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-lg text-white transition">
                                Switch Language
                            </button>
                            <button 
                                onClick={handleNextPage}
                                className="px-6 py-3 bg-blue-500 hover:bg-blue-600 rounded-lg text-white transition"
                            >
                                Next Page
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Panel */}
            <div className="lg:w-1/3 p-6 bg-slate-900">
                <div className="h-full rounded-2xl p-8 flex flex-col items-center justify-center">
                    {/* Avatar Placeholder */}
                    <div className="w-48 h-48 rounded-full bg-gray-700 mb-8">
                        <Image 
                            src="/placeholder-avatar.png"
                            alt="Avatar"
                            width={192}
                            height={192}
                            className="rounded-full"
                        />
                    </div>

                    {/* Sign Language Toggle */}
                    <div className="flex items-center space-x-3">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox"
                                className="sr-only peer"
                                checked={signLanguageMode}
                                onChange={e => setSignLanguageMode(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer 
                                          peer-checked:after:translate-x-full peer-checked:after:border-white 
                                          after:content-[''] after:absolute after:top-[2px] after:left-[2px] 
                                          after:bg-white after:rounded-full after:h-5 after:w-5 
                                          after:transition-all peer-checked:bg-blue-500">
                            </div>
                        </label>
                        <span className="text-white">Enable Sign Language Mode</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
