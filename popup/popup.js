document.getElementById('testSetting').addEventListener('click', (e) => {
    chrome.storage.local.set({ randomId: Math.floor(Math.random() * 1000) }).then((e) => {
        console.log('storage set')
    })
})
