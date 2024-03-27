/*
let volumeChangeListenerElement = document.querySelector('.html5-main-video');
volumeChangeListenerElement.onvolumechange = (e) => {
    console.log(e);
};
*/

// document.addEventListener('yt-navigate-finish', () => {
//   console.log('yt navigate')
// })

// document.addEventListener('readystatechange', () => {
//   console.log('player is ready')
// })

// document.addEventListener('yt-player-updated', () => {
// })

let video = document.querySelector('.html5-video-player')

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
ctx.fillText(video.getVolume(), 10, 50)
document.body.appendChild(tooltip)

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
          }
          `
document.head.appendChild(css)

let fadeOutTimer

let listener = addEventListener(
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

      clearTimeout(fadeOutTimer)
      fadeOutTimer = setTimeout(() => {
        tooltip.setAttribute('class', `tooltip-invisible`)
      }, 500)
    }
  },
  { passive: false }
)
