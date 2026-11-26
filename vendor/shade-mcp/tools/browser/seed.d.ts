import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { BrowserSession } from '../../harness/browser-session.js';
export declare const getProgramSeedSchema: {
    dsl: z.ZodString;
};
export declare const setProgramSeedSchema: {
    dsl: z.ZodString;
    seed: z.ZodNumber;
};
export declare const reseedProgramSchema: {
    dsl: z.ZodString;
};
export type SeedResult = {
    status: 'ok';
    seed: number | null;
    dsl?: string;
} | {
    status: 'error';
    error: string;
};
/** A fresh program seed, uniform over 0 to 4294967295. */
export declare function freshSeed(): number;
/**
 * Read the program's seed, or, with `newSeed`, set it and return the program
 * as the engine writes it back.
 */
export declare function runSeedOperation(session: BrowserSession, program: string, newSeed?: number): Promise<SeedResult>;
export declare function registerSeedTools(server: McpServer): void;
//# sourceMappingURL=seed.d.ts.map