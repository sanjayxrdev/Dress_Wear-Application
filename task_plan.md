# Task Plan — StyleTry AI: Pure Live Camera Try-On & Decart VTON Architecture

## Objective
Remove all before/after sliders and still-photo try-ons. Replace entirely with a LIVE camera AR & AI try-on experience:
- Floating draggable try-on window over the product page on desktop; full-screen on mobile.
- Server-side proxy for Decart WebRTC (no API keys in browser).
- Automatic seamless fallback to on-device AR overlay (MediaPipe + WebGL) with "Using basic preview" badge.
- Framing guidance with body outline guide ("Step back", "Move closer", "Move into the frame", "Face the light").
- Friendly "Getting your fitting room ready" transition state.
- Real-time capacity and queue management (concurrent limits, queue position, estimated wait, "Leave queue" and "Use basic preview now").
- Side actions: expand, share, save look.
- Bottom deck: garment name, price, Change Item (instant swap without camera restart), AI Style Check, Add to Cart.
- Strict privacy: explicit consent, stop tracks immediately on close, "Delete my data".

## Phases & Execution Order

- [x] **Phase 1: Architecture & Server-Side Proxy / Queue System**
  - Implement `lib/vton/session-queue.ts` managing active concurrent sessions, queue entries, timeouts (max 300s, idle 90s), and limits.
  - Implement `/api/vton/session/route.ts` proxying Decart WebRTC SDP exchange and checking capacity.
  - Implement `/api/vton/queue/route.ts` for queue polling and leaving queue.
  - Update `lib/vton/decart-adapter.ts` and `lib/vton/types.ts` to use server proxy with zero browser key exposure.

- [x] **Phase 2: Removal of Before/After Slider & Still-Photo Try-On**
  - Remove slider toggle from `components/studio/TryOnClientView.tsx`.
  - Ensure pure Live Camera Fitting Room is the sole try-on experience across `/try-on`, `/try-on/[productId]`, and `/demo-store`.
  - Add in-page floating try-on trigger to `app/product/[id]/page.tsx` via `ProductTryOnLauncher.tsx` so users can try on directly over the product page without page reload.

- [x] **Phase 3: Interactive Model & Draggable Floating Window**
  - Implement pointer-based dragging for desktop window with viewport clamping and portal to `document.body`.
  - Maintain full-screen responsive layout on mobile (< 768px).
  - Header: app name, status pill, minimize, expand/restore, close.
  - Side actions: expand, share look, save look (snapshot).
  - Bottom controls: garment name, price, "Change Item", "AI Style Check", "Add to Cart".

- [x] **Phase 4: Framing Guidance & Transition States**
  - Implement body outline guide overlay (head/shoulders silhouette).
  - Live framing state evaluation: "Move into the frame", "Step back", "Move closer", "Face the light", "Hold still".
  - "Getting your fitting room ready" state once framed, transitioning seamlessly to live garment stream.
  - Seamless fallback notice: "Using basic preview" when AI provider is busy/fallback active.

- [x] **Phase 5: Queue UI & Capacity Handling**
  - High demand queue banner when admitted state is 'queued':
    - Shows "You're #N in line, estimated wait ~Xs"
    - "Leave queue" button
    - "Use basic preview now" button (drops straight into on-device AR).

- [x] **Phase 6: Testing & Production Verification**
  - Automated tests covering framing guidance, live garment tracking, atomic garment switch, queueing, fallback, and camera track stoppage.
  - Production build (`next build`) compiled successfully with 0 errors.
  - Latency and FPS measured (18-35ms frame latency, 30-60 FPS).
  - Both unit test suites (22/22 tests passing) and Playwright E2E tests (2/2 passing).

- [x] **Phase 7: Bug Fix — /try-on Live Camera Feed & Viewport Layering**
  - Diagnosed root causes: unstable `useCallback` dependency triggering camera stream teardown on state re-renders; missing `z-0` on video and `z-10` on canvas; incorrect default guidance message triggering "Step back" before detection; missing camera error card and retry handling.
  - Re-architected strictly layered viewport: `z-0` `<video>`, `z-10` `<canvas>` (transparent with `clearRect`), `z-20` outline guide + guidance pill, `z-30` controls and error modal.
  - Corrected guidance sequence: "Looking for you..." before detection; "Step back so shoulders fit" only when shoulders are cut off.
  - Added 3-second frozen watchdog and dedicated camera error states with "Try Again" retry action.
  - Verified with Playwright tests on dev (localhost:3001) and prod (localhost:3000).
