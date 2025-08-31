import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const filename = params.filename
    const filePath = join(process.cwd(), 'outputs', filename)
    
    if (!existsSync(filePath)) {
      return NextResponse.json({ error: 'Video not found' }, { status: 404 })
    }
    
    const videoBuffer = await readFile(filePath)
    
    return new NextResponse(videoBuffer, {
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    })
  } catch (error) {
    console.error('Video serving error:', error)
    return NextResponse.json({ error: 'Failed to serve video' }, { status: 500 })
  }
}
