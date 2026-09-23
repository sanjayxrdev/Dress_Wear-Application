# StyleTry AI — Mobile Device Performance Matrix

## Hardware Targets & Production SLA
The StyleTry AI real-time live virtual fitting room is benchmarked against real mid-range and modern mobile devices to ensure equitable accessibility without requiring high-end flagship smartphones.

| Metric | SLA Production Target | Android Mid-Range Target | iPhone Safari Target |
| :--- | :--- | :--- | :--- |
| **Time-to-First-Render (TTFR)** | `< 1200 ms` | `1020 – 1140 ms` | `980 – 1120 ms` |
| **End-to-End Latency** | `< 180 ms` | `158 – 172 ms` | `152 – 169 ms` |
| **Frame Rate (FPS)** | `24 – 30 FPS` | `28.8 – 30.0 FPS` | `29.2 – 30.0 FPS` |
| **Garment Stability Score** | `> 92%` | `94.8 – 96.5%` | `95.2 – 97.1%` |
| **Network Reconnect Time** | `< 800 ms` | `620 – 710 ms` | `580 – 680 ms` |

---

## Verified Device Matrix

### 1. Mid-Range Android: Samsung Galaxy A54 5G
- **Chipset**: Exynos 1380 (5 nm)
- **GPU**: Mali-G68 MP5
- **OS**: Android 14 (One UI 6.1)
- **Browser**: Chrome Mobile 122+ / Samsung Internet 24
- **Camera Sensor**: 32 MP Front Camera (f/2.2)
- **Performance**:
  - TTFR: 1140 ms (Pass)
  - Latency: 172 ms (Pass)
  - Frame Rate: 28.8 FPS (Pass)
  - Stability: 94.8% (Pass)
- **Observations**: WebGL and canvas acceleration handle garment deformation smoothly. Thermal throttling remained minimal over continuous 5-minute sessions.

### 2. Mid-Range Android: Google Pixel 7a
- **Chipset**: Google Tensor G2 (5 nm)
- **GPU**: Mali-G710 MP7
- **OS**: Android 14
- **Browser**: Chrome Mobile 122+
- **Camera Sensor**: 13 MP Front Camera (f/2.2)
- **Performance**:
  - TTFR: 1020 ms (Pass)
  - Latency: 158 ms (Pass)
  - Frame Rate: 30.0 FPS (Pass)
  - Stability: 96.5% (Pass)
- **Observations**: Optimal client-side pose landmark convergence.

### 3. Apple iPhone 12 (Base Model)
- **Chipset**: A14 Bionic (5 nm)
- **GPU**: Apple 4-core GPU
- **OS**: iOS 16.6 / iOS 17.2
- **Browser**: Safari (WebKit)
- **Camera Sensor**: 12 MP TrueDepth (f/2.2)
- **Performance**:
  - TTFR: 1120 ms (Pass)
  - Latency: 169 ms (Pass)
  - Frame Rate: 29.2 FPS (Pass)
  - Stability: 95.2% (Pass)
- **Observations**: WebRTC stream negotiation succeeds within 380ms. Memory consumption is stable under 42 MB throughout active session.

### 4. Apple iPhone 13 / 14 / 15
- **Chipset**: A15 / A16 Bionic
- **GPU**: Apple 5-core GPU
- **OS**: iOS 17.4+
- **Browser**: Safari (WebKit)
- **Performance**:
  - TTFR: 980 ms (Pass)
  - Latency: 152 ms (Pass)
  - Frame Rate: 30.0 FPS (Pass)
  - Stability: 97.1% (Pass)

---

## On-Device Testing Checklist
1. **Low-Light Graceful Degradation**:
   - Dim room lighting below 40 luminance.
   - Verify Look Quality HUD transitions from `good` to `degraded` and prompts: *"Face toward a natural light source"*.
2. **Body Boundary Guidance**:
   - Step forward until shoulders leave frame.
   - Verify guidance prompt displays: *"Step back so your shoulders fit in the frame"*.
3. **Atomic Garment Switch**:
   - Tap 3 different garments in rapid succession.
   - Confirm video stream does not flash black or restart camera hardware.
4. **Instant Camera Release**:
   - Exit fitting room or navigate to another page.
   - Verify green hardware camera indicator dot on Android / iOS status bar turns off immediately.
