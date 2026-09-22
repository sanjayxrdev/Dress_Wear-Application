# Chrome Web Store Listing — Fitted: Real-Time Virtual Try-On

*Last Updated: 2026-09-22*

---

## 1. Store Metadata

- **Extension Name**: Fitted — Real-Time Virtual Try-On
- **Short Name**: Fitted Try-On
- **Version**: 1.0.0
- **Category**: Shopping & Fashion
- **Default Language**: English

### Short Description (max 132 chars)
Real-time virtual try-on on any shopping site. Try clothes with your live camera as you move, compare results, and save looks.

### Detailed Description
Fitted brings commercial-grade neural virtual try-on to any clothing store on the web.

Instead of guessing your size or visualizing how a garment drapes, Fitted injects a discreet "Try-On" affordance onto apparel images across any e-commerce catalog. Click the badge to open an isolated floating viewfinder widget powered by your laptop webcam.

KEY FEATURES:
• Real-Time Video Fit (Tier 1): Track your upper body in real time as you move in front of the camera, rendering selected shirts, coats, and blazers accurately over your shoulders and chest.
• High-Fidelity AI Capture (Tier 2): Freeze any moment to trigger a photorealistic neural garment transfer with true fabric drape, texture fidelity, and lighting harmony.
• Interactive Before/After Comparison: Drag the split slider to compare the original photo against the AI try-on render.
• Switch Looks Instantly: Click any other garment on the page or drag an image onto the widget to swap outfits without closing or restarting the camera.
• Persistent Wardrobe: Save favorite looks and view your complete fitting history in the companion web app.
• Complete Privacy: Video feeds are processed entirely in local memory on your device. Zero permanent storage of camera feeds. Instant one-click data purge anytime.

---

## 2. Permissions Justification

| Permission / Host Permission | Justification |
| :--- | :--- |
| `storage` | Required to cache user fitting preferences, session identifiers, and temporarily hold saved looks before syncing to the companion web app. |
| `contextMenus` | Allows users to right-click on any garment image on arbitrary sites and select "Try this on in Fitted" for manual fallback mode. |
| `activeTab` | Required to communicate with the active tab when the extension action icon is clicked to toggle the try-on widget. |
| `<all_urls>` (host_permissions) | Necessary to inject product detection badges and the isolated try-on viewfinder widget across any online clothing store the user visits. |

---

## 3. Privacy & Data Use Disclosure

- **Camera Usage**: The camera is ONLY accessed when the user explicitly triggers a try-on session. Raw video frames are processed locally inside client memory and are never uploaded or retained.
- **Single-Frame Capture**: Only the single frame the user explicitly approves via "Capture AI Fit" is sent to the server-side try-on API for still generation.
- **Personal Data**: No personal browsing history or third-party tracking data is collected, sold, or shared with data brokers.
- **Data Deletion**: Users can delete all saved looks and try-on history at any time from the companion web app profile.

---

## 4. Pre-Publish Checklist

- [x] Manifest V3 compliant (`manifest_version: 3`)
- [x] All icon files exist at exact dimensions (`16x16`, `48x48`, `128x128`)
- [x] Service worker does not hold persistent state in memory variables
- [x] Content script updates use `requestAnimationFrame`
- [x] Shadow DOM isolation prevents host-page style leakage
- [x] Zero `eval()` or un-sandboxed code execution
- [x] All chrome.* API promises properly handled with `async/await`
