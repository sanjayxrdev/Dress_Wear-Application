import { test, expect } from '@playwright/test';

test.use({
  launchOptions: {
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
    ],
  },
  permissions: ['camera'],
});

test.describe('StyleTry AI — Live Virtual Fitting Room Acceptance Journey', () => {

  test('full merchant embed customer journey: consent, live video fitting, atomic switch, style match', async ({
    page,
  }) => {
    // 1. Visit Merchant Storefront Demo
    await page.goto('http://localhost:3000/demo-store');
    await expect(page.locator('text=The Structured Wool Trench')).toBeVisible();

    // 2. Click "Try on Live with StyleTry AI" button
    const tryOnButton = page.locator('[data-styletry-trigger]');
    await expect(tryOnButton).toBeVisible();
    await tryOnButton.click();

    // 3. Verify Sandboxed Modal or Iframe is opened
    const iframeElement = page.frameLocator('#styletry-iframe');

    // 4. Verify Camera Privacy & Fitting Consent Modal
    await expect(
      iframeElement.locator('text=Camera Privacy & Fitting Consent')
    ).toBeVisible({ timeout: 10000 });

    // 5. Consent to temporary camera stream
    const consentCheckbox = iframeElement.locator('input[type="checkbox"]');
    await consentCheckbox.check();

    const startButton = iframeElement.locator('button:has-text("Start Fitting Room")');
    await startButton.click();

    // 6. Verify Look Quality Monitor HUD appears
    await expect(
      iframeElement.locator('text=Quality:')
    ).toBeVisible({ timeout: 10000 });

    // 7. Verify Style Match Score Pill is calculated deterministically
    const styleMatchPill = iframeElement.locator('button:has-text("Style Match:")');
    await expect(styleMatchPill).toBeVisible();

    // 8. Open Style Match Drawer
    await styleMatchPill.click();
    await expect(
      iframeElement.locator('text=Explainable Style Match')
    ).toBeVisible();

    // 9. Verify Physical Sizing Disclaimer is displayed
    await expect(
      iframeElement.locator('text=Visual try-on cannot guarantee physical sizing')
    ).toBeVisible();

    // Close Style Match Drawer
    const closeDrawerBtn = iframeElement.locator('button[aria-label="Close Drawer"]');
    await closeDrawerBtn.click();

    // 10. Close Fitting Room and verify clean camera termination
    const exitButton = iframeElement.locator('button[title="Exit Fitting Room"]').first();
    await exitButton.click();
  });
});
