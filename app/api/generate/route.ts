import { NextRequest, NextResponse } from 'next/server'
import { spawn } from 'child_process'
import { join } from 'path'
import { existsSync, unlink } from 'fs/promises'

interface GenerateRequest {
  musicFile: string
  lyrics: string
  backgroundFile?: string
  title: string
  artist: string
  includeIntro: boolean
}

export async function POST(request: NextRequest) {
  try {
    const body: GenerateRequest = await request.json()
    const { musicFile, lyrics, backgroundFile, title, artist, includeIntro } = body

    // Validate required fields
    if (!musicFile || !lyrics || !title || !artist) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const uploadsDir = join(process.cwd(), 'uploads')
    const outputDir = join(process.cwd(), 'outputs')
    
    // Create output directory if it doesn't exist
    if (!existsSync(outputDir)) {
      await mkdir(outputDir, { recursive: true })
    }

    const timestamp = Date.now()
    const outputFilename = `karaoke_${timestamp}`
    
    // Parse lyrics with timing
    const parsedLyrics = parseLyrics(lyrics)
    
    // Generate video using FFmpeg
    const videoPath = await generateKaraokeVideo({
      musicFile: join(uploadsDir, musicFile),
      backgroundFile: backgroundFile ? join(uploadsDir, backgroundFile) : undefined,
      lyrics: parsedLyrics,
      title,
      artist,
      includeIntro,
      outputDir,
      outputFilename
    })

    return NextResponse.json({
      success: true,
      videoPath,
      filename: `${outputFilename}.mp4`
    })

  } catch (error) {
    console.error('Video generation error:', error)
    return NextResponse.json({ error: 'Video generation failed' }, { status: 500 })
  }
}

interface LyricLine {
  time: number // in seconds
  text: string
  isActive: boolean
}

function parseLyrics(lyrics: string): LyricLine[] {
  const lines = lyrics.split('\n').filter(line => line.trim())
  const parsed: LyricLine[] = []
  
  lines.forEach((line, index) => {
    // Check for LRC format [MM:SS.mm]
    const lrcMatch = line.match(/^\[(\d{2}):(\d{2})\.(\d{2})\](.+)$/)
    
    if (lrcMatch) {
      const [, minutes, seconds, milliseconds, text] = lrcMatch
      const time = parseInt(minutes) * 60 + parseInt(seconds) + parseInt(milliseconds) / 100
      parsed.push({ time, text: text.trim(), isActive: false })
    } else {
      // Auto-sync: distribute lyrics evenly (placeholder for now)
      const time = index * 3 // 3 seconds per line as fallback
      parsed.push({ time, text: line.trim(), isActive: false })
    }
  })
  
  return parsed
}

interface VideoGenerationParams {
  musicFile: string
  backgroundFile?: string
  lyrics: LyricLine[]
  title: string
  artist: string
  includeIntro: boolean
  outputDir: string
  outputFilename: string
}

async function generateKaraokeVideo(params: VideoGenerationParams): Promise<string> {
  const { musicFile, backgroundFile, lyrics, title, artist, includeIntro, outputDir, outputFilename } = params
  
  return new Promise((resolve, reject) => {
    const outputPath = join(outputDir, `${outputFilename}.mp4`)
    
    // Build FFmpeg command for karaoke video generation
    let ffmpegArgs = [
      '-i', musicFile,
      '-f', 'lavfi',
      '-i', 'color=black:size=1920x1080:duration=10', // Black background
      '-filter_complex', buildFilterComplex(lyrics, title, artist, includeIntro, backgroundFile),
      '-c:v', 'libx264',
      '-c:a', 'aac',
      '-shortest',
      outputPath
    ]
    
    const ffmpeg = spawn('ffmpeg', ffmpegArgs)
    
    ffmpeg.stdout.on('data', (data) => {
      console.log('FFmpeg stdout:', data.toString())
    })
    
    ffmpeg.stderr.on('data', (data) => {
      console.log('FFmpeg stderr:', data.toString())
    })
    
    ffmpeg.on('close', (code) => {
      if (code === 0) {
        resolve(outputPath)
      } else {
        reject(new Error(`FFmpeg process exited with code ${code}`))
      }
    })
    
    ffmpeg.on('error', (error) => {
      reject(error)
    })
  })
}

function buildFilterComplex(lyrics: LyricLine[], title: string, artist: string, includeIntro: boolean, backgroundFile?: string): string {
  let filters = []
  
  if (includeIntro) {
    // Add 3-second intro with title, artist, and "Karaoke Version"
    filters.push(
      `[0:v]drawtext=text='${title}':fontsize=72:fontcolor=orange:x=(w-text_w)/2:y=(h-text_h)/2-100:enable='between(t,0,3)'[intro1]`,
      `[intro1]drawtext=text='${artist}':fontsize=48:fontcolor=orange:x=(w-text_w)/2:y=(h-text_h)/2:enable='between(t,0,3)'[intro2]`,
      `[intro2]drawtext=text='Karaoke Version':fontsize=36:fontcolor=orange:x=(w-text_w)/2:y=(h-text_h)/2+100:enable='between(t,0,3)'[intro3]`
    )
  }
  
  // Add lyrics overlay
  lyrics.forEach((lyric, index) => {
    const startTime = includeIntro ? lyric.time + 3 : lyric.time
    const endTime = lyrics[index + 1] ? (includeIntro ? lyrics[index + 1].time + 3 : lyrics[index + 1].time) : startTime + 3
    
    filters.push(
      `drawtext=text='${lyric.text}':fontsize=48:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2+${index * 60}:enable='between(t,${startTime},${endTime})'`
    )
  })
  
  return filters.join(',')
}
