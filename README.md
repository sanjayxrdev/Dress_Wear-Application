# Fitted — Real-Time AI Virtual Try-On & Browser Extension

> **Fitted** is a high-precision, identity-preserving AI Virtual Try-On web platform and companion Manifest V3 browser extension engineered for luxury fashion apparel.

---

## Key Features

### 1. Identity-Preserving Neural Garment Transfer
- **Mask-Conditioned Architecture**: Uses clothing-region segmentation masks (`personMask`) and skeletal landmarks (`poseKeypoints`) to replace *only* the apparel item while preserving the user's face, hair, skin tone, hands, and room environment pixel-for-pixel.
- **Automated Identity Verification Gate**: Automatically evaluates facial structural similarity and color histogram consistency (`identityMatchScore`). Result renders below 85% confidence are gated and flagged with actionable guidance rather than outputting a mismatched person.
- **Room Lighting & Silhouette Harmonization**: Dynamically analyzes the ambient color temperature, luminance, and body posture from the webcam snapshot to blend garment drape naturally with soft drop shadows and contact jawline shadows.

### 2. Live Interactive Webcam Fitting (Tier 1 Web App Core)
- **Real-Time Upper-Body Tracking**: Detects shoulders, neck anchor, and face center at 30–60 FPS directly on the client's laptop camera with Exponential Moving Average (EMA) smoothing to eliminate jitter.
- **Dynamic Garment Conforming**: The selected garment drapes and moves in real time as the user turns, tilts, or steps back.
- **Live Rec Honesty Indicator**: Seamless toggle between *"Live Fit: Active"* and *"Natural View"* with instant garment switching from the bottom rack.

### 3. Full-Bleed Editorial Result Screen & Comparison
- **Editorial Luxury Design**: Pure black/charcoal (`#141413`), warm ivory (`#fcfbf8`), and muted terracotta (`#9e5033`) palette with Playfair Display serif headlines and Plus Jakarta Sans.
- **Interactive Split Slider**: Full-bleed portrait comparison with 1:1 pointer tracking (touch + mouse) and circular midpoint handle.
- **Momentary "Hold to View Original"**: Press-and-hold reveals the unedited source photo instantly.
- **Action Toolbar**: `Try Another`, `Save Look` (synced to personal wardrobe), `Download` high-res output, and `Share`.
- **Fit Calibration Bar**: Live sliders for fine-tuning garment scale (0.85x–1.45x) and collar position shift (-80px to +80px).

### 4. Manifest V3 Browser Extension
- **Universal Apparel Scanning**: Injects discreet editorial "Try-On" badges over clothing images on any shopping site.
- **Floating Shadow DOM Viewfinder**: Completely encapsulated widget to prevent CSS conflicts with host pages; draggable by title bar and resizable.
- **Drag-and-Drop Fallback**: Drag any apparel image onto the widget for instant live overlay and capture.
- **Universal Wardrobe Sync**: Captured looks sync directly to the companion web application.

---

## Tech Stack

- **Framework**: Next.js 16 (Turbopack, App Router)
- **Language**: TypeScript 5
- **Styling**: Tailwind CSS v4, Lucide React Icons
- **Computer Vision**: HTML5 Canvas, MediaStream API, Adaptive Affine Drape Engine
- **Inference Models**: IDM-VTON, CatVTON, Replicate API with intelligent client/server fallback
- **Browser Extension**: Chrome Extension Manifest V3 (TypeScript, Background Service Worker, Shadow DOM Viewfinder)

---

## Getting Started

### Prerequisites
- Node.js 18.17+ or 20+
- npm or yarn

### 1. Installation
```bash
# Clone repository
git clone https://github.com/sanjayxrdev/Dress_Wear-Application.git
cd Dress_Wear-Application

# Install dependencies
npm install
```

### 2. Environment Setup (Optional)
Copy `.env.example` to `.env.local` to enable cloud diffusion providers:
```bash
cp .env.example .env.local
```
Add your optional Replicate token:
```env
REPLICATE_API_TOKEN=r8_your_token_here
```
*(Note: If no API token is supplied, Fitted automatically runs in high-fidelity local neural composite mode with full identity preservation).*

### 3. Run the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4. Build & Install the Chrome Extension
```bash
# Compile extension into extension/dist/
npm run build:extension
```
To install in Google Chrome / Brave / Edge:
1. Navigate to `chrome://extensions/`
2. Toggle on **Developer mode** in the top right.
3. Click **Load unpacked**.
4. Select the `extension/dist/` directory in this project.
5. Visit any clothing shopping website or open the extension popup to start trying on outfits live!

---

## Project Structure

```
├── app/                        # Next.js 16 App Router pages & API routes
│   ├── api/try-on/             # Identity-preserving try-on API endpoint
│   ├── api/user/delete-data/   # GDPR & privacy data management
│   ├── product/[id]/           # Product details & instant try-on entry
│   ├── shop/                   # Luxury catalog rack
│   ├── try-on/                 # Interactive studio with live webcam & slider
│   └── wardrobe/               # Saved looks and outfit collection
├── components/                 # React UI components
│   ├── studio/                 # Studio dual-pane, camera capture, BeforeAfterSlider
│   └── layout/                 # Navigation, header, and footer
├── extension/                  # Chrome Extension Manifest V3
│   ├── src/                    # Content script, background service worker, widget
│   └── dist/                   # Compiled unpacked extension bundle
├── lib/
│   ├── ai/virtual-tryon/       # Provider abstractions (IDM-VTON, demo, identity gate)
│   ├── cv/                     # Real-time garment tracking, segmentation, composites
│   └── db/                     # Store & Supabase integration
└── public/products/            # High-resolution luxury apparel catalog assets
```

---

## License

MIT © [sanjayxrdev](https://github.com/sanjayxrdev)
