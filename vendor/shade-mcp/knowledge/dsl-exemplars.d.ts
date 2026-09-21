/**
 * DSL Exemplar Programs and Patterns
 *
 * Canonical scaffolding patterns and curated example programs
 * for DSL jam mode. Programs sourced from Noisedeck basics and classic collections.
 */
export declare const DSL_EXEMPLAR_PATTERNS = "\n## Canonical DSL Scaffolding Patterns\n\nThese patterns are MANDATORY. Always use the pattern for the given effect type.\n\n### Points (particle systems)\n```\nsearch points, synth, render\nnoise().pointsEmit().physical().pointsRender().write(o0)\nrender(o0)\n```\n\n### Billboard Particles (textured particles)\n```\nsearch points, synth, render\npolygon(radius: 0.7, fgAlpha: 0.1, bgAlpha: 0).write(o0)\nnoise(ridges: true)\n  .pointsEmit(stateSize: x64)\n  .physical()\n  .pointsBillboardRender(tex: read(o0), pointSize: 40, sizeVariation: 50, rotationVariation: 50)\n  .write(o1)\nrender(o1)\n```\n\n### Feedback Loop\n```\nsearch synth, filter, render\nnoise(ridges: true)\n  .loopBegin(alpha: 95, intensity: 95)\n  .warp()\n  .loopEnd()\n  .write(o0)\nrender(o0)\n```\n\n### 3D Volumetric\n```\nsearch synth3d, filter3d, render\nnoise3d(volumeSize: x32).write3d(vol0, geo0)\nread3d(vol0, geo0).render3d().write(o0)\nrender(o0)\n```\n\n### Mixer (two-source blend)\n```\nsearch synth, mixer\nnoise(seed: 1).write(o0)\ngradient().blendMode(tex: read(o0), mode: multiply).write(o1)\nrender(o1)\n```\n\n### Simple Starter\n```\nsearch synth\nnoise(octaves: 4, ridges: true).write(o0)\nrender(o0)\n```\n\n### Filter Chain\n```\nsearch synth, filter\nnoise(ridges: true).blur(radiusX: 5).bloom(taps: 15).vignette().write(o0)\nrender(o0)\n```\n\n### RULES\n1. ALWAYS wrap points effects with pointsEmit()/pointsRender().\n2. Put the sprite for billboard particles on a SEPARATE surface.\n3. ALWAYS end 3D effect chains with render3d().\n4. ALWAYS chain filters from a generator. Never use filters alone.\n5. ALWAYS supply a tex: read(surface) parameter to mixers.\n6. Put filter effects between loopBegin()/loopEnd() in feedback loops.\n7. Always use noise() as the default starter. Set ridges: true for visual interest.\n";
export interface ExemplarProgram {
    name: string;
    dsl: string;
    tags: string[];
    description: string;
}
export declare const DSL_EXEMPLAR_PROGRAMS: ExemplarProgram[];
/**
 * Simple keyword search over exemplar programs.
 * Tokenizes query, matches against name/tags/description, returns top N.
 */
export declare function searchExemplars(query: string, maxResults?: number): ExemplarProgram[];
//# sourceMappingURL=dsl-exemplars.d.ts.map