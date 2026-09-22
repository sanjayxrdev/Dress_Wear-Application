# Findings & Technical Context — Fitted (AI Virtual Try-On)

## 1. Web Application Core (Completed & Verified)
- Next.js 16.3.6 App Router, TypeScript, Tailwind CSS v4, Lucide React, Framer Motion, and Supabase client.
- Editorial luxury fashion design system: Playfair Display serif headlines + Plus Jakarta Sans, `#fcfbf8` ivory, `#141413` charcoal, `#9e5033` terracotta.
- Complete navigation and 13 routes verified with HTTP 200:
  - Landing (`/`), Catalog (`/shop`), Product Detail (`/product/[id]`), Studio (`/try-on`, `/try-on/[productId]`), Wardrobe (`/wardrobe`), History (`/history`), Profile (`/profile`), Auth (`/login`, `/signup`).
  - API endpoints `/api/try-on` and `/api/user/delete-data`.

## 2. Real-Time Virtual Try-On Extension Architecture (Manifest V3)
- **Two-Tier Engine**:
  - **Tier 1 (Live Video Overlay - Client-Side CV)**:
    - Runs in real time over the live webcam feed.
    - Estimates upper body/shoulder/torso position in real time using client-side facial/torso landmark tracking.
    - Warps and composites the selected garment texture over the live moving video feed at 30-60 FPS with alpha blending, so the user sees their face and the outfit dynamically conforming to their movements.
  - **Tier 2 (Photorealistic AI Capture - Server-Side Diffusion)**:
    - Triggered on "Capture", sends the high-res snapshot to `/api/try-on` for photorealistic diffusion garment transfer.
    - Features the Before/After split slider, wardrobe save, and deep link to the companion app.
- **Universal Product Detector (`content-script.ts`)**:
  - Injects a discrete editorial "Try-On" badge onto product images across any shopping site.
  - Monitors DOM mutations (`MutationObserver`) for infinite scrolling.
  - Fallback manual mode: allows user to drag any image on the page onto the widget or right-click context menu ("Try this on").
- **Floating Shadow DOM Widget (`widget/`)**:
  - Shadow DOM isolation preventing host-page CSS conflicts.
  - Floating, draggable, resizable viewfinder chrome matching the camera equipment aesthetic.
  - Live recording honesty indicator.
  - Seamless in-widget garment switching.

## 4. Identity-Preserving Generation Pipeline & Reference Result Screen Analysis
- **Problem Diagnosis**:
  - The previous pipeline treated try-on as general generation or fell back to static stock imagery, which replaced the user with a completely different model (different face, hair, skin, body).
  - Virtual try-on requires **mask-conditioned garment transfer**: the input photo must be separated into a clothing region mask (`personMask`) and a preserved region (face, hair, ears, chin, hands, background).
  - Anything outside the clothing mask must be retained pixel-for-pixel from the source photo.
- **Pose & Fit Conditioning**:
  - Extracting `poseKeypoints` (neck anchor, shoulder slope, torso bounds) ensures the garment conforms to the user's actual body structure rather than a stock model's proportions.
- **Automated Identity Gate (`identityMatchScore`)**:
  - A facial feature comparison between input and output must verify identity before showing results.
  - If `identityMatchScore < 0.85`, the generation is rejected with clear user guidance ("Please ensure a well-lit, front-facing shot") rather than showing a mismatched person.
- **Pre-Capture Input Quality Validation**:
  - Low lighting, bad angles, and occluded faces cause diffusion models to hallucinate new identities.
  - Adding real-time lighting and face-centering checks in `CameraCapture.tsx` prevents low-quality inputs before generation starts.
- **Reference Result Screen Specifications**:
  - Full-bleed vertical image with zero card framing.
  - `YOUR PHOTO` pill (top-left) and `WEARING [GARMENT NAME]` pill (top-right).
  - Vertical split drag slider with 1:1 pointer tracking and circular grip handle.
  - `HOLD TO VIEW ORIGINAL` momentary press-and-hold button (bottom-left) with eye icon.
  - `DRAG SLIDER TO COMPARE` hint text (bottom-right) that automatically fades after first interaction.

