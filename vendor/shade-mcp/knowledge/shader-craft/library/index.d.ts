import type { ShaderCraftLanguage, ShaderCraftLibraryModule, ShaderCraftProgramSymbol } from './types.js';
export { SHADER_CRAFT_LIBRARY } from './symbols.js';
export type * from './types.js';
/** The library modules in declaration order, with the full GLSL and WGSL source of each. */
export declare const SHADER_CRAFT_LIBRARY_MODULES: ShaderCraftLibraryModule[];
/** Symbols the effect program defines for the raymarch functions, which call them. */
export declare const SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS: ShaderCraftProgramSymbol[];
/** How the library is written and how a program uses it. */
export declare const SHADER_CRAFT_LIBRARY_CONVENTIONS: {
    /** GLSL programs that use the library declare these: the hashes need 32-bit uint. */
    glslPrecision: string;
    wgslNaming: string;
    wgslTypeCodes: Record<string, string>;
    wgslParameters: string;
    noUniforms: string;
    parity: string;
};
/**
 * The source of one library symbol in one language: its declaration and body, without doc comments.
 * A bundler that copies symbols into a program emits SHADER_CRAFT_LIBRARY entries in index order, so every
 * dependency precedes its users, and adds the GLSL map() prototype before any symbol that requires map.
 */
export declare function getShaderCraftSymbolSource(id: string, language: ShaderCraftLanguage): string;
//# sourceMappingURL=index.d.ts.map