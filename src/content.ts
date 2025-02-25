import browser from 'webextension-polyfill';

browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
    const event = new CustomEvent('stepSizeChange', { detail: message.payload });
    window.dispatchEvent(event);
});

window.addEventListener('stepSizeRequest', async () => {
    const { stepSize } = (await browser.storage.sync.get('stepSize')) as Record<string, number>;
    const event = new CustomEvent('stepSizeChange', { detail: stepSize });
    window.dispatchEvent(event);
});
