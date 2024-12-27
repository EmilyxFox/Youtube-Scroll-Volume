chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const event = new CustomEvent('stepSizeChange', { detail: message.payload })
  window.dispatchEvent(event)
})
