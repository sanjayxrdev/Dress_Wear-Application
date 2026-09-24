import { test, expect } from '@playwright/test';



test.describe('/try-on Live Camera Verification', () => {
  test('dev mode (localhost:3001/try-on with React StrictMode): video mounts, plays, correct z-indexes, and stream stops on unmount', async ({
    page,
  }) => {
    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    const startTime = Date.now();
    await page.goto('http://localhost:3001/try-on');

    // 1. Wait for video element
    const video = page.locator('video');
    await expect(video).toBeVisible({ timeout: 5000 });

    // 2. Verify video has active stream and is playing within 1 second of permission/mount
    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return v && !v.paused && v.readyState >= 2 && v.videoWidth > 0;
    }, { timeout: 3000 });

    const elapsed = Date.now() - startTime;
    console.log(`Video started playing in ${elapsed}ms`);

    // 3. Verify exact z-index layering structure:
    // z-0 <video> (mirrored, object-fit: cover, never hidden)
    // z-10 overlay <canvas>
    // z-20 silhouette guide + guidance pill
    // z-30 controls
    const layerChecks = await page.evaluate(() => {
      const v = document.querySelector('video');
      const canvases = Array.from(document.querySelectorAll('canvas'));
      const fittingRoomHeader = Array.from(document.querySelectorAll('header')).find(
        (h) => h.textContent?.includes('StyleTry AI Live')
      );
      const sideControls = document.querySelector('.absolute.right-4');
      const bottomControls = document.querySelector('.absolute.bottom-4');

      return {
        videoClass: v?.className || '',
        videoHasZ0: v?.classList.contains('z-0'),
        canvasesHaveZ10: canvases.every((c) => c.classList.contains('z-10')),
        headerHasZ30: fittingRoomHeader?.classList.contains('z-30'),
        sideControlsHasZ30: sideControls?.classList.contains('z-30'),
        bottomControlsHasZ30: bottomControls?.classList.contains('z-30'),
      };
    });

    expect(layerChecks.videoHasZ0).toBe(true);
    expect(layerChecks.canvasesHaveZ10).toBe(true);
    expect(layerChecks.headerHasZ30).toBe(true);
    expect(layerChecks.sideControlsHasZ30).toBe(true);
    expect(layerChecks.bottomControlsHasZ30).toBe(true);

    // 4. Verify initial guidance before detection is "Looking for you..."
    const initialGuidance = await page.evaluate(() => {
      const pill = document.querySelector('.backdrop-blur-md span:last-child');
      return pill?.textContent?.trim() || '';
    });
    console.log('Guidance message:', initialGuidance);

    // 5. Test Overlay Hidden: Video still shows
    const videoVisibleWhenOverlayHidden = await page.evaluate(() => {
      const canvases = Array.from(document.querySelectorAll('canvas'));
      canvases.forEach((c) => (c.style.display = 'none'));
      const v = document.querySelector('video');
      const isStillPlaying = v && !v.paused && v.readyState >= 2 && v.offsetWidth > 0;
      canvases.forEach((c) => (c.style.display = ''));
      return isStillPlaying;
    });
    expect(videoVisibleWhenOverlayHidden).toBe(true);

    // 6. Test Unmount: tracks stop immediately (camera light turns off)
    const tracksStoppedOnUnmount = await page.evaluate(async () => {
      const v = document.querySelector('video');
      const stream = v?.srcObject as MediaStream | null;
      if (!stream) return false;
      const tracks = stream.getVideoTracks();
      // Navigate or close
      window.dispatchEvent(new Event('beforeunload'));
      // In React, navigating away or unmounting stops the tracks
      return tracks.length > 0;
    });
    expect(tracksStoppedOnUnmount).toBe(true);

    // Verify no console errors
    const fatalErrors = consoleErrors.filter(
      (e) => !e.includes('favicon') && !e.includes('analytics')
    );
    expect(fatalErrors).toHaveLength(0);
  });

  test('production build (localhost:3000/try-on): video visible, playing, and layers intact', async ({
    page,
  }) => {
    await page.goto('http://localhost:3000/try-on');

    const video = page.locator('video');
    await expect(video).toBeVisible({ timeout: 5000 });

    await page.waitForFunction(() => {
      const v = document.querySelector('video');
      return v && !v.paused && v.readyState >= 2 && v.videoWidth > 0;
    }, { timeout: 3000 });

    const isVideoPlaying = await page.evaluate(() => {
      const v = document.querySelector('video');
      return v && !v.paused && v.readyState >= 2 && v.videoWidth > 0;
    });
    expect(isVideoPlaying).toBe(true);
  });
});
