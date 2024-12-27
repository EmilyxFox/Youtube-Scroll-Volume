import type { stepSizeChangeEvent, YouTubeVideoPlayer } from '../types/types'

declare global {
  interface WindowEventMap {
    stepSizeChange: stepSizeChangeEvent
  }
}

const isVideoPage = (url: URL): boolean => {
  return url.pathname.startsWith('/watch') || url.pathname.startsWith('/live')
}

chrome.storage.onChanged.addListener(async changes => {
  if (!changes.stepSize) return
  const tabs = await chrome.tabs.query({ url: '*://*.youtube.com/*' })
  for (const tab of tabs) {
    chrome.tabs.sendMessage(tab.id!, { type: 'stepSizeChange', payload: changes.stepSize.newValue })
  }
})

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (!tab.url) return
  const url = new URL(tab.url)

  if (changeInfo.status !== 'complete') return console.debug(`Not a complete page status. Status: ${changeInfo.status}`)

  if (isVideoPage(url)) {
    let stepSize = await readStorageAsync<number>('stepSize')
    console.debug('stepSize', stepSize)

    injectScript(tabId, stepSize)
  }
})
const injectScript = (tabId: number, stepSize: number) => {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    world: 'MAIN',
    args: [stepSize],
    func: stepSize => {
      if (window.trustedTypes?.createPolicy) {
        window.trustedTypes.createPolicy('default', {
          createHTML: (string: string, _sink: unknown) => string,
        })
      }

      window.addEventListener('stepSizeChange', e => {
        stepSize = e.detail
      })

      const tooltip = document.createElement('canvas')
      tooltip.setAttribute('id', 'volume-tooltip')
      tooltip.setAttribute('class', 'tooltip-invisible')
      tooltip.width = 80
      tooltip.height = 60
      const ctx = tooltip.getContext('2d')!
      ctx.font = '40px roboto'
      ctx.shadowColor = 'black'
      ctx.shadowBlur = 7
      ctx.fillStyle = 'white'

      document.body.appendChild(tooltip)

      const generateCssString = () => {
        return `.tooltip-visible {
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
								}`
      }

      const css = document.createElement('style')
      if (window.trustedTypes) {
        css.innerHTML = String(window.trustedTypes.defaultPolicy?.createHTML(generateCssString()))
      } else {
        css.innerHTML = generateCssString()
      }
      const _cssInHead = document.head.appendChild(css)

      let fadeTimeout: number | undefined

      const attachScrollSystem = () => {
        let video = document.querySelector('.html5-video-player') as YouTubeVideoPlayer | null
        if (!video) return console.error('video not found')
        addEventListener(
          'wheel',
          async e => {
            const target = e.target as HTMLElement
            if (!target || !(target.classList.contains('html5-main-video') || target.id === 'volume-tooltip'))
              return console.debug('not scroll on video or volume tooltip', 'verbose')

            e.preventDefault()

            if (!video) {
              return console.error('Video element not found')
            }

            const currentVolume = video.getVolume()
            if (e.deltaY > 0) {
              await video.setVolume(currentVolume - stepSize)
            } else {
              await video.setVolume(currentVolume + stepSize)
            }

            showTooltip(e, video)

            console.log('volume changed', currentVolume, video.getVolume())
          },
          { passive: false },
        )
      }

      attachScrollSystem()

      const showTooltip = (e: WheelEvent, video: YouTubeVideoPlayer) => {
        ctx.clearRect(0, 0, tooltip.width, tooltip.height)
        ctx.fillText(String(video.getVolume()), 10, 50)
        if (tooltip.classList.contains('tooltip-invisible')) {
          tooltip.setAttribute('style', `top: ${e.y - 55}px; left: ${e.x - 20}px`)
        }

        tooltip.setAttribute('class', 'tooltip-visible')

        clearTimeout(fadeTimeout)
        fadeTimeout = setTimeout(() => {
          tooltip.setAttribute('class', 'tooltip-invisible')
        }, 500)
      }
    },
  })
}

const readStorageAsync = async <T>(key: string): Promise<T> => {
  return new Promise((resolve, reject) => {
    chrome.storage.sync.get(key, result => {
      if (!result[key]) {
        reject()
      } else {
        resolve(result[key])
      }
    })
  })
}
