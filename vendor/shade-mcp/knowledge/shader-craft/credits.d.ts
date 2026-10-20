export interface ShaderCraftTechniqueCredit {
    /** Stable key that library index entries cite (ShaderCraftLibrarySymbol.credits). */
    key: string;
    /** What the technique is used for in the shader-craft knowledge and library. */
    technique: string;
    /** The original source of the technique: author and title. */
    source: string;
    /** The terms of the source, or how the technique was reimplemented, as upstream records it. */
    terms: string;
}
export interface ShaderCraftCredits {
    /** The adapted work, its licence and its copyright line. */
    adaptedFrom: string;
    /** How upstream treats third-party sources. */
    policy: string;
    techniques: ShaderCraftTechniqueCredit[];
}
export declare const SHADER_CRAFT_CREDITS: ShaderCraftCredits;
//# sourceMappingURL=credits.d.ts.map