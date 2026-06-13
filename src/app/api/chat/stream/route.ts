import { NextRequest, NextResponse } from 'next/server'

// This endpoint provides SSE stream for chat data
export async function GET(req: NextRequest) {
  const channel = req.nextUrl.searchParams.get('channel')
  if (!channel) {
    return NextResponse.json({ error: 'Channel required' }, { status: 400 })
  }

  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ connected: true, channel })}\n\n`))
    },
  })

  return new NextResponse(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
