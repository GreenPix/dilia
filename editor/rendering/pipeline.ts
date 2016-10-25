import {Pipeline} from './interfaces';

/// Re-export for convenience.
export {Pipeline} from './interfaces';

export const DoNothing: Pipeline = { render: (_gl: WebGLRenderingContext) => {} };
