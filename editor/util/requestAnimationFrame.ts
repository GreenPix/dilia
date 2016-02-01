export var requestAnimationFrame: (cb: Function) => void;

if (IS_PRODUCTION) {
    requestAnimationFrame = (window as any).unwrapedRequestAnimationFrame;
} else {
    requestAnimationFrame = (cb) => setTimeout(cb, 100);
}
