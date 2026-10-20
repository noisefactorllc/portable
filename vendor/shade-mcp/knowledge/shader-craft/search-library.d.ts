import type { ShaderCraftLanguage, ShaderCraftModuleName } from './library/types.js';
export interface ShaderLibrarySearchOptions {
    language?: ShaderCraftLanguage;
    limit?: number;
}
export interface ShaderLibrarySearchResult {
    id: string;
    language: ShaderCraftLanguage;
    name: string;
    signature: string;
    summary: string;
    module: ShaderCraftModuleName;
}
/** Search the local symbol index by name, signature, module and summary. Default language GLSL, limit 15. */
export declare function searchShaderLibrary(query: string, options?: ShaderLibrarySearchOptions): ShaderLibrarySearchResult[];
//# sourceMappingURL=search-library.d.ts.map