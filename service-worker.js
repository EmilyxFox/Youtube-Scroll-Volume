const sendSettings = (settings) => {
    const event = new CustomEvent('YSVSettingsChanged', { detail: { volumeStep: 10 } })
    window.dispatchEvent(event)
    // YSV_scrollVolumeStepSize = 10
    // return YSV_scrollVolumeStepSize
}

chrome.storage.onChanged.addListener(async (changes) => {
    console.log(changes)
    await chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
        console.log(tabs)
        if (tabs.length !== 0) {
            for (tab of tabs) {
                chrome.scripting
                    .executeScript({
                        target: { tabId: tab.id, allFrames: true },
                        func: sendSettings,
                    })
                    .then((result) => {
                        console.log(result)
                    })
            }
        }
    })
})
