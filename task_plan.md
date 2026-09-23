# Task Plan — StyleTry AI: Live On-Device AR Camera Fitting Room

## Objective
Build the real-time live camera AR fitting room for **StyleTry AI**: single full live view where the selected garment tracks the user's body in real time (moves, turns, raises arms), with arms and hair occluded in front of the garment, instant garment swapping without camera restart, One Euro temporal smoothing, WebGL (Three.js) garment rendering (2D mesh warp & 3D glTF), and quality monitoring that pauses overlay on bad conditions.

## Phases & Status

- [x] **Phase 1: One Euro Temporal Smoothing & Landmark Math**
  - Implemented `lib/cv/one-euro-filter.ts`: adaptive cutoff low-pass filter eliminating jitter when still and minimizing lag during rapid movement.
  - Implemented 2D & 3D point filters (`OneEuroFilter2D`, `OneEuroFilter3D`).

- [x] **Phase 2: Pose Landmarker & Occlusion Mask Engine**
  - Implemented `lib/cv/pose-tracker.ts`: upper-body pose tracker in VIDEO mode (shoulders, elbows, wrists, hips, torso, face/neck anchor) with One Euro smoothing.
  - Implemented `lib/cv/occlusion-mask.ts`: foreground person segmentation mask to render arms, hands, and hair in front of the garment.

- [x] **Phase 3: WebGL Garment Renderer (Three.js 2D Warp & 3D glTF)**
  - Implemented `lib/cv/webgl-garment-renderer.ts`: Three.js WebGL canvas over `<video>` with orthographic projection.
  - 2D transparent garment mesh warp based on anchor points (shoulders, neckline, hem, sleeves).
  - Telemetry and automatic quality reduction on slow devices to guarantee 30 FPS.

- [x] **Phase 4: Garment Asset Pipeline with Anchor Points**
  - Updated `Product` interface in `lib/types.ts` with `tryOnAsset` (type, url, anchor points: neckline, shoulders, hem, sleeve ends, validation status).
  - Updated seed data with validated 2D anchor-mapped garments and glTF models.
  - Disabled "Try It On" for products lacking valid assets with a clear reason.

- [x] **Phase 5: Quality Monitor & Bad Condition Pausing**
  - Updated `lib/cv/look-quality-monitor.ts`: check person detected, upper body visible, lighting, motion blur.
  - Emits live guidance: "Move closer", "Step back", "Face the light", "Make sure your shoulders are visible".
  - If quality is too low (e.g. very dark room), PAUSES garment overlay and shows guidance rather than rendering a distorted result.

- [x] **Phase 6: Floating AR Fitting Room UI (Desktop Floating & Mobile Full-Screen)**
  - Built `components/studio/LiveARFittingRoom.tsx`: single live view (no split, no slider, no upload).
  - Floating draggable/resizable window on desktop, full-screen on mobile.
  - Controls: camera toggle, garment carousel, minimize/close, snapshot capture, Add to Cart.
  - Style Advisor as non-blocking side drawer.
  - Seamless fallback between Decart photoreal mode and on-device AR WebGL overlay.

- [x] **Phase 7: Embeddable Widget & Demo Store Integration**
  - Updated `/widget/embed` and `/demo-store` to use the new Live AR fitting room directly.
  - Instant garment swap with zero camera restart.
  - Updated `/try-on` and `/try-on/[productId]` with `TryOnClientView.tsx` defaulting to Live AR.

- [x] **Phase 8: Automated & Manual Testing Gate**
  - Unit tests for One Euro filter, anchor mapping, and bad-condition overlay pausing (`npm test` — 16/16 passed).
  - WebRTC concurrent session load test (`npm run test:load` — 50/50 passed).
  - Production build verification (`npm run build` — 19/19 routes compiled).
  - Production server running and all key routes verified with HTTP 200.

- [x] **Phase 9: Live Telemetry Ingestion & Full Browser E2E Acceptance Journey**
  - Built `/api/analytics` POST & GET route with memory ring buffer and Supabase database persistence for real hardware SLA metrics (TTFR, latency, FPS, stability).
  - Wired live client-side telemetry in `LiveARFittingRoom`: `session_start` (TTFR ms), periodic `heartbeat` (15s interval), `garment_switch`, and `session_end`.
  - Installed Chromium headless browser for Playwright.
  - Configured `playwright.config.ts` with `--use-fake-device-for-media-stream` and camera permissions.
  - Successfully executed full customer journey in Playwright E2E (`npx playwright test` — 1/1 passed in 3.0s).

## Key Decisions & Constraints
- **Single Live View**: No before/after slider or photo upload in the live fitting view. Real-time camera feed is primary.
- **Occlusion**: Arms, hands, and hair render in front of the garment.
- **Never render broken output**: Pause overlay with guidance when tracking quality or lighting degrades.
- **Hardware Telemetry**: Telemetry is non-blocking via `fetch` with `keepalive: true` to avoid impacting the 30 FPS render loop.
