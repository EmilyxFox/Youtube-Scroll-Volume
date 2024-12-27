export interface YouTubeVideoPlayer extends HTMLElement {
  getVolume: () => number
  setVolume: (volume: number) => Promise<void>
}

export interface stepSizeChangeEvent extends Event {
  detail: number
}
