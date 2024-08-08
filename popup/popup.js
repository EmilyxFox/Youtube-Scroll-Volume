const updateSettings = (stepSize) => {
    chrome.storage.local.set({ randomId: Math.floor(Math.random() * 1000), stepSize: stepSize }).then(() => {
        console.log('storage set')
    })
}

document.getElementById('stepOne').addEventListener('click', (e) => {
    updateSettings(1)
})
document.getElementById('stepFive').addEventListener('click', (e) => {
    updateSettings(5)
})
document.getElementById('stepTen').addEventListener('click', (e) => {
    updateSettings(10)
})
