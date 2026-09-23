# Task Plan — StyleTry AI: Embeddable Live AI Fitting Room

## Objective
Build **StyleTry AI**: an embeddable live AI virtual fitting room for e-commerce (Shopify, WooCommerce, custom sites), sold to merchants and used by customers. Features real-time WebRTC VTON with atomic garment switching, on-device Look Quality Monitor (pose/lighting/blur/occlusion detection), explainable Style Intelligence Engine (deterministic scoring first, LLM for wording only), separate visual fit vs size fit, strict DPDP/GDPR privacy controls, merchant admin benchmarking dashboard, and sandboxed iframe widget with SDK script tag.

## Phases & Status

- [x] **Phase 1: Project Architecture, Types & Bespoke Brand Identity**
  - Established "StyleTry AI" brand identity, design tokens, and core TypeScript interfaces.
  - Defined VTON Provider interface, typed error codes, and session state machine (`idle` → `permission` → `positioning` → `connecting` → `live` → `switching` → `degraded` → `ended/failed`).

- [x] **Phase 2: Database Schema & Multi-Tenant Merchant Model (Supabase)**
  - Expanded `lib/db/schema.sql` with `merchants`, `merchant_configs`, `saved_looks` (separate from `wardrobe_items`), `analytics_events`, and `merchant_id` across tables with RLS and anonymous session support.
  - Updated `lib/db/store.ts` to support merchant configuration, session capping, and anonymous guests.

- [x] **Phase 3: On-Device Look Quality Monitor (Client-Side CV)**
  - Implemented `lib/cv/look-quality-monitor.ts`: client-side pose/segmentation analyzer without server upload.
  - Detects: person present, required body region visible, lighting level, motion blur, and occlusions (crossed arms, bags, loose layers).
  - Emits real-time guidance ("Step back", "Face the light", "Center in frame") and quality state: `good | degraded | blocked`.

- [x] **Phase 4: Real-Time VTON Provider Architecture & Adapters**
  - Implemented `lib/vton/provider.ts` with `connect(stream)`, `setGarment()`, `disconnect()`, `onStatus()`, `onError()`.
  - Implemented `lib/vton/decart-adapter.ts` (WebRTC stream adapter, data channel for atomic garment switch).
  - Implemented `lib/vton/mock-adapter.ts` (WebRTC/canvas stream adapter with simulated latency, frame rates, and realistic synthesis for zero-cost testing and development).
  - Implemented state machine with reconnect, timeout handling, and typed error handling.

- [x] **Phase 5: Garment Intake & Image Validation Pipeline**
  - Implemented `lib/intake/validator.ts` to validate uploaded garments: resolution (>= 1024x1024), clean/isolated background, single garment, front view check.
  - Rejects/flags unsupported categories; prioritizes merchant structured metadata over AI guesses.
  - Built merchant intake UI (`/admin/intake`).

- [x] **Phase 6: Style Intelligence Engine (Deterministic Scoring + Configurable Rule Tables)**
  - Published rule tables: LAB color distance (Delta E), formality matrix, silhouette-to-fit map.
  - Deterministic scoring across 6 dimensions: style, color, fit preference, silhouette, occasion, wardrobe.
  - Missing data handler (unknown dimensions, renormalized weights, reduced confidence).
  - Deterministic confidence calculation: $f(\text{data completeness}, \text{pose quality})$.
  - Stored structured evidence in `analysis_json`.

- [x] **Phase 7: LLM Gateway & Explainable Style Match**
  - Implemented `lib/style-engine/llm-gateway.ts` (configurable provider gateway: Gemini/OpenAI/Mock).
  - Strict guardrails: LLM never receives video frames and never modifies numerical scores.
  - Labeled output "Style Match" (never "objective").

- [x] **Phase 8: Fit Architecture: Visual Fit vs. Physical Size Fit**
  - Built `lib/style-engine/fit-calculator.ts`: separates visual try-on from size recommendation.
  - Size fit requires merchant size chart + user measurements; otherwise explicitly displays: *"Visual try-on cannot guarantee physical sizing."*

- [x] **Phase 9: Safety, Ethics & DPDP/GDPR Compliance**
  - Implemented informed consent modal explaining data processors and real-time streaming rules.
  - Enforced neutral language: zero attractiveness, weight, body, or ethnicity inferences.
  - Camera terminates immediately on session exit; zero raw video stored.
  - Built "Delete my try-on data" and "Delete my style profile" endpoints and user controls.

- [x] **Phase 10: Sandboxed Embeddable Widget & SDK**
  - Built iframe widget (`/widget/embed`) with `allow="camera"`, origin verification, and bidirectional `postMessage` protocol.
  - Built `public/widget/styletry.js` script tag loader supporting Shopify, WooCommerce, and custom stores.
  - Built interactive demo store (`/demo-store`) demonstrating real merchant integration.

- [x] **Phase 11: Merchant Admin & Quality Benchmarking Dashboard**
  - Built `/admin` and `/admin/benchmarks` dashboards showing live quality metrics: Time-to-first-render, end-to-end latency, FPS, garment stability, and reconnect time.
  - Configured session caps, rate limits, and cost controls.
  - Rule table inspector for merchant brand customization.

- [x] **Phase 12: Cost Controls, Session Limits & Error Recovery**
  - Implemented per-merchant and per-user session limits, max session duration, idle auto-disconnect (after 90s idle), and rate limiting.
  - Comprehensive user-facing error recovery for all 11 error codes (camera denied, no person, low light, provider outage, etc.).

- [x] **Phase 13: Core Live Fitting Room Studio (`/try-on`)**
  - Modernized Studio interface integrating Look Quality Monitor HUD, real-time VTON viewport, atomic garment strip, Style Match analysis drawer, and Size Fit advisor.
  - Supported `NEXT_PUBLIC_DEMO_MODE` banner ("Demo, not live AI") when active.

- [x] **Phase 14: Testing and Benchmarks Gate**
  - Unit tests for deterministic style scoring, confidence calculation, and rule tables (`npm test`).
  - Integration tests for VTON Provider interface, mock adapter, and atomic switching.
  - Playwright E2E test suite with `--use-fake-device-for-media-stream` (`tests/e2e/fitting-room.spec.ts`).
  - Concurrent session load test script (`npm run test:load`).
  - Mobile device matrix documentation (`tests/DEVICE_MATRIX.md`).

- [x] **Phase 15: Production Build, Polishing & Verification**
  - Full TypeScript and Next.js production build verification (`npm run build`).
  - End-to-end HTTP 200 verification of merchant embed, customer fitting room, style match, and admin dashboard.

## Key Decisions & Constraints
- **VTON vs Style Intelligence separation**: Video goes strictly to VTON provider (Decart / Mock); LLM receives only structured JSON metadata and never sees video.
- **Look Quality Monitor**: Completely client-side CV running in requestAnimationFrame on HTML5 canvas; no frames uploaded for quality analysis.
- **Fit distinction**: Size recommendations strictly segregated from visual rendering.
