import type { ShaderCraftLanguage } from './library/types.js';
export interface BundledShaderSource {
    /** Self-contained source, with one upstream and technique credit block when symbols were added. */
    source: string;
    /** Newly inserted symbol IDs in dependency order; empty on an unchanged or already bundled program. */
    added: string[];
    /** Technique credit keys for the newly inserted symbols, in library order. */
    credits: string[];
}
/**
 * Inline only referenced library symbols and their dependencies. GLSL includes every overload of each required
 * name; WGSL uses exact names. Program definitions win. Throws when a required map/ZERO contract is absent;
 * it never invents scene geometry, frame uniforms or an entry-point initialization.
 */
export declare function bundleShaderSource(source: string, language: ShaderCraftLanguage): BundledShaderSource;
//# sourceMappingURL=bundler.d.ts.map