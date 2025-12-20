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
    <div className="min-h-screen bg-background pb-20">
      <div className="w-full max-w-6xl mx-auto px-6 py-12 space-y-12">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight text-foreground">
            Manim Video Generator
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Ask any math question in natural language and get an animated video
            explanation. Visualize complex concepts in motion.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Question Input Section */}
          <div className="lg:col-span-2 space-y-8">
            <Card className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <Video className="w-6 h-6 text-primary" />
                  Generate Video Explanation
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Enter your math question in natural language below.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="math-question" className="text-foreground">Your Question</Label>
                  <Input
                    id="math-question"
                    placeholder="e.g., How to find the area of a circle? or Explain quadratic formula"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey && !isGenerating) {
                        e.preventDefault();
                        handleGenerate();
                      }
                    }}
                    className="h-12 text-base bg-background border-border focus:border-primary focus:ring-4 focus:ring-primary/10"
                  />
                  <p className="text-sm text-muted-foreground">
                    Examples: "How to find slope?", "How to find volume of a cylinder?", "Solve 2x + 5 = 10"
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
                  className="w-full h-12 text-lg font-semibold bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:scale-105"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                      Generating Video...
                    </>
                  ) : (
                    <>
                      <Play className="w-5 h-5 mr-2" />
                      Generate Video
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* Current Video Preview */}
            <Card className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-bold text-foreground">Video Preview</CardTitle>
                <CardDescription className="text-muted-foreground">
                  {currentVideoUrl
                    ? "Your recently generated video"
                    : "Your generated video will appear here after creation."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {currentVideoUrl ? (
                  <div className="space-y-4">
                    <div className="aspect-video bg-black rounded-xl overflow-hidden border border-border">
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
                          )?.question || "manim_video"
                        )
                      }
                      variant="outline"
                      className="w-full h-12 text-base border-border hover:bg-accent text-foreground"
                    >
                      <Download className="w-5 h-5 mr-2" />
                      Download Video
                    </Button>
                  </div>
                ) : (
                  <div className="aspect-video bg-muted/30 border-2 border-dashed border-border rounded-xl flex items-center justify-center">
                    <div className="text-center text-muted-foreground max-w-xs">
                      <Video className="w-16 h-16 mx-auto mb-3 opacity-50" />
                      <p className="text-lg font-semibold text-foreground">No video yet</p>
                      <p className="text-sm mt-1">
                        Ask a question to generate your first Manim video explanation.
                      </p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Previous Videos List */}
          <div>
            <Card className="bg-card rounded-3xl p-8 border border-border shadow-sm">
              <CardHeader className="p-0 mb-8">
                <CardTitle className="text-2xl font-bold text-foreground flex items-center gap-3">
                  <History className="w-6 h-6 text-secondary-foreground" />
                  Recent Creations
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  {previousVideos.length > 0
                    ? `Your last ${previousVideos.length} generated videos.`
                    : "No videos generated yet. Your history will appear here."}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {previousVideos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-muted-foreground bg-muted/30 border-2 border-dashed border-border rounded-xl">
                    <History className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-semibold text-foreground">Empty History</p>
                    <p className="text-sm mt-1">
                      Start generating videos to see them here.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] lg:max-h-[800px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent">
                    {previousVideos.map((video) => (
                      <div
                        key={video.id}
                        className={`
                          group relative bg-background border rounded-2xl p-4 shadow-sm transition-all duration-300
                          ${currentVideoUrl === video.videoUrl
                            ? "border-primary ring-1 ring-primary/20"
                            : "border-border hover:border-primary/30"
                          }
                        `}
                      >
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p className="text-sm font-medium line-clamp-2 flex-1 text-foreground group-hover:text-primary transition-colors">
                            {video.question}
                          </p>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent playing when deleting
                              handleDeleteVideo(video.id);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3">
                          <Clock className="w-4 h-4" />
                          {formatDate(video.createdAt)}
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-border hover:bg-accent text-foreground"
                            onClick={() => handlePlayVideo(video.videoUrl)}
                          >
                            <Play className="w-3 h-3 mr-1" />
                            Play
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-xs border-border hover:bg-accent text-foreground"
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
    </div>
  );
}
