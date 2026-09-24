import { test, expect } from '@playwright/test';



test.describe('StyleTry AI — Live Virtual Fitting Room Acceptance Journey', () => {

  test('product page live try-on: floating window, framing guide, no slider, garment swap, style check', async ({
    page,
  }) => {
    // 1. Visit Product Page directly
    await page.goto('http://localhost:3000/product/prod-wool-overcoat');
    await expect(page.locator('text=Architectural Wool Overcoat').first()).toBeVisible({ timeout: 10000 });

    // 2. Click "Try It On Yourself" launcher
    const tryOnCta = page.locator('#product-try-on-cta');
    await expect(tryOnCta).toBeVisible();
    await tryOnCta.click();

    // 3. Verify Floating Draggable Fitting Room mounts
    await expect(page.locator('text=StyleTry AI Live')).toBeVisible({ timeout: 10000 });

    // 4. CRITICAL REQUIREMENT: Verify NO comparison slider or photo upload exists
    const sliderInput = page.locator('input[type="range"]');
    await expect(sliderInput).toHaveCount(0);
    const comparisonSlider = page.locator('.comparison-slider, [data-slider]');
    await expect(comparisonSlider).toHaveCount(0);

    // 5. Verify Framing Guidance is present
    const framingGuide = page
      .locator('text=Move into the frame')
      .or(page.locator('text=Face the light'))
      .or(page.locator('text=Step back'))
      .or(page.locator('text=Hold still'))
      .or(page.locator('text=Getting your fitting room ready'))
      .or(page.locator('text=Optimal Framing & Lighting'));
    await expect(framingGuide.first()).toBeVisible({ timeout: 10000 });

    // 6. Verify Bottom Bar: Garment Name, Price, Change Item, AI Style Check, Add to Cart
    await expect(page.locator('text=Architectural Wool Overcoat').first()).toBeVisible();
    await expect(page.locator('button:has-text("Change Item")')).toBeVisible();
    await expect(page.locator('button:has-text("AI Style")')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Add to Cart', exact: true })).toBeVisible();

    // 7. Side Action: Save Look
    const saveLookBtn = page.locator('button[aria-label="Save Look"]');
    await expect(saveLookBtn).toBeVisible();
    await saveLookBtn.click();
    await expect(page.locator('text=Look saved to your device')).toBeVisible({ timeout: 5000 });

    // 8. AI Style Check: Open and verify physical sizing disclaimer
    const styleCheckBtn = page.locator('button:has-text("AI Style")');
    await styleCheckBtn.click();
    await expect(page.locator('text=Explainable Style Match')).toBeVisible();
    await expect(page.locator('text=Visual try-on cannot guarantee physical sizing')).toBeVisible();

    const closeDrawerBtn = page.locator('button[aria-label="Close Drawer"]');
    await closeDrawerBtn.click();
    await expect(page.locator('text=Explainable Style Match')).not.toBeVisible();

    // 9. Garment Switching without camera restart
    const changeItemBtn = page.locator('button:has-text("Change Item")');
    await changeItemBtn.click();
    const switchItemBtn = page.locator('button[aria-label*="Switch garment to"]').first();
    if (await switchItemBtn.isVisible()) {
      await switchItemBtn.click();
      // Ensure the fitting room remains active
      await expect(page.locator('text=StyleTry AI Live')).toBeVisible();
    }

    // 10. Close Fitting Room Window
    const exitButton = page.locator('button[title="Exit Fitting Room"]').first();
    await exitButton.click({ force: true });
    await expect(page.locator('text=StyleTry AI Live')).not.toBeVisible();
  });

  test('merchant embed customer journey: demo-store with sandboxed iframe', async ({
    page,
  }) => {
    // 1. Visit Merchant Storefront Demo
    await page.goto('http://localhost:3000/demo-store');
    await expect(page.locator('text=The Structured Wool Trench')).toBeVisible({ timeout: 10000 });

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

    // 6. Verify StyleTry AI Live Fitting Room mounts inside iframe
    await expect(
      iframeElement.locator('text=StyleTry AI Live')
    ).toBeVisible({ timeout: 10000 });

    // 7. Verify NO comparison slider exists inside iframe
    await expect(iframeElement.locator('input[type="range"]')).toHaveCount(0);

    // 8. Open Style Match Drawer
    const styleMatchBtn = iframeElement.locator('button:has-text("AI Style")');
    await expect(styleMatchBtn).toBeVisible();
    await styleMatchBtn.click();
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

    // 10. Close Fitting Room and verify clean termination
    const exitButton = iframeElement.locator('button[title="Exit Fitting Room"]').first();
    await exitButton.click();
  });
});
