import type { ShaderCraftLanguage } from './library/types.js';
export type ShaderSourceRule = 'sine-hash' | 'reversed-smoothstep' | 'shadertoy-contract' | 'derivative-control-flow' | 'nan-risk' | 'integer-float-mix' | 'round' | 'unbounded-loop';
/** Advisory only: severity describes the source problem, never a compilation or publication verdict. */
export interface ShaderSourceFinding {
    rule: ShaderSourceRule;
    severity: 'error' | 'warning';
    /** 1-based source line; comments and blank lines count. */
    line: number;
    message: string;
}
/** Conservatively lint GLSL/WGSL source. This tolerant, dependency-free checker is advisory, not a compiler. */
export declare function checkShaderSource(source: string, language: ShaderCraftLanguage): ShaderSourceFinding[];
//# sourceMappingURL=checker.d.ts.map