import type { BundledShaderSource } from './bundler.js';
export interface ShaderCraftExample {
    id: string;
    func: string;
    name: string;
    summary: string;
    upstreamPath: string;
}
export interface ShaderCraftExampleDefinition {
    name: string;
    namespace: 'user';
    func: string;
    description: string;
    tags: string[];
    starter: true;
    uniformLayout: Record<string, {
        slot: number;
        components: string;
    }>;
    globals: {
        seed: {
            type: 'int';
            default: number;
            uniform: 'seed';
            min: number;
            max: number;
        };
    };
    passes: Array<{
        name: string;
        program: string;
        inputs: Record<string, string>;
        outputs: {
            fragColor: 'outputTex';
        };
    }>;
}
export interface ShaderCraftExamplePackage {
    example: ShaderCraftExample;
    definition: ShaderCraftExampleDefinition;
    shaders: {
        glsl: BundledShaderSource;
        wgsl: BundledShaderSource;
    };
    /** Files relative to a Noisemaker shaders/effects/user/<func>/ directory. */
    files: Record<string, string>;
}
/** On-demand complete examples. No runtime filesystem access or network fetch is needed. */
export declare const SHADER_CRAFT_EXAMPLES: readonly ShaderCraftExample[];
/** Return fresh copyable definition.js and paired sources, with the actual minimal library closure and credits. */
export declare function getShaderCraftExample(id: string): ShaderCraftExamplePackage;
//# sourceMappingURL=examples.d.ts.map