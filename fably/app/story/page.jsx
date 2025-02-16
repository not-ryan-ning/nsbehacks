"use client";
import dynamic from "next/dynamic";
import { Suspense } from "react";

const ThreeProvider = dynamic(
  () =>
    import("../../components/3d/ThreeProvider").then(
      (mod) => mod.ThreeProvider
    ),
  {
    ssr: false,
    loading: () => <div>Loading 3D Scene...</div>,
  }
);
const OrbitControls = dynamic(
  () => import("@react-three/drei").then((mod) => mod.OrbitControls),
  {
    ssr: false,
  }
);
const PerspectiveCamera = dynamic(
  () => import("@react-three/drei").then((mod) => mod.PerspectiveCamera),
  {
    ssr: false,
  }
);
const Model = dynamic(
  () => import("../../components/avatarGLB").then((mod) => mod.Model),
  {
    ssr: false,
  }
);

import { useState, useEffect } from "react";
// Remove Canvas import since it's in ThreeProvider
// Add TTS imports
import {
  narrateStory,
  stopNarration,
  pauseNarration,
  resumeNarration,
} from "../../utils/tts";
import { useToast } from "@/components/hooks/use-toast";
import { ToastAction } from "@/components/ui/toast";
import { getStoryPage } from "../../utils/api";
import WebcamCapture from "../../utils/webcam";

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
  const [isNarrating, setIsNarrating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const loadStoryPage = async (page) => {
    setLoading(true);
    try {
      const data = await getStoryPage(page);
      setStoryData(data);
      setProgress((data.currentPage / data.totalPages) * 100);
      setError(null);
    } catch (error) {
      console.error("Failed to load story:", error);
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

  const handleCapture = (imageSrc) => {
    // Here you have the base64 image to upload
    console.log("Captured image:", imageSrc);
    // Add your upload logic here
  };

  const handleNextPage = () => {
    if (storyData.hasNext) {
      handleCapture(); // Capture image before loading next page
      loadStoryPage(storyData.currentPage + 1);
    }
  };

  useEffect(() => {
    loadStoryPage(1);
  }, []);

  useEffect(() => {
    return () => {
      stopNarration();
    };
  }, []);

  const Avatar3D = () => (
    <ThreeProvider>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 5, 5]} intensity={1} />
      <Model position={[0, -1, 0]} scale={1.5} />
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        minPolarAngle={Math.PI / 2.2}
        maxPolarAngle={Math.PI / 1.8}
      />
    </ThreeProvider>
  );

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
      <WebcamCapture onCapture={handleCapture} />
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
                disabled={!storyData.hasNext}
                className={`px-6 py-3 bg-white/10 backdrop-blur-md rounded-lg text-white transition-all duration-300 ease-in-out flex-1 font-medium ${
                  !storyData.hasNext ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                Next Page
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="lg:w-1/3 p-4 lg:p-6 bg-slate-900/50 backdrop-blur-lg">
        <div className="h-full rounded-2xl p-6 lg:p-8 flex flex-col items-center justify-center bg-slate-800/50 border border-white/10">
          <div className="w-full h-[500px]">
            <Suspense fallback={<div>Loading avatar...</div>}>
              <Avatar3D />
            </Suspense>
          </div>
        </div>
      </div>
    </div>
  );
}
