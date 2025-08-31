"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Music, FileText, ImageIcon, Play, Download, Sparkles } from "lucide-react"

interface UploadState {
  music: File | null
  lyrics: string
  background: File | null
}

export default function KaraokeStudio() {
  const [uploads, setUploads] = useState<UploadState>({
    music: null,
    lyrics: "",
    background: null,
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)

  const handleFileUpload = (type: "music" | "background", file: File) => {
    setUploads((prev) => ({ ...prev, [type]: file }))
  }

  const handleLyricsChange = (lyrics: string) => {
    setUploads((prev) => ({ ...prev, lyrics }))
  }

  const generateVideo = async () => {
    if (!uploads.music || !uploads.lyrics || !uploads.background) return

    setIsGenerating(true)
    setProgress(0)

    // Simulate video generation progress
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setGeneratedVideo("/placeholder.mp4") // Placeholder video URL
          return 100
        }
        return prev + 10
      })
    }, 500)
  }

  const canGenerate = uploads.music && uploads.lyrics.trim() && uploads.background

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-bold text-foreground font-[var(--font-playfair)]">Karaoke Studio</h1>
            </div>
            <Badge variant="secondary" className="text-xs">
              Beta
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-foreground mb-4 font-[var(--font-playfair)] text-balance">
            Create Professional Karaoke Videos
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Upload your music, add lyrics, and choose a background to generate synchronized karaoke videos in minutes.
          </p>
        </div>

        {/* Upload Cards Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {/* Music Upload */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Music className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Music Track</CardTitle>
                  <CardDescription>Upload your MP3 file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("music", e.target.files[0])}
                    className="hidden"
                    id="music-upload"
                  />
                  <label htmlFor="music-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploads.music ? uploads.music.name : "Click to upload MP3"}
                    </p>
                  </label>
                </div>
                {uploads.music && (
                  <div className="flex items-center gap-2 text-sm text-primary">
                    <Music className="w-4 h-4" />
                    <span>Ready to sync</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lyrics Input */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <CardTitle className="text-lg">Lyrics</CardTitle>
                  <CardDescription>Paste or type your lyrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your lyrics here...&#10;&#10;Each line will be synchronized with the music automatically."
                  value={uploads.lyrics}
                  onChange={(e) => handleLyricsChange(e.target.value)}
                  className="min-h-[120px] resize-none"
                />
                {uploads.lyrics.trim() && (
                  <div className="flex items-center gap-2 text-sm text-accent">
                    <FileText className="w-4 h-4" />
                    <span>{uploads.lyrics.split("\n").filter((line) => line.trim()).length} lines ready</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Background Upload */}
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-secondary/50 rounded-lg flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-secondary-foreground" />
                </div>
                <div>
                  <CardTitle className="text-lg">Background</CardTitle>
                  <CardDescription>Choose your video background</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("background", e.target.files[0])}
                    className="hidden"
                    id="background-upload"
                  />
                  <label htmlFor="background-upload" className="cursor-pointer">
                    <Upload className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {uploads.background ? uploads.background.name : "Click to upload image"}
                    </p>
                  </label>
                </div>
                {uploads.background && (
                  <div className="flex items-center gap-2 text-sm text-secondary-foreground">
                    <ImageIcon className="w-4 h-4" />
                    <span>Background ready</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generation Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl font-[var(--font-playfair)]">Generate Your Karaoke Video</CardTitle>
            <CardDescription>
              Once all files are uploaded, click generate to create your synchronized karaoke video.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {isGenerating && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Generating video...</span>
                    <span className="text-primary font-medium">{progress}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              )}

              {generatedVideo && !isGenerating && (
                <div className="bg-muted/50 rounded-lg p-6 text-center">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Video Generated Successfully!</h3>
                  <p className="text-muted-foreground mb-4">Your karaoke video is ready to download.</p>
                  <Button className="gap-2">
                    <Download className="w-4 h-4" />
                    Download Video
                  </Button>
                </div>
              )}

              {!generatedVideo && (
                <Button
                  onClick={generateVideo}
                  disabled={!canGenerate || isGenerating}
                  size="lg"
                  className="w-full gap-2"
                >
                  <Sparkles className="w-5 h-5" />
                  {isGenerating ? "Generating..." : "Generate Karaoke Video"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Music className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Auto-Sync Lyrics</h3>
            <p className="text-sm text-muted-foreground">
              Advanced AI synchronizes your lyrics perfectly with the music timing.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
              <ImageIcon className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">Custom Backgrounds</h3>
            <p className="text-sm text-muted-foreground">
              Use any image as your video background for a personalized touch.
            </p>
          </div>
          <div className="text-center">
            <div className="w-12 h-12 bg-secondary/50 rounded-lg flex items-center justify-center mx-auto mb-3">
              <Download className="w-6 h-6 text-secondary-foreground" />
            </div>
            <h3 className="font-semibold mb-2">HD Export</h3>
            <p className="text-sm text-muted-foreground">
              Download your karaoke videos in high definition, ready to share.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
