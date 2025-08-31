"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Upload, Music, FileText, ImageIcon, Play, Download, Sparkles, RotateCcw } from "lucide-react"

interface UploadState {
  music: File | null
  lyrics: string
  background: File | null
}

interface ValidationState {
  music: { isValid: boolean; error?: string }
  lyrics: { isValid: boolean; error?: string }
  background: { isValid: boolean; error?: string }
}

export default function KaraokeStudio() {
  const [uploads, setUploads] = useState<UploadState>({
    music: null,
    lyrics: "",
    background: null,
  })
  const [validation, setValidation] = useState<ValidationState>({
    music: { isValid: false },
    lyrics: { isValid: false },
    background: { isValid: false },
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState(0)
  const [generatedVideo, setGeneratedVideo] = useState<string | null>(null)
  const [downloadProgress, setDownloadProgress] = useState(0)
  const [isDownloading, setIsDownloading] = useState(false)

  const validateFile = (file: File, type: "music" | "background") => {
    const maxSize = type === "music" ? 50 * 1024 * 1024 : 10 * 1024 * 1024 // 50MB for music, 10MB for images
    const validTypes = type === "music" 
      ? ["audio/mp3", "audio/mpeg", "audio/mp4", "audio/wav"] 
      : ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"]
    
    if (file.size > maxSize) {
      return { isValid: false, error: `File too large (max ${type === "music" ? "50MB" : "10MB"})` }
    }
    
    if (!validTypes.includes(file.type)) {
      return { isValid: false, error: `Invalid file type (${type === "music" ? "audio" : "image"} only)` }
    }
    
    return { isValid: true }
  }

  const handleFileUpload = (type: "music" | "background", file: File) => {
    const validation = validateFile(file, type)
    setUploads((prev) => ({ ...prev, [type]: file }))
    setValidation((prev) => ({ ...prev, [type]: validation }))
  }

  const handleLyricsChange = (lyrics: string) => {
    setUploads((prev) => ({ ...prev, lyrics }))
    const isValid = lyrics.trim().length > 0 && lyrics.trim().split('\n').filter(line => line.trim()).length >= 2
    setValidation((prev) => ({ 
      ...prev, 
      lyrics: { 
        isValid, 
        error: isValid ? undefined : "Please enter at least 2 lines of lyrics" 
      } 
    }))
  }

  const generateVideo = async () => {
    if (!uploads.music || !uploads.lyrics || !uploads.background) return

    setIsGenerating(true)
    setProgress(0)

    // Simulate fast video generation progress (faster than before)
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsGenerating(false)
          setGeneratedVideo("karaoke-video") // Base filename for multiple formats
          return 100
        }
        return prev + 20 // Faster progress
      })
    }, 200) // Faster interval
  }

  const handleDownload = async (format: 'mp4' | 'webm') => {
    if (!generatedVideo) return
    
    setIsDownloading(true)
    setDownloadProgress(0)
    
    // Simulate download progress
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          setIsDownloading(false)
          setDownloadProgress(0)
          
          // Create a blob with sample video data (in real app, this would be the actual video)
          const videoBlob = new Blob(['Sample karaoke video data'], { 
            type: format === 'mp4' ? 'video/mp4' : 'video/webm' 
          })
          const url = URL.createObjectURL(videoBlob)
          
          // Create download link
          const link = document.createElement('a')
          link.href = url
          link.download = `${generatedVideo}.${format}`
          document.body.appendChild(link)
          link.click()
          document.body.removeChild(link)
          
          // Clean up
          URL.revokeObjectURL(url)
          return 100
        }
        return prev + 25 // Fast download progress
      })
    }, 100) // Very fast interval
  }

  const handleReset = () => {
    setUploads({
      music: null,
      lyrics: "",
      background: null,
    })
    setValidation({
      music: { isValid: false },
      lyrics: { isValid: false },
      background: { isValid: false },
    })
    setGeneratedVideo(null)
    setProgress(0)
    setDownloadProgress(0)
    setIsGenerating(false)
    setIsDownloading(false)
  }

  const canGenerate = validation.music.isValid && validation.lyrics.isValid && validation.background.isValid

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
          <Card className={`relative overflow-hidden ${
            uploads.music 
              ? validation.music.isValid 
                ? 'border-l-4 border-l-[var(--status-success)]' 
                : 'border-l-4 border-l-[var(--status-error)]'
              : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  uploads.music 
                    ? validation.music.isValid 
                      ? 'bg-[var(--status-success)]/20' 
                      : 'bg-[var(--status-error)]/20'
                    : 'bg-primary/10'
                }`}>
                  <Music className={`w-5 h-5 ${
                    uploads.music 
                      ? validation.music.isValid 
                        ? 'text-[var(--status-success)]' 
                        : 'text-[var(--status-error)]'
                      : 'text-primary'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-lg">Music Track</CardTitle>
                  <CardDescription className="text-muted-foreground">Upload your MP3 file</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploads.music 
                    ? validation.music.isValid 
                      ? 'border-[var(--status-success)]/50 bg-[var(--status-success)]/5' 
                      : 'border-[var(--status-error)]/50 bg-[var(--status-error)]/5'
                    : 'border-border hover:border-primary/50'
                }`}>
                  <input
                    type="file"
                    accept="audio/mp3,audio/mpeg,audio/mp4,audio/wav"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("music", e.target.files[0])}
                    className="hidden"
                    id="music-upload"
                  />
                  <label htmlFor="music-upload" className="cursor-pointer">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${
                      uploads.music 
                        ? validation.music.isValid 
                          ? 'text-[var(--status-success)]' 
                          : 'text-[var(--status-error)]'
                        : 'text-muted-foreground'
                    }`} />
                    <p className={`text-sm ${
                      uploads.music 
                        ? validation.music.isValid 
                          ? 'text-[var(--status-success)]' 
                          : 'text-[var(--status-error)]'
                        : 'text-muted-foreground'
                    }`}>
                      {uploads.music ? uploads.music.name : "Click to upload MP3"}
                    </p>
                  </label>
                </div>
                {uploads.music && (
                  <div className={`flex items-center gap-2 text-sm ${
                    validation.music.isValid 
                      ? 'text-[var(--status-success)]' 
                      : 'text-[var(--status-error)]'
                  }`}>
                    <Music className="w-4 h-4" />
                    <span>
                      {validation.music.isValid 
                        ? "Ready to sync" 
                        : validation.music.error || "Invalid file"
                      }
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Lyrics Input */}
          <Card className={`relative overflow-hidden ${
            uploads.lyrics.trim() 
              ? validation.lyrics.isValid 
                ? 'border-l-4 border-l-[var(--status-success)]' 
                : 'border-l-4 border-l-[var(--status-error)]'
              : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  uploads.lyrics.trim() 
                    ? validation.lyrics.isValid 
                      ? 'bg-[var(--status-success)]/20' 
                      : 'bg-[var(--status-error)]/20'
                    : 'bg-accent/10'
                }`}>
                  <FileText className={`w-5 h-5 ${
                    uploads.lyrics.trim() 
                      ? validation.lyrics.isValid 
                        ? 'text-[var(--status-success)]' 
                        : 'text-[var(--status-error)]'
                      : 'text-accent'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-lg">Lyrics</CardTitle>
                  <CardDescription className="text-muted-foreground">Paste or type your lyrics</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Paste your lyrics here...&#10;&#10;Each line will be synchronized with the music automatically.&#10;&#10;💡 Tip: Use LRC tags for precise timing:&#10;[00:01.23]First line of lyrics&#10;[00:03.45]Second line of lyrics&#10;[00:05.67]Third line of lyrics"
                  value={uploads.lyrics}
                  onChange={(e) => handleLyricsChange(e.target.value)}
                  className={`min-h-[140px] resize-none ${
                    uploads.lyrics.trim() 
                      ? validation.lyrics.isValid 
                        ? 'border-[var(--status-success)]/50 bg-[var(--status-success)]/5' 
                        : 'border-[var(--status-error)]/50 bg-[var(--status-error)]/5'
                      : ''
                  }`}
                />
                <div className="text-xs text-muted-foreground bg-muted/50 p-3 rounded-md">
                  <p className="font-medium mb-1">📝 LRC Format (Optional but Recommended):</p>
                  <p className="text-xs">Use <code className="bg-background px-1 rounded">[MM:SS.mm]</code> tags for precise timing. Example:</p>
                  <code className="block text-xs mt-1 bg-background p-2 rounded border">
                    [00:01.23]First line of lyrics<br/>
                    [00:03.45]Second line of lyrics<br/>
                    [00:05.67]Third line of lyrics
                  </code>
                </div>
                {uploads.lyrics.trim() && (
                  <div className={`flex items-center gap-2 text-sm ${
                    validation.lyrics.isValid 
                      ? 'text-[var(--status-success)]' 
                      : 'text-[var(--status-error)]'
                  }`}>
                    <FileText className="w-4 h-4" />
                    <span>
                      {validation.lyrics.isValid 
                        ? `${uploads.lyrics.split("\n").filter((line) => line.trim()).length} lines ready` 
                        : validation.lyrics.error || "Invalid lyrics"
                      }
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Background Upload */}
          <Card className={`relative overflow-hidden ${
            uploads.background 
              ? validation.background.isValid 
                ? 'border-l-4 border-l-[var(--status-success)]' 
                : 'border-l-4 border-l-[var(--status-error)]'
              : ''
          }`}>
            <CardHeader className="pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  uploads.background 
                    ? validation.background.isValid 
                      ? 'bg-[var(--status-success)]/20' 
                      : 'bg-[var(--status-error)]/20'
                    : 'bg-secondary/50'
                }`}>
                  <ImageIcon className={`w-5 h-5 ${
                    uploads.background 
                      ? validation.background.isValid 
                        ? 'text-[var(--status-success)]' 
                        : 'text-[var(--status-error)]'
                      : 'text-secondary-foreground'
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-lg">Background</CardTitle>
                  <CardDescription className="text-muted-foreground">Choose your video background</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                  uploads.background 
                    ? validation.background.isValid 
                      ? 'border-[var(--status-success)]/50 bg-[var(--status-success)]/5' 
                      : 'border-[var(--status-error)]/50 bg-[var(--status-error)]/5'
                    : 'border-border hover:border-primary/50'
                }`}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => e.target.files?.[0] && handleFileUpload("background", e.target.files[0])}
                    className="hidden"
                    id="background-upload"
                  />
                  <label htmlFor="background-upload" className="cursor-pointer">
                    <Upload className={`w-8 h-8 mx-auto mb-2 ${
                      uploads.background 
                        ? validation.background.isValid 
                          ? 'text-[var(--status-success)]' 
                          : 'text-[var(--status-error)]'
                        : 'text-muted-foreground'
                    }`} />
                    <p className={`text-sm ${
                      uploads.background 
                        ? validation.background.isValid 
                          ? 'text-[var(--status-success)]' 
                          : 'text-[var(--status-error)]'
                        : 'text-muted-foreground'
                    }`}>
                      {uploads.background ? uploads.background.name : "Click to upload image"}
                    </p>
                  </label>
                </div>
                {uploads.background && (
                  <div className={`flex items-center gap-2 text-sm ${
                    validation.background.isValid 
                      ? 'text-[var(--status-success)]' 
                      : 'text-[var(--status-error)]'
                  }`}>
                    <ImageIcon className="w-4 h-4" />
                    <span>
                      {validation.background.isValid 
                        ? "Background ready" 
                        : validation.background.error || "Invalid file"
                      }
                    </span>
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
            <CardDescription className="text-muted-foreground">
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
                  <div className="w-16 h-16 bg-[var(--status-success)]/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Play className="w-8 h-8 text-[var(--status-success)]" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Video Generated Successfully!</h3>
                  <p className="text-muted-foreground mb-4">Your karaoke video is ready to download.</p>
                  
                  {isDownloading && (
                    <div className="mb-4">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Downloading...</span>
                        <span className="text-[var(--status-success)] font-medium">{downloadProgress}%</span>
                      </div>
                      <Progress value={downloadProgress} className="h-2" />
                    </div>
                  )}
                  
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={() => handleDownload('mp4')} 
                      disabled={isDownloading}
                      className="gap-2 bg-blue-600 hover:bg-blue-700"
                    >
                      <Download className="w-4 h-4" />
                      Download MP4
                    </Button>
                    <Button 
                      onClick={() => handleDownload('webm')} 
                      disabled={isDownloading}
                      className="gap-2 bg-green-600 hover:bg-green-700"
                    >
                      <Download className="w-4 h-4" />
                      Download WebM
                    </Button>
                    <Button onClick={handleReset} variant="outline" className="gap-2">
                      <RotateCcw className="w-4 h-4" />
                      Create New Video
                    </Button>
                  </div>
                </div>
              )}

              {!generatedVideo && (
                <Button
                  onClick={generateVideo}
                  disabled={!canGenerate || isGenerating}
                  size="lg"
                  className={`w-full gap-2 transition-all duration-300 ${
                    canGenerate && !isGenerating 
                      ? 'bg-[var(--status-success)] hover:bg-[var(--status-success)]/90 text-white shadow-lg scale-105' 
                      : ''
                  }`}
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
