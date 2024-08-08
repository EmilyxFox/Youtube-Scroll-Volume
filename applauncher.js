chrome.storage.local.get(['stepSize']).then((r) => {
    console.log(r)
})

chrome.runtime.sendMessage('whatsMyTabId', (response) => {
    console.log(response)
})
