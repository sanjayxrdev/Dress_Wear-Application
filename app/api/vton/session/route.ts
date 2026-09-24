import { NextRequest, NextResponse } from 'next/server';
import { vtonQueueManager } from '@/lib/vton/session-queue';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { merchantId = 'merch_atelier_haute', userId = 'usr_guest', sdpOffer } = body;

    // 1. Enforce concurrent capacity & queue
    const queueStatus = vtonQueueManager.requestSession(merchantId, userId);

    if (queueStatus.status === 'queued') {
      return NextResponse.json(queueStatus, { status: 202 });
    }

    if (queueStatus.status === 'unavailable') {
      return NextResponse.json(queueStatus, { status: 503 });
    }

    // 2. Admitted: Process WebRTC SDP with Decart Signaling if API key is configured
    const decartKey = process.env.DECART_API_KEY;
    const signalingUrl =
      process.env.DECART_SIGNALING_URL || 'https://vton-stream.decart.ai/webrtc/v1/session';

    if (decartKey && sdpOffer) {
      try {
        const decartRes = await fetch(signalingUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${decartKey}`,
          },
          body: JSON.stringify({
            sdp: sdpOffer.sdp,
            type: sdpOffer.type || 'offer',
            sessionId: queueStatus.sessionId,
          }),
        });

        if (decartRes.ok) {
          const decartData = await decartRes.json();
          return NextResponse.json({
            status: 'admitted',
            sessionId: queueStatus.sessionId,
            mode: 'decart_live',
            answerSdp: decartData.sdp || decartData,
            maxDurationSec: queueStatus.maxDurationSec,
            idleTimeoutSec: queueStatus.idleTimeoutSec,
          });
        }
        console.warn(`Decart signaling failed with status ${decartRes.status}, falling back to mock.`);
      } catch (err) {
        console.warn('Decart signaling request error, falling back to mock provider:', err);
      }
    }

    // Default to high-fidelity mock adapter (safe, robust, runs without external key)
    return NextResponse.json({
      status: 'admitted',
      sessionId: queueStatus.sessionId,
      mode: 'mock_webrtc',
      maxDurationSec: queueStatus.maxDurationSec,
      idleTimeoutSec: queueStatus.idleTimeoutSec,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        message: 'Internal error processing VTON session request.',
        fallbackToOnDevice: true,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });
    }

    const alive = vtonQueueManager.heartbeat(sessionId);
    return NextResponse.json({ active: alive });
  } catch {
    return NextResponse.json({ active: false });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { sessionId } = await req.json();
    if (sessionId) {
      vtonQueueManager.releaseSession(sessionId);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false });
  }
}
