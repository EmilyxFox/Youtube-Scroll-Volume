const sendSettings = (settings) => {
    const event = new CustomEvent('YSVSettingsChanged', { detail: { stepSize: settings.stepSize } })
    window.dispatchEvent(event)
    // YSV_scrollVolumeStepSize = 10
    // return YSV_scrollVolumeStepSize
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg === 'whatsMyTabId') {
        // Execute the script in the main world
        chrome.scripting
            .executeScript({
                target: { tabId: sender.tab.id },
                files: ['app.js'],
                world: 'MAIN',
            })
            .then((result) => {
                // Script execution successful, extract globals from the result
                const globals = result[0]
                sendResponse({ success: true, globals: globals })
            })
            .catch((error) => {
                // Error executing the script
                console.error('Error injecting script:', error.message)
                sendResponse({ success: false, error: error.message })
            })

        // Return true to indicate that sendResponse will be called asynchronously
        return true
    }
})

chrome.storage.onChanged.addListener(async (changes) => {
    if (changes.stepSize) {
        await chrome.tabs.query({ url: '*://*.youtube.com/*' }, (tabs) => {
            if (tabs.length !== 0) {
                for (tab of tabs) {
                    chrome.scripting
                        .executeScript({
                            target: { tabId: tab.id, allFrames: true },
                            func: sendSettings,
                            args: [{ stepSize: changes.stepSize.newValue }],
                        })
                        .then((result) => {
                            console.log(result)
                        })
                }
            }
        })
    }
})
