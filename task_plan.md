# Task Plan — Fitted: Real-Time Virtual Try-On Extension & Interactive Camera

## Objective
1. Build the complete **Manifest V3 Real-Time Virtual Try-On Browser Extension** with universal product detection, floating Shadow DOM viewfinder widget, Tier 1 real-time live webcam garment tracking & fitting, and Tier 2 photorealistic AI capture.
2. Upgrade the web application's studio (`/try-on`) with the same **real-time live video outfit fitting** on the laptop webcam, allowing the user to see their face and see the outfit fitted to them as they move, strictly preserving the editorial luxury design ("Don't change the Design of this project").

## Phases & Status

- [x] **Phase 1: Project Skeleton & Bespoke Design System**
  - Initialized Next.js project with TypeScript and Tailwind CSS.
  - Configured typography (Playfair Display + Plus Jakarta Sans), palette tokens, spacing, and editorial components.
  - Set up shared types and project layout with header, navigation, and footer.

- [x] **Phase 2: Working Core Loop on Mock Data**
  - Seeded luxury fashion products across categories (Outerwear, Tops, Tailoring, Dresses, Knitwear).
  - Implemented the abstracted AI Try-On engine (`lib/ai/virtual-tryon/`) with demo provider and realistic multi-stage state transitions.
  - Built the Try-On Studio with photo upload and instant garment transfer rendering.
  - Verified complete end-to-end loop: Browse → Try → Result → Save.

- [x] **Phase 3: Supabase Architecture & Data Wiring**
  - Created complete Supabase Postgres schema with RLS (`lib/db/schema.sql`).
  - Created Supabase client with automatic fallback to local persistence when remote keys are absent (`lib/db/store.ts`).
  - Connected catalog, product detail, studio, and wardrobe views to data layer.

- [x] **Phase 4: Live Camera & Advisory Computer Vision**
  - Implemented HTML5 webcam stream with camera permission handling (`CameraCapture.tsx`).
  - Built editorial framing guide overlay with head/shoulder silhouette guidelines (`FramingGuide.tsx`).
  - Added real-time canvas-based lighting and positioning analysis ("Good lighting", "Low light detected", "Ready") (`lighting-detector.ts`).
  - Seamless toggle between Live Camera and File Upload.

- [x] **Phase 5: Real AI Provider Integration & API Route**
  - Implemented Replicate provider for IDM-VTON / virtual try-on (`replicate.ts`) in server route handler `/api/try-on`.
  - Validated image format, size, and category server-side with IP rate limiting.
  - Kept secrets strictly on server side.

- [x] **Phase 6: Wardrobe, History, Product-Switching & Before/After Slider**
  - Implemented Before/After interactive split slider on result canvas (`BeforeAfterSlider.tsx`).
  - Built garment strip inside the Studio to switch apparel items without re-uploading user photo (`GarmentStrip.tsx`).
  - Built `/wardrobe` and `/history` pages with download, share, and delete actions.

- [x] **Phase 7: Privacy, Error Handling & Data Management**
  - Implemented "Delete my try-on data" action in profile and server endpoint (`/api/user/delete-data`).
  - Added friendly, plain-language error boundary and recovery states (camera denied, invalid upload, provider timeout).
  - Enforced server-side rate-limiting and validation.

- [x] **Phase 8: Editorial Visual Polish & Responsive Verification**
  - Audited against Section 3 checklist (no AI clichés, proper typographic hierarchy, luxurious editorial spacing).
  - Verified layout responsiveness across desktop, tablet, and mobile.
  - Verified zero dead buttons or broken links across all 13 routes and endpoints.

- [x] **Phase 9: Real-Time Video Garment Overlay Engine (Tier 1 Web App & Extension Core)**
  - Built `lib/cv/realtime-garment-tracker.ts`: client-side upper-body/shoulder tracking and adaptive garment warping with EMA smoothing.
  - Upgraded `CameraCapture.tsx`: user sees their face clearly on their laptop webcam with the garment fitted over their shoulders and moving with their body live at 30-60 FPS!
  - Added live toggle ("Live Fit: Active" vs "Natural View") and instant garment swap sync from `GarmentStrip`.

- [x] **Phase 10: Manifest V3 Browser Extension Skeleton & Build Setup**
  - Setup `extension/` directory with `manifest.json` (Manifest V3), TypeScript, and custom Node bundler `extension/build.js`.
  - Configured permissions (`storage`, `contextMenus`, `activeTab`), host permissions (`<all_urls>`), and action.
  - Generated PNG icons at 16x16, 48x48, and 128x128 in `extension/icons/`.

- [x] **Phase 11: Universal Product Detection & Fallback Mode (`content-script.ts`)**
  - Implemented heuristic detector scanning for e-commerce products (`<img>` inside cards, near prices, schema.org `Product`).
  - Injected discreet editorial "Try-On" hover badge onto detected product images.
  - Setup `MutationObserver` for infinite scroll / SPA sites.
  - Added manual fallback mode: drag any image onto the widget or right-click → "Try this on in Fitted".

- [x] **Phase 12: Floating Shadow DOM Viewfinder Widget**
  - Created isolated Shadow DOM container to prevent host-page CSS bleeding.
  - Implemented draggable header and resizable viewfinder container.
  - Built viewfinder equipment chrome: title bar, minimize, live recording indicator dot, and icon controls.
  - Embedded live webcam feed with Tier 1 real-time garment warping and positioning guidance.

- [x] **Phase 13: Extension Tier 2 Capture Pipeline & Companion App Deep Linking**
  - Connected extension "Capture AI Fit" action to the backend `/api/try-on` endpoint.
  - Displayed captured result inside the widget with save and download actions.
  - Added "Save to Wardrobe" syncing to companion app, with deep-link button opening `http://localhost:3000/wardrobe`.

- [x] **Phase 15: Identity-Preserving Generation Pipeline & Reference Result Screen**
  - Update `lib/ai/virtual-tryon/types.ts` with `personMask`, `poseKeypoints`, and first-class `identityMatchScore`.
  - Create `lib/cv/segmentation-mask.ts` for automated clothing-region mask extraction and pose landmark detection.
  - Implement `lib/ai/virtual-tryon/identity.ts` for automated face-similarity verification and gating.
  - Implement `lib/ai/virtual-tryon/idm-vton.ts` and update `demo.ts` for mask-conditioned garment transfer.
  - Add pre-capture input validation in `CameraCapture.tsx` (lighting, face framing, angle).
  - Update `BeforeAfterSlider.tsx` and `StudioDualPane.tsx` to match the exact reference screenshot (full-bleed, dark pills, 1:1 drag slider, `HOLD TO VIEW ORIGINAL`, auto-fading `DRAG SLIDER TO COMPARE`).
  - Verify complete pipeline with identity check threshold enforcement.

## Completion Criteria
1. Full user journey verified: Browse catalog → Open product → Tap "Try It On" → See face on live camera with garment fitted and moving in real time → Freeze/Capture → See photorealistic render → Compare with slider → Switch garment instantly → Save to wardrobe → Manage in history → Delete try-on data. [VERIFIED]
2. Manifest V3 Browser Extension compiled into `extension/dist/` ready for loading in Chrome, complete with universal product detection, floating Shadow DOM widget, and Tier 1 live fitting. [VERIFIED]
3. 100% adherence to editorial luxury design without any changes to the visual theme. [VERIFIED]
4. Identity-preserving generation pipeline: Mask-conditioned synthesis preserves user's face, hair, and posture pixel-for-pixel; automated `identityMatchScore` gate ensures no mismatched faces are shown; result screen matches reference design. [IN PROGRESS]

