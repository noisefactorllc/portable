import type { KnowledgeDocument } from './vector-db.js';
export declare const TECHNIQUE_SYNONYMS: Record<string, string[]>;
/**
 * Synonyms for the shader-craft references. They join TECHNIQUE_SYNONYMS only
 * on the searchShaderKnowledge path (SEARCH_SYNONYMS), so retrieveForAgent's
 * expansion stays as it was. The search has no stemming and matches keys and
 * synonyms as substrings, so these bridge spellings and plurals, and avoid
 * short words that hide inside others ("aces" in "spaces", "sea" in "search").
 */
export declare const SHADER_CRAFT_SYNONYMS: Record<string, string[]>;
/** The synonyms searchShaderKnowledge expands with: the technique synonyms plus the shader-craft ones. */
export declare const SEARCH_SYNONYMS: Record<string, string[]>;
export declare function expandQueryWithSynonyms(query: string, synonymTable?: Record<string, string[]>): string;
export declare const CURATED_KNOWLEDGE: KnowledgeDocument[];
/**
 * Everything searchShaderKnowledge indexes: the curated notes above plus the
 * shader-craft references. Both the MCP tool's database and the exported one
 * that Shade vendors are built from this list.
 */
export declare const SEARCHABLE_KNOWLEDGE: KnowledgeDocument[];
//# sourceMappingURL=shader-knowledge.d.ts.map