
let injectedCss: { [css: string]: boolean } = {};

export function injectCss(css: string) {
    if (!injectedCss[css]) {
        let styleNode = document.createElement('style');
        styleNode.innerHTML = css;
        document.head.appendChild(styleNode);
        injectCss[css] = true;
    }
}
