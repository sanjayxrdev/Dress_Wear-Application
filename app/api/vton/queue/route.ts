import { NextRequest, NextResponse } from 'next/server';
import { vtonQueueManager } from '@/lib/vton/session-queue';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const queueId = searchParams.get('queueId');

  if (!queueId) {
    return NextResponse.json({ error: 'Missing queueId' }, { status: 400 });
  }

  const result = vtonQueueManager.pollQueue(queueId);
  return NextResponse.json(result);
}

export async function POST(req: NextRequest) {
  try {
    const { queueId, action } = await req.json();

    if (queueId && action === 'leave') {
      vtonQueueManager.leaveQueue(queueId);
      return NextResponse.json({ success: true, message: 'Removed from queue' });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'Failed to process queue action' }, { status: 500 });
  }
}
