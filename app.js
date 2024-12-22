//TODO: add live catchup keyboard shortcut... Preferably Shift + L, which seems hard cus the player (document.querySelector("#movie_player.html5-video-player")) catches L keypresses before they go to the event listener.

if (window.trustedTypes?.createPolicy) {
	window.trustedTypes.createPolicy('default', {
		createHTML: (string, sink) => string,
	})
}

const log = (message, level) => {
	switch (level) {
		case 'verbose':
			console.debug(`%c[YSV] %c${message}`, 'color: red', 'color: white')
			break
		case 'info':
			console.info(`%c[YSV] %c${message}`, 'color: red', 'color: white')
			break
		case 'error':
			console.error(`%c[YSV] %c${message}`, 'color: red', 'color: white')
			break
		default:
			break
	}
}

const volumeStepSize = 5

log('Initialising...', 'info')
let video

const tooltip = document.createElement('canvas')
tooltip.setAttribute('id', 'volume-tooltip')
tooltip.setAttribute('class', 'tooltip-invisible')
tooltip.width = 80
tooltip.height = 60
ctx = tooltip.getContext('2d')
ctx.font = '40px Roboto'
ctx.shadowColor = 'black'
ctx.shadowBlur = 7
ctx.fillStyle = 'white'

document.body.appendChild(tooltip)

const css = document.createElement('style')

css.innerHTML = window.trustedTypes.defaultPolicy.createHTML(`
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
          }`)

document.head.appendChild(css)

let fadeOutTimer

let listener

const attachScrollSystem = () => {
	video = document.querySelector('.html5-video-player')

	listener = addEventListener(
		'wheel',
		async (e) => {
			if (e.target.classList.contains('html5-main-video') || e.target.id === 'volume-tooltip') {
				if (location.pathname.startsWith('/watch') || location.pathname.startsWith('/live')) {
					e.preventDefault()
					const currentVolume = video.getVolume()
					if (e.deltaY > 0) {
						await video.setVolume(currentVolume - volumeStepSize)
					} else {
						await video.setVolume(currentVolume + volumeStepSize)
					}

					showVolume(e)

					log(`New volume: ${video.getVolume()}`, 'verbose')
				}
			}
		},
		{ passive: false },
	)
}

const showVolume = (e) => {
	ctx.clearRect(0, 0, tooltip.width, tooltip.height)
	ctx.fillText(video.getVolume(), 10, 50)
	if (tooltip.classList.contains('tooltip-invisible')) {
		tooltip.setAttribute('style', `left: ${e.x - 20}px; top: ${e.y - 55}px;`)
	}

	tooltip.setAttribute('class', 'tooltip-visible')

	clearTimeout(fadeOutTimer)
	fadeOutTimer = setTimeout(() => {
		tooltip.setAttribute('class', 'tooltip-invisible')
	}, 500)
}

if (location.pathname.startsWith('/watch')) {
	attachScrollSystem()
} else {
	const navigateListenerAbortController = new AbortController()

	addEventListener(
		'yt-navigate-finish',
		(e) => {
			log('Navigation...', 'verbose')
			if (e.detail.pageType === 'watch') {
				log('Watch page found! Attaching scroll listener and aborting navigate listener.', 'info')
				attachScrollSystem()
				navigateListenerAbortController.abort()
			} else {
				log('This is not a watch page.', 'info')
			}
		},
		{ signal: navigateListenerAbortController.signal },
	)
}
