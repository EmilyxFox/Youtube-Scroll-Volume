import { isVideoPage } from '$lib/utils/helpers';
import type { stepSizeChangeEvent, stepSizeRequestEvent } from '$lib/utils/types';
import browser from 'webextension-polyfill';

declare global {
    interface WindowEventMap {
        stepSizeChange: stepSizeChangeEvent;
        stepSizeRequest: stepSizeRequestEvent;
    }
}

console.log('Hello from the background!');

browser.runtime.onInstalled.addListener((details) => {
    console.log('Extension installed:', details);

    if (details.reason === 'install') {
        console.log('Setting default stepSize to 5');
        browser.storage.sync.set({ stepSize: 5 });
    }
});

browser.storage.onChanged.addListener(async (changes) => {
    if (!changes.stepSize) return;
    const tabs = await browser.tabs.query({ url: '*://*.youtube.com/*' });
    for (const tab of tabs) {
        browser.tabs.sendMessage(tab.id!, { type: 'stepSizeChange', payload: changes.stepSize.newValue });
    }
});

browser.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (!tab.url) return console.log('No tab URL', tab);

    if (changeInfo.status !== 'complete') return;
    console.log('tab update complete');

    console.log('Youtube page');

    const url = new URL(tab.url);

    if (isVideoPage(url)) {
        console.log('this is video page... injecting');
        const { stepSize } = (await browser.storage.sync.get('stepSize')) as Record<string, number>;
        browser.scripting.executeScript({
            target: { tabId },
            args: [browser.runtime.getURL('src/inject.js')],
            func: injectScriptToPage,
        });

        await browser.scripting.insertCSS({
            target: { tabId },
            css: `
                .volume-tooltip {
                    opacity: 0;
                    transition: opacity 0.5s;
                    display: block;
                    z-index: 2147483647;
                    position: fixed;
                    pointer-events: none;
                }

                .tooltip-visible {
                    opacity: 1 !important;
                }

                 .tooltip-invisible {
                    opacity: 0;
                    transition: opacity 0.5s;
                }

                 #volume-tooltip {
                    display: block;
                    z-index: 2147483647;
                    position: fixed;
                    pointer-events: none;
                }
            `,
        });

        injectContentScript(tabId, stepSize);
    }
});

function injectScriptToPage(scriptUrl: string) {
    const script = document.createElement('script');
    script.src = scriptUrl;
    script.onload = () => script.remove();
    document.documentElement.appendChild(script);
}

const injectContentScript = async (tabId: number, stepSize: number) => {
    console.log('Injecting...');
    await browser.scripting.executeScript({
        target: { tabId },
        args: [stepSize],
        func: (stepSize) => {
            window.addEventListener('stepSizeChange', (e) => {
                stepSize = e.detail;
            });

            const event = new CustomEvent('stepSizeChange', { detail: stepSize });
            window.dispatchEvent(event);
        },
    });
};
