"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import {
  narrateStory,
  stopNarration,
  pauseNarration,
  resumeNarration,
} from "../../utils/tts";
import { useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getStoryPage, generateStory } from "../../utils/api";
import WebcamCapture from "../../utils/webcam";

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function StoryPage() {
  const [progress, setProgress] = useState(0);
  const [storyData, setStoryData] = useState({
    lines: [],
    currentPage: 0,
    totalPages: 1,
    hasNext: false,
    hasPrevious: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { toast } = useToast();
  const [showTranslation, setShowTranslation] = useState(true);
  const [backgroundImage, setBackgroundImage] = useState("/story.png");
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [attentionStatus, setAttentionStatus] = useState({
    isAttentive: true,
    timeWithoutFace: 0
  });

  const initializeStory = async () => {
    setLoading(true);
    try {
      const data = await generateStory();
      if (data.message === "Story generated successfully") {
        loadStoryPage(0);
      } else {
        setError("Failed to generate story");
        toast({
          title: "Error",
          description: "Failed to generate story",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to initialize story:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStoryPage = async (page) => {
    setLoading(true);
    try {
      const data = await getStoryPage(page);
      
      if (data.paused) {
        setIsPaused(true);
        pauseNarration();
        toast({
          title: "Story Paused",
          description: data.message,
          variant: "warning",
        });
        return;
      }

      setStoryData({
        lines: data.lines,
        currentPage: data.currentPage,
        totalPages: data.totalPages,
        hasNext: data.hasNext,
        hasPrevious: data.hasPrevious,
      });
      setProgress((data.currentPage / data.totalPages) * 100);
      setError(null);
      setIsPaused(false);
    } catch (error) {
      console.error("Failed to load story:", error);
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setError("Unable to load story page");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setBackgroundImage("/story.png"); // Use static background image
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

  const handleNarration = async () => {
    if (isNarrating) {
      stopNarration();
      setIsNarrating(false);
      setIsPaused(false);
      return;
    }

    setIsNarrating(true);
    try {
      const linesToNarrate = storyData.lines.filter(
        (line) => !line.isTranslation || showTranslation
      );

      if (linesToNarrate.length === 0) {
        throw new Error("No text to narrate");
      }

      await narrateStory(linesToNarrate, undefined, {
        onLineStart: (index) => {
          // Highlight the current line
          const element = document.querySelector(`p[data-index="${index}"]`);
          if (element) {
            element.classList.add("reading");
          }
        },
        onLineEnd: (index) => {
          // Remove highlight
          const element = document.querySelector(`p[data-index="${index}"]`);
          if (element) {
            element.classList.remove("reading");
          }
        },
      });
    } catch (error) {
      console.error("Narration error:", error);
      toast({
        title: "Narration Error",
        description: error.message || "Failed to narrate the story",
        variant: "destructive",
      });
    } finally {
      setIsNarrating(false);
      setIsPaused(false);
    }
  };

  const handlePauseResume = () => {
    if (isPaused) {
      resumeNarration();
      setIsPaused(false);
    } else {
      pauseNarration();
      setIsPaused(true);
    }
  };

  const handleNextPage = () => {
    if (storyData.hasNext) {
      loadStoryPage(storyData.currentPage + 1);
    }
  };

  useEffect(() => {
    initializeStory();
  }, []);

  const handleAttentionChange = (data) => {
    setAttentionStatus(data.attention_status);
    
    if (data.story_state.paused !== isPaused) {
      setIsPaused(data.story_state.paused);
      if (data.story_state.paused) {
        pauseNarration();
        toast({
          title: "Story Paused",
          description: "Please look at the screen to continue the story",
          variant: "warning",
        });
      } else {
        resumeNarration();
      }
    }
  };

  useEffect(() => {
    return () => {
      stopNarration();
    };
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
      <WebcamCapture onAttentionChange={handleAttentionChange} />
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
                      data-index={index}
                      className={`text-white/90 text-4xl font-semibold leading-relaxed ${
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

              {/* Add narration button */}
              <button
                onClick={handleNarration}
                className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium"
              >
                {isNarrating ? "Stop" : "Read Aloud"}
              </button>

              {/* Add pause/resume button when narrating */}
              {isNarrating && (
                <button
                  onClick={handlePauseResume}
                  className="px-6 py-3 bg-white/10 backdrop-blur-md hover:bg-white/20 rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium"
                >
                  {isPaused ? "Resume" : "Pause"}
                </button>
              )}

              <button
                onClick={handleNextPage}
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
          <div className="flex flex-col items-center gap-6">
            <div className="w-[300px] h-[300px] relative rounded-full overflow-hidden border-4 border-white/10">
              <Image
                src="/avatar.jpg"
                alt="Story Avatar"
                fill
                style={{ objectFit: 'cover' }}
                priority
                className="rounded-full"
              />
            </div>
            {isNarrating && (
              <div className="w-32 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse">
                <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse delay-75" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
