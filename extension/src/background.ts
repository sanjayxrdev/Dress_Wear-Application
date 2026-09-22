// Background Service Worker (Manifest V3)

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "fitted-try-on-image",
    title: "Try this on in Fitted",
    contexts: ["image"],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "fitted-try-on-image" && tab?.id && info.srcUrl) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "TRY_ON_IMAGE",
        imageUrl: info.srcUrl,
      });
    } catch (err) {
      console.warn("Could not send contextMenu message to tab:", err);
    }
  }
});

chrome.action.onClicked.addListener(async (tab) => {
  if (tab?.id) {
    try {
      await chrome.tabs.sendMessage(tab.id, {
        action: "TOGGLE_WIDGET",
      });
    } catch (err) {
      console.warn("Could not send action message to tab:", err);
    }
  }
});

// Message listener for cross-tab or storage requests
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "OPEN_COMPANION_APP") {
    chrome.tabs.create({ url: message.url || "http://localhost:3000/wardrobe" });
    sendResponse({ success: true });
    return true;
  }

  if (message.action === "SAVE_LOOK_REMOTE") {
    // Sync look to local chrome.storage
    (async () => {
      try {
        const res = await chrome.storage.local.get("savedLooks");
        const currentLooks = Array.isArray(res?.savedLooks) ? res.savedLooks : [];
        await chrome.storage.local.set({
          savedLooks: [message.look, ...currentLooks],
        });
        sendResponse({ success: true });
      } catch (e) {
        sendResponse({ success: false, error: String(e) });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
