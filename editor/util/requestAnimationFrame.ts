export let requestAnimationFrame: (cb: Function) => void;

if (IS_PRODUCTION) {
    requestAnimationFrame = (window as any).unwrapedRequestAnimationFrame.bind(window);
} else {
    requestAnimationFrame = (cb) => (window as any).unwrapedSetTimeout(cb, 50);
}
