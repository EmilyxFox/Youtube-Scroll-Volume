const log = (message, level) => {
  switch (level) {
    case 'verbose':
      console.debug('%c[YSV] ' + `%c${message}`, 'color: red', 'color: white')
      break
    case 'info':
      console.info('%c[YSV] ' + `%c${message}`, 'color: red', 'color: white')
      break
    case 'error':
      console.error('%c[YSV] ' + `%c${message}`, 'color: red', 'color: white')
      break
    default:
      break
  }
}

log('test verbose', 'verbose')
log('test info', 'info')
log('test error', 'error')

log('Initialising...', 'info')
// Create video variable for assignment later
let video

// Create tooltip element and append it to the body
let tooltip = document.createElement('canvas')
tooltip.setAttribute('id', 'volume-tooltip')
tooltip.setAttribute('class', 'tooltip-invisible')
tooltip.width = 80
tooltip.height = 60
ctx = tooltip.getContext('2d')
ctx.font = '40px Roboto'
ctx.shadowColor = 'black'
ctx.shadowBlur = 7
ctx.fillStyle = 'white'
// ctx.fillText(video.getVolume(), 10, 50)

document.body.appendChild(tooltip)

// Append tooltip css to the body
let css = document.createElement('style')

css.innerHTML = `
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
          }`

document.head.appendChild(css)

// Create variable for tooltip fadeout timer
let fadeOutTimer

// Create variable for listener
let listener

const attachScrollSystem = () => {
  // Assign video element to video variable
  video = document.querySelector('.html5-video-player')

  // Attach scroll listener to the window
  listener = addEventListener(
    'wheel',
    async (e) => {
      //console.log(e);
      if (e.target.classList.contains('html5-main-video') || e.target.id === 'volume-tooltip') {
        e.preventDefault()
        let currentVolume = video.getVolume()
        if (e.deltaY > 0) {
          await video.setVolume(currentVolume - 5)
        } else {
          await video.setVolume(currentVolume + 5)
        }
        ctx.clearRect(0, 0, tooltip.width, tooltip.height)
        ctx.fillText(video.getVolume(), 10, 50)
        if (tooltip.classList.contains('tooltip-invisible')) {
          tooltip.setAttribute('style', `left: ${e.x - 20}px; top: ${e.y - 55}px;`)
        }
        tooltip.setAttribute('class', 'tooltip-visible')

        log(`New volume: ${video.getVolume()}`, 'verbose')

        clearTimeout(fadeOutTimer)
        fadeOutTimer = setTimeout(() => {
          tooltip.setAttribute('class', `tooltip-invisible`)
        }, 500)
      }
    },
    { passive: false }
  )
}

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
  { signal: navigateListenerAbortController.signal }
)
