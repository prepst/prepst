"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Video,
  Loader2,
  Download,
  Play,
  History,
  Trash2,
  Clock,
} from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { api } from "@/lib/api";
import { config } from "@/lib/config";

interface GeneratedVideo {
  id: string;
  question: string;
  videoUrl: string;
  createdAt: string;
  isCached?: boolean;
  originalQuestion?: string;
  similarityScore?: number;
}

export default function ManimPage() {
  const [question, setQuestion] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentVideoUrl, setCurrentVideoUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [previousVideos, setPreviousVideos] = useState<GeneratedVideo[]>([]);

  // Load previous videos from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem("manim-videos");
        if (saved) {
          const videos = JSON.parse(saved) as GeneratedVideo[];
          // Ensure video URLs are full URLs
          const videosWithFullUrls = videos.map((video) => ({
            ...video,
            videoUrl: video.videoUrl.startsWith("http")
              ? video.videoUrl
              : `${config.apiUrl}${video.videoUrl}`,
          }));
          setPreviousVideos(videosWithFullUrls);
        }
      } catch (err) {
        console.error("Failed to load previous videos:", err);
      }
    }
  }, []);

  // Save videos to localStorage whenever they change
  useEffect(() => {
    if (typeof window !== "undefined" && previousVideos.length > 0) {
      try {
        localStorage.setItem("manim-videos", JSON.stringify(previousVideos));
      } catch (err) {
        console.error("Failed to save videos:", err);
      }
    }
  }, [previousVideos]);

  const handleGenerate = async () => {
    if (!question.trim()) {
      setError("Please enter a math question");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setCurrentVideoUrl(null);

    try {
      const data = await api.post("/api/manim/generate", {
        question: question.trim(),
      });

      const videoUrl = data.videoUrl || data.url || data.video_url;

      if (!videoUrl) {
        throw new Error("No video URL returned from server");
      }

      // Construct full URL if it's a relative path
      const fullVideoUrl = videoUrl.startsWith("http")
        ? videoUrl
        : `${config.apiUrl}${videoUrl}`;

      setCurrentVideoUrl(fullVideoUrl);

      // Add to previous videos list (only if not cached)
      if (!data.isCached) {
        const newVideo: GeneratedVideo = {
          id: data.sceneId || Date.now().toString(),
          question: question.trim(),
          videoUrl: fullVideoUrl,
          createdAt: new Date().toISOString(),
        };

        setPreviousVideos((prev) => [newVideo, ...prev].slice(0, 50)); // Keep last 50 videos
      } else {
        // If cached, show a message
        console.log(
          `Using cached video for similar question: "${data.originalQuestion}"`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to generate video. Please try again."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = (videoUrl: string, question: string) => {
    const link = document.createElement("a");
    link.href = videoUrl;
    link.download = `manim-${question.slice(0, 30).replace(/\s+/g, "-")}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteVideo = (id: string) => {
    setPreviousVideos((prev) => prev.filter((video) => video.id !== id));
    if (
      currentVideoUrl &&
      previousVideos.find((v) => v.id === id)?.videoUrl === currentVideoUrl
    ) {
      setCurrentVideoUrl(null);
    }
  };

  const handlePlayVideo = (videoUrl: string) => {
    setCurrentVideoUrl(videoUrl);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60)
      return `${diffMins} minute${diffMins > 1 ? "s" : ""} ago`;
    if (diffHours < 24)
      return `${diffHours} hour${diffHours > 1 ? "s" : ""} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? "s" : ""} ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Manim Video Generator</h1>
        <p className="text-gray-600">
          Ask any math question in natural language and get an animated video
          explanation. For example: "How to find slope?" or "How to find volume
          of a cylinder?"
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Question Input Section */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="w-5 h-5" />
                Ask a Math Question
              </CardTitle>
              <CardDescription>
                Enter your question in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="math-question">Question</Label>
                <Input
                  id="math-question"
                  placeholder="e.g., How to find slope? How to find volume of a cylinder?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                      e.preventDefault();
                      handleGenerate();
                    }
                  }}
                  className="text-base"
                />
                <p className="text-sm text-gray-500">
                  Examples: "How to find the area of a circle?", "Explain
                  quadratic formula", "How to solve linear equations?"
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !question.trim()}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Video...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Generate Video
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Current Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Video Preview</CardTitle>
              <CardDescription>
                {currentVideoUrl
                  ? "Your generated video"
                  : "Your generated video will appear here"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {currentVideoUrl ? (
                <div className="space-y-4">
                  <div className="aspect-video bg-black rounded-lg overflow-hidden">
                    <video
                      src={currentVideoUrl}
                      controls
                      className="w-full h-full"
                      autoPlay
                    />
                  </div>
                  <Button
                    onClick={() =>
                      handleDownload(
                        currentVideoUrl,
                        previousVideos.find(
                          (v) => v.videoUrl === currentVideoUrl
                        )?.question || "video"
                      )
                    }
                    variant="outline"
                    className="w-full"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Video
                  </Button>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Video className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>No video generated yet</p>
                    <p className="text-sm mt-1">
                      Enter a question and click Generate Video
                    </p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Previous Videos List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Previous Videos
              </CardTitle>
              <CardDescription>
                {previousVideos.length > 0
                  ? `${previousVideos.length} video${
                      previousVideos.length > 1 ? "s" : ""
                    } generated`
                  : "No videos generated yet"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {previousVideos.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">
                    Your generated videos will appear here
                  </p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {previousVideos.map((video) => (
                    <div
                      key={video.id}
                      className={`p-3 rounded-lg border transition-colors ${
                        currentVideoUrl === video.videoUrl
                          ? "border-purple-500 bg-purple-50 dark:bg-purple-950"
                          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium line-clamp-2 flex-1">
                          {video.question}
                        </p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 flex-shrink-0"
                          onClick={() => handleDeleteVideo(video.id)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <Clock className="w-3 h-3" />
                        {formatDate(video.createdAt)}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() => handlePlayVideo(video.videoUrl)}
                        >
                          <Play className="w-3 h-3 mr-1" />
                          Play
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 text-xs"
                          onClick={() =>
                            handleDownload(video.videoUrl, video.question)
                          }
                        >
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
