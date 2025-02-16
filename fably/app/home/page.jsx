'use client';
import { useState, useEffect } from "react";
import Image from "next/image";
import GameButton from "@/components/button";
import LoadingScreen from "@/components/LoadingScreen";
import { useRouter } from "next/navigation"; // Change this line
import { submitReaderData } from "@/utils/api";
import { useToast } from "@/components/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { ToastAction } from "@/components/ui/toast"


export default function Home() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const [formData, setFormData] = useState({
        culture: '',
        language: '',
        theme: '',
        storyLength: '',
        listeners: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        try {
            const response = await submitReaderData(formData);
            console.log('API Response:', response);
            
            // Store the response data in localStorage or state management
            localStorage.setItem('storyData', JSON.stringify(response));
            
            // Navigate to story page
            router.push('/story');
        } catch (error) {
            console.error('Failed to submit form:', error);
            // Handle error (show error message to user)
            toast({
                variant: "destructive",
                title: "Uh oh! Something went wrong.",
                description: "There was a problem with your request.",
                action: (
                    <Button variant="outline" size="sm" className = "text-slate-800" onClick={() => handleSubmit(e)}>
                        Try again
                    </Button>
                ),
            });
           
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [id]: value
        }));
    };

    if (!isMounted) {
        return null; // or a loading spinner
    }

    return (
        <div className="grid lg:grid-cols-5 min-h-screen bg-slate-950">
            {isLoading && <LoadingScreen />}
            {/* Left column: image and text */}
            <div
                className="relative bg-cover col-span-2 bg-center overflow-hidden m-3 rounded-md"
                style={{ backgroundImage: 'url("/bg.png")' }}
            >
                <div className="pt-24 rounded-md bg-opacity-50 flex flex-col items-center justify-center p-4">
                    <h1 className="text-white text-3xl md:text-5xl font-medium tracking-tighter">Fabley</h1>
                    <p className="text-white mt-4 text-sm md:text-base text-center max-w-md">
                        Embark on a magical journey through stories rooted in ancient cultures and modern imagination.
                    </p>
                </div>
            </div>

            {/* Right column: centered form */}
            <div className="flex items-center justify-center col-span-3 ">
                <form onSubmit={handleSubmit} className="w-full max-w-md space-y-6 ">
                    <div className="">
                        <h1 className="text-2xl font-semibold text-white">Customize Your Folklore Adventure</h1>
                        <p className="text-sm text-gray-300">
                            Help us craft a tale that resonates with you. Choose your cultural background, mood, and other details below.
                        </p>
                    </div>
                    <div>
                        <label htmlFor="culture" className="block text-sm font-medium text-gray-300">
                            Cultural Background
                        </label>
                        <select
                            id="culture"
                            value={formData.culture}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border rounded bg-slate-800 text-white border-slate-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select Your Culture</option>
                            <option value="african">African</option>
                            <option value="asian">Asian</option>
                            <option value="european">European</option>
                            <option value="latin-american">Latin American</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="language" className="block text-sm font-medium text-gray-300">
                            Language
                        </label>
                        <select
                            id="language"
                            value={formData.language}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border rounded bg-slate-800 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select Language</option>
                            <option value="english">English</option>
                            <option value="swahili">Swahili</option>
                            <option value="chinese">Chinese</option>
                            <option value="french">French</option>
                            <option value="portuguese">Portuguese</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="mood" className="block text-sm font-medium text-gray-300">
                            Theme
                        </label>
                        <select
                            id="mood"
                            value={formData.mood}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border rounded bg-slate-800 border-slate-600 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Choose the Vibe</option>
                            <option value="adventurous">Adventurous</option>
                            <option value="mysterious">Mysterious</option>
                            <option value="uplifting">Uplifting</option>
                            <option value="funny">Funny</option>
                            <option value="whimsical">Educational</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="storyLength" className="block text-sm font-medium text-gray-300">
                            Story Length
                        </label>
                        <select
                            id="storyLength"
                            value={formData.storyLength}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border rounded  border-slate-600 bg-slate-800 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">Select Length</option>
                            <option value="short">Short</option>
                            <option value="medium">Medium</option>
                            <option value="long">Long</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="listeners" className="block text-sm font-medium text-gray-300">
                            Who’s Listening?
                        </label>
                        <select
                            id="listeners"
                            value={formData.listeners}
                            onChange={handleChange}
                            className="mt-1 block w-full p-3 border rounded bg-slate-800 text-white focus:ring-2  border-slate-600 focus:ring-blue-500 focus:border-blue-500"
                            required
                        >
                            <option value="">
                                Select Your Audience
                            </option>
                            <option value="child">Child</option>
                            <option value="child">Teen</option>
                            <option value="adult">Adult</option>
                        </select>
                    </div>
                    <GameButton type="submit" variant="large" onClick={
                        handleSubmit
                    }  >Generate my Story</GameButton>
                   

                </form>
            </div>
        </div>
    );
}
