import { isVideoPage } from '$lib/utils/helpers';
import type { YouTubeVideoPlayer } from '$lib/utils/types';

declare global {
    interface Window {
        YTSVAlreadyInjected: boolean;
    }
}

if (window.YTSVAlreadyInjected) {
    console.debug('already injected');
} else {
    window.YTSVAlreadyInjected = true;

    let stepSize = 5;

    window.addEventListener('stepSizeChange', (e) => {
        stepSize = e.detail;
        console.debug(`Message caught in the inject. ${stepSize}`);
    });

    console.debug('dispatching stepSizeRequest');
    const stepSizeRequestEvent = new CustomEvent('stepSizeRequest');
    window.dispatchEvent(stepSizeRequestEvent);

    let fadeTimeout: number;

    const tooltip = document.createElement('canvas');
    tooltip.setAttribute('id', 'volume-tooltip');
    tooltip.className = 'tooltip-invisible';
    tooltip.width = 80;
    tooltip.height = 60;

    const ctx = tooltip.getContext('2d')!;
    ctx.font = '40px roboto';
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 7;
    ctx.fillStyle = 'white';

    document.body.appendChild(tooltip);

    const showTooltip = (e: WheelEvent, volume: number) => {
        ctx.clearRect(0, 0, tooltip.width, tooltip.height);
        ctx.fillText(String(volume), 10, 50);

        tooltip.className = 'tooltip-visible';
        if (fadeTimeout === 0 || !fadeTimeout) {
            tooltip.style.left = `${e.x - 20}px`;
            tooltip.style.top = `${e.y - 55}px`;
        }

        clearTimeout(fadeTimeout);
        fadeTimeout = window.setTimeout(() => {
            tooltip.className = 'tooltip-invisible';
            fadeTimeout = 0;
        }, 500);
    };

    const handleWheel = (e: WheelEvent) => {
        if (isVideoPage(new URL(window.location.href))) {
            const target = e.target as HTMLElement;
            if (!target?.classList.contains('html5-main-video')) return;

            let video = document.querySelector('.html5-video-player') as YouTubeVideoPlayer;
            if (!video) return console.debug('No video');

            e.preventDefault();

            const currentVolume = video.getVolume();

            const newVolume = e.deltaY > 0 ? Math.max(0, currentVolume - stepSize) : Math.min(100, currentVolume + stepSize);

            console.debug(`currentVolume: ${currentVolume} newVolume: ${newVolume}`);

            showTooltip(e, newVolume);
            video.setVolume(newVolume);
        }
    };

    document.addEventListener('wheel', handleWheel, { passive: false });
}
