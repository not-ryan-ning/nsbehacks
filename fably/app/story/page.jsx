"use client";
import { useState, useEffect } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getStoryPage } from "../../utils/api";

export default function StoryPage() {
  const [progress, setProgress] = useState(0);
  const [storyData, setStoryData] = useState({
    lines: [],
    currentPage: 1,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [showTranslation, setShowTranslation] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("/story.png");

  const loadStoryPage = async (page) => {
    setLoading(true);
    try {
      const data = await getStoryPage(page);
      setStoryData({
        lines: data.lines,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
      });
      setProgress((data.currentPage / data.totalPages) * 100);
      setError(null);
    } catch (error) {
      console.error("Failed to load story:", error);
      toast({
        title: "Error",
        description: "Using fallback content",
        variant: "destructive",
      });
      setError("Unable to load story page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadBackground = async () => {
      const imageUrl = await generateBackgroundImage();
      setBackgroundImage(imageUrl);
    };
    loadBackground();
  }, []);

  const toggleLanguage = () => {
    setShowTranslation(!showTranslation);
    toast({
      title: showTranslation ? "English Only" : "English & Twi",
      description: showTranslation
        ? "Showing English text only"
        : "Showing both English and Twi translations",
    });
  };

  useEffect(() => {
    loadStoryPage(1);
  }, []);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Loading story...
      </div>
    );
  if (error)
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Error: {error}
      </div>
    );

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-950">
      <div className="lg:w-2/3 p-4 lg:p-6 relative min-h-[60vh] lg:min-h-screen">
        <div
          className="h-full rounded-2xl flex flex-col relative overflow-hidden transition-all duration-500 ease-in-out"
          style={{
            backgroundImage: backgroundImage
              ? `url(${backgroundImage})`
              : "none",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 backdrop-blur-sm bg-black/10" />

          <div className="relative z-10 h-full flex flex-col p-6 lg:p-8">
            <div className="backdrop-blur-md rounded-xl p-6 lg:p-8 flex-1 border border-white/10">
              <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-gameButton-primary">
                Interactive Story
              </h1>

              <div className="prose prose-lg prose-invert space-y-4">
                {storyData.lines
                  .filter((line) => showTranslation || !line.isTranslation)
                  .map((line, index) => (
                    <p
                      key={index}
                      className={`text-white/90 text-6xl font-semibold leading-relaxed ${
                        line.isTranslation ? "italic text-blue-400" : ""
                      }`}
                    >
                      {line.text}
                    </p>
                  ))}
              </div>
            </div>

            {/* Progress indicator */}
            <div className="mt-6 relative z-20">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white/80 text-sm">
                  Page {storyData.currentPage} of {storyData.totalPages}
                </span>
                <span className="text-white/80 text-sm">
                  {progress.toFixed(0)}% Complete
                </span>
              </div>
              <div className="w-full bg-white/10 backdrop-blur-md rounded-full h-3 p-[2px]">
                <div
                  className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between gap-4">
              <button
                onClick={toggleLanguage}
                className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  {showTranslation ? "Hide Twi" : "Show Twi"}
                </span>
              </button>
              <button
                onClick={() =>
                  storyData.hasNext && loadStoryPage(storyData.currentPage + 1)
                }
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium"
              >
                <span className="flex items-center justify-center gap-2">
                  Next Page
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Avatar panel */}
      <div className="lg:w-1/3 p-4 lg:p-6 bg-slate-900/50 backdrop-blur-lg">
        <div className="h-full rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center bg-slate-800/50 border border-white/10">
          <div className="w-full h-[300px] flex items-center justify-center text-white/70">
            Avatar placeholder
          </div>
        </div>
      </div>
    </div>
  );
}
