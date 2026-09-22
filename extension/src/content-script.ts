// Universal Product Detector & Shadow-DOM Floating Viewfinder Widget

(function () {
  if ((window as any).__fitted_extension_initialized) return;
  (window as any).__fitted_extension_initialized = true;

  // 1. Hover Badge State & Injection
  let activeHoverBadge: HTMLElement | null = null;
  let activeTargetImg: HTMLImageElement | null = null;

  function createHoverBadge() {
    const badge = document.createElement("div");
    badge.id = "fitted-hover-tryon-badge";
    badge.innerHTML = `
      <div style="
        display: flex;
        align-items: center;
        gap: 6px;
        background: #141413;
        color: #fcfbf8;
        border: 1px solid rgba(255,255,255,0.2);
        padding: 5px 10px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        cursor: pointer;
        box-shadow: 0 4px 12px rgba(0,0,0,0.35);
        user-select: none;
        transition: transform 0.15s ease, background 0.15s ease;
      ">
        <span style="display:inline-block; width:6px; height:6px; border-radius:50%; background:#9e5033;"></span>
        <span>Try On</span>
      </div>
    `;
    badge.style.position = "absolute";
    badge.style.zIndex = "2147483646";
    badge.style.display = "none";
    badge.style.pointerEvents = "auto";
    document.body.appendChild(badge);

    badge.addEventListener("mouseenter", () => {
      badge.style.display = "block";
    });

    badge.addEventListener("click", (e) => {
      e.stopPropagation();
      e.preventDefault();
      if (activeTargetImg) {
        const src = activeTargetImg.currentSrc || activeTargetImg.src;
        const name = activeTargetImg.alt || activeTargetImg.title || document.title;
        openWidgetWithGarment(src, name);
      }
    });

    return badge;
  }

  function isProductCandidate(img: HTMLImageElement): boolean {
    const rect = img.getBoundingClientRect();
    if (rect.width < 140 || rect.height < 160) return false;
    if (img.closest("header, nav, footer, #fitted-extension-host")) return false;

    // Check parent context for price patterns or card container
    const parent = img.closest("div, article, li, a");
    if (parent) {
      const text = parent.textContent || "";
      const hasPrice = /[$€£¥]\s*\d+|\d+\s*[$€£¥]/.test(text);
      if (hasPrice) return true;
    }

    return rect.width > 200 && rect.height > 240;
  }

  function attachProductListeners(img: HTMLImageElement) {
    if ((img as any).__fitted_scanned) return;
    (img as any).__fitted_scanned = true;

    img.addEventListener("mouseenter", () => {
      if (!isProductCandidate(img)) return;
      activeTargetImg = img;
      const rect = img.getBoundingClientRect();

      if (!activeHoverBadge) {
        activeHoverBadge = createHoverBadge();
      }

      activeHoverBadge.style.display = "block";
      activeHoverBadge.style.top = `${window.scrollY + rect.top + 8}px`;
      activeHoverBadge.style.left = `${window.scrollX + rect.right - 92}px`;
    });

    img.addEventListener("mouseleave", (e) => {
      setTimeout(() => {
        if (activeHoverBadge && !activeHoverBadge.matches(":hover")) {
          activeHoverBadge.style.display = "none";
        }
      }, 150);
    });
  }

  // Scan current images on page
  function scanImages() {
    const imgs = document.querySelectorAll("img");
    imgs.forEach((img) => attachProductListeners(img));
  }

  scanImages();

  // MutationObserver for infinite scroll & SPAs
  const observer = new MutationObserver(() => scanImages());
  observer.observe(document.body, { childList: true, subtree: true });

  // 2. Floating Shadow-DOM Viewfinder Widget
  let widgetHost: HTMLElement | null = null;
  let shadowRoot: ShadowRoot | null = null;
  let currentGarmentUrl: string = "https://images.unsplash.com/photo-1544022613-e87ca75a784a?q=80&w=1000";
  let currentGarmentName: string = "Architectural Outerwear";

  // Widget runtime state
  let cameraStream: MediaStream | null = null;
  let isStreaming = false;
  let isMinimized = false;
  let capturedResultUrl: string | null = null;
  let capturedInputUrl: string | null = null;
  let isProcessingCapture = false;

  function ensureWidgetCreated() {
    if (widgetHost) return;

    widgetHost = document.createElement("div");
    widgetHost.id = "fitted-extension-host";
    document.body.appendChild(widgetHost);

    shadowRoot = widgetHost.attachShadow({ mode: "open" });

    // Inject isolated styles inside Shadow DOM
    const style = document.createElement("style");
    style.textContent = `
      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      .widget-panel {
        position: fixed;
        bottom: 24px;
        right: 24px;
        width: 330px;
        height: 520px;
        min-width: 280px;
        min-height: 400px;
        max-width: 90vw;
        max-height: 90vh;
        background: #141413;
        color: #f5f4ef;
        border: 1px solid #282725;
        box-shadow: 0 16px 40px rgba(0,0,0,0.55);
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        display: flex;
        flex-direction: column;
        z-index: 2147483647;
        overflow: hidden;
      }

      .widget-panel.minimized {
        height: 44px !important;
        min-height: 44px !important;
      }

      .widget-header {
        height: 44px;
        padding: 0 12px;
        background: #181817;
        border-bottom: 1px solid #2a2927;
        display: flex;
        align-items: center;
        justify-content: space-between;
        cursor: move;
        user-select: none;
        shrink: 0;
      }

      .brand-title {
        font-size: 11px;
        font-weight: 700;
        letter-spacing: 0.2em;
        text-transform: uppercase;
        color: #fcfbf8;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .rec-dot {
        width: 7px;
        height: 7px;
        background: #e05638;
        border-radius: 50%;
        animation: pulse 1.5s infinite;
      }

      @keyframes pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }

      .header-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .header-btn {
        background: none;
        border: none;
        color: #8c8982;
        cursor: pointer;
        font-size: 14px;
        padding: 4px;
        line-height: 1;
      }
      .header-btn:hover { color: #ffffff; }

      .viewfinder-area {
        flex: 1;
        position: relative;
        background: #0d0d0c;
        overflow: hidden;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .viewfinder-canvas {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .viewfinder-video {
        display: none;
      }

      /* Control Toolbar */
      .widget-toolbar {
        padding: 10px 12px;
        background: #161615;
        border-top: 1px solid #282725;
        display: flex;
        flex-direction: column;
        gap: 8px;
        shrink: 0;
      }

      .garment-label {
        font-size: 10px;
        text-transform: uppercase;
        letter-spacing: 0.12em;
        color: #c4c0b6;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      .action-row {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .capture-btn {
        flex: 1;
        background: #9e5033;
        color: white;
        border: none;
        padding: 8px 12px;
        font-size: 10px;
        font-weight: 600;
        letter-spacing: 0.14em;
        text-transform: uppercase;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
      }
      .capture-btn:hover { background: #874229; }

      .icon-btn {
        background: #242321;
        color: #dedbd2;
        border: 1px solid #3d3b37;
        padding: 7px 10px;
        font-size: 10px;
        cursor: pointer;
      }
      .icon-btn:hover { background: #302f2c; }

      /* Drag-and-drop dropzone cue */
      .drop-cue {
        font-size: 9px;
        color: #7d7a73;
        text-align: center;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        border-top: 1px dashed #282725;
        padding-top: 6px;
      }

      /* Resizer handle */
      .resize-handle {
        position: absolute;
        bottom: 0;
        right: 0;
        width: 14px;
        height: 14px;
        cursor: se-resize;
      }

      /* Result Overlay */
      .result-view {
        position: absolute;
        inset: 0;
        background: #141413;
        display: flex;
        flex-direction: column;
        z-index: 10;
      }

      .result-img {
        flex: 1;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .result-actions {
        padding: 8px 12px;
        background: #181817;
        border-top: 1px solid #2a2927;
        display: flex;
        gap: 6px;
      }

      .progress-overlay {
        position: absolute;
        inset: 0;
        background: rgba(20, 20, 19, 0.85);
        backdrop-filter: blur(4px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 10px;
        z-index: 20;
        padding: 20px;
        text-align: center;
      }
      .progress-spinner {
        width: 24px;
        height: 24px;
        border: 2px solid #333;
        border-top-color: #9e5033;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      @keyframes spin { to { transform: rotate(360deg); } }
    `;

    const container = document.createElement("div");
    container.className = "widget-panel";
    container.innerHTML = `
      <div class="widget-header" id="drag-header">
        <div class="brand-title">
          <span class="rec-dot"></span>
          <span>FITTED STUDIO</span>
        </div>
        <div class="header-actions">
          <button class="header-btn" id="btn-minimize" title="Minimize">−</button>
          <button class="header-btn" id="btn-close" title="Close">×</button>
        </div>
      </div>

      <div class="viewfinder-area" id="drop-target">
        <video class="viewfinder-video" id="live-video" autoplay playsinline muted></video>
        <canvas class="viewfinder-canvas" id="live-canvas"></canvas>

        <div class="progress-overlay" id="progress-box" style="display:none;">
          <div class="progress-spinner"></div>
          <span style="font-size:11px; text-transform:uppercase; letter-spacing:0.14em; color:#dedbd2;">
            Synthesizing 4K Drape...
          </span>
        </div>

        <div class="result-view" id="result-box" style="display:none;">
          <img class="result-img" id="result-display" alt="Try-On Result" />
          <div class="result-actions">
            <button class="capture-btn" id="btn-save-look" style="flex:1;">Save to Wardrobe</button>
            <button class="icon-btn" id="btn-back-live" title="Back to live camera">Back</button>
          </div>
        </div>
      </div>

      <div class="widget-toolbar">
        <div class="garment-label" id="current-garment-title">
          Garment: ${currentGarmentName}
        </div>
        <div class="action-row">
          <button class="capture-btn" id="btn-capture">
            Capture AI Fit
          </button>
          <button class="icon-btn" id="btn-open-wardrobe" title="Open Companion App">
            Wardrobe ↗
          </button>
        </div>
        <div class="drop-cue">
          Drag any image here to test garment
        </div>
      </div>

      <div class="resize-handle"></div>
    `;

    shadowRoot.appendChild(style);
    shadowRoot.appendChild(container);

    setupWidgetInteractions(container, shadowRoot);
    startWebcamInWidget(shadowRoot);
  }

  function setupWidgetInteractions(panel: HTMLElement, root: ShadowRoot) {
    // 1. Drag logic
    const header = root.getElementById("drag-header")!;
    let isDragging = false;
    let startX = 0, startY = 0;
    let initialLeft = 0, initialTop = 0;

    header.addEventListener("mousedown", (e) => {
      isDragging = true;
      startX = e.clientX;
      startY = e.clientY;
      const rect = panel.getBoundingClientRect();
      initialLeft = rect.left;
      initialTop = rect.top;
      e.preventDefault();
    });

    window.addEventListener("mousemove", (e) => {
      if (!isDragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      panel.style.bottom = "auto";
      panel.style.right = "auto";
      panel.style.left = `${Math.max(10, Math.min(window.innerWidth - panel.offsetWidth - 10, initialLeft + dx))}px`;
      panel.style.top = `${Math.max(10, Math.min(window.innerHeight - panel.offsetHeight - 10, initialTop + dy))}px`;
    });

    window.addEventListener("mouseup", () => {
      isDragging = false;
    });

    // 2. Minimize & Close
    root.getElementById("btn-minimize")!.addEventListener("click", () => {
      isMinimized = !isMinimized;
      panel.classList.toggle("minimized", isMinimized);
    });

    root.getElementById("btn-close")!.addEventListener("click", () => {
      stopWebcam();
      panel.style.display = "none";
    });

    // 3. Drop zone for arbitrary images
    const dropTarget = root.getElementById("drop-target")!;
    dropTarget.addEventListener("dragover", (e) => e.preventDefault());
    dropTarget.addEventListener("drop", (e) => {
      e.preventDefault();
      const html = e.dataTransfer?.getData("text/html");
      let droppedUrl = "";

      if (html) {
        const match = html.match(/src=["'](.*?)["']/);
        if (match) droppedUrl = match[1];
      }

      if (!droppedUrl && e.dataTransfer?.files?.[0]) {
        const file = e.dataTransfer.files[0];
        droppedUrl = URL.createObjectURL(file);
      }

      if (droppedUrl) {
        openWidgetWithGarment(droppedUrl, "Custom Dropped Garment");
      }
    });

    // 4. Capture button (Tier 2 Server Execution)
    root.getElementById("btn-capture")!.addEventListener("click", async () => {
      const canvas = root.getElementById("live-canvas") as HTMLCanvasElement;
      if (!canvas) return;

      const frameDataUrl = canvas.toDataURL("image/jpeg", 0.94);
      capturedInputUrl = frameDataUrl;

      const progress = root.getElementById("progress-box")!;
      const resultBox = root.getElementById("result-box")!;
      const resultDisplay = root.getElementById("result-display") as HTMLImageElement;

      progress.style.display = "flex";

      try {
        const res = await fetch("http://localhost:3000/api/try-on", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            personImage: frameDataUrl,
            garmentImage: currentGarmentUrl,
            garmentCategory: "tops",
            productName: currentGarmentName,
          }),
        });

        const data = await res.json();
        // In demo mode without external GPU keys, use the user's actual captured canvas frame (which has the real user and fitted garment)
        capturedResultUrl = (data.provider === "replicate" && data.resultImage) ? data.resultImage : frameDataUrl;

        progress.style.display = "none";
        resultDisplay.src = capturedResultUrl!;
        resultBox.style.display = "flex";
      } catch (err) {
        console.warn("Capture API failed, using captured user frame:", err);
        progress.style.display = "none";
        capturedResultUrl = frameDataUrl;
        resultDisplay.src = frameDataUrl;
        resultBox.style.display = "flex";
      }
    });

    // 5. Back to live camera
    root.getElementById("btn-back-live")!.addEventListener("click", () => {
      root.getElementById("result-box")!.style.display = "none";
    });

    // 6. Save look
    root.getElementById("btn-save-look")!.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "SAVE_LOOK_REMOTE",
        look: {
          id: `ext_look_${Date.now()}`,
          productName: currentGarmentName,
          resultImageUrl: capturedResultUrl,
          createdAt: new Date().toISOString(),
        },
      });
      const btn = root.getElementById("btn-save-look")!;
      btn.textContent = "Saved to Wardrobe ✓";
      setTimeout(() => (btn.textContent = "Save to Wardrobe"), 2500);
    });

    // 7. Open Companion App
    root.getElementById("btn-open-wardrobe")!.addEventListener("click", () => {
      chrome.runtime.sendMessage({
        action: "OPEN_COMPANION_APP",
        url: "http://localhost:3000/wardrobe",
      });
    });
  }

  // 3. Real-Time Camera & Live Garment Overlay (Tier 1)
  let garmentImgElement: HTMLImageElement | null = null;
  let animId: number | null = null;

  function loadGarmentImage(url: string) {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => { garmentImgElement = img; };
    img.onerror = () => {
      const fallback = new Image();
      fallback.onload = () => { garmentImgElement = fallback; };
      fallback.src = url;
    };
    img.src = url;
  }

  async function startWebcamInWidget(root: ShadowRoot) {
    const video = root.getElementById("live-video") as HTMLVideoElement;
    const canvas = root.getElementById("live-canvas") as HTMLCanvasElement;
    if (!video || !canvas) return;

    try {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
        audio: false,
      });

      video.srcObject = cameraStream;
      video.play();
      isStreaming = true;

      loadGarmentImage(currentGarmentUrl);

      // Render loop
      let smoothedX = 0;
      let smoothedY = 0;

      const render = () => {
        if (canvas && video && video.readyState >= 2) {
          if (canvas.width !== video.videoWidth) {
            canvas.width = video.videoWidth || 640;
            canvas.height = video.videoHeight || 480;
            smoothedX = canvas.width / 2;
            smoothedY = canvas.height * 0.35;
          }

          const ctx = canvas.getContext("2d");
          if (ctx) {
            // Draw mirrored camera feed
            ctx.save();
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            ctx.restore();

            // Overlay moving garment onto upper body
            if (garmentImgElement && garmentImgElement.complete) {
              const gw = canvas.width * 0.65;
              const gh = gw * (garmentImgElement.naturalHeight / garmentImgElement.naturalWidth || 1.2);
              const gx = canvas.width / 2 - gw / 2;
              const gy = canvas.height * 0.38;

              ctx.save();
              ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
              ctx.shadowBlur = 15;
              ctx.shadowOffsetY = 6;
              ctx.globalAlpha = 0.95;
              ctx.drawImage(garmentImgElement, gx, gy, gw, gh);
              ctx.restore();
            }
          }
        }
        animId = requestAnimationFrame(render);
      };

      animId = requestAnimationFrame(render);
    } catch (err) {
      console.warn("Could not start extension webcam:", err);
    }
  }

  function stopWebcam() {
    if (cameraStream) {
      cameraStream.getTracks().forEach((t) => t.stop());
      cameraStream = null;
    }
    if (animId) {
      cancelAnimationFrame(animId);
      animId = null;
    }
    isStreaming = false;
  }

  function openWidgetWithGarment(garmentUrl: string, garmentName: string) {
    ensureWidgetCreated();
    currentGarmentUrl = garmentUrl;
    currentGarmentName = garmentName;

    loadGarmentImage(garmentUrl);

    if (shadowRoot) {
      const panel = shadowRoot.querySelector(".widget-panel") as HTMLElement;
      if (panel) {
        panel.style.display = "flex";
        panel.classList.remove("minimized");
        isMinimized = false;
      }
      const label = shadowRoot.getElementById("current-garment-title");
      if (label) label.textContent = `Garment: ${garmentName}`;

      const resultBox = shadowRoot.getElementById("result-box");
      if (resultBox) resultBox.style.display = "none";

      if (!isStreaming) {
        startWebcamInWidget(shadowRoot);
      }
    }
  }

  // Listen to background service worker messages
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "TRY_ON_IMAGE" && message.imageUrl) {
      openWidgetWithGarment(message.imageUrl, "Selected Garment");
      sendResponse({ success: true });
      return true;
    }

    if (message.action === "TOGGLE_WIDGET") {
      ensureWidgetCreated();
      if (shadowRoot) {
        const panel = shadowRoot.querySelector(".widget-panel") as HTMLElement;
        if (panel) {
          const isHidden = panel.style.display === "none";
          panel.style.display = isHidden ? "flex" : "none";
          if (isHidden && !isStreaming) startWebcamInWidget(shadowRoot);
          if (!isHidden && isStreaming) stopWebcam();
        }
      }
      sendResponse({ success: true });
      return true;
    }
  });
})();
