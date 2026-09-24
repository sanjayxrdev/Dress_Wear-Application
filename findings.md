# Findings & Technical Architecture — Live Camera Try-On

## 1. Provider Proxy & Security Architecture
- **No Browser API Keys**: `DECART_API_KEY` must never exist in client-side code (`NEXT_PUBLIC_` prefix forbidden for private keys).
- **Server Proxy Pattern**: Client sends WebRTC offer SDP to `/api/vton/session`. The server endpoint checks concurrency/queue limits, applies `DECART_API_KEY`, sends the SDP offer to Decart's signaling endpoint (`https://vton-stream.decart.ai/webrtc/v1/session`), and returns the SDP answer.
- **Mock/Fallback Seamless Handoff**: If no `DECART_API_KEY` is provisioned, or if Decart returns an outage or high latency, the server returns `{ status: 'fallback', reason: 'provider_offline' }` and the client immediately continues with the local on-device AR WebGL renderer with the subtle banner "Using basic preview".

## 2. Capacity & Queue Design
- **Session Limits**: Max 5 concurrent WebRTC streams by default (configurable via `MAX_CONCURRENT_SESSIONS`).
- **Session Duration Limit**: 300 seconds (5 min) max per session.
- **Idle Timeout**: 90 seconds of no interaction / window blur disconnects the stream.
- **Queue System**:
  - In-memory ring buffer / queue state with timestamps.
  - Waiting clients poll `/api/vton/queue?queueId=...` every 2s.
  - Position: `You're #N in line`, estimated wait: `position * 30s`.
  - Actions: "Leave queue" or "Use basic preview now" (bypasses wait by using on-device AR).

## 3. Framing Guidance Pipeline
- Framing check runs locally at 10 Hz:
  - Upper body visibility (ratio between 0.25 and 0.85).
  - Person presence.
  - Lighting luminance (70-170 ideal, < 40 too dark, > 215 blown out).
  - Motion energy.
- Messages:
  - Not detected -> "Move into the frame"
  - Too close (> 0.85) -> "Step back"
  - Too far (< 0.25) -> "Move closer"
  - Dark room (< 40) -> "Face the light"
  - Fast motion -> "Hold still"
- Silhouette outline guide displayed until user is stable.
- Once framed, brief "Getting your fitting room ready..." shimmer state without blank screen flash.

## 4. Draggable Floating Window Behavior
- On desktop (>= 768px): Pointer drag on header bar allows user to position the fitting room anywhere over the product page.
- On mobile (< 768px): Automatically locks to fixed 100vw x 100vh full-screen view.
- Controls:
  - Side actions: expand full screen, share look, save look.
  - Bottom bar: Garment name, price, Change Item, AI Style Check, Add to Cart.

## 5. Live Camera Black Screen Bug Diagnosis & Root Cause
- **Primary Root Cause (c & d)**: The camera stream lifecycle was bound inside a `useEffect` whose dependency array contained `reportTelemetry`. `reportTelemetry` previously referenced changing state `fps` and `qualityState`, mutating its reference on every telemetry frame (100ms–1000ms). Consequently, React constantly unmounted and cleaned up the `useEffect`, calling `streamRef.current.getTracks().forEach(t => t.stop())` immediately after acquiring camera access.
- **Secondary Root Cause (a & b)**: Layers lacked explicit, rigorous z-indexes (`z-0` on video, `z-10` on canvas, `z-20` on guide, `z-30` on controls), meaning stacking order was sensitive to DOM re-renders. Furthermore, the video container had `bg-black`, so a stopped or unplayed stream appeared completely black behind the silhouette.
- **Premature Guidance**: Initial empty frames returned `bodyRegionVisible: false`, which triggered a default `else if (!assessment.bodyRegionVisible)` condition emitting `"Step back so shoulders fit"` before any person was detected.
- **Resolution**:
  - Mirrored `<video>` element rendered unconditionally at `z-0` (`object-cover [transform:scaleX(-1)]`).
  - Transparent overlay `<canvas>` at `z-10` cleared with `clearRect(0,0,w,h)` every frame (never filled black).
  - Silhouette guide outline + guidance pill at `z-20` (semi-transparent outline, head in upper third, shoulders inside frame).
  - Controls and camera error states at `z-30`.
  - Added cancellation token guarding against React StrictMode double-mount unmount/remount cycles.
  - Added 3-second watchdog timer for black/frozen frames with friendly user actionable guidance and retry button.
