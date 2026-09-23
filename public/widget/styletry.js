/**
 * StyleTry AI — Embeddable Storefront SDK (v1.0.0)
 * Works out-of-the-box with Shopify, WooCommerce, Magento, BigCommerce, and Custom Stores
 *
 * Usage:
 * <script src="https://your-domain.com/widget/styletry.js" data-merchant-id="merch_atelier_haute" async></script>
 */

(function () {
  'use strict';

  // Prevent duplicate initialization
  if (window.__StyleTryAI_Loaded__) return;
  window.__StyleTryAI_Loaded__ = true;

  const currentScript =
    document.currentScript ||
    document.querySelector('script[src*="styletry.js"]') ||
    document.querySelector('script[data-merchant-id]');

  const merchantId = currentScript?.getAttribute('data-merchant-id') || 'merch_atelier_haute';
  const apiHost = currentScript?.getAttribute('data-host') || window.location.origin;

  let modalContainer = null;
  let activeIframe = null;

  function createModal() {
    if (modalContainer) return modalContainer;

    modalContainer = document.createElement('div');
    modalContainer.id = 'styletry-modal-container';
    modalContainer.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100vw;
      height: 100vh;
      background: rgba(10, 10, 10, 0.85);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      z-index: 9999999;
      display: none;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.25s ease;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    `;

    const frameWrapper = document.createElement('div');
    frameWrapper.style.cssText = `
      position: relative;
      width: 94vw;
      max-width: 1100px;
      height: 90vh;
      max-height: 840px;
      background: #141413;
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    `;

    const iframe = document.createElement('iframe');
    iframe.id = 'styletry-iframe';
    iframe.style.cssText = 'width: 100%; height: 100%; border: none; display: block;';
    iframe.setAttribute('allow', 'camera; microphone; display-capture');
    iframe.setAttribute(
      'sandbox',
      'allow-scripts allow-same-origin allow-forms allow-popups allow-modals'
    );

    activeIframe = iframe;
    frameWrapper.appendChild(iframe);
    modalContainer.appendChild(frameWrapper);
    document.body.appendChild(modalContainer);

    // Close on background backdrop click
    modalContainer.addEventListener('click', (e) => {
      if (e.target === modalContainer) {
        closeFittingRoom();
      }
    });

    return modalContainer;
  }

  function openFittingRoom(productId) {
    const modal = createModal();
    const pid = productId || 'prd_1';
    activeIframe.src = `${apiHost}/widget/embed?merchant_id=${encodeURIComponent(merchantId)}&product_id=${encodeURIComponent(pid)}`;

    modal.style.display = 'flex';
    requestAnimationFrame(() => {
      modal.style.opacity = '1';
    });
    document.body.style.overflow = 'hidden';
  }

  function closeFittingRoom() {
    if (!modalContainer) return;
    modalContainer.style.opacity = '0';
    setTimeout(() => {
      modalContainer.style.display = 'none';
      if (activeIframe) activeIframe.src = 'about:blank';
      document.body.style.overflow = '';
    }, 250);
  }

  // Listen for messages from sandboxed fitting room iframe
  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || typeof data !== 'object') return;

    switch (data.type) {
      case 'STYLETRY_CLOSE':
        closeFittingRoom();
        break;
      case 'STYLETRY_ADD_TO_CART':
        console.log('[StyleTry AI] Add to cart received from fitting room:', data.product);
        window.dispatchEvent(
          new CustomEvent('styletry:add-to-cart', { detail: data.product })
        );
        break;
      case 'STYLETRY_STYLE_MATCH':
        window.dispatchEvent(
          new CustomEvent('styletry:style-match', { detail: data })
        );
        break;
    }
  });

  // Attach click listeners to trigger buttons
  function bindTriggers() {
    const triggers = document.querySelectorAll(
      '[data-styletry-trigger], .styletry-trigger, .styletry-button'
    );
    triggers.forEach((btn) => {
      if (btn.__styletryBound) return;
      btn.__styletryBound = true;
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const productId =
          btn.getAttribute('data-product-id') ||
          btn.getAttribute('data-id') ||
          'prd_1';
        openFittingRoom(productId);
      });
    });
  }

  // Public SDK API attached to window
  window.StyleTryAI = {
    open: openFittingRoom,
    close: closeFittingRoom,
    bind: bindTriggers,
    version: '1.0.0',
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bindTriggers);
  } else {
    bindTriggers();
  }
})();
