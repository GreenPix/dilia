interface NodeRequire {
    <T>(path: string): T;
    (paths: string[], callback: (...modules: any[]) => void): void;
    ensure: (paths: string[], callback: (require: <T>(path: string) => T) => void) => void;
}

// declare var require: WebpackRequire;

declare module Webpack {
    interface ToStr {
        toString(): string;
    }

    interface Scss extends ToStr {}
}
