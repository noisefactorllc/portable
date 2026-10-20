import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ShaderCraftLanguage } from '../../knowledge/shader-craft/library/types.js';
export declare const searchShaderLibrarySchema: {
    query: z.ZodString;
    language: z.ZodOptional<z.ZodEnum<{
        glsl: "glsl";
        wgsl: "wgsl";
    }>>;
    limit: z.ZodOptional<z.ZodNumber>;
};
export declare const checkShaderSchema: {
    source: z.ZodOptional<z.ZodString>;
    file: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<{
        glsl: "glsl";
        wgsl: "wgsl";
    }>>;
};
export declare const bundleShaderSchema: {
    source: z.ZodOptional<z.ZodString>;
    file: z.ZodOptional<z.ZodString>;
    language: z.ZodOptional<z.ZodEnum<{
        glsl: "glsl";
        wgsl: "wgsl";
    }>>;
    write: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
};
export interface ShaderSourceInput {
    source?: string;
    file?: string;
    language?: ShaderCraftLanguage;
}
export declare function checkShader(args: ShaderSourceInput): Promise<{
    language: ShaderCraftLanguage;
    advisory: boolean;
    findings: import("../../knowledge/index.js").ShaderSourceFinding[];
}>;
export declare function bundleShader(args: ShaderSourceInput & {
    write?: boolean;
}): Promise<{
    source: string;
    added: string[];
    credits: string[];
    language: ShaderCraftLanguage;
    written: boolean;
}>;
export declare function registerShaderCraft(server: McpServer): void;
//# sourceMappingURL=shader-craft.d.ts.map