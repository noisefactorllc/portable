// src/knowledge/shader-craft/references/library-index.ts
var LIBRARY_INDEX_MODULES = [
  {
    module: "common",
    summary: "constants, rotation, remapping and shaping functions",
    content: `## common

common: constants, rotation, remapping and shaping functions. Upstream target: GLSL ES 3.00 (WebGL2); the shader-craft library adds WGSL. Every function here is original and MIT licensed.

- \`const float PI  = 3.14159265358979;\`
- \`const float TAU = 6.28318530717959;\`
- \`float saturate(float x)\` / \`vec3 saturate(vec3 x)\` - Clamp to [0,1]. *Use: masks, weights, colors.*
- \`float dot2(vec2 v)\` / \`float dot2(vec3 v)\` - Squared length. *Use: cheap distance comparisons, SDF internals.*
- \`mat2 rot2(float a)\` - 2D rotation matrix. \`rot2(a) * v\` rotates v counter-clockwise by a radians. (cos, sin) is renormalized because GLSL ES leaves trig precision undefined: on SwiftShader and some mobile GPUs a raw cos/sin pair is far enough from unit length that rotations stop preserving distances. *Use: spinning parts, posing limbs, rotating octaves, camera roll.*
- \`float remap(float x, float a, float b, float c, float d)\` - Linear remap of x from [a,b] to [c,d] (unclamped). *Use: converting ranges, rescaling noise.*
- \`float linearstep(float a, float b, float x)\` - Linear ramp from 0 at a to 1 at b, clamped. *Use: masks whose falloff should not ease in or out.*
- \`float cubicPulse(float c, float w, float x)\` - Smooth bump: 1 at x == c, falling to 0 at |x - c| >= w (cubic). *Use: stripes, rings, highlights at one height, pulses in time.*
- \`float expImpulse(float x, float k)\` - Fast attack, exponential decay. Peaks at 1 when x == 1/k. *Use: heartbeat motion, impacts, flashes, plucked-string envelopes.*
- \`float gain(float x, float k)\` - Contrast curve on [0,1] that keeps 0, 0.5 and 1 fixed. k > 1 adds contrast, k < 1 flattens. *Use: tightening masks, adjusting animation easing.*
- \`float parabola(float x, float k)\` - 0 at x = 0 and x = 1, peak 1 at x = 0.5; k sharpens. *Use: petal width along length, leaf profiles, arches.*
- \`float almostIdentity(float x, float m, float n)\` - Returns x when x > m; smoothly bottoms out at n when x -> 0. Needs 2n < m. *Use: avoiding hard zero in falloffs, soft floor on thickness.*
`
  },
  {
    module: "hash",
    summary: "integer hashes and float wrappers for lattice ids",
    content: `## hash

hash: integer hashes and float wrappers for lattice ids. Naming: hashNM returns N floats from M inputs (hash12 = 1 output, 2 inputs). Outputs are in [0,1). The float wrappers hash INTEGER-VALUED inputs (cell ids, pixel coords, frame numbers). Fractional parts are dropped. That is deliberate: negative float -> uint is undefined in GLSL, and round() can return -0.0, which has different bits from 0.0. Converting through int avoids both. To hash a continuous value, scale it first. Do not use fract(sin(dot(p, k)) * 43758.5453): its result changes across GPUs and degrades at large inputs. Integer mixers are from Jarzynski and Olano, "Hash Functions for GPU Rendering" (JCGT 2020): pcg3d and pcg4d sit on that study's quality/speed frontier, and 32-bit integer math is bit-exact on every GPU, unlike sin().

- \`uint pcgHash(uint v)\` - PCG-style 1D integer hash. *Use: seeding, per-instance randomness, building other hashes.*
- \`uvec3 pcg3d(uvec3 v)\` - 3D integer hash, three decorrelated outputs. *Use: 3D cell ids, voxel jitter, (pixel, frame) noise.*
- \`uvec4 pcg4d(uvec4 v)\` - 4D integer hash, four decorrelated outputs (0 BigCrush failures in the JCGT study). *Use: (pixel.x, pixel.y, frame, sample) streams for stochastic sampling, 4D cell ids.*
- \`float uintToUnit(uint h)\` / \`vec2 uintToUnit(uvec2 h)\` / \`vec3 uintToUnit(uvec3 h)\` / \`vec4 uintToUnit(uvec4 h)\` - Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.
- \`float hash11(float p)\` - Random float in [0,1) for an integer-valued input. *Use: per-cell randomness, stable random per instance id.* Range [0,1).
- \`float hash12(vec2 p)\` - Random float in [0,1) for an integer-valued 2D input. *Use: per-cell variation (color, height, rotation), sparse spots, star fields.* Range [0,1).
- \`float hash13(vec3 p)\` - Random float in [0,1) for an integer-valued 3D input. *Use: per-voxel randomness, per-pixel-per-frame noise via hash13(vec3(gl_FragCoord.xy, frame)).* Range [0,1).
- \`vec2 hash22(vec2 p)\` - Random vec2 in [0,1)^2 for an integer-valued 2D input. *Use: Voronoi feature points, 2D jitter, random gradients.* Range [0,1)^2.
- \`vec3 hash33(vec3 p)\` - Random vec3 in [0,1)^3 for an integer-valued 3D input. *Use: 3D Voronoi points, random colors per cell, random directions.* Range [0,1)^3.
- \`vec4 hash44(vec4 p)\` - Random vec4 in [0,1)^4 for an integer-valued 4D input. *Use: per-pixel, per-frame, per-sample random numbers: hash44(vec4(gl_FragCoord.xy, frame, sampleIndex)).* Range [0,1)^4.
- \`vec3 hash32(vec2 p)\` - Random vec3 in [0,1)^3 for an integer-valued 2D input. *Use: per-tile random color, per-cell (offset, rotation, scale) triples.* Range [0,1)^3.
`
  },
  {
    module: "noise",
    summary: "value, gradient and simplex noise (2D/3D, analytic derivatives), fBm, turbulence and billow, domain warping, curl flow, Voronoi, dithering",
    content: `## noise

noise: value, gradient and simplex noise (2D/3D, analytic derivatives), fBm, turbulence and billow, domain warping, curl flow, Voronoi, dithering. Every function here is texture-free and original. The math follows the cited articles. Ranges are approximate unless stated. Noise built on integer hashes stays stable at large coordinates until float precision runs out (|p| around 1e5). An effect's \`time\` is already a 0..1 loop phase; animate by moving through noise on a circle in time, which also loops.

- \`vec2 quinticFade(vec2 f)\` / \`vec3 quinticFade(vec3 f)\` - Quintic fade 6t^5 - 15t^4 + 10t^3: C2-continuous interpolation weights for lattice noise. *Use: custom lattice noises, smooth cell interpolation.*
- \`vec2 quinticFadeDeriv(vec2 f)\` / \`vec3 quinticFadeDeriv(vec3 f)\` - Derivative of quinticFade: 30 t^2 (t - 1)^2. *Use: analytic noise derivatives.*
- \`vec3 valueNoiseD(vec2 p)\` - 2D value noise with analytic derivatives. Returns vec3(value, d/dx, d/dy). *Use: terrain base layers, cheap clouds, anything needing normals without finite differences.* Range value in [0,1].
- \`float valueNoise(vec2 p)\` / \`float valueNoise(vec3 p)\` - 2D value noise. *Use: soft blotches, low-frequency color variation.* Range [0,1].
- \`vec2 latticeGradient(vec2 cell)\` - Unit gradient for a 2D lattice point.
- \`vec3 gradientNoiseD(vec2 p)\` / \`vec4 gradientNoiseD(vec3 p)\` - 2D gradient (Perlin-style) noise with analytic derivatives. Returns vec3(value, d/dx, d/dy). Gradient noise has less grid-aligned blockiness than value noise. Prefer it for fBm. *Use: fBm, terrain with analytic normals, curl flow, marble and wood distortions.* Range value in about [-0.7,0.7].
- \`float gradientNoise(vec2 p)\` / \`float gradientNoise(vec3 p)\` - 2D gradient noise. *Use: general-purpose smooth noise.* Range about [-0.7,0.7].
- \`vec3 simplexNoiseD(vec2 p, float rotation)\` / \`vec3 simplexNoiseD(vec2 p)\` - 2D simplex noise with analytic gradient. Returns vec3(value, d/dx, d/dy). Sums three radial kernels (0.5 - r^2)^4 on a triangular lattice instead of blending four square-cell corners, so it has fewer axis-aligned artifacts than gradientNoise. rotation (radians) spins every lattice gradient: animating it gives flow noise that churns in place instead of sliding (Perlin and Neyret 2001). Scaled so |value| <= 1 exactly. *Use: flowing water and lava (animate rotation), ripples with analytic normals, isotropic fBm, swirling fields.* Range value in [-1,1].
- \`float simplexNoise(vec2 p)\` - 2D simplex noise. *Use: isotropic smooth noise, fBm layers without grid alignment.* Range [-1,1].
- \`float latticeGradDot(vec3 cell, vec3 corner, vec3 f)\` - Dot product of a hashed 3D gradient with the offset to its lattice corner.
- \`const int FBM_MAX_OCTAVES = 12;\`
- \`float fbm(vec2 p, int octaves, float lacunarity, float persistence)\` / \`float fbm(vec2 p, int octaves)\` / \`float fbm(vec3 p, int octaves, float lacunarity, float persistence)\` - Fractional Brownian motion over 2D gradient noise. Each octave is rotated to hide lattice alignment. persistence 0.5 is the classic look (H = 1). Lower is smoother, higher is rougher. *Use: clouds, terrain, dirt, roughness breakup, warping input.* Range about [-1,1].
- \`float erodedFbm(vec2 p, int octaves)\` - Terrain fBm where each octave is damped by the accumulated slope, so detail settles in valleys and steep slopes stay smooth. This gives an eroded look without simulation. *Use: mountains, dunes, rocky ground.* Range about [-0.5,1].
- \`float ridgedFbm(vec2 p, int octaves)\` - Ridged multifractal: inverted |noise| creates sharp crests; each octave is weighted by the previous one, so detail gathers along ridges. *Use: mountain ridges, lightning-like veins, canyons, eroded rock, alien landscapes.* Range about [0,1].
- \`float turbulence(vec2 p, int octaves)\` / \`float turbulence(vec3 p, int octaves)\` - Perlin's turbulence: fBm of |noise|. The absolute value folds every zero crossing into a sharp crease, at every scale. *Use: fire, marble veins (sin(x + k * turbulence)), smoke wisps, electric glow, lava cracks, wind-torn clouds.* Range [0,1].
- \`float billowFbm(vec2 p, int octaves)\` / \`float billowFbm(vec3 p, int octaves)\` - Billowy multifractal: |noise| per octave makes puffy rounded lobes split by sharp creases (the inverse of ridgedFbm). Each octave is weighted by the previous one, so detail gathers on the lobes while the creases stay clean. *Use: cumulus and cauliflower tops, puffy smoke, foam clumps, rock piles, cotton, popcorn-like bumps.* Range [0,1].
- \`float warpedFbm(vec2 p, float strength, int octaves, out vec2 q, out vec2 r)\` - Two-level domain warp f(p + s*r), r = fbm(p + s*q), q = fbm(p). Writes the intermediate warp vectors so they can drive color. Cost is 5 fBm calls. *Use: marble, smoke, agate, alien skies, painterly backgrounds.* Range about [-1,1].
- \`vec2 curlNoise(vec2 p)\` / \`vec3 curlNoise(vec3 p)\` - Divergence-free 2D flow field: the curl of scalar gradient noise. Particles advected by it swirl without bunching up. *Use: smoke advection, flowing paint, hair/fur flow direction, wind.*
- \`vec4 voronoi(vec2 p, float jitter)\` - Cellular (Worley/Voronoi) noise. Returns vec4(F1, F2, nearestCell.xy). F1 = distance to nearest feature point, F2 = second nearest. nearestCell is integer-valued, so hash it for per-cell randomness. jitter in [0,1] (0 = regular grid). Searches 3x3 cells. F2 can be slightly off at jitter 1. *Use: cells, scales, stones, cracked mud (F2-F1), caustics, foam, sparkles.* Range F1 in [0, ~1.2].
- \`vec3 voronoiBorder(vec2 p, float jitter)\` - Exact distance to Voronoi cell borders, found in two passes: nearest point, then nearest bisector. Returns vec3(borderDistance, vectorToNearestPoint). Unlike F2-F1, the border distance is a true distance, so lines have constant width. *Use: cell walls, stained glass leading, cracked earth, giraffe and leaf-vein patterns, crackle glaze.*
- \`float smoothVoronoi(vec2 p, float k)\` - Smooth Voronoi: a soft-min of distances to feature points. Cells become blobs with no creases. k controls smoothness (large = sharper; around 8-32). Searches 5x5 cells so low k has no seams. *Use: organic cell clusters, bubbles, lumpy surfaces, skin pores.*
- \`float hybridTerrainHeight(vec2 p, int octaves)\` - Bounded hybrid terrain recipe: broad gradient fBm, warped ridged detail and cellular breakup. This is an artistic composition, not Musgrave's named hybrid-multifractal algorithm. Coordinates are warped before all three fields are sampled; octaves is clamped to [1, FBM_MAX_OCTAVES]. *Use: game heightmaps, rocky islands, biome elevation masks, alien terrain.* Range [0,1].
- \`float interleavedGradientNoise(vec2 pixel)\` / \`float interleavedGradientNoise(vec2 pixel, int frame)\` - Interleaved gradient noise: cheap per-pixel noise whose 3x3 neighborhoods are nearly stratified. Not a hash. pixel must be integer pixel coordinates (floor(gl_FragCoord.xy)). The frame overload animates it for accumulation and TAA; the engine's \`frame\` never wraps, so a frame-seeded pattern does not loop. *Use: removing banding before 8-bit output, jittering ray start offsets, stochastic transparency.* Range [0,1).
- \`float r2Dither(vec2 pixel)\` - R2 low-discrepancy dither mask (plastic-constant sequence), folded by a triangle wave for an even spread. *Use: ordered dithering without textures, posterized and retro looks, sample offsets.* Range [0,1).
`
  },
  {
    module: "pattern",
    summary: "tilings and antialiased procedural patterns",
    content: `## pattern

pattern: tilings and antialiased procedural patterns. The filtered versions integrate the pattern over the pixel footprint (box filter), so floors and stripes stay clean in the distance with no supersampling. Filtering math follows Inigo Quilez's articles on checkerboard filtering and filterable procedurals.

- \`vec2 triangleWave(vec2 x)\` - Triangle wave, the integral of a square wave. Building block for box-filtered patterns. *Use: writing new filtered patterns.*
- \`float filteredChecker(vec2 p, vec2 w)\` - Box-filtered checkerboard with unit squares: 0 or 1 up close, fading to 0.5 where squares are smaller than a pixel. Compute the footprint before any branching: w = fwidth(p) (or max(abs(dFdx(p)), abs(dFdy(p)))). *Use: floors, chessboards, test patterns, racing flags, tablecloths.* Range [0,1].
- \`float filteredGrid(vec2 p, vec2 w, float n)\` - Box-filtered grid lines (unit cells, line width = 1/n of a cell). Returns 1 on lines, 0 inside cells. *Use: blueprints, graph paper, tiles with grout, sci-fi floors, synthwave grids.* Range [0,1].
- \`float filteredStripes(float x, float w)\` - Box-filtered stripes along x with period 1 and duty cycle 0.5. Returns 0..1. *Use: awnings, candy, zebra (warp x first), barcodes, road markings.* Range [0,1].
- \`vec4 hexGrid(vec2 p)\` - Hexagonal tiling with unit spacing between neighboring centers. Neighbors sit left/right, so hexes are pointy-top. Returns vec4(local offset from the hex center, integer-valued hex id). *Use: honeycomb, scales, tiles, game boards, hex pixelation.*
- \`float hexEdgeDistance(vec2 local)\` - Distance from a hexGrid local coordinate to its hexagon's edge (0.5 at the center, 0 on the edge). *Use: hex borders, bevels, edge wear on tiles.*
- \`float truchetArcs(vec2 p, float w)\` - Truchet tiling of quarter-circle arcs, randomly flipped per cell. Returns signed distance to arcs of half-width w. *Use: maze-like ornaments, pipes, Celtic-style weaves, procedural circuitry.*
`
  },
  {
    module: "sdf3d",
    summary: "3D signed distance primitives",
    content: `## sdf3d

sdf3d: 3D signed distance primitives. Each one is centered at the origin unless noted. Move or rotate the point before calling (sdBox(p - center, size)), never the result. Exactness tags: @exact  true Euclidean distance inside and outside (safe for smooth blending, AO, soft shadows, offsets) @bound  never overestimates (Lipschitz <= 1), so raymarching is safe, but offsets and blends are less accurate @approx exact zero set but may overestimate in places (see the function's note for the safe stepScale) Formulas follow Inigo Quilez's distance-function catalog (article "distance functions"). Implementations here are original and checked by the upstream tests (sign, Lipschitz bound, eikonal).

- \`float sdSphere(vec3 p, float r)\` **exact** - Sphere of radius r. *Use: heads, eyes, fruit, planets, bubbles, joints.*
- \`float sdBox(vec3 p, vec3 b)\` **exact** - Axis-aligned box with half-extents b. *Use: buildings, crates, bricks, pedestals, furniture.*
- \`float sdRoundBox(vec3 p, vec3 b, float r)\` **exact** - Box with rounded edges. The outer size stays b; r is the edge radius (r <= min(b)). *Use: toys, product shots, soft architecture, dice, phone-like slabs.*
- \`float sdBoxFrame(vec3 p, vec3 b, float e)\` **exact** - Wireframe box: edges of a box with half-extents b and edge thickness e. *Use: scaffolding, cages, display frames, sci-fi structures.*
- \`float sdTorus(vec3 p, vec2 t)\` **exact** - Torus in the XZ plane. t.x = major radius, t.y = tube radius. *Use: rings, donuts, tires, halos, lifebuoys.*
- \`float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb)\` **exact** - Partial torus (arc) in the XY plane, symmetric about +Y. sc = vec2(sin, cos) of the half-aperture angle, ra = major radius, rb = tube radius. *Use: horns, handles, eyebrows, arches, croissant shapes, magnets.*
- \`float sdLink(vec3 p, float le, float r1, float r2)\` **exact** - Chain link: a torus stretched along Y by le. r1 = major radius, r2 = tube radius. *Use: chains, rings, jewelry, fences.*
- \`float sdPlane(vec3 p, vec3 n, float h)\` **exact** - Infinite plane through the origin offset by h along unit normal n: dot(p, n) + h. *Use: ground, walls, water surface, clipping half-spaces.*
- \`float sdCapsule(vec3 p, vec3 a, vec3 b, float r)\` **exact** - Capsule: segment a-b swept by radius r. *Use: limbs, fingers, branches, hair strands, pills, bones.*
- \`float sdVerticalCapsule(vec3 p, float h, float r)\` **exact** - Vertical capsule from y = 0 to y = h, radius r. *Use: upright limbs, posts, bottles, candles.*
- \`float sdCylinder(vec3 p, float h, float r)\` **exact** - Vertical capped cylinder from y = -h to y = +h, radius r. *Use: columns, cans, coins, logs, wheels (rotate first).*
- \`float sdCappedCone(vec3 p, float h, float r1, float r2)\` **exact** - Capped cone (frustum) from y = -h (radius r1) to y = +h (radius r2). Set r2 = 0 for a pointed cone. Exact everywhere, including the base cap. Points below the base are outside. *Use: trees, roofs, spikes, lampshades, volcanoes, party hats, vases.*
- \`float sdCone(vec3 p, float h, float r)\` **exact** - Pointed cone with its base disk (radius r) at y = 0 and apex at y = h. *Use: evergreen trees, spikes, horns, mountains, wizard hats.*
- \`float sdRoundCone(vec3 p, float r1, float r2, float h)\` **exact** - Round cone: sphere r1 at y = 0 smoothly hulled with sphere r2 at y = h. *Use: limbs, fingers, tree trunks, carrots, teardrops, tentacle segments.*
- \`float sdEllipsoid(vec3 p, vec3 r)\` **approx** - Ellipsoid with semi-axes r. A fast approximation: the zero set is exact and the field is a bound outside for aspect ratios up to about 2:1. Inside, and for more stretched ellipsoids, the gradient exceeds 1 (measured: 2.5 at 4:1). March with stepScale 0.7-0.8 there, or build long shapes from sdCapsule / sdRoundCone instead. *Use: heads, bodies, eggs, pebbles, leaves (flat), muscles, clouds of blobs.*
- \`float sdCutHollowSphere(vec3 p, float r, float h, float t)\` **exact** - Hollow spherical cap (bowl) of radius r, cut by the plane y = h, with shell thickness t. The opening faces +Y. *Use: bowls, cups, helmets, shells, satellite dishes, eye sockets.*
- \`float sdHexPrism(vec3 p, vec2 h)\` **exact** - Hexagonal prism along Z. h.x = inradius of the hexagon, h.y = half-length. *Use: pencils, bolts, crystals, basalt columns, honeycomb cells.*
- \`float sdOctahedron(vec3 p, float s)\` **bound** - Regular octahedron with "radius" s (vertex distance from center). Bound version. *Use: gems, crystals, diamonds, abstract motifs.*
- \`float sdGyroid(vec3 p, float scale, float t)\` **bound** - Gyroid sheet with cell scale \`scale\` and half-thickness t. The infinite triply-periodic surface sin x cos y + sin y cos z + sin z cos x = 0. Intersect with a bounding shape. *Use: lattices, coral, bone interiors, sponges, sci-fi infill, organic architecture.*
- \`float sdCutSphere(vec3 p, float r, float h)\` **exact** - Sphere of radius r cut by the plane y = h, keeping the cap ABOVE the plane. h = 0 gives a dome on the ground; negative h keeps more than half. Needs |h| < r. *Use: domes, mushroom caps, half-buried rocks, igloos, bread loaves.*
- \`float sdDeathStar(vec3 p, float ra, float rb, float d)\` **exact** - Sphere ra at the origin with sphere rb at (d, 0, 0) carved out, exact including the crease rim. A plain opSubtract of two spheres is only a bound. *Use: eye sockets, craters, bitten fruit, nostrils, scooped shapes.*
- \`float sdQuadraticBezier(vec3 pos, vec3 A, vec3 B, vec3 C)\` **exact** - Unsigned distance to a 3D quadratic Bezier curve A-B-C; subtract a radius for a tube. Solves the closest-point cubic analytically. Falls back to a segment when the curve is straight. *Use: hair strands, tentacles, stems, whiskers, horns, cables, curved tubes.*
`
  },
  {
    module: "sdf2d",
    summary: "2D signed distance primitives for posters, icons, UI, motion graphics, and as profiles for opExtrude / opRevolve",
    content: `## sdf2d

sdf2d: 2D signed distance primitives for posters, icons, UI, motion graphics, and as profiles for opExtrude / opRevolve. Centered at the origin unless noted. Negative inside. Formulas follow Inigo Quilez's 2D distance catalog (article "2D distance functions"). Implementations are original and tested upstream (sign, Lipschitz, brute-force distance for curves). Tags: @exact true distance, @bound never overestimates, @approx exact zero set but may overestimate in places.

- \`float sdCircle(vec2 p, float r)\` **exact** - Circle of radius r. *Use: dots, eyes, suns, bubbles, rings (with opOnion).*
- \`float sdBox(vec2 p, vec2 b)\` **exact** - Axis-aligned rectangle with half-extents b. *Use: panels, bars, windows, buttons, building silhouettes.*
- \`float sdRoundedBox(vec2 p, vec2 b, vec4 r)\` **exact** - Rectangle with half-extents b and per-corner radii r = (top-right, bottom-right, top-left, bottom-left). *Use: UI cards, buttons, speech bubbles, tags, rounded windows.*
- \`float sdSegment(vec2 p, vec2 a, vec2 b)\` **exact** - Unsigned distance to segment a-b. Subtract a width to get a stroke. *Use: lines, strokes, stems, rays, hands of a clock, rain streaks.*
- \`float sdUnevenCapsule(vec2 p, float r1, float r2, float h)\` **exact** - Tapered capsule: circle r1 at origin hulled with circle r2 at (0, h). *Use: petals, tails, teardrops, brush dabs, fingers, flames.*
- \`float sdArc(vec2 p, vec2 sc, float ra, float rb)\` **exact** - Circular arc symmetric about +Y. sc = vec2(sin, cos) of the half-aperture, ra = radius, rb = stroke half-width. *Use: smiles, eyebrows, rainbows, gauges, progress rings, horseshoes.*
- \`float sdEquilateralTriangle(vec2 p, float r)\` **exact** - Equilateral triangle with circumradius-like size r, pointing up. *Use: play icons, warning signs, mountains, arrows, tri-patterns.*
- \`float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2)\` **exact** - Arbitrary triangle p0, p1, p2 (any winding). *Use: shards, low-poly art, arrowheads, beaks, teeth.*
- \`float sdRegularPolygon(vec2 p, float r, int n)\` **exact** - Regular n-gon with circumradius r, one vertex pointing up. *Use: badges, hexagonal tiles, pentagons, stop signs, gems (2D).*
- \`float sdStar(vec2 p, float r, int n, float m)\` **exact** - Star with n points and outer radius r. m in [2, n] sets the inner angle: m = 2 is the spikiest and m = n is a regular n-gon. *Use: stars, sparkles, badges, flowers (with opRound), sheriff badges.*
- \`float sdVesica(vec2 p, float r, float d)\` **exact** - Vesica (lens): intersection of two circles of radius r whose centers sit at (+-d, 0). Points along Y. Needs d < r. *Use: leaves, petals, eyes, fish bodies, almond shapes, gothic arches.*
- \`float sdMoon(vec2 p, float d, float ra, float rb)\` **exact** - Crescent: disk ra at origin minus disk rb at (d, 0). *Use: moons, claws, bananas (bent), shadows on spheres, logos.*
- \`float sdHeart(vec2 p)\` **exact** - Heart with its bottom tip at the origin, about 1 unit tall. *Use: hearts, valentines, health icons, leaves (squashed).*
- \`float sdRhombus(vec2 p, vec2 b)\` **exact** - Rhombus with half-diagonals b. *Use: diamonds, kites, card suits, argyle, harlequin patterns.*
- \`float sdEllipse(vec2 p, vec2 r)\` **approx** - Ellipse with semi-axes r. A fast approximation: exact zero set, a bound outside up to about 2:1 aspect, gradient above 1 inside and for flatter ellipses. Fine for fills and strokes; avoid for exact offsets. *Use: eyes, pupils, ovals, shadows under objects, planet rings (with opOnion).*
- \`float sdQuadraticBezier(vec2 pos, vec2 A, vec2 B, vec2 C)\` **exact** - Unsigned distance to a quadratic Bezier curve A-B-C. Solves the closest-point cubic analytically. Falls back to a segment when the curve degenerates to a line. Float error in the cubic solve is about 1e-4. *Use: brush strokes, hair, calligraphy, tendrils, eyelashes, smooth paths, font-like curves.*
- \`float sdPie(vec2 p, vec2 sc, float r)\` **exact** - Pie slice (circular sector) of radius r, symmetric about +Y. sc = vec2(sin, cos) of the half-aperture, which may go up to pi (a full disk); past pi/2 the slice is concave. *Use: pie charts, pac-man, fans, radar sweeps, pizza slices, clock wedges, 2D spotlight cones.*
- \`float sdHorseshoe(vec2 p, vec2 sc, float r, float legLength, float w)\` **exact** - Horseshoe: an arc of radius r over the top (half-aperture given by sc = vec2(sin, cos), as in sdArc) whose ends run on as straight legs of length legLength along the arc's tangent, stroked with half-width w and round ends. The legs must not cross the Y axis (keep legLength * |cos(aperture)| below r * sin(aperture)). *Use: horseshoes, magnets, U-bends, arches with posts, croquet hoops, handles, headphones (2D).*
- \`float sdParabolaSegment(vec2 p, float w, float h)\` **exact** - Parabolic arch: the region under y = h (1 - x^2 / w^2) and above y = 0, so half-width w at the base and height h. The closest point on the curve is the largest root of a depressed cubic, solved in closed form. *Use: arches, bridges, tunnels, domes, bullets, gothic windows, tents, fountain jets, bell curves.*
- \`float sdEgg(vec2 p, float ra, float rb)\` **exact** - Egg built from four tangent arcs (Moss-style): a bottom half-disk of radius ra centered at the origin, a top cap of radius rb, and two side arcs of radius 2 ra joining them. rb = ra is a disk; smaller rb makes a pointier egg. Spans y from -ra to sqrt((2 ra - rb)^2 - ra^2) + rb. Needs 0 < rb <= ra. *Use: eggs, droplets, pebbles, seeds, cartoon heads and bodies, onion domes (flip y), Easter eggs.*
`
  },
  {
    module: "operators",
    summary: "combine distances (booleans, smooth blends, chamfers, stairs) and reshape them (round, onion, extrude, revolve, elongate)",
    content: `## operators

operators: combine distances (booleans, smooth blends, chamfers, stairs) and reshape them (round, onion, extrude, revolve, elongate). Arguments a, b are distances already evaluated at the same point. Exactness: union (min) is exact outside but too deep inside; intersection and subtraction (max) are exact inside but underestimate outside. Smooth and decorative combinations are bounds. All stay Lipschitz <= 1, so raymarching is safe. When interior distances matter (inner-penumbra shadows, thickness, onion of a union), prefer an exact concave primitive (sdDeathStar, sdCutHollowSphere, 2D sdMoon/sdArc + extrude/revolve). Smooth unions are not associative: blend in a fixed order (torso, then limbs, then details). Smooth blend semantics in this library: k is the blend width in distance units. Shapes start blending when |a - b| < k.

- \`float opUnion(float a, float b)\` **bound** - Union of two shapes. *Use: combining parts.*
- \`float opSubtract(float a, float b)\` **bound** - Shape a with shape b cut out of it. *Use: holes, windows, carving, bites.*
- \`float opIntersect(float a, float b)\` **bound** - Region inside both shapes. *Use: clipping, lens shapes, trimming with half-spaces.*
- \`float smin(float a, float b, float k)\` **bound** - Smooth union (polynomial, C1). Blends where |a - b| < k, with a max bulge of k/4. *Use: organic joins (neck to head, limbs to torso), melting shapes, blobby forms.*
- \`float smax(float a, float b, float k)\` **bound** - Smooth intersection, the mirror of smin. *Use: soft clipping, rounded intersections, pillowy cuts.*
- \`float smoothSubtract(float a, float b, float k)\` **bound** - Smooth subtraction: a with b carved out, with filleted edges. *Use: eye sockets, nostrils, soft grooves, scooped bowls, worn edges.*
- \`float sminCubic(float a, float b, float k)\` **bound** - Smooth union with a C2 (cubic) transition, so specular highlights and normals have no visible seam. Blends where |a - b| < k, with a max bulge of k/6. *Use: close-up organic surfaces, glossy blends, fluids.*
- \`vec2 sminBlend(float a, float b, float k)\` **bound** - Smooth union that also returns the blend weight. Returns vec2(distance, weight), where weight is 1 when the result is fully a and 0 when fully b. Use the weight to mix material colors across the blend. *Use: skin-to-cloth transitions, color bleeding across blended parts, gradient-colored blobs.*
- \`float opChamferUnion(float a, float b, float r)\` **bound** - Union with a 45-degree chamfer of size r at the seam. *Use: machined parts, architecture, sci-fi panels, bevelled joins.*
- \`float opStairsUnion(float a, float b, float r, float n)\` **bound** - Union with n stair steps of total size r at the seam. *Use: terraces, stepped pyramids, ziggurats, layered rock, rice paddies.*
- \`float opEngrave(float a, float b, float r)\` **bound** - Engrave a groove of depth r into a, following the zero set of b. *Use: panel lines, carved text paths, seams, grout lines on a surface.*
- \`float opRound(float d, float r)\` **exact** - Round a shape by r. Grows it outward; shrink the inner shape by r first to keep its size. *Use: softening any primitive, pebbles from boxes, inflated look.*
- \`float opOnion(float d, float t)\` **exact** - Hollow shell of thickness 2t around the surface. Apply repeatedly for concentric layers. *Use: shells, pipes, rings, onion layers, outlines in 2D.*
- \`float opExtrude(vec3 p, float d2, float h)\` **exact** - Extrude a 2D distance d2 (evaluated at p.xy) along Z by half-length h. *Use: 3D text and logos, cookie cutters, coins from 2D shapes, extruded profiles.*
- \`vec2 opRevolve(vec3 p, float o)\` **exact** - Revolve around Y. Returns the 2D point to evaluate a profile at. Offset o moves the profile away from the axis. *Use: vases, bottles, chess pieces, lathe-turned objects, tori with custom profiles.*
- \`vec4 opElongate(vec3 p, vec3 h)\` **exact** - Elongate: stretch a shape by inserting a straight section of half-size h, keeping exact distances inside too. Returns vec4(q, w). Evaluate the original shape at q.xyz and add w:  sdSphere(e.xyz, r) + e.w  is a capsule. *Use: pills from spheres, long rounded boxes, stretched characters, stadium shapes.*
`
  },
  {
    module: "domain",
    summary: "transform the point BEFORE evaluating a distance (repetition, mirroring, polar sectors, folds, twist, bend)",
    content: `## domain

domain: transform the point BEFORE evaluating a distance (repetition, mirroring, polar sectors, folds, twist, bend). Rigid transforms (repeat, mirror, rotate, fold) keep distances exact. Twist and bend stretch space, so their results are only bounds after scaling (see each function). Repetition uses floor(x + 0.5) instead of round(): GLSL leaves round(0.5) implementation-defined, and round can return -0.0.

- \`float domRepeatId(float p, float s)\` / \`vec2 domRepeatId(vec2 p, vec2 s)\` / \`vec3 domRepeatId(vec3 p, vec3 s)\` - Cell index for repetition with period s (integer-valued; use with hash functions). *Use: per-instance variation: hash12(domRepeatId(p.xz, s)).*
- \`float domRepeat(float p, float s)\` / \`vec2 domRepeat(vec2 p, vec2 s)\` / \`vec3 domRepeat(vec3 p, vec3 s)\` - Infinite repetition with period s. Returns the local coordinate centered in its cell. Exact only while each instance stays inside its own cell. For instances that vary per cell or overhang, evaluate the 2 or 3 neighboring cells too (see \`shader-craft-sdf-library-guide\`). *Use: forests, columns, tiles, crowds, star fields, city blocks.*
- \`vec2 domRepeatLimited(vec2 p, vec2 s, vec2 lim)\` / \`vec3 domRepeatLimited(vec3 p, vec3 s, vec3 lim)\` - Repetition limited to cells -lim..+lim on each axis (2*lim + 1 copies). *Use: rows of windows, fence posts, a finite grid of buttons, colonnades.*
- \`vec2 domRepeatMirror(vec2 p, vec2 s)\` - Mirrored repetition: every other cell is flipped, so shapes touching the cell border join seamlessly. *Use: tiled ornaments, symmetric wallpaper, seamless pipes and rails.*
- \`vec2 domPolar(vec2 p, float n)\` - Polar repetition into n sectors around the origin. Returns the point rotated into the sector centered on +X. Single evaluation: exact for shapes symmetric about their sector's center line. For asymmetric or per-sector-varying shapes, evaluate this sector and its neighbor and take the min (see \`shader-craft-sdf-library-guide\`). *Use: petals, spokes, gears, clock marks, radial ornaments, columns around a tower.*
- \`float domPolarId(vec2 p, float n)\` - Sector index in [0, n) for domPolar. *Use: varying each petal, spoke or column.*
- \`vec2 domPolarPair(vec2 p, float n)\` - Neighbor-checked polar repetition: ids (in [0, n)) of the sector holding p and of the adjacent sector p leans toward. Evaluate the shape in both with domPolarSector and take the min. Use it when sectors vary (per-id length, tilt, color) or are asymmetric. It covers shapes of similar size that stay inside their own sector; a shape that reaches across its neighbor needs a wider search. *Use: varied petals, tilted fan blades, gear teeth of mixed sizes, uneven clock marks, radial crowds.*
- \`vec2 domPolarSector(vec2 p, float id, float n)\` - Rotate p into the frame of polar sector id (its center line on +X). domPolarSector(p, domPolarId(p, n), n) equals domPolar(p, n). *Use: the second half of domPolarPair: evaluate a sector's shape by id.*
- \`vec3 domFold(vec3 p, vec3 n)\` - Fold space across the plane through the origin with unit normal n. Points behind the plane are reflected. *Use: kaleidoscopes, symmetric creatures, KIFS fractals, mirrored architecture.*
- \`vec3 domTwist(vec3 p, float k)\` - Twist around Y: rotate XZ by k * y. Divide the resulting distance by L = a/2 + sqrt(1 + a*a/4), a = k * R, where R is the shape's max distance from the Y axis. Without that, the march overshoots. *Use: twisted columns, drills, licorice, DNA-like spirals, towels.*
- \`vec3 domBend(vec3 p, float k)\` - Bend in XY: rotate XY by k * x. Divide the resulting distance by about 1 + k * R (R = max |p.xy| of the shape). *Use: bent beams, arches from boxes, bananas, curved horns.*
`
  },
  {
    module: "architecture",
    summary: "stable building parameters and filtered facade fields",
    content: `## architecture

architecture: stable building parameters and filtered facade fields. These are massing/material helpers, not a mesh generator or a full shape-grammar engine. Keep the generated footprint inside its parcel.

- \`vec4 buildingProfile(vec2 parcel, vec2 heightRange, vec2 halfWidthRange)\` - Stable building profile: vec4(height, half-width, half-depth, roof style 0/1/2) from an integer parcel ID. Height and half-width ranges are ordered, positive world-space values. The same ID always gives the same profile. *Use: city blocks, towers, deterministic chunk generation, architectural massing.*
- \`float facadeWindowMask(vec2 uv, vec2 fill, vec2 footprint)\` - Box-filtered rectangular windows centered on integer facade coordinates. fill is the opening fraction per cell in [0,1]; footprint is the pixel's width/height in cell units. At large footprints it converges to fill.x*fill.y. *Use: distant city facades, office windows, floor bands, architectural grids without moire.* Range [0,1].
`
  },
  {
    module: "raymarch",
    summary: "sphere tracing, normals, soft shadows and ambient occlusion for SDF scenes",
    content: `## raymarch

raymarch: sphere tracing, normals, soft shadows and ambient occlusion for SDF scenes. SCENE CONTRACT: your program defines   vec2 map(vec3 p)   returning vec2(distance, materialId). Packing the material into a vec2 avoids structs (WebGL forbids ?: on structs) and works with every helper here. GLSL loops start at ZERO, a zero the compiler cannot prove, built from the engine's \`int frame\` uniform. That stops it inlining map() into every loop, which keeps compile times sane and avoids WebGL compiler crashes on large scenes.

- \`#define ZERO (min(frame, 0))\`: the program defines it from its own \`uniform int frame;\` before the library code. In WGSL the program declares \`var<private> ZERO: i32;\` and sets \`ZERO = min(i32(frame), 0);\` at the top of its entry point.
- \`const int RAYMARCH_MAX_STEPS = 256;\`
- \`vec3 raymarch(vec3 ro, vec3 rd, float tmin, float tmax, float stepScale)\` - Sphere-trace from ro along unit rd between tmin and tmax. Returns vec3(t, materialId, stepCount). t is -1 on a miss. The hit threshold grows with t (about one pixel's footprint), so distant surfaces don't burn steps. stepScale is 1 for exact or bound fields. Use < 1 (e.g. 0.6) when map() has Lipschitz > 1 (displacement, warps, twist). *Use: every SDF raymarcher.*
- \`vec3 calcNormal(vec3 p, float eps)\` - Surface normal from 4 tetrahedral samples (cheaper than 6 central differences, and still centered). eps should scale with distance, e.g. 0.0005 * t: that filters distant detail and avoids sparkling. *Use: shading any SDF hit.*
- \`float softShadow(vec3 ro, vec3 rd, float tmin, float tmax, float k)\` - Soft shadow toward a light along unit rd. k controls sharpness (k is about 1 / light angular size: 8 soft, 32 hard). Uses the "closest approach between samples" estimate, which removes banding from sharp-cornered occluders. Returns 0 (full shadow) .. 1 (lit). *Use: sun shadows, contact shadows, penumbrae.*
- \`float calcAO(vec3 p, vec3 n, float scale)\` - Ambient occlusion from 5 distance samples along the normal. Compares the expected distance with the actual one. scale is the sampling reach in scene units (about 0.12 for a unit-sized object). Returns 0 (occluded) .. 1 (open). *Use: crevices, contact darkening, grounding objects on floors.*
- \`float sdfThickness(vec3 p, vec3 n, float maxDepth)\` - Thickness behind a surface point, estimated by sampling the SDF inside along -n (an "inverse AO"). Returns 0 (thin, light passes through) .. 1 (thick). maxDepth is the deepest sample in scene units. *Use: translucency, subsurface tint, wax and jade, glowing thin edges.*
`
  },
  {
    module: "intersect",
    summary: "analytic ray-primitive intersections",
    content: `## intersect

intersect: analytic ray-primitive intersections. Rays are ro + t * rd with unit rd. Use them for bounding volumes (clip the raymarch range to where the scene can be), exact floors and water planes, glass spheres and eyeballs, and cheap reflections. Formulas follow Inigo Quilez's article on ray-surface intersectors.

- \`float iPlane(vec3 ro, vec3 rd, vec3 n, float h)\` - Ray vs plane dot(p, n) + h = 0 (unit n). Returns t, which is negative when the plane is behind the ray or parallel to it. *Use: floors, water, mirrors, clipping marches to a ground plane.*
- \`vec2 iSphere(vec3 ro, vec3 rd, vec3 c, float r)\` - Ray vs sphere centered at c with radius r. Returns vec2(tNear, tFar), or vec2(-1) on a miss. Uses the precision-friendly form that measures from the closest point on the ray. *Use: bounding spheres, glass balls, eyeballs, planets, bubbles.*
- \`vec2 iBox(vec3 ro, vec3 rd, vec3 b)\` - Ray vs axis-aligned box centered at the origin with half-extents b (slab method). Returns vec2(tNear, tFar), or vec2(-1) on a miss. Works when the ray starts inside (tNear < 0 < tFar). *Use: bounding boxes for raymarching, glass cubes, rooms.*
`
  },
  {
    module: "camera",
    summary: "look-at frames, primary rays, field of view, thin-lens depth of field",
    content: `## camera

camera: look-at frames, primary rays, field of view, thin-lens depth of field. Convention: uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y, so uv.y spans [-1, 1] and aspect is kept.

- \`mat3 cameraMatrix(vec3 ro, vec3 ta, float roll)\` - Camera-to-world matrix looking from ro toward ta, with roll in radians. Columns are (right, up, forward). *Use: every 3D shader.*
- \`float fovToFocal(float fovDegrees)\` - Focal length (the z of the view-space ray) for a vertical field of view in degrees. *Use: matching a reference photo, wide (90) vs telephoto (20) framing.*
- \`vec3 cameraRay(mat3 cam, vec2 uv, float focal)\` - Primary ray direction for screen point uv. focal is about 1.5-2.5 for natural framing (see fovToFocal). *Use: every 3D shader.*
- \`void thinLensRay(mat3 cam, vec2 uv, float focal, float aperture, float focusDist, vec2 xi, inout vec3 ro, out vec3 rd)\` - Thin-lens depth of field. Moves the ray origin over a lens disk of radius aperture, and re-aims it so that points at distance focusDist stay sharp. xi is a pair of uniform random numbers in [0,1) (e.g. hash22 of the pixel and frame). Average many samples (an AA loop, or accumulation across frames in a feedback texture). *Use: macro shots, product renders, cinematic focus pulls, bokeh.*
- \`void orthoRay(mat3 cam, vec2 uv, float size, inout vec3 ro, out vec3 rd)\` - Orthographic ray: parallel rays from a plane of half-height \`size\` centered on ro. *Use: isometric scenes, technical illustrations, flat diorama looks.*
`
  },
  {
    module: "shading",
    summary: "BRDF terms and practical lighting models",
    content: `## shading

shading: BRDF terms and practical lighting models. Vectors are unit length: n = normal, v = toward the viewer (-rd), l = toward the light. Units are "artist units" with pi folded in: a light of color C lights a white Lambert surface facing it to C. Every function here returns radiance per unit light color, already including NoL. Physically based terms follow the Filament documentation (Google).

- \`vec3 fresnelSchlick(float u, vec3 f0)\` - Schlick Fresnel. u is VoH for lights and NoV for environment reflections and rims. f0 = 0.04 for dielectrics (plastic, skin, stone, water ~0.02); for metals f0 = base color. *Use: reflections that strengthen at grazing angles, rim brightening, water and glass.*
- \`float distributionGGX(float NoH, float alpha)\` - GGX / Trowbridge-Reitz normal distribution. alpha = roughness^2. *Use: specular highlight shape (inside specularGGX).*
- \`float visibilitySmithGGX(float NoV, float NoL, float alpha)\` - Height-correlated Smith visibility. Already contains the 1 / (4 NoL NoV) term. *Use: specular shadowing-masking (inside specularGGX).*
- \`vec3 specularGGX(vec3 n, vec3 v, vec3 l, float roughness, vec3 f0)\` - Microfacet specular for one light: pi * D * V * F * NoL (artist units). roughness is perceptual, in [0,1]. *Use: glossy plastic, metal, wet surfaces, car paint, ceramics.*
- \`vec3 shadePBR(vec3 n, vec3 v, vec3 l, vec3 albedo, float roughness, float metallic)\` - Complete metallic-roughness shading for one light (diffuse + specular, NoL included, artist units). Multiply by light color and shadow. Keep albedo around 0.05-0.7 (linear); brighten lights, not albedo. *Use: hero objects, product renders, anything that needs believable materials.*
- \`vec3 envBRDFApprox(vec3 f0, float NoV, float roughness)\` - Split-sum environment specular without a lookup texture (Karis 2014, after Lazarov). Multiply by the sky or environment color in the reflection direction. *Use: sky reflections on glossy surfaces, ambient specular.*
- \`float wrapDiffuse(vec3 n, vec3 l, float w)\` - Energy-conserving wrap diffuse: light wraps past the terminator by w (0 = Lambert, 0.5 = soft). *Use: skin, foliage, cloth, soft stylized shading, fur.*
- \`vec3 hemisphereLight(vec3 n, vec3 skyColor, vec3 groundColor)\` - Hemisphere light: sky color from above blended to ground color from below. *Use: ambient fill, outdoor sky light, studio fill.*
- \`float translucency(vec3 n, vec3 v, vec3 l, float distortion, float power, float thickness)\` - Fast translucency (Barre-Brisebois and Bouchard 2011): light passing through thin parts, seen from the back. distortion bends the light along the normal (0.2-0.5). thickness is 0 (thin) .. 1 (thick); see sdfThickness. *Use: leaves, ears, wax, jade, marble, backlit petals, jellyfish.*
- \`float rimLight(vec3 n, vec3 v, float power)\` - Rim light from the viewing angle: strongest at silhouettes. *Use: character separation from background, fresnel-like glow, stylized outlines.*
`
  },
  {
    module: "water",
    summary: "finite-depth wave dispersion, analytic wave derivatives, exact dielectric Fresnel and RGB attenuation",
    content: `## water

water: finite-depth wave dispersion, analytic wave derivatives, exact dielectric Fresnel and RGB attenuation. Units must agree: wavelength/depth/path in meters, gravity in m/s^2, extinction in 1/m. No textures or scene state.

- \`float waterDispersion(float k, float depth, float gravity)\` - Angular frequency sqrt(g*k*tanh(k*depth)) for finite-depth gravity waves. Nonpositive inputs are clamped. *Use: shallow coasts, ocean swell, lake waves with depth-dependent speed.* Range nonnegative.
- \`vec4 waterWaveD(vec2 xz, float time, vec2 direction, float wavelength, float amplitude, float depth, float footprint)\` - One sinusoidal wave: vec4(height, dh/dx, dh/dz, Laplacian). Direction is normalized internally; zero uses +X. wavelength > 0, amplitude in meters. footprint filters waves below 2-6 pixels; derivatives hold it constant. *Use: analytic water normals, layered swell/chop, curvature foam, finite-depth lake and coastal waves.*
- \`float fresnelDielectric(float cosIncident, float etaIncident, float etaTransmitted)\` - Exact unpolarized dielectric Fresnel for a positive incident cosine and positive refractive indices. Returns 1 for total internal reflection. Caller chooses etaIncident/etaTransmitted for the ray's side. *Use: air-water interfaces (1.0,1.333), underwater views (1.333,1.0), glass.* Range [0,1].
- \`vec3 beerTransmittance(vec3 extinction, float pathLength)\` - Beer-Lambert RGB transmittance exp(-extinction*pathLength). Negative extinction/path is clamped to zero. Use the refracted optical path, not vertical water depth. Attenuation alone does not add scattered light. *Use: depth-colored water, underwater visibility, tinted glass, homogeneous fog.* Range [0,1].
`
  },
  {
    module: "color",
    summary: "transfer functions, perceptual color (Oklab / OkLCh), palettes, luminance, blackbody light colors",
    content: `## color

color: transfer functions, perceptual color (Oklab / OkLCh), palettes, luminance, blackbody light colors. Light, shade and mix in LINEAR color. Picked hex colors (including \`color\` globals), cosine palettes and input textures (\`inputTex\`, \`surface\` globals) are sRGB-encoded, so decode them with srgbToLinear before lighting. Encode once at the very end with linearToSrgb.

- \`vec3 srgbToLinear(vec3 c)\` - Exact sRGB decode (EOTF): encoded [0,1] -> linear. *Use: decoding picked colors, palettes used as albedo, and texture samples.*
- \`vec3 linearToSrgb(vec3 c)\` - Exact sRGB encode (OETF): linear -> display [0,1]. Apply exactly once, after tonemapping. pow(c, 1/2.2) is visibly wrong near black (0.001 encodes to 0.013 here vs 0.043 with 2.2). *Use: final output.*
- \`float luminance(vec3 c)\` - Relative luminance of linear Rec.709 / sRGB color. *Use: desaturation, brightness masks, luminance-based effects.*
- \`vec3 saturation(vec3 c, float s)\` - Scale saturation around luminance: 0 = grey, 1 = unchanged, > 1 = more saturated. *Use: grading, fading distant objects, stylization.*
- \`vec3 linearSrgbToOklab(vec3 c)\` - Linear sRGB -> Oklab (L in [0,1], a/b around [-0.4, 0.4]). Matrices from Bjorn Ottosson (public domain / MIT). *Use: perceptual gradients, even-lightness palettes, hue and chroma edits.*
- \`vec3 oklabToLinearSrgb(vec3 lab)\` - Oklab -> linear sRGB. The result can fall outside [0,1] for saturated colors, so clamp after tonemapping. *Use: converting perceptual edits back for lighting or output.*
- \`vec3 mixOklab(vec3 a, vec3 b, float t)\` - Mix two linear colors in Oklab. Avoids the muddy mid-tones of RGB lerps and the hue detours of HSV. *Use: gradients, sky ramps, color transitions over time, blending materials.*
- \`vec3 oklchToLinearSrgb(vec3 lch)\` - OkLCh (lightness, chroma, hue in radians) -> linear sRGB. Hue sweeps keep lightness constant. L about 0.4-0.9, C about 0.05-0.2 stays mostly in gamut. *Use: harmonious palettes, rainbow ramps with even brightness, per-instance hue variation.*
- \`vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d)\` - Cosine palette a + b * cos(2 pi (c t + d)). Output is display-like (sRGB-ish), so decode it for albedo. Integer c values loop seamlessly over t in [0,1]. *Use: quick gradients, heat maps, psychedelic color cycling, per-id colors.*
- \`vec3 blackbody(float kelvin)\` - Approximate linear sRGB color of a blackbody at temperature kelvin (1000-15000 K), normalized to max channel 1. Uses the Krystek (1985) Planckian-locus fit -> XYZ -> sRGB. *Use: fire, embers, lava, stars, incandescent lamps, sunset light, molten metal.*
`
  },
  {
    module: "tonemap",
    summary: "map scene-linear HDR to display range",
    content: `## tonemap

tonemap: map scene-linear HDR to display range. Every function here takes linear input (after exposure) and returns LINEAR [0,1]. Then apply linearToSrgb exactly once. Recommended chain: col *= exposure; col = tonemapAgX(col); col = linearToSrgb(col); add dither. Choosing: AgX (default) for 3D scenes, glows, fire, suns and volumes; its highlights roll off to white without hue skews. tonemapNeutral for 2D, product shots and palette-faithful work. ACES for the saturated filmic look.

- \`vec3 tonemapAgX(vec3 c)\` - AgX: log encoding plus a sigmoid inside an inset/outset gamut. Mid-grey 0.18 maps to about 0.5 display. Minimal implementation after Troy Sobotka's AgX and Benjamin Wrensch's polynomial fit (both MIT). *Use: default tonemapper for 3D, emissive glows, fire, neon, skies, clouds.*
- \`vec3 tonemapAgXPunchy(vec3 c)\` - AgX with the "punchy" look (more contrast and saturation) for stylized art. *Use: stylized 3D, saturated sunsets, toy-like renders.*
- \`vec3 tonemapNeutral(vec3 c)\` - Khronos PBR Neutral: leaves [0, ~0.76] almost untouched and compresses only highlights, preserving hue. *Use: 2D art, palette-faithful scenes, product renders, UI glow.*
- \`vec3 tonemapACES(vec3 c)\` - Stephen Hill's ACES fit (RRT + ODT, sRGB primaries). Contrasty and saturated; blues drift purple when very bright. Darker than AgX at the same exposure: multiply the input by about 1.6 to compensate. *Use: the classic "filmic game" look.*
- \`vec3 tonemapReinhard(vec3 c, float white)\` - Extended Reinhard on luminance: maps \`white\` to 1 and preserves hue. Simple and predictable. *Use: quick previews, soft low-contrast looks.*
`
  },
  {
    module: "volume",
    summary: "participating media (fog, smoke, clouds, haze)",
    content: `## volume

volume: participating media (fog, smoke, clouds, haze). mu = dot(rd, l): the cosine between the view ray and the direction TOWARD the light, so forward scattering peaks when looking at the light. Integration follows Hillaire (Frostbite, SIGGRAPH 2015/2016); cloud tricks follow Schneider (Horizon Zero Dawn, 2015).

- \`float phaseIsotropic()\` - Isotropic phase function (scatters equally in all directions). *Use: dusty fog, thick smoke interiors.*
- \`float phaseRayleigh(float mu)\` - Rayleigh phase function. *Use: sky scattering by air molecules (blue sky).*
- \`float phaseHG(float mu, float g)\` - Henyey-Greenstein phase function. g in (-1, 1): > 0 forward (silver linings), < 0 backward. *Use: clouds (g ~ 0.6-0.85), fog glow around lights, underwater light shafts.*
- \`float phaseDualHG(float mu, float gF, float gB, float w)\` - Two-lobe Henyey-Greenstein: a forward lobe gF and a backward lobe gB, mixed by w (weight of the forward lobe). Keeps the silver lining while clouds lit from behind the camera still show detail. *Use: clouds, smoke lit from varying angles.*
- \`float phaseCornetteShanks(float mu, float g)\` - Cornette-Shanks phase (a better-normalized Mie approximation). g = 0.8 for atmospheric haze. *Use: sun halo in hazy skies, aerosols.*
- \`float beerPowder(float d)\` - Beer-Powder lighting term for clouds: 2 e^-d (1 - e^-2d), where d is optical depth toward the sun. Darkens cloud edges that face the light like powdered sugar. Not energy-conserving; use it on the direct term only. *Use: cumulus clouds, puffy smoke.*
- \`void volumeStep(inout vec3 radiance, inout vec3 transmittance, vec3 sigmaT, vec3 inScatter, float ds)\` - One energy-conserving step of volume integration. sigmaT is extinction per unit length (RGB for tinted media), inScatter is in-scattered radiance at this point (including sigmaS, phase and light), ds is step length. Accumulates into radiance and transmittance. Stable for dense media, unlike radiance += T * S * ds. *Use: any raymarched volume: clouds, smoke, fog, fire, nebulae.*
- \`float distanceFog(float t, float density)\` - Distance fog amount (0 = clear, 1 = fully fogged) for distance t. *Use: depth cueing, haze, underwater murk.*
- \`float heightFog(vec3 ro, vec3 rd, float t, float a, float b)\` - Analytic height fog for density a * exp(-b * y) along the ray segment [0, t]. Thick near the ground, thin above. Returns the fog amount in [0,1]. *Use: valley mist, ground fog, layered haze in landscapes.*
`
  },
  {
    module: "atmosphere",
    summary: "skies and sun",
    content: `## atmosphere

atmosphere: skies and sun. simpleSky is a cheap artistic gradient. atmosphereSky is physically based single scattering (Rayleigh + Mie + ozone) with constants from Hillaire, "A Scalable and Production Ready Sky and Atmosphere Rendering Technique" (EGSR 2020). Distances are in kilometers to avoid float cancellation.

- \`vec3 simpleSky(vec3 rd, vec3 sunDir)\` - Cheap analytic sky: horizon-to-zenith gradient, darker ground below the horizon, sun glow lobes. Returns linear radiance (roughly 0-2; the glow can exceed 1 near the sun). *Use: quick backgrounds, reflections, fog color, stylized daylight.*
- \`vec3 sunDisk(vec3 rd, vec3 sunDir, float angularRadius, float pixelAngle)\` - Sun disk with antialiased edge and limb darkening (Neckel 1996). angularRadius in radians (the real sun is 0.00476; art often uses 3-10x). pixelAngle is the angular size of a pixel (about 2 / (resolution.y * focal)). Returns a 0..1 shape tinted by limb darkening; multiply by a bright sun color (10-50). *Use: suns, moons (use a different tint), bright stars in skies.*
- \`const float ATMOSPHERE_GROUND_KM = 6360.0;\`
- \`const float ATMOSPHERE_TOP_KM = 6460.0;\`
- \`vec3 atmosphereDensity(float h)\` - Densities (rayleigh, mie, ozone) at altitude h km above the ground. *Use: custom atmosphere marches (aerial perspective, planet views).*
- \`vec3 atmosphereExtinction(vec3 density)\` - Extinction per km for the given densities. *Use: transmittance through air for sun color and aerial perspective.*
- \`vec3 atmosphereSky(vec3 rd, vec3 sunDir, float viewHeightKm, float sunIntensity)\` - Physically based sky radiance along rd for a viewer viewHeightKm above the ground, with single scattering (16 view steps x 8 light steps). sunIntensity about 20. Sunsets come out somewhat dark because multiple scattering is ignored; add a small ambient term if needed. *Use: realistic skies, sunsets, aerial perspective colors, planet-from-space views.*
`
  },
  {
    module: "post",
    summary: "antialiasing helpers, supersampling offsets, lens effects, grain and dithering, all usable inside one pass",
    content: `## post

post: antialiasing helpers, supersampling offsets, lens effects, grain and dithering, all usable inside one pass. Order of a finished frame: (per AA sample) exposure, vignette, grain -> tonemap -> average samples -> linearToSrgb -> dither. See \`shader-craft-rendering-pipeline\`.

- \`float fillAA(float d)\` / \`float fillAA(float d, float px)\` - Antialiased fill of a 2D SDF: 1 inside, 0 outside, box-filtered across one pixel. Uses screen derivatives, so call it outside non-uniform branches and loops. For a fixed pixel size use fillAA(d, px). *Use: 2D shapes, icons, text-like strokes, UI, masks with crisp edges.*
- \`float strokeAA(float d, float hw, float px)\` - Antialiased stroke of half-width hw around the zero line of a 2D SDF. *Use: outlines, line art, rings, wireframes, contour lines.*
- \`vec2 aaOffset(int i)\` - Subpixel offset in [-0.5, 0.5)^2 for sample i of a supersampling loop (R2 low-discrepancy sequence). Better coverage than a regular grid for any sample count. *Use: AA loops: for (int i = 0; i < N; i++) { vec2 o = aaOffset(i); ... sceneColor(gl_FragCoord.xy + o) }.*
- \`float vignette(vec2 uv, float focal)\` - Natural (cos^4) vignette for a pinhole camera: uv is the screen point, focal the camera focal length. Wider lenses vignette more. Multiply HDR color before tonemapping. *Use: photographic falloff, framing, cinematic looks.*
- \`vec3 filmGrain(vec3 col, float amount, float n)\` - Signal-dependent film grain: noise grows with sqrt(intensity), as photon noise does. n should be zero-mean noise (e.g. hash13(vec3(gl_FragCoord.xy, frame)) * 2 - 1). Apply in linear HDR before tonemapping. *Use: filmic texture, hiding banding, analog looks.*
- \`vec3 ditherTPDF(vec2 pixel, int frame)\` - Triangular-PDF dither of +-1 LSB for 8-bit output. Add AFTER linearToSrgb, right before writing fragColor. pixel is gl_FragCoord.xy; the engine's \`frame\` never wraps, so pass 0 for a still that must render identically at the same time. *Use: removing banding in skies, fog, vignettes and dark gradients.*
`
  },
  {
    module: "debug",
    summary: "visualize intermediate fields",
    content: `## debug

debug: visualize intermediate fields. The shader-craft DEBUG_MODE convention: 0 final render | 1 distance field / contours | 2 normals | 3 material ids | 4 step count / depth | 5 masks / density | 6 lighting terms. While building, declare it as an agent-only global \`debugMode\` with \`define: "DEBUG_MODE"\` (default 0), so each view compiles as its own variant; remove the global and its branches before delivery.

- \`vec3 debugDistance(float d)\` - Distance field as contour bands: warm outside, cool inside, white zero line. Bands are 0.1 units apart. *Use: checking SDF scale, smoothness, wrong signs, bad blends (kinked or bunched contours).*
- \`vec3 debugNormal(vec3 n)\` - Normal as RGB. *Use: spotting seams, flipped normals, noisy normals.*
- \`vec3 debugIdColor(float id)\` - Distinct color per integer id. *Use: material ids, cell ids, instance ids.*
- \`vec3 debugHeat(float t)\` - Heat ramp for a value in [0,1]: black, blue, magenta, orange, yellow, white. *Use: step counts (steps / maxSteps), depth, cost, any scalar mask.*
`
  }
];

// src/knowledge/shader-craft/library/symbols.ts
var SHADER_CRAFT_LIBRARY = [
  {
    id: "PI",
    kind: "const",
    module: "common",
    summary: "Pi, to the precision of a 32-bit float.",
    credits: ["shader-skills"],
    glsl: { name: "PI", signature: "const float PI = 3.14159265358979;", dependencies: [], requires: [] },
    wgsl: { name: "PI", signature: "const PI: f32 = 3.14159265358979;", dependencies: [], requires: [] }
  },
  {
    id: "TAU",
    kind: "const",
    module: "common",
    summary: "Two pi: one full turn in radians.",
    credits: ["shader-skills"],
    glsl: { name: "TAU", signature: "const float TAU = 6.28318530717959;", dependencies: [], requires: [] },
    wgsl: { name: "TAU", signature: "const TAU: f32 = 6.28318530717959;", dependencies: [], requires: [] }
  },
  {
    id: "saturate(float)",
    kind: "function",
    module: "common",
    summary: "Clamp to [0,1].",
    credits: ["shader-skills"],
    glsl: { name: "saturate", signature: "float saturate(float x)", dependencies: [], requires: [] },
    wgsl: { name: "saturate_f", signature: "fn saturate_f(x: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "saturate(vec3)",
    kind: "function",
    module: "common",
    summary: "Clamp to [0,1].",
    credits: ["shader-skills"],
    glsl: { name: "saturate", signature: "vec3 saturate(vec3 x)", dependencies: [], requires: [] },
    wgsl: { name: "saturate_f3", signature: "fn saturate_f3(x: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "dot2(vec2)",
    kind: "function",
    module: "common",
    summary: "Squared length.",
    credits: ["shader-skills"],
    glsl: { name: "dot2", signature: "float dot2(vec2 v)", dependencies: [], requires: [] },
    wgsl: { name: "dot2_f2", signature: "fn dot2_f2(v: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "dot2(vec3)",
    kind: "function",
    module: "common",
    summary: "Squared length.",
    credits: ["shader-skills"],
    glsl: { name: "dot2", signature: "float dot2(vec3 v)", dependencies: [], requires: [] },
    wgsl: { name: "dot2_f3", signature: "fn dot2_f3(v: vec3f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "rot2(float)",
    kind: "function",
    module: "common",
    summary: "2D rotation matrix: rot2(a) * v rotates v counter-clockwise by a radians.",
    credits: ["shader-skills"],
    glsl: { name: "rot2", signature: "mat2 rot2(float a)", dependencies: [], requires: [] },
    wgsl: { name: "rot2", signature: "fn rot2(a: f32) -> mat2x2f", dependencies: [], requires: [] }
  },
  {
    id: "remap(float,float,float,float,float)",
    kind: "function",
    module: "common",
    summary: "Linear remap of x from [a,b] to [c,d] (unclamped).",
    credits: ["shader-skills"],
    glsl: { name: "remap", signature: "float remap(float x, float a, float b, float c, float d)", dependencies: [], requires: [] },
    wgsl: { name: "remap", signature: "fn remap(x: f32, a: f32, b: f32, c: f32, d: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "linearstep(float,float,float)",
    kind: "function",
    module: "common",
    summary: "Linear ramp from 0 at a to 1 at b, clamped.",
    credits: ["shader-skills"],
    glsl: { name: "linearstep", signature: "float linearstep(float a, float b, float x)", dependencies: [], requires: [] },
    wgsl: { name: "linearstep", signature: "fn linearstep(a: f32, b: f32, x: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "cubicPulse(float,float,float)",
    kind: "function",
    module: "common",
    summary: "Smooth bump: 1 at x == c, falling to 0 at |x - c| >= w (cubic).",
    credits: ["quilez-articles"],
    glsl: { name: "cubicPulse", signature: "float cubicPulse(float c, float w, float x)", dependencies: [], requires: [] },
    wgsl: { name: "cubicPulse", signature: "fn cubicPulse(c: f32, w: f32, x: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "expImpulse(float,float)",
    kind: "function",
    module: "common",
    summary: "Fast attack, exponential decay.",
    credits: ["quilez-articles"],
    glsl: { name: "expImpulse", signature: "float expImpulse(float x, float k)", dependencies: [], requires: [] },
    wgsl: { name: "expImpulse", signature: "fn expImpulse(x: f32, k: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "gain(float,float)",
    kind: "function",
    module: "common",
    summary: "Contrast curve on [0,1] that keeps 0, 0.5 and 1 fixed.",
    credits: ["quilez-articles"],
    glsl: { name: "gain", signature: "float gain(float x, float k)", dependencies: [], requires: [] },
    wgsl: { name: "gain", signature: "fn gain(x: f32, k: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "parabola(float,float)",
    kind: "function",
    module: "common",
    summary: "0 at x = 0 and x = 1, peak 1 at x = 0.5; k sharpens.",
    credits: ["quilez-articles"],
    glsl: { name: "parabola", signature: "float parabola(float x, float k)", dependencies: [], requires: [] },
    wgsl: { name: "parabola", signature: "fn parabola(x: f32, k: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "almostIdentity(float,float,float)",
    kind: "function",
    module: "common",
    summary: "Returns x when x > m; smoothly bottoms out at n when x -> 0.",
    credits: ["quilez-articles"],
    glsl: { name: "almostIdentity", signature: "float almostIdentity(float x, float m, float n)", dependencies: [], requires: [] },
    wgsl: { name: "almostIdentity", signature: "fn almostIdentity(x: f32, m: f32, n: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "pcgHash(uint)",
    kind: "function",
    module: "hash",
    summary: "PCG-style 1D integer hash.",
    credits: ["pcg-hash"],
    glsl: { name: "pcgHash", signature: "uint pcgHash(uint v)", dependencies: [], requires: [] },
    wgsl: { name: "pcgHash", signature: "fn pcgHash(v: u32) -> u32", dependencies: [], requires: [] }
  },
  {
    id: "pcg3d(uvec3)",
    kind: "function",
    module: "hash",
    summary: "3D integer hash, three decorrelated outputs.",
    credits: ["pcg-hash"],
    glsl: { name: "pcg3d", signature: "uvec3 pcg3d(uvec3 v)", dependencies: [], requires: [] },
    wgsl: { name: "pcg3d", signature: "fn pcg3d(v: vec3u) -> vec3u", dependencies: [], requires: [] }
  },
  {
    id: "pcg4d(uvec4)",
    kind: "function",
    module: "hash",
    summary: "4D integer hash, four decorrelated outputs (0 BigCrush failures in the JCGT study).",
    credits: ["pcg-hash"],
    glsl: { name: "pcg4d", signature: "uvec4 pcg4d(uvec4 v)", dependencies: [], requires: [] },
    wgsl: { name: "pcg4d", signature: "fn pcg4d(v: vec4u) -> vec4u", dependencies: [], requires: [] }
  },
  {
    id: "uintToUnit(uint)",
    kind: "function",
    module: "hash",
    summary: "Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "uintToUnit", signature: "float uintToUnit(uint h)", dependencies: [], requires: [] },
    wgsl: { name: "uintToUnit_u", signature: "fn uintToUnit_u(h: u32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "uintToUnit(uvec2)",
    kind: "function",
    module: "hash",
    summary: "Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "uintToUnit", signature: "vec2 uintToUnit(uvec2 h)", dependencies: [], requires: [] },
    wgsl: { name: "uintToUnit_u2", signature: "fn uintToUnit_u2(h: vec2u) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "uintToUnit(uvec3)",
    kind: "function",
    module: "hash",
    summary: "Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "uintToUnit", signature: "vec3 uintToUnit(uvec3 h)", dependencies: [], requires: [] },
    wgsl: { name: "uintToUnit_u3", signature: "fn uintToUnit_u3(h: vec3u) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "uintToUnit(uvec4)",
    kind: "function",
    module: "hash",
    summary: "Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "uintToUnit", signature: "vec4 uintToUnit(uvec4 h)", dependencies: [], requires: [] },
    wgsl: { name: "uintToUnit_u4", signature: "fn uintToUnit_u4(h: vec4u) -> vec4f", dependencies: [], requires: [] }
  },
  {
    id: "hash11(float)",
    kind: "function",
    module: "hash",
    summary: "Random float in [0,1) for an integer-valued input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash11", signature: "float hash11(float p)", dependencies: ["pcgHash(uint)", "uintToUnit(uint)"], requires: [] },
    wgsl: { name: "hash11", signature: "fn hash11(p: f32) -> f32", dependencies: ["pcgHash(uint)", "uintToUnit(uint)"], requires: [] }
  },
  {
    id: "hash12(vec2)",
    kind: "function",
    module: "hash",
    summary: "Random float in [0,1) for an integer-valued 2D input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash12", signature: "float hash12(vec2 p)", dependencies: ["pcgHash(uint)", "uintToUnit(uint)"], requires: [] },
    wgsl: { name: "hash12", signature: "fn hash12(p: vec2f) -> f32", dependencies: ["pcgHash(uint)", "uintToUnit(uint)"], requires: [] }
  },
  {
    id: "hash13(vec3)",
    kind: "function",
    module: "hash",
    summary: "Random float in [0,1) for an integer-valued 3D input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash13", signature: "float hash13(vec3 p)", dependencies: ["pcgHash(uint)", "uintToUnit(uint)"], requires: [] },
    wgsl: { name: "hash13", signature: "fn hash13(p: vec3f) -> f32", dependencies: ["pcgHash(uint)", "uintToUnit(uint)"], requires: [] }
  },
  {
    id: "hash22(vec2)",
    kind: "function",
    module: "hash",
    summary: "Random vec2 in [0,1)^2 for an integer-valued 2D input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash22", signature: "vec2 hash22(vec2 p)", dependencies: ["pcg3d(uvec3)", "uintToUnit(uvec3)"], requires: [] },
    wgsl: { name: "hash22", signature: "fn hash22(p: vec2f) -> vec2f", dependencies: ["pcg3d(uvec3)", "uintToUnit(uvec3)"], requires: [] }
  },
  {
    id: "hash33(vec3)",
    kind: "function",
    module: "hash",
    summary: "Random vec3 in [0,1)^3 for an integer-valued 3D input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash33", signature: "vec3 hash33(vec3 p)", dependencies: ["pcg3d(uvec3)", "uintToUnit(uvec3)"], requires: [] },
    wgsl: { name: "hash33", signature: "fn hash33(p: vec3f) -> vec3f", dependencies: ["pcg3d(uvec3)", "uintToUnit(uvec3)"], requires: [] }
  },
  {
    id: "hash44(vec4)",
    kind: "function",
    module: "hash",
    summary: "Random vec4 in [0,1)^4 for an integer-valued 4D input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash44", signature: "vec4 hash44(vec4 p)", dependencies: ["pcg4d(uvec4)", "uintToUnit(uvec4)"], requires: [] },
    wgsl: { name: "hash44", signature: "fn hash44(p: vec4f) -> vec4f", dependencies: ["pcg4d(uvec4)", "uintToUnit(uvec4)"], requires: [] }
  },
  {
    id: "hash32(vec2)",
    kind: "function",
    module: "hash",
    summary: "Random vec3 in [0,1)^3 for an integer-valued 2D input.",
    credits: ["pcg-hash", "shader-skills"],
    glsl: { name: "hash32", signature: "vec3 hash32(vec2 p)", dependencies: ["pcg3d(uvec3)", "uintToUnit(uvec3)"], requires: [] },
    wgsl: { name: "hash32", signature: "fn hash32(p: vec2f) -> vec3f", dependencies: ["pcg3d(uvec3)", "uintToUnit(uvec3)"], requires: [] }
  },
  {
    id: "quinticFade(vec2)",
    kind: "function",
    module: "noise",
    summary: "Quintic fade 6t^5 - 15t^4 + 10t^3: C2-continuous interpolation weights for lattice noise.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "quinticFade", signature: "vec2 quinticFade(vec2 f)", dependencies: [], requires: [] },
    wgsl: { name: "quinticFade_f2", signature: "fn quinticFade_f2(f: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "quinticFade(vec3)",
    kind: "function",
    module: "noise",
    summary: "Quintic fade 6t^5 - 15t^4 + 10t^3: C2-continuous interpolation weights for lattice noise.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "quinticFade", signature: "vec3 quinticFade(vec3 f)", dependencies: [], requires: [] },
    wgsl: { name: "quinticFade_f3", signature: "fn quinticFade_f3(f: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "quinticFadeDeriv(vec2)",
    kind: "function",
    module: "noise",
    summary: "Derivative of quinticFade: 30 t^2 (t - 1)^2.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "quinticFadeDeriv", signature: "vec2 quinticFadeDeriv(vec2 f)", dependencies: [], requires: [] },
    wgsl: { name: "quinticFadeDeriv_f2", signature: "fn quinticFadeDeriv_f2(f: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "quinticFadeDeriv(vec3)",
    kind: "function",
    module: "noise",
    summary: "Derivative of quinticFade: 30 t^2 (t - 1)^2.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "quinticFadeDeriv", signature: "vec3 quinticFadeDeriv(vec3 f)", dependencies: [], requires: [] },
    wgsl: { name: "quinticFadeDeriv_f3", signature: "fn quinticFadeDeriv_f3(f: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "valueNoiseD(vec2)",
    kind: "function",
    module: "noise",
    summary: "2D value noise with analytic derivatives.",
    credits: ["quilez-articles", "pcg-hash"],
    glsl: { name: "valueNoiseD", signature: "vec3 valueNoiseD(vec2 p)", dependencies: ["hash12(vec2)", "quinticFade(vec2)", "quinticFadeDeriv(vec2)"], requires: [] },
    wgsl: { name: "valueNoiseD", signature: "fn valueNoiseD(p: vec2f) -> vec3f", dependencies: ["hash12(vec2)", "quinticFade(vec2)", "quinticFadeDeriv(vec2)"], requires: [] }
  },
  {
    id: "valueNoise(vec2)",
    kind: "function",
    module: "noise",
    summary: "2D value noise.",
    credits: ["quilez-articles", "pcg-hash"],
    glsl: { name: "valueNoise", signature: "float valueNoise(vec2 p)", dependencies: ["valueNoiseD(vec2)"], requires: [] },
    wgsl: { name: "valueNoise_f2", signature: "fn valueNoise_f2(p: vec2f) -> f32", dependencies: ["valueNoiseD(vec2)"], requires: [] }
  },
  {
    id: "valueNoise(vec3)",
    kind: "function",
    module: "noise",
    summary: "3D value noise.",
    credits: ["quilez-articles", "pcg-hash"],
    glsl: { name: "valueNoise", signature: "float valueNoise(vec3 p)", dependencies: ["hash13(vec3)", "quinticFade(vec3)"], requires: [] },
    wgsl: { name: "valueNoise_f3", signature: "fn valueNoise_f3(p: vec3f) -> f32", dependencies: ["hash13(vec3)", "quinticFade(vec3)"], requires: [] }
  },
  {
    id: "latticeGradient(vec2)",
    kind: "function",
    module: "noise",
    summary: "Unit gradient for a 2D lattice point.",
    credits: ["pcg-hash", "perlin-improved-noise"],
    glsl: { name: "latticeGradient", signature: "vec2 latticeGradient(vec2 cell)", dependencies: ["TAU", "hash12(vec2)"], requires: [] },
    wgsl: { name: "latticeGradient", signature: "fn latticeGradient(cell: vec2f) -> vec2f", dependencies: ["TAU", "hash12(vec2)"], requires: [] }
  },
  {
    id: "gradientNoiseD(vec2)",
    kind: "function",
    module: "noise",
    summary: "2D gradient (Perlin-style) noise with analytic derivatives.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "gradientNoiseD", signature: "vec3 gradientNoiseD(vec2 p)", dependencies: ["quinticFade(vec2)", "quinticFadeDeriv(vec2)", "latticeGradient(vec2)"], requires: [] },
    wgsl: { name: "gradientNoiseD_f2", signature: "fn gradientNoiseD_f2(p: vec2f) -> vec3f", dependencies: ["quinticFade(vec2)", "quinticFadeDeriv(vec2)", "latticeGradient(vec2)"], requires: [] }
  },
  {
    id: "gradientNoise(vec2)",
    kind: "function",
    module: "noise",
    summary: "2D gradient noise.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "gradientNoise", signature: "float gradientNoise(vec2 p)", dependencies: ["gradientNoiseD(vec2)"], requires: [] },
    wgsl: { name: "gradientNoise_f2", signature: "fn gradientNoise_f2(p: vec2f) -> f32", dependencies: ["gradientNoiseD(vec2)"], requires: [] }
  },
  {
    id: "simplexNoiseD(vec2,float)",
    kind: "function",
    module: "noise",
    summary: "2D simplex noise with analytic gradient.",
    credits: ["simplex-noise", "flow-noise"],
    glsl: { name: "simplexNoiseD", signature: "vec3 simplexNoiseD(vec2 p, float rotation)", dependencies: ["rot2(float)", "latticeGradient(vec2)"], requires: [] },
    wgsl: { name: "simplexNoiseD_f2f", signature: "fn simplexNoiseD_f2f(p: vec2f, rotation: f32) -> vec3f", dependencies: ["rot2(float)", "latticeGradient(vec2)"], requires: [] },
    parity: {
      tolerance: 95367431640625e-20,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 7450580596923828e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "simplexNoiseD(vec2)",
    kind: "function",
    module: "noise",
    summary: "2D simplex noise with analytic gradient.",
    credits: ["simplex-noise", "flow-noise"],
    glsl: { name: "simplexNoiseD", signature: "vec3 simplexNoiseD(vec2 p)", dependencies: ["simplexNoiseD(vec2,float)"], requires: [] },
    wgsl: { name: "simplexNoiseD_f2", signature: "fn simplexNoiseD_f2(p: vec2f) -> vec3f", dependencies: ["simplexNoiseD(vec2,float)"], requires: [] }
  },
  {
    id: "simplexNoise(vec2)",
    kind: "function",
    module: "noise",
    summary: "2D simplex noise.",
    credits: ["simplex-noise"],
    glsl: { name: "simplexNoise", signature: "float simplexNoise(vec2 p)", dependencies: ["simplexNoiseD(vec2,float)"], requires: [] },
    wgsl: { name: "simplexNoise", signature: "fn simplexNoise(p: vec2f) -> f32", dependencies: ["simplexNoiseD(vec2,float)"], requires: [] }
  },
  {
    id: "latticeGradDot(vec3,vec3,vec3)",
    kind: "function",
    module: "noise",
    summary: "Dot product of a hashed 3D gradient with the offset to its lattice corner.",
    credits: ["pcg-hash", "perlin-improved-noise"],
    glsl: { name: "latticeGradDot", signature: "float latticeGradDot(vec3 cell, vec3 corner, vec3 f)", dependencies: ["hash33(vec3)"], requires: [] },
    wgsl: { name: "latticeGradDot", signature: "fn latticeGradDot(cell: vec3f, corner: vec3f, f: vec3f) -> f32", dependencies: ["hash33(vec3)"], requires: [] }
  },
  {
    id: "gradientNoise(vec3)",
    kind: "function",
    module: "noise",
    summary: "3D gradient noise.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "gradientNoise", signature: "float gradientNoise(vec3 p)", dependencies: ["quinticFade(vec3)", "latticeGradDot(vec3,vec3,vec3)"], requires: [] },
    wgsl: { name: "gradientNoise_f3", signature: "fn gradientNoise_f3(p: vec3f) -> f32", dependencies: ["quinticFade(vec3)", "latticeGradDot(vec3,vec3,vec3)"], requires: [] }
  },
  {
    id: "gradientNoiseD(vec3)",
    kind: "function",
    module: "noise",
    summary: "3D gradient noise with analytic derivatives.",
    credits: ["quilez-articles", "perlin-improved-noise"],
    glsl: { name: "gradientNoiseD", signature: "vec4 gradientNoiseD(vec3 p)", dependencies: ["hash33(vec3)", "quinticFade(vec3)", "quinticFadeDeriv(vec3)"], requires: [] },
    wgsl: { name: "gradientNoiseD_f3", signature: "fn gradientNoiseD_f3(p: vec3f) -> vec4f", dependencies: ["hash33(vec3)", "quinticFade(vec3)", "quinticFadeDeriv(vec3)"], requires: [] },
    parity: {
      tolerance: 476837158203125e-21,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 4172325134277344e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "FBM_MAX_OCTAVES",
    kind: "const",
    module: "noise",
    summary: "Loop bound of the fBm family; octave counts above it are cut to it.",
    credits: ["quilez-articles", "book-of-shaders"],
    glsl: { name: "FBM_MAX_OCTAVES", signature: "const int FBM_MAX_OCTAVES = 12;", dependencies: [], requires: [] },
    wgsl: { name: "FBM_MAX_OCTAVES", signature: "const FBM_MAX_OCTAVES: i32 = 12;", dependencies: [], requires: [] }
  },
  {
    id: "fbm(vec2,int,float,float)",
    kind: "function",
    module: "noise",
    summary: "Fractional Brownian motion over 2D gradient noise.",
    credits: ["quilez-articles", "book-of-shaders"],
    glsl: { name: "fbm", signature: "float fbm(vec2 p, int octaves, float lacunarity, float persistence)", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "fbm_f2iff", signature: "fn fbm_f2iff(p: vec2f, octaves: i32, lacunarity: f32, persistence: f32) -> f32", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "fbm(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "2D fBm with the usual defaults (lacunarity 2.01 so octave peaks never re-align, persistence 0.5).",
    credits: ["quilez-articles", "book-of-shaders"],
    glsl: { name: "fbm", signature: "float fbm(vec2 p, int octaves)", dependencies: ["fbm(vec2,int,float,float)"], requires: [] },
    wgsl: { name: "fbm_f2i", signature: "fn fbm_f2i(p: vec2f, octaves: i32) -> f32", dependencies: ["fbm(vec2,int,float,float)"], requires: [] }
  },
  {
    id: "fbm(vec3,int,float,float)",
    kind: "function",
    module: "noise",
    summary: "fBm over 3D gradient noise.",
    credits: ["quilez-articles", "book-of-shaders"],
    glsl: { name: "fbm", signature: "float fbm(vec3 p, int octaves, float lacunarity, float persistence)", dependencies: ["gradientNoise(vec3)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "fbm_f3iff", signature: "fn fbm_f3iff(p: vec3f, octaves: i32, lacunarity: f32, persistence: f32) -> f32", dependencies: ["gradientNoise(vec3)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "erodedFbm(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "Terrain fBm where each octave is damped by the accumulated slope, so detail settles in valleys and steep slopes stay smooth.",
    credits: ["quilez-articles"],
    glsl: { name: "erodedFbm", signature: "float erodedFbm(vec2 p, int octaves)", dependencies: ["gradientNoiseD(vec2)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "erodedFbm", signature: "fn erodedFbm(p: vec2f, octaves: i32) -> f32", dependencies: ["gradientNoiseD(vec2)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "ridgedFbm(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "Ridged multifractal: inverted |noise| creates sharp crests; each octave is weighted by the previous one, so detail gathers along ridges.",
    credits: ["book-of-shaders"],
    glsl: { name: "ridgedFbm", signature: "float ridgedFbm(vec2 p, int octaves)", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "ridgedFbm", signature: "fn ridgedFbm(p: vec2f, octaves: i32) -> f32", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "turbulence(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "Perlin's turbulence: fBm of |noise|.",
    credits: ["turbulence"],
    glsl: { name: "turbulence", signature: "float turbulence(vec2 p, int octaves)", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "turbulence_f2i", signature: "fn turbulence_f2i(p: vec2f, octaves: i32) -> f32", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "turbulence(vec3,int)",
    kind: "function",
    module: "noise",
    summary: "Perlin's turbulence: fBm of |noise|.",
    credits: ["turbulence"],
    glsl: { name: "turbulence", signature: "float turbulence(vec3 p, int octaves)", dependencies: ["gradientNoise(vec3)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "turbulence_f3i", signature: "fn turbulence_f3i(p: vec3f, octaves: i32) -> f32", dependencies: ["gradientNoise(vec3)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "billowFbm(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "Billowy multifractal: |noise| per octave makes puffy rounded lobes split by sharp creases (the inverse of ridgedFbm).",
    credits: ["billow"],
    glsl: { name: "billowFbm", signature: "float billowFbm(vec2 p, int octaves)", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "billowFbm_f2i", signature: "fn billowFbm_f2i(p: vec2f, octaves: i32) -> f32", dependencies: ["gradientNoise(vec2)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "billowFbm(vec3,int)",
    kind: "function",
    module: "noise",
    summary: "Billowy multifractal: |noise| per octave makes puffy rounded lobes split by sharp creases (the inverse of ridgedFbm).",
    credits: ["billow"],
    glsl: { name: "billowFbm", signature: "float billowFbm(vec3 p, int octaves)", dependencies: ["gradientNoise(vec3)", "FBM_MAX_OCTAVES"], requires: [] },
    wgsl: { name: "billowFbm_f3i", signature: "fn billowFbm_f3i(p: vec3f, octaves: i32) -> f32", dependencies: ["gradientNoise(vec3)", "FBM_MAX_OCTAVES"], requires: [] }
  },
  {
    id: "warpedFbm(vec2,float,int,vec2,vec2)",
    kind: "function",
    module: "noise",
    summary: "Two-level domain warp f(p + s*r), r = fbm(p + s*q), q = fbm(p).",
    credits: ["quilez-articles"],
    glsl: { name: "warpedFbm", signature: "float warpedFbm(vec2 p, float strength, int octaves, out vec2 q, out vec2 r)", dependencies: ["fbm(vec2,int)"], requires: [] },
    wgsl: { name: "warpedFbm", signature: "fn warpedFbm(p: vec2f, strength: f32, octaves: i32, q: ptr<function, vec2f>, r: ptr<function, vec2f>) -> f32", dependencies: ["fbm(vec2,int)"], requires: [] }
  },
  {
    id: "curlNoise(vec2)",
    kind: "function",
    module: "noise",
    summary: "Divergence-free 2D flow field: the curl of scalar gradient noise.",
    credits: ["curl-noise"],
    glsl: { name: "curlNoise", signature: "vec2 curlNoise(vec2 p)", dependencies: ["gradientNoiseD(vec2)"], requires: [] },
    wgsl: { name: "curlNoise_f2", signature: "fn curlNoise_f2(p: vec2f) -> vec2f", dependencies: ["gradientNoiseD(vec2)"], requires: [] }
  },
  {
    id: "curlNoise(vec3)",
    kind: "function",
    module: "noise",
    summary: "Divergence-free 3D flow field: the curl of a vector potential whose components are three decorrelated gradientNoiseD fields.",
    credits: ["curl-noise"],
    glsl: { name: "curlNoise", signature: "vec3 curlNoise(vec3 p)", dependencies: ["gradientNoiseD(vec3)"], requires: [] },
    wgsl: { name: "curlNoise_f3", signature: "fn curlNoise_f3(p: vec3f) -> vec3f", dependencies: ["gradientNoiseD(vec3)"], requires: [] },
    parity: {
      tolerance: 476837158203125e-21,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 2980232238769531e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "voronoi(vec2,float)",
    kind: "function",
    module: "noise",
    summary: "Cellular (Worley/Voronoi) noise.",
    credits: ["quilez-articles", "book-of-shaders"],
    glsl: { name: "voronoi", signature: "vec4 voronoi(vec2 p, float jitter)", dependencies: ["hash22(vec2)"], requires: [] },
    wgsl: { name: "voronoi", signature: "fn voronoi(p: vec2f, jitter: f32) -> vec4f", dependencies: ["hash22(vec2)"], requires: [] }
  },
  {
    id: "voronoiBorder(vec2,float)",
    kind: "function",
    module: "noise",
    summary: "Exact distance to Voronoi cell borders, found in two passes: nearest point, then nearest bisector.",
    credits: ["quilez-articles"],
    glsl: { name: "voronoiBorder", signature: "vec3 voronoiBorder(vec2 p, float jitter)", dependencies: ["dot2(vec2)", "hash22(vec2)"], requires: [] },
    wgsl: { name: "voronoiBorder", signature: "fn voronoiBorder(p: vec2f, jitter: f32) -> vec3f", dependencies: ["dot2(vec2)", "hash22(vec2)"], requires: [] }
  },
  {
    id: "smoothVoronoi(vec2,float)",
    kind: "function",
    module: "noise",
    summary: "Smooth Voronoi: a soft-min of distances to feature points.",
    credits: ["quilez-articles"],
    glsl: { name: "smoothVoronoi", signature: "float smoothVoronoi(vec2 p, float k)", dependencies: ["hash22(vec2)"], requires: [] },
    wgsl: { name: "smoothVoronoi", signature: "fn smoothVoronoi(p: vec2f, k: f32) -> f32", dependencies: ["hash22(vec2)"], requires: [] }
  },
  {
    id: "hybridTerrainHeight(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "Bounded hybrid terrain recipe: broad gradient fBm, warped ridged detail and cellular breakup.",
    credits: ["hybrid-terrain", "book-of-shaders"],
    glsl: { name: "hybridTerrainHeight", signature: "float hybridTerrainHeight(vec2 p, int octaves)", dependencies: ["FBM_MAX_OCTAVES", "fbm(vec2,int)", "ridgedFbm(vec2,int)", "voronoi(vec2,float)"], requires: [] },
    wgsl: { name: "hybridTerrainHeight", signature: "fn hybridTerrainHeight(p: vec2f, octaves: i32) -> f32", dependencies: ["FBM_MAX_OCTAVES", "fbm(vec2,int)", "ridgedFbm(vec2,int)", "voronoi(vec2,float)"], requires: [] },
    parity: {
      tolerance: 11920928955078125e-23,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 11920928955078125e-23 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "interleavedGradientNoise(vec2)",
    kind: "function",
    module: "noise",
    summary: "Interleaved gradient noise: cheap per-pixel noise whose 3x3 neighborhoods are nearly stratified.",
    credits: ["interleaved-gradient-noise"],
    glsl: { name: "interleavedGradientNoise", signature: "float interleavedGradientNoise(vec2 pixel)", dependencies: [], requires: [] },
    wgsl: { name: "interleavedGradientNoise_f2", signature: "fn interleavedGradientNoise_f2(pixel: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "interleavedGradientNoise(vec2,int)",
    kind: "function",
    module: "noise",
    summary: "Interleaved gradient noise: cheap per-pixel noise whose 3x3 neighborhoods are nearly stratified.",
    credits: ["interleaved-gradient-noise"],
    glsl: { name: "interleavedGradientNoise", signature: "float interleavedGradientNoise(vec2 pixel, int frame)", dependencies: ["interleavedGradientNoise(vec2)"], requires: [] },
    wgsl: { name: "interleavedGradientNoise_f2i", signature: "fn interleavedGradientNoise_f2i(pixel: vec2f, frame: i32) -> f32", dependencies: ["interleavedGradientNoise(vec2)"], requires: [] }
  },
  {
    id: "r2Dither(vec2)",
    kind: "function",
    module: "noise",
    summary: "R2 low-discrepancy dither mask (plastic-constant sequence), folded by a triangle wave for an even spread.",
    credits: ["r2-sequence"],
    glsl: { name: "r2Dither", signature: "float r2Dither(vec2 pixel)", dependencies: [], requires: [] },
    wgsl: { name: "r2Dither", signature: "fn r2Dither(pixel: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "triangleWave(vec2)",
    kind: "function",
    module: "pattern",
    summary: "Triangle wave, the integral of a square wave.",
    credits: ["quilez-articles"],
    glsl: { name: "triangleWave", signature: "vec2 triangleWave(vec2 x)", dependencies: [], requires: [] },
    wgsl: { name: "triangleWave", signature: "fn triangleWave(x: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "filteredChecker(vec2,vec2)",
    kind: "function",
    module: "pattern",
    summary: "Box-filtered checkerboard with unit squares: 0 or 1 up close, fading to 0.5 where squares are smaller than a pixel.",
    credits: ["quilez-articles"],
    glsl: { name: "filteredChecker", signature: "float filteredChecker(vec2 p, vec2 w)", dependencies: ["triangleWave(vec2)"], requires: [] },
    wgsl: { name: "filteredChecker", signature: "fn filteredChecker(p: vec2f, w: vec2f) -> f32", dependencies: ["triangleWave(vec2)"], requires: [] }
  },
  {
    id: "filteredGrid(vec2,vec2,float)",
    kind: "function",
    module: "pattern",
    summary: "Box-filtered grid lines (unit cells, line width = 1/n of a cell).",
    credits: ["quilez-articles"],
    glsl: { name: "filteredGrid", signature: "float filteredGrid(vec2 p, vec2 w, float n)", dependencies: [], requires: [] },
    wgsl: { name: "filteredGrid", signature: "fn filteredGrid(p: vec2f, w: vec2f, n: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "filteredStripes(float,float)",
    kind: "function",
    module: "pattern",
    summary: "Box-filtered stripes along x with period 1 and duty cycle 0.5.",
    credits: ["quilez-articles"],
    glsl: { name: "filteredStripes", signature: "float filteredStripes(float x, float w)", dependencies: [], requires: [] },
    wgsl: { name: "filteredStripes", signature: "fn filteredStripes(x: f32, w: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "hexGrid(vec2)",
    kind: "function",
    module: "pattern",
    summary: "Hexagonal tiling with unit spacing between neighboring centers.",
    credits: ["shader-skills"],
    glsl: { name: "hexGrid", signature: "vec4 hexGrid(vec2 p)", dependencies: [], requires: [] },
    wgsl: { name: "hexGrid", signature: "fn hexGrid(p: vec2f) -> vec4f", dependencies: [], requires: [] }
  },
  {
    id: "hexEdgeDistance(vec2)",
    kind: "function",
    module: "pattern",
    summary: "Distance from a hexGrid local coordinate to its hexagon's edge (0.5 at the center, 0 on the edge).",
    credits: ["shader-skills"],
    glsl: { name: "hexEdgeDistance", signature: "float hexEdgeDistance(vec2 local)", dependencies: [], requires: [] },
    wgsl: { name: "hexEdgeDistance", signature: "fn hexEdgeDistance(local: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "truchetArcs(vec2,float)",
    kind: "function",
    module: "pattern",
    summary: "Truchet tiling of quarter-circle arcs, randomly flipped per cell.",
    credits: ["shader-skills", "pcg-hash"],
    glsl: { name: "truchetArcs", signature: "float truchetArcs(vec2 p, float w)", dependencies: ["hash12(vec2)"], requires: [] },
    wgsl: { name: "truchetArcs", signature: "fn truchetArcs(p: vec2f, w: f32) -> f32", dependencies: ["hash12(vec2)"], requires: [] }
  },
  {
    id: "sdSphere(vec3,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Sphere of radius r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdSphere", signature: "float sdSphere(vec3 p, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdSphere", signature: "fn sdSphere(p: vec3f, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdBox(vec3,vec3)",
    kind: "function",
    module: "sdf3d",
    summary: "Axis-aligned box with half-extents b.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdBox", signature: "float sdBox(vec3 p, vec3 b)", dependencies: [], requires: [] },
    wgsl: { name: "sdBox_f3f3", signature: "fn sdBox_f3f3(p: vec3f, b: vec3f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdRoundBox(vec3,vec3,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Box with rounded edges.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdRoundBox", signature: "float sdRoundBox(vec3 p, vec3 b, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdRoundBox", signature: "fn sdRoundBox(p: vec3f, b: vec3f, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdBoxFrame(vec3,vec3,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Wireframe box: edges of a box with half-extents b and edge thickness e.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdBoxFrame", signature: "float sdBoxFrame(vec3 p, vec3 b, float e)", dependencies: [], requires: [] },
    wgsl: { name: "sdBoxFrame", signature: "fn sdBoxFrame(p: vec3f, b: vec3f, e: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdTorus(vec3,vec2)",
    kind: "function",
    module: "sdf3d",
    summary: "Torus in the XZ plane.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdTorus", signature: "float sdTorus(vec3 p, vec2 t)", dependencies: [], requires: [] },
    wgsl: { name: "sdTorus", signature: "fn sdTorus(p: vec3f, t: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdCappedTorus(vec3,vec2,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Partial torus (arc) in the XY plane, symmetric about +Y.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCappedTorus", signature: "float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb)", dependencies: [], requires: [] },
    wgsl: { name: "sdCappedTorus", signature: "fn sdCappedTorus(p: vec3f, sc: vec2f, ra: f32, rb: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdLink(vec3,float,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Chain link: a torus stretched along Y by le.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdLink", signature: "float sdLink(vec3 p, float le, float r1, float r2)", dependencies: [], requires: [] },
    wgsl: { name: "sdLink", signature: "fn sdLink(p: vec3f, le: f32, r1: f32, r2: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdPlane(vec3,vec3,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Infinite plane through the origin offset by h along unit normal n: dot(p, n) + h.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdPlane", signature: "float sdPlane(vec3 p, vec3 n, float h)", dependencies: [], requires: [] },
    wgsl: { name: "sdPlane", signature: "fn sdPlane(p: vec3f, n: vec3f, h: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdCapsule(vec3,vec3,vec3,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Capsule: segment a-b swept by radius r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCapsule", signature: "float sdCapsule(vec3 p, vec3 a, vec3 b, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdCapsule", signature: "fn sdCapsule(p: vec3f, a: vec3f, b: vec3f, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdVerticalCapsule(vec3,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Vertical capsule from y = 0 to y = h, radius r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdVerticalCapsule", signature: "float sdVerticalCapsule(vec3 p, float h, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdVerticalCapsule", signature: "fn sdVerticalCapsule(p: vec3f, h: f32, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdCylinder(vec3,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Vertical capped cylinder from y = -h to y = +h, radius r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCylinder", signature: "float sdCylinder(vec3 p, float h, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdCylinder", signature: "fn sdCylinder(p: vec3f, h: f32, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdCappedCone(vec3,float,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Capped cone (frustum) from y = -h (radius r1) to y = +h (radius r2).",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCappedCone", signature: "float sdCappedCone(vec3 p, float h, float r1, float r2)", dependencies: ["dot2(vec2)"], requires: [] },
    wgsl: { name: "sdCappedCone", signature: "fn sdCappedCone(p: vec3f, h: f32, r1: f32, r2: f32) -> f32", dependencies: ["dot2(vec2)"], requires: [] }
  },
  {
    id: "sdCone(vec3,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Pointed cone with its base disk (radius r) at y = 0 and apex at y = h.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCone", signature: "float sdCone(vec3 p, float h, float r)", dependencies: ["sdCappedCone(vec3,float,float,float)"], requires: [] },
    wgsl: { name: "sdCone", signature: "fn sdCone(p: vec3f, h: f32, r: f32) -> f32", dependencies: ["sdCappedCone(vec3,float,float,float)"], requires: [] }
  },
  {
    id: "sdRoundCone(vec3,float,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Round cone: sphere r1 at y = 0 smoothly hulled with sphere r2 at y = h.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdRoundCone", signature: "float sdRoundCone(vec3 p, float r1, float r2, float h)", dependencies: [], requires: [] },
    wgsl: { name: "sdRoundCone", signature: "fn sdRoundCone(p: vec3f, r1: f32, r2: f32, h: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdEllipsoid(vec3,vec3)",
    kind: "function",
    module: "sdf3d",
    summary: "Ellipsoid with semi-axes r.",
    exactness: "approx",
    credits: ["quilez-articles"],
    glsl: { name: "sdEllipsoid", signature: "float sdEllipsoid(vec3 p, vec3 r)", dependencies: [], requires: [] },
    wgsl: { name: "sdEllipsoid", signature: "fn sdEllipsoid(p: vec3f, r: vec3f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdCutHollowSphere(vec3,float,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Hollow spherical cap (bowl) of radius r, cut by the plane y = h, with shell thickness t.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCutHollowSphere", signature: "float sdCutHollowSphere(vec3 p, float r, float h, float t)", dependencies: [], requires: [] },
    wgsl: { name: "sdCutHollowSphere", signature: "fn sdCutHollowSphere(p: vec3f, r: f32, h: f32, t: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdHexPrism(vec3,vec2)",
    kind: "function",
    module: "sdf3d",
    summary: "Hexagonal prism along Z.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdHexPrism", signature: "float sdHexPrism(vec3 p, vec2 h)", dependencies: [], requires: [] },
    wgsl: { name: "sdHexPrism", signature: "fn sdHexPrism(p: vec3f, h: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdOctahedron(vec3,float)",
    kind: "function",
    module: "sdf3d",
    summary: 'Regular octahedron with "radius" s (vertex distance from center).',
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "sdOctahedron", signature: "float sdOctahedron(vec3 p, float s)", dependencies: [], requires: [] },
    wgsl: { name: "sdOctahedron", signature: "fn sdOctahedron(p: vec3f, s: f32) -> f32", dependencies: [], requires: [] },
    parity: {
      tolerance: 95367431640625e-20,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 5513429641723633e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "sdGyroid(vec3,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Gyroid sheet with cell scale `scale` and half-thickness t.",
    exactness: "bound",
    credits: ["shader-skills"],
    glsl: { name: "sdGyroid", signature: "float sdGyroid(vec3 p, float scale, float t)", dependencies: [], requires: [] },
    wgsl: { name: "sdGyroid", signature: "fn sdGyroid(p: vec3f, scale: f32, t: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdCutSphere(vec3,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Sphere of radius r cut by the plane y = h, keeping the cap ABOVE the plane.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCutSphere", signature: "float sdCutSphere(vec3 p, float r, float h)", dependencies: [], requires: [] },
    wgsl: { name: "sdCutSphere", signature: "fn sdCutSphere(p: vec3f, r: f32, h: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdDeathStar(vec3,float,float,float)",
    kind: "function",
    module: "sdf3d",
    summary: "Sphere ra at the origin with sphere rb at (d, 0, 0) carved out, exact including the crease rim.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdDeathStar", signature: "float sdDeathStar(vec3 p, float ra, float rb, float d)", dependencies: [], requires: [] },
    wgsl: { name: "sdDeathStar", signature: "fn sdDeathStar(p: vec3f, ra: f32, rb: f32, d: f32) -> f32", dependencies: [], requires: [] },
    parity: {
      tolerance: 2384185791015625e-22,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 22556474080242851e-23 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "sdQuadraticBezier(vec3,vec3,vec3,vec3)",
    kind: "function",
    module: "sdf3d",
    summary: "Unsigned distance to a 3D quadratic Bezier curve A-B-C; subtract a radius for a tube.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdQuadraticBezier", signature: "float sdQuadraticBezier(vec3 pos, vec3 A, vec3 B, vec3 C)", dependencies: ["dot2(vec3)"], requires: [] },
    wgsl: { name: "sdQuadraticBezier_f3f3f3f3", signature: "fn sdQuadraticBezier_f3f3f3f3(pos: vec3f, A: vec3f, B: vec3f, C: vec3f) -> f32", dependencies: ["dot2(vec3)"], requires: [] }
  },
  {
    id: "sdCircle(vec2,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Circle of radius r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdCircle", signature: "float sdCircle(vec2 p, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdCircle", signature: "fn sdCircle(p: vec2f, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdBox(vec2,vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Axis-aligned rectangle with half-extents b.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdBox", signature: "float sdBox(vec2 p, vec2 b)", dependencies: [], requires: [] },
    wgsl: { name: "sdBox_f2f2", signature: "fn sdBox_f2f2(p: vec2f, b: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdRoundedBox(vec2,vec2,vec4)",
    kind: "function",
    module: "sdf2d",
    summary: "Rectangle with half-extents b and per-corner radii r = (top-right, bottom-right, top-left, bottom-left).",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdRoundedBox", signature: "float sdRoundedBox(vec2 p, vec2 b, vec4 r)", dependencies: [], requires: [] },
    wgsl: { name: "sdRoundedBox", signature: "fn sdRoundedBox(p: vec2f, b: vec2f, r: vec4f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdSegment(vec2,vec2,vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Unsigned distance to segment a-b.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdSegment", signature: "float sdSegment(vec2 p, vec2 a, vec2 b)", dependencies: [], requires: [] },
    wgsl: { name: "sdSegment", signature: "fn sdSegment(p: vec2f, a: vec2f, b: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdUnevenCapsule(vec2,float,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Tapered capsule: circle r1 at origin hulled with circle r2 at (0, h).",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdUnevenCapsule", signature: "float sdUnevenCapsule(vec2 p, float r1, float r2, float h)", dependencies: [], requires: [] },
    wgsl: { name: "sdUnevenCapsule", signature: "fn sdUnevenCapsule(p: vec2f, r1: f32, r2: f32, h: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdArc(vec2,vec2,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Circular arc symmetric about +Y.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdArc", signature: "float sdArc(vec2 p, vec2 sc, float ra, float rb)", dependencies: [], requires: [] },
    wgsl: { name: "sdArc", signature: "fn sdArc(p: vec2f, sc: vec2f, ra: f32, rb: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdEquilateralTriangle(vec2,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Equilateral triangle with circumradius-like size r, pointing up.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdEquilateralTriangle", signature: "float sdEquilateralTriangle(vec2 p, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdEquilateralTriangle", signature: "fn sdEquilateralTriangle(p: vec2f, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdTriangle(vec2,vec2,vec2,vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Arbitrary triangle p0, p1, p2 (any winding).",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdTriangle", signature: "float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2)", dependencies: [], requires: [] },
    wgsl: { name: "sdTriangle", signature: "fn sdTriangle(p: vec2f, p0: vec2f, p1: vec2f, p2: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdRegularPolygon(vec2,float,int)",
    kind: "function",
    module: "sdf2d",
    summary: "Regular n-gon with circumradius r, one vertex pointing up.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdRegularPolygon", signature: "float sdRegularPolygon(vec2 p, float r, int n)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "sdRegularPolygon", signature: "fn sdRegularPolygon(p: vec2f, r: f32, n: i32) -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "sdStar(vec2,float,int,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Star with n points and outer radius r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdStar", signature: "float sdStar(vec2 p, float r, int n, float m)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "sdStar", signature: "fn sdStar(p: vec2f, r: f32, n: i32, m: f32) -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "sdVesica(vec2,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Vesica (lens): intersection of two circles of radius r whose centers sit at (+-d, 0).",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdVesica", signature: "float sdVesica(vec2 p, float r, float d)", dependencies: [], requires: [] },
    wgsl: { name: "sdVesica", signature: "fn sdVesica(p: vec2f, r: f32, d: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdMoon(vec2,float,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Crescent: disk ra at origin minus disk rb at (d, 0).",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdMoon", signature: "float sdMoon(vec2 p, float d, float ra, float rb)", dependencies: [], requires: [] },
    wgsl: { name: "sdMoon", signature: "fn sdMoon(p: vec2f, d: f32, ra: f32, rb: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdHeart(vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Heart with its bottom tip at the origin, about 1 unit tall.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdHeart", signature: "float sdHeart(vec2 p)", dependencies: ["dot2(vec2)"], requires: [] },
    wgsl: { name: "sdHeart", signature: "fn sdHeart(p: vec2f) -> f32", dependencies: ["dot2(vec2)"], requires: [] }
  },
  {
    id: "sdRhombus(vec2,vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Rhombus with half-diagonals b.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdRhombus", signature: "float sdRhombus(vec2 p, vec2 b)", dependencies: [], requires: [] },
    wgsl: { name: "sdRhombus", signature: "fn sdRhombus(p: vec2f, b: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdEllipse(vec2,vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Ellipse with semi-axes r.",
    exactness: "approx",
    credits: ["quilez-articles"],
    glsl: { name: "sdEllipse", signature: "float sdEllipse(vec2 p, vec2 r)", dependencies: [], requires: [] },
    wgsl: { name: "sdEllipse", signature: "fn sdEllipse(p: vec2f, r: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdQuadraticBezier(vec2,vec2,vec2,vec2)",
    kind: "function",
    module: "sdf2d",
    summary: "Unsigned distance to a quadratic Bezier curve A-B-C.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdQuadraticBezier", signature: "float sdQuadraticBezier(vec2 pos, vec2 A, vec2 B, vec2 C)", dependencies: ["dot2(vec2)", "sdSegment(vec2,vec2,vec2)"], requires: [] },
    wgsl: { name: "sdQuadraticBezier_f2f2f2f2", signature: "fn sdQuadraticBezier_f2f2f2f2(pos: vec2f, A: vec2f, B: vec2f, C: vec2f) -> f32", dependencies: ["dot2(vec2)", "sdSegment(vec2,vec2,vec2)"], requires: [] }
  },
  {
    id: "sdPie(vec2,vec2,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Pie slice (circular sector) of radius r, symmetric about +Y.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdPie", signature: "float sdPie(vec2 p, vec2 sc, float r)", dependencies: [], requires: [] },
    wgsl: { name: "sdPie", signature: "fn sdPie(p: vec2f, sc: vec2f, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sdHorseshoe(vec2,vec2,float,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Horseshoe: an arc of radius r ending in straight legs of length legLength, stroked with half-width w.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdHorseshoe", signature: "float sdHorseshoe(vec2 p, vec2 sc, float r, float legLength, float w)", dependencies: ["sdSegment(vec2,vec2,vec2)", "sdArc(vec2,vec2,float,float)"], requires: [] },
    wgsl: { name: "sdHorseshoe", signature: "fn sdHorseshoe(p: vec2f, sc: vec2f, r: f32, legLength: f32, w: f32) -> f32", dependencies: ["sdSegment(vec2,vec2,vec2)", "sdArc(vec2,vec2,float,float)"], requires: [] }
  },
  {
    id: "sdParabolaSegment(vec2,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Parabolic arch: the region under y = h (1 - x^2 / w^2) and above y = 0, so half-width w at the base and height h.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "sdParabolaSegment", signature: "float sdParabolaSegment(vec2 p, float w, float h)", dependencies: [], requires: [] },
    wgsl: { name: "sdParabolaSegment", signature: "fn sdParabolaSegment(p: vec2f, w: f32, h: f32) -> f32", dependencies: [], requires: [] },
    parity: {
      tolerance: 5960464477539063e-23,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 5960464477539063e-23 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "sdEgg(vec2,float,float)",
    kind: "function",
    module: "sdf2d",
    summary: "Egg built from four tangent arcs (Moss-style): bottom radius ra, top cap radius rb.",
    exactness: "exact",
    credits: ["moss-egg"],
    glsl: { name: "sdEgg", signature: "float sdEgg(vec2 p, float ra, float rb)", dependencies: [], requires: [] },
    wgsl: { name: "sdEgg", signature: "fn sdEgg(p: vec2f, ra: f32, rb: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opUnion(float,float)",
    kind: "function",
    module: "operators",
    summary: "Union of two shapes.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "opUnion", signature: "float opUnion(float a, float b)", dependencies: [], requires: [] },
    wgsl: { name: "opUnion", signature: "fn opUnion(a: f32, b: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opSubtract(float,float)",
    kind: "function",
    module: "operators",
    summary: "Shape a with shape b cut out of it.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "opSubtract", signature: "float opSubtract(float a, float b)", dependencies: [], requires: [] },
    wgsl: { name: "opSubtract", signature: "fn opSubtract(a: f32, b: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opIntersect(float,float)",
    kind: "function",
    module: "operators",
    summary: "Region inside both shapes.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "opIntersect", signature: "float opIntersect(float a, float b)", dependencies: [], requires: [] },
    wgsl: { name: "opIntersect", signature: "fn opIntersect(a: f32, b: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "smin(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Smooth union (polynomial, C1).",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "smin", signature: "float smin(float a, float b, float k)", dependencies: [], requires: [] },
    wgsl: { name: "smin", signature: "fn smin(a: f32, b: f32, k: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "smax(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Smooth intersection, the mirror of smin.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "smax", signature: "float smax(float a, float b, float k)", dependencies: ["smin(float,float,float)"], requires: [] },
    wgsl: { name: "smax", signature: "fn smax(a: f32, b: f32, k: f32) -> f32", dependencies: ["smin(float,float,float)"], requires: [] }
  },
  {
    id: "smoothSubtract(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Smooth subtraction: a with b carved out, with filleted edges.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "smoothSubtract", signature: "float smoothSubtract(float a, float b, float k)", dependencies: ["smax(float,float,float)"], requires: [] },
    wgsl: { name: "smoothSubtract", signature: "fn smoothSubtract(a: f32, b: f32, k: f32) -> f32", dependencies: ["smax(float,float,float)"], requires: [] }
  },
  {
    id: "sminCubic(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Smooth union with a C2 (cubic) transition, so specular highlights and normals have no visible seam.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "sminCubic", signature: "float sminCubic(float a, float b, float k)", dependencies: [], requires: [] },
    wgsl: { name: "sminCubic", signature: "fn sminCubic(a: f32, b: f32, k: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "sminBlend(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Smooth union that also returns the blend weight.",
    exactness: "bound",
    credits: ["quilez-articles"],
    glsl: { name: "sminBlend", signature: "vec2 sminBlend(float a, float b, float k)", dependencies: [], requires: [] },
    wgsl: { name: "sminBlend", signature: "fn sminBlend(a: f32, b: f32, k: f32) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "opChamferUnion(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Union with a 45-degree chamfer of size r at the seam.",
    exactness: "bound",
    credits: ["hg-sdf"],
    glsl: { name: "opChamferUnion", signature: "float opChamferUnion(float a, float b, float r)", dependencies: [], requires: [] },
    wgsl: { name: "opChamferUnion", signature: "fn opChamferUnion(a: f32, b: f32, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opStairsUnion(float,float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Union with n stair steps of total size r at the seam.",
    exactness: "bound",
    credits: ["hg-sdf"],
    glsl: { name: "opStairsUnion", signature: "float opStairsUnion(float a, float b, float r, float n)", dependencies: [], requires: [] },
    wgsl: { name: "opStairsUnion", signature: "fn opStairsUnion(a: f32, b: f32, r: f32, n: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opEngrave(float,float,float)",
    kind: "function",
    module: "operators",
    summary: "Engrave a groove of depth r into a, following the zero set of b.",
    exactness: "bound",
    credits: ["hg-sdf"],
    glsl: { name: "opEngrave", signature: "float opEngrave(float a, float b, float r)", dependencies: [], requires: [] },
    wgsl: { name: "opEngrave", signature: "fn opEngrave(a: f32, b: f32, r: f32) -> f32", dependencies: [], requires: [] },
    parity: {
      tolerance: 19073486328125e-19,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 10234334418021162e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "opRound(float,float)",
    kind: "function",
    module: "operators",
    summary: "Round a shape by r.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "opRound", signature: "float opRound(float d, float r)", dependencies: [], requires: [] },
    wgsl: { name: "opRound", signature: "fn opRound(d: f32, r: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opOnion(float,float)",
    kind: "function",
    module: "operators",
    summary: "Hollow shell of thickness 2t around the surface.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "opOnion", signature: "float opOnion(float d, float t)", dependencies: [], requires: [] },
    wgsl: { name: "opOnion", signature: "fn opOnion(d: f32, t: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opExtrude(vec3,float,float)",
    kind: "function",
    module: "operators",
    summary: "Extrude a 2D distance d2 (evaluated at p.xy) along Z by half-length h.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "opExtrude", signature: "float opExtrude(vec3 p, float d2, float h)", dependencies: [], requires: [] },
    wgsl: { name: "opExtrude", signature: "fn opExtrude(p: vec3f, d2: f32, h: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "opRevolve(vec3,float)",
    kind: "function",
    module: "operators",
    summary: "Revolve around Y.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "opRevolve", signature: "vec2 opRevolve(vec3 p, float o)", dependencies: [], requires: [] },
    wgsl: { name: "opRevolve", signature: "fn opRevolve(p: vec3f, o: f32) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "opElongate(vec3,vec3)",
    kind: "function",
    module: "operators",
    summary: "Elongate: stretch a shape by inserting a straight section of half-size h, keeping exact distances inside too.",
    exactness: "exact",
    credits: ["quilez-articles"],
    glsl: { name: "opElongate", signature: "vec4 opElongate(vec3 p, vec3 h)", dependencies: [], requires: [] },
    wgsl: { name: "opElongate", signature: "fn opElongate(p: vec3f, h: vec3f) -> vec4f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeatId(float,float)",
    kind: "function",
    module: "domain",
    summary: "Cell index for repetition with period s (integer-valued; use with hash functions).",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeatId", signature: "float domRepeatId(float p, float s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeatId_ff", signature: "fn domRepeatId_ff(p: f32, s: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "domRepeatId(vec2,vec2)",
    kind: "function",
    module: "domain",
    summary: "Cell index for repetition with period s (integer-valued; use with hash functions).",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeatId", signature: "vec2 domRepeatId(vec2 p, vec2 s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeatId_f2f2", signature: "fn domRepeatId_f2f2(p: vec2f, s: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeatId(vec3,vec3)",
    kind: "function",
    module: "domain",
    summary: "Cell index for repetition with period s (integer-valued; use with hash functions).",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeatId", signature: "vec3 domRepeatId(vec3 p, vec3 s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeatId_f3f3", signature: "fn domRepeatId_f3f3(p: vec3f, s: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeat(float,float)",
    kind: "function",
    module: "domain",
    summary: "Infinite repetition with period s.",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeat", signature: "float domRepeat(float p, float s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeat_ff", signature: "fn domRepeat_ff(p: f32, s: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "domRepeat(vec2,vec2)",
    kind: "function",
    module: "domain",
    summary: "Infinite repetition with period s.",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeat", signature: "vec2 domRepeat(vec2 p, vec2 s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeat_f2f2", signature: "fn domRepeat_f2f2(p: vec2f, s: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeat(vec3,vec3)",
    kind: "function",
    module: "domain",
    summary: "Infinite repetition with period s.",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeat", signature: "vec3 domRepeat(vec3 p, vec3 s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeat_f3f3", signature: "fn domRepeat_f3f3(p: vec3f, s: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeatLimited(vec2,vec2,vec2)",
    kind: "function",
    module: "domain",
    summary: "Repetition limited to cells -lim..+lim on each axis (2*lim + 1 copies).",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeatLimited", signature: "vec2 domRepeatLimited(vec2 p, vec2 s, vec2 lim)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeatLimited_f2f2f2", signature: "fn domRepeatLimited_f2f2f2(p: vec2f, s: vec2f, lim: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeatLimited(vec3,vec3,vec3)",
    kind: "function",
    module: "domain",
    summary: "Repetition limited to cells -lim..+lim on each axis (2*lim + 1 copies).",
    credits: ["quilez-articles"],
    glsl: { name: "domRepeatLimited", signature: "vec3 domRepeatLimited(vec3 p, vec3 s, vec3 lim)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeatLimited_f3f3f3", signature: "fn domRepeatLimited_f3f3f3(p: vec3f, s: vec3f, lim: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "domRepeatMirror(vec2,vec2)",
    kind: "function",
    module: "domain",
    summary: "Mirrored repetition: every other cell is flipped, so shapes touching the cell border join seamlessly.",
    credits: ["hg-sdf"],
    glsl: { name: "domRepeatMirror", signature: "vec2 domRepeatMirror(vec2 p, vec2 s)", dependencies: [], requires: [] },
    wgsl: { name: "domRepeatMirror", signature: "fn domRepeatMirror(p: vec2f, s: vec2f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "domPolar(vec2,float)",
    kind: "function",
    module: "domain",
    summary: "Polar repetition into n sectors around the origin.",
    credits: ["hg-sdf"],
    glsl: { name: "domPolar", signature: "vec2 domPolar(vec2 p, float n)", dependencies: ["TAU", "rot2(float)"], requires: [] },
    wgsl: { name: "domPolar", signature: "fn domPolar(p: vec2f, n: f32) -> vec2f", dependencies: ["TAU", "rot2(float)"], requires: [] }
  },
  {
    id: "domPolarId(vec2,float)",
    kind: "function",
    module: "domain",
    summary: "Sector index in [0, n) for domPolar.",
    credits: ["hg-sdf"],
    glsl: { name: "domPolarId", signature: "float domPolarId(vec2 p, float n)", dependencies: ["TAU"], requires: [] },
    wgsl: { name: "domPolarId", signature: "fn domPolarId(p: vec2f, n: f32) -> f32", dependencies: ["TAU"], requires: [] }
  },
  {
    id: "domPolarPair(vec2,float)",
    kind: "function",
    module: "domain",
    summary: "Neighbor-checked polar repetition: ids (in [0, n)) of the sector holding p and of the adjacent sector p leans toward.",
    credits: ["hg-sdf", "shader-skills"],
    glsl: { name: "domPolarPair", signature: "vec2 domPolarPair(vec2 p, float n)", dependencies: ["TAU"], requires: [] },
    wgsl: { name: "domPolarPair", signature: "fn domPolarPair(p: vec2f, n: f32) -> vec2f", dependencies: ["TAU"], requires: [] }
  },
  {
    id: "domPolarSector(vec2,float,float)",
    kind: "function",
    module: "domain",
    summary: "Rotate p into the frame of polar sector id (its center line on +X).",
    credits: ["hg-sdf", "shader-skills"],
    glsl: { name: "domPolarSector", signature: "vec2 domPolarSector(vec2 p, float id, float n)", dependencies: ["TAU", "rot2(float)"], requires: [] },
    wgsl: { name: "domPolarSector", signature: "fn domPolarSector(p: vec2f, id: f32, n: f32) -> vec2f", dependencies: ["TAU", "rot2(float)"], requires: [] }
  },
  {
    id: "domFold(vec3,vec3)",
    kind: "function",
    module: "domain",
    summary: "Fold space across the plane through the origin with unit normal n.",
    credits: ["shader-skills"],
    glsl: { name: "domFold", signature: "vec3 domFold(vec3 p, vec3 n)", dependencies: [], requires: [] },
    wgsl: { name: "domFold", signature: "fn domFold(p: vec3f, n: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "domTwist(vec3,float)",
    kind: "function",
    module: "domain",
    summary: "Twist around Y: rotate XZ by k * y.",
    credits: ["quilez-articles"],
    glsl: { name: "domTwist", signature: "vec3 domTwist(vec3 p, float k)", dependencies: ["rot2(float)"], requires: [] },
    wgsl: { name: "domTwist", signature: "fn domTwist(p: vec3f, k: f32) -> vec3f", dependencies: ["rot2(float)"], requires: [] }
  },
  {
    id: "domBend(vec3,float)",
    kind: "function",
    module: "domain",
    summary: "Bend in XY: rotate XY by k * x.",
    credits: ["quilez-articles"],
    glsl: { name: "domBend", signature: "vec3 domBend(vec3 p, float k)", dependencies: ["rot2(float)"], requires: [] },
    wgsl: { name: "domBend", signature: "fn domBend(p: vec3f, k: f32) -> vec3f", dependencies: ["rot2(float)"], requires: [] }
  },
  {
    id: "buildingProfile(vec2,vec2,vec2)",
    kind: "function",
    module: "architecture",
    summary: "Stable building profile: vec4(height, half-width, half-depth, roof style 0/1/2) from an integer parcel ID.",
    credits: ["building-massing", "pcg-hash"],
    glsl: { name: "buildingProfile", signature: "vec4 buildingProfile(vec2 parcel, vec2 heightRange, vec2 halfWidthRange)", dependencies: ["hash12(vec2)", "hash32(vec2)"], requires: [] },
    wgsl: { name: "buildingProfile", signature: "fn buildingProfile(parcel: vec2f, heightRange: vec2f, halfWidthRange: vec2f) -> vec4f", dependencies: ["hash12(vec2)", "hash32(vec2)"], requires: [] }
  },
  {
    id: "facadeWindowMask(vec2,vec2,vec2)",
    kind: "function",
    module: "architecture",
    summary: "Box-filtered rectangular windows centered on integer facade coordinates.",
    credits: ["facade-windows"],
    glsl: { name: "facadeWindowMask", signature: "float facadeWindowMask(vec2 uv, vec2 fill, vec2 footprint)", dependencies: [], requires: [] },
    wgsl: { name: "facadeWindowMask", signature: "fn facadeWindowMask(uv: vec2f, fill: vec2f, footprint: vec2f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "RAYMARCH_MAX_STEPS",
    kind: "const",
    module: "raymarch",
    summary: "Step limit of raymarch; a miss reports this step count.",
    credits: ["quilez-articles"],
    glsl: { name: "RAYMARCH_MAX_STEPS", signature: "const int RAYMARCH_MAX_STEPS = 256;", dependencies: [], requires: [] },
    wgsl: { name: "RAYMARCH_MAX_STEPS", signature: "const RAYMARCH_MAX_STEPS: i32 = 256;", dependencies: [], requires: [] }
  },
  {
    id: "raymarch(vec3,vec3,float,float,float)",
    kind: "function",
    module: "raymarch",
    summary: "Sphere-trace from ro along unit rd between tmin and tmax.",
    credits: ["quilez-articles"],
    adaptation: "Upstream defines ZERO in the library from the Shadertoy frame uniform; here the program defines it from its own frame uniform (SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS), because library code reads no uniforms.",
    glsl: { name: "raymarch", signature: "vec3 raymarch(vec3 ro, vec3 rd, float tmin, float tmax, float stepScale)", dependencies: ["RAYMARCH_MAX_STEPS"], requires: ["ZERO", "map"] },
    wgsl: { name: "raymarch", signature: "fn raymarch(ro: vec3f, rd: vec3f, tmin: f32, tmax: f32, stepScale: f32) -> vec3f", dependencies: ["RAYMARCH_MAX_STEPS"], requires: ["ZERO", "map"] }
  },
  {
    id: "calcNormal(vec3,float)",
    kind: "function",
    module: "raymarch",
    summary: "Surface normal from 4 tetrahedral samples (cheaper than 6 central differences, and still centered).",
    credits: ["quilez-articles"],
    adaptation: "Upstream defines ZERO in the library from the Shadertoy frame uniform; here the program defines it from its own frame uniform (SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS), because library code reads no uniforms.",
    glsl: { name: "calcNormal", signature: "vec3 calcNormal(vec3 p, float eps)", dependencies: [], requires: ["ZERO", "map"] },
    wgsl: { name: "calcNormal", signature: "fn calcNormal(p: vec3f, eps: f32) -> vec3f", dependencies: [], requires: ["ZERO", "map"] }
  },
  {
    id: "softShadow(vec3,vec3,float,float,float)",
    kind: "function",
    module: "raymarch",
    summary: "Soft shadow toward a light along unit rd.",
    credits: ["quilez-articles"],
    adaptation: "Upstream defines ZERO in the library from the Shadertoy frame uniform; here the program defines it from its own frame uniform (SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS), because library code reads no uniforms.",
    glsl: { name: "softShadow", signature: "float softShadow(vec3 ro, vec3 rd, float tmin, float tmax, float k)", dependencies: [], requires: ["ZERO", "map"] },
    wgsl: { name: "softShadow", signature: "fn softShadow(ro: vec3f, rd: vec3f, tmin: f32, tmax: f32, k: f32) -> f32", dependencies: [], requires: ["ZERO", "map"] }
  },
  {
    id: "calcAO(vec3,vec3,float)",
    kind: "function",
    module: "raymarch",
    summary: "Ambient occlusion from 5 distance samples along the normal.",
    credits: ["quilez-articles"],
    adaptation: "Upstream defines ZERO in the library from the Shadertoy frame uniform; here the program defines it from its own frame uniform (SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS), because library code reads no uniforms.",
    glsl: { name: "calcAO", signature: "float calcAO(vec3 p, vec3 n, float scale)", dependencies: [], requires: ["ZERO", "map"] },
    wgsl: { name: "calcAO", signature: "fn calcAO(p: vec3f, n: vec3f, scale: f32) -> f32", dependencies: [], requires: ["ZERO", "map"] }
  },
  {
    id: "sdfThickness(vec3,vec3,float)",
    kind: "function",
    module: "raymarch",
    summary: 'Thickness behind a surface point, estimated by sampling the SDF inside along -n (an "inverse AO").',
    credits: ["shader-skills"],
    adaptation: "Upstream defines ZERO in the library from the Shadertoy frame uniform; here the program defines it from its own frame uniform (SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS), because library code reads no uniforms.",
    glsl: { name: "sdfThickness", signature: "float sdfThickness(vec3 p, vec3 n, float maxDepth)", dependencies: [], requires: ["ZERO", "map"] },
    wgsl: { name: "sdfThickness", signature: "fn sdfThickness(p: vec3f, n: vec3f, maxDepth: f32) -> f32", dependencies: [], requires: ["ZERO", "map"] }
  },
  {
    id: "iPlane(vec3,vec3,vec3,float)",
    kind: "function",
    module: "intersect",
    summary: "Ray vs plane dot(p, n) + h = 0 (unit n).",
    credits: ["quilez-articles"],
    glsl: { name: "iPlane", signature: "float iPlane(vec3 ro, vec3 rd, vec3 n, float h)", dependencies: [], requires: [] },
    wgsl: { name: "iPlane", signature: "fn iPlane(ro: vec3f, rd: vec3f, n: vec3f, h: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "iSphere(vec3,vec3,vec3,float)",
    kind: "function",
    module: "intersect",
    summary: "Ray vs sphere centered at c with radius r.",
    credits: ["quilez-articles"],
    glsl: { name: "iSphere", signature: "vec2 iSphere(vec3 ro, vec3 rd, vec3 c, float r)", dependencies: [], requires: [] },
    wgsl: { name: "iSphere", signature: "fn iSphere(ro: vec3f, rd: vec3f, c: vec3f, r: f32) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "iBox(vec3,vec3,vec3)",
    kind: "function",
    module: "intersect",
    summary: "Ray vs axis-aligned box centered at the origin with half-extents b (slab method).",
    credits: ["quilez-articles"],
    glsl: { name: "iBox", signature: "vec2 iBox(vec3 ro, vec3 rd, vec3 b)", dependencies: [], requires: [] },
    wgsl: { name: "iBox", signature: "fn iBox(ro: vec3f, rd: vec3f, b: vec3f) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "cameraMatrix(vec3,vec3,float)",
    kind: "function",
    module: "camera",
    summary: "Camera-to-world matrix looking from ro toward ta, with roll in radians.",
    credits: ["shader-skills"],
    glsl: { name: "cameraMatrix", signature: "mat3 cameraMatrix(vec3 ro, vec3 ta, float roll)", dependencies: [], requires: [] },
    wgsl: { name: "cameraMatrix", signature: "fn cameraMatrix(ro: vec3f, ta: vec3f, roll: f32) -> mat3x3f", dependencies: [], requires: [] }
  },
  {
    id: "fovToFocal(float)",
    kind: "function",
    module: "camera",
    summary: "Focal length (the z of the view-space ray) for a vertical field of view in degrees.",
    credits: ["shader-skills"],
    glsl: { name: "fovToFocal", signature: "float fovToFocal(float fovDegrees)", dependencies: [], requires: [] },
    wgsl: { name: "fovToFocal", signature: "fn fovToFocal(fovDegrees: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "cameraRay(mat3,vec2,float)",
    kind: "function",
    module: "camera",
    summary: "Primary ray direction for screen point uv.",
    credits: ["shader-skills"],
    glsl: { name: "cameraRay", signature: "vec3 cameraRay(mat3 cam, vec2 uv, float focal)", dependencies: [], requires: [] },
    wgsl: { name: "cameraRay", signature: "fn cameraRay(cam: mat3x3f, uv: vec2f, focal: f32) -> vec3f", dependencies: [], requires: [] },
    parity: {
      tolerance: 2384185791015625e-22,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 17881393432617188e-23 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "thinLensRay(mat3,vec2,float,float,float,vec2,vec3,vec3)",
    kind: "function",
    module: "camera",
    summary: "Thin-lens depth of field.",
    credits: ["shader-skills"],
    glsl: { name: "thinLensRay", signature: "void thinLensRay(mat3 cam, vec2 uv, float focal, float aperture, float focusDist, vec2 xi, inout vec3 ro, out vec3 rd)", dependencies: ["TAU"], requires: [] },
    wgsl: { name: "thinLensRay", signature: "fn thinLensRay(cam: mat3x3f, uv: vec2f, focal: f32, aperture: f32, focusDist: f32, xi: vec2f, ro: ptr<function, vec3f>, rd: ptr<function, vec3f>)", dependencies: ["TAU"], requires: [] },
    parity: {
      tolerance: 2384185791015625e-22,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 2384185791015625e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "orthoRay(mat3,vec2,float,vec3,vec3)",
    kind: "function",
    module: "camera",
    summary: "Orthographic ray: parallel rays from a plane of half-height `size` centered on ro.",
    credits: ["shader-skills"],
    glsl: { name: "orthoRay", signature: "void orthoRay(mat3 cam, vec2 uv, float size, inout vec3 ro, out vec3 rd)", dependencies: [], requires: [] },
    wgsl: { name: "orthoRay", signature: "fn orthoRay(cam: mat3x3f, uv: vec2f, size: f32, ro: ptr<function, vec3f>, rd: ptr<function, vec3f>)", dependencies: [], requires: [] },
    parity: {
      tolerance: 95367431640625e-20,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 6611226126551628e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "fresnelSchlick(float,vec3)",
    kind: "function",
    module: "shading",
    summary: "Schlick Fresnel.",
    credits: ["filament-brdf"],
    glsl: { name: "fresnelSchlick", signature: "vec3 fresnelSchlick(float u, vec3 f0)", dependencies: [], requires: [] },
    wgsl: { name: "fresnelSchlick", signature: "fn fresnelSchlick(u: f32, f0: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "distributionGGX(float,float)",
    kind: "function",
    module: "shading",
    summary: "GGX / Trowbridge-Reitz normal distribution.",
    credits: ["filament-brdf"],
    glsl: { name: "distributionGGX", signature: "float distributionGGX(float NoH, float alpha)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "distributionGGX", signature: "fn distributionGGX(NoH: f32, alpha: f32) -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "visibilitySmithGGX(float,float,float)",
    kind: "function",
    module: "shading",
    summary: "Height-correlated Smith visibility.",
    credits: ["filament-brdf"],
    glsl: { name: "visibilitySmithGGX", signature: "float visibilitySmithGGX(float NoV, float NoL, float alpha)", dependencies: [], requires: [] },
    wgsl: { name: "visibilitySmithGGX", signature: "fn visibilitySmithGGX(NoV: f32, NoL: f32, alpha: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "specularGGX(vec3,vec3,vec3,float,vec3)",
    kind: "function",
    module: "shading",
    summary: "Microfacet specular for one light: pi * D * V * F * NoL (artist units).",
    credits: ["filament-brdf"],
    glsl: { name: "specularGGX", signature: "vec3 specularGGX(vec3 n, vec3 v, vec3 l, float roughness, vec3 f0)", dependencies: ["PI", "fresnelSchlick(float,vec3)", "distributionGGX(float,float)", "visibilitySmithGGX(float,float,float)"], requires: [] },
    wgsl: { name: "specularGGX", signature: "fn specularGGX(n: vec3f, v: vec3f, l: vec3f, roughness: f32, f0: vec3f) -> vec3f", dependencies: ["PI", "fresnelSchlick(float,vec3)", "distributionGGX(float,float)", "visibilitySmithGGX(float,float,float)"], requires: [] },
    parity: {
      tolerance: 476837158203125e-21,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 2650584100382921e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "shadePBR(vec3,vec3,vec3,vec3,float,float)",
    kind: "function",
    module: "shading",
    summary: "Complete metallic-roughness shading for one light (diffuse + specular, NoL included, artist units).",
    credits: ["filament-brdf"],
    glsl: { name: "shadePBR", signature: "vec3 shadePBR(vec3 n, vec3 v, vec3 l, vec3 albedo, float roughness, float metallic)", dependencies: ["fresnelSchlick(float,vec3)", "specularGGX(vec3,vec3,vec3,float,vec3)"], requires: [] },
    wgsl: { name: "shadePBR", signature: "fn shadePBR(n: vec3f, v: vec3f, l: vec3f, albedo: vec3f, roughness: f32, metallic: f32) -> vec3f", dependencies: ["fresnelSchlick(float,vec3)", "specularGGX(vec3,vec3,vec3,float,vec3)"], requires: [] },
    parity: {
      tolerance: 2384185791015625e-22,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 2088933633847326e-22 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "envBRDFApprox(vec3,float,float)",
    kind: "function",
    module: "shading",
    summary: "Split-sum environment specular without a lookup texture (Karis 2014, after Lazarov).",
    credits: ["env-brdf"],
    glsl: { name: "envBRDFApprox", signature: "vec3 envBRDFApprox(vec3 f0, float NoV, float roughness)", dependencies: [], requires: [] },
    wgsl: { name: "envBRDFApprox", signature: "fn envBRDFApprox(f0: vec3f, NoV: f32, roughness: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "wrapDiffuse(vec3,vec3,float)",
    kind: "function",
    module: "shading",
    summary: "Energy-conserving wrap diffuse: light wraps past the terminator by w (0 = Lambert, 0.5 = soft).",
    credits: ["wrap-lighting"],
    glsl: { name: "wrapDiffuse", signature: "float wrapDiffuse(vec3 n, vec3 l, float w)", dependencies: [], requires: [] },
    wgsl: { name: "wrapDiffuse", signature: "fn wrapDiffuse(n: vec3f, l: vec3f, w: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "hemisphereLight(vec3,vec3,vec3)",
    kind: "function",
    module: "shading",
    summary: "Hemisphere light: sky color from above blended to ground color from below.",
    credits: ["shader-skills"],
    glsl: { name: "hemisphereLight", signature: "vec3 hemisphereLight(vec3 n, vec3 skyColor, vec3 groundColor)", dependencies: [], requires: [] },
    wgsl: { name: "hemisphereLight", signature: "fn hemisphereLight(n: vec3f, skyColor: vec3f, groundColor: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "translucency(vec3,vec3,vec3,float,float,float)",
    kind: "function",
    module: "shading",
    summary: "Fast translucency (Barre-Brisebois and Bouchard 2011): light passing through thin parts, seen from the back.",
    credits: ["fast-translucency"],
    glsl: { name: "translucency", signature: "float translucency(vec3 n, vec3 v, vec3 l, float distortion, float power, float thickness)", dependencies: [], requires: [] },
    wgsl: { name: "translucency", signature: "fn translucency(n: vec3f, v: vec3f, l: vec3f, distortion: f32, power: f32, thickness: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "rimLight(vec3,vec3,float)",
    kind: "function",
    module: "shading",
    summary: "Rim light from the viewing angle: strongest at silhouettes.",
    credits: ["shader-skills"],
    glsl: { name: "rimLight", signature: "float rimLight(vec3 n, vec3 v, float power)", dependencies: [], requires: [] },
    wgsl: { name: "rimLight", signature: "fn rimLight(n: vec3f, v: vec3f, power: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "waterDispersion(float,float,float)",
    kind: "function",
    module: "water",
    summary: "Angular frequency sqrt(g*k*tanh(k*depth)) for finite-depth gravity waves.",
    credits: ["wave-dispersion"],
    glsl: { name: "waterDispersion", signature: "float waterDispersion(float k, float depth, float gravity)", dependencies: [], requires: [] },
    wgsl: { name: "waterDispersion", signature: "fn waterDispersion(k: f32, depth: f32, gravity: f32) -> f32", dependencies: [], requires: [] },
    parity: {
      tolerance: 2384185791015625e-22,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 18774667566348737e-23 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "waterWaveD(vec2,float,vec2,float,float,float,float)",
    kind: "function",
    module: "water",
    summary: "One sinusoidal wave: vec4(height, dh/dx, dh/dz, Laplacian).",
    credits: ["finch-water", "wave-dispersion"],
    glsl: { name: "waterWaveD", signature: "vec4 waterWaveD(vec2 xz, float time, vec2 direction, float wavelength, float amplitude, float depth, float footprint)", dependencies: ["TAU", "waterDispersion(float,float,float)"], requires: [] },
    wgsl: { name: "waterWaveD", signature: "fn waterWaveD(xz: vec2f, time: f32, direction: vec2f, wavelength: f32, amplitude: f32, depth: f32, footprint: f32) -> vec4f", dependencies: ["TAU", "waterDispersion(float,float,float)"], requires: [] },
    parity: {
      tolerance: 2384185791015625e-22,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 14719132819346122e-23 },
        { renderer: "SwiftShader LLVM JIT on arm64 macOS", difference: 10770577754254836e-23 },
        { renderer: "SwiftShader Subzero JIT on x86-64 (macOS, Rosetta)", difference: 10770577754254836e-23 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and SwiftShader evaluates its constant-edge smoothstep differently in the two; the GLSL and WGSL perform the same operations in the same order."
    }
  },
  {
    id: "fresnelDielectric(float,float,float)",
    kind: "function",
    module: "water",
    summary: "Exact unpolarized dielectric Fresnel for a positive incident cosine and positive refractive indices.",
    credits: ["pbrt-dielectric"],
    glsl: { name: "fresnelDielectric", signature: "float fresnelDielectric(float cosIncident, float etaIncident, float etaTransmitted)", dependencies: [], requires: [] },
    wgsl: { name: "fresnelDielectric", signature: "fn fresnelDielectric(cosIncident: f32, etaIncident: f32, etaTransmitted: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "beerTransmittance(vec3,float)",
    kind: "function",
    module: "water",
    summary: "Beer-Lambert RGB transmittance exp(-extinction*pathLength).",
    credits: ["pbrt-dielectric"],
    glsl: { name: "beerTransmittance", signature: "vec3 beerTransmittance(vec3 extinction, float pathLength)", dependencies: [], requires: [] },
    wgsl: { name: "beerTransmittance", signature: "fn beerTransmittance(extinction: vec3f, pathLength: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "srgbToLinear(vec3)",
    kind: "function",
    module: "color",
    summary: "Exact sRGB decode (EOTF): encoded [0,1] -> linear.",
    credits: ["shader-skills"],
    glsl: { name: "srgbToLinear", signature: "vec3 srgbToLinear(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "srgbToLinear", signature: "fn srgbToLinear(c: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "linearToSrgb(vec3)",
    kind: "function",
    module: "color",
    summary: "Exact sRGB encode (OETF): linear -> display [0,1].",
    credits: ["shader-skills"],
    glsl: { name: "linearToSrgb", signature: "vec3 linearToSrgb(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "linearToSrgb", signature: "fn linearToSrgb(c: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "luminance(vec3)",
    kind: "function",
    module: "color",
    summary: "Relative luminance of linear Rec.709 / sRGB color.",
    credits: ["shader-skills"],
    glsl: { name: "luminance", signature: "float luminance(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "luminance", signature: "fn luminance(c: vec3f) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "saturation(vec3,float)",
    kind: "function",
    module: "color",
    summary: "Scale saturation around luminance: 0 = grey, 1 = unchanged, > 1 = more saturated.",
    credits: ["shader-skills"],
    glsl: { name: "saturation", signature: "vec3 saturation(vec3 c, float s)", dependencies: ["luminance(vec3)"], requires: [] },
    wgsl: { name: "saturation", signature: "fn saturation(c: vec3f, s: f32) -> vec3f", dependencies: ["luminance(vec3)"], requires: [] }
  },
  {
    id: "linearSrgbToOklab(vec3)",
    kind: "function",
    module: "color",
    summary: "Linear sRGB -> Oklab (L in [0,1], a/b around [-0.4, 0.4]).",
    credits: ["oklab"],
    glsl: { name: "linearSrgbToOklab", signature: "vec3 linearSrgbToOklab(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "linearSrgbToOklab", signature: "fn linearSrgbToOklab(c: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "oklabToLinearSrgb(vec3)",
    kind: "function",
    module: "color",
    summary: "Oklab -> linear sRGB.",
    credits: ["oklab"],
    glsl: { name: "oklabToLinearSrgb", signature: "vec3 oklabToLinearSrgb(vec3 lab)", dependencies: [], requires: [] },
    wgsl: { name: "oklabToLinearSrgb", signature: "fn oklabToLinearSrgb(lab: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "mixOklab(vec3,vec3,float)",
    kind: "function",
    module: "color",
    summary: "Mix two linear colors in Oklab.",
    credits: ["oklab"],
    glsl: { name: "mixOklab", signature: "vec3 mixOklab(vec3 a, vec3 b, float t)", dependencies: ["linearSrgbToOklab(vec3)", "oklabToLinearSrgb(vec3)"], requires: [] },
    wgsl: { name: "mixOklab", signature: "fn mixOklab(a: vec3f, b: vec3f, t: f32) -> vec3f", dependencies: ["linearSrgbToOklab(vec3)", "oklabToLinearSrgb(vec3)"], requires: [] }
  },
  {
    id: "oklchToLinearSrgb(vec3)",
    kind: "function",
    module: "color",
    summary: "OkLCh (lightness, chroma, hue in radians) -> linear sRGB.",
    credits: ["oklab"],
    glsl: { name: "oklchToLinearSrgb", signature: "vec3 oklchToLinearSrgb(vec3 lch)", dependencies: ["oklabToLinearSrgb(vec3)"], requires: [] },
    wgsl: { name: "oklchToLinearSrgb", signature: "fn oklchToLinearSrgb(lch: vec3f) -> vec3f", dependencies: ["oklabToLinearSrgb(vec3)"], requires: [] }
  },
  {
    id: "cosinePalette(float,vec3,vec3,vec3,vec3)",
    kind: "function",
    module: "color",
    summary: "Cosine palette a + b * cos(2 pi (c t + d)).",
    credits: ["quilez-articles"],
    glsl: { name: "cosinePalette", signature: "vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d)", dependencies: ["TAU"], requires: [] },
    wgsl: { name: "cosinePalette", signature: "fn cosinePalette(t: f32, a: vec3f, b: vec3f, c: vec3f, d: vec3f) -> vec3f", dependencies: ["TAU"], requires: [] }
  },
  {
    id: "blackbody(float)",
    kind: "function",
    module: "color",
    summary: "Approximate linear sRGB color of a blackbody at temperature kelvin (1000-15000 K), normalized to max channel 1.",
    credits: ["blackbody"],
    glsl: { name: "blackbody", signature: "vec3 blackbody(float kelvin)", dependencies: [], requires: [] },
    wgsl: { name: "blackbody", signature: "fn blackbody(kelvin: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "tonemapAgX(vec3)",
    kind: "function",
    module: "tonemap",
    summary: "AgX: log encoding plus a sigmoid inside an inset/outset gamut.",
    credits: ["agx"],
    glsl: { name: "tonemapAgX", signature: "vec3 tonemapAgX(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "tonemapAgX", signature: "fn tonemapAgX(c: vec3f) -> vec3f", dependencies: [], requires: [] },
    parity: {
      tolerance: 762939453125e-17,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 6198883056640625e-21 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends, which log2 and pow then amplify; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "tonemapAgXPunchy(vec3)",
    kind: "function",
    module: "tonemap",
    summary: 'AgX with the "punchy" look (more contrast and saturation) for stylized art.',
    credits: ["agx"],
    glsl: { name: "tonemapAgXPunchy", signature: "vec3 tonemapAgXPunchy(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "tonemapAgXPunchy", signature: "fn tonemapAgXPunchy(c: vec3f) -> vec3f", dependencies: [], requires: [] },
    parity: {
      tolerance: 152587890625e-16,
      measured: [
        { renderer: "Apple M4 GPU on macOS (Metal, through ANGLE and Dawn)", difference: 9775161743164062e-21 }
      ],
      reason: "Apple's Metal compiler rounds these operations differently in the last bits for the WebGL2 (ANGLE) and WebGPU (Dawn) translations, and the rounding moves with the surrounding code on both backends, which log2 and pow then amplify; the GLSL and WGSL perform the same operations in the same order, and SwiftShader renders identical words."
    }
  },
  {
    id: "tonemapNeutral(vec3)",
    kind: "function",
    module: "tonemap",
    summary: "Khronos PBR Neutral: leaves [0, ~0.76] almost untouched and compresses only highlights, preserving hue.",
    credits: ["pbr-neutral"],
    glsl: { name: "tonemapNeutral", signature: "vec3 tonemapNeutral(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "tonemapNeutral", signature: "fn tonemapNeutral(c: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "tonemapACES(vec3)",
    kind: "function",
    module: "tonemap",
    summary: "Stephen Hill's ACES fit (RRT + ODT, sRGB primaries).",
    credits: ["aces-fit"],
    glsl: { name: "tonemapACES", signature: "vec3 tonemapACES(vec3 c)", dependencies: [], requires: [] },
    wgsl: { name: "tonemapACES", signature: "fn tonemapACES(c: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "tonemapReinhard(vec3,float)",
    kind: "function",
    module: "tonemap",
    summary: "Extended Reinhard on luminance: maps `white` to 1 and preserves hue.",
    credits: ["shader-skills"],
    glsl: { name: "tonemapReinhard", signature: "vec3 tonemapReinhard(vec3 c, float white)", dependencies: [], requires: [] },
    wgsl: { name: "tonemapReinhard", signature: "fn tonemapReinhard(c: vec3f, white: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "phaseIsotropic()",
    kind: "function",
    module: "volume",
    summary: "Isotropic phase function (scatters equally in all directions).",
    credits: ["hillaire-volumes"],
    glsl: { name: "phaseIsotropic", signature: "float phaseIsotropic()", dependencies: ["PI"], requires: [] },
    wgsl: { name: "phaseIsotropic", signature: "fn phaseIsotropic() -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "phaseRayleigh(float)",
    kind: "function",
    module: "volume",
    summary: "Rayleigh phase function.",
    credits: ["hillaire-volumes"],
    glsl: { name: "phaseRayleigh", signature: "float phaseRayleigh(float mu)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "phaseRayleigh", signature: "fn phaseRayleigh(mu: f32) -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "phaseHG(float,float)",
    kind: "function",
    module: "volume",
    summary: "Henyey-Greenstein phase function.",
    credits: ["hillaire-volumes"],
    glsl: { name: "phaseHG", signature: "float phaseHG(float mu, float g)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "phaseHG", signature: "fn phaseHG(mu: f32, g: f32) -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "phaseDualHG(float,float,float,float)",
    kind: "function",
    module: "volume",
    summary: "Two-lobe Henyey-Greenstein: a forward lobe gF and a backward lobe gB, mixed by w (weight of the forward lobe).",
    credits: ["schneider-clouds"],
    glsl: { name: "phaseDualHG", signature: "float phaseDualHG(float mu, float gF, float gB, float w)", dependencies: ["phaseHG(float,float)"], requires: [] },
    wgsl: { name: "phaseDualHG", signature: "fn phaseDualHG(mu: f32, gF: f32, gB: f32, w: f32) -> f32", dependencies: ["phaseHG(float,float)"], requires: [] }
  },
  {
    id: "phaseCornetteShanks(float,float)",
    kind: "function",
    module: "volume",
    summary: "Cornette-Shanks phase (a better-normalized Mie approximation).",
    credits: ["cornette-shanks"],
    glsl: { name: "phaseCornetteShanks", signature: "float phaseCornetteShanks(float mu, float g)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "phaseCornetteShanks", signature: "fn phaseCornetteShanks(mu: f32, g: f32) -> f32", dependencies: ["PI"], requires: [] }
  },
  {
    id: "beerPowder(float)",
    kind: "function",
    module: "volume",
    summary: "Beer-Powder lighting term for clouds: 2 e^-d (1 - e^-2d), where d is optical depth toward the sun.",
    credits: ["schneider-clouds"],
    glsl: { name: "beerPowder", signature: "float beerPowder(float d)", dependencies: [], requires: [] },
    wgsl: { name: "beerPowder", signature: "fn beerPowder(d: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "volumeStep(vec3,vec3,vec3,vec3,float)",
    kind: "function",
    module: "volume",
    summary: "One energy-conserving step of volume integration.",
    credits: ["hillaire-volumes"],
    glsl: { name: "volumeStep", signature: "void volumeStep(inout vec3 radiance, inout vec3 transmittance, vec3 sigmaT, vec3 inScatter, float ds)", dependencies: [], requires: [] },
    wgsl: { name: "volumeStep", signature: "fn volumeStep(radiance: ptr<function, vec3f>, transmittance: ptr<function, vec3f>, sigmaT: vec3f, inScatter: vec3f, ds: f32)", dependencies: [], requires: [] }
  },
  {
    id: "distanceFog(float,float)",
    kind: "function",
    module: "volume",
    summary: "Distance fog amount (0 = clear, 1 = fully fogged) for distance t.",
    credits: ["quilez-articles"],
    glsl: { name: "distanceFog", signature: "float distanceFog(float t, float density)", dependencies: [], requires: [] },
    wgsl: { name: "distanceFog", signature: "fn distanceFog(t: f32, density: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "heightFog(vec3,vec3,float,float,float)",
    kind: "function",
    module: "volume",
    summary: "Analytic height fog for density a * exp(-b * y) along the ray segment [0, t].",
    credits: ["quilez-articles"],
    glsl: { name: "heightFog", signature: "float heightFog(vec3 ro, vec3 rd, float t, float a, float b)", dependencies: [], requires: [] },
    wgsl: { name: "heightFog", signature: "fn heightFog(ro: vec3f, rd: vec3f, t: f32, a: f32, b: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "simpleSky(vec3,vec3)",
    kind: "function",
    module: "atmosphere",
    summary: "Cheap analytic sky: horizon-to-zenith gradient, darker ground below the horizon, sun glow lobes.",
    credits: ["shader-skills"],
    adaptation: "Upstream blends toward the ground with smoothstep(0.0, -0.08, rd.y), whose descending edges GLSL and WGSL leave undefined; this uses 1.0 - smoothstep(-0.08, 0.0, rd.y), the same ramp with ascending edges.",
    glsl: { name: "simpleSky", signature: "vec3 simpleSky(vec3 rd, vec3 sunDir)", dependencies: [], requires: [] },
    wgsl: { name: "simpleSky", signature: "fn simpleSky(rd: vec3f, sunDir: vec3f) -> vec3f", dependencies: [], requires: [] },
    parity: {
      tolerance: 11920928955078125e-23,
      measured: [
        { renderer: "SwiftShader LLVM JIT on arm64 macOS", difference: 11920928955078125e-23 },
        { renderer: "SwiftShader Subzero JIT on x86-64 (macOS, Rosetta)", difference: 11920928955078125e-23 }
      ],
      reason: "SwiftShader rounds the constant-edge smoothstep(-0.08, 0.0, rd.y) differently in the WebGL2 and WebGPU translations: at rd.y = -4.03e-7 the GLSL gives 1.0 and the WGSL 0.99999994, and the ground blend carries that last-bit difference into the color. The GLSL and WGSL perform the same operations in the same order, and Apple GPUs render identical words."
    }
  },
  {
    id: "sunDisk(vec3,vec3,float,float)",
    kind: "function",
    module: "atmosphere",
    summary: "Sun disk with antialiased edge and limb darkening (Neckel 1996).",
    credits: ["limb-darkening"],
    glsl: { name: "sunDisk", signature: "vec3 sunDisk(vec3 rd, vec3 sunDir, float angularRadius, float pixelAngle)", dependencies: [], requires: [] },
    wgsl: { name: "sunDisk", signature: "fn sunDisk(rd: vec3f, sunDir: vec3f, angularRadius: f32, pixelAngle: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "ATMOSPHERE_GROUND_KM",
    kind: "const",
    module: "atmosphere",
    summary: "Planet radius at the ground, in km, for the atmosphere functions.",
    credits: ["hillaire-volumes"],
    glsl: { name: "ATMOSPHERE_GROUND_KM", signature: "const float ATMOSPHERE_GROUND_KM = 6360.0;", dependencies: [], requires: [] },
    wgsl: { name: "ATMOSPHERE_GROUND_KM", signature: "const ATMOSPHERE_GROUND_KM: f32 = 6360.0;", dependencies: [], requires: [] }
  },
  {
    id: "ATMOSPHERE_TOP_KM",
    kind: "const",
    module: "atmosphere",
    summary: "Radius of the top of the atmosphere, in km.",
    credits: ["hillaire-volumes"],
    glsl: { name: "ATMOSPHERE_TOP_KM", signature: "const float ATMOSPHERE_TOP_KM = 6460.0;", dependencies: [], requires: [] },
    wgsl: { name: "ATMOSPHERE_TOP_KM", signature: "const ATMOSPHERE_TOP_KM: f32 = 6460.0;", dependencies: [], requires: [] }
  },
  {
    id: "atmosphereDensity(float)",
    kind: "function",
    module: "atmosphere",
    summary: "Densities (rayleigh, mie, ozone) at altitude h km above the ground.",
    credits: ["hillaire-volumes"],
    glsl: { name: "atmosphereDensity", signature: "vec3 atmosphereDensity(float h)", dependencies: [], requires: [] },
    wgsl: { name: "atmosphereDensity", signature: "fn atmosphereDensity(h: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "atmosphereExtinction(vec3)",
    kind: "function",
    module: "atmosphere",
    summary: "Extinction per km for the given densities.",
    credits: ["hillaire-volumes"],
    glsl: { name: "atmosphereExtinction", signature: "vec3 atmosphereExtinction(vec3 density)", dependencies: [], requires: [] },
    wgsl: { name: "atmosphereExtinction", signature: "fn atmosphereExtinction(density: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "atmosphereSky(vec3,vec3,float,float)",
    kind: "function",
    module: "atmosphere",
    summary: "Physically based sky radiance along rd for a viewer viewHeightKm above the ground, with single scattering (16 view steps x 8 light steps).",
    credits: ["hillaire-volumes"],
    glsl: { name: "atmosphereSky", signature: "vec3 atmosphereSky(vec3 rd, vec3 sunDir, float viewHeightKm, float sunIntensity)", dependencies: ["iSphere(vec3,vec3,vec3,float)", "phaseRayleigh(float)", "phaseCornetteShanks(float,float)", "volumeStep(vec3,vec3,vec3,vec3,float)", "ATMOSPHERE_GROUND_KM", "ATMOSPHERE_TOP_KM", "atmosphereDensity(float)", "atmosphereExtinction(vec3)"], requires: [] },
    wgsl: { name: "atmosphereSky", signature: "fn atmosphereSky(rd: vec3f, sunDir: vec3f, viewHeightKm: f32, sunIntensity: f32) -> vec3f", dependencies: ["iSphere(vec3,vec3,vec3,float)", "phaseRayleigh(float)", "phaseCornetteShanks(float,float)", "volumeStep(vec3,vec3,vec3,vec3,float)", "ATMOSPHERE_GROUND_KM", "ATMOSPHERE_TOP_KM", "atmosphereDensity(float)", "atmosphereExtinction(vec3)"], requires: [] }
  },
  {
    id: "fillAA(float)",
    kind: "function",
    module: "post",
    summary: "Antialiased fill of a 2D SDF: 1 inside, 0 outside, box-filtered across one pixel.",
    credits: ["shader-skills"],
    glsl: { name: "fillAA", signature: "float fillAA(float d)", dependencies: [], requires: [] },
    wgsl: { name: "fillAA_f", signature: "fn fillAA_f(d: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "fillAA(float,float)",
    kind: "function",
    module: "post",
    summary: "Antialiased fill with an explicit pixel size px; safe in loops and branches.",
    credits: ["shader-skills"],
    glsl: { name: "fillAA", signature: "float fillAA(float d, float px)", dependencies: [], requires: [] },
    wgsl: { name: "fillAA_ff", signature: "fn fillAA_ff(d: f32, px: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "strokeAA(float,float,float)",
    kind: "function",
    module: "post",
    summary: "Antialiased stroke of half-width hw around the zero line of a 2D SDF.",
    credits: ["shader-skills"],
    glsl: { name: "strokeAA", signature: "float strokeAA(float d, float hw, float px)", dependencies: ["fillAA(float,float)"], requires: [] },
    wgsl: { name: "strokeAA", signature: "fn strokeAA(d: f32, hw: f32, px: f32) -> f32", dependencies: ["fillAA(float,float)"], requires: [] }
  },
  {
    id: "aaOffset(int)",
    kind: "function",
    module: "post",
    summary: "Subpixel offset in [-0.5, 0.5)^2 for sample i of a supersampling loop (R2 low-discrepancy sequence).",
    credits: ["r2-sequence"],
    glsl: { name: "aaOffset", signature: "vec2 aaOffset(int i)", dependencies: [], requires: [] },
    wgsl: { name: "aaOffset", signature: "fn aaOffset(i: i32) -> vec2f", dependencies: [], requires: [] }
  },
  {
    id: "vignette(vec2,float)",
    kind: "function",
    module: "post",
    summary: "Natural (cos^4) vignette for a pinhole camera: uv is the screen point, focal the camera focal length.",
    credits: ["shader-skills"],
    glsl: { name: "vignette", signature: "float vignette(vec2 uv, float focal)", dependencies: [], requires: [] },
    wgsl: { name: "vignette", signature: "fn vignette(uv: vec2f, focal: f32) -> f32", dependencies: [], requires: [] }
  },
  {
    id: "filmGrain(vec3,float,float)",
    kind: "function",
    module: "post",
    summary: "Signal-dependent film grain: noise grows with sqrt(intensity), as photon noise does.",
    credits: ["shader-skills"],
    glsl: { name: "filmGrain", signature: "vec3 filmGrain(vec3 col, float amount, float n)", dependencies: [], requires: [] },
    wgsl: { name: "filmGrain", signature: "fn filmGrain(col: vec3f, amount: f32, n: f32) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "ditherTPDF(vec2,int)",
    kind: "function",
    module: "post",
    summary: "Triangular-PDF dither of +-1 LSB for 8-bit output.",
    credits: ["shader-skills"],
    adaptation: "Upstream takes the Shadertoy fragment coordinate; this takes it as the pixel parameter.",
    glsl: { name: "ditherTPDF", signature: "vec3 ditherTPDF(vec2 pixel, int frame)", dependencies: ["hash22(vec2)"], requires: [] },
    wgsl: { name: "ditherTPDF", signature: "fn ditherTPDF(pixel: vec2f, frame: i32) -> vec3f", dependencies: ["hash22(vec2)"], requires: [] }
  },
  {
    id: "debugDistance(float)",
    kind: "function",
    module: "debug",
    summary: "Distance field as contour bands: warm outside, cool inside, white zero line.",
    credits: ["shader-skills"],
    glsl: { name: "debugDistance", signature: "vec3 debugDistance(float d)", dependencies: ["TAU"], requires: [] },
    wgsl: { name: "debugDistance", signature: "fn debugDistance(d: f32) -> vec3f", dependencies: ["TAU"], requires: [] }
  },
  {
    id: "debugNormal(vec3)",
    kind: "function",
    module: "debug",
    summary: "Normal as RGB.",
    credits: ["shader-skills"],
    glsl: { name: "debugNormal", signature: "vec3 debugNormal(vec3 n)", dependencies: [], requires: [] },
    wgsl: { name: "debugNormal", signature: "fn debugNormal(n: vec3f) -> vec3f", dependencies: [], requires: [] }
  },
  {
    id: "debugIdColor(float)",
    kind: "function",
    module: "debug",
    summary: "Distinct color per integer id.",
    credits: ["shader-skills"],
    glsl: { name: "debugIdColor", signature: "vec3 debugIdColor(float id)", dependencies: ["TAU"], requires: [] },
    wgsl: { name: "debugIdColor", signature: "fn debugIdColor(id: f32) -> vec3f", dependencies: ["TAU"], requires: [] }
  },
  {
    id: "debugHeat(float)",
    kind: "function",
    module: "debug",
    summary: "Heat ramp for a value in [0,1]: black, blue, magenta, orange, yellow, white.",
    credits: ["shader-skills"],
    glsl: { name: "debugHeat", signature: "vec3 debugHeat(float t)", dependencies: ["PI"], requires: [] },
    wgsl: { name: "debugHeat", signature: "fn debugHeat(t: f32) -> vec3f", dependencies: ["PI"], requires: [] }
  }
];

// src/knowledge/shader-craft/library/modules/architecture.ts
var ARCHITECTURE_GLSL = `//! architecture: stable building parameters and filtered facade fields. These are massing/material helpers,
//! not a mesh generator or a full shape-grammar engine. Keep the generated footprint inside its parcel.

/// Stable building profile: vec4(height, half-width, half-depth, roof style 0/1/2) from an integer parcel ID.
/// Height and half-width ranges are ordered, positive world-space values. The same ID always gives the same profile.
/// @use city blocks, towers, deterministic chunk generation, architectural massing
/// @see Mueller et al., "Procedural Modeling of Buildings", SIGGRAPH 2006 (hierarchical massing principle)
vec4 buildingProfile(vec2 parcel, vec2 heightRange, vec2 halfWidthRange) {
    vec3 h = hash32(parcel);
    return vec4(mix(heightRange.x,heightRange.y,h.x*h.x),
                mix(halfWidthRange.x,halfWidthRange.y,h.y),
                mix(halfWidthRange.x,halfWidthRange.y,h.z),
                floor(3.0*hash12(parcel+vec2(83.0,19.0))));
}

/// Box-filtered rectangular windows centered on integer facade coordinates. fill is the opening fraction per
/// cell in [0,1]; footprint is the pixel's width/height in cell units. At large footprints it converges to fill.x*fill.y.
/// @use distant city facades, office windows, floor bands, architectural grids without moire
/// @range [0,1]
/// @see Inigo Quilez, filterable procedurals (integrate a periodic pattern over a footprint)
float facadeWindowMask(vec2 uv, vec2 fill, vec2 footprint) {
    fill = clamp(fill,0.0,1.0);
    vec2 w = max(footprint,vec2(0.0001));
    vec2 a = uv + 0.5*fill + 0.5*w;
    vec2 b = uv + 0.5*fill - 0.5*w;
    vec2 ia = floor(a)*fill + min(fract(a),fill);
    vec2 ib = floor(b)*fill + min(fract(b),fill);
    vec2 coverage = clamp((ia-ib)/w,0.0,1.0);
    return coverage.x*coverage.y;
}
`;
var ARCHITECTURE_WGSL = `//! architecture: stable building parameters and filtered facade fields. These are massing/material helpers,
//! not a mesh generator or a full shape-grammar engine. Keep the generated footprint inside its parcel.

/// Stable building profile: vec4f(height, half-width, half-depth, roof style 0/1/2) from an integer parcel ID.
/// Height and half-width ranges are ordered, positive world-space values. The same ID always gives the same profile.
/// @use city blocks, towers, deterministic chunk generation, architectural massing
/// @see Mueller et al., "Procedural Modeling of Buildings", SIGGRAPH 2006 (hierarchical massing principle)
fn buildingProfile(parcel: vec2f, heightRange: vec2f, halfWidthRange: vec2f) -> vec4f {
    let h = hash32(parcel);
    return vec4f(mix(heightRange.x, heightRange.y, h.x * h.x),
                 mix(halfWidthRange.x, halfWidthRange.y, h.y),
                 mix(halfWidthRange.x, halfWidthRange.y, h.z),
                 floor(3.0 * hash12(parcel + vec2f(83.0, 19.0))));
}

/// Box-filtered rectangular windows centered on integer facade coordinates. fill is the opening fraction per
/// cell in [0,1]; footprint is the pixel's width/height in cell units. At large footprints it converges to fill.x*fill.y.
/// @use distant city facades, office windows, floor bands, architectural grids without moire
/// @range [0,1]
/// @see Inigo Quilez, filterable procedurals (integrate a periodic pattern over a footprint)
fn facadeWindowMask(uv: vec2f, fill: vec2f, footprint: vec2f) -> f32 {
    let fill_ = clamp(fill, vec2f(0.0), vec2f(1.0));
    let w = max(footprint, vec2f(0.0001));
    let a = uv + 0.5 * fill_ + 0.5 * w;
    let b = uv + 0.5 * fill_ - 0.5 * w;
    let ia = floor(a) * fill_ + min(fract(a), fill_);
    let ib = floor(b) * fill_ + min(fract(b), fill_);
    let coverage = clamp((ia - ib) / w, vec2f(0.0), vec2f(1.0));
    return coverage.x * coverage.y;
}
`;

// src/knowledge/shader-craft/library/modules/atmosphere.ts
var ATMOSPHERE_GLSL = `//! atmosphere: skies and sun. simpleSky is a cheap artistic gradient. atmosphereSky is physically based single
//! scattering (Rayleigh + Mie + ozone) with constants from Hillaire, "A Scalable and Production Ready Sky and
//! Atmosphere Rendering Technique" (EGSR 2020). Distances are in kilometers to avoid float cancellation.

/// Cheap analytic sky: horizon-to-zenith gradient, darker ground below the horizon, sun glow lobes.
/// Returns linear radiance (roughly 0-2; the glow can exceed 1 near the sun).
/// Upstream writes the ground blend as smoothstep(0.0, -0.08, rd.y), with descending edges that GLSL and WGSL leave
/// undefined; here it is 1.0 - smoothstep(-0.08, 0.0, rd.y), the same ramp with ascending edges.
/// @use quick backgrounds, reflections, fog color, stylized daylight
vec3 simpleSky(vec3 rd, vec3 sunDir) {
    float y = max(rd.y, 0.0);
    vec3 zenith = vec3(0.12, 0.28, 0.62);
    vec3 horizon = vec3(0.62, 0.74, 0.88);
    vec3 col = mix(horizon, zenith, pow(y, 0.5));
    col = mix(col, vec3(0.28, 0.26, 0.24), 1.0 - smoothstep(-0.08, 0.0, rd.y));
    float mu = max(dot(rd, sunDir), 0.0);
    col += vec3(1.0, 0.75, 0.45) * (0.25 * pow(mu, 8.0) + 0.6 * pow(mu, 64.0) + 2.0 * pow(mu, 512.0));
    return col;
}

/// Sun disk with antialiased edge and limb darkening (Neckel 1996). angularRadius in radians (the real sun is
/// 0.00476; art often uses 3-10x). pixelAngle is the angular size of a pixel (about 2 / (resolution.y * focal)).
/// Returns a 0..1 shape tinted by limb darkening; multiply by a bright sun color (10-50).
/// @use suns, moons (use a different tint), bright stars in skies
vec3 sunDisk(vec3 rd, vec3 sunDir, float angularRadius, float pixelAngle) {
    float ang = acos(clamp(dot(rd, sunDir), -1.0, 1.0));
    float edge = 1.0 - smoothstep(angularRadius - pixelAngle, angularRadius + pixelAngle, ang);
    float r = clamp(ang / angularRadius, 0.0, 1.0);
    float muLimb = sqrt(max(1.0 - r * r, 0.0));
    vec3 limb = pow(vec3(muLimb), vec3(0.397, 0.503, 0.652));
    return edge * limb;
}

const float ATMOSPHERE_GROUND_KM = 6360.0;
const float ATMOSPHERE_TOP_KM = 6460.0;

/// Densities (rayleigh, mie, ozone) at altitude h km above the ground.
/// @use custom atmosphere marches (aerial perspective, planet views)
vec3 atmosphereDensity(float h) {
    return vec3(exp(-h / 8.0), exp(-h / 1.2), max(0.0, 1.0 - abs(h - 25.0) / 15.0));
}

/// Extinction per km for the given densities.
/// @use transmittance through air for sun color and aerial perspective
vec3 atmosphereExtinction(vec3 density) {
    const vec3 rayleigh = vec3(5.802, 13.558, 33.1) * 1e-3;
    const float mie = (3.996 + 4.40) * 1e-3;
    const vec3 ozone = vec3(0.650, 1.881, 0.085) * 1e-3;
    return rayleigh * density.x + mie * density.y + ozone * density.z;
}

/// Physically based sky radiance along rd for a viewer viewHeightKm above the ground, with single scattering
/// (16 view steps x 8 light steps). sunIntensity about 20. Sunsets come out somewhat dark because multiple
/// scattering is ignored; add a small ambient term if needed.
/// @use realistic skies, sunsets, aerial perspective colors, planet-from-space views
/// @see Sebastien Hillaire, "A Scalable and Production Ready Sky and Atmosphere Rendering Technique", EGSR 2020
vec3 atmosphereSky(vec3 rd, vec3 sunDir, float viewHeightKm, float sunIntensity) {
    const vec3 rayleighScatter = vec3(5.802, 13.558, 33.1) * 1e-3;
    const float mieScatter = 3.996e-3;
    vec3 ro = vec3(0.0, ATMOSPHERE_GROUND_KM + max(viewHeightKm, 0.001), 0.0);
    vec2 top = iSphere(ro, rd, vec3(0.0), ATMOSPHERE_TOP_KM);
    if (top.y <= 0.0) return vec3(0.0);
    vec2 ground = iSphere(ro, rd, vec3(0.0), ATMOSPHERE_GROUND_KM);
    float tStart = max(top.x, 0.0);
    float tEnd = (ground.x > 0.0) ? ground.x : top.y;
    float mu = dot(rd, sunDir);
    float pR = phaseRayleigh(mu);
    float pM = phaseCornetteShanks(mu, 0.8);
    const int VIEW_STEPS = 16;
    const int LIGHT_STEPS = 8;
    float dt = (tEnd - tStart) / float(VIEW_STEPS);
    vec3 radiance = vec3(0.0), transmittance = vec3(1.0);
    for (int i = 0; i < VIEW_STEPS; i++) {
        vec3 p = ro + rd * (tStart + (float(i) + 0.5) * dt);
        vec3 dens = atmosphereDensity(length(p) - ATMOSPHERE_GROUND_KM);
        vec3 sunT = vec3(0.0);
        if (iSphere(p, sunDir, vec3(0.0), ATMOSPHERE_GROUND_KM).x < 0.0) {
            float tl = iSphere(p, sunDir, vec3(0.0), ATMOSPHERE_TOP_KM).y;
            float dl = tl / float(LIGHT_STEPS);
            vec3 depth = vec3(0.0);
            for (int j = 0; j < LIGHT_STEPS; j++) {
                vec3 q = p + sunDir * ((float(j) + 0.5) * dl);
                depth += atmosphereExtinction(atmosphereDensity(length(q) - ATMOSPHERE_GROUND_KM)) * dl;
            }
            sunT = exp(-depth);
        }
        vec3 scatter = sunT * (rayleighScatter * dens.x * pR + mieScatter * dens.y * pM) * sunIntensity;
        volumeStep(radiance, transmittance, atmosphereExtinction(dens), scatter, dt);
    }
    return radiance;
}
`;
var ATMOSPHERE_WGSL = `//! atmosphere: skies and sun. simpleSky is a cheap artistic gradient. atmosphereSky is physically based single
//! scattering (Rayleigh + Mie + ozone) with constants from Hillaire, "A Scalable and Production Ready Sky and
//! Atmosphere Rendering Technique" (EGSR 2020). Distances are in kilometers to avoid float cancellation.

/// Cheap analytic sky: horizon-to-zenith gradient, darker ground below the horizon, sun glow lobes.
/// Returns linear radiance (roughly 0-2; the glow can exceed 1 near the sun).
/// Upstream writes the ground blend as smoothstep(0.0, -0.08, rd.y), with descending edges that GLSL and WGSL leave
/// undefined; here it is 1.0 - smoothstep(-0.08, 0.0, rd.y), the same ramp with ascending edges.
/// @use quick backgrounds, reflections, fog color, stylized daylight
fn simpleSky(rd: vec3f, sunDir: vec3f) -> vec3f {
    let y = max(rd.y, 0.0);
    let zenith = vec3f(0.12, 0.28, 0.62);
    let horizon = vec3f(0.62, 0.74, 0.88);
    var col = mix(horizon, zenith, pow(y, 0.5));
    col = mix(col, vec3f(0.28, 0.26, 0.24), 1.0 - smoothstep(-0.08, 0.0, rd.y));
    let mu = max(dot(rd, sunDir), 0.0);
    col += vec3f(1.0, 0.75, 0.45) * (0.25 * pow(mu, 8.0) + 0.6 * pow(mu, 64.0) + 2.0 * pow(mu, 512.0));
    return col;
}

/// Sun disk with antialiased edge and limb darkening (Neckel 1996). angularRadius in radians (the real sun is
/// 0.00476; art often uses 3-10x). pixelAngle is the angular size of a pixel (about 2 / (resolution.y * focal)).
/// Returns a 0..1 shape tinted by limb darkening; multiply by a bright sun color (10-50).
/// @use suns, moons (use a different tint), bright stars in skies
fn sunDisk(rd: vec3f, sunDir: vec3f, angularRadius: f32, pixelAngle: f32) -> vec3f {
    let ang = acos(clamp(dot(rd, sunDir), -1.0, 1.0));
    let edge = 1.0 - smoothstep(angularRadius - pixelAngle, angularRadius + pixelAngle, ang);
    let r = clamp(ang / angularRadius, 0.0, 1.0);
    let muLimb = sqrt(max(1.0 - r * r, 0.0));
    let limb = pow(vec3f(muLimb), vec3f(0.397, 0.503, 0.652));
    return edge * limb;
}

const ATMOSPHERE_GROUND_KM: f32 = 6360.0;
const ATMOSPHERE_TOP_KM: f32 = 6460.0;

/// Densities (rayleigh, mie, ozone) at altitude h km above the ground.
/// @use custom atmosphere marches (aerial perspective, planet views)
fn atmosphereDensity(h: f32) -> vec3f {
    return vec3f(exp(-h / 8.0), exp(-h / 1.2), max(0.0, 1.0 - abs(h - 25.0) / 15.0));
}

/// Extinction per km for the given densities.
/// @use transmittance through air for sun color and aerial perspective
fn atmosphereExtinction(density: vec3f) -> vec3f {
    const rayleigh = vec3f(5.802, 13.558, 33.1) * 1e-3;
    const mie: f32 = (3.996f + 4.40f) * 1e-3f;
    const ozone = vec3f(0.650, 1.881, 0.085) * 1e-3;
    return rayleigh * density.x + mie * density.y + ozone * density.z;
}

/// Physically based sky radiance along rd for a viewer viewHeightKm above the ground, with single scattering
/// (16 view steps x 8 light steps). sunIntensity about 20. Sunsets come out somewhat dark because multiple
/// scattering is ignored; add a small ambient term if needed.
/// @use realistic skies, sunsets, aerial perspective colors, planet-from-space views
/// @see Sebastien Hillaire, "A Scalable and Production Ready Sky and Atmosphere Rendering Technique", EGSR 2020
fn atmosphereSky(rd: vec3f, sunDir: vec3f, viewHeightKm: f32, sunIntensity: f32) -> vec3f {
    const rayleighScatter = vec3f(5.802, 13.558, 33.1) * 1e-3;
    const mieScatter: f32 = 3.996e-3;
    let ro = vec3f(0.0, ATMOSPHERE_GROUND_KM + max(viewHeightKm, 0.001), 0.0);
    let top = iSphere(ro, rd, vec3f(0.0), ATMOSPHERE_TOP_KM);
    if (top.y <= 0.0) { return vec3f(0.0); }
    let ground = iSphere(ro, rd, vec3f(0.0), ATMOSPHERE_GROUND_KM);
    let tStart = max(top.x, 0.0);
    let tEnd = select(top.y, ground.x, ground.x > 0.0);
    let mu = dot(rd, sunDir);
    let pR = phaseRayleigh(mu);
    let pM = phaseCornetteShanks(mu, 0.8);
    const VIEW_STEPS: i32 = 16;
    const LIGHT_STEPS: i32 = 8;
    let dt = (tEnd - tStart) / f32(VIEW_STEPS);
    var radiance = vec3f(0.0);
    var transmittance = vec3f(1.0);
    for (var i = 0; i < VIEW_STEPS; i++) {
        let p = ro + rd * (tStart + (f32(i) + 0.5) * dt);
        let dens = atmosphereDensity(length(p) - ATMOSPHERE_GROUND_KM);
        var sunT = vec3f(0.0);
        if (iSphere(p, sunDir, vec3f(0.0), ATMOSPHERE_GROUND_KM).x < 0.0) {
            let tl = iSphere(p, sunDir, vec3f(0.0), ATMOSPHERE_TOP_KM).y;
            let dl = tl / f32(LIGHT_STEPS);
            var depth = vec3f(0.0);
            for (var j = 0; j < LIGHT_STEPS; j++) {
                let q = p + sunDir * ((f32(j) + 0.5) * dl);
                depth += atmosphereExtinction(atmosphereDensity(length(q) - ATMOSPHERE_GROUND_KM)) * dl;
            }
            sunT = exp(-depth);
        }
        let scatter = sunT * (rayleighScatter * dens.x * pR + mieScatter * dens.y * pM) * sunIntensity;
        volumeStep(&radiance, &transmittance, atmosphereExtinction(dens), scatter, dt);
    }
    return radiance;
}
`;

// src/knowledge/shader-craft/library/modules/camera.ts
var CAMERA_GLSL = `//! camera: look-at frames, primary rays, field of view, thin-lens depth of field.
//! Convention: uv = (2.0 * gl_FragCoord.xy - resolution) / resolution.y, so uv.y spans [-1, 1] and aspect is kept.

/// Camera-to-world matrix looking from ro toward ta, with roll in radians. Columns are (right, up, forward).
/// @use every 3D shader
mat3 cameraMatrix(vec3 ro, vec3 ta, float roll) {
    vec3 w = normalize(ta - ro);
    vec3 up = vec3(sin(roll), cos(roll), 0.0);
    vec3 u = normalize(cross(w, up));
    vec3 v = cross(u, w);
    return mat3(u, v, w);
}

/// Focal length (the z of the view-space ray) for a vertical field of view in degrees.
/// @use matching a reference photo, wide (90) vs telephoto (20) framing
float fovToFocal(float fovDegrees) { return 1.0 / tan(radians(fovDegrees) * 0.5); }

/// Primary ray direction for screen point uv. focal is about 1.5-2.5 for natural framing (see fovToFocal).
/// @use every 3D shader
vec3 cameraRay(mat3 cam, vec2 uv, float focal) {
    return normalize(cam * vec3(uv, focal));
}

/// Thin-lens depth of field. Moves the ray origin over a lens disk of radius aperture, and re-aims it so that
/// points at distance focusDist stay sharp. xi is a pair of uniform random numbers in [0,1) (e.g. hash22 of the
/// pixel and frame). Average many samples (an AA loop, or accumulation across frames in a feedback texture).
/// @use macro shots, product renders, cinematic focus pulls, bokeh
void thinLensRay(mat3 cam, vec2 uv, float focal, float aperture, float focusDist, vec2 xi, inout vec3 ro, out vec3 rd) {
    vec3 dir = normalize(cam * vec3(uv, focal));
    float ft = focusDist / dot(dir, cam[2]);
    vec3 focusPoint = ro + dir * ft;
    float a = TAU * xi.x;
    float r = aperture * sqrt(xi.y);
    ro += cam * vec3(r * cos(a), r * sin(a), 0.0);
    rd = normalize(focusPoint - ro);
}

/// Orthographic ray: parallel rays from a plane of half-height \`size\` centered on ro.
/// @use isometric scenes, technical illustrations, flat diorama looks
void orthoRay(mat3 cam, vec2 uv, float size, inout vec3 ro, out vec3 rd) {
    ro += cam * vec3(uv * size, 0.0);
    rd = cam[2];
}
`;
var CAMERA_WGSL = `//! camera: look-at frames, primary rays, field of view, thin-lens depth of field.
//! Convention: uv = (2.0 * pixel - resolution) / resolution.y with pixel = vec2f(position.x, resolution.y - position.y),
//! so uv.y spans [-1, 1], points up as in GLSL, and aspect is kept.

/// Camera-to-world matrix looking from ro toward ta, with roll in radians. Columns are (right, up, forward).
/// @use every 3D shader
fn cameraMatrix(ro: vec3f, ta: vec3f, roll: f32) -> mat3x3f {
    let w = normalize(ta - ro);
    let up = vec3f(sin(roll), cos(roll), 0.0);
    let u = normalize(cross(w, up));
    let v = cross(u, w);
    return mat3x3f(u, v, w);
}

/// Focal length (the z of the view-space ray) for a vertical field of view in degrees.
/// @use matching a reference photo, wide (90) vs telephoto (20) framing
fn fovToFocal(fovDegrees: f32) -> f32 { return 1.0 / tan(radians(fovDegrees) * 0.5); }

/// Primary ray direction for screen point uv. focal is about 1.5-2.5 for natural framing (see fovToFocal).
/// @use every 3D shader
fn cameraRay(cam: mat3x3f, uv: vec2f, focal: f32) -> vec3f {
    return normalize(cam * vec3f(uv, focal));
}

/// Thin-lens depth of field. Moves the ray origin over a lens disk of radius aperture, and re-aims it so that
/// points at distance focusDist stay sharp. xi is a pair of uniform random numbers in [0,1) (e.g. hash22 of the
/// pixel and frame). Average many samples (an AA loop, or accumulation across frames in a feedback texture).
/// @use macro shots, product renders, cinematic focus pulls, bokeh
fn thinLensRay(cam: mat3x3f, uv: vec2f, focal: f32, aperture: f32, focusDist: f32, xi: vec2f, ro: ptr<function, vec3f>, rd: ptr<function, vec3f>) {
    let dir = normalize(cam * vec3f(uv, focal));
    let ft = focusDist / dot(dir, cam[2]);
    let focusPoint = *ro + dir * ft;
    let a = TAU * xi.x;
    let r = aperture * sqrt(xi.y);
    *ro += cam * vec3f(r * cos(a), r * sin(a), 0.0);
    *rd = normalize(focusPoint - *ro);
}

/// Orthographic ray: parallel rays from a plane of half-height \`size\` centered on ro.
/// @use isometric scenes, technical illustrations, flat diorama looks
fn orthoRay(cam: mat3x3f, uv: vec2f, size: f32, ro: ptr<function, vec3f>, rd: ptr<function, vec3f>) {
    *ro += cam * vec3f(uv * size, 0.0);
    *rd = cam[2];
}
`;

// src/knowledge/shader-craft/library/modules/color.ts
var COLOR_GLSL = `//! color: transfer functions, perceptual color (Oklab / OkLCh), palettes, luminance, blackbody light colors.
//! Light, shade and mix in LINEAR color. Picked hex colors, cosine palettes and 8-bit image textures are sRGB-encoded,
//! so decode them with srgbToLinear before lighting. Encode once at the very end with linearToSrgb.

/// Exact sRGB decode (EOTF): encoded [0,1] -> linear.
/// @use decoding picked colors, palettes used as albedo, and texture samples
vec3 srgbToLinear(vec3 c) {
    c = max(c, 0.0);
    return mix(c / 12.92, pow((c + 0.055) / 1.055, vec3(2.4)), step(0.04045, c));
}

/// Exact sRGB encode (OETF): linear -> display [0,1]. Apply exactly once, after tonemapping.
/// pow(c, 1/2.2) is visibly wrong near black (0.001 encodes to 0.013 here vs 0.043 with 2.2).
/// @use final output
vec3 linearToSrgb(vec3 c) {
    c = max(c, 0.0);
    return mix(c * 12.92, 1.055 * pow(c, vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c));
}

/// Relative luminance of linear Rec.709 / sRGB color.
/// @use desaturation, brightness masks, luminance-based effects
float luminance(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

/// Scale saturation around luminance: 0 = grey, 1 = unchanged, > 1 = more saturated.
/// @use grading, fading distant objects, stylization
vec3 saturation(vec3 c, float s) { return mix(vec3(luminance(c)), c, s); }

/// Linear sRGB -> Oklab (L in [0,1], a/b around [-0.4, 0.4]). Matrices from Bjorn Ottosson (public domain / MIT).
/// @use perceptual gradients, even-lightness palettes, hue and chroma edits
/// @see Bjorn Ottosson, "A perceptual color space for image processing"
vec3 linearSrgbToOklab(vec3 c) {
    vec3 lms = c * mat3(0.4122214708, 0.5363325363, 0.0514459929,
                        0.2119034982, 0.6806995451, 0.1073969566,
                        0.0883024619, 0.2817188376, 0.6299787005);
    lms = sign(lms) * pow(abs(lms), vec3(1.0 / 3.0));
    return lms * mat3(0.2104542553, 0.7936177850, -0.0040720468,
                      1.9779984951, -2.4285922050, 0.4505937099,
                      0.0259040371, 0.7827717662, -0.8086757660);
}

/// Oklab -> linear sRGB. The result can fall outside [0,1] for saturated colors, so clamp after tonemapping.
/// @use converting perceptual edits back for lighting or output
vec3 oklabToLinearSrgb(vec3 lab) {
    vec3 lms = lab * mat3(1.0, 0.3963377774, 0.2158037573,
                          1.0, -0.1055613458, -0.0638541728,
                          1.0, -0.0894841775, -1.2914855480);
    lms = lms * lms * lms;
    return lms * mat3(4.0767416621, -3.3077115913, 0.2309699292,
                      -1.2684380046, 2.6097574011, -0.3413193965,
                      -0.0041960863, -0.7034186147, 1.7076147010);
}

/// Mix two linear colors in Oklab. Avoids the muddy mid-tones of RGB lerps and the hue detours of HSV.
/// @use gradients, sky ramps, color transitions over time, blending materials
vec3 mixOklab(vec3 a, vec3 b, float t) {
    return oklabToLinearSrgb(mix(linearSrgbToOklab(a), linearSrgbToOklab(b), t));
}

/// OkLCh (lightness, chroma, hue in radians) -> linear sRGB. Hue sweeps keep lightness constant.
/// L about 0.4-0.9, C about 0.05-0.2 stays mostly in gamut.
/// @use harmonious palettes, rainbow ramps with even brightness, per-instance hue variation
vec3 oklchToLinearSrgb(vec3 lch) {
    return oklabToLinearSrgb(vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)));
}

/// Cosine palette a + b * cos(2 pi (c t + d)). Output is display-like (sRGB-ish), so decode it for albedo.
/// Integer c values loop seamlessly over t in [0,1].
/// @use quick gradients, heat maps, psychedelic color cycling, per-id colors
/// @see Inigo Quilez, palettes
vec3 cosinePalette(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
    return a + b * cos(TAU * (c * t + d));
}

/// Approximate linear sRGB color of a blackbody at temperature kelvin (1000-15000 K), normalized to max channel 1.
/// Uses the Krystek (1985) Planckian-locus fit -> XYZ -> sRGB.
/// @use fire, embers, lava, stars, incandescent lamps, sunset light, molten metal
vec3 blackbody(float kelvin) {
    float T = clamp(kelvin, 1000.0, 15000.0);
    float u = (0.860117757 + 1.54118254e-4 * T + 1.28641212e-7 * T * T) / (1.0 + 8.42420235e-4 * T + 7.08145163e-7 * T * T);
    float v = (0.317398726 + 4.22806245e-5 * T + 4.20481691e-8 * T * T) / (1.0 - 2.89741816e-5 * T + 1.61456053e-7 * T * T);
    float x = 3.0 * u / (2.0 * u - 8.0 * v + 4.0);
    float y = 2.0 * v / (2.0 * u - 8.0 * v + 4.0);
    vec3 xyz = vec3(x / y, 1.0, (1.0 - x - y) / y);
    vec3 rgb = xyz * mat3(3.2406, -1.5372, -0.4986,
                          -0.9689, 1.8758, 0.0415,
                          0.0557, -0.2040, 1.0570);
    rgb = max(rgb, 0.0);
    return rgb / max(max(rgb.r, rgb.g), max(rgb.b, 1e-6));
}
`;
var COLOR_WGSL = `//! color: transfer functions, perceptual color (Oklab / OkLCh), palettes, luminance, blackbody light colors.
//! Light, shade and mix in LINEAR color. Picked hex colors, cosine palettes and 8-bit image textures are sRGB-encoded,
//! so decode them with srgbToLinear before lighting. Encode once at the very end with linearToSrgb.
//! A vec3f times a mat3x3f multiplies the row vector, as in GLSL: each output is the dot with one column.

/// Exact sRGB decode (EOTF): encoded [0,1] -> linear.
/// @use decoding picked colors, palettes used as albedo, and texture samples
fn srgbToLinear(c: vec3f) -> vec3f {
    let c_ = max(c, vec3f(0.0));
    return mix(c_ / 12.92, pow((c_ + 0.055) / 1.055, vec3f(2.4)), step(vec3f(0.04045), c_));
}

/// Exact sRGB encode (OETF): linear -> display [0,1]. Apply exactly once, after tonemapping.
/// pow(c, 1/2.2) is visibly wrong near black (0.001 encodes to 0.013 here vs 0.043 with 2.2).
/// @use final output
fn linearToSrgb(c: vec3f) -> vec3f {
    let c_ = max(c, vec3f(0.0));
    return mix(c_ * 12.92, 1.055 * pow(c_, vec3f(1.0f / 2.4f)) - 0.055, step(vec3f(0.0031308), c_));
}

/// Relative luminance of linear Rec.709 / sRGB color.
/// @use desaturation, brightness masks, luminance-based effects
fn luminance(c: vec3f) -> f32 { return dot(c, vec3f(0.2126, 0.7152, 0.0722)); }

/// Scale saturation around luminance: 0 = grey, 1 = unchanged, > 1 = more saturated.
/// @use grading, fading distant objects, stylization
fn saturation(c: vec3f, s: f32) -> vec3f { return mix(vec3f(luminance(c)), c, s); }

/// Linear sRGB -> Oklab (L in [0,1], a/b around [-0.4, 0.4]). Matrices from Bjorn Ottosson (public domain / MIT).
/// @use perceptual gradients, even-lightness palettes, hue and chroma edits
/// @see Bjorn Ottosson, "A perceptual color space for image processing"
fn linearSrgbToOklab(c: vec3f) -> vec3f {
    var lms = c * mat3x3f(0.4122214708, 0.5363325363, 0.0514459929,
                          0.2119034982, 0.6806995451, 0.1073969566,
                          0.0883024619, 0.2817188376, 0.6299787005);
    lms = sign(lms) * pow(abs(lms), vec3f(1.0f / 3.0f));
    return lms * mat3x3f(0.2104542553, 0.7936177850, -0.0040720468,
                         1.9779984951, -2.4285922050, 0.4505937099,
                         0.0259040371, 0.7827717662, -0.8086757660);
}

/// Oklab -> linear sRGB. The result can fall outside [0,1] for saturated colors, so clamp after tonemapping.
/// @use converting perceptual edits back for lighting or output
fn oklabToLinearSrgb(lab: vec3f) -> vec3f {
    var lms = lab * mat3x3f(1.0, 0.3963377774, 0.2158037573,
                            1.0, -0.1055613458, -0.0638541728,
                            1.0, -0.0894841775, -1.2914855480);
    lms = lms * lms * lms;
    return lms * mat3x3f(4.0767416621, -3.3077115913, 0.2309699292,
                         -1.2684380046, 2.6097574011, -0.3413193965,
                         -0.0041960863, -0.7034186147, 1.7076147010);
}

/// Mix two linear colors in Oklab. Avoids the muddy mid-tones of RGB lerps and the hue detours of HSV.
/// @use gradients, sky ramps, color transitions over time, blending materials
fn mixOklab(a: vec3f, b: vec3f, t: f32) -> vec3f {
    return oklabToLinearSrgb(mix(linearSrgbToOklab(a), linearSrgbToOklab(b), t));
}

/// OkLCh (lightness, chroma, hue in radians) -> linear sRGB. Hue sweeps keep lightness constant.
/// L about 0.4-0.9, C about 0.05-0.2 stays mostly in gamut.
/// @use harmonious palettes, rainbow ramps with even brightness, per-instance hue variation
fn oklchToLinearSrgb(lch: vec3f) -> vec3f {
    return oklabToLinearSrgb(vec3f(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)));
}

/// Cosine palette a + b * cos(2 pi (c t + d)). Output is display-like (sRGB-ish), so decode it for albedo.
/// Integer c values loop seamlessly over t in [0,1].
/// @use quick gradients, heat maps, psychedelic color cycling, per-id colors
/// @see Inigo Quilez, palettes
fn cosinePalette(t: f32, a: vec3f, b: vec3f, c: vec3f, d: vec3f) -> vec3f {
    return a + b * cos(TAU * (c * t + d));
}

/// Approximate linear sRGB color of a blackbody at temperature kelvin (1000-15000 K), normalized to max channel 1.
/// Uses the Krystek (1985) Planckian-locus fit -> XYZ -> sRGB.
/// @use fire, embers, lava, stars, incandescent lamps, sunset light, molten metal
fn blackbody(kelvin: f32) -> vec3f {
    let T = clamp(kelvin, 1000.0, 15000.0);
    let u = (0.860117757 + 1.54118254e-4 * T + 1.28641212e-7 * T * T) / (1.0 + 8.42420235e-4 * T + 7.08145163e-7 * T * T);
    let v = (0.317398726 + 4.22806245e-5 * T + 4.20481691e-8 * T * T) / (1.0 - 2.89741816e-5 * T + 1.61456053e-7 * T * T);
    let x = 3.0 * u / (2.0 * u - 8.0 * v + 4.0);
    let y = 2.0 * v / (2.0 * u - 8.0 * v + 4.0);
    let xyz = vec3f(x / y, 1.0, (1.0 - x - y) / y);
    var rgb = xyz * mat3x3f(3.2406, -1.5372, -0.4986,
                            -0.9689, 1.8758, 0.0415,
                            0.0557, -0.2040, 1.0570);
    rgb = max(rgb, vec3f(0.0));
    return rgb / max(max(rgb.r, rgb.g), max(rgb.b, 1e-6));
}
`;

// src/knowledge/shader-craft/library/modules/common.ts
var COMMON_GLSL = `//! common: constants, rotation, remapping and shaping functions.
//! Target: GLSL ES 3.00 as Noisemaker effects use it (WebGL2). Every function here is original and MIT licensed.
//! Programs that use the library declare   precision highp float; precision highp int;   (the hashes need 32-bit uint).

const float PI = 3.14159265358979;
const float TAU = 6.28318530717959;

/// Clamp to [0,1].
/// @use masks, weights, colors
float saturate(float x) { return clamp(x, 0.0, 1.0); }
vec3 saturate(vec3 x) { return clamp(x, 0.0, 1.0); }

/// Squared length.
/// @use cheap distance comparisons, SDF internals
float dot2(vec2 v) { return dot(v, v); }
float dot2(vec3 v) { return dot(v, v); }

/// 2D rotation matrix. \`rot2(a) * v\` rotates v counter-clockwise by a radians.
/// (cos, sin) is renormalized because GLSL ES leaves trig precision undefined: on SwiftShader and some mobile
/// GPUs a raw cos/sin pair is far enough from unit length that rotations stop preserving distances.
/// @use spinning parts, posing limbs, rotating octaves, camera roll
mat2 rot2(float a) {
    vec2 cs = normalize(vec2(cos(a), sin(a)));
    return mat2(cs.x, cs.y, -cs.y, cs.x);
}

/// Linear remap of x from [a,b] to [c,d] (unclamped).
/// @use converting ranges, rescaling noise
float remap(float x, float a, float b, float c, float d) {
    return c + (d - c) * (x - a) / (b - a);
}

/// Linear ramp from 0 at a to 1 at b, clamped.
/// @use masks whose falloff should not ease in or out
float linearstep(float a, float b, float x) {
    return clamp((x - a) / (b - a), 0.0, 1.0);
}

/// Smooth bump: 1 at x == c, falling to 0 at |x - c| >= w (cubic).
/// @use stripes, rings, highlights at one height, pulses in time
float cubicPulse(float c, float w, float x) {
    x = abs(x - c);
    if (x > w) return 0.0;
    x /= w;
    return 1.0 - x * x * (3.0 - 2.0 * x);
}

/// Fast attack, exponential decay. Peaks at 1 when x == 1/k.
/// @use heartbeat motion, impacts, flashes, plucked-string envelopes
float expImpulse(float x, float k) {
    float h = k * x;
    return h * exp(1.0 - h);
}

/// Contrast curve on [0,1] that keeps 0, 0.5 and 1 fixed. k > 1 adds contrast, k < 1 flattens.
/// @use tightening masks, adjusting animation easing
float gain(float x, float k) {
    float a = 0.5 * pow(2.0 * ((x < 0.5) ? x : 1.0 - x), k);
    return (x < 0.5) ? a : 1.0 - a;
}

/// 0 at x = 0 and x = 1, peak 1 at x = 0.5; k sharpens.
/// @use petal width along length, leaf profiles, arches
float parabola(float x, float k) {
    return pow(4.0 * x * (1.0 - x), k);
}

/// Returns x when x > m; smoothly bottoms out at n when x -> 0. Needs 2n < m.
/// @use avoiding hard zero in falloffs, soft floor on thickness
float almostIdentity(float x, float m, float n) {
    if (x > m) return x;
    float a = 2.0 * n - m;
    float b = 2.0 * m - 3.0 * n;
    float t = x / m;
    return (a * t + b) * t * t + n;
}
`;
var COMMON_WGSL = `//! common: constants, rotation, remapping and shaping functions.
//! Target: WGSL as Noisemaker effects use it (WebGPU); the twin of the GLSL module. Every function here is original
//! and MIT licensed.

const PI: f32 = 3.14159265358979;
const TAU: f32 = 6.28318530717959;

/// Clamp to [0,1].
/// @use masks, weights, colors
fn saturate_f(x: f32) -> f32 { return clamp(x, 0.0, 1.0); }
fn saturate_f3(x: vec3f) -> vec3f { return clamp(x, vec3f(0.0), vec3f(1.0)); }

/// Squared length.
/// @use cheap distance comparisons, SDF internals
fn dot2_f2(v: vec2f) -> f32 { return dot(v, v); }
fn dot2_f3(v: vec3f) -> f32 { return dot(v, v); }

/// 2D rotation matrix. \`rot2(a) * v\` rotates v counter-clockwise by a radians.
/// (cos, sin) is renormalized because trig precision is not guaranteed: on SwiftShader and some mobile
/// GPUs a raw cos/sin pair is far enough from unit length that rotations stop preserving distances.
/// @use spinning parts, posing limbs, rotating octaves, camera roll
fn rot2(a: f32) -> mat2x2f {
    let cs = normalize(vec2f(cos(a), sin(a)));
    return mat2x2f(cs.x, cs.y, -cs.y, cs.x);
}

/// Linear remap of x from [a,b] to [c,d] (unclamped).
/// @use converting ranges, rescaling noise
fn remap(x: f32, a: f32, b: f32, c: f32, d: f32) -> f32 {
    return c + (d - c) * (x - a) / (b - a);
}

/// Linear ramp from 0 at a to 1 at b, clamped.
/// @use masks whose falloff should not ease in or out
fn linearstep(a: f32, b: f32, x: f32) -> f32 {
    return clamp((x - a) / (b - a), 0.0, 1.0);
}

/// Smooth bump: 1 at x == c, falling to 0 at |x - c| >= w (cubic).
/// @use stripes, rings, highlights at one height, pulses in time
fn cubicPulse(c: f32, w: f32, x: f32) -> f32 {
    var x_ = abs(x - c);
    if (x_ > w) { return 0.0; }
    x_ /= w;
    return 1.0 - x_ * x_ * (3.0 - 2.0 * x_);
}

/// Fast attack, exponential decay. Peaks at 1 when x == 1/k.
/// @use heartbeat motion, impacts, flashes, plucked-string envelopes
fn expImpulse(x: f32, k: f32) -> f32 {
    let h = k * x;
    return h * exp(1.0 - h);
}

/// Contrast curve on [0,1] that keeps 0, 0.5 and 1 fixed. k > 1 adds contrast, k < 1 flattens.
/// @use tightening masks, adjusting animation easing
fn gain(x: f32, k: f32) -> f32 {
    let a = 0.5 * pow(2.0 * select(1.0 - x, x, x < 0.5), k);
    return select(1.0 - a, a, x < 0.5);
}

/// 0 at x = 0 and x = 1, peak 1 at x = 0.5; k sharpens.
/// @use petal width along length, leaf profiles, arches
fn parabola(x: f32, k: f32) -> f32 {
    return pow(4.0 * x * (1.0 - x), k);
}

/// Returns x when x > m; smoothly bottoms out at n when x -> 0. Needs 2n < m.
/// @use avoiding hard zero in falloffs, soft floor on thickness
fn almostIdentity(x: f32, m: f32, n: f32) -> f32 {
    if (x > m) { return x; }
    let a = 2.0 * n - m;
    let b = 2.0 * m - 3.0 * n;
    let t = x / m;
    return (a * t + b) * t * t + n;
}
`;

// src/knowledge/shader-craft/library/modules/debug.ts
var DEBUG_GLSL = `//! debug: visualize intermediate fields. The pack's DEBUG_MODE convention:
//!   0 final render | 1 distance field / contours | 2 normals | 3 material ids
//!   4 step count / depth | 5 masks / density | 6 lighting terms
//! While building, declare it as an agent-only global debugMode with define "DEBUG_MODE" (default 0), so each view
//! compiles as its own variant; remove the global and its branches before delivery.

/// Distance field as contour bands: warm outside, cool inside, white zero line. Bands are 0.1 units apart.
/// @use checking SDF scale, smoothness, wrong signs, bad blends (kinked or bunched contours)
vec3 debugDistance(float d) {
    vec3 col = (d > 0.0) ? vec3(0.9, 0.6, 0.3) : vec3(0.4, 0.7, 0.85);
    col *= 1.0 - exp(-4.0 * abs(d));
    col *= 0.8 + 0.2 * cos(TAU * d / 0.1);
    return mix(col, vec3(1.0), 1.0 - smoothstep(0.0, 0.01, abs(d)));
}

/// Normal as RGB.
/// @use spotting seams, flipped normals, noisy normals
vec3 debugNormal(vec3 n) { return 0.5 + 0.5 * n; }

/// Distinct color per integer id.
/// @use material ids, cell ids, instance ids
vec3 debugIdColor(float id) {
    return 0.55 + 0.45 * cos(TAU * (0.618034 * id + vec3(0.0, 0.33, 0.67)));
}

/// Heat ramp for a value in [0,1]: black, blue, magenta, orange, yellow, white.
/// @use step counts (steps / maxSteps), depth, cost, any scalar mask
vec3 debugHeat(float t) {
    t = clamp(t, 0.0, 1.0);
    return clamp(vec3(1.5 * t, 1.6 * t * t * t - 0.1, 0.9 * sin(PI * t) + 0.2 * t * t), 0.0, 1.0);
}
`;
var DEBUG_WGSL = `//! debug: visualize intermediate fields. The shader-craft DEBUG_MODE convention:
//!   0 final render | 1 distance field / contours | 2 normals | 3 material ids
//!   4 step count / depth | 5 masks / density | 6 lighting terms
//! While building, declare it as an agent-only global debugMode with define "DEBUG_MODE" (default 0), so each view
//! compiles as its own variant; remove the global and its branches before delivery.

/// Distance field as contour bands: warm outside, cool inside, white zero line. Bands are 0.1 units apart.
/// @use checking SDF scale, smoothness, wrong signs, bad blends (kinked or bunched contours)
fn debugDistance(d: f32) -> vec3f {
    var col = select(vec3f(0.4, 0.7, 0.85), vec3f(0.9, 0.6, 0.3), d > 0.0);
    col *= 1.0 - exp(-4.0 * abs(d));
    col *= 0.8 + 0.2 * cos(TAU * d / 0.1);
    return mix(col, vec3f(1.0), 1.0 - smoothstep(0.0, 0.01, abs(d)));
}

/// Normal as RGB.
/// @use spotting seams, flipped normals, noisy normals
fn debugNormal(n: vec3f) -> vec3f { return 0.5 + 0.5 * n; }

/// Distinct color per integer id.
/// @use material ids, cell ids, instance ids
fn debugIdColor(id: f32) -> vec3f {
    return 0.55 + 0.45 * cos(TAU * (0.618034 * id + vec3f(0.0, 0.33, 0.67)));
}

/// Heat ramp for a value in [0,1]: black, blue, magenta, orange, yellow, white.
/// @use step counts (steps / maxSteps), depth, cost, any scalar mask
fn debugHeat(t: f32) -> vec3f {
    let t_ = clamp(t, 0.0, 1.0);
    return clamp(vec3f(1.5 * t_, 1.6 * t_ * t_ * t_ - 0.1, 0.9 * sin(PI * t_) + 0.2 * t_ * t_), vec3f(0.0), vec3f(1.0));
}
`;

// src/knowledge/shader-craft/library/modules/domain.ts
var DOMAIN_GLSL = `//! domain: transform the point BEFORE evaluating a distance (repetition, mirroring, polar sectors, folds,
//! twist, bend). Rigid transforms (repeat, mirror, rotate, fold) keep distances exact. Twist and bend
//! stretch space, so their results are only bounds after scaling (see each function).
//! Repetition uses floor(x + 0.5) instead of round(): GLSL leaves round(0.5) implementation-defined, and round can return -0.0.

/// Cell index for repetition with period s (integer-valued; use with hash functions).
/// @use per-instance variation: hash12(domRepeatId(p.xz, s))
float domRepeatId(float p, float s) { return floor(p / s + 0.5); }
vec2 domRepeatId(vec2 p, vec2 s) { return floor(p / s + 0.5); }
vec3 domRepeatId(vec3 p, vec3 s) { return floor(p / s + 0.5); }

/// Infinite repetition with period s. Returns the local coordinate centered in its cell.
/// Exact only while each instance stays inside its own cell. For instances that vary per cell or
/// overhang, evaluate the 2 or 3 neighboring cells too (see shader-craft-sdf-library-guide).
/// @use forests, columns, tiles, crowds, star fields, city blocks
float domRepeat(float p, float s) { return p - s * floor(p / s + 0.5); }
vec2 domRepeat(vec2 p, vec2 s) { return p - s * floor(p / s + 0.5); }
vec3 domRepeat(vec3 p, vec3 s) { return p - s * floor(p / s + 0.5); }

/// Repetition limited to cells -lim..+lim on each axis (2*lim + 1 copies).
/// @use rows of windows, fence posts, a finite grid of buttons, colonnades
vec2 domRepeatLimited(vec2 p, vec2 s, vec2 lim) { return p - s * clamp(floor(p / s + 0.5), -lim, lim); }
vec3 domRepeatLimited(vec3 p, vec3 s, vec3 lim) { return p - s * clamp(floor(p / s + 0.5), -lim, lim); }

/// Mirrored repetition: every other cell is flipped, so shapes touching the cell border join seamlessly.
/// @use tiled ornaments, symmetric wallpaper, seamless pipes and rails
vec2 domRepeatMirror(vec2 p, vec2 s) {
    vec2 cell = floor(p / s + 0.5);
    vec2 local = p - s * cell;
    return local * (1.0 - 2.0 * mod(cell, 2.0));
}

/// Polar repetition into n sectors around the origin. Returns the point rotated into the sector centered on +X.
/// Single evaluation: exact for shapes symmetric about their sector's center line. For asymmetric or per-sector-varying
/// shapes, evaluate this sector and its neighbor and take the min (see shader-craft-sdf-library-guide).
/// @use petals, spokes, gears, clock marks, radial ornaments, columns around a tower
vec2 domPolar(vec2 p, float n) {
    if (dot(p, p) < 1e-20) return p;
    float sector = TAU / n;
    float id = floor(atan(p.y, p.x) / sector + 0.5);
    return rot2(-id * sector) * p;
}

/// Sector index in [0, n) for domPolar.
/// @use varying each petal, spoke or column
float domPolarId(vec2 p, float n) {
    if (dot(p, p) < 1e-20) return 0.0;
    float sector = TAU / n;
    return mod(floor(atan(p.y, p.x) / sector + 0.5), n);
}

/// Neighbor-checked polar repetition: ids (in [0, n)) of the sector holding p and of the adjacent sector p leans
/// toward. Evaluate the shape in both with domPolarSector and take the min. Use it when sectors vary (per-id length,
/// tilt, color) or are asymmetric. It covers shapes of similar size that stay inside their own sector; a shape that
/// reaches across its neighbor needs a wider search.
/// @use varied petals, tilted fan blades, gear teeth of mixed sizes, uneven clock marks, radial crowds
vec2 domPolarPair(vec2 p, float n) {
    if (dot(p, p) < 1e-20) return vec2(0.0, 1.0);
    float sector = TAU / n;
    float a = atan(p.y, p.x) / sector;
    float id = floor(a + 0.5);
    return mod(vec2(id, id + ((a >= id) ? 1.0 : -1.0)), n);
}

/// Rotate p into the frame of polar sector id (its center line on +X). domPolarSector(p, domPolarId(p, n), n)
/// equals domPolar(p, n).
/// @use the second half of domPolarPair: evaluate a sector's shape by id
vec2 domPolarSector(vec2 p, float id, float n) { return rot2(-id * TAU / n) * p; }

/// Fold space across the plane through the origin with unit normal n. Points behind the plane are reflected.
/// @use kaleidoscopes, symmetric creatures, KIFS fractals, mirrored architecture
vec3 domFold(vec3 p, vec3 n) { return p - 2.0 * min(dot(p, n), 0.0) * n; }

/// Twist around Y: rotate XZ by k * y. Divide the resulting distance by L = a/2 + sqrt(1 + a*a/4), a = k * R,
/// where R is the shape's max distance from the Y axis. Without that, the march overshoots.
/// @use twisted columns, drills, licorice, DNA-like spirals, towels
vec3 domTwist(vec3 p, float k) {
    vec2 xz = rot2(k * p.y) * p.xz;
    return vec3(xz.x, p.y, xz.y);
}

/// Bend in XY: rotate XY by k * x. Divide the resulting distance by about 1 + k * R (R = max |p.xy| of the shape).
/// @use bent beams, arches from boxes, bananas, curved horns
vec3 domBend(vec3 p, float k) {
    vec2 xy = rot2(k * p.x) * p.xy;
    return vec3(xy, p.z);
}
`;
var DOMAIN_WGSL = `//! domain: transform the point BEFORE evaluating a distance (repetition, mirroring, polar sectors, folds,
//! twist, bend). Rigid transforms (repeat, mirror, rotate, fold) keep distances exact. Twist and bend
//! stretch space, so their results are only bounds after scaling (see each function).
//! Repetition uses floor(x + 0.5) instead of round(): round(0.5) rounds to even in WGSL but is implementation-defined in
//! GLSL, and round can return -0.0. GLSL's mod(x, y) is written out as x - y * floor(x / y), its definition.

/// Cell index for repetition with period s (integer-valued; use with hash functions).
/// @use per-instance variation: hash12(domRepeatId_f2f2(p.xz, s))
fn domRepeatId_ff(p: f32, s: f32) -> f32 { return floor(p / s + 0.5); }
fn domRepeatId_f2f2(p: vec2f, s: vec2f) -> vec2f { return floor(p / s + 0.5); }
fn domRepeatId_f3f3(p: vec3f, s: vec3f) -> vec3f { return floor(p / s + 0.5); }

/// Infinite repetition with period s. Returns the local coordinate centered in its cell.
/// Exact only while each instance stays inside its own cell. For instances that vary per cell or
/// overhang, evaluate the 2 or 3 neighboring cells too (see shader-craft-sdf-library-guide).
/// @use forests, columns, tiles, crowds, star fields, city blocks
fn domRepeat_ff(p: f32, s: f32) -> f32 { return p - s * floor(p / s + 0.5); }
fn domRepeat_f2f2(p: vec2f, s: vec2f) -> vec2f { return p - s * floor(p / s + 0.5); }
fn domRepeat_f3f3(p: vec3f, s: vec3f) -> vec3f { return p - s * floor(p / s + 0.5); }

/// Repetition limited to cells -lim..+lim on each axis (2*lim + 1 copies).
/// @use rows of windows, fence posts, a finite grid of buttons, colonnades
fn domRepeatLimited_f2f2f2(p: vec2f, s: vec2f, lim: vec2f) -> vec2f { return p - s * clamp(floor(p / s + 0.5), -lim, lim); }
fn domRepeatLimited_f3f3f3(p: vec3f, s: vec3f, lim: vec3f) -> vec3f { return p - s * clamp(floor(p / s + 0.5), -lim, lim); }

/// Mirrored repetition: every other cell is flipped, so shapes touching the cell border join seamlessly.
/// @use tiled ornaments, symmetric wallpaper, seamless pipes and rails
fn domRepeatMirror(p: vec2f, s: vec2f) -> vec2f {
    let cell = floor(p / s + 0.5);
    let local = p - s * cell;
    return local * (1.0 - 2.0 * (cell - 2.0 * floor(cell / 2.0)));
}

/// Polar repetition into n sectors around the origin. Returns the point rotated into the sector centered on +X.
/// Single evaluation: exact for shapes symmetric about their sector's center line. For asymmetric or per-sector-varying
/// shapes, evaluate this sector and its neighbor and take the min (see shader-craft-sdf-library-guide).
/// @use petals, spokes, gears, clock marks, radial ornaments, columns around a tower
fn domPolar(p: vec2f, n: f32) -> vec2f {
    if (dot(p, p) < 1e-20) { return p; }
    let sector = TAU / n;
    let id = floor(atan2(p.y, p.x) / sector + 0.5);
    return rot2(-id * sector) * p;
}

/// Sector index in [0, n) for domPolar.
/// @use varying each petal, spoke or column
fn domPolarId(p: vec2f, n: f32) -> f32 {
    if (dot(p, p) < 1e-20) { return 0.0; }
    let sector = TAU / n;
    let id = floor(atan2(p.y, p.x) / sector + 0.5);
    return id - n * floor(id / n);
}

/// Neighbor-checked polar repetition: ids (in [0, n)) of the sector holding p and of the adjacent sector p leans
/// toward. Evaluate the shape in both with domPolarSector and take the min. Use it when sectors vary (per-id length,
/// tilt, color) or are asymmetric. It covers shapes of similar size that stay inside their own sector; a shape that
/// reaches across its neighbor needs a wider search.
/// @use varied petals, tilted fan blades, gear teeth of mixed sizes, uneven clock marks, radial crowds
fn domPolarPair(p: vec2f, n: f32) -> vec2f {
    if (dot(p, p) < 1e-20) { return vec2f(0.0, 1.0); }
    let sector = TAU / n;
    let a = atan2(p.y, p.x) / sector;
    let id = floor(a + 0.5);
    let ids = vec2f(id, id + select(-1.0, 1.0, a >= id));
    return ids - n * floor(ids / n);
}

/// Rotate p into the frame of polar sector id (its center line on +X). domPolarSector(p, domPolarId(p, n), n)
/// equals domPolar(p, n).
/// @use the second half of domPolarPair: evaluate a sector's shape by id
fn domPolarSector(p: vec2f, id: f32, n: f32) -> vec2f { return rot2(-id * TAU / n) * p; }

/// Fold space across the plane through the origin with unit normal n. Points behind the plane are reflected.
/// @use kaleidoscopes, symmetric creatures, KIFS fractals, mirrored architecture
fn domFold(p: vec3f, n: vec3f) -> vec3f { return p - 2.0 * min(dot(p, n), 0.0) * n; }

/// Twist around Y: rotate XZ by k * y. Divide the resulting distance by L = a/2 + sqrt(1 + a*a/4), a = k * R,
/// where R is the shape's max distance from the Y axis. Without that, the march overshoots.
/// @use twisted columns, drills, licorice, DNA-like spirals, towels
fn domTwist(p: vec3f, k: f32) -> vec3f {
    let xz = rot2(k * p.y) * p.xz;
    return vec3f(xz.x, p.y, xz.y);
}

/// Bend in XY: rotate XY by k * x. Divide the resulting distance by about 1 + k * R (R = max |p.xy| of the shape).
/// @use bent beams, arches from boxes, bananas, curved horns
fn domBend(p: vec3f, k: f32) -> vec3f {
    let xy = rot2(k * p.x) * p.xy;
    return vec3f(xy, p.z);
}
`;

// src/knowledge/shader-craft/library/modules/hash.ts
var HASH_GLSL = `//! hash: integer hashes and float wrappers for lattice ids.
//! Naming: hashNM returns N floats from M inputs (hash12 = 1 output, 2 inputs). Outputs are in [0,1).
//! The float wrappers hash INTEGER-VALUED inputs (cell ids, pixel coords, frame numbers). Fractional parts
//! are dropped. That is deliberate: negative float -> uint is undefined in GLSL, and round() can return -0.0,
//! which has different bits from 0.0. Converting through int avoids both. To hash a continuous value, scale it first.
//! Keep inputs inside the 32-bit int range: GLSL leaves larger values undefined and WGSL clamps them, so the two
//! languages agree only inside it.
//! Do not use fract(sin(dot(p, k)) * 43758.5453): its result changes across GPUs and degrades at large inputs.
//! Integer mixers are from Jarzynski and Olano, "Hash Functions for GPU Rendering" (JCGT 2020): pcg3d and pcg4d sit
//! on that study's quality/speed frontier, and 32-bit integer math is bit-exact on every GPU, unlike sin().

/// PCG-style 1D integer hash.
/// @use seeding, per-instance randomness, building other hashes
/// @see Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020
uint pcgHash(uint v) {
    uint state = v * 747796405u + 2891336453u;
    uint word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

/// 3D integer hash, three decorrelated outputs.
/// @use 3D cell ids, voxel jitter, (pixel, frame) noise
/// @see Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020
uvec3 pcg3d(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    return v;
}

/// 4D integer hash, four decorrelated outputs (0 BigCrush failures in the JCGT study).
/// @use (pixel.x, pixel.y, frame, sample) streams for stochastic sampling, 4D cell ids
/// @see Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020
uvec4 pcg4d(uvec4 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.w;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v.w += v.y * v.z;
    v ^= v >> 16u;
    v.x += v.y * v.w;
    v.y += v.z * v.x;
    v.z += v.x * v.y;
    v.w += v.y * v.z;
    return v;
}

/// Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.
float uintToUnit(uint h) { return float(h >> 8u) * (1.0 / 16777216.0); }
vec2 uintToUnit(uvec2 h) { return vec2(h >> 8u) * (1.0 / 16777216.0); }
vec3 uintToUnit(uvec3 h) { return vec3(h >> 8u) * (1.0 / 16777216.0); }
vec4 uintToUnit(uvec4 h) { return vec4(h >> 8u) * (1.0 / 16777216.0); }

/// Random float in [0,1) for an integer-valued input.
/// @use per-cell randomness, stable random per instance id
/// @range [0,1)
float hash11(float p) { return uintToUnit(pcgHash(uint(int(floor(p))))); }

/// Random float in [0,1) for an integer-valued 2D input.
/// @use per-cell variation (color, height, rotation), sparse spots, star fields
/// @range [0,1)
float hash12(vec2 p) {
    uvec2 q = uvec2(ivec2(floor(p)));
    return uintToUnit(pcgHash(q.x + pcgHash(q.y)));
}

/// Random float in [0,1) for an integer-valued 3D input.
/// @use per-voxel randomness, per-pixel-per-frame noise via hash13(vec3(gl_FragCoord.xy, frame))
/// @range [0,1)
float hash13(vec3 p) {
    uvec3 q = uvec3(ivec3(floor(p)));
    return uintToUnit(pcgHash(q.x + pcgHash(q.y + pcgHash(q.z))));
}

/// Random vec2 in [0,1)^2 for an integer-valued 2D input.
/// @use Voronoi feature points, 2D jitter, random gradients
/// @range [0,1)^2
vec2 hash22(vec2 p) {
    ivec2 q = ivec2(floor(p));
    return uintToUnit(pcg3d(uvec3(q.x, q.y, 0x2545u))).xy;
}

/// Random vec3 in [0,1)^3 for an integer-valued 3D input.
/// @use 3D Voronoi points, random colors per cell, random directions
/// @range [0,1)^3
vec3 hash33(vec3 p) { return uintToUnit(pcg3d(uvec3(ivec3(floor(p))))); }

/// Random vec4 in [0,1)^4 for an integer-valued 4D input.
/// @use per-pixel, per-frame, per-sample random numbers: hash44(vec4(gl_FragCoord.xy, frame, sampleIndex))
/// @range [0,1)^4
vec4 hash44(vec4 p) { return uintToUnit(pcg4d(uvec4(ivec4(floor(p))))); }

/// Random vec3 in [0,1)^3 for an integer-valued 2D input.
/// @use per-tile random color, per-cell (offset, rotation, scale) triples
/// @range [0,1)^3
vec3 hash32(vec2 p) {
    ivec2 q = ivec2(floor(p));
    return uintToUnit(pcg3d(uvec3(q.x, q.y, 0x9E37u)));
}
`;
var HASH_WGSL = `//! hash: integer hashes and float wrappers for lattice ids.
//! Naming: hashNM returns N floats from M inputs (hash12 = 1 output, 2 inputs). Outputs are in [0,1).
//! The float wrappers hash INTEGER-VALUED inputs (cell ids, pixel coords, frame numbers). Fractional parts
//! are dropped. That is deliberate: negative float -> uint is undefined in GLSL, and round() can return -0.0,
//! which has different bits from 0.0. Converting through i32 avoids both. To hash a continuous value, scale it first.
//! Keep inputs inside the 32-bit int range: GLSL leaves larger values undefined and WGSL clamps them, so the two
//! languages agree only inside it.
//! Do not use fract(sin(dot(p, k)) * 43758.5453): its result changes across GPUs and degrades at large inputs.
//! Integer mixers are from Jarzynski and Olano, "Hash Functions for GPU Rendering" (JCGT 2020): pcg3d and pcg4d sit
//! on that study's quality/speed frontier, and 32-bit integer math is bit-exact on every GPU, unlike sin().

/// PCG-style 1D integer hash.
/// @use seeding, per-instance randomness, building other hashes
/// @see Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020
fn pcgHash(v: u32) -> u32 {
    let state = v * 747796405u + 2891336453u;
    let word = ((state >> ((state >> 28u) + 4u)) ^ state) * 277803737u;
    return (word >> 22u) ^ word;
}

/// 3D integer hash, three decorrelated outputs.
/// @use 3D cell ids, voxel jitter, (pixel, frame) noise
/// @see Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020
fn pcg3d(v: vec3u) -> vec3u {
    var v_ = v * 1664525u + 1013904223u;
    v_.x += v_.y * v_.z;
    v_.y += v_.z * v_.x;
    v_.z += v_.x * v_.y;
    v_ ^= v_ >> vec3u(16u);
    v_.x += v_.y * v_.z;
    v_.y += v_.z * v_.x;
    v_.z += v_.x * v_.y;
    return v_;
}

/// 4D integer hash, four decorrelated outputs (0 BigCrush failures in the JCGT study).
/// @use (pixel.x, pixel.y, frame, sample) streams for stochastic sampling, 4D cell ids
/// @see Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020
fn pcg4d(v: vec4u) -> vec4u {
    var v_ = v * 1664525u + 1013904223u;
    v_.x += v_.y * v_.w;
    v_.y += v_.z * v_.x;
    v_.z += v_.x * v_.y;
    v_.w += v_.y * v_.z;
    v_ ^= v_ >> vec4u(16u);
    v_.x += v_.y * v_.w;
    v_.y += v_.z * v_.x;
    v_.z += v_.x * v_.y;
    v_.w += v_.y * v_.z;
    return v_;
}

/// Map a uint to [0,1) using the top 24 bits, so the result can never round up to 1.0.
fn uintToUnit_u(h: u32) -> f32 { return f32(h >> 8u) * (1.0 / 16777216.0); }
fn uintToUnit_u2(h: vec2u) -> vec2f { return vec2f(h >> vec2u(8u)) * (1.0 / 16777216.0); }
fn uintToUnit_u3(h: vec3u) -> vec3f { return vec3f(h >> vec3u(8u)) * (1.0 / 16777216.0); }
fn uintToUnit_u4(h: vec4u) -> vec4f { return vec4f(h >> vec4u(8u)) * (1.0 / 16777216.0); }

/// Random float in [0,1) for an integer-valued input.
/// @use per-cell randomness, stable random per instance id
/// @range [0,1)
fn hash11(p: f32) -> f32 { return uintToUnit_u(pcgHash(u32(i32(floor(p))))); }

/// Random float in [0,1) for an integer-valued 2D input.
/// @use per-cell variation (color, height, rotation), sparse spots, star fields
/// @range [0,1)
fn hash12(p: vec2f) -> f32 {
    let q = vec2u(vec2i(floor(p)));
    return uintToUnit_u(pcgHash(q.x + pcgHash(q.y)));
}

/// Random float in [0,1) for an integer-valued 3D input.
/// @use per-voxel randomness, per-pixel-per-frame noise via hash13(vec3f(position.xy, f32(frame)))
/// @range [0,1)
fn hash13(p: vec3f) -> f32 {
    let q = vec3u(vec3i(floor(p)));
    return uintToUnit_u(pcgHash(q.x + pcgHash(q.y + pcgHash(q.z))));
}

/// Random vec2 in [0,1)^2 for an integer-valued 2D input.
/// @use Voronoi feature points, 2D jitter, random gradients
/// @range [0,1)^2
fn hash22(p: vec2f) -> vec2f {
    let q = vec2i(floor(p));
    return uintToUnit_u3(pcg3d(vec3u(u32(q.x), u32(q.y), 0x2545u))).xy;
}

/// Random vec3 in [0,1)^3 for an integer-valued 3D input.
/// @use 3D Voronoi points, random colors per cell, random directions
/// @range [0,1)^3
fn hash33(p: vec3f) -> vec3f { return uintToUnit_u3(pcg3d(vec3u(vec3i(floor(p))))); }

/// Random vec4 in [0,1)^4 for an integer-valued 4D input.
/// @use per-pixel, per-frame, per-sample random numbers: hash44(vec4f(position.xy, f32(frame), f32(sampleIndex)))
/// @range [0,1)^4
fn hash44(p: vec4f) -> vec4f { return uintToUnit_u4(pcg4d(vec4u(vec4i(floor(p))))); }

/// Random vec3 in [0,1)^3 for an integer-valued 2D input.
/// @use per-tile random color, per-cell (offset, rotation, scale) triples
/// @range [0,1)^3
fn hash32(p: vec2f) -> vec3f {
    let q = vec2i(floor(p));
    return uintToUnit_u3(pcg3d(vec3u(u32(q.x), u32(q.y), 0x9E37u)));
}
`;

// src/knowledge/shader-craft/library/modules/intersect.ts
var INTERSECT_GLSL = `//! intersect: analytic ray-primitive intersections. Rays are ro + t * rd with unit rd.
//! Use them for bounding volumes (clip the raymarch range to where the scene can be), exact floors and water planes,
//! glass spheres and eyeballs, and cheap reflections.
//! Formulas follow Inigo Quilez's article on ray-surface intersectors.

/// Ray vs plane dot(p, n) + h = 0 (unit n). Returns t, which is negative when the plane is behind the ray or parallel to it.
/// @use floors, water, mirrors, clipping marches to a ground plane
float iPlane(vec3 ro, vec3 rd, vec3 n, float h) {
    float denom = dot(rd, n);
    if (abs(denom) < 1e-8) return -1.0;
    return -(dot(ro, n) + h) / denom;
}

/// Ray vs sphere centered at c with radius r. Returns vec2(tNear, tFar), or vec2(-1) on a miss.
/// Uses the precision-friendly form that measures from the closest point on the ray.
/// @use bounding spheres, glass balls, eyeballs, planets, bubbles
vec2 iSphere(vec3 ro, vec3 rd, vec3 c, float r) {
    vec3 oc = ro - c;
    float b = dot(oc, rd);
    vec3 qc = oc - b * rd;
    float h = r * r - dot(qc, qc);
    if (h < 0.0) return vec2(-1.0);
    h = sqrt(h);
    return vec2(-b - h, -b + h);
}

/// Ray vs axis-aligned box centered at the origin with half-extents b (slab method).
/// Returns vec2(tNear, tFar), or vec2(-1) on a miss. Works when the ray starts inside (tNear < 0 < tFar).
/// An rd component of exactly 0 makes that axis's slab distances NaN (inf - inf or 0 * inf), which GLSL min and max
/// leave undefined, so the result depends on the GPU; keep rd components nonzero.
/// @use bounding boxes for raymarching, glass cubes, rooms
vec2 iBox(vec3 ro, vec3 rd, vec3 b) {
    vec3 m = 1.0 / rd;
    vec3 n = m * ro;
    vec3 k = abs(m) * b;
    vec3 t1 = -n - k;
    vec3 t2 = -n + k;
    float tN = max(max(t1.x, t1.y), t1.z);
    float tF = min(min(t2.x, t2.y), t2.z);
    if (tN > tF || tF < 0.0) return vec2(-1.0);
    return vec2(tN, tF);
}
`;
var INTERSECT_WGSL = `//! intersect: analytic ray-primitive intersections. Rays are ro + t * rd with unit rd.
//! Use them for bounding volumes (clip the raymarch range to where the scene can be), exact floors and water planes,
//! glass spheres and eyeballs, and cheap reflections.
//! Formulas follow Inigo Quilez's article on ray-surface intersectors.

/// Ray vs plane dot(p, n) + h = 0 (unit n). Returns t, which is negative when the plane is behind the ray or parallel to it.
/// @use floors, water, mirrors, clipping marches to a ground plane
fn iPlane(ro: vec3f, rd: vec3f, n: vec3f, h: f32) -> f32 {
    let denom = dot(rd, n);
    if (abs(denom) < 1e-8) { return -1.0; }
    return -(dot(ro, n) + h) / denom;
}

/// Ray vs sphere centered at c with radius r. Returns vec2f(tNear, tFar), or vec2f(-1) on a miss.
/// Uses the precision-friendly form that measures from the closest point on the ray.
/// @use bounding spheres, glass balls, eyeballs, planets, bubbles
fn iSphere(ro: vec3f, rd: vec3f, c: vec3f, r: f32) -> vec2f {
    let oc = ro - c;
    let b = dot(oc, rd);
    let qc = oc - b * rd;
    var h = r * r - dot(qc, qc);
    if (h < 0.0) { return vec2f(-1.0); }
    h = sqrt(h);
    return vec2f(-b - h, -b + h);
}

/// Ray vs axis-aligned box centered at the origin with half-extents b (slab method).
/// Returns vec2f(tNear, tFar), or vec2f(-1) on a miss. Works when the ray starts inside (tNear < 0 < tFar).
/// An rd component of exactly 0 makes that axis's slab distances NaN (inf - inf or 0 * inf), which GLSL min and max
/// leave undefined, so the result depends on the GPU; keep rd components nonzero.
/// @use bounding boxes for raymarching, glass cubes, rooms
fn iBox(ro: vec3f, rd: vec3f, b: vec3f) -> vec2f {
    let m = 1.0 / rd;
    let n = m * ro;
    let k = abs(m) * b;
    let t1 = -n - k;
    let t2 = -n + k;
    let tN = max(max(t1.x, t1.y), t1.z);
    let tF = min(min(t2.x, t2.y), t2.z);
    if (tN > tF || tF < 0.0) { return vec2f(-1.0); }
    return vec2f(tN, tF);
}
`;

// src/knowledge/shader-craft/library/modules/noise.ts
var NOISE_GLSL = `//! noise: value, gradient and simplex noise (2D/3D, analytic derivatives), fBm, turbulence and billow, domain warping,
//! curl flow, Voronoi, dithering.
//! Every function here is texture-free and original. The math follows the cited articles.
//! Ranges are approximate unless stated. Noise built on integer hashes stays stable at large coordinates
//! until float precision runs out (|p| around 1e5). An effect's time is already a 0..1 loop phase; animate by moving
//! through noise on a circle in time, which also loops.

/// Quintic fade 6t^5 - 15t^4 + 10t^3: C2-continuous interpolation weights for lattice noise.
/// @use custom lattice noises, smooth cell interpolation
vec2 quinticFade(vec2 f) { return f * f * f * (f * (f * 6.0 - 15.0) + 10.0); }
vec3 quinticFade(vec3 f) { return f * f * f * (f * (f * 6.0 - 15.0) + 10.0); }

/// Derivative of quinticFade: 30 t^2 (t - 1)^2.
/// @use analytic noise derivatives
vec2 quinticFadeDeriv(vec2 f) { return 30.0 * f * f * (f * (f - 2.0) + 1.0); }
vec3 quinticFadeDeriv(vec3 f) { return 30.0 * f * f * (f * (f - 2.0) + 1.0); }

/// 2D value noise with analytic derivatives. Returns vec3(value, d/dx, d/dy).
/// @use terrain base layers, cheap clouds, anything needing normals without finite differences
/// @range value in [0,1]
/// @see Inigo Quilez, noise derivatives
vec3 valueNoiseD(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = quinticFade(f), du = quinticFadeDeriv(f);
    float a = hash12(i);
    float b = hash12(i + vec2(1.0, 0.0));
    float c = hash12(i + vec2(0.0, 1.0));
    float d = hash12(i + vec2(1.0, 1.0));
    float k1 = b - a, k2 = c - a, k3 = a - b - c + d;
    return vec3(a + k1 * u.x + k2 * u.y + k3 * u.x * u.y,
                du * vec2(k1 + k3 * u.y, k2 + k3 * u.x));
}

/// 2D value noise.
/// @use soft blotches, low-frequency color variation
/// @range [0,1]
float valueNoise(vec2 p) { return valueNoiseD(p).x; }

/// 3D value noise.
/// @use volumetric density, animated 2D noise (use z = time)
/// @range [0,1]
float valueNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    vec3 u = quinticFade(f);
    return mix(mix(mix(hash13(i + vec3(0, 0, 0)), hash13(i + vec3(1, 0, 0)), u.x),
                   mix(hash13(i + vec3(0, 1, 0)), hash13(i + vec3(1, 1, 0)), u.x), u.y),
               mix(mix(hash13(i + vec3(0, 0, 1)), hash13(i + vec3(1, 0, 1)), u.x),
                   mix(hash13(i + vec3(0, 1, 1)), hash13(i + vec3(1, 1, 1)), u.x), u.y), u.z);
}

/// Unit gradient for a 2D lattice point.
vec2 latticeGradient(vec2 cell) {
    float a = TAU * hash12(cell);
    return vec2(cos(a), sin(a));
}

/// 2D gradient (Perlin-style) noise with analytic derivatives. Returns vec3(value, d/dx, d/dy).
/// Gradient noise has less grid-aligned blockiness than value noise. Prefer it for fBm.
/// @use fBm, terrain with analytic normals, curl flow, marble and wood distortions
/// @range value in about [-0.7,0.7]
/// @see Inigo Quilez, gradient noise derivatives
vec3 gradientNoiseD(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = quinticFade(f), du = quinticFadeDeriv(f);
    vec2 ga = latticeGradient(i);
    vec2 gb = latticeGradient(i + vec2(1.0, 0.0));
    vec2 gc = latticeGradient(i + vec2(0.0, 1.0));
    vec2 gd = latticeGradient(i + vec2(1.0, 1.0));
    float va = dot(ga, f);
    float vb = dot(gb, f - vec2(1.0, 0.0));
    float vc = dot(gc, f - vec2(0.0, 1.0));
    float vd = dot(gd, f - vec2(1.0, 1.0));
    float k = va - vb - vc + vd;
    float value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
    vec2 deriv = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd)
               + du * (vec2(vb - va, vc - va) + u.yx * k);
    return vec3(value, deriv);
}

/// 2D gradient noise.
/// @use general-purpose smooth noise
/// @range about [-0.7,0.7]
float gradientNoise(vec2 p) { return gradientNoiseD(p).x; }

/// 2D simplex noise with analytic gradient. Returns vec3(value, d/dx, d/dy).
/// Sums three radial kernels (0.5 - r^2)^4 on a triangular lattice instead of blending four square-cell corners, so it
/// has fewer axis-aligned artifacts than gradientNoise. rotation (radians) spins every lattice gradient: animating it
/// gives flow noise that churns in place instead of sliding (Perlin and Neyret 2001). Scaled so |value| <= 1 exactly.
/// @use flowing water and lava (animate rotation), ripples with analytic normals, isotropic fBm, swirling fields
/// @range value in [-1,1]
/// @see Gustavson, "Simplex noise demystified" (2005); Gustavson and McEwan, JCGT 11(1), 2022 (psrdnoise)
vec3 simplexNoiseD(vec2 p, float rotation) {
    const float SKEW = 0.36602540378;     // (sqrt(3) - 1) / 2: square lattice -> triangle lattice
    const float UNSKEW = 0.21132486541;   // (3 - sqrt(3)) / 6
    vec2 cell = floor(p + (p.x + p.y) * SKEW);
    vec2 d0 = p - cell + (cell.x + cell.y) * UNSKEW;
    vec2 o = (d0.x > d0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);   // which of the cell's two triangles holds p
    vec2 corners[3] = vec2[3](cell, cell + o, cell + 1.0);
    vec2 offsets[3] = vec2[3](d0, d0 - o + UNSKEW, d0 - 1.0 + 2.0 * UNSKEW);
    mat2 spin = rot2(rotation);
    vec3 sum = vec3(0.0);
    for (int k = 0; k < 3; k++) {
        vec2 d = offsets[k];
        float t = max(0.5 - dot(d, d), 0.0);
        vec2 g = spin * latticeGradient(corners[k]);
        float gd = dot(g, d);
        float t3 = t * t * t;
        // value t^4 (g.d); gradient t^4 g - 8 t^3 (g.d) d
        sum += vec3(t3 * t * gd, t3 * t * g - 8.0 * t3 * gd * d);
    }
    return 99.2 * sum;   // 1 / max over the simplex of sum t^4 |d|
}
vec3 simplexNoiseD(vec2 p) { return simplexNoiseD(p, 0.0); }

/// 2D simplex noise.
/// @use isotropic smooth noise, fBm layers without grid alignment
/// @range [-1,1]
float simplexNoise(vec2 p) { return simplexNoiseD(p, 0.0).x; }

/// Dot product of a hashed 3D gradient with the offset to its lattice corner.
float latticeGradDot(vec3 cell, vec3 corner, vec3 f) {
    vec3 g = hash33(cell + corner) * 2.0 - 1.0;
    return dot(g, f - corner);
}

/// 3D gradient noise.
/// @use clouds, smoke, solid textures (marble, wood), animated 2D noise (z = time)
/// @range about [-1,1]
/// @see Inigo Quilez, gradient noise derivatives
float gradientNoise(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    vec3 u = quinticFade(f);
    return mix(mix(mix(latticeGradDot(i, vec3(0, 0, 0), f), latticeGradDot(i, vec3(1, 0, 0), f), u.x),
                   mix(latticeGradDot(i, vec3(0, 1, 0), f), latticeGradDot(i, vec3(1, 1, 0), f), u.x), u.y),
               mix(mix(latticeGradDot(i, vec3(0, 0, 1), f), latticeGradDot(i, vec3(1, 0, 1), f), u.x),
                   mix(latticeGradDot(i, vec3(0, 1, 1), f), latticeGradDot(i, vec3(1, 1, 1), f), u.x), u.y), u.z);
}

/// 3D gradient noise with analytic derivatives. Returns vec4(value, d/dx, d/dy, d/dz); value equals gradientNoise(p).
/// The trilinear blend is expanded as a polynomial in the fade weights, so the gradient is the same blend of the corner
/// gradients plus the chain-rule term of the fade.
/// @use normals of noise-displaced surfaces without extra samples, 3D curl flow, slope-aware 3D fBm, lit nebulae
/// @range value in about [-1,1]
/// @see Inigo Quilez, gradient noise derivatives
vec4 gradientNoiseD(vec3 p) {
    vec3 i = floor(p), f = fract(p);
    vec3 u = quinticFade(f), du = quinticFadeDeriv(f);
    vec3 g000 = hash33(i) * 2.0 - 1.0;
    vec3 g100 = hash33(i + vec3(1, 0, 0)) * 2.0 - 1.0;
    vec3 g010 = hash33(i + vec3(0, 1, 0)) * 2.0 - 1.0;
    vec3 g110 = hash33(i + vec3(1, 1, 0)) * 2.0 - 1.0;
    vec3 g001 = hash33(i + vec3(0, 0, 1)) * 2.0 - 1.0;
    vec3 g101 = hash33(i + vec3(1, 0, 1)) * 2.0 - 1.0;
    vec3 g011 = hash33(i + vec3(0, 1, 1)) * 2.0 - 1.0;
    vec3 g111 = hash33(i + vec3(1, 1, 1)) * 2.0 - 1.0;
    float v000 = dot(g000, f);
    float v100 = dot(g100, f - vec3(1, 0, 0));
    float v010 = dot(g010, f - vec3(0, 1, 0));
    float v110 = dot(g110, f - vec3(1, 1, 0));
    float v001 = dot(g001, f - vec3(0, 0, 1));
    float v101 = dot(g101, f - vec3(1, 0, 1));
    float v011 = dot(g011, f - vec3(0, 1, 1));
    float v111 = dot(g111, f - vec3(1, 1, 1));
    // value = v000 + kx u.x + ky u.y + kz u.z + kxy u.x u.y + kyz u.y u.z + kzx u.z u.x + kxyz u.x u.y u.z
    float kx = v100 - v000, ky = v010 - v000, kz = v001 - v000;
    float kxy = v000 - v100 - v010 + v110;
    float kyz = v000 - v010 - v001 + v011;
    float kzx = v000 - v100 - v001 + v101;
    float kxyz = -v000 + v100 + v010 - v110 + v001 - v101 - v011 + v111;
    float value = v000 + kx * u.x + ky * u.y + kz * u.z
                + kxy * u.x * u.y + kyz * u.y * u.z + kzx * u.z * u.x + kxyz * u.x * u.y * u.z;
    vec3 grad = g000 + (g100 - g000) * u.x + (g010 - g000) * u.y + (g001 - g000) * u.z
              + (g000 - g100 - g010 + g110) * u.x * u.y
              + (g000 - g010 - g001 + g011) * u.y * u.z
              + (g000 - g100 - g001 + g101) * u.z * u.x
              + (-g000 + g100 + g010 - g110 + g001 - g101 - g011 + g111) * u.x * u.y * u.z
              + du * vec3(kx + kxy * u.y + kzx * u.z + kxyz * u.y * u.z,
                          ky + kxy * u.x + kyz * u.z + kxyz * u.x * u.z,
                          kz + kyz * u.y + kzx * u.x + kxyz * u.x * u.y);
    return vec4(value, grad);
}

const int FBM_MAX_OCTAVES = 12;

/// Fractional Brownian motion over 2D gradient noise. Each octave is rotated to hide lattice alignment.
/// persistence 0.5 is the classic look (H = 1). Lower is smoother, higher is rougher.
/// @use clouds, terrain, dirt, roughness breakup, warping input
/// @range about [-1,1]
/// @see Inigo Quilez, fBm
float fbm(vec2 p, int octaves, float lacunarity, float persistence) {
    const mat2 octaveRotation = mat2(0.8, 0.6, -0.6, 0.8);
    float sum = 0.0, amp = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        sum += amp * gradientNoise(p);
        norm += amp;
        amp *= persistence;
        p = lacunarity * (octaveRotation * p) + vec2(17.13, -3.71);
    }
    return 1.4 * sum / norm;
}

/// 2D fBm with the usual defaults (lacunarity 2.01 so octave peaks never re-align, persistence 0.5).
/// @use quick organic variation
/// @range about [-1,1]
float fbm(vec2 p, int octaves) { return fbm(p, octaves, 2.01, 0.5); }

/// fBm over 3D gradient noise.
/// @use clouds, smoke, nebulae, solid marble
/// @range about [-1,1]
float fbm(vec3 p, int octaves, float lacunarity, float persistence) {
    const mat3 octaveRotation = mat3(0.00, 0.80, 0.60,
                                     -0.80, 0.36, -0.48,
                                     -0.60, -0.48, 0.64);
    float sum = 0.0, amp = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        sum += amp * gradientNoise(p);
        norm += amp;
        amp *= persistence;
        p = lacunarity * (octaveRotation * p) + vec3(17.13, -3.71, 5.29);
    }
    return sum / norm;
}

/// Terrain fBm where each octave is damped by the accumulated slope, so detail settles in valleys
/// and steep slopes stay smooth. This gives an eroded look without simulation.
/// @use mountains, dunes, rocky ground
/// @range about [-0.5,1]
/// @see Inigo Quilez, noise derivatives
float erodedFbm(vec2 p, int octaves) {
    const mat2 octaveRotation = mat2(0.8, 0.6, -0.6, 0.8);
    float h = 0.0, amp = 0.5;
    vec2 slope = vec2(0.0);
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        vec3 n = gradientNoiseD(p);
        slope += n.yz;
        h += amp * n.x / (1.0 + dot(slope, slope));
        amp *= 0.5;
        p = 2.0 * (octaveRotation * p);
    }
    return 2.0 * h;
}

/// Ridged multifractal: inverted |noise| creates sharp crests; each octave is weighted by the previous one,
/// so detail gathers along ridges.
/// @use mountain ridges, lightning-like veins, canyons, eroded rock, alien landscapes
/// @range about [0,1]
float ridgedFbm(vec2 p, int octaves) {
    const mat2 octaveRotation = mat2(0.8, 0.6, -0.6, 0.8);
    float sum = 0.0, amp = 0.5, weight = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        float n = 1.0 - abs(gradientNoise(p) * 1.4);
        n *= n;
        sum += amp * n * weight;
        norm += amp;
        weight = clamp(n * 2.0, 0.0, 1.0);
        amp *= 0.5;
        p = 2.01 * (octaveRotation * p) + vec2(17.13, -3.71);
    }
    return sum / norm;
}

/// Perlin's turbulence: fBm of |noise|. The absolute value folds every zero crossing into a sharp crease, at every scale.
/// @use fire, marble veins (sin(x + k * turbulence)), smoke wisps, electric glow, lava cracks, wind-torn clouds
/// @range [0,1]
/// @see Perlin, "An Image Synthesizer", SIGGRAPH 1985
float turbulence(vec2 p, int octaves) {
    const mat2 octaveRotation = mat2(0.8, 0.6, -0.6, 0.8);
    float sum = 0.0, amp = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        sum += amp * abs(gradientNoise(p));
        norm += amp;
        amp *= 0.5;
        p = 2.01 * (octaveRotation * p) + vec2(17.13, -3.71);
    }
    return 1.4 * sum / norm;   // |2D gradient noise| <= sqrt(2)/2
}
float turbulence(vec3 p, int octaves) {
    const mat3 octaveRotation = mat3(0.00, 0.80, 0.60,
                                     -0.80, 0.36, -0.48,
                                     -0.60, -0.48, 0.64);
    float sum = 0.0, amp = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        sum += amp * min(abs(gradientNoise(p)), 1.0);
        norm += amp;
        amp *= 0.5;
        p = 2.01 * (octaveRotation * p) + vec3(17.13, -3.71, 5.29);
    }
    return sum / norm;
}

/// Billowy multifractal: |noise| per octave makes puffy rounded lobes split by sharp creases (the inverse of ridgedFbm).
/// Each octave is weighted by the previous one, so detail gathers on the lobes while the creases stay clean.
/// @use cumulus and cauliflower tops, puffy smoke, foam clumps, rock piles, cotton, popcorn-like bumps
/// @range [0,1]
float billowFbm(vec2 p, int octaves) {
    const mat2 octaveRotation = mat2(0.8, 0.6, -0.6, 0.8);
    float sum = 0.0, amp = 0.5, weight = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        float n = abs(gradientNoise(p) * 1.4);
        n = n * (2.0 - n);   // round the lobe tops, keep the creases sharp
        sum += amp * n * weight;
        norm += amp;
        weight = clamp(n * 1.5, 0.0, 1.0);
        amp *= 0.5;
        p = 2.01 * (octaveRotation * p) + vec2(17.13, -3.71);
    }
    return sum / norm;
}
float billowFbm(vec3 p, int octaves) {
    const mat3 octaveRotation = mat3(0.00, 0.80, 0.60,
                                     -0.80, 0.36, -0.48,
                                     -0.60, -0.48, 0.64);
    float sum = 0.0, amp = 0.5, weight = 1.0, norm = 0.0;
    for (int i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) break;
        float n = min(abs(gradientNoise(p)) * 1.4, 1.0);
        n = n * (2.0 - n);
        sum += amp * n * weight;
        norm += amp;
        weight = clamp(n * 1.5, 0.0, 1.0);
        amp *= 0.5;
        p = 2.01 * (octaveRotation * p) + vec3(17.13, -3.71, 5.29);
    }
    return sum / norm;
}

/// Two-level domain warp f(p + s*r), r = fbm(p + s*q), q = fbm(p). Writes the intermediate warp
/// vectors so they can drive color. Cost is 5 fBm calls.
/// @use marble, smoke, agate, alien skies, painterly backgrounds
/// @range about [-1,1]
/// @see Inigo Quilez, domain warping
float warpedFbm(vec2 p, float strength, int octaves, out vec2 q, out vec2 r) {
    q = vec2(fbm(p, octaves), fbm(p + vec2(3.1, 7.4), octaves));
    r = vec2(fbm(p + strength * q + vec2(9.7, 2.6), octaves),
             fbm(p + strength * q + vec2(6.3, 1.9), octaves));
    return fbm(p + strength * r, octaves);
}

/// Divergence-free 2D flow field: the curl of scalar gradient noise.
/// Particles advected by it swirl without bunching up.
/// @use smoke advection, flowing paint, hair/fur flow direction, wind
vec2 curlNoise(vec2 p) {
    vec3 n = gradientNoiseD(p);
    return vec2(n.z, -n.y);
}

/// Divergence-free 3D flow field: the curl of a vector potential whose components are three decorrelated
/// gradientNoiseD fields. Analytic, so it costs three noise evaluations and no finite differences.
/// @use smoke and fire advection, swirling particles and sparks, wisps, 3D flow-aligned strokes, magic trails
/// @see Bridson, Hourihan and Nordenstam, "Curl-Noise for Procedural Fluid Flow", SIGGRAPH 2007
vec3 curlNoise(vec3 p) {
    vec3 a = gradientNoiseD(p).yzw;                                   // grad of potential.x
    vec3 b = gradientNoiseD(p + vec3(31.416, -47.853, 12.793)).yzw;   // grad of potential.y
    vec3 c = gradientNoiseD(p + vec3(-23.719, 18.274, -56.183)).yzw;  // grad of potential.z
    return vec3(c.y - b.z, a.z - c.x, b.x - a.y);
}

/// Cellular (Worley/Voronoi) noise. Returns vec4(F1, F2, nearestCell.xy).
/// F1 = distance to nearest feature point, F2 = second nearest. nearestCell is integer-valued, so hash it for
/// per-cell randomness. jitter in [0,1] (0 = regular grid). Searches 3x3 cells. F2 can be slightly off at jitter 1.
/// @use cells, scales, stones, cracked mud (F2-F1), caustics, foam, sparkles
/// @range F1 in [0, ~1.2]
/// @see Inigo Quilez, Voronoi edges
vec4 voronoi(vec2 p, float jitter) {
    vec2 ip = floor(p), fp = fract(p);
    float f1 = 8.0, f2 = 8.0;
    vec2 nearest = vec2(0.0);
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 r = g + jitter * hash22(ip + g) - fp;
        float d = dot(r, r);
        if (d < f1) { f2 = f1; f1 = d; nearest = ip + g; }
        else if (d < f2) { f2 = d; }
    }
    return vec4(sqrt(f1), sqrt(f2), nearest);
}

/// Exact distance to Voronoi cell borders, found in two passes: nearest point, then nearest bisector.
/// Returns vec3(borderDistance, vectorToNearestPoint). Unlike F2-F1, the border distance is a true distance,
/// so lines have constant width.
/// @use cell walls, stained glass leading, cracked earth, giraffe and leaf-vein patterns, crackle glaze
/// @see Inigo Quilez, Voronoi edges
vec3 voronoiBorder(vec2 p, float jitter) {
    vec2 ip = floor(p), fp = fract(p);
    vec2 mg = vec2(0.0), mr = vec2(0.0);
    float md = 8.0;
    for (int j = -1; j <= 1; j++)
    for (int i = -1; i <= 1; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 r = g + jitter * hash22(ip + g) - fp;
        float d = dot(r, r);
        if (d < md) { md = d; mr = r; mg = g; }
    }
    md = 8.0;
    for (int j = -2; j <= 2; j++)
    for (int i = -2; i <= 2; i++) {
        vec2 g = mg + vec2(float(i), float(j));
        vec2 r = g + jitter * hash22(ip + g) - fp;
        if (dot2(mr - r) > 1e-5) {
            md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
        }
    }
    return vec3(md, mr);
}

/// Smooth Voronoi: a soft-min of distances to feature points. Cells become blobs with no creases.
/// k controls smoothness (large = sharper; around 8-32). Searches 5x5 cells so low k has no seams.
/// @use organic cell clusters, bubbles, lumpy surfaces, skin pores
/// @see Inigo Quilez, smooth Voronoi
float smoothVoronoi(vec2 p, float k) {
    vec2 ip = floor(p), fp = fract(p);
    float acc = 0.0;
    for (int j = -2; j <= 2; j++)
    for (int i = -2; i <= 2; i++) {
        vec2 g = vec2(float(i), float(j));
        vec2 r = g + hash22(ip + g) - fp;
        acc += exp2(-k * length(r));
    }
    return -log2(acc) / k;
}

/// Bounded hybrid terrain recipe: broad gradient fBm, warped ridged detail and cellular breakup.
/// This is an artistic composition, not Musgrave's named hybrid-multifractal algorithm. Coordinates are
/// warped before all three fields are sampled; octaves is clamped to [1, FBM_MAX_OCTAVES].
/// @use game heightmaps, rocky islands, biome elevation masks, alien terrain
/// @range [0,1]
/// @see Gonzalez Vivo and Lowe, The Book of Shaders, chapters 13 (octaves, ridges and warping) and 12 (cells)
float hybridTerrainHeight(vec2 p, int octaves) {
    int count = clamp(octaves, 1, FBM_MAX_OCTAVES);
    vec2 warp = vec2(fbm(p * 0.35, count), fbm(p * 0.35 + vec2(19.1, -7.3), count));
    vec2 q = p + 0.8 * warp;
    float broad = 0.5 + 0.5 * fbm(q * 0.45, count);
    float ridges = ridgedFbm(q * 1.7, count);
    float cells = 1.0 - clamp(voronoi(q * 2.5, 0.75).x, 0.0, 1.0);
    return clamp(0.45 * broad + 0.45 * ridges + 0.10 * cells, 0.0, 1.0);
}

/// Interleaved gradient noise: cheap per-pixel noise whose 3x3 neighborhoods are nearly stratified. Not a hash.
/// pixel must be integer pixel coordinates (floor(gl_FragCoord.xy)). The frame overload animates it for accumulation and TAA;
/// frame is non-negative, and the engine's frame never wraps, so a frame-seeded pattern does not loop.
/// @use removing banding before 8-bit output, jittering ray start offsets, stochastic transparency
/// @range [0,1)
/// @see Jimenez 2014, "Next Generation Post Processing in Call of Duty: Advanced Warfare"
float interleavedGradientNoise(vec2 pixel) {
    return fract(52.9829189 * fract(dot(pixel, vec2(0.06711056, 0.00583715))));
}
float interleavedGradientNoise(vec2 pixel, int frame) {
    return interleavedGradientNoise(pixel + 5.588238 * float(frame % 64));
}

/// R2 low-discrepancy dither mask (plastic-constant sequence), folded by a triangle wave for an even spread.
/// @use ordered dithering without textures, posterized and retro looks, sample offsets
/// @range [0,1)
/// @see Martin Roberts, "The Unreasonable Effectiveness of Quasirandom Sequences"
float r2Dither(vec2 pixel) {
    float v = fract(dot(pixel, vec2(0.7548776662, 0.5698402910)));
    return v < 0.5 ? 2.0 * v : 2.0 - 2.0 * v;
}
`;
var NOISE_WGSL = `//! noise: value, gradient and simplex noise (2D/3D, analytic derivatives), fBm, turbulence and billow, domain warping,
//! curl flow, Voronoi, dithering.
//! Every function here is texture-free and original. The math follows the cited articles.
//! Ranges are approximate unless stated. Noise built on integer hashes stays stable at large coordinates
//! until float precision runs out (|p| around 1e5). An effect's time is already a 0..1 loop phase; animate by moving
//! through noise on a circle in time, which also loops.

/// Quintic fade 6t^5 - 15t^4 + 10t^3: C2-continuous interpolation weights for lattice noise.
/// @use custom lattice noises, smooth cell interpolation
fn quinticFade_f2(f: vec2f) -> vec2f { return f * f * f * (f * (f * 6.0 - 15.0) + 10.0); }
fn quinticFade_f3(f: vec3f) -> vec3f { return f * f * f * (f * (f * 6.0 - 15.0) + 10.0); }

/// Derivative of quinticFade: 30 t^2 (t - 1)^2.
/// @use analytic noise derivatives
fn quinticFadeDeriv_f2(f: vec2f) -> vec2f { return 30.0 * f * f * (f * (f - 2.0) + 1.0); }
fn quinticFadeDeriv_f3(f: vec3f) -> vec3f { return 30.0 * f * f * (f * (f - 2.0) + 1.0); }

/// 2D value noise with analytic derivatives. Returns vec3f(value, d/dx, d/dy).
/// @use terrain base layers, cheap clouds, anything needing normals without finite differences
/// @range value in [0,1]
/// @see Inigo Quilez, noise derivatives
fn valueNoiseD(p: vec2f) -> vec3f {
    let i = floor(p);
    let f = fract(p);
    let u = quinticFade_f2(f);
    let du = quinticFadeDeriv_f2(f);
    let a = hash12(i);
    let b = hash12(i + vec2f(1.0, 0.0));
    let c = hash12(i + vec2f(0.0, 1.0));
    let d = hash12(i + vec2f(1.0, 1.0));
    let k1 = b - a;
    let k2 = c - a;
    let k3 = a - b - c + d;
    return vec3f(a + k1 * u.x + k2 * u.y + k3 * u.x * u.y,
                 du * vec2f(k1 + k3 * u.y, k2 + k3 * u.x));
}

/// 2D value noise.
/// @use soft blotches, low-frequency color variation
/// @range [0,1]
fn valueNoise_f2(p: vec2f) -> f32 { return valueNoiseD(p).x; }

/// 3D value noise.
/// @use volumetric density, animated 2D noise (use z = time)
/// @range [0,1]
fn valueNoise_f3(p: vec3f) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = quinticFade_f3(f);
    return mix(mix(mix(hash13(i + vec3f(0, 0, 0)), hash13(i + vec3f(1, 0, 0)), u.x),
                   mix(hash13(i + vec3f(0, 1, 0)), hash13(i + vec3f(1, 1, 0)), u.x), u.y),
               mix(mix(hash13(i + vec3f(0, 0, 1)), hash13(i + vec3f(1, 0, 1)), u.x),
                   mix(hash13(i + vec3f(0, 1, 1)), hash13(i + vec3f(1, 1, 1)), u.x), u.y), u.z);
}

/// Unit gradient for a 2D lattice point.
fn latticeGradient(cell: vec2f) -> vec2f {
    let a = TAU * hash12(cell);
    return vec2f(cos(a), sin(a));
}

/// 2D gradient (Perlin-style) noise with analytic derivatives. Returns vec3f(value, d/dx, d/dy).
/// Gradient noise has less grid-aligned blockiness than value noise. Prefer it for fBm.
/// @use fBm, terrain with analytic normals, curl flow, marble and wood distortions
/// @range value in about [-0.7,0.7]
/// @see Inigo Quilez, gradient noise derivatives
fn gradientNoiseD_f2(p: vec2f) -> vec3f {
    let i = floor(p);
    let f = fract(p);
    let u = quinticFade_f2(f);
    let du = quinticFadeDeriv_f2(f);
    let ga = latticeGradient(i);
    let gb = latticeGradient(i + vec2f(1.0, 0.0));
    let gc = latticeGradient(i + vec2f(0.0, 1.0));
    let gd = latticeGradient(i + vec2f(1.0, 1.0));
    let va = dot(ga, f);
    let vb = dot(gb, f - vec2f(1.0, 0.0));
    let vc = dot(gc, f - vec2f(0.0, 1.0));
    let vd = dot(gd, f - vec2f(1.0, 1.0));
    let k = va - vb - vc + vd;
    let value = va + u.x * (vb - va) + u.y * (vc - va) + u.x * u.y * k;
    let deriv = ga + u.x * (gb - ga) + u.y * (gc - ga) + u.x * u.y * (ga - gb - gc + gd)
              + du * (vec2f(vb - va, vc - va) + u.yx * k);
    return vec3f(value, deriv);
}

/// 2D gradient noise.
/// @use general-purpose smooth noise
/// @range about [-0.7,0.7]
fn gradientNoise_f2(p: vec2f) -> f32 { return gradientNoiseD_f2(p).x; }

/// 2D simplex noise with analytic gradient. Returns vec3f(value, d/dx, d/dy).
/// Sums three radial kernels (0.5 - r^2)^4 on a triangular lattice instead of blending four square-cell corners, so it
/// has fewer axis-aligned artifacts than gradientNoise. rotation (radians) spins every lattice gradient: animating it
/// gives flow noise that churns in place instead of sliding (Perlin and Neyret 2001). Scaled so |value| <= 1 exactly.
/// @use flowing water and lava (animate rotation), ripples with analytic normals, isotropic fBm, swirling fields
/// @range value in [-1,1]
/// @see Gustavson, "Simplex noise demystified" (2005); Gustavson and McEwan, JCGT 11(1), 2022 (psrdnoise)
fn simplexNoiseD_f2f(p: vec2f, rotation: f32) -> vec3f {
    const SKEW: f32 = 0.36602540378;     // (sqrt(3) - 1) / 2: square lattice -> triangle lattice
    const UNSKEW: f32 = 0.21132486541;   // (3 - sqrt(3)) / 6
    let cell = floor(p + (p.x + p.y) * SKEW);
    let d0 = p - cell + (cell.x + cell.y) * UNSKEW;
    let o = select(vec2f(0.0, 1.0), vec2f(1.0, 0.0), d0.x > d0.y);   // which of the cell's two triangles holds p
    var corners = array<vec2f, 3>(cell, cell + o, cell + 1.0);
    var offsets = array<vec2f, 3>(d0, d0 - o + UNSKEW, d0 - 1.0 + 2.0 * UNSKEW);
    let spin = rot2(rotation);
    var sum = vec3f(0.0);
    for (var k = 0; k < 3; k++) {
        let d = offsets[k];
        let t = max(0.5 - dot(d, d), 0.0);
        let g = spin * latticeGradient(corners[k]);
        let gd = dot(g, d);
        let t3 = t * t * t;
        // value t^4 (g.d); gradient t^4 g - 8 t^3 (g.d) d
        sum += vec3f(t3 * t * gd, t3 * t * g - 8.0 * t3 * gd * d);
    }
    return 99.2 * sum;   // 1 / max over the simplex of sum t^4 |d|
}
fn simplexNoiseD_f2(p: vec2f) -> vec3f { return simplexNoiseD_f2f(p, 0.0); }

/// 2D simplex noise.
/// @use isotropic smooth noise, fBm layers without grid alignment
/// @range [-1,1]
fn simplexNoise(p: vec2f) -> f32 { return simplexNoiseD_f2f(p, 0.0).x; }

/// Dot product of a hashed 3D gradient with the offset to its lattice corner.
fn latticeGradDot(cell: vec3f, corner: vec3f, f: vec3f) -> f32 {
    let g = hash33(cell + corner) * 2.0 - 1.0;
    return dot(g, f - corner);
}

/// 3D gradient noise.
/// @use clouds, smoke, solid textures (marble, wood), animated 2D noise (z = time)
/// @range about [-1,1]
/// @see Inigo Quilez, gradient noise derivatives
fn gradientNoise_f3(p: vec3f) -> f32 {
    let i = floor(p);
    let f = fract(p);
    let u = quinticFade_f3(f);
    return mix(mix(mix(latticeGradDot(i, vec3f(0, 0, 0), f), latticeGradDot(i, vec3f(1, 0, 0), f), u.x),
                   mix(latticeGradDot(i, vec3f(0, 1, 0), f), latticeGradDot(i, vec3f(1, 1, 0), f), u.x), u.y),
               mix(mix(latticeGradDot(i, vec3f(0, 0, 1), f), latticeGradDot(i, vec3f(1, 0, 1), f), u.x),
                   mix(latticeGradDot(i, vec3f(0, 1, 1), f), latticeGradDot(i, vec3f(1, 1, 1), f), u.x), u.y), u.z);
}

/// 3D gradient noise with analytic derivatives. Returns vec4f(value, d/dx, d/dy, d/dz); value equals gradientNoise(p).
/// The trilinear blend is expanded as a polynomial in the fade weights, so the gradient is the same blend of the corner
/// gradients plus the chain-rule term of the fade.
/// @use normals of noise-displaced surfaces without extra samples, 3D curl flow, slope-aware 3D fBm, lit nebulae
/// @range value in about [-1,1]
/// @see Inigo Quilez, gradient noise derivatives
fn gradientNoiseD_f3(p: vec3f) -> vec4f {
    let i = floor(p);
    let f = fract(p);
    let u = quinticFade_f3(f);
    let du = quinticFadeDeriv_f3(f);
    let g000 = hash33(i) * 2.0 - 1.0;
    let g100 = hash33(i + vec3f(1, 0, 0)) * 2.0 - 1.0;
    let g010 = hash33(i + vec3f(0, 1, 0)) * 2.0 - 1.0;
    let g110 = hash33(i + vec3f(1, 1, 0)) * 2.0 - 1.0;
    let g001 = hash33(i + vec3f(0, 0, 1)) * 2.0 - 1.0;
    let g101 = hash33(i + vec3f(1, 0, 1)) * 2.0 - 1.0;
    let g011 = hash33(i + vec3f(0, 1, 1)) * 2.0 - 1.0;
    let g111 = hash33(i + vec3f(1, 1, 1)) * 2.0 - 1.0;
    let v000 = dot(g000, f);
    let v100 = dot(g100, f - vec3f(1, 0, 0));
    let v010 = dot(g010, f - vec3f(0, 1, 0));
    let v110 = dot(g110, f - vec3f(1, 1, 0));
    let v001 = dot(g001, f - vec3f(0, 0, 1));
    let v101 = dot(g101, f - vec3f(1, 0, 1));
    let v011 = dot(g011, f - vec3f(0, 1, 1));
    let v111 = dot(g111, f - vec3f(1, 1, 1));
    // value = v000 + kx u.x + ky u.y + kz u.z + kxy u.x u.y + kyz u.y u.z + kzx u.z u.x + kxyz u.x u.y u.z
    let kx = v100 - v000;
    let ky = v010 - v000;
    let kz = v001 - v000;
    let kxy = v000 - v100 - v010 + v110;
    let kyz = v000 - v010 - v001 + v011;
    let kzx = v000 - v100 - v001 + v101;
    let kxyz = -v000 + v100 + v010 - v110 + v001 - v101 - v011 + v111;
    let value = v000 + kx * u.x + ky * u.y + kz * u.z
              + kxy * u.x * u.y + kyz * u.y * u.z + kzx * u.z * u.x + kxyz * u.x * u.y * u.z;
    let grad = g000 + (g100 - g000) * u.x + (g010 - g000) * u.y + (g001 - g000) * u.z
             + (g000 - g100 - g010 + g110) * u.x * u.y
             + (g000 - g010 - g001 + g011) * u.y * u.z
             + (g000 - g100 - g001 + g101) * u.z * u.x
             + (-g000 + g100 + g010 - g110 + g001 - g101 - g011 + g111) * u.x * u.y * u.z
             + du * vec3f(kx + kxy * u.y + kzx * u.z + kxyz * u.y * u.z,
                          ky + kxy * u.x + kyz * u.z + kxyz * u.x * u.z,
                          kz + kyz * u.y + kzx * u.x + kxyz * u.x * u.y);
    return vec4f(value, grad);
}

const FBM_MAX_OCTAVES: i32 = 12;

/// Fractional Brownian motion over 2D gradient noise. Each octave is rotated to hide lattice alignment.
/// persistence 0.5 is the classic look (H = 1). Lower is smoother, higher is rougher.
/// @use clouds, terrain, dirt, roughness breakup, warping input
/// @range about [-1,1]
/// @see Inigo Quilez, fBm
fn fbm_f2iff(p: vec2f, octaves: i32, lacunarity: f32, persistence: f32) -> f32 {
    const octaveRotation = mat2x2f(0.8, 0.6, -0.6, 0.8);
    var p_ = p;
    var sum = 0.0;
    var amp = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        sum += amp * gradientNoise_f2(p_);
        norm += amp;
        amp *= persistence;
        p_ = lacunarity * (octaveRotation * p_) + vec2f(17.13, -3.71);
    }
    return 1.4 * sum / norm;
}

/// 2D fBm with the usual defaults (lacunarity 2.01 so octave peaks never re-align, persistence 0.5).
/// @use quick organic variation
/// @range about [-1,1]
fn fbm_f2i(p: vec2f, octaves: i32) -> f32 { return fbm_f2iff(p, octaves, 2.01, 0.5); }

/// fBm over 3D gradient noise.
/// @use clouds, smoke, nebulae, solid marble
/// @range about [-1,1]
fn fbm_f3iff(p: vec3f, octaves: i32, lacunarity: f32, persistence: f32) -> f32 {
    const octaveRotation = mat3x3f(0.00, 0.80, 0.60,
                                   -0.80, 0.36, -0.48,
                                   -0.60, -0.48, 0.64);
    var p_ = p;
    var sum = 0.0;
    var amp = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        sum += amp * gradientNoise_f3(p_);
        norm += amp;
        amp *= persistence;
        p_ = lacunarity * (octaveRotation * p_) + vec3f(17.13, -3.71, 5.29);
    }
    return sum / norm;
}

/// Terrain fBm where each octave is damped by the accumulated slope, so detail settles in valleys
/// and steep slopes stay smooth. This gives an eroded look without simulation.
/// @use mountains, dunes, rocky ground
/// @range about [-0.5,1]
/// @see Inigo Quilez, noise derivatives
fn erodedFbm(p: vec2f, octaves: i32) -> f32 {
    const octaveRotation = mat2x2f(0.8, 0.6, -0.6, 0.8);
    var p_ = p;
    var h = 0.0;
    var amp = 0.5;
    var slope = vec2f(0.0);
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        let n = gradientNoiseD_f2(p_);
        slope += n.yz;
        h += amp * n.x / (1.0 + dot(slope, slope));
        amp *= 0.5;
        p_ = 2.0 * (octaveRotation * p_);
    }
    return 2.0 * h;
}

/// Ridged multifractal: inverted |noise| creates sharp crests; each octave is weighted by the previous one,
/// so detail gathers along ridges.
/// @use mountain ridges, lightning-like veins, canyons, eroded rock, alien landscapes
/// @range about [0,1]
fn ridgedFbm(p: vec2f, octaves: i32) -> f32 {
    const octaveRotation = mat2x2f(0.8, 0.6, -0.6, 0.8);
    var p_ = p;
    var sum = 0.0;
    var amp = 0.5;
    var weight = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        var n = 1.0 - abs(gradientNoise_f2(p_) * 1.4);
        n *= n;
        sum += amp * n * weight;
        norm += amp;
        weight = clamp(n * 2.0, 0.0, 1.0);
        amp *= 0.5;
        p_ = 2.01 * (octaveRotation * p_) + vec2f(17.13, -3.71);
    }
    return sum / norm;
}

/// Perlin's turbulence: fBm of |noise|. The absolute value folds every zero crossing into a sharp crease, at every scale.
/// @use fire, marble veins (sin(x + k * turbulence)), smoke wisps, electric glow, lava cracks, wind-torn clouds
/// @range [0,1]
/// @see Perlin, "An Image Synthesizer", SIGGRAPH 1985
fn turbulence_f2i(p: vec2f, octaves: i32) -> f32 {
    const octaveRotation = mat2x2f(0.8, 0.6, -0.6, 0.8);
    var p_ = p;
    var sum = 0.0;
    var amp = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        sum += amp * abs(gradientNoise_f2(p_));
        norm += amp;
        amp *= 0.5;
        p_ = 2.01 * (octaveRotation * p_) + vec2f(17.13, -3.71);
    }
    return 1.4 * sum / norm;   // |2D gradient noise| <= sqrt(2)/2
}
fn turbulence_f3i(p: vec3f, octaves: i32) -> f32 {
    const octaveRotation = mat3x3f(0.00, 0.80, 0.60,
                                   -0.80, 0.36, -0.48,
                                   -0.60, -0.48, 0.64);
    var p_ = p;
    var sum = 0.0;
    var amp = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        sum += amp * min(abs(gradientNoise_f3(p_)), 1.0);
        norm += amp;
        amp *= 0.5;
        p_ = 2.01 * (octaveRotation * p_) + vec3f(17.13, -3.71, 5.29);
    }
    return sum / norm;
}

/// Billowy multifractal: |noise| per octave makes puffy rounded lobes split by sharp creases (the inverse of ridgedFbm).
/// Each octave is weighted by the previous one, so detail gathers on the lobes while the creases stay clean.
/// @use cumulus and cauliflower tops, puffy smoke, foam clumps, rock piles, cotton, popcorn-like bumps
/// @range [0,1]
fn billowFbm_f2i(p: vec2f, octaves: i32) -> f32 {
    const octaveRotation = mat2x2f(0.8, 0.6, -0.6, 0.8);
    var p_ = p;
    var sum = 0.0;
    var amp = 0.5;
    var weight = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        var n = abs(gradientNoise_f2(p_) * 1.4);
        n = n * (2.0 - n);   // round the lobe tops, keep the creases sharp
        sum += amp * n * weight;
        norm += amp;
        weight = clamp(n * 1.5, 0.0, 1.0);
        amp *= 0.5;
        p_ = 2.01 * (octaveRotation * p_) + vec2f(17.13, -3.71);
    }
    return sum / norm;
}
fn billowFbm_f3i(p: vec3f, octaves: i32) -> f32 {
    const octaveRotation = mat3x3f(0.00, 0.80, 0.60,
                                   -0.80, 0.36, -0.48,
                                   -0.60, -0.48, 0.64);
    var p_ = p;
    var sum = 0.0;
    var amp = 0.5;
    var weight = 1.0;
    var norm = 0.0;
    for (var i = 0; i < FBM_MAX_OCTAVES; i++) {
        if (i >= octaves) { break; }
        var n = min(abs(gradientNoise_f3(p_)) * 1.4, 1.0);
        n = n * (2.0 - n);
        sum += amp * n * weight;
        norm += amp;
        weight = clamp(n * 1.5, 0.0, 1.0);
        amp *= 0.5;
        p_ = 2.01 * (octaveRotation * p_) + vec3f(17.13, -3.71, 5.29);
    }
    return sum / norm;
}

/// Two-level domain warp f(p + s*r), r = fbm(p + s*q), q = fbm(p). Writes the intermediate warp
/// vectors so they can drive color. Cost is 5 fBm calls.
/// @use marble, smoke, agate, alien skies, painterly backgrounds
/// @range about [-1,1]
/// @see Inigo Quilez, domain warping
fn warpedFbm(p: vec2f, strength: f32, octaves: i32, q: ptr<function, vec2f>, r: ptr<function, vec2f>) -> f32 {
    *q = vec2f(fbm_f2i(p, octaves), fbm_f2i(p + vec2f(3.1, 7.4), octaves));
    *r = vec2f(fbm_f2i(p + strength * (*q) + vec2f(9.7, 2.6), octaves),
               fbm_f2i(p + strength * (*q) + vec2f(6.3, 1.9), octaves));
    return fbm_f2i(p + strength * (*r), octaves);
}

/// Divergence-free 2D flow field: the curl of scalar gradient noise.
/// Particles advected by it swirl without bunching up.
/// @use smoke advection, flowing paint, hair/fur flow direction, wind
fn curlNoise_f2(p: vec2f) -> vec2f {
    let n = gradientNoiseD_f2(p);
    return vec2f(n.z, -n.y);
}

/// Divergence-free 3D flow field: the curl of a vector potential whose components are three decorrelated
/// gradientNoiseD fields. Analytic, so it costs three noise evaluations and no finite differences.
/// @use smoke and fire advection, swirling particles and sparks, wisps, 3D flow-aligned strokes, magic trails
/// @see Bridson, Hourihan and Nordenstam, "Curl-Noise for Procedural Fluid Flow", SIGGRAPH 2007
fn curlNoise_f3(p: vec3f) -> vec3f {
    let a = gradientNoiseD_f3(p).yzw;                                    // grad of potential.x
    let b = gradientNoiseD_f3(p + vec3f(31.416, -47.853, 12.793)).yzw;   // grad of potential.y
    let c = gradientNoiseD_f3(p + vec3f(-23.719, 18.274, -56.183)).yzw;  // grad of potential.z
    return vec3f(c.y - b.z, a.z - c.x, b.x - a.y);
}

/// Cellular (Worley/Voronoi) noise. Returns vec4f(F1, F2, nearestCell.xy).
/// F1 = distance to nearest feature point, F2 = second nearest. nearestCell is integer-valued, so hash it for
/// per-cell randomness. jitter in [0,1] (0 = regular grid). Searches 3x3 cells. F2 can be slightly off at jitter 1.
/// @use cells, scales, stones, cracked mud (F2-F1), caustics, foam, sparkles
/// @range F1 in [0, ~1.2]
/// @see Inigo Quilez, Voronoi edges
fn voronoi(p: vec2f, jitter: f32) -> vec4f {
    let ip = floor(p);
    let fp = fract(p);
    var f1 = 8.0;
    var f2 = 8.0;
    var nearest = vec2f(0.0);
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            let g = vec2f(f32(i), f32(j));
            let r = g + jitter * hash22(ip + g) - fp;
            let d = dot(r, r);
            if (d < f1) { f2 = f1; f1 = d; nearest = ip + g; }
            else if (d < f2) { f2 = d; }
        }
    }
    return vec4f(sqrt(f1), sqrt(f2), nearest);
}

/// Exact distance to Voronoi cell borders, found in two passes: nearest point, then nearest bisector.
/// Returns vec3f(borderDistance, vectorToNearestPoint). Unlike F2-F1, the border distance is a true distance,
/// so lines have constant width.
/// @use cell walls, stained glass leading, cracked earth, giraffe and leaf-vein patterns, crackle glaze
/// @see Inigo Quilez, Voronoi edges
fn voronoiBorder(p: vec2f, jitter: f32) -> vec3f {
    let ip = floor(p);
    let fp = fract(p);
    var mg = vec2f(0.0);
    var mr = vec2f(0.0);
    var md = 8.0;
    for (var j = -1; j <= 1; j++) {
        for (var i = -1; i <= 1; i++) {
            let g = vec2f(f32(i), f32(j));
            let r = g + jitter * hash22(ip + g) - fp;
            let d = dot(r, r);
            if (d < md) { md = d; mr = r; mg = g; }
        }
    }
    md = 8.0;
    for (var j = -2; j <= 2; j++) {
        for (var i = -2; i <= 2; i++) {
            let g = mg + vec2f(f32(i), f32(j));
            let r = g + jitter * hash22(ip + g) - fp;
            if (dot2_f2(mr - r) > 1e-5) {
                md = min(md, dot(0.5 * (mr + r), normalize(r - mr)));
            }
        }
    }
    return vec3f(md, mr);
}

/// Smooth Voronoi: a soft-min of distances to feature points. Cells become blobs with no creases.
/// k controls smoothness (large = sharper; around 8-32). Searches 5x5 cells so low k has no seams.
/// @use organic cell clusters, bubbles, lumpy surfaces, skin pores
/// @see Inigo Quilez, smooth Voronoi
fn smoothVoronoi(p: vec2f, k: f32) -> f32 {
    let ip = floor(p);
    let fp = fract(p);
    var acc = 0.0;
    for (var j = -2; j <= 2; j++) {
        for (var i = -2; i <= 2; i++) {
            let g = vec2f(f32(i), f32(j));
            let r = g + hash22(ip + g) - fp;
            acc += exp2(-k * length(r));
        }
    }
    return -log2(acc) / k;
}

/// Bounded hybrid terrain recipe: broad gradient fBm, warped ridged detail and cellular breakup.
/// This is an artistic composition, not Musgrave's named hybrid-multifractal algorithm. Coordinates are
/// warped before all three fields are sampled; octaves is clamped to [1, FBM_MAX_OCTAVES].
/// @use game heightmaps, rocky islands, biome elevation masks, alien terrain
/// @range [0,1]
/// @see Gonzalez Vivo and Lowe, The Book of Shaders, chapters 13 (octaves, ridges and warping) and 12 (cells)
fn hybridTerrainHeight(p: vec2f, octaves: i32) -> f32 {
    let count = clamp(octaves, 1, FBM_MAX_OCTAVES);
    let warp = vec2f(fbm_f2i(p * 0.35, count), fbm_f2i(p * 0.35 + vec2f(19.1, -7.3), count));
    let q = p + 0.8 * warp;
    let broad = 0.5 + 0.5 * fbm_f2i(q * 0.45, count);
    let ridges = ridgedFbm(q * 1.7, count);
    let cells = 1.0 - clamp(voronoi(q * 2.5, 0.75).x, 0.0, 1.0);
    return clamp(0.45 * broad + 0.45 * ridges + 0.10 * cells, 0.0, 1.0);
}

/// Interleaved gradient noise: cheap per-pixel noise whose 3x3 neighborhoods are nearly stratified. Not a hash.
/// pixel must be integer pixel coordinates (floor(position.xy)). The frame overload animates it for accumulation and TAA;
/// frame is non-negative, and the engine's frame never wraps, so a frame-seeded pattern does not loop.
/// @use removing banding before 8-bit output, jittering ray start offsets, stochastic transparency
/// @range [0,1)
/// @see Jimenez 2014, "Next Generation Post Processing in Call of Duty: Advanced Warfare"
fn interleavedGradientNoise_f2(pixel: vec2f) -> f32 {
    return fract(52.9829189 * fract(dot(pixel, vec2f(0.06711056, 0.00583715))));
}
fn interleavedGradientNoise_f2i(pixel: vec2f, frame: i32) -> f32 {
    return interleavedGradientNoise_f2(pixel + 5.588238 * f32(frame % 64));
}

/// R2 low-discrepancy dither mask (plastic-constant sequence), folded by a triangle wave for an even spread.
/// @use ordered dithering without textures, posterized and retro looks, sample offsets
/// @range [0,1)
/// @see Martin Roberts, "The Unreasonable Effectiveness of Quasirandom Sequences"
fn r2Dither(pixel: vec2f) -> f32 {
    let v = fract(dot(pixel, vec2f(0.7548776662, 0.5698402910)));
    return select(2.0 - 2.0 * v, 2.0 * v, v < 0.5);
}
`;

// src/knowledge/shader-craft/library/modules/operators.ts
var OPERATORS_GLSL = `//! operators: combine distances (booleans, smooth blends, chamfers, stairs) and reshape them (round, onion,
//! extrude, revolve, elongate). Arguments a, b are distances already evaluated at the same point.
//! Exactness: union (min) is exact outside but too deep inside; intersection and subtraction (max) are exact
//! inside but underestimate outside. Smooth and decorative combinations are bounds. All stay Lipschitz <= 1,
//! so raymarching is safe. When interior distances matter (inner-penumbra shadows, thickness, onion of a union),
//! prefer an exact concave primitive (sdDeathStar, sdCutHollowSphere, 2D sdMoon/sdArc + extrude/revolve).
//! Smooth unions are not associative: blend in a fixed order (torso, then limbs, then details).
//! Smooth blend semantics in this library: k is the blend width in distance units. Shapes start blending
//! when |a - b| < k.

/// Union of two shapes.
/// @bound
/// @use combining parts
float opUnion(float a, float b) { return min(a, b); }

/// Shape a with shape b cut out of it.
/// @bound
/// @use holes, windows, carving, bites
float opSubtract(float a, float b) { return max(a, -b); }

/// Region inside both shapes.
/// @bound
/// @use clipping, lens shapes, trimming with half-spaces
float opIntersect(float a, float b) { return max(a, b); }

/// Smooth union (polynomial, C1). Blends where |a - b| < k, with a max bulge of k/4.
/// @bound
/// @use organic joins (neck to head, limbs to torso), melting shapes, blobby forms
/// @see Inigo Quilez, smooth minimum
float smin(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

/// Smooth intersection, the mirror of smin.
/// @bound
/// @use soft clipping, rounded intersections, pillowy cuts
float smax(float a, float b, float k) { return -smin(-a, -b, k); }

/// Smooth subtraction: a with b carved out, with filleted edges.
/// @bound
/// @use eye sockets, nostrils, soft grooves, scooped bowls, worn edges
float smoothSubtract(float a, float b, float k) { return smax(a, -b, k); }

/// Smooth union with a C2 (cubic) transition, so specular highlights and normals have no visible seam.
/// Blends where |a - b| < k, with a max bulge of k/6.
/// @bound
/// @use close-up organic surfaces, glossy blends, fluids
/// @see Inigo Quilez, smooth minimum
float sminCubic(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
}

/// Smooth union that also returns the blend weight. Returns vec2(distance, weight), where weight is 1 when
/// the result is fully a and 0 when fully b. Use the weight to mix material colors across the blend.
/// @bound
/// @use skin-to-cloth transitions, color bleeding across blended parts, gradient-colored blobs
vec2 sminBlend(float a, float b, float k) {
    float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return vec2(mix(b, a, h) - k * h * (1.0 - h), h);
}

/// Union with a 45-degree chamfer of size r at the seam.
/// @bound
/// @use machined parts, architecture, sci-fi panels, bevelled joins
/// @see Mercury demogroup, hg_sdf
float opChamferUnion(float a, float b, float r) {
    return min(min(a, b), (a + b - r) * 0.70710678);
}

/// Union with n stair steps of total size r at the seam.
/// @bound
/// @use terraces, stepped pyramids, ziggurats, layered rock, rice paddies
/// @see Mercury demogroup, hg_sdf
float opStairsUnion(float a, float b, float r, float n) {
    float s = r / n;
    float u = b - r;
    return min(min(a, b), 0.5 * (u + a + abs(mod(u - a + s, 2.0 * s) - s)));
}

/// Engrave a groove of depth r into a, following the zero set of b.
/// @bound
/// @use panel lines, carved text paths, seams, grout lines on a surface
/// @see Mercury demogroup, hg_sdf
float opEngrave(float a, float b, float r) {
    return max(a, (a + r - abs(b)) * 0.70710678);
}

/// Round a shape by r. Grows it outward; shrink the inner shape by r first to keep its size.
/// @exact
/// @use softening any primitive, pebbles from boxes, inflated look
float opRound(float d, float r) { return d - r; }

/// Hollow shell of thickness 2t around the surface. Apply repeatedly for concentric layers.
/// @exact
/// @use shells, pipes, rings, onion layers, outlines in 2D
float opOnion(float d, float t) { return abs(d) - t; }

/// Extrude a 2D distance d2 (evaluated at p.xy) along Z by half-length h.
/// @exact
/// @use 3D text and logos, cookie cutters, coins from 2D shapes, extruded profiles
float opExtrude(vec3 p, float d2, float h) {
    vec2 w = vec2(d2, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, 0.0));
}

/// Revolve around Y. Returns the 2D point to evaluate a profile at. Offset o moves the profile away from the axis.
/// @exact
/// @use vases, bottles, chess pieces, lathe-turned objects, tori with custom profiles
vec2 opRevolve(vec3 p, float o) { return vec2(length(p.xz) - o, p.y); }

/// Elongate: stretch a shape by inserting a straight section of half-size h, keeping exact distances inside too.
/// Returns vec4(q, w). Evaluate the original shape at q.xyz and add w:  sdSphere(e.xyz, r) + e.w  is a capsule.
/// @exact
/// @use pills from spheres, long rounded boxes, stretched characters, stadium shapes
vec4 opElongate(vec3 p, vec3 h) {
    vec3 q = abs(p) - h;
    return vec4(max(q, 0.0), min(max(q.x, max(q.y, q.z)), 0.0));
}
`;
var OPERATORS_WGSL = `//! operators: combine distances (booleans, smooth blends, chamfers, stairs) and reshape them (round, onion,
//! extrude, revolve, elongate). Arguments a, b are distances already evaluated at the same point.
//! Exactness: union (min) is exact outside but too deep inside; intersection and subtraction (max) are exact
//! inside but underestimate outside. Smooth and decorative combinations are bounds. All stay Lipschitz <= 1,
//! so raymarching is safe. When interior distances matter (inner-penumbra shadows, thickness, onion of a union),
//! prefer an exact concave primitive (sdDeathStar, sdCutHollowSphere, 2D sdMoon/sdArc + extrude/revolve).
//! Smooth unions are not associative: blend in a fixed order (torso, then limbs, then details).
//! Smooth blend semantics in this library: k is the blend width in distance units. Shapes start blending
//! when |a - b| < k.

/// Union of two shapes.
/// @bound
/// @use combining parts
fn opUnion(a: f32, b: f32) -> f32 { return min(a, b); }

/// Shape a with shape b cut out of it.
/// @bound
/// @use holes, windows, carving, bites
fn opSubtract(a: f32, b: f32) -> f32 { return max(a, -b); }

/// Region inside both shapes.
/// @bound
/// @use clipping, lens shapes, trimming with half-spaces
fn opIntersect(a: f32, b: f32) -> f32 { return max(a, b); }

/// Smooth union (polynomial, C1). Blends where |a - b| < k, with a max bulge of k/4.
/// @bound
/// @use organic joins (neck to head, limbs to torso), melting shapes, blobby forms
/// @see Inigo Quilez, smooth minimum
fn smin(a: f32, b: f32, k: f32) -> f32 {
    let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return mix(b, a, h) - k * h * (1.0 - h);
}

/// Smooth intersection, the mirror of smin.
/// @bound
/// @use soft clipping, rounded intersections, pillowy cuts
fn smax(a: f32, b: f32, k: f32) -> f32 { return -smin(-a, -b, k); }

/// Smooth subtraction: a with b carved out, with filleted edges.
/// @bound
/// @use eye sockets, nostrils, soft grooves, scooped bowls, worn edges
fn smoothSubtract(a: f32, b: f32, k: f32) -> f32 { return smax(a, -b, k); }

/// Smooth union with a C2 (cubic) transition, so specular highlights and normals have no visible seam.
/// Blends where |a - b| < k, with a max bulge of k/6.
/// @bound
/// @use close-up organic surfaces, glossy blends, fluids
/// @see Inigo Quilez, smooth minimum
fn sminCubic(a: f32, b: f32, k: f32) -> f32 {
    let h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0f / 6.0f);
}

/// Smooth union that also returns the blend weight. Returns vec2f(distance, weight), where weight is 1 when
/// the result is fully a and 0 when fully b. Use the weight to mix material colors across the blend.
/// @bound
/// @use skin-to-cloth transitions, color bleeding across blended parts, gradient-colored blobs
fn sminBlend(a: f32, b: f32, k: f32) -> vec2f {
    let h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
    return vec2f(mix(b, a, h) - k * h * (1.0 - h), h);
}

/// Union with a 45-degree chamfer of size r at the seam.
/// @bound
/// @use machined parts, architecture, sci-fi panels, bevelled joins
/// @see Mercury demogroup, hg_sdf
fn opChamferUnion(a: f32, b: f32, r: f32) -> f32 {
    return min(min(a, b), (a + b - r) * 0.70710678);
}

/// Union with n stair steps of total size r at the seam.
/// @bound
/// @use terraces, stepped pyramids, ziggurats, layered rock, rice paddies
/// @see Mercury demogroup, hg_sdf
fn opStairsUnion(a: f32, b: f32, r: f32, n: f32) -> f32 {
    let s = r / n;
    let u = b - r;
    let x = u - a + s;
    let period = 2.0 * s;
    return min(min(a, b), 0.5 * (u + a + abs((x - period * floor(x / period)) - s)));
}

/// Engrave a groove of depth r into a, following the zero set of b.
/// @bound
/// @use panel lines, carved text paths, seams, grout lines on a surface
/// @see Mercury demogroup, hg_sdf
fn opEngrave(a: f32, b: f32, r: f32) -> f32 {
    return max(a, (a + r - abs(b)) * 0.70710678);
}

/// Round a shape by r. Grows it outward; shrink the inner shape by r first to keep its size.
/// @exact
/// @use softening any primitive, pebbles from boxes, inflated look
fn opRound(d: f32, r: f32) -> f32 { return d - r; }

/// Hollow shell of thickness 2t around the surface. Apply repeatedly for concentric layers.
/// @exact
/// @use shells, pipes, rings, onion layers, outlines in 2D
fn opOnion(d: f32, t: f32) -> f32 { return abs(d) - t; }

/// Extrude a 2D distance d2 (evaluated at p.xy) along Z by half-length h.
/// @exact
/// @use 3D text and logos, cookie cutters, coins from 2D shapes, extruded profiles
fn opExtrude(p: vec3f, d2: f32, h: f32) -> f32 {
    let w = vec2f(d2, abs(p.z) - h);
    return min(max(w.x, w.y), 0.0) + length(max(w, vec2f(0.0)));
}

/// Revolve around Y. Returns the 2D point to evaluate a profile at. Offset o moves the profile away from the axis.
/// @exact
/// @use vases, bottles, chess pieces, lathe-turned objects, tori with custom profiles
fn opRevolve(p: vec3f, o: f32) -> vec2f { return vec2f(length(p.xz) - o, p.y); }

/// Elongate: stretch a shape by inserting a straight section of half-size h, keeping exact distances inside too.
/// Returns vec4f(q, w). Evaluate the original shape at q.xyz and add w:  sdSphere(e.xyz, r) + e.w  is a capsule.
/// @exact
/// @use pills from spheres, long rounded boxes, stretched characters, stadium shapes
fn opElongate(p: vec3f, h: vec3f) -> vec4f {
    let q = abs(p) - h;
    return vec4f(max(q, vec3f(0.0)), min(max(q.x, max(q.y, q.z)), 0.0));
}
`;

// src/knowledge/shader-craft/library/modules/pattern.ts
var PATTERN_GLSL = `//! pattern: tilings and antialiased procedural patterns. The filtered versions integrate the pattern over the
//! pixel footprint (box filter), so floors and stripes stay clean in the distance with no supersampling.
//! Filtering math follows Inigo Quilez's articles on checkerboard filtering and filterable procedurals.

/// Triangle wave, the integral of a square wave. Building block for box-filtered patterns.
/// @use writing new filtered patterns
vec2 triangleWave(vec2 x) { return 1.0 - 2.0 * abs(fract(x * 0.5) - 0.5); }

/// Box-filtered checkerboard with unit squares: 0 or 1 up close, fading to 0.5 where squares are smaller than a pixel.
/// Compute the footprint before any branching: w = fwidth(p) (or max(abs(dFdx(p)), abs(dFdy(p)))).
/// @use floors, chessboards, test patterns, racing flags, tablecloths
/// @range [0,1]
float filteredChecker(vec2 p, vec2 w) {
    w = max(w, 1e-4);
    vec2 i = (triangleWave(p + 0.5 * w) - triangleWave(p - 0.5 * w)) / w;
    return 0.5 - 0.5 * i.x * i.y;
}

/// Box-filtered grid lines (unit cells, line width = 1/n of a cell). Returns 1 on lines, 0 inside cells.
/// @use blueprints, graph paper, tiles with grout, sci-fi floors, synthwave grids
/// @range [0,1]
float filteredGrid(vec2 p, vec2 w, float n) {
    w = max(w, 1e-4);
    vec2 a = p + 0.5 * w;
    vec2 b = p - 0.5 * w;
    vec2 i = (floor(a) + min(fract(a) * n, 1.0) - floor(b) - min(fract(b) * n, 1.0)) / (n * w);
    return 1.0 - (1.0 - i.x) * (1.0 - i.y);
}

/// Box-filtered stripes along x with period 1 and duty cycle 0.5. Returns 0..1.
/// @use awnings, candy, zebra (warp x first), barcodes, road markings
/// @range [0,1]
float filteredStripes(float x, float w) {
    w = max(w, 1e-4);
    float a = x + 0.5 * w, b = x - 0.5 * w;
    float ia = floor(a) * 0.5 + max(fract(a) - 0.5, 0.0);
    float ib = floor(b) * 0.5 + max(fract(b) - 0.5, 0.0);
    return (ia - ib) / w;
}

/// Hexagonal tiling with unit spacing between neighboring centers. Neighbors sit left/right, so hexes are
/// pointy-top. Returns vec4(local offset from the hex center, integer-valued hex id).
/// @use honeycomb, scales, tiles, game boards, hex pixelation
vec4 hexGrid(vec2 p) {
    const vec2 s = vec2(1.0, 1.7320508);
    vec2 a = mod(p, s) - 0.5 * s;
    vec2 b = mod(p - 0.5 * s, s) - 0.5 * s;
    vec2 local = (dot(a, a) < dot(b, b)) ? a : b;
    vec2 center = p - local;
    vec2 id = floor(vec2(center.x * 2.0, center.y * 1.1547005) + 0.5);
    return vec4(local, id);
}

/// Distance from a hexGrid local coordinate to its hexagon's edge (0.5 at the center, 0 on the edge).
/// @use hex borders, bevels, edge wear on tiles
float hexEdgeDistance(vec2 local) {
    vec2 a = abs(local);
    return 0.5 - max(a.x, dot(a, vec2(0.5, 0.8660254)));
}

/// Truchet tiling of quarter-circle arcs, randomly flipped per cell. Returns signed distance to arcs of half-width w.
/// @use maze-like ornaments, pipes, Celtic-style weaves, procedural circuitry
float truchetArcs(vec2 p, float w) {
    vec2 id = floor(p);
    vec2 f = fract(p) - 0.5;
    if (hash12(id) < 0.5) f.x = -f.x;
    vec2 q = f - 0.5 * sign(f.x + f.y + 1e-6);
    return abs(length(q) - 0.5) - w;
}
`;
var PATTERN_WGSL = `//! pattern: tilings and antialiased procedural patterns. The filtered versions integrate the pattern over the
//! pixel footprint (box filter), so floors and stripes stay clean in the distance with no supersampling.
//! Filtering math follows Inigo Quilez's articles on checkerboard filtering and filterable procedurals.

/// Triangle wave, the integral of a square wave. Building block for box-filtered patterns.
/// @use writing new filtered patterns
fn triangleWave(x: vec2f) -> vec2f { return 1.0 - 2.0 * abs(fract(x * 0.5) - 0.5); }

/// Box-filtered checkerboard with unit squares: 0 or 1 up close, fading to 0.5 where squares are smaller than a pixel.
/// Compute the footprint in uniform control flow before any branching: w = fwidth(p) (or max(abs(dpdx(p)), abs(dpdy(p)))).
/// @use floors, chessboards, test patterns, racing flags, tablecloths
/// @range [0,1]
fn filteredChecker(p: vec2f, w: vec2f) -> f32 {
    let w_ = max(w, vec2f(1e-4));
    let i = (triangleWave(p + 0.5 * w_) - triangleWave(p - 0.5 * w_)) / w_;
    return 0.5 - 0.5 * i.x * i.y;
}

/// Box-filtered grid lines (unit cells, line width = 1/n of a cell). Returns 1 on lines, 0 inside cells.
/// @use blueprints, graph paper, tiles with grout, sci-fi floors, synthwave grids
/// @range [0,1]
fn filteredGrid(p: vec2f, w: vec2f, n: f32) -> f32 {
    let w_ = max(w, vec2f(1e-4));
    let a = p + 0.5 * w_;
    let b = p - 0.5 * w_;
    let i = (floor(a) + min(fract(a) * n, vec2f(1.0)) - floor(b) - min(fract(b) * n, vec2f(1.0))) / (n * w_);
    return 1.0 - (1.0 - i.x) * (1.0 - i.y);
}

/// Box-filtered stripes along x with period 1 and duty cycle 0.5. Returns 0..1.
/// @use awnings, candy, zebra (warp x first), barcodes, road markings
/// @range [0,1]
fn filteredStripes(x: f32, w: f32) -> f32 {
    let w_ = max(w, 1e-4);
    let a = x + 0.5 * w_;
    let b = x - 0.5 * w_;
    let ia = floor(a) * 0.5 + max(fract(a) - 0.5, 0.0);
    let ib = floor(b) * 0.5 + max(fract(b) - 0.5, 0.0);
    return (ia - ib) / w_;
}

/// Hexagonal tiling with unit spacing between neighboring centers. Neighbors sit left/right, so hexes are
/// pointy-top. Returns vec4f(local offset from the hex center, integer-valued hex id).
/// @use honeycomb, scales, tiles, game boards, hex pixelation
fn hexGrid(p: vec2f) -> vec4f {
    const s = vec2f(1.0, 1.7320508);
    let a = (p - s * floor(p / s)) - 0.5 * s;
    let pb = p - 0.5 * s;
    let b = (pb - s * floor(pb / s)) - 0.5 * s;
    let local = select(b, a, dot(a, a) < dot(b, b));
    let center = p - local;
    let id = floor(vec2f(center.x * 2.0, center.y * 1.1547005) + 0.5);
    return vec4f(local, id);
}

/// Distance from a hexGrid local coordinate to its hexagon's edge (0.5 at the center, 0 on the edge).
/// @use hex borders, bevels, edge wear on tiles
fn hexEdgeDistance(local: vec2f) -> f32 {
    let a = abs(local);
    return 0.5 - max(a.x, dot(a, vec2f(0.5, 0.8660254)));
}

/// Truchet tiling of quarter-circle arcs, randomly flipped per cell. Returns signed distance to arcs of half-width w.
/// @use maze-like ornaments, pipes, Celtic-style weaves, procedural circuitry
fn truchetArcs(p: vec2f, w: f32) -> f32 {
    let id = floor(p);
    var f = fract(p) - 0.5;
    if (hash12(id) < 0.5) { f.x = -f.x; }
    let q = f - 0.5 * sign(f.x + f.y + 1e-6);
    return abs(length(q) - 0.5) - w;
}
`;

// src/knowledge/shader-craft/library/modules/post.ts
var POST_GLSL = `//! post: antialiasing helpers, supersampling offsets, lens effects, grain and dithering, all single-pass.
//! Order of a finished frame: (per AA sample) exposure, vignette, grain -> tonemap -> average samples ->
//! linearToSrgb -> dither. See shader-craft-rendering-pipeline.

/// Antialiased fill of a 2D SDF: 1 inside, 0 outside, box-filtered across one pixel. Uses screen derivatives,
/// so call it outside non-uniform branches and loops. For a fixed pixel size use fillAA(d, px).
/// @use 2D shapes, icons, text-like strokes, UI, masks with crisp edges
float fillAA(float d) {
    float w = length(vec2(dFdx(d), dFdy(d)));
    return clamp(0.5 - d / max(w, 1e-6), 0.0, 1.0);
}

/// Antialiased fill with an explicit pixel size px (e.g. 2.0 / resolution.y for the standard uv). Safe in loops and branches.
/// @use 2D shapes evaluated inside loops, layered compositions
float fillAA(float d, float px) { return clamp(0.5 - d / px, 0.0, 1.0); }

/// Antialiased stroke of half-width hw around the zero line of a 2D SDF.
/// @use outlines, line art, rings, wireframes, contour lines
float strokeAA(float d, float hw, float px) { return fillAA(abs(d) - hw, px); }

/// Subpixel offset in [-0.5, 0.5)^2 for sample i of a supersampling loop (R2 low-discrepancy sequence).
/// Better coverage than a regular grid for any sample count.
/// @use AA loops: for (int i = 0; i < N; i++) { vec2 o = aaOffset(i); ... sceneColor(gl_FragCoord.xy + o) }
vec2 aaOffset(int i) {
    return fract(0.5 + float(i) * vec2(0.7548776662, 0.5698402910)) - 0.5;
}

/// Natural (cos^4) vignette for a pinhole camera: uv is the screen point, focal the camera focal length.
/// Wider lenses vignette more. Multiply HDR color before tonemapping.
/// @use photographic falloff, framing, cinematic looks
float vignette(vec2 uv, float focal) {
    float f2 = focal * focal;
    float k = f2 / (f2 + dot(uv, uv));
    return k * k;
}

/// Signal-dependent film grain: noise grows with sqrt(intensity), as photon noise does. n should be zero-mean
/// noise (e.g. hash13(vec3(gl_FragCoord.xy, frame)) * 2 - 1). Apply in linear HDR before tonemapping.
/// @use filmic texture, hiding banding, analog looks
vec3 filmGrain(vec3 col, float amount, float n) {
    return col + amount * sqrt(max(col, 0.0)) * n;
}

/// Triangular-PDF dither of +-1 LSB for 8-bit output. Add AFTER linearToSrgb, right before writing the output color.
/// pixel is gl_FragCoord.xy and frame is non-negative; the engine's frame never wraps, so pass 0 for a still that must
/// render identically at the same time.
/// @use removing banding in skies, fog, vignettes and dark gradients
vec3 ditherTPDF(vec2 pixel, int frame) {
    vec2 r = hash22(vec2(floor(pixel) + 7919.0 * float(frame % 1024)));
    return vec3((r.x + r.y - 1.0) / 255.0);
}
`;
var POST_WGSL = `//! post: antialiasing helpers, supersampling offsets, lens effects, grain and dithering, all single-pass.
//! Order of a finished frame: (per AA sample) exposure, vignette, grain -> tonemap -> average samples ->
//! linearToSrgb -> dither. See shader-craft-rendering-pipeline.

/// Antialiased fill of a 2D SDF: 1 inside, 0 outside, box-filtered across one pixel. Uses screen derivatives,
/// so call it in uniform control flow, outside branches and loops (WGSL rejects derivatives elsewhere).
/// For a fixed pixel size use fillAA_ff(d, px).
/// @use 2D shapes, icons, text-like strokes, UI, masks with crisp edges
fn fillAA_f(d: f32) -> f32 {
    let w = length(vec2f(dpdx(d), dpdy(d)));
    return clamp(0.5 - d / max(w, 1e-6), 0.0, 1.0);
}

/// Antialiased fill with an explicit pixel size px (e.g. 2.0 / resolution.y for the standard uv). Safe in loops and branches.
/// @use 2D shapes evaluated inside loops, layered compositions
fn fillAA_ff(d: f32, px: f32) -> f32 { return clamp(0.5 - d / px, 0.0, 1.0); }

/// Antialiased stroke of half-width hw around the zero line of a 2D SDF.
/// @use outlines, line art, rings, wireframes, contour lines
fn strokeAA(d: f32, hw: f32, px: f32) -> f32 { return fillAA_ff(abs(d) - hw, px); }

/// Subpixel offset in [-0.5, 0.5)^2 for sample i of a supersampling loop (R2 low-discrepancy sequence).
/// Better coverage than a regular grid for any sample count.
/// @use AA loops: for (var i = 0; i < N; i++) { let o = aaOffset(i); ... sceneColor(position.xy + o) }
fn aaOffset(i: i32) -> vec2f {
    return fract(0.5 + f32(i) * vec2f(0.7548776662, 0.5698402910)) - 0.5;
}

/// Natural (cos^4) vignette for a pinhole camera: uv is the screen point, focal the camera focal length.
/// Wider lenses vignette more. Multiply HDR color before tonemapping.
/// @use photographic falloff, framing, cinematic looks
fn vignette(uv: vec2f, focal: f32) -> f32 {
    let f2 = focal * focal;
    let k = f2 / (f2 + dot(uv, uv));
    return k * k;
}

/// Signal-dependent film grain: noise grows with sqrt(intensity), as photon noise does. n should be zero-mean
/// noise (e.g. hash13(vec3f(position.xy, f32(frame))) * 2 - 1). Apply in linear HDR before tonemapping.
/// @use filmic texture, hiding banding, analog looks
fn filmGrain(col: vec3f, amount: f32, n: f32) -> vec3f {
    return col + amount * sqrt(max(col, vec3f(0.0))) * n;
}

/// Triangular-PDF dither of +-1 LSB for 8-bit output. Add AFTER linearToSrgb, right before returning the output color.
/// pixel is position.xy and frame is non-negative; the engine's frame never wraps, so pass 0 for a still that must
/// render identically at the same time.
/// @use removing banding in skies, fog, vignettes and dark gradients
fn ditherTPDF(pixel: vec2f, frame: i32) -> vec3f {
    let r = hash22(vec2f(floor(pixel) + 7919.0 * f32(frame % 1024)));
    return vec3f((r.x + r.y - 1.0) / 255.0);
}
`;

// src/knowledge/shader-craft/library/modules/raymarch.ts
var RAYMARCH_GLSL = `//! raymarch: sphere tracing, normals, soft shadows and ambient occlusion for SDF scenes.
//! SCENE CONTRACT: the program defines   vec2 map(vec3 p)   returning vec2(distance, materialId).
//! Packing the material into a vec2 avoids structs (WebGL forbids ?: on structs) and works with every helper here.
//! Loops start at ZERO, a zero the compiler cannot prove. That stops it inlining map() into every loop, which
//! keeps compile times sane and avoids WebGL compiler crashes on large scenes. Library code reads no uniforms, so the
//! program defines ZERO from its own int frame uniform before the library code:   #define ZERO (min(frame, 0))

vec2 map(vec3 p);

const int RAYMARCH_MAX_STEPS = 256;

/// Sphere-trace from ro along unit rd between tmin and tmax.
/// Returns vec3(t, materialId, stepCount). t is -1 on a miss.
/// The hit threshold grows with t (about one pixel's footprint), so distant surfaces don't burn steps.
/// stepScale is 1 for exact or bound fields. Use < 1 (e.g. 0.6) when map() has Lipschitz > 1 (displacement, warps, twist).
/// @use every SDF raymarcher
/// @see Inigo Quilez, raymarching distance fields
vec3 raymarch(vec3 ro, vec3 rd, float tmin, float tmax, float stepScale) {
    float t = tmin;
    for (int i = ZERO; i < RAYMARCH_MAX_STEPS; i++) {
        vec2 h = map(ro + rd * t);
        if (abs(h.x) < max(0.0002 * t, 1e-5)) return vec3(t, h.y, float(i));
        t += h.x * stepScale;
        if (t > tmax) break;
    }
    return vec3(-1.0, -1.0, float(RAYMARCH_MAX_STEPS));
}

/// Surface normal from 4 tetrahedral samples (cheaper than 6 central differences, and still centered).
/// eps should scale with distance, e.g. 0.0005 * t: that filters distant detail and avoids sparkling.
/// @use shading any SDF hit
/// @see Inigo Quilez, normals for an SDF
vec3 calcNormal(vec3 p, float eps) {
    vec3 n = vec3(0.0);
    for (int i = ZERO; i < 4; i++) {
        vec3 e = 0.5773 * (2.0 * vec3((((i + 3) >> 1) & 1), ((i >> 1) & 1), (i & 1)) - 1.0);
        n += e * map(p + e * eps).x;
    }
    return normalize(n);
}

/// Soft shadow toward a light along unit rd. k controls sharpness (k is about 1 / light angular size: 8 soft, 32 hard).
/// Uses the "closest approach between samples" estimate, which removes banding from sharp-cornered occluders.
/// Returns 0 (full shadow) .. 1 (lit).
/// @use sun shadows, contact shadows, penumbrae
/// @see Inigo Quilez, soft shadows
float softShadow(vec3 ro, vec3 rd, float tmin, float tmax, float k) {
    float res = 1.0;
    float t = tmin;
    float ph = 1e10;
    for (int i = ZERO; i < 64; i++) {
        float h = map(ro + rd * t).x;
        if (h < 0.0001) return 0.0;
        float y = h * h / (2.0 * ph);
        float d = sqrt(max(h * h - y * y, 0.0));
        res = min(res, k * d / max(t - y, 1e-4));
        ph = h;
        t += clamp(h, 0.005, 0.5);
        if (res < 0.001 || t > tmax) break;
    }
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}

/// Ambient occlusion from 5 distance samples along the normal. Compares the expected distance with the actual one.
/// scale is the sampling reach in scene units (about 0.12 for a unit-sized object). Returns 0 (occluded) .. 1 (open).
/// @use crevices, contact darkening, grounding objects on floors
/// @see Inigo Quilez, "Rendering Worlds with Two Triangles" (NVScene 2008)
float calcAO(vec3 p, vec3 n, float scale) {
    float occ = 0.0;
    float weight = 1.0;
    for (int i = ZERO; i < 5; i++) {
        float h = 0.01 + scale * float(i) / 4.0;
        float d = map(p + h * n).x;
        occ += (h - d) * weight;
        weight *= 0.95;
    }
    return clamp(1.0 - 3.0 * occ / max(scale / 0.12, 1e-3), 0.0, 1.0);
}

/// Thickness behind a surface point, estimated by sampling the SDF inside along -n (an "inverse AO").
/// Returns 0 (thin, light passes through) .. 1 (thick). maxDepth is the deepest sample in scene units.
/// @use translucency, subsurface tint, wax and jade, glowing thin edges
float sdfThickness(vec3 p, vec3 n, float maxDepth) {
    float acc = 0.0;
    for (int i = ZERO; i < 4; i++) {
        float h = maxDepth * (float(i) + 1.0) / 4.0;
        acc += clamp(-map(p - n * h).x / h, 0.0, 1.0);
    }
    return acc / 4.0;
}
`;
var RAYMARCH_WGSL = `//! raymarch: sphere tracing, normals, soft shadows and ambient occlusion for SDF scenes.
//! SCENE CONTRACT: the program defines   fn map(p: vec3f) -> vec2f   returning vec2f(distance, materialId).
//! Packing the material into a vec2f works with every helper here and matches the GLSL twin.
//! Loops start at ZERO, a zero the compiler cannot prove. That stops it inlining map() into every loop, which
//! keeps compile times sane on large scenes. Library code reads no uniforms, so the program declares ZERO and sets it
//! from its own frame uniform at the top of its entry point:   var<private> ZERO: i32;   ...   ZERO = min(frame, 0);

const RAYMARCH_MAX_STEPS: i32 = 256;

/// Sphere-trace from ro along unit rd between tmin and tmax.
/// Returns vec3f(t, materialId, stepCount). t is -1 on a miss.
/// The hit threshold grows with t (about one pixel's footprint), so distant surfaces don't burn steps.
/// stepScale is 1 for exact or bound fields. Use < 1 (e.g. 0.6) when map() has Lipschitz > 1 (displacement, warps, twist).
/// @use every SDF raymarcher
/// @see Inigo Quilez, raymarching distance fields
fn raymarch(ro: vec3f, rd: vec3f, tmin: f32, tmax: f32, stepScale: f32) -> vec3f {
    var t = tmin;
    for (var i = ZERO; i < RAYMARCH_MAX_STEPS; i++) {
        let h = map(ro + rd * t);
        if (abs(h.x) < max(0.0002 * t, 1e-5)) { return vec3f(t, h.y, f32(i)); }
        t += h.x * stepScale;
        if (t > tmax) { break; }
    }
    return vec3f(-1.0, -1.0, f32(RAYMARCH_MAX_STEPS));
}

/// Surface normal from 4 tetrahedral samples (cheaper than 6 central differences, and still centered).
/// eps should scale with distance, e.g. 0.0005 * t: that filters distant detail and avoids sparkling.
/// @use shading any SDF hit
/// @see Inigo Quilez, normals for an SDF
fn calcNormal(p: vec3f, eps: f32) -> vec3f {
    var n = vec3f(0.0);
    for (var i = ZERO; i < 4; i++) {
        let e = 0.5773 * (2.0 * vec3f(vec3i(((i + 3) >> 1u) & 1, (i >> 1u) & 1, i & 1)) - 1.0);
        n += e * map(p + e * eps).x;
    }
    return normalize(n);
}

/// Soft shadow toward a light along unit rd. k controls sharpness (k is about 1 / light angular size: 8 soft, 32 hard).
/// Uses the "closest approach between samples" estimate, which removes banding from sharp-cornered occluders.
/// Returns 0 (full shadow) .. 1 (lit).
/// @use sun shadows, contact shadows, penumbrae
/// @see Inigo Quilez, soft shadows
fn softShadow(ro: vec3f, rd: vec3f, tmin: f32, tmax: f32, k: f32) -> f32 {
    var res = 1.0;
    var t = tmin;
    var ph = 1e10;
    for (var i = ZERO; i < 64; i++) {
        let h = map(ro + rd * t).x;
        if (h < 0.0001) { return 0.0; }
        let y = h * h / (2.0 * ph);
        let d = sqrt(max(h * h - y * y, 0.0));
        res = min(res, k * d / max(t - y, 1e-4));
        ph = h;
        t += clamp(h, 0.005, 0.5);
        if (res < 0.001 || t > tmax) { break; }
    }
    res = clamp(res, 0.0, 1.0);
    return res * res * (3.0 - 2.0 * res);
}

/// Ambient occlusion from 5 distance samples along the normal. Compares the expected distance with the actual one.
/// scale is the sampling reach in scene units (about 0.12 for a unit-sized object). Returns 0 (occluded) .. 1 (open).
/// @use crevices, contact darkening, grounding objects on floors
/// @see Inigo Quilez, "Rendering Worlds with Two Triangles" (NVScene 2008)
fn calcAO(p: vec3f, n: vec3f, scale: f32) -> f32 {
    var occ = 0.0;
    var weight = 1.0;
    for (var i = ZERO; i < 5; i++) {
        let h = 0.01 + scale * f32(i) / 4.0;
        let d = map(p + h * n).x;
        occ += (h - d) * weight;
        weight *= 0.95;
    }
    return clamp(1.0 - 3.0 * occ / max(scale / 0.12, 1e-3), 0.0, 1.0);
}

/// Thickness behind a surface point, estimated by sampling the SDF inside along -n (an "inverse AO").
/// Returns 0 (thin, light passes through) .. 1 (thick). maxDepth is the deepest sample in scene units.
/// @use translucency, subsurface tint, wax and jade, glowing thin edges
fn sdfThickness(p: vec3f, n: vec3f, maxDepth: f32) -> f32 {
    var acc = 0.0;
    for (var i = ZERO; i < 4; i++) {
        let h = maxDepth * (f32(i) + 1.0) / 4.0;
        acc += clamp(-map(p - n * h).x / h, 0.0, 1.0);
    }
    return acc / 4.0;
}
`;

// src/knowledge/shader-craft/library/modules/sdf2d.ts
var SDF2D_GLSL = `//! sdf2d: 2D signed distance primitives for posters, icons, UI, motion graphics, and as profiles for
//! opExtrude / opRevolve. Centered at the origin unless noted. Negative inside.
//! Formulas follow Inigo Quilez's 2D distance catalog (article "2D distance functions").
//! Implementations are original and tested (sign, Lipschitz, brute-force distance for curves).
//! Tags: @exact true distance, @bound never overestimates, @approx exact zero set but may overestimate in places.

/// Circle of radius r.
/// @exact
/// @use dots, eyes, suns, bubbles, rings (with opOnion)
float sdCircle(vec2 p, float r) { return length(p) - r; }

/// Axis-aligned rectangle with half-extents b.
/// @exact
/// @use panels, bars, windows, buttons, building silhouettes
float sdBox(vec2 p, vec2 b) {
    vec2 d = abs(p) - b;
    return length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
}

/// Rectangle with half-extents b and per-corner radii r = (top-right, bottom-right, top-left, bottom-left).
/// @exact
/// @use UI cards, buttons, speech bubbles, tags, rounded windows
float sdRoundedBox(vec2 p, vec2 b, vec4 r) {
    r.xy = (p.x > 0.0) ? r.xy : r.zw;
    r.x = (p.y > 0.0) ? r.x : r.y;
    vec2 q = abs(p) - b + r.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - r.x;
}

/// Unsigned distance to segment a-b. Subtract a width to get a stroke.
/// @exact
/// @use lines, strokes, stems, rays, hands of a clock, rain streaks
float sdSegment(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

/// Tapered capsule: circle r1 at origin hulled with circle r2 at (0, h).
/// @exact
/// @use petals, tails, teardrops, brush dabs, fingers, flames
float sdUnevenCapsule(vec2 p, float r1, float r2, float h) {
    p.x = abs(p.x);
    float b = (r1 - r2) / h;
    float a = sqrt(1.0 - b * b);
    float k = dot(p, vec2(-b, a));
    if (k < 0.0) return length(p) - r1;
    if (k > a * h) return length(p - vec2(0.0, h)) - r2;
    return dot(p, vec2(a, b)) - r1;
}

/// Circular arc symmetric about +Y. sc = vec2(sin, cos) of the half-aperture, ra = radius, rb = stroke half-width.
/// @exact
/// @use smiles, eyebrows, rainbows, gauges, progress rings, horseshoes
float sdArc(vec2 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    return ((sc.y * p.x > sc.x * p.y) ? length(p - sc * ra) : abs(length(p) - ra)) - rb;
}

/// Equilateral triangle with circumradius-like size r, pointing up.
/// @exact
/// @use play icons, warning signs, mountains, arrows, tri-patterns
float sdEquilateralTriangle(vec2 p, float r) {
    const float k = 1.7320508;
    p.x = abs(p.x) - r;
    p.y = p.y + r / k;
    if (p.x + k * p.y > 0.0) p = vec2(p.x - k * p.y, -k * p.x - p.y) / 2.0;
    p.x -= clamp(p.x, -2.0 * r, 0.0);
    return -length(p) * sign(p.y);
}

/// Arbitrary triangle p0, p1, p2 (any winding).
/// @exact
/// @use shards, low-poly art, arrowheads, beaks, teeth
float sdTriangle(vec2 p, vec2 p0, vec2 p1, vec2 p2) {
    vec2 e0 = p1 - p0, e1 = p2 - p1, e2 = p0 - p2;
    vec2 v0 = p - p0, v1 = p - p1, v2 = p - p2;
    vec2 pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
    vec2 pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
    vec2 pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
    float s = sign(e0.x * e2.y - e0.y * e2.x);
    vec2 d = min(min(vec2(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                     vec2(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                     vec2(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
    return -sqrt(d.x) * sign(d.y);
}

/// Regular n-gon with circumradius r, one vertex pointing up.
/// @exact
/// @use badges, hexagonal tiles, pentagons, stop signs, gems (2D)
float sdRegularPolygon(vec2 p, float r, int n) {
    float an = PI / float(n);
    vec2 acs = vec2(cos(an), sin(an));
    float len = length(p);
    if (len < 1e-12) return -r * acs.x;
    float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
    p = len * vec2(cos(bn), abs(sin(bn)));
    p -= r * acs;
    p.y += clamp(-p.y, 0.0, r * acs.y);
    return length(p) * sign(p.x);
}

/// Star with n points and outer radius r. m in [2, n] sets the inner angle: m = 2 is the spikiest and m = n is a regular n-gon.
/// @exact
/// @use stars, sparkles, badges, flowers (with opRound), sheriff badges
float sdStar(vec2 p, float r, int n, float m) {
    float an = PI / float(n);
    float en = PI / m;
    vec2 acs = vec2(cos(an), sin(an));
    vec2 ecs = vec2(cos(en), sin(en));
    float len = length(p);
    if (len < 1e-12) return -r * acs.x;
    float bn = mod(atan(p.x, p.y), 2.0 * an) - an;
    p = len * vec2(cos(bn), abs(sin(bn)));
    p -= r * acs;
    p += ecs * clamp(-dot(p, ecs), 0.0, r * acs.y / ecs.y);
    return length(p) * sign(p.x);
}

/// Vesica (lens): intersection of two circles of radius r whose centers sit at (+-d, 0). Points along Y. Needs d < r.
/// @exact
/// @use leaves, petals, eyes, fish bodies, almond shapes, gothic arches
float sdVesica(vec2 p, float r, float d) {
    p = abs(p);
    float b = sqrt(r * r - d * d);
    return ((p.y - b) * d > p.x * b) ? length(p - vec2(0.0, b))
                                     : length(p - vec2(-d, 0.0)) - r;
}

/// Crescent: disk ra at origin minus disk rb at (d, 0).
/// @exact
/// @use moons, claws, bananas (bent), shadows on spheres, logos
float sdMoon(vec2 p, float d, float ra, float rb) {
    p.y = abs(p.y);
    float a = (ra * ra - rb * rb + d * d) / (2.0 * d);
    float b = sqrt(max(ra * ra - a * a, 0.0));
    if (d * (p.x * b - p.y * a) > d * d * max(b - p.y, 0.0)) return length(p - vec2(a, b));
    return max(length(p) - ra, -(length(p - vec2(d, 0.0)) - rb));
}

/// Heart with its bottom tip at the origin, about 1 unit tall.
/// @exact
/// @use hearts, valentines, health icons, leaves (squashed)
float sdHeart(vec2 p) {
    p.x = abs(p.x);
    if (p.y + p.x > 1.0) return sqrt(dot2(p - vec2(0.25, 0.75))) - 0.35355339;
    return sqrt(min(dot2(p - vec2(0.0, 1.0)), dot2(p - 0.5 * max(p.x + p.y, 0.0)))) * sign(p.x - p.y);
}

/// Rhombus with half-diagonals b.
/// @exact
/// @use diamonds, kites, card suits, argyle, harlequin patterns
float sdRhombus(vec2 p, vec2 b) {
    p = abs(p);
    vec2 t = b - 2.0 * p;
    float h = clamp((t.x * b.x - t.y * b.y) / dot(b, b), -1.0, 1.0);
    float d = length(p - 0.5 * b * vec2(1.0 - h, 1.0 + h));
    return d * sign(p.x * b.y + p.y * b.x - b.x * b.y);
}

/// Ellipse with semi-axes r. A fast approximation: exact zero set, a bound outside up to about 2:1 aspect,
/// gradient above 1 inside and for flatter ellipses. Fine for fills and strokes; avoid for exact offsets.
/// @approx
/// @use eyes, pupils, ovals, shadows under objects, planet rings (with opOnion)
float sdEllipse(vec2 p, vec2 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    if (k1 < 1e-8) return -min(r.x, r.y);
    return k0 * (k0 - 1.0) / k1;
}

/// Unsigned distance to a quadratic Bezier curve A-B-C. Solves the closest-point cubic analytically.
/// Falls back to a segment when the curve degenerates to a line. Float error in the cubic solve is about 1e-4.
/// @exact
/// @use brush strokes, hair, calligraphy, tendrils, eyelashes, smooth paths, font-like curves
float sdQuadraticBezier(vec2 pos, vec2 A, vec2 B, vec2 C) {
    vec2 a = B - A;
    vec2 b = A - 2.0 * B + C;
    vec2 c = a * 2.0;
    vec2 d = A - pos;
    float bb = dot(b, b);
    if (bb < 1e-10) return sdSegment(pos, A, C);
    float kk = 1.0 / bb;
    float kx = kk * dot(a, b);
    float ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
    float kz = kk * dot(d, a);
    float pp = ky - kx * kx;
    float q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    float h = q * q + 4.0 * pp * pp * pp;
    float res;
    if (h >= 0.0) {
        h = sqrt(h);
        vec2 x = (vec2(h, -h) - q) / 2.0;
        vec2 uv = sign(x) * pow(abs(x), vec2(1.0 / 3.0));
        float t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
        res = dot2(d + (c + b * t) * t);
    } else {
        float z = sqrt(-pp);
        float v = acos(clamp(q / (pp * z * 2.0), -1.0, 1.0)) / 3.0;
        float m = cos(v);
        float n = sin(v) * 1.7320508;
        vec2 t = clamp(vec2(m + m, -n - m) * z - kx, 0.0, 1.0);
        res = min(dot2(d + (c + b * t.x) * t.x), dot2(d + (c + b * t.y) * t.y));
    }
    return sqrt(res);
}

/// Pie slice (circular sector) of radius r, symmetric about +Y. sc = vec2(sin, cos) of the half-aperture, which may
/// go up to pi (a full disk); past pi/2 the slice is concave.
/// @exact
/// @use pie charts, pac-man, fans, radar sweeps, pizza slices, clock wedges, 2D spotlight cones
float sdPie(vec2 p, vec2 sc, float r) {
    p.x = abs(p.x);
    float toArc = length(p) - r;
    float toEdge = length(p - sc * clamp(dot(p, sc), 0.0, r));   // straight edge from the center along sc
    float side = sign(sc.y * p.x - sc.x * p.y);                  // +1 beyond the aperture, -1 within it
    return max(toArc, toEdge * side);
}

/// Horseshoe: an arc of radius r over the top (half-aperture given by sc = vec2(sin, cos), as in sdArc) whose ends run on
/// as straight legs of length legLength along the arc's tangent, stroked with half-width w and round ends.
/// The legs must not cross the Y axis (keep legLength * |cos(aperture)| below r * sin(aperture)).
/// @exact
/// @use horseshoes, magnets, U-bends, arches with posts, croquet hoops, handles, headphones (2D)
float sdHorseshoe(vec2 p, vec2 sc, float r, float legLength, float w) {
    p.x = abs(p.x);
    vec2 end = r * sc;
    float leg = sdSegment(p, end, end + legLength * vec2(sc.y, -sc.x));
    return min(sdArc(p, sc, r, 0.0), leg) - w;
}

/// Parabolic arch: the region under y = h (1 - x^2 / w^2) and above y = 0, so half-width w at the base and height h.
/// The closest point on the curve is the largest root of a depressed cubic, solved in closed form.
/// @exact
/// @use arches, bridges, tunnels, domes, bullets, gothic windows, tents, fountain jets, bell curves
float sdParabolaSegment(vec2 p, float w, float h) {
    p.x = abs(p.x);
    float k = h / (w * w);   // curve y = h - k x^2
    // d/dx |p - (x, h - k x^2)|^2 = 0  <=>  x^3 + P x + Q = 0
    float P = (1.0 - 2.0 * k * (h - p.y)) / (2.0 * k * k);
    float Q = -p.x / (2.0 * k * k);
    float disc = 0.25 * Q * Q + P * P * P / 27.0;
    float x;
    if (disc >= 0.0) {
        float u = pow(-0.5 * Q + sqrt(disc), 1.0 / 3.0);   // Q <= 0, so no cancellation here
        float v = -P / (3.0 * max(u, 1e-20));
        x = -Q / max(u * u - u * v + v * v, 1e-30);         // = u + v, without cancelling u against v
    } else {
        float m = sqrt(-P / 3.0);
        x = 2.0 * m * cos(acos(clamp(-Q / (2.0 * m * m * m), -1.0, 1.0)) / 3.0);   // largest of three roots
    }
    // Q <= 0 means the squared distance falls from x = 0 up to the root, so clamping the root to the arc is exact
    x = clamp(x, 0.0, w);
    float d = min(length(p - vec2(x, h - k * x * x)), length(p - vec2(min(p.x, w), 0.0)));
    return (p.y > 0.0 && p.y < h - k * p.x * p.x) ? -d : d;
}

/// Egg built from four tangent arcs (Moss-style): a bottom half-disk of radius ra centered at the origin, a top cap of
/// radius rb, and two side arcs of radius 2 ra joining them. rb = ra is a disk; smaller rb makes a pointier egg.
/// Spans y from -ra to sqrt((2 ra - rb)^2 - ra^2) + rb. Needs 0 < rb <= ra.
/// @exact
/// @use eggs, droplets, pebbles, seeds, cartoon heads and bodies, onion domes (flip y), Easter eggs
float sdEgg(vec2 p, float ra, float rb) {
    p.x = abs(p.x);
    float c = sqrt((2.0 * ra - rb) * (2.0 * ra - rb) - ra * ra);   // height of the cap center
    if (p.y < 0.0) return length(p) - ra;
    // past the line from the right arc's center (-ra, 0) through the cap center, the cap is nearest
    if (ra * p.y > c * (p.x + ra)) return length(p - vec2(0.0, c)) - rb;
    return length(p + vec2(ra, 0.0)) - 2.0 * ra;
}
`;
var SDF2D_WGSL = `//! sdf2d: 2D signed distance primitives for posters, icons, UI, motion graphics, and as profiles for
//! opExtrude / opRevolve. Centered at the origin unless noted. Negative inside.
//! Formulas follow Inigo Quilez's 2D distance catalog (article "2D distance functions").
//! Implementations are original and tested (sign, Lipschitz, brute-force distance for curves).
//! Tags: @exact true distance, @bound never overestimates, @approx exact zero set but may overestimate in places.

/// Circle of radius r.
/// @exact
/// @use dots, eyes, suns, bubbles, rings (with opOnion)
fn sdCircle(p: vec2f, r: f32) -> f32 { return length(p) - r; }

/// Axis-aligned rectangle with half-extents b.
/// @exact
/// @use panels, bars, windows, buttons, building silhouettes
fn sdBox_f2f2(p: vec2f, b: vec2f) -> f32 {
    let d = abs(p) - b;
    return length(max(d, vec2f(0.0))) + min(max(d.x, d.y), 0.0);
}

/// Rectangle with half-extents b and per-corner radii r = (top-right, bottom-right, top-left, bottom-left).
/// @exact
/// @use UI cards, buttons, speech bubbles, tags, rounded windows
fn sdRoundedBox(p: vec2f, b: vec2f, r: vec4f) -> f32 {
    var r_ = r;
    r_ = vec4f(select(r_.zw, r_.xy, p.x > 0.0), r_.zw);
    r_.x = select(r_.y, r_.x, p.y > 0.0);
    let q = abs(p) - b + r_.x;
    return min(max(q.x, q.y), 0.0) + length(max(q, vec2f(0.0))) - r_.x;
}

/// Unsigned distance to segment a-b. Subtract a width to get a stroke.
/// @exact
/// @use lines, strokes, stems, rays, hands of a clock, rain streaks
fn sdSegment(p: vec2f, a: vec2f, b: vec2f) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h);
}

/// Tapered capsule: circle r1 at origin hulled with circle r2 at (0, h).
/// @exact
/// @use petals, tails, teardrops, brush dabs, fingers, flames
fn sdUnevenCapsule(p: vec2f, r1: f32, r2: f32, h: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    let b = (r1 - r2) / h;
    let a = sqrt(1.0 - b * b);
    let k = dot(p_, vec2f(-b, a));
    if (k < 0.0) { return length(p_) - r1; }
    if (k > a * h) { return length(p_ - vec2f(0.0, h)) - r2; }
    return dot(p_, vec2f(a, b)) - r1;
}

/// Circular arc symmetric about +Y. sc = vec2f(sin, cos) of the half-aperture, ra = radius, rb = stroke half-width.
/// @exact
/// @use smiles, eyebrows, rainbows, gauges, progress rings, horseshoes
fn sdArc(p: vec2f, sc: vec2f, ra: f32, rb: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    return select(abs(length(p_) - ra), length(p_ - sc * ra), sc.y * p_.x > sc.x * p_.y) - rb;
}

/// Equilateral triangle with circumradius-like size r, pointing up.
/// @exact
/// @use play icons, warning signs, mountains, arrows, tri-patterns
fn sdEquilateralTriangle(p: vec2f, r: f32) -> f32 {
    const k: f32 = 1.7320508;
    var p_ = p;
    p_.x = abs(p_.x) - r;
    p_.y = p_.y + r / k;
    if (p_.x + k * p_.y > 0.0) { p_ = vec2f(p_.x - k * p_.y, -k * p_.x - p_.y) / 2.0; }
    p_.x -= clamp(p_.x, -2.0 * r, 0.0);
    return -length(p_) * sign(p_.y);
}

/// Arbitrary triangle p0, p1, p2 (any winding).
/// @exact
/// @use shards, low-poly art, arrowheads, beaks, teeth
fn sdTriangle(p: vec2f, p0: vec2f, p1: vec2f, p2: vec2f) -> f32 {
    let e0 = p1 - p0;
    let e1 = p2 - p1;
    let e2 = p0 - p2;
    let v0 = p - p0;
    let v1 = p - p1;
    let v2 = p - p2;
    let pq0 = v0 - e0 * clamp(dot(v0, e0) / dot(e0, e0), 0.0, 1.0);
    let pq1 = v1 - e1 * clamp(dot(v1, e1) / dot(e1, e1), 0.0, 1.0);
    let pq2 = v2 - e2 * clamp(dot(v2, e2) / dot(e2, e2), 0.0, 1.0);
    let s = sign(e0.x * e2.y - e0.y * e2.x);
    let d = min(min(vec2f(dot(pq0, pq0), s * (v0.x * e0.y - v0.y * e0.x)),
                    vec2f(dot(pq1, pq1), s * (v1.x * e1.y - v1.y * e1.x))),
                    vec2f(dot(pq2, pq2), s * (v2.x * e2.y - v2.y * e2.x)));
    return -sqrt(d.x) * sign(d.y);
}

/// Regular n-gon with circumradius r, one vertex pointing up.
/// @exact
/// @use badges, hexagonal tiles, pentagons, stop signs, gems (2D)
fn sdRegularPolygon(p: vec2f, r: f32, n: i32) -> f32 {
    let an = PI / f32(n);
    let acs = vec2f(cos(an), sin(an));
    let len = length(p);
    if (len < 1e-12) { return -r * acs.x; }
    let angle = atan2(p.x, p.y);
    let period = 2.0 * an;
    let bn = (angle - period * floor(angle / period)) - an;
    var p_ = len * vec2f(cos(bn), abs(sin(bn)));
    p_ -= r * acs;
    p_.y += clamp(-p_.y, 0.0, r * acs.y);
    return length(p_) * sign(p_.x);
}

/// Star with n points and outer radius r. m in [2, n] sets the inner angle: m = 2 is the spikiest and m = n is a regular n-gon.
/// @exact
/// @use stars, sparkles, badges, flowers (with opRound), sheriff badges
fn sdStar(p: vec2f, r: f32, n: i32, m: f32) -> f32 {
    let an = PI / f32(n);
    let en = PI / m;
    let acs = vec2f(cos(an), sin(an));
    let ecs = vec2f(cos(en), sin(en));
    let len = length(p);
    if (len < 1e-12) { return -r * acs.x; }
    let angle = atan2(p.x, p.y);
    let period = 2.0 * an;
    let bn = (angle - period * floor(angle / period)) - an;
    var p_ = len * vec2f(cos(bn), abs(sin(bn)));
    p_ -= r * acs;
    p_ += ecs * clamp(-dot(p_, ecs), 0.0, r * acs.y / ecs.y);
    return length(p_) * sign(p_.x);
}

/// Vesica (lens): intersection of two circles of radius r whose centers sit at (+-d, 0). Points along Y. Needs d < r.
/// @exact
/// @use leaves, petals, eyes, fish bodies, almond shapes, gothic arches
fn sdVesica(p: vec2f, r: f32, d: f32) -> f32 {
    let p_ = abs(p);
    let b = sqrt(r * r - d * d);
    return select(length(p_ - vec2f(-d, 0.0)) - r, length(p_ - vec2f(0.0, b)), (p_.y - b) * d > p_.x * b);
}

/// Crescent: disk ra at origin minus disk rb at (d, 0).
/// @exact
/// @use moons, claws, bananas (bent), shadows on spheres, logos
fn sdMoon(p: vec2f, d: f32, ra: f32, rb: f32) -> f32 {
    var p_ = p;
    p_.y = abs(p_.y);
    let a = (ra * ra - rb * rb + d * d) / (2.0 * d);
    let b = sqrt(max(ra * ra - a * a, 0.0));
    if (d * (p_.x * b - p_.y * a) > d * d * max(b - p_.y, 0.0)) { return length(p_ - vec2f(a, b)); }
    return max(length(p_) - ra, -(length(p_ - vec2f(d, 0.0)) - rb));
}

/// Heart with its bottom tip at the origin, about 1 unit tall.
/// @exact
/// @use hearts, valentines, health icons, leaves (squashed)
fn sdHeart(p: vec2f) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    if (p_.y + p_.x > 1.0) { return sqrt(dot2_f2(p_ - vec2f(0.25, 0.75))) - 0.35355339; }
    return sqrt(min(dot2_f2(p_ - vec2f(0.0, 1.0)), dot2_f2(p_ - 0.5 * max(p_.x + p_.y, 0.0)))) * sign(p_.x - p_.y);
}

/// Rhombus with half-diagonals b.
/// @exact
/// @use diamonds, kites, card suits, argyle, harlequin patterns
fn sdRhombus(p: vec2f, b: vec2f) -> f32 {
    let p_ = abs(p);
    let t = b - 2.0 * p_;
    let h = clamp((t.x * b.x - t.y * b.y) / dot(b, b), -1.0, 1.0);
    let d = length(p_ - 0.5 * b * vec2f(1.0 - h, 1.0 + h));
    return d * sign(p_.x * b.y + p_.y * b.x - b.x * b.y);
}

/// Ellipse with semi-axes r. A fast approximation: exact zero set, a bound outside up to about 2:1 aspect,
/// gradient above 1 inside and for flatter ellipses. Fine for fills and strokes; avoid for exact offsets.
/// @approx
/// @use eyes, pupils, ovals, shadows under objects, planet rings (with opOnion)
fn sdEllipse(p: vec2f, r: vec2f) -> f32 {
    let k0 = length(p / r);
    let k1 = length(p / (r * r));
    if (k1 < 1e-8) { return -min(r.x, r.y); }
    return k0 * (k0 - 1.0) / k1;
}

/// Unsigned distance to a quadratic Bezier curve A-B-C. Solves the closest-point cubic analytically.
/// Falls back to a segment when the curve degenerates to a line. Float error in the cubic solve is about 1e-4.
/// @exact
/// @use brush strokes, hair, calligraphy, tendrils, eyelashes, smooth paths, font-like curves
fn sdQuadraticBezier_f2f2f2f2(pos: vec2f, A: vec2f, B: vec2f, C: vec2f) -> f32 {
    let a = B - A;
    let b = A - 2.0 * B + C;
    let c = a * 2.0;
    let d = A - pos;
    let bb = dot(b, b);
    if (bb < 1e-10) { return sdSegment(pos, A, C); }
    let kk = 1.0 / bb;
    let kx = kk * dot(a, b);
    let ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
    let kz = kk * dot(d, a);
    let pp = ky - kx * kx;
    let q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    var h = q * q + 4.0 * pp * pp * pp;
    var res: f32;
    if (h >= 0.0) {
        h = sqrt(h);
        let x = (vec2f(h, -h) - q) / 2.0;
        let uv = sign(x) * pow(abs(x), vec2f(1.0f / 3.0f));
        let t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
        res = dot2_f2(d + (c + b * t) * t);
    } else {
        let z = sqrt(-pp);
        let v = acos(clamp(q / (pp * z * 2.0), -1.0, 1.0)) / 3.0;
        let m = cos(v);
        let n = sin(v) * 1.7320508;
        let t = clamp(vec2f(m + m, -n - m) * z - kx, vec2f(0.0), vec2f(1.0));
        res = min(dot2_f2(d + (c + b * t.x) * t.x), dot2_f2(d + (c + b * t.y) * t.y));
    }
    return sqrt(res);
}

/// Pie slice (circular sector) of radius r, symmetric about +Y. sc = vec2f(sin, cos) of the half-aperture, which may
/// go up to pi (a full disk); past pi/2 the slice is concave.
/// @exact
/// @use pie charts, pac-man, fans, radar sweeps, pizza slices, clock wedges, 2D spotlight cones
fn sdPie(p: vec2f, sc: vec2f, r: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    let toArc = length(p_) - r;
    let toEdge = length(p_ - sc * clamp(dot(p_, sc), 0.0, r));   // straight edge from the center along sc
    let side = sign(sc.y * p_.x - sc.x * p_.y);                  // +1 beyond the aperture, -1 within it
    return max(toArc, toEdge * side);
}

/// Horseshoe: an arc of radius r over the top (half-aperture given by sc = vec2f(sin, cos), as in sdArc) whose ends run on
/// as straight legs of length legLength along the arc's tangent, stroked with half-width w and round ends.
/// The legs must not cross the Y axis (keep legLength * |cos(aperture)| below r * sin(aperture)).
/// @exact
/// @use horseshoes, magnets, U-bends, arches with posts, croquet hoops, handles, headphones (2D)
fn sdHorseshoe(p: vec2f, sc: vec2f, r: f32, legLength: f32, w: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    let end = r * sc;
    let leg = sdSegment(p_, end, end + legLength * vec2f(sc.y, -sc.x));
    return min(sdArc(p_, sc, r, 0.0), leg) - w;
}

/// Parabolic arch: the region under y = h (1 - x^2 / w^2) and above y = 0, so half-width w at the base and height h.
/// The closest point on the curve is the largest root of a depressed cubic, solved in closed form.
/// @exact
/// @use arches, bridges, tunnels, domes, bullets, gothic windows, tents, fountain jets, bell curves
fn sdParabolaSegment(p: vec2f, w: f32, h: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    let k = h / (w * w);   // curve y = h - k x^2
    // d/dx |p - (x, h - k x^2)|^2 = 0  <=>  x^3 + P x + Q = 0
    let P = (1.0 - 2.0 * k * (h - p_.y)) / (2.0 * k * k);
    let Q = -p_.x / (2.0 * k * k);
    let disc = 0.25 * Q * Q + P * P * P / 27.0;
    var x: f32;
    if (disc >= 0.0) {
        let u = pow(-0.5 * Q + sqrt(disc), 1.0f / 3.0f);   // Q <= 0, so no cancellation here
        let v = -P / (3.0 * max(u, 1e-20));
        x = -Q / max(u * u - u * v + v * v, 1e-30);         // = u + v, without cancelling u against v
    } else {
        let m = sqrt(-P / 3.0);
        x = 2.0 * m * cos(acos(clamp(-Q / (2.0 * m * m * m), -1.0, 1.0)) / 3.0);   // largest of three roots
    }
    // Q <= 0 means the squared distance falls from x = 0 up to the root, so clamping the root to the arc is exact
    x = clamp(x, 0.0, w);
    let d = min(length(p_ - vec2f(x, h - k * x * x)), length(p_ - vec2f(min(p_.x, w), 0.0)));
    return select(d, -d, p_.y > 0.0 && p_.y < h - k * p_.x * p_.x);
}

/// Egg built from four tangent arcs (Moss-style): a bottom half-disk of radius ra centered at the origin, a top cap of
/// radius rb, and two side arcs of radius 2 ra joining them. rb = ra is a disk; smaller rb makes a pointier egg.
/// Spans y from -ra to sqrt((2 ra - rb)^2 - ra^2) + rb. Needs 0 < rb <= ra.
/// @exact
/// @use eggs, droplets, pebbles, seeds, cartoon heads and bodies, onion domes (flip y), Easter eggs
fn sdEgg(p: vec2f, ra: f32, rb: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    let c = sqrt((2.0 * ra - rb) * (2.0 * ra - rb) - ra * ra);   // height of the cap center
    if (p_.y < 0.0) { return length(p_) - ra; }
    // past the line from the right arc's center (-ra, 0) through the cap center, the cap is nearest
    if (ra * p_.y > c * (p_.x + ra)) { return length(p_ - vec2f(0.0, c)) - rb; }
    return length(p_ + vec2f(ra, 0.0)) - 2.0 * ra;
}
`;

// src/knowledge/shader-craft/library/modules/sdf3d.ts
var SDF3D_GLSL = `//! sdf3d: 3D signed distance primitives. Each one is centered at the origin unless noted. Move or rotate the
//! point before calling (sdBox(p - center, size)), never the result.
//! Exactness tags:
//!   @exact  true Euclidean distance inside and outside (safe for smooth blending, AO, soft shadows, offsets)
//!   @bound  never overestimates (Lipschitz <= 1), so raymarching is safe, but offsets and blends are less accurate
//!   @approx exact zero set but may overestimate in places (see the function's note for the safe stepScale)
//! Formulas follow Inigo Quilez's distance-function catalog (article "distance functions").
//! Implementations here are original and checked by the upstream tests (sign, Lipschitz bound, eikonal).

/// Sphere of radius r.
/// @exact
/// @use heads, eyes, fruit, planets, bubbles, joints
float sdSphere(vec3 p, float r) { return length(p) - r; }

/// Axis-aligned box with half-extents b.
/// @exact
/// @use buildings, crates, bricks, pedestals, furniture
float sdBox(vec3 p, vec3 b) {
    vec3 q = abs(p) - b;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0);
}

/// Box with rounded edges. The outer size stays b; r is the edge radius (r <= min(b)).
/// @exact
/// @use toys, product shots, soft architecture, dice, phone-like slabs
float sdRoundBox(vec3 p, vec3 b, float r) {
    vec3 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

/// Wireframe box: edges of a box with half-extents b and edge thickness e.
/// @exact
/// @use scaffolding, cages, display frames, sci-fi structures
float sdBoxFrame(vec3 p, vec3 b, float e) {
    p = abs(p) - b;
    vec3 q = abs(p + e) - e;
    return min(min(
        length(max(vec3(p.x, q.y, q.z), 0.0)) + min(max(p.x, max(q.y, q.z)), 0.0),
        length(max(vec3(q.x, p.y, q.z), 0.0)) + min(max(q.x, max(p.y, q.z)), 0.0)),
        length(max(vec3(q.x, q.y, p.z), 0.0)) + min(max(q.x, max(q.y, p.z)), 0.0));
}

/// Torus in the XZ plane. t.x = major radius, t.y = tube radius.
/// @exact
/// @use rings, donuts, tires, halos, lifebuoys
float sdTorus(vec3 p, vec2 t) {
    vec2 q = vec2(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

/// Partial torus (arc) in the XY plane, symmetric about +Y. sc = vec2(sin, cos) of the half-aperture angle,
/// ra = major radius, rb = tube radius.
/// @exact
/// @use horns, handles, eyebrows, arches, croissant shapes, magnets
float sdCappedTorus(vec3 p, vec2 sc, float ra, float rb) {
    p.x = abs(p.x);
    float k = (sc.y * p.x > sc.x * p.y) ? dot(p.xy, sc) : length(p.xy);
    return sqrt(max(dot(p, p) + ra * ra - 2.0 * ra * k, 0.0)) - rb;
}

/// Chain link: a torus stretched along Y by le. r1 = major radius, r2 = tube radius.
/// @exact
/// @use chains, rings, jewelry, fences
float sdLink(vec3 p, float le, float r1, float r2) {
    vec3 q = vec3(p.x, max(abs(p.y) - le, 0.0), p.z);
    return length(vec2(length(q.xy) - r1, q.z)) - r2;
}

/// Infinite plane through the origin offset by h along unit normal n: dot(p, n) + h.
/// @exact
/// @use ground, walls, water surface, clipping half-spaces
float sdPlane(vec3 p, vec3 n, float h) { return dot(p, n) + h; }

/// Capsule: segment a-b swept by radius r.
/// @exact
/// @use limbs, fingers, branches, hair strands, pills, bones
float sdCapsule(vec3 p, vec3 a, vec3 b, float r) {
    vec3 pa = p - a, ba = b - a;
    float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

/// Vertical capsule from y = 0 to y = h, radius r.
/// @exact
/// @use upright limbs, posts, bottles, candles
float sdVerticalCapsule(vec3 p, float h, float r) {
    p.y -= clamp(p.y, 0.0, h);
    return length(p) - r;
}

/// Vertical capped cylinder from y = -h to y = +h, radius r.
/// @exact
/// @use columns, cans, coins, logs, wheels (rotate first)
float sdCylinder(vec3 p, float h, float r) {
    vec2 d = abs(vec2(length(p.xz), p.y)) - vec2(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

/// Capped cone (frustum) from y = -h (radius r1) to y = +h (radius r2). Set r2 = 0 for a pointed cone.
/// Exact everywhere, including the base cap. Points below the base are outside.
/// @exact
/// @use trees, roofs, spikes, lampshades, volcanoes, party hats, vases
float sdCappedCone(vec3 p, float h, float r1, float r2) {
    vec2 q = vec2(length(p.xz), p.y);
    vec2 top = vec2(r2, h);
    vec2 side = vec2(r2 - r1, 2.0 * h);
    vec2 toCap = vec2(q.x - min(q.x, (q.y < 0.0) ? r1 : r2), abs(q.y) - h);
    vec2 toSide = q - top + side * clamp(dot(top - q, side) / dot2(side), 0.0, 1.0);
    float s = (toSide.x < 0.0 && toCap.y < 0.0) ? -1.0 : 1.0;
    return s * sqrt(min(dot2(toCap), dot2(toSide)));
}

/// Pointed cone with its base disk (radius r) at y = 0 and apex at y = h.
/// @exact
/// @use evergreen trees, spikes, horns, mountains, wizard hats
float sdCone(vec3 p, float h, float r) {
    return sdCappedCone(p - vec3(0.0, 0.5 * h, 0.0), 0.5 * h, r, 0.0);
}

/// Round cone: sphere r1 at y = 0 smoothly hulled with sphere r2 at y = h.
/// @exact
/// @use limbs, fingers, tree trunks, carrots, teardrops, tentacle segments
float sdRoundCone(vec3 p, float r1, float r2, float h) {
    float b = (r1 - r2) / h;
    float a = sqrt(1.0 - b * b);
    vec2 q = vec2(length(p.xz), p.y);
    float k = dot(q, vec2(-b, a));
    if (k < 0.0) return length(q) - r1;
    if (k > a * h) return length(q - vec2(0.0, h)) - r2;
    return dot(q, vec2(a, b)) - r1;
}

/// Ellipsoid with semi-axes r. A fast approximation: the zero set is exact and the field is a bound outside for
/// aspect ratios up to about 2:1. Inside, and for more stretched ellipsoids, the gradient exceeds 1 (measured: 2.5
/// at 4:1). March with stepScale 0.7-0.8 there, or build long shapes from sdCapsule / sdRoundCone instead.
/// @approx
/// @use heads, bodies, eggs, pebbles, leaves (flat), muscles, clouds of blobs
float sdEllipsoid(vec3 p, vec3 r) {
    float k0 = length(p / r);
    float k1 = length(p / (r * r));
    if (k1 < 1e-8) return -min(r.x, min(r.y, r.z));
    return k0 * (k0 - 1.0) / k1;
}

/// Hollow spherical cap (bowl) of radius r, cut by the plane y = h, with shell thickness t. The opening faces +Y.
/// @exact
/// @use bowls, cups, helmets, shells, satellite dishes, eye sockets
float sdCutHollowSphere(vec3 p, float r, float h, float t) {
    float w = sqrt(r * r - h * h);
    vec2 q = vec2(length(p.xz), p.y);
    return ((h * q.x < w * q.y) ? length(q - vec2(w, h)) : abs(length(q) - r)) - t;
}

/// Hexagonal prism along Z. h.x = inradius of the hexagon, h.y = half-length.
/// @exact
/// @use pencils, bolts, crystals, basalt columns, honeycomb cells
float sdHexPrism(vec3 p, vec2 h) {
    const vec3 k = vec3(-0.8660254, 0.5, 0.57735027);
    p = abs(p);
    p.xy -= 2.0 * min(dot(k.xy, p.xy), 0.0) * k.xy;
    vec2 d = vec2(length(p.xy - vec2(clamp(p.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p.y - h.x),
                  p.z - h.y);
    return min(max(d.x, d.y), 0.0) + length(max(d, 0.0));
}

/// Regular octahedron with "radius" s (vertex distance from center). Bound version.
/// @bound
/// @use gems, crystals, diamonds, abstract motifs
float sdOctahedron(vec3 p, float s) {
    p = abs(p);
    return (p.x + p.y + p.z - s) * 0.57735027;
}

/// Gyroid sheet with cell scale \`scale\` and half-thickness t. The infinite triply-periodic surface
/// sin x cos y + sin y cos z + sin z cos x = 0. Intersect with a bounding shape.
/// @bound
/// @use lattices, coral, bone interiors, sponges, sci-fi infill, organic architecture
float sdGyroid(vec3 p, float scale, float t) {
    p *= scale;
    float g = dot(sin(p), cos(p.yzx));
    return (abs(g) / scale - t) * 0.57735027;
}

/// Sphere of radius r cut by the plane y = h, keeping the cap ABOVE the plane. h = 0 gives a dome on the ground;
/// negative h keeps more than half. Needs |h| < r.
/// @exact
/// @use domes, mushroom caps, half-buried rocks, igloos, bread loaves
float sdCutSphere(vec3 p, float r, float h) {
    float w = sqrt(max(r * r - h * h, 0.0));
    vec2 q = vec2(length(p.xz), p.y);
    float s = max((h - r) * q.x * q.x + w * w * (h + r - 2.0 * q.y), h * q.x - w * q.y);
    return (s < 0.0) ? length(q) - r : (q.x < w) ? h - q.y : length(q - vec2(w, h));
}

/// Sphere ra at the origin with sphere rb at (d, 0, 0) carved out, exact including the crease rim.
/// A plain opSubtract of two spheres is only a bound.
/// @exact
/// @use eye sockets, craters, bitten fruit, nostrils, scooped shapes
float sdDeathStar(vec3 p, float ra, float rb, float d) {
    float a = (ra * ra - rb * rb + d * d) / (2.0 * d);
    float b = sqrt(max(ra * ra - a * a, 0.0));
    vec2 q = vec2(p.x, length(p.yz));
    if (q.x * b - q.y * a > d * max(b - q.y, 0.0)) return length(q - vec2(a, b));
    return max(length(q) - ra, -(length(q - vec2(d, 0.0)) - rb));
}

/// Unsigned distance to a 3D quadratic Bezier curve A-B-C; subtract a radius for a tube.
/// Solves the closest-point cubic analytically. Falls back to a segment when the curve is straight.
/// @exact
/// @use hair strands, tentacles, stems, whiskers, horns, cables, curved tubes
float sdQuadraticBezier(vec3 pos, vec3 A, vec3 B, vec3 C) {
    vec3 a = B - A;
    vec3 b = A - 2.0 * B + C;
    vec3 c = a * 2.0;
    vec3 d = A - pos;
    float bb = dot(b, b);
    if (bb < 1e-10) {
        vec3 pa = pos - A, ca = C - A;
        return length(pa - ca * clamp(dot(pa, ca) / dot(ca, ca), 0.0, 1.0));
    }
    float kk = 1.0 / bb;
    float kx = kk * dot(a, b);
    float ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
    float kz = kk * dot(d, a);
    float pp = ky - kx * kx;
    float q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    float h = q * q + 4.0 * pp * pp * pp;
    float res;
    if (h >= 0.0) {
        h = sqrt(h);
        vec2 x = (vec2(h, -h) - q) / 2.0;
        vec2 uv = sign(x) * pow(abs(x), vec2(1.0 / 3.0));
        float t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
        res = dot2(d + (c + b * t) * t);
    } else {
        float z = sqrt(-pp);
        float v = acos(clamp(q / (pp * z * 2.0), -1.0, 1.0)) / 3.0;
        float m = cos(v);
        float n = sin(v) * 1.7320508;
        vec2 t = clamp(vec2(m + m, -n - m) * z - kx, 0.0, 1.0);
        res = min(dot2(d + (c + b * t.x) * t.x), dot2(d + (c + b * t.y) * t.y));
    }
    return sqrt(res);
}
`;
var SDF3D_WGSL = `//! sdf3d: 3D signed distance primitives. Each one is centered at the origin unless noted. Move or rotate the
//! point before calling (sdBox(p - center, size)), never the result.
//! Exactness tags:
//!   @exact  true Euclidean distance inside and outside (safe for smooth blending, AO, soft shadows, offsets)
//!   @bound  never overestimates (Lipschitz <= 1), so raymarching is safe, but offsets and blends are less accurate
//!   @approx exact zero set but may overestimate in places (see the function's note for the safe stepScale)
//! Formulas follow Inigo Quilez's distance-function catalog (article "distance functions").
//! Implementations here are original and checked by the upstream tests (sign, Lipschitz bound, eikonal).

/// Sphere of radius r.
/// @exact
/// @use heads, eyes, fruit, planets, bubbles, joints
fn sdSphere(p: vec3f, r: f32) -> f32 { return length(p) - r; }

/// Axis-aligned box with half-extents b.
/// @exact
/// @use buildings, crates, bricks, pedestals, furniture
fn sdBox_f3f3(p: vec3f, b: vec3f) -> f32 {
    let q = abs(p) - b;
    return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0);
}

/// Box with rounded edges. The outer size stays b; r is the edge radius (r <= min(b)).
/// @exact
/// @use toys, product shots, soft architecture, dice, phone-like slabs
fn sdRoundBox(p: vec3f, b: vec3f, r: f32) -> f32 {
    let q = abs(p) - b + r;
    return length(max(q, vec3f(0.0))) + min(max(q.x, max(q.y, q.z)), 0.0) - r;
}

/// Wireframe box: edges of a box with half-extents b and edge thickness e.
/// @exact
/// @use scaffolding, cages, display frames, sci-fi structures
fn sdBoxFrame(p: vec3f, b: vec3f, e: f32) -> f32 {
    let p_ = abs(p) - b;
    let q = abs(p_ + e) - e;
    return min(min(
        length(max(vec3f(p_.x, q.y, q.z), vec3f(0.0))) + min(max(p_.x, max(q.y, q.z)), 0.0),
        length(max(vec3f(q.x, p_.y, q.z), vec3f(0.0))) + min(max(q.x, max(p_.y, q.z)), 0.0)),
        length(max(vec3f(q.x, q.y, p_.z), vec3f(0.0))) + min(max(q.x, max(q.y, p_.z)), 0.0));
}

/// Torus in the XZ plane. t.x = major radius, t.y = tube radius.
/// @exact
/// @use rings, donuts, tires, halos, lifebuoys
fn sdTorus(p: vec3f, t: vec2f) -> f32 {
    let q = vec2f(length(p.xz) - t.x, p.y);
    return length(q) - t.y;
}

/// Partial torus (arc) in the XY plane, symmetric about +Y. sc = vec2f(sin, cos) of the half-aperture angle,
/// ra = major radius, rb = tube radius.
/// @exact
/// @use horns, handles, eyebrows, arches, croissant shapes, magnets
fn sdCappedTorus(p: vec3f, sc: vec2f, ra: f32, rb: f32) -> f32 {
    var p_ = p;
    p_.x = abs(p_.x);
    let k = select(length(p_.xy), dot(p_.xy, sc), sc.y * p_.x > sc.x * p_.y);
    return sqrt(max(dot(p_, p_) + ra * ra - 2.0 * ra * k, 0.0)) - rb;
}

/// Chain link: a torus stretched along Y by le. r1 = major radius, r2 = tube radius.
/// @exact
/// @use chains, rings, jewelry, fences
fn sdLink(p: vec3f, le: f32, r1: f32, r2: f32) -> f32 {
    let q = vec3f(p.x, max(abs(p.y) - le, 0.0), p.z);
    return length(vec2f(length(q.xy) - r1, q.z)) - r2;
}

/// Infinite plane through the origin offset by h along unit normal n: dot(p, n) + h.
/// @exact
/// @use ground, walls, water surface, clipping half-spaces
fn sdPlane(p: vec3f, n: vec3f, h: f32) -> f32 { return dot(p, n) + h; }

/// Capsule: segment a-b swept by radius r.
/// @exact
/// @use limbs, fingers, branches, hair strands, pills, bones
fn sdCapsule(p: vec3f, a: vec3f, b: vec3f, r: f32) -> f32 {
    let pa = p - a;
    let ba = b - a;
    let h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
    return length(pa - ba * h) - r;
}

/// Vertical capsule from y = 0 to y = h, radius r.
/// @exact
/// @use upright limbs, posts, bottles, candles
fn sdVerticalCapsule(p: vec3f, h: f32, r: f32) -> f32 {
    var p_ = p;
    p_.y -= clamp(p_.y, 0.0, h);
    return length(p_) - r;
}

/// Vertical capped cylinder from y = -h to y = +h, radius r.
/// @exact
/// @use columns, cans, coins, logs, wheels (rotate first)
fn sdCylinder(p: vec3f, h: f32, r: f32) -> f32 {
    let d = abs(vec2f(length(p.xz), p.y)) - vec2f(r, h);
    return min(max(d.x, d.y), 0.0) + length(max(d, vec2f(0.0)));
}

/// Capped cone (frustum) from y = -h (radius r1) to y = +h (radius r2). Set r2 = 0 for a pointed cone.
/// Exact everywhere, including the base cap. Points below the base are outside.
/// @exact
/// @use trees, roofs, spikes, lampshades, volcanoes, party hats, vases
fn sdCappedCone(p: vec3f, h: f32, r1: f32, r2: f32) -> f32 {
    let q = vec2f(length(p.xz), p.y);
    let top = vec2f(r2, h);
    let side = vec2f(r2 - r1, 2.0 * h);
    let toCap = vec2f(q.x - min(q.x, select(r2, r1, q.y < 0.0)), abs(q.y) - h);
    let toSide = q - top + side * clamp(dot(top - q, side) / dot2_f2(side), 0.0, 1.0);
    let s = select(1.0, -1.0, toSide.x < 0.0 && toCap.y < 0.0);
    return s * sqrt(min(dot2_f2(toCap), dot2_f2(toSide)));
}

/// Pointed cone with its base disk (radius r) at y = 0 and apex at y = h.
/// @exact
/// @use evergreen trees, spikes, horns, mountains, wizard hats
fn sdCone(p: vec3f, h: f32, r: f32) -> f32 {
    return sdCappedCone(p - vec3f(0.0, 0.5 * h, 0.0), 0.5 * h, r, 0.0);
}

/// Round cone: sphere r1 at y = 0 smoothly hulled with sphere r2 at y = h.
/// @exact
/// @use limbs, fingers, tree trunks, carrots, teardrops, tentacle segments
fn sdRoundCone(p: vec3f, r1: f32, r2: f32, h: f32) -> f32 {
    let b = (r1 - r2) / h;
    let a = sqrt(1.0 - b * b);
    let q = vec2f(length(p.xz), p.y);
    let k = dot(q, vec2f(-b, a));
    if (k < 0.0) { return length(q) - r1; }
    if (k > a * h) { return length(q - vec2f(0.0, h)) - r2; }
    return dot(q, vec2f(a, b)) - r1;
}

/// Ellipsoid with semi-axes r. A fast approximation: the zero set is exact and the field is a bound outside for
/// aspect ratios up to about 2:1. Inside, and for more stretched ellipsoids, the gradient exceeds 1 (measured: 2.5
/// at 4:1). March with stepScale 0.7-0.8 there, or build long shapes from sdCapsule / sdRoundCone instead.
/// @approx
/// @use heads, bodies, eggs, pebbles, leaves (flat), muscles, clouds of blobs
fn sdEllipsoid(p: vec3f, r: vec3f) -> f32 {
    let k0 = length(p / r);
    let k1 = length(p / (r * r));
    if (k1 < 1e-8) { return -min(r.x, min(r.y, r.z)); }
    return k0 * (k0 - 1.0) / k1;
}

/// Hollow spherical cap (bowl) of radius r, cut by the plane y = h, with shell thickness t. The opening faces +Y.
/// @exact
/// @use bowls, cups, helmets, shells, satellite dishes, eye sockets
fn sdCutHollowSphere(p: vec3f, r: f32, h: f32, t: f32) -> f32 {
    let w = sqrt(r * r - h * h);
    let q = vec2f(length(p.xz), p.y);
    return select(abs(length(q) - r), length(q - vec2f(w, h)), h * q.x < w * q.y) - t;
}

/// Hexagonal prism along Z. h.x = inradius of the hexagon, h.y = half-length.
/// @exact
/// @use pencils, bolts, crystals, basalt columns, honeycomb cells
fn sdHexPrism(p: vec3f, h: vec2f) -> f32 {
    const k = vec3f(-0.8660254, 0.5, 0.57735027);
    var p_ = abs(p);
    p_ = vec3f(p_.xy - 2.0 * min(dot(k.xy, p_.xy), 0.0) * k.xy, p_.z);
    let d = vec2f(length(p_.xy - vec2f(clamp(p_.x, -k.z * h.x, k.z * h.x), h.x)) * sign(p_.y - h.x),
                  p_.z - h.y);
    return min(max(d.x, d.y), 0.0) + length(max(d, vec2f(0.0)));
}

/// Regular octahedron with "radius" s (vertex distance from center). Bound version.
/// @bound
/// @use gems, crystals, diamonds, abstract motifs
fn sdOctahedron(p: vec3f, s: f32) -> f32 {
    let p_ = abs(p);
    return (p_.x + p_.y + p_.z - s) * 0.57735027;
}

/// Gyroid sheet with cell scale \`scale\` and half-thickness t. The infinite triply-periodic surface
/// sin x cos y + sin y cos z + sin z cos x = 0. Intersect with a bounding shape.
/// @bound
/// @use lattices, coral, bone interiors, sponges, sci-fi infill, organic architecture
fn sdGyroid(p: vec3f, scale: f32, t: f32) -> f32 {
    let p_ = p * scale;
    let g = dot(sin(p_), cos(p_.yzx));
    return (abs(g) / scale - t) * 0.57735027;
}

/// Sphere of radius r cut by the plane y = h, keeping the cap ABOVE the plane. h = 0 gives a dome on the ground;
/// negative h keeps more than half. Needs |h| < r.
/// @exact
/// @use domes, mushroom caps, half-buried rocks, igloos, bread loaves
fn sdCutSphere(p: vec3f, r: f32, h: f32) -> f32 {
    let w = sqrt(max(r * r - h * h, 0.0));
    let q = vec2f(length(p.xz), p.y);
    let s = max((h - r) * q.x * q.x + w * w * (h + r - 2.0 * q.y), h * q.x - w * q.y);
    if (s < 0.0) { return length(q) - r; }
    if (q.x < w) { return h - q.y; }
    return length(q - vec2f(w, h));
}

/// Sphere ra at the origin with sphere rb at (d, 0, 0) carved out, exact including the crease rim.
/// A plain opSubtract of two spheres is only a bound.
/// @exact
/// @use eye sockets, craters, bitten fruit, nostrils, scooped shapes
fn sdDeathStar(p: vec3f, ra: f32, rb: f32, d: f32) -> f32 {
    let a = (ra * ra - rb * rb + d * d) / (2.0 * d);
    let b = sqrt(max(ra * ra - a * a, 0.0));
    let q = vec2f(p.x, length(p.yz));
    if (q.x * b - q.y * a > d * max(b - q.y, 0.0)) { return length(q - vec2f(a, b)); }
    return max(length(q) - ra, -(length(q - vec2f(d, 0.0)) - rb));
}

/// Unsigned distance to a 3D quadratic Bezier curve A-B-C; subtract a radius for a tube.
/// Solves the closest-point cubic analytically. Falls back to a segment when the curve is straight.
/// @exact
/// @use hair strands, tentacles, stems, whiskers, horns, cables, curved tubes
fn sdQuadraticBezier_f3f3f3f3(pos: vec3f, A: vec3f, B: vec3f, C: vec3f) -> f32 {
    let a = B - A;
    let b = A - 2.0 * B + C;
    let c = a * 2.0;
    let d = A - pos;
    let bb = dot(b, b);
    if (bb < 1e-10) {
        let pa = pos - A;
        let ca = C - A;
        return length(pa - ca * clamp(dot(pa, ca) / dot(ca, ca), 0.0, 1.0));
    }
    let kk = 1.0 / bb;
    let kx = kk * dot(a, b);
    let ky = kk * (2.0 * dot(a, a) + dot(d, b)) / 3.0;
    let kz = kk * dot(d, a);
    let pp = ky - kx * kx;
    let q = kx * (2.0 * kx * kx - 3.0 * ky) + kz;
    var h = q * q + 4.0 * pp * pp * pp;
    var res: f32;
    if (h >= 0.0) {
        h = sqrt(h);
        let x = (vec2f(h, -h) - q) / 2.0;
        let uv = sign(x) * pow(abs(x), vec2f(1.0f / 3.0f));
        let t = clamp(uv.x + uv.y - kx, 0.0, 1.0);
        res = dot2_f3(d + (c + b * t) * t);
    } else {
        let z = sqrt(-pp);
        let v = acos(clamp(q / (pp * z * 2.0), -1.0, 1.0)) / 3.0;
        let m = cos(v);
        let n = sin(v) * 1.7320508;
        let t = clamp(vec2f(m + m, -n - m) * z - kx, vec2f(0.0), vec2f(1.0));
        res = min(dot2_f3(d + (c + b * t.x) * t.x), dot2_f3(d + (c + b * t.y) * t.y));
    }
    return sqrt(res);
}
`;

// src/knowledge/shader-craft/library/modules/shading.ts
var SHADING_GLSL = `//! shading: BRDF terms and practical lighting models. Vectors are unit length: n = normal, v = toward the viewer
//! (-rd), l = toward the light. Units are "artist units" with pi folded in: a light of color C lights a white
//! Lambert surface facing it to C. Every function here returns radiance per unit light color, already including NoL.
//! Physically based terms follow the Filament documentation.

/// Schlick Fresnel. u is VoH for lights and NoV for environment reflections and rims.
/// f0 = 0.04 for dielectrics (plastic, skin, stone, water ~0.02); for metals f0 = base color.
/// @use reflections that strengthen at grazing angles, rim brightening, water and glass
vec3 fresnelSchlick(float u, vec3 f0) {
    float m = clamp(1.0 - u, 0.0, 1.0);
    float m2 = m * m;
    return f0 + (1.0 - f0) * (m2 * m2 * m);
}

/// GGX / Trowbridge-Reitz normal distribution. alpha = roughness^2.
/// @use specular highlight shape (inside specularGGX)
float distributionGGX(float NoH, float alpha) {
    float a2 = alpha * alpha;
    float d = NoH * NoH * (a2 - 1.0) + 1.0;
    return a2 / (PI * d * d);
}

/// Height-correlated Smith visibility. Already contains the 1 / (4 NoL NoV) term.
/// @use specular shadowing-masking (inside specularGGX)
float visibilitySmithGGX(float NoV, float NoL, float alpha) {
    float a2 = alpha * alpha;
    float gv = NoL * sqrt(NoV * NoV * (1.0 - a2) + a2);
    float gl = NoV * sqrt(NoL * NoL * (1.0 - a2) + a2);
    return 0.5 / max(gv + gl, 1e-6);
}

/// Microfacet specular for one light: pi * D * V * F * NoL (artist units). roughness is perceptual, in [0,1].
/// @use glossy plastic, metal, wet surfaces, car paint, ceramics
vec3 specularGGX(vec3 n, vec3 v, vec3 l, float roughness, vec3 f0) {
    vec3 h = normalize(v + l);
    float NoL = clamp(dot(n, l), 0.0, 1.0);
    float NoV = max(dot(n, v), 1e-4);
    float NoH = clamp(dot(n, h), 0.0, 1.0);
    float VoH = clamp(dot(v, h), 0.0, 1.0);
    float alpha = max(roughness, 0.045);
    alpha *= alpha;
    return PI * distributionGGX(NoH, alpha) * visibilitySmithGGX(NoV, NoL, alpha) * fresnelSchlick(VoH, f0) * NoL;
}

/// Complete metallic-roughness shading for one light (diffuse + specular, NoL included, artist units).
/// Multiply by light color and shadow. Keep albedo around 0.05-0.7 (linear); brighten lights, not albedo.
/// @use hero objects, product renders, anything that needs believable materials
vec3 shadePBR(vec3 n, vec3 v, vec3 l, vec3 albedo, float roughness, float metallic) {
    vec3 f0 = mix(vec3(0.04), albedo, metallic);
    float NoL = clamp(dot(n, l), 0.0, 1.0);
    vec3 F = fresnelSchlick(max(dot(n, v), 0.0), f0);
    vec3 diffuse = albedo * (1.0 - metallic) * (1.0 - F) * NoL;
    return diffuse + specularGGX(n, v, l, roughness, f0);
}

/// Split-sum environment specular without a lookup texture (Karis 2014, after Lazarov).
/// Multiply by the sky or environment color in the reflection direction.
/// @use sky reflections on glossy surfaces, ambient specular
vec3 envBRDFApprox(vec3 f0, float NoV, float roughness) {
    vec4 r = roughness * vec4(-1.0, -0.0275, -0.572, 0.022) + vec4(1.0, 0.0425, 1.04, -0.04);
    float a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    vec2 ab = vec2(-1.04, 1.04) * a + r.zw;
    return f0 * ab.x + ab.y;
}

/// Energy-conserving wrap diffuse: light wraps past the terminator by w (0 = Lambert, 0.5 = soft).
/// @use skin, foliage, cloth, soft stylized shading, fur
/// @see Stephen Hill, "Righting Wrap" (2011)
float wrapDiffuse(vec3 n, vec3 l, float w) {
    return max((dot(n, l) + w) / ((1.0 + w) * (1.0 + w)), 0.0);
}

/// Hemisphere light: sky color from above blended to ground color from below.
/// @use ambient fill, outdoor sky light, studio fill
vec3 hemisphereLight(vec3 n, vec3 skyColor, vec3 groundColor) {
    return mix(groundColor, skyColor, 0.5 + 0.5 * n.y);
}

/// Fast translucency (Barre-Brisebois and Bouchard 2011): light passing through thin parts, seen from the back.
/// distortion bends the light along the normal (0.2-0.5). thickness is 0 (thin) .. 1 (thick); see sdfThickness.
/// @use leaves, ears, wax, jade, marble, backlit petals, jellyfish
float translucency(vec3 n, vec3 v, vec3 l, float distortion, float power, float thickness) {
    vec3 h = normalize(l + n * distortion);
    return pow(clamp(dot(v, -h), 0.0, 1.0), power) * (1.0 - thickness);
}

/// Rim light from the viewing angle: strongest at silhouettes.
/// @use character separation from background, fresnel-like glow, stylized outlines
float rimLight(vec3 n, vec3 v, float power) {
    return pow(clamp(1.0 - dot(n, v), 0.0, 1.0), power);
}
`;
var SHADING_WGSL = `//! shading: BRDF terms and practical lighting models. Vectors are unit length: n = normal, v = toward the viewer
//! (-rd), l = toward the light. Units are "artist units" with pi folded in: a light of color C lights a white
//! Lambert surface facing it to C. Every function here returns radiance per unit light color, already including NoL.
//! Physically based terms follow the Filament documentation.

/// Schlick Fresnel. u is VoH for lights and NoV for environment reflections and rims.
/// f0 = 0.04 for dielectrics (plastic, skin, stone, water ~0.02); for metals f0 = base color.
/// @use reflections that strengthen at grazing angles, rim brightening, water and glass
fn fresnelSchlick(u: f32, f0: vec3f) -> vec3f {
    let m = clamp(1.0 - u, 0.0, 1.0);
    let m2 = m * m;
    return f0 + (1.0 - f0) * (m2 * m2 * m);
}

/// GGX / Trowbridge-Reitz normal distribution. alpha = roughness^2.
/// @use specular highlight shape (inside specularGGX)
fn distributionGGX(NoH: f32, alpha: f32) -> f32 {
    let a2 = alpha * alpha;
    let d = NoH * NoH * (a2 - 1.0) + 1.0;
    return a2 / (PI * d * d);
}

/// Height-correlated Smith visibility. Already contains the 1 / (4 NoL NoV) term.
/// @use specular shadowing-masking (inside specularGGX)
fn visibilitySmithGGX(NoV: f32, NoL: f32, alpha: f32) -> f32 {
    let a2 = alpha * alpha;
    let gv = NoL * sqrt(NoV * NoV * (1.0 - a2) + a2);
    let gl = NoV * sqrt(NoL * NoL * (1.0 - a2) + a2);
    return 0.5 / max(gv + gl, 1e-6);
}

/// Microfacet specular for one light: pi * D * V * F * NoL (artist units). roughness is perceptual, in [0,1].
/// @use glossy plastic, metal, wet surfaces, car paint, ceramics
fn specularGGX(n: vec3f, v: vec3f, l: vec3f, roughness: f32, f0: vec3f) -> vec3f {
    let h = normalize(v + l);
    let NoL = clamp(dot(n, l), 0.0, 1.0);
    let NoV = max(dot(n, v), 1e-4);
    let NoH = clamp(dot(n, h), 0.0, 1.0);
    let VoH = clamp(dot(v, h), 0.0, 1.0);
    var alpha = max(roughness, 0.045);
    alpha *= alpha;
    return PI * distributionGGX(NoH, alpha) * visibilitySmithGGX(NoV, NoL, alpha) * fresnelSchlick(VoH, f0) * NoL;
}

/// Complete metallic-roughness shading for one light (diffuse + specular, NoL included, artist units).
/// Multiply by light color and shadow. Keep albedo around 0.05-0.7 (linear); brighten lights, not albedo.
/// @use hero objects, product renders, anything that needs believable materials
fn shadePBR(n: vec3f, v: vec3f, l: vec3f, albedo: vec3f, roughness: f32, metallic: f32) -> vec3f {
    let f0 = mix(vec3f(0.04), albedo, metallic);
    let NoL = clamp(dot(n, l), 0.0, 1.0);
    let F = fresnelSchlick(max(dot(n, v), 0.0), f0);
    let diffuse = albedo * (1.0 - metallic) * (1.0 - F) * NoL;
    return diffuse + specularGGX(n, v, l, roughness, f0);
}

/// Split-sum environment specular without a lookup texture (Karis 2014, after Lazarov).
/// Multiply by the sky or environment color in the reflection direction.
/// @use sky reflections on glossy surfaces, ambient specular
fn envBRDFApprox(f0: vec3f, NoV: f32, roughness: f32) -> vec3f {
    let r = roughness * vec4f(-1.0, -0.0275, -0.572, 0.022) + vec4f(1.0, 0.0425, 1.04, -0.04);
    let a = min(r.x * r.x, exp2(-9.28 * NoV)) * r.x + r.y;
    let ab = vec2f(-1.04, 1.04) * a + r.zw;
    return f0 * ab.x + ab.y;
}

/// Energy-conserving wrap diffuse: light wraps past the terminator by w (0 = Lambert, 0.5 = soft).
/// @use skin, foliage, cloth, soft stylized shading, fur
/// @see Stephen Hill, "Righting Wrap" (2011)
fn wrapDiffuse(n: vec3f, l: vec3f, w: f32) -> f32 {
    return max((dot(n, l) + w) / ((1.0 + w) * (1.0 + w)), 0.0);
}

/// Hemisphere light: sky color from above blended to ground color from below.
/// @use ambient fill, outdoor sky light, studio fill
fn hemisphereLight(n: vec3f, skyColor: vec3f, groundColor: vec3f) -> vec3f {
    return mix(groundColor, skyColor, 0.5 + 0.5 * n.y);
}

/// Fast translucency (Barre-Brisebois and Bouchard 2011): light passing through thin parts, seen from the back.
/// distortion bends the light along the normal (0.2-0.5). thickness is 0 (thin) .. 1 (thick); see sdfThickness.
/// @use leaves, ears, wax, jade, marble, backlit petals, jellyfish
fn translucency(n: vec3f, v: vec3f, l: vec3f, distortion: f32, power: f32, thickness: f32) -> f32 {
    let h = normalize(l + n * distortion);
    return pow(clamp(dot(v, -h), 0.0, 1.0), power) * (1.0 - thickness);
}

/// Rim light from the viewing angle: strongest at silhouettes.
/// @use character separation from background, fresnel-like glow, stylized outlines
fn rimLight(n: vec3f, v: vec3f, power: f32) -> f32 {
    return pow(clamp(1.0 - dot(n, v), 0.0, 1.0), power);
}
`;

// src/knowledge/shader-craft/library/modules/tonemap.ts
var TONEMAP_GLSL = `//! tonemap: map scene-linear HDR to display range. Every function here takes linear input (after exposure) and
//! returns LINEAR [0,1]. Then apply linearToSrgb exactly once.
//! Recommended chain: col *= exposure; col = tonemapAgX(col); col = linearToSrgb(col); add dither.
//! Choosing: AgX (default) for 3D scenes, glows, fire, suns and volumes; its highlights roll off to white without
//! hue skews. tonemapNeutral for 2D, product shots and palette-faithful work. ACES for the saturated filmic look.

/// AgX: log encoding plus a sigmoid inside an inset/outset gamut. Mid-grey 0.18 maps to about 0.5 display.
/// Minimal implementation after Troy Sobotka's AgX and Benjamin Wrensch's polynomial fit (both MIT).
/// @use default tonemapper for 3D, emissive glows, fire, neon, skies, clouds
/// @see Benjamin Wrensch, minimal AgX implementation
vec3 tonemapAgX(vec3 c) {
    const mat3 inset = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                            0.0784335999999992, 0.878468636469772, 0.0784336,
                            0.0792237451477643, 0.0791661274605434, 0.879142973793104);
    const mat3 outset = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                             -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                             -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
    const float minEv = -12.47393, maxEv = 4.026069;
    c = inset * max(c, 0.0);
    c = clamp((log2(max(c, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
    vec3 x2 = c * c, x4 = x2 * x2;
    c = 15.5 * x4 * x2 - 40.14 * x4 * c + 31.96 * x4 - 6.868 * x2 * c + 0.4298 * x2 + 0.1191 * c - 0.00232;
    c = outset * c;
    return pow(max(c, 0.0), vec3(2.2));
}

/// AgX with the "punchy" look (more contrast and saturation) for stylized art.
/// @use stylized 3D, saturated sunsets, toy-like renders
vec3 tonemapAgXPunchy(vec3 c) {
    const mat3 inset = mat3(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                            0.0784335999999992, 0.878468636469772, 0.0784336,
                            0.0792237451477643, 0.0791661274605434, 0.879142973793104);
    const mat3 outset = mat3(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                             -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                             -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
    const float minEv = -12.47393, maxEv = 4.026069;
    c = inset * max(c, 0.0);
    c = clamp((log2(max(c, 1e-10)) - minEv) / (maxEv - minEv), 0.0, 1.0);
    vec3 x2 = c * c, x4 = x2 * x2;
    c = 15.5 * x4 * x2 - 40.14 * x4 * c + 31.96 * x4 - 6.868 * x2 * c + 0.4298 * x2 + 0.1191 * c - 0.00232;
    c = pow(max(c, 0.0), vec3(1.35));
    float luma = dot(c, vec3(0.2126, 0.7152, 0.0722));
    c = luma + 1.4 * (c - luma);
    c = outset * c;
    return pow(max(c, 0.0), vec3(2.2));
}

/// Khronos PBR Neutral: leaves [0, ~0.76] almost untouched and compresses only highlights, preserving hue.
/// @use 2D art, palette-faithful scenes, product renders, UI glow
/// @see Khronos Group, PBR Neutral tone mapper
vec3 tonemapNeutral(vec3 c) {
    const float startCompression = 0.76;
    const float desaturation = 0.15;
    c = max(c, 0.0);
    float x = min(c.r, min(c.g, c.b));
    float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
    c -= offset;
    float peak = max(c.r, max(c.g, c.b));
    if (peak < startCompression) return c;
    const float d = 1.0 - startCompression;
    float newPeak = 1.0 - d * d / (peak + d - startCompression);
    c *= newPeak / peak;
    float g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return mix(c, vec3(newPeak), g);
}

/// Stephen Hill's ACES fit (RRT + ODT, sRGB primaries). Contrasty and saturated; blues drift purple when very bright.
/// Darker than AgX at the same exposure: multiply the input by about 1.6 to compensate.
/// @use the classic "filmic game" look
/// @see Stephen Hill's ACES fit, via MJP's BakingLab
vec3 tonemapACES(vec3 c) {
    c = max(c, 0.0) * mat3(0.59719, 0.35458, 0.04823,
                           0.07600, 0.90834, 0.01566,
                           0.02840, 0.13383, 0.83777);
    c = (c * (c + 0.0245786) - 0.000090537) / (c * (0.983729 * c + 0.4329510) + 0.238081);
    c = c * mat3(1.60475, -0.53108, -0.07367,
                 -0.10208, 1.10813, -0.00605,
                 -0.00327, -0.07276, 1.07602);
    return clamp(c, 0.0, 1.0);
}

/// Extended Reinhard on luminance: maps \`white\` to 1 and preserves hue. Simple and predictable.
/// @use quick previews, soft low-contrast looks
vec3 tonemapReinhard(vec3 c, float white) {
    c = max(c, 0.0);
    float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
    float lt = l * (1.0 + l / (white * white)) / (1.0 + l);
    return clamp(c * (lt / max(l, 1e-6)), 0.0, 1.0);
}
`;
var TONEMAP_WGSL = `//! tonemap: map scene-linear HDR to display range. Every function here takes linear input (after exposure) and
//! returns LINEAR [0,1]. Then apply linearToSrgb exactly once.
//! Recommended chain: col *= exposure; col = tonemapAgX(col); col = linearToSrgb(col); add dither.
//! Choosing: AgX (default) for 3D scenes, glows, fire, suns and volumes; its highlights roll off to white without
//! hue skews. tonemapNeutral for 2D, product shots and palette-faithful work. ACES for the saturated filmic look.

/// AgX: log encoding plus a sigmoid inside an inset/outset gamut. Mid-grey 0.18 maps to about 0.5 display.
/// Minimal implementation after Troy Sobotka's AgX and Benjamin Wrensch's polynomial fit (both MIT).
/// @use default tonemapper for 3D, emissive glows, fire, neon, skies, clouds
/// @see Benjamin Wrensch, minimal AgX implementation
fn tonemapAgX(c: vec3f) -> vec3f {
    const inset = mat3x3f(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                          0.0784335999999992, 0.878468636469772, 0.0784336,
                          0.0792237451477643, 0.0791661274605434, 0.879142973793104);
    const outset = mat3x3f(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                           -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                           -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
    const minEv: f32 = -12.47393;
    const maxEv: f32 = 4.026069;
    var c_ = inset * max(c, vec3f(0.0));
    c_ = clamp((log2(max(c_, vec3f(1e-10))) - minEv) / (maxEv - minEv), vec3f(0.0), vec3f(1.0));
    let x2 = c_ * c_;
    let x4 = x2 * x2;
    c_ = 15.5 * x4 * x2 - 40.14 * x4 * c_ + 31.96 * x4 - 6.868 * x2 * c_ + 0.4298 * x2 + 0.1191 * c_ - 0.00232;
    c_ = outset * c_;
    return pow(max(c_, vec3f(0.0)), vec3f(2.2));
}

/// AgX with the "punchy" look (more contrast and saturation) for stylized art.
/// @use stylized 3D, saturated sunsets, toy-like renders
fn tonemapAgXPunchy(c: vec3f) -> vec3f {
    const inset = mat3x3f(0.842479062253094, 0.0423282422610123, 0.0423756549057051,
                          0.0784335999999992, 0.878468636469772, 0.0784336,
                          0.0792237451477643, 0.0791661274605434, 0.879142973793104);
    const outset = mat3x3f(1.19687900512017, -0.0528968517574562, -0.0529716355144438,
                           -0.0980208811401368, 1.15190312990417, -0.0980434501171241,
                           -0.0990297440797205, -0.0989611768448433, 1.15107367264116);
    const minEv: f32 = -12.47393;
    const maxEv: f32 = 4.026069;
    var c_ = inset * max(c, vec3f(0.0));
    c_ = clamp((log2(max(c_, vec3f(1e-10))) - minEv) / (maxEv - minEv), vec3f(0.0), vec3f(1.0));
    let x2 = c_ * c_;
    let x4 = x2 * x2;
    c_ = 15.5 * x4 * x2 - 40.14 * x4 * c_ + 31.96 * x4 - 6.868 * x2 * c_ + 0.4298 * x2 + 0.1191 * c_ - 0.00232;
    c_ = pow(max(c_, vec3f(0.0)), vec3f(1.35));
    let luma = dot(c_, vec3f(0.2126, 0.7152, 0.0722));
    c_ = luma + 1.4 * (c_ - luma);
    c_ = outset * c_;
    return pow(max(c_, vec3f(0.0)), vec3f(2.2));
}

/// Khronos PBR Neutral: leaves [0, ~0.76] almost untouched and compresses only highlights, preserving hue.
/// @use 2D art, palette-faithful scenes, product renders, UI glow
/// @see Khronos Group, PBR Neutral tone mapper
fn tonemapNeutral(c: vec3f) -> vec3f {
    const startCompression: f32 = 0.76;
    const desaturation: f32 = 0.15;
    var c_ = max(c, vec3f(0.0));
    let x = min(c_.r, min(c_.g, c_.b));
    let offset = select(0.04, x - 6.25 * x * x, x < 0.08);
    c_ -= offset;
    let peak = max(c_.r, max(c_.g, c_.b));
    if (peak < startCompression) { return c_; }
    const d: f32 = 1.0 - startCompression;
    let newPeak = 1.0 - d * d / (peak + d - startCompression);
    c_ *= newPeak / peak;
    let g = 1.0 - 1.0 / (desaturation * (peak - newPeak) + 1.0);
    return mix(c_, vec3f(newPeak), g);
}

/// Stephen Hill's ACES fit (RRT + ODT, sRGB primaries). Contrasty and saturated; blues drift purple when very bright.
/// Darker than AgX at the same exposure: multiply the input by about 1.6 to compensate.
/// @use the classic "filmic game" look
/// @see Stephen Hill's ACES fit, via MJP's BakingLab
fn tonemapACES(c: vec3f) -> vec3f {
    var c_ = max(c, vec3f(0.0)) * mat3x3f(0.59719, 0.35458, 0.04823,
                                          0.07600, 0.90834, 0.01566,
                                          0.02840, 0.13383, 0.83777);
    c_ = (c_ * (c_ + 0.0245786) - 0.000090537) / (c_ * (0.983729 * c_ + 0.4329510) + 0.238081);
    c_ = c_ * mat3x3f(1.60475, -0.53108, -0.07367,
                      -0.10208, 1.10813, -0.00605,
                      -0.00327, -0.07276, 1.07602);
    return clamp(c_, vec3f(0.0), vec3f(1.0));
}

/// Extended Reinhard on luminance: maps \`white\` to 1 and preserves hue. Simple and predictable.
/// @use quick previews, soft low-contrast looks
fn tonemapReinhard(c: vec3f, white: f32) -> vec3f {
    let c_ = max(c, vec3f(0.0));
    let l = dot(c_, vec3f(0.2126, 0.7152, 0.0722));
    let lt = l * (1.0 + l / (white * white)) / (1.0 + l);
    return clamp(c_ * (lt / max(l, 1e-6)), vec3f(0.0), vec3f(1.0));
}
`;

// src/knowledge/shader-craft/library/modules/volume.ts
var VOLUME_GLSL = `//! volume: participating media (fog, smoke, clouds, haze). mu = dot(rd, l): the cosine between the view ray and
//! the direction TOWARD the light, so forward scattering peaks when looking at the light.
//! Integration follows Hillaire (Frostbite, SIGGRAPH 2015/2016); cloud tricks follow Schneider (Horizon Zero Dawn, 2015).

/// Isotropic phase function (scatters equally in all directions).
/// @use dusty fog, thick smoke interiors
float phaseIsotropic() { return 1.0 / (4.0 * PI); }

/// Rayleigh phase function.
/// @use sky scattering by air molecules (blue sky)
float phaseRayleigh(float mu) { return 3.0 / (16.0 * PI) * (1.0 + mu * mu); }

/// Henyey-Greenstein phase function. g in (-1, 1): > 0 forward (silver linings), < 0 backward.
/// @use clouds (g ~ 0.6-0.85), fog glow around lights, underwater light shafts
float phaseHG(float mu, float g) {
    float g2 = g * g;
    return (1.0 - g2) / (4.0 * PI * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-6), 1.5));
}

/// Two-lobe Henyey-Greenstein: a forward lobe gF and a backward lobe gB, mixed by w (weight of the forward lobe).
/// Keeps the silver lining while clouds lit from behind the camera still show detail.
/// @use clouds, smoke lit from varying angles
float phaseDualHG(float mu, float gF, float gB, float w) {
    return mix(phaseHG(mu, gB), phaseHG(mu, gF), w);
}

/// Cornette-Shanks phase (a better-normalized Mie approximation). g = 0.8 for atmospheric haze.
/// @use sun halo in hazy skies, aerosols
float phaseCornetteShanks(float mu, float g) {
    float g2 = g * g;
    return 3.0 / (8.0 * PI) * (1.0 - g2) * (1.0 + mu * mu)
         / ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-6), 1.5));
}

/// Beer-Powder lighting term for clouds: 2 e^-d (1 - e^-2d), where d is optical depth toward the sun.
/// Darkens cloud edges that face the light like powdered sugar. Not energy-conserving; use it on the direct term only.
/// @use cumulus clouds, puffy smoke
float beerPowder(float d) { return 2.0 * exp(-d) * (1.0 - exp(-2.0 * d)); }

/// One energy-conserving step of volume integration. sigmaT is extinction per unit length (RGB for tinted media),
/// inScatter is in-scattered radiance at this point (including sigmaS, phase and light), ds is step length.
/// Accumulates into radiance and transmittance. Stable for dense media, unlike radiance += T * S * ds.
/// @use any raymarched volume: clouds, smoke, fog, fire, nebulae
void volumeStep(inout vec3 radiance, inout vec3 transmittance, vec3 sigmaT, vec3 inScatter, float ds) {
    vec3 stepT = exp(-sigmaT * ds);
    vec3 integral = (inScatter - inScatter * stepT) / max(sigmaT, vec3(1e-7));
    radiance += transmittance * integral;
    transmittance *= stepT;
}

/// Distance fog amount (0 = clear, 1 = fully fogged) for distance t.
/// @use depth cueing, haze, underwater murk
float distanceFog(float t, float density) { return 1.0 - exp(-t * density); }

/// Analytic height fog for density a * exp(-b * y) along the ray segment [0, t]. Thick near the ground, thin above.
/// Returns the fog amount in [0,1].
/// @use valley mist, ground fog, layered haze in landscapes
/// @see Inigo Quilez, fog
float heightFog(vec3 ro, vec3 rd, float t, float a, float b) {
    float base = a * exp(-ro.y * b);
    float amount = (abs(rd.y) < 1e-4) ? base * t
                                       : base * (1.0 - exp(-t * rd.y * b)) / (rd.y * b);
    return 1.0 - exp(-max(amount, 0.0));
}
`;
var VOLUME_WGSL = `//! volume: participating media (fog, smoke, clouds, haze). mu = dot(rd, l): the cosine between the view ray and
//! the direction TOWARD the light, so forward scattering peaks when looking at the light.
//! Integration follows Hillaire (Frostbite, SIGGRAPH 2015/2016); cloud tricks follow Schneider (Horizon Zero Dawn, 2015).

/// Isotropic phase function (scatters equally in all directions).
/// @use dusty fog, thick smoke interiors
fn phaseIsotropic() -> f32 { return 1.0 / (4.0 * PI); }

/// Rayleigh phase function.
/// @use sky scattering by air molecules (blue sky)
fn phaseRayleigh(mu: f32) -> f32 { return 3.0 / (16.0 * PI) * (1.0 + mu * mu); }

/// Henyey-Greenstein phase function. g in (-1, 1): > 0 forward (silver linings), < 0 backward.
/// @use clouds (g ~ 0.6-0.85), fog glow around lights, underwater light shafts
fn phaseHG(mu: f32, g: f32) -> f32 {
    let g2 = g * g;
    return (1.0 - g2) / (4.0 * PI * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-6), 1.5));
}

/// Two-lobe Henyey-Greenstein: a forward lobe gF and a backward lobe gB, mixed by w (weight of the forward lobe).
/// Keeps the silver lining while clouds lit from behind the camera still show detail.
/// @use clouds, smoke lit from varying angles
fn phaseDualHG(mu: f32, gF: f32, gB: f32, w: f32) -> f32 {
    return mix(phaseHG(mu, gB), phaseHG(mu, gF), w);
}

/// Cornette-Shanks phase (a better-normalized Mie approximation). g = 0.8 for atmospheric haze.
/// @use sun halo in hazy skies, aerosols
fn phaseCornetteShanks(mu: f32, g: f32) -> f32 {
    let g2 = g * g;
    return 3.0 / (8.0 * PI) * (1.0 - g2) * (1.0 + mu * mu)
         / ((2.0 + g2) * pow(max(1.0 + g2 - 2.0 * g * mu, 1e-6), 1.5));
}

/// Beer-Powder lighting term for clouds: 2 e^-d (1 - e^-2d), where d is optical depth toward the sun.
/// Darkens cloud edges that face the light like powdered sugar. Not energy-conserving; use it on the direct term only.
/// @use cumulus clouds, puffy smoke
fn beerPowder(d: f32) -> f32 { return 2.0 * exp(-d) * (1.0 - exp(-2.0 * d)); }

/// One energy-conserving step of volume integration. sigmaT is extinction per unit length (RGB for tinted media),
/// inScatter is in-scattered radiance at this point (including sigmaS, phase and light), ds is step length.
/// Accumulates into radiance and transmittance (pointers to the caller's vars). Stable for dense media, unlike
/// radiance += T * S * ds.
/// @use any raymarched volume: clouds, smoke, fog, fire, nebulae
fn volumeStep(radiance: ptr<function, vec3f>, transmittance: ptr<function, vec3f>, sigmaT: vec3f, inScatter: vec3f, ds: f32) {
    let stepT = exp(-sigmaT * ds);
    let integral = (inScatter - inScatter * stepT) / max(sigmaT, vec3f(1e-7));
    *radiance += *transmittance * integral;
    *transmittance *= stepT;
}

/// Distance fog amount (0 = clear, 1 = fully fogged) for distance t.
/// @use depth cueing, haze, underwater murk
fn distanceFog(t: f32, density: f32) -> f32 { return 1.0 - exp(-t * density); }

/// Analytic height fog for density a * exp(-b * y) along the ray segment [0, t]. Thick near the ground, thin above.
/// Returns the fog amount in [0,1].
/// @use valley mist, ground fog, layered haze in landscapes
/// @see Inigo Quilez, fog
fn heightFog(ro: vec3f, rd: vec3f, t: f32, a: f32, b: f32) -> f32 {
    let base = a * exp(-ro.y * b);
    let amount = select(base * (1.0 - exp(-t * rd.y * b)) / (rd.y * b), base * t, abs(rd.y) < 1e-4);
    return 1.0 - exp(-max(amount, 0.0));
}
`;

// src/knowledge/shader-craft/library/modules/water.ts
var WATER_GLSL = `//! water: finite-depth wave dispersion, analytic wave derivatives, exact dielectric Fresnel and RGB attenuation.
//! Units must agree: wavelength/depth/path in meters, gravity in m/s^2, extinction in 1/m. No textures or scene state.

/// Angular frequency sqrt(g*k*tanh(k*depth)) for finite-depth gravity waves. Nonpositive inputs are clamped.
/// @use shallow coasts, ocean swell, lake waves with depth-dependent speed
/// @range nonnegative
/// @see MIT 2.20 Marine Hydrodynamics, lecture 20
float waterDispersion(float k, float depth, float gravity) {
    k = max(k,0.0);
    float e = exp(-2.0*k*max(depth,0.0));
    return sqrt(max(gravity,0.0)*k*(1.0-e)/(1.0+e));
}

/// One sinusoidal wave: vec4(height, dh/dx, dh/dz, Laplacian). Direction is normalized internally; zero uses +X.
/// wavelength > 0, amplitude in meters. footprint filters waves below 2-6 pixels; derivatives hold it constant.
/// @use analytic water normals, layered swell/chop, curvature foam, finite-depth lake and coastal waves
/// @see Mark Finch, GPU Gems chapter 1, "Effective Water Simulation from Physical Models"
vec4 waterWaveD(vec2 xz, float time, vec2 direction, float wavelength, float amplitude, float depth, float footprint) {
    float dl = length(direction);
    vec2 dir = dl>0.000001 ? direction/dl : vec2(1.0,0.0);
    float lengthM = max(wavelength,0.0001);
    float k = TAU/lengthM;
    float keep = smoothstep(2.0,6.0,lengthM/max(footprint,0.000001));
    float phase = k*dot(dir,xz)-waterDispersion(k,depth,9.81)*time;
    float h = amplitude*keep*sin(phase);
    return vec4(h, amplitude*keep*k*cos(phase)*dir, -k*k*h);
}

/// Exact unpolarized dielectric Fresnel for a positive incident cosine and positive refractive indices.
/// Returns 1 for total internal reflection. Caller chooses etaIncident/etaTransmitted for the ray's side.
/// @use air-water interfaces (1.0,1.333), underwater views (1.333,1.0), glass
/// @range [0,1]
/// @see Physically Based Rendering, "Specular Reflection and Transmission"
float fresnelDielectric(float cosIncident, float etaIncident, float etaTransmitted) {
    float ci = clamp(abs(cosIncident),0.0,1.0);
    float ei = max(etaIncident,0.000001), et = max(etaTransmitted,0.000001);
    if (abs(ei-et)<0.0000001) return 0.0;
    float sinT2 = (ei*ei)/(et*et)*max(0.0,1.0-ci*ci);
    if (sinT2>=1.0) return 1.0;
    float ct = sqrt(max(0.0,1.0-sinT2));
    float rs = (ei*ci-et*ct)/max(ei*ci+et*ct,0.000001);
    float rp = (et*ci-ei*ct)/max(et*ci+ei*ct,0.000001);
    return clamp(0.5*(rs*rs+rp*rp),0.0,1.0);
}

/// Beer-Lambert RGB transmittance exp(-extinction*pathLength). Negative extinction/path is clamped to zero.
/// Use the refracted optical path, not vertical water depth. Attenuation alone does not add scattered light.
/// @use depth-colored water, underwater visibility, tinted glass, homogeneous fog
/// @range [0,1]
/// @see Physically Based Rendering, "Transmittance"
vec3 beerTransmittance(vec3 extinction, float pathLength) {
    return exp(-max(extinction,vec3(0.0))*max(pathLength,0.0));
}
`;
var WATER_WGSL = `//! water: finite-depth wave dispersion, analytic wave derivatives, exact dielectric Fresnel and RGB attenuation.
//! Units must agree: wavelength/depth/path in meters, gravity in m/s^2, extinction in 1/m. No textures or scene state.

/// Angular frequency sqrt(g*k*tanh(k*depth)) for finite-depth gravity waves. Nonpositive inputs are clamped.
/// @use shallow coasts, ocean swell, lake waves with depth-dependent speed
/// @range nonnegative
/// @see MIT 2.20 Marine Hydrodynamics, lecture 20
fn waterDispersion(k: f32, depth: f32, gravity: f32) -> f32 {
    let k_ = max(k, 0.0);
    let e = exp(-2.0 * k_ * max(depth, 0.0));
    return sqrt(max(gravity, 0.0) * k_ * (1.0 - e) / (1.0 + e));
}

/// One sinusoidal wave: vec4f(height, dh/dx, dh/dz, Laplacian). Direction is normalized internally; zero uses +X.
/// wavelength > 0, amplitude in meters. footprint filters waves below 2-6 pixels; derivatives hold it constant.
/// @use analytic water normals, layered swell/chop, curvature foam, finite-depth lake and coastal waves
/// @see Mark Finch, GPU Gems chapter 1, "Effective Water Simulation from Physical Models"
fn waterWaveD(xz: vec2f, time: f32, direction: vec2f, wavelength: f32, amplitude: f32, depth: f32, footprint: f32) -> vec4f {
    let dl = length(direction);
    let dir = select(vec2f(1.0, 0.0), direction / dl, dl > 0.000001);
    let lengthM = max(wavelength, 0.0001);
    let k = TAU / lengthM;
    let keep = smoothstep(2.0, 6.0, lengthM / max(footprint, 0.000001));
    let phase = k * dot(dir, xz) - waterDispersion(k, depth, 9.81) * time;
    let h = amplitude * keep * sin(phase);
    return vec4f(h, amplitude * keep * k * cos(phase) * dir, -k * k * h);
}

/// Exact unpolarized dielectric Fresnel for a positive incident cosine and positive refractive indices.
/// Returns 1 for total internal reflection. Caller chooses etaIncident/etaTransmitted for the ray's side.
/// @use air-water interfaces (1.0,1.333), underwater views (1.333,1.0), glass
/// @range [0,1]
/// @see Physically Based Rendering, "Specular Reflection and Transmission"
fn fresnelDielectric(cosIncident: f32, etaIncident: f32, etaTransmitted: f32) -> f32 {
    let ci = clamp(abs(cosIncident), 0.0, 1.0);
    let ei = max(etaIncident, 0.000001);
    let et = max(etaTransmitted, 0.000001);
    if (abs(ei - et) < 0.0000001) { return 0.0; }
    let sinT2 = (ei * ei) / (et * et) * max(0.0, 1.0 - ci * ci);
    if (sinT2 >= 1.0) { return 1.0; }
    let ct = sqrt(max(0.0, 1.0 - sinT2));
    let rs = (ei * ci - et * ct) / max(ei * ci + et * ct, 0.000001);
    let rp = (et * ci - ei * ct) / max(et * ci + ei * ct, 0.000001);
    return clamp(0.5 * (rs * rs + rp * rp), 0.0, 1.0);
}

/// Beer-Lambert RGB transmittance exp(-extinction*pathLength). Negative extinction/path is clamped to zero.
/// Use the refracted optical path, not vertical water depth. Attenuation alone does not add scattered light.
/// @use depth-colored water, underwater visibility, tinted glass, homogeneous fog
/// @range [0,1]
/// @see Physically Based Rendering, "Transmittance"
fn beerTransmittance(extinction: vec3f, pathLength: f32) -> vec3f {
    return exp(-max(extinction, vec3f(0.0)) * max(pathLength, 0.0));
}
`;

// src/knowledge/shader-craft/library/index.ts
var SOURCES = [
  ["common", COMMON_GLSL, COMMON_WGSL],
  ["hash", HASH_GLSL, HASH_WGSL],
  ["noise", NOISE_GLSL, NOISE_WGSL],
  ["pattern", PATTERN_GLSL, PATTERN_WGSL],
  ["sdf3d", SDF3D_GLSL, SDF3D_WGSL],
  ["sdf2d", SDF2D_GLSL, SDF2D_WGSL],
  ["operators", OPERATORS_GLSL, OPERATORS_WGSL],
  ["domain", DOMAIN_GLSL, DOMAIN_WGSL],
  ["architecture", ARCHITECTURE_GLSL, ARCHITECTURE_WGSL],
  ["raymarch", RAYMARCH_GLSL, RAYMARCH_WGSL],
  ["intersect", INTERSECT_GLSL, INTERSECT_WGSL],
  ["camera", CAMERA_GLSL, CAMERA_WGSL],
  ["shading", SHADING_GLSL, SHADING_WGSL],
  ["water", WATER_GLSL, WATER_WGSL],
  ["color", COLOR_GLSL, COLOR_WGSL],
  ["tonemap", TONEMAP_GLSL, TONEMAP_WGSL],
  ["volume", VOLUME_GLSL, VOLUME_WGSL],
  ["atmosphere", ATMOSPHERE_GLSL, ATMOSPHERE_WGSL],
  ["post", POST_GLSL, POST_WGSL],
  ["debug", DEBUG_GLSL, DEBUG_WGSL]
];
var SHADER_CRAFT_LIBRARY_MODULES = SOURCES.map(([module, glsl, wgsl]) => ({
  module,
  summary: LIBRARY_INDEX_MODULES.find((entry) => entry.module === module)?.summary ?? module,
  glsl,
  wgsl
}));
var SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS = [
  {
    name: "map",
    summary: "The scene: returns vec2(distance to the nearest surface at p, material id).",
    glsl: "vec2 map(vec3 p) { ... }",
    wgsl: "fn map(p: vec3f) -> vec2f { ... }",
    glslPrototype: "vec2 map(vec3 p);"
  },
  {
    name: "ZERO",
    summary: "An int zero the compiler cannot prove, built from the program's own int frame uniform. Loops that call map() start at it, so the compiler does not inline map() into every iteration. In GLSL, define it before the library code.",
    glsl: "#define ZERO (min(frame, 0))",
    wgsl: "var<private> ZERO: i32;",
    wgslEntryPoint: "ZERO = min(i32(frame), 0);"
  }
];
var BY_ID = new Map(SHADER_CRAFT_LIBRARY.map((symbol) => [symbol.id, symbol]));
var MODULES = new Map(SHADER_CRAFT_LIBRARY_MODULES.map((module) => [module.module, module]));
function declarationEnd(source, start) {
  let depth = 0;
  for (let i = start; i < source.length; i++) {
    if (source.startsWith("//", i)) {
      const lineEnd = source.indexOf("\n", i);
      if (lineEnd < 0) break;
      i = lineEnd;
      continue;
    }
    const c = source[i];
    if (c === "{") depth++;
    else if (c === "}" && --depth === 0) return i + 1;
    else if (c === ";" && depth === 0) return i + 1;
  }
  throw new Error("Unterminated shader-craft library declaration");
}
function getShaderCraftSymbolSource(id, language) {
  const symbol = BY_ID.get(id);
  if (!symbol) throw new Error(`Unknown shader-craft library symbol: ${id}`);
  const source = MODULES.get(symbol.module)[language];
  const head = symbol.kind === "const" ? symbol[language].signature : `${symbol[language].signature} {`;
  const start = source.startsWith(head) ? 0 : source.indexOf(`
${head}`) + 1;
  if (start === 0 && !source.startsWith(head)) {
    throw new Error(`Shader-craft library symbol ${id} is missing from the ${language} source of ${symbol.module}`);
  }
  return source.slice(start, declarationEnd(source, start));
}

// src/knowledge/shader-craft/source.ts
var PUNCT = [
  "<<=",
  ">>=",
  "->",
  "++",
  "--",
  "<<",
  ">>",
  "<=",
  ">=",
  "==",
  "!=",
  "&&",
  "||",
  "^^",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "&=",
  "|=",
  "^="
];
function tokenize(source, language) {
  const tokens = [];
  const n = source.length;
  let i = 0;
  let line = 1;
  let lineStart = 0;
  let atLineStart = true;
  const push = (kind, start, end, startLine, startColumn) => {
    tokens.push({ kind, text: source.slice(start, end), start, end, line: startLine, column: startColumn });
  };
  while (i < n) {
    const c = source[i];
    if (c === "\n") {
      i++;
      line++;
      lineStart = i;
      atLineStart = true;
      continue;
    }
    if (c === " " || c === "	" || c === "\r" || c === "\f" || c === "\v") {
      i++;
      continue;
    }
    if (c === "/" && source[i + 1] === "/") {
      while (i < n && source[i] !== "\n") i++;
      continue;
    }
    if (c === "/" && source[i + 1] === "*") {
      let depth = 1;
      i += 2;
      while (i < n && depth > 0) {
        if (source[i] === "\n") {
          line++;
          lineStart = i + 1;
        }
        if (language === "wgsl" && source[i] === "/" && source[i + 1] === "*") {
          depth++;
          i += 2;
          continue;
        }
        if (source[i] === "*" && source[i + 1] === "/") {
          depth--;
          i += 2;
          continue;
        }
        i++;
      }
      continue;
    }
    const startLine = line;
    const startColumn = i - lineStart + 1;
    if (c === "#" && atLineStart && language === "glsl") {
      const start = i;
      while (i < n) {
        if (source[i] === "\\" && source[i + 1] === "\n") {
          i += 2;
          line++;
          lineStart = i;
          continue;
        }
        if (source[i] === "\\" && source[i + 1] === "\r" && source[i + 2] === "\n") {
          i += 3;
          line++;
          lineStart = i;
          continue;
        }
        if (source[i] === "\n") break;
        i++;
      }
      push("directive", start, i, startLine, startColumn);
      continue;
    }
    atLineStart = false;
    if (/[A-Za-z_]/.test(c)) {
      const start = i;
      while (i < n && /[A-Za-z0-9_]/.test(source[i])) i++;
      push("ident", start, i, startLine, startColumn);
      continue;
    }
    if (/[0-9]/.test(c) || c === "." && /[0-9]/.test(source[i + 1] ?? "")) {
      const start = i;
      if (c === "0" && (source[i + 1] === "x" || source[i + 1] === "X")) {
        i += 2;
        while (i < n && /[0-9A-Fa-f.]/.test(source[i])) i++;
        if (source[i] === "p" || source[i] === "P") {
          i++;
          if (source[i] === "+" || source[i] === "-") i++;
          while (i < n && /[0-9]/.test(source[i])) i++;
        }
      } else {
        while (i < n && /[0-9]/.test(source[i])) i++;
        if (source[i] === ".") {
          i++;
          while (i < n && /[0-9]/.test(source[i])) i++;
        }
        if (source[i] === "e" || source[i] === "E") {
          let k = i + 1;
          if (source[k] === "+" || source[k] === "-") k++;
          if (/[0-9]/.test(source[k] ?? "")) {
            i = k;
            while (i < n && /[0-9]/.test(source[i])) i++;
          }
        }
      }
      while (i < n && /[A-Za-z]/.test(source[i])) i++;
      push("number", start, i, startLine, startColumn);
      continue;
    }
    const op = PUNCT.find((p) => source.startsWith(p, i)) ?? c;
    i += op.length;
    push("punct", i - op.length, i, startLine, startColumn);
  }
  return tokens;
}
function maskComments(source, language) {
  const out = source.split("");
  const n = source.length;
  let i = 0;
  while (i < n) {
    if (source[i] === "/" && source[i + 1] === "/") {
      while (i < n && source[i] !== "\n") out[i++] = " ";
      continue;
    }
    if (source[i] === "/" && source[i + 1] === "*") {
      let depth = 1;
      out[i] = out[i + 1] = " ";
      i += 2;
      while (i < n && depth > 0) {
        if (language === "wgsl" && source[i] === "/" && source[i + 1] === "*") {
          depth++;
          out[i] = out[i + 1] = " ";
          i += 2;
          continue;
        }
        if (source[i] === "*" && source[i + 1] === "/") {
          depth--;
          out[i] = out[i + 1] = " ";
          i += 2;
          continue;
        }
        if (source[i] !== "\n") out[i] = " ";
        i++;
      }
      continue;
    }
    i++;
  }
  return out.join("");
}
function literalType(text) {
  if (/^0[xX]/.test(text)) {
    if (/[.pP]/.test(text)) return "float";
    return /[uU]$/.test(text) ? "uint" : "int";
  }
  if (/[uU]$/.test(text)) return "uint";
  if (/[.eE]/.test(text) || /[fFh]$/.test(text)) return "float";
  return "int";
}
function literalValue(text) {
  if (/^0[xX]/.test(text) && !/[.pP]/.test(text)) return parseInt(text.replace(/[uUi]$/, ""), 16);
  return parseFloat(text);
}
var GLSL_QUALIFIERS = /* @__PURE__ */ new Set([
  "const",
  "uniform",
  "in",
  "out",
  "inout",
  "highp",
  "mediump",
  "lowp",
  "flat",
  "smooth",
  "centroid",
  "invariant",
  "precise",
  "buffer",
  "shared",
  "readonly",
  "writeonly",
  "coherent",
  "volatile",
  "restrict",
  "attribute",
  "varying"
]);
function matching(tokens, open, openText, closeText) {
  let depth = 0;
  for (let i = open; i < tokens.length; i++) {
    if (tokens[i].kind !== "punct") continue;
    if (tokens[i].text === openText) depth++;
    else if (tokens[i].text === closeText && --depth === 0) return i;
  }
  return tokens.length - 1;
}
function splitTopLevel(tokens, first, end) {
  const parts = [];
  let depth = 0;
  let start = first;
  for (let i = first; i < end; i++) {
    const t = tokens[i];
    if (t.kind !== "punct") continue;
    if (t.text === "(" || t.text === "[" || t.text === "{") depth++;
    else if (t.text === ")" || t.text === "]" || t.text === "}") depth--;
    else if (t.text === "," && depth === 0) {
      parts.push([start, i]);
      start = i + 1;
    }
  }
  if (end > start) parts.push([start, end]);
  return parts;
}
function glslParams(tokens, open, close) {
  const params = [];
  for (const [a, b] of splitTopLevel(tokens, open + 1, close)) {
    const words = tokens.slice(a, b).filter((t) => t.kind === "ident");
    let qualifier;
    const rest = words.filter((w) => {
      if (w.text === "in" || w.text === "out" || w.text === "inout") {
        qualifier = w.text;
        return false;
      }
      return !GLSL_QUALIFIERS.has(w.text);
    });
    if (rest.length === 0 || rest.length === 1 && rest[0].text === "void") continue;
    const array = tokens.slice(a, b).some((t) => t.text === "[");
    params.push({ type: rest[0].text + (array ? "[]" : ""), name: rest[1]?.text ?? "", qualifier });
  }
  return params;
}
function glslDeclarators(tokens, first, end) {
  let i = first;
  while (i < end && tokens[i].kind === "ident" && GLSL_QUALIFIERS.has(tokens[i].text)) i++;
  if (i < end && tokens[i].text === "layout") {
    i++;
    if (tokens[i]?.text === "(") i = matching(tokens, i, "(", ")") + 1;
    while (i < end && tokens[i].kind === "ident" && GLSL_QUALIFIERS.has(tokens[i].text)) i++;
  }
  if (i >= end || tokens[i].kind !== "ident") return { declarators: [] };
  let type = tokens[i++].text;
  if (tokens[i]?.text === "[") {
    i = matching(tokens, i, "[", "]") + 1;
    type += "[]";
  }
  const declarators = [];
  for (const [a, b] of splitTopLevel(tokens, i, end)) {
    if (tokens[a]?.kind !== "ident") continue;
    let k = a + 1;
    let declType = type;
    if (tokens[k]?.text === "[") {
      k = matching(tokens, k, "[", "]") + 1;
      if (!declType.endsWith("[]")) declType += "[]";
    }
    const init = tokens[k]?.text === "=" && k + 1 < b ? [k + 1, b] : void 0;
    declarators.push({ name: tokens[a].text, type: declType, init });
  }
  return { type, declarators };
}
function wgslType(tokens, i, end) {
  let type = "";
  if (i >= end) return { type, next: i };
  type = tokens[i].text;
  i++;
  if (tokens[i]?.text === "<") {
    let depth = 0;
    for (; i < end; i++) {
      const t = tokens[i].text;
      type += t;
      if (t === "<") depth++;
      else if (t === ">") depth--;
      else if (t === ">>") depth -= 2;
      if (depth <= 0) {
        i++;
        break;
      }
    }
  }
  return { type, next: i };
}
function skipWgslAttributes(tokens, i) {
  const attributes = [];
  while (tokens[i]?.text === "@" && tokens[i + 1]?.kind === "ident") {
    attributes.push(tokens[i + 1].text);
    i += 2;
    if (tokens[i]?.text === "(") i = matching(tokens, i, "(", ")") + 1;
  }
  return { next: i, attributes };
}
function directiveParts(text) {
  const clean = text.replace(/\\\r?\n/g, " ").replace(/\/\*[\s\S]*?\*\//g, " ").replace(/\/\/.*$/, "");
  const m = /^#\s*(\w*)\s*(.*)$/s.exec(clean);
  if (!m) return { directive: "" };
  const directive = m[1];
  if (directive !== "define") return { directive, body: m[2].trim() };
  const d = /^(\w+)(\(([^)]*)\))?\s*(.*)$/s.exec(m[2]);
  if (!d) return { directive };
  return {
    directive,
    name: d[1],
    params: d[2] ? d[3].split(",").map((p) => p.trim()).filter(Boolean) : void 0,
    body: d[4].trim()
  };
}
function scanTopLevel(source, language, tokens = tokenize(source, language)) {
  return language === "glsl" ? scanGlsl(tokens) : scanWgsl(tokens);
}
function scanGlsl(tokens) {
  const items = [];
  let depth = 0;
  let i = 0;
  while (i < tokens.length) {
    const t = tokens[i];
    if (t.kind === "directive") {
      const parts = directiveParts(t.text);
      let itemDepth = depth;
      if (parts.directive === "if" || parts.directive === "ifdef" || parts.directive === "ifndef") depth++;
      else if (parts.directive === "endif") {
        depth = Math.max(0, depth - 1);
        itemDepth = depth;
      } else if (parts.directive === "else" || parts.directive === "elif") itemDepth = Math.max(0, depth - 1);
      items.push({
        kind: "directive",
        start: t.start,
        end: t.end,
        first: i,
        last: i,
        depth: itemDepth,
        directive: parts.directive,
        name: parts.name,
        macroParams: parts.params,
        macroBody: parts.body
      });
      i++;
      continue;
    }
    if (t.text === ";") {
      i++;
      continue;
    }
    let j = i;
    let paren = 0;
    let firstParen = -1;
    let sawAssign = false;
    let item = null;
    for (; j < tokens.length; j++) {
      const u = tokens[j];
      if (u.kind === "directive") continue;
      if (u.text === "(") {
        if (paren === 0 && firstParen < 0) firstParen = j;
        paren++;
        continue;
      }
      if (u.text === ")") {
        paren--;
        continue;
      }
      if (paren > 0) continue;
      if (u.text === "=") sawAssign = true;
      if (u.text === ";") {
        const isPrototype = firstParen > i + 1 && !sawAssign && tokens[firstParen - 1].kind === "ident" && tokens[firstParen - 2]?.kind === "ident" && tokens[firstParen - 2].text !== "layout" && tokens[i].text !== "precision" && !GLSL_QUALIFIERS.has(tokens[i].text);
        if (isPrototype) {
          const close = matching(tokens, firstParen, "(", ")");
          item = {
            kind: "prototype",
            start: t.start,
            end: u.end,
            first: i,
            last: j,
            depth,
            name: tokens[firstParen - 1].text,
            returnType: tokens[firstParen - 2].text,
            params: glslParams(tokens, firstParen, close)
          };
        } else {
          item = glslDeclaration(tokens, i, j, depth);
        }
        break;
      }
      if (u.text === "{") {
        const close = matching(tokens, j, "{", "}");
        const isFunction = firstParen > i && !sawAssign && tokens[j - 1]?.text === ")" && tokens[firstParen - 1].kind === "ident" && tokens[firstParen - 2]?.kind === "ident";
        if (isFunction) {
          const parenClose = matching(tokens, firstParen, "(", ")");
          item = {
            kind: "function",
            start: t.start,
            end: tokens[close].end,
            first: i,
            last: close,
            depth,
            name: tokens[firstParen - 1].text,
            returnType: tokens[firstParen - 2].text,
            params: glslParams(tokens, firstParen, parenClose),
            bodyOpen: j,
            bodyClose: close
          };
          j = close;
        } else {
          let k = close + 1;
          while (k < tokens.length && tokens[k].text !== ";" && tokens[k].kind !== "directive") k++;
          const members = [];
          let s = j + 1;
          for (let m = j + 1; m < close; m++) {
            if (tokens[m].text === ";") {
              members.push(...glslDeclarators(tokens, s, m).declarators);
              s = m + 1;
            }
          }
          const isStruct = tokens[i].text === "struct";
          const last = k < tokens.length && tokens[k].text === ";" ? k : close;
          item = {
            kind: isStruct ? "struct" : "declaration",
            start: t.start,
            end: tokens[last].end,
            first: i,
            last,
            depth,
            name: isStruct ? tokens[i + 1]?.text : tokens[close + 1]?.kind === "ident" ? tokens[close + 1].text : void 0,
            storage: isStruct ? void 0 : tokens.slice(i, j).some((x) => x.text === "uniform") ? "uniform" : "block",
            members
          };
          j = last;
        }
        break;
      }
    }
    if (!item) {
      const last = tokens.length - 1;
      item = glslDeclaration(tokens, i, tokens.length, depth);
      item.last = last;
      item.end = tokens[last].end;
      items.push(item);
      break;
    }
    items.push(item);
    i = item.last + 1;
  }
  return items;
}
function glslDeclaration(tokens, first, semi, depth) {
  const words = tokens.slice(first, semi).filter((t) => t.kind === "ident").map((t) => t.text);
  const storage = words[0] === "precision" ? "precision" : words.includes("uniform") ? "uniform" : words.includes("const") ? "const" : words.includes("in") ? "in" : words.includes("out") ? "out" : words[0] === "layout" ? "layout" : "global";
  const { declarators } = storage === "precision" ? { declarators: [] } : glslDeclarators(tokens, first, semi);
  const end = semi < tokens.length ? tokens[semi].end : tokens[tokens.length - 1].end;
  return {
    kind: "declaration",
    start: tokens[first].start,
    end,
    first,
    last: Math.min(semi, tokens.length - 1),
    depth,
    storage,
    declarators,
    name: declarators[0]?.name
  };
}
function scanWgsl(tokens) {
  const items = [];
  let i = 0;
  while (i < tokens.length) {
    const first = i;
    if (tokens[i].text === ";") {
      i++;
      continue;
    }
    const { next, attributes } = skipWgslAttributes(tokens, i);
    i = next;
    const t = tokens[i];
    if (!t) break;
    if (t.text === "fn") {
      const name = tokens[i + 1]?.text;
      const open = i + 2;
      const close = tokens[open]?.text === "(" ? matching(tokens, open, "(", ")") : open;
      const params = [];
      if (tokens[open]?.text === "(") {
        for (const [a, b] of splitTopLevel(tokens, open + 1, close)) {
          const attrs = skipWgslAttributes(tokens, a);
          const p2 = attrs.next;
          if (tokens[p2]?.kind !== "ident" || tokens[p2 + 1]?.text !== ":") continue;
          params.push({ name: tokens[p2].text, type: wgslType(tokens, p2 + 2, b).type, qualifier: attrs.attributes[0] });
        }
      }
      let k2 = close + 1;
      let returnType;
      if (tokens[k2]?.text === "->") {
        k2 = skipWgslAttributes(tokens, k2 + 1).next;
        const ret = wgslType(tokens, k2, tokens.length);
        returnType = ret.type;
        k2 = ret.next;
      }
      while (k2 < tokens.length && tokens[k2].text !== "{") k2++;
      const bodyClose = matching(tokens, k2, "{", "}");
      const stage = attributes.find((a) => a === "fragment" || a === "vertex" || a === "compute");
      items.push({
        kind: "function",
        start: tokens[first].start,
        end: tokens[bodyClose].end,
        first,
        last: bodyClose,
        depth: 0,
        name,
        returnType,
        params,
        bodyOpen: k2,
        bodyClose,
        stage
      });
      i = bodyClose + 1;
      continue;
    }
    if (t.text === "struct") {
      let k2 = i + 2;
      while (k2 < tokens.length && tokens[k2].text !== "{") k2++;
      const close = matching(tokens, k2, "{", "}");
      const members = [];
      for (const [a, b] of splitTopLevel(tokens, k2 + 1, close)) {
        const p2 = skipWgslAttributes(tokens, a).next;
        if (tokens[p2]?.kind === "ident" && tokens[p2 + 1]?.text === ":") {
          members.push({ name: tokens[p2].text, type: wgslType(tokens, p2 + 2, b).type });
        }
      }
      const last2 = tokens[close + 1]?.text === ";" ? close + 1 : close;
      items.push({
        kind: "struct",
        start: tokens[first].start,
        end: tokens[last2].end,
        first,
        last: last2,
        depth: 0,
        name: tokens[i + 1]?.text,
        members
      });
      i = last2 + 1;
      continue;
    }
    let k = i;
    let depth = 0;
    for (; k < tokens.length; k++) {
      const u = tokens[k].text;
      if (u === "(" || u === "[" || u === "{") depth++;
      else if (u === ")" || u === "]" || u === "}") depth--;
      else if (u === ";" && depth <= 0) break;
    }
    const last = Math.min(k, tokens.length - 1);
    const item = {
      kind: "declaration",
      start: tokens[first].start,
      end: tokens[last].end,
      first,
      last,
      depth: 0,
      storage: t.text
    };
    let p = i + 1;
    if (t.text === "var" && tokens[p]?.text === "<") {
      const close = matching(tokens, p, "<", ">");
      item.addressSpace = tokens[p + 1]?.text;
      p = close + 1;
    }
    if (tokens[p]?.kind === "ident" && ["const", "var", "override", "alias", "let"].includes(t.text)) {
      const declarator = { name: tokens[p].text };
      let q = p + 1;
      if (tokens[q]?.text === ":") {
        const type = wgslType(tokens, q + 1, k);
        declarator.type = type.type;
        q = type.next;
      }
      if (tokens[q]?.text === "=" && q + 1 < k) declarator.init = [q + 1, k];
      item.name = declarator.name;
      item.declarators = [declarator];
    }
    items.push(item);
    i = last + 1;
  }
  return items;
}
var BINARY_PRECEDENCE = {
  "||": 3,
  "^^": 4,
  "&&": 5,
  "|": 6,
  "^": 7,
  "&": 8,
  "==": 9,
  "!=": 9,
  "<": 10,
  ">": 10,
  "<=": 10,
  ">=": 10,
  "<<": 11,
  ">>": 11,
  "+": 12,
  "-": 12,
  "*": 13,
  "/": 13,
  "%": 13
};
var ASSIGNMENT = /* @__PURE__ */ new Set(["=", "+=", "-=", "*=", "/=", "%=", "<<=", ">>=", "&=", "|=", "^="]);
var PREFIX = /* @__PURE__ */ new Set(["-", "+", "!", "~", "++", "--", "&", "*"]);
var WGSL_TEMPLATED = /* @__PURE__ */ new Set([
  "vec2",
  "vec3",
  "vec4",
  "mat2x2",
  "mat2x3",
  "mat2x4",
  "mat3x2",
  "mat3x3",
  "mat3x4",
  "mat4x2",
  "mat4x3",
  "mat4x4",
  "array",
  "bitcast",
  "ptr",
  "atomic"
]);
var STOP = /* @__PURE__ */ new Set([",", ")", "]", ";", ":", "{", "}"]);
function walkExpr(expr, visit) {
  if (!expr) return;
  visit(expr);
  switch (expr.kind) {
    case "call":
      for (const a of expr.args) walkExpr(a, visit);
      break;
    case "member":
      walkExpr(expr.object, visit);
      break;
    case "index":
      walkExpr(expr.object, visit);
      walkExpr(expr.index, visit);
      break;
    case "unary":
      walkExpr(expr.arg, visit);
      break;
    case "binary":
      walkExpr(expr.left, visit);
      walkExpr(expr.right, visit);
      break;
    case "ternary":
      walkExpr(expr.cond, visit);
      walkExpr(expr.then, visit);
      walkExpr(expr.else, visit);
      break;
    case "assign":
      walkExpr(expr.target, visit);
      walkExpr(expr.value, visit);
      break;
    case "paren":
      walkExpr(expr.inner, visit);
      break;
  }
}
function unparen(expr) {
  while (expr.kind === "paren") expr = expr.inner;
  return expr;
}
var ExprParser = class {
  constructor(tokens, start, end, language) {
    this.tokens = tokens;
    this.end = end;
    this.language = language;
    this.i = start;
  }
  tokens;
  end;
  language;
  i;
  peek(offset = 0) {
    const k = this.i + offset;
    return k < this.end ? this.tokens[k] : void 0;
  }
  /** Parses one expression (no top-level comma). */
  expression(minPrecedence = 0) {
    let left = this.unary();
    for (; ; ) {
      const t = this.peek();
      if (!t || t.kind !== "punct") break;
      const op = t.text;
      if (ASSIGNMENT.has(op)) {
        if (minPrecedence > 1) break;
        const tok2 = this.i++;
        const value = this.expression(1);
        left = { kind: "assign", tok: tok2, op, target: left, value };
        continue;
      }
      if (op === "?" && this.language === "glsl") {
        if (minPrecedence > 2) break;
        const tok2 = this.i++;
        const then = this.expression(0);
        if (this.peek()?.text === ":") this.i++;
        const otherwise = this.expression(2);
        left = { kind: "ternary", tok: tok2, cond: left, then, else: otherwise };
        continue;
      }
      const precedence = BINARY_PRECEDENCE[op];
      if (precedence === void 0 || precedence < minPrecedence || precedence <= minPrecedence - 1) break;
      if (precedence < minPrecedence) break;
      const tok = this.i++;
      const right = this.expression(precedence + 1);
      left = { kind: "binary", tok, op, left, right };
    }
    return left;
  }
  unary() {
    const t = this.peek();
    if (t && t.kind === "punct" && PREFIX.has(t.text)) {
      const tok = this.i++;
      return { kind: "unary", tok, op: t.text, arg: this.unaryOperand(), postfix: false };
    }
    return this.postfix(this.primary());
  }
  unaryOperand() {
    const t = this.peek();
    if (t && t.kind === "punct" && PREFIX.has(t.text)) return this.unary();
    return this.postfix(this.primary());
  }
  arguments() {
    const args = [];
    this.i++;
    if (this.peek()?.text === ")") {
      this.i++;
      return args;
    }
    while (this.i < this.end) {
      const before = this.i;
      args.push(this.expression(0));
      const t = this.peek();
      if (t?.text === ",") {
        this.i++;
        continue;
      }
      if (t?.text === ")") {
        this.i++;
        break;
      }
      if (this.i === before) this.i++;
      if (!t) break;
      let depth = 0;
      while (this.i < this.end) {
        const u = this.tokens[this.i].text;
        if (u === "(" || u === "[") depth++;
        else if (u === ")" || u === "]") {
          if (depth === 0) {
            this.i++;
            return args;
          }
          depth--;
        }
        this.i++;
      }
    }
    return args;
  }
  primary() {
    const tok = this.i;
    const t = this.peek();
    if (!t) return { kind: "unknown", tok };
    if (t.kind === "number") {
      this.i++;
      return { kind: "number", tok, text: t.text, type: literalType(t.text), value: literalValue(t.text) };
    }
    if (t.kind === "ident") {
      this.i++;
      let callee = t.text;
      if (this.language === "wgsl" && this.peek()?.text === "<" && WGSL_TEMPLATED.has(t.text)) {
        let depth = 0;
        let k = this.i;
        for (; k < this.end; k++) {
          const u = this.tokens[k].text;
          if (u === "<") depth++;
          else if (u === ">") depth--;
          else if (u === ">>") depth -= 2;
          if (depth <= 0) break;
        }
        callee += this.tokens.slice(this.i, k + 1).map((x) => x.text).join("");
        this.i = k + 1;
      } else if (this.language === "glsl" && this.peek()?.text === "[") {
        let depth = 0;
        let k = this.i;
        for (; k < this.end; k++) {
          const u = this.tokens[k].text;
          if (u === "[") depth++;
          else if (u === "]" && --depth === 0) break;
        }
        if (this.tokens[k + 1]?.text === "(" && k + 1 < this.end) {
          callee += "[]";
          this.i = k + 1;
        }
      }
      if (this.peek()?.text === "(") return { kind: "call", tok, callee, args: this.arguments() };
      return { kind: "ident", tok, name: t.text };
    }
    if (t.text === "(") {
      this.i++;
      const inner = this.expression(0);
      let last = inner;
      while (this.peek()?.text === ",") {
        this.i++;
        last = this.expression(0);
      }
      if (this.peek()?.text === ")") this.i++;
      return { kind: "paren", tok, inner: last };
    }
    if (!STOP.has(t.text)) this.i++;
    return { kind: "unknown", tok };
  }
  postfix(expr) {
    for (; ; ) {
      const t = this.peek();
      if (!t || t.kind !== "punct") return expr;
      if (t.text === "[") {
        const tok = this.i++;
        const index = this.expression(0);
        if (this.peek()?.text === "]") this.i++;
        expr = { kind: "index", tok, object: expr, index };
      } else if (t.text === ".") {
        const tok = this.i++;
        const name = this.peek()?.kind === "ident" ? this.tokens[this.i++].text : "";
        if (this.peek()?.text === "(") {
          this.arguments();
          expr = { kind: "call", tok, callee: `.${name}`, args: [expr] };
        } else {
          expr = { kind: "member", tok, object: expr, name };
        }
      } else if (t.text === "++" || t.text === "--") {
        const tok = this.i++;
        expr = { kind: "unary", tok, op: t.text, arg: expr, postfix: true };
      } else {
        return expr;
      }
    }
  }
};
function parseExpression(tokens, start, end, language) {
  const parser = new ExprParser(tokens, start, end, language);
  const expr = parser.expression(0);
  let last = expr;
  while (parser.peek()?.text === ",") {
    parser.i++;
    last = parser.expression(0);
  }
  return parser.i >= end || last === expr ? expr : last;
}
var GLSL_DECL_QUALIFIERS = /* @__PURE__ */ new Set(["const", "highp", "mediump", "lowp", "precise", "invariant"]);
var StmtParser = class _StmtParser {
  constructor(tokens, start, end, language) {
    this.tokens = tokens;
    this.end = end;
    this.language = language;
    this.i = start;
  }
  tokens;
  end;
  language;
  i;
  text(offset = 0) {
    const k = this.i + offset;
    return k < this.end ? this.tokens[k].text : void 0;
  }
  /** Index of the first token at depth 0 in [i, end) whose text is one of `stops`. */
  find(stops, from = this.i) {
    let depth = 0;
    for (let k = from; k < this.end; k++) {
      const t = this.tokens[k];
      if (t.kind !== "punct") continue;
      if (depth === 0 && stops.includes(t.text)) return k;
      if (t.text === "(" || t.text === "[" || t.text === "{") depth++;
      else if (t.text === ")" || t.text === "]" || t.text === "}") {
        if (depth === 0) return k;
        depth--;
      }
    }
    return this.end;
  }
  expr(start, end) {
    return parseExpression(this.tokens, start, end, this.language);
  }
  /** Parses a parenthesized condition at i (GLSL) or the expression up to '{' (WGSL). */
  condition() {
    if (this.text() === "(" && this.language === "glsl") {
      const close = matching(this.tokens, this.i, "(", ")");
      const cond2 = this.expr(this.i + 1, Math.min(close, this.end));
      this.i = close + 1;
      return cond2;
    }
    const stop = this.find(["{"]);
    const cond = this.expr(this.i, stop);
    this.i = stop;
    return cond;
  }
  block() {
    const body = [];
    while (this.i < this.end && this.text() !== "}") {
      const before = this.i;
      body.push(this.statement());
      if (this.i === before) this.i++;
    }
    return body;
  }
  statement() {
    const tok = this.i;
    const t = this.tokens[this.i];
    if (!t || this.i >= this.end) return { kind: "other", tok };
    if (t.kind === "directive") {
      this.i++;
      return { kind: "other", tok };
    }
    if (t.text === ";") {
      this.i++;
      return { kind: "other", tok };
    }
    if (t.text === "{") {
      this.i++;
      const body = this.block();
      if (this.text() === "}") this.i++;
      return { kind: "block", tok, body };
    }
    if (t.kind === "ident") {
      switch (t.text) {
        case "if": {
          this.i++;
          const cond = this.condition();
          const then = this.statement();
          let otherwise;
          if (this.text() === "else") {
            this.i++;
            otherwise = this.statement();
          }
          return { kind: "if", tok, cond, then, else: otherwise };
        }
        case "for": {
          this.i++;
          if (this.text() !== "(") return this.skip(tok);
          const close = matching(this.tokens, this.i, "(", ")");
          const semi1 = this.find([";"], this.i + 1);
          const semi2 = semi1 < close ? this.find([";"], semi1 + 1) : close;
          const initParser = new _StmtParser(this.tokens, this.i + 1, semi1 + 1, this.language);
          const init = semi1 > this.i + 1 ? initParser.statement() : void 0;
          const cond = semi2 > semi1 + 1 ? this.expr(semi1 + 1, semi2) : void 0;
          const update = splitTopLevel(this.tokens, semi2 + 1, close).map(([a, b]) => this.expr(a, b));
          this.i = close + 1;
          const body = this.statement();
          return { kind: "for", tok, init, cond, update, body };
        }
        case "while": {
          this.i++;
          const cond = this.condition();
          const body = this.statement();
          return { kind: "while", tok, cond, body, doWhile: false };
        }
        case "do": {
          this.i++;
          const body = this.statement();
          let cond = { kind: "unknown", tok };
          if (this.text() === "while") {
            this.i++;
            if (this.text() === "(") {
              const close = matching(this.tokens, this.i, "(", ")");
              cond = this.expr(this.i + 1, close);
              this.i = close + 1;
            } else {
              const stop2 = this.find([";"]);
              cond = this.expr(this.i, stop2);
              this.i = stop2;
            }
            if (this.text() === ";") this.i++;
          }
          return { kind: "while", tok, cond, body, doWhile: true };
        }
        case "loop":
          if (this.language === "wgsl") {
            this.i++;
            while (this.text() === "@") {
              this.i += 2;
              if (this.text() === "(") this.i = matching(this.tokens, this.i, "(", ")") + 1;
            }
            return { kind: "loop", tok, body: this.statement() };
          }
          break;
        case "continuing":
          if (this.language === "wgsl") {
            this.i++;
            return this.statement();
          }
          break;
        case "switch": {
          this.i++;
          const selector = this.condition();
          const cases = [];
          const body = [];
          if (this.text() !== "{") return { kind: "switch", tok, selector, cases, body };
          this.i++;
          while (this.i < this.end && this.text() !== "}") {
            const word = this.text();
            if (word === "case" || word === "default") {
              this.i++;
              const stop2 = this.find([":", "{"]);
              if (word === "case") for (const [a, b] of splitTopLevel(this.tokens, this.i, stop2)) cases.push(this.expr(a, b));
              this.i = stop2;
              if (this.text() === ":") this.i++;
              continue;
            }
            const before = this.i;
            body.push(this.statement());
            if (this.i === before) this.i++;
          }
          if (this.text() === "}") this.i++;
          return { kind: "switch", tok, selector, cases, body };
        }
        case "return": {
          this.i++;
          const stop2 = this.find([";"]);
          const value = stop2 > this.i ? this.expr(this.i, stop2) : void 0;
          this.i = stop2 < this.end ? stop2 + 1 : stop2;
          return { kind: "return", tok, value };
        }
        case "break": {
          if (this.language === "wgsl" && this.text(1) === "if") {
            this.i += 2;
            const stop2 = this.find([";"]);
            const cond = this.expr(this.i, stop2);
            this.i = stop2 < this.end ? stop2 + 1 : stop2;
            return { kind: "breakIf", tok, cond };
          }
          return this.skip(tok);
        }
        case "continue":
        case "discard":
        case "fallthrough":
          return this.skip(tok);
        case "let":
        case "var":
        case "const":
          if (this.language === "wgsl") return this.wgslDeclaration(tok);
          break;
      }
      if (this.language === "glsl") {
        let k = this.i;
        while (k < this.end && GLSL_DECL_QUALIFIERS.has(this.tokens[k].text)) k++;
        let after = k + 1;
        if (this.tokens[after]?.text === "[" && after < this.end) after = matching(this.tokens, after, "[", "]") + 1;
        if (this.tokens[k]?.kind === "ident" && this.tokens[after]?.kind === "ident" && after < this.end) {
          return this.glslDeclaration(tok);
        }
      }
    }
    const stop = this.find([";"]);
    const expr = this.expr(this.i, stop);
    this.i = stop < this.end ? stop + 1 : stop;
    return { kind: "expr", tok, expr };
  }
  skip(tok) {
    const stop = this.find([";"]);
    this.i = stop < this.end ? stop + 1 : Math.max(stop, this.i + 1);
    return { kind: "other", tok };
  }
  glslDeclaration(tok) {
    const stop = this.find([";"]);
    const { declarators } = glslDeclarators(this.tokens, this.i, stop);
    this.i = stop < this.end ? stop + 1 : stop;
    return {
      kind: "decl",
      tok,
      declarators: declarators.map((d) => ({
        name: d.name,
        type: d.type,
        init: d.init ? this.expr(d.init[0], d.init[1]) : void 0,
        tok: this.tokens.findIndex((x, k) => k >= tok && x.text === d.name)
      }))
    };
  }
  wgslDeclaration(tok) {
    let k = this.i + 1;
    if (this.tokens[k]?.text === "<") k = matching(this.tokens, k, "<", ">") + 1;
    const stop = this.find([";"]);
    const nameTok = k;
    const name = this.tokens[k]?.text ?? "";
    k++;
    let type;
    if (this.tokens[k]?.text === ":") {
      const parsed = wgslType(this.tokens, k + 1, stop);
      type = parsed.type;
      k = parsed.next;
    }
    const init = this.tokens[k]?.text === "=" && k + 1 < stop ? this.expr(k + 1, stop) : void 0;
    this.i = stop < this.end ? stop + 1 : stop;
    return { kind: "decl", tok, declarators: [{ name, type, init, tok: nameTok }] };
  }
};
function parseBody(tokens, open, close, language) {
  const parser = new StmtParser(tokens, open + 1, close, language);
  return parser.block();
}
function parseRange(tokens, range, language) {
  return parseExpression(tokens, range[0], range[1], language);
}
function walkStmts(stmts, visit, parents = []) {
  for (const stmt of stmts) {
    visit(stmt, parents);
    const inner = [...parents, stmt];
    switch (stmt.kind) {
      case "block":
        walkStmts(stmt.body, visit, inner);
        break;
      case "if":
        walkStmts(stmt.else ? [stmt.then, stmt.else] : [stmt.then], visit, inner);
        break;
      case "for":
        walkStmts(stmt.init ? [stmt.init, stmt.body] : [stmt.body], visit, inner);
        break;
      case "while":
      case "loop":
        walkStmts([stmt.body], visit, inner);
        break;
      case "switch":
        walkStmts(stmt.body, visit, inner);
        break;
    }
  }
}
function literalSmoothsteps(source, language = "glsl") {
  const code = maskComments(source, language);
  const found = [];
  const literal = /^[-+]?(\d+\.?\d*|\.\d+)([eE][-+]?\d+)?f?$/;
  for (const match of code.matchAll(/\bsmoothstep\s*\(/g)) {
    const args = [""];
    let depth = 1, i = match.index + match[0].length;
    for (; i < code.length; i++) {
      const c = code[i];
      if (c === "(") depth++;
      if (c === ")" && --depth === 0) break;
      if (c === "," && depth === 1) args.push("");
      else args[args.length - 1] += c;
    }
    const [lo, hi] = args.map((arg) => arg.trim());
    if (literal.test(lo) && literal.test(hi)) {
      found.push({ call: code.slice(match.index, i + 1), ascending: parseFloat(lo) < parseFloat(hi), offset: match.index });
    }
  }
  return found;
}

// src/knowledge/shader-craft/checker.ts
var DERIVATIVES = /^(?:dFdx|dFdy|dpdx|dpdy|fwidth)(?:Coarse|Fine)?$/;
var CONTRACT = {
  mainImage: "use void main() in GLSL or an @fragment entry point in WGSL",
  iTime: "use the time uniform declared by the effect pass",
  iGlobalTime: "use the time uniform declared by the effect pass",
  iResolution: "use the resolution uniform declared by the effect pass",
  iFrame: "use the frame uniform declared by the effect pass",
  iMouse: "declare and bind an effect-specific mouse control; there is no implicit mouse uniform",
  gl_FragColor: "declare an out vec4 in GLSL or return @location(0) vec4f in WGSL",
  texture2D: "use texture() in GLSL or textureSample() in WGSL with the pass-bound texture and sampler"
};
var numericType = (type) => {
  if (!type) return;
  if (/^(float|[d]?vec[234]|mat[234]|f32|f16|vec[234]f|vec[234]<f(?:32|16)>)/.test(type)) return "float";
  if (/^(uint|uvec|u32|vec[234]u)/.test(type)) return "uint";
  if (/^(int|ivec|i32|vec[234]i)/.test(type)) return "int";
};
function number(expr) {
  const e = unparen(expr);
  if (e.kind === "number") return e.value;
  if (e.kind === "unary" && (e.op === "+" || e.op === "-")) {
    const n = number(e.arg);
    return n === void 0 ? void 0 : e.op === "-" ? -n : n;
  }
}
function lowerBound(expr) {
  const e = unparen(expr), n = number(e);
  if (n !== void 0) return n;
  if (e.kind !== "call") return;
  if (/^(?:vec[234](?:f|<f32>)?|float|f32)$/.test(e.callee) && e.args.length) {
    const bounds = e.args.map(lowerBound);
    if (bounds.every((x) => x !== void 0)) return Math.min(...bounds);
  }
  if (e.callee === "max") {
    const bounds = e.args.map(lowerBound).filter((x) => x !== void 0);
    if (bounds.length) return Math.max(...bounds);
  }
  if (e.callee === "clamp" && e.args[1]) return lowerBound(e.args[1]);
  if (e.callee === "abs" || e.callee === "length") return 0;
}
function nonzero(expr) {
  const n = number(expr);
  if (n !== void 0) return n !== 0;
  const e = unparen(expr);
  if (e.kind === "call" && /^vec[234](?:f|<f32>)?$/.test(e.callee) && e.args.some(nonzero)) return true;
  return (lowerBound(expr) ?? -Infinity) > 0;
}
function typeOf(expr, types) {
  const e = unparen(expr);
  if (e.kind === "number") return e.type;
  if (e.kind === "ident") return types.get(e.name);
  if (e.kind === "unary") return typeOf(e.arg, types);
  if (e.kind === "member" || e.kind === "index") return typeOf(e.object, types);
  if (e.kind === "call") return numericType(e.callee) ?? (e.args.some((a) => typeOf(a, types) === "float") ? "float" : void 0);
  if (e.kind === "binary") return typeOf(e.left, types) === "float" || typeOf(e.right, types) === "float" ? "float" : typeOf(e.left, types);
}
function intLiteral(expr) {
  const e = unparen(expr);
  return e.kind === "number" ? e.type === "int" : e.kind === "unary" && ["-", "+"].includes(e.op) && intLiteral(e.arg);
}
var UNIFORM_BUILTINS = new Set("abs acos acosh all any asin asinh atan atan2 atanh ceil clamp cos cosh cross degrees determinant distance dot exp exp2 faceforward floor fma fract frexp inverse inversesqrt ldexp length log log2 max min mix mod modf normalize pow radians reflect refract round roundEven saturate select sign sin sinh smoothstep sqrt step tan tanh transpose trunc isnan isinf".split(" "));
function uniformExpr(expr, uniforms, helpers) {
  let uniform = true;
  walkExpr(expr, (e) => {
    if (e.kind === "ident" && !["true", "false"].includes(e.name) && !uniforms.has(e.name)) uniform = false;
    if (e.kind === "call" && (helpers.has(e.callee) || !UNIFORM_BUILTINS.has(e.callee) && !/^(?:float|int|uint|bool|[biu]?vec[234]|mat[234](?:x[234])?|f16|[fiu]32|vec[234][fiub]|mat[234]x[234]f|(?:vec[234]|mat[234]x[234])<(?:f16|[fiu]32|bool)>|bitcast<[^>]+>)$/.test(e.callee))) uniform = false;
  });
  return uniform;
}
function bounded(cond) {
  if (!cond) return false;
  let hasBound = false;
  walkExpr(cond, (e) => {
    if (e.kind === "binary" && ["<", "<=", ">", ">=", "!="].includes(e.op)) hasBound = true;
  });
  return hasBound;
}
function expressions(stmt) {
  switch (stmt.kind) {
    case "decl":
      return stmt.declarators.flatMap((d) => d.init ? [d.init] : []);
    case "expr":
      return [stmt.expr];
    case "return":
      return stmt.value ? [stmt.value] : [];
    case "if":
    case "while":
    case "breakIf":
      return [stmt.cond];
    case "for":
      return [...stmt.cond ? [stmt.cond] : [], ...stmt.update];
    case "switch":
      return [stmt.selector, ...stmt.cases];
    default:
      return [];
  }
}
function checkShaderSource(source, language) {
  const tokens = tokenize(source, language), items = scanTopLevel(source, language, tokens);
  const customFunctions = new Set(items.filter((item) => item.kind === "function").map((item) => item.name));
  const findings = [], seen = /* @__PURE__ */ new Set();
  const add = (rule, severity, tok, message) => {
    const line = tokens[tok]?.line ?? 1, key = `${rule}:${tok}`;
    if (!seen.has(key)) {
      seen.add(key);
      findings.push({ rule, severity, line, message });
    }
  };
  tokens.forEach((t, i) => {
    if (t.kind === "directive") {
      const head = /^#\s*define\s+[A-Za-z_]\w*(?:\([^)]*\))?/.exec(t.text);
      if (head) {
        const body = t.text.slice(0, head[0].length).replace(/[^\r\n]/g, " ") + t.text.slice(head[0].length);
        for (const finding of checkShaderSource(body.replace(/\\(?=\r?\n)/g, " "), language)) {
          const line = t.line + finding.line - 1, key = `${finding.rule}:macro:${i}:${line}`;
          if (!seen.has(key)) {
            seen.add(key);
            findings.push({ ...finding, line });
          }
        }
      }
    }
    if (t.kind === "number" && /^43758\.5453(?:f|h)?$/.test(t.text)) add("sine-hash", "error", i, "The sine-hash multiplier 43758.5453 varies across GPUs; use the library PCG-based hash12, hash22 or hash33.");
    if (t.kind !== "ident") return;
    const replacement = CONTRACT[t.text] ?? (/^iChannel\d+$/.test(t.text) ? "declare a texture input in the effect pass and use its bound texture/sampler" : void 0);
    if (replacement) add("shadertoy-contract", "error", i, `Noisemaker: ${replacement}; ${t.text} is not its shader contract.`);
  });
  for (const item of items) for (const p of item.params ?? []) {
    if (p.name === "fragCoord" && p.qualifier !== "out") {
      const i = tokens.findIndex((t, k) => k >= item.first && k <= item.last && t.text === "fragCoord");
      add("shadertoy-contract", "error", i, "Noisemaker: read gl_FragCoord.xy in GLSL or @builtin(position).xy in WGSL instead of a Shadertoy fragCoord input.");
    }
  }
  for (const ramp of literalSmoothsteps(source, language)) if (!ramp.ascending) {
    const tok = tokens.findIndex((t) => t.start === ramp.offset);
    add("reversed-smoothstep", "error", tok, "smoothstep literal edges must ascend; use 1.0 - smoothstep(low, high, x) for a falling ramp.");
  }
  const globals = /* @__PURE__ */ new Map(), uniformGlobals = /* @__PURE__ */ new Set();
  for (const e of SHADER_CRAFT_LIBRARY) if (e.kind === "const") {
    const type = /^const (\w+)/.exec(e.glsl.signature)?.[1];
    if (numericType(type)) globals.set(e[language].name, numericType(type));
    uniformGlobals.add(e[language].name);
  }
  for (const item of items) {
    if (item.kind === "function" && numericType(item.returnType)) globals.set(item.name, numericType(item.returnType));
    for (const d of item.declarators ?? []) {
      const expr = d.init ? parseRange(tokens, d.init, language) : void 0;
      const type = numericType(d.type) ?? (expr ? typeOf(expr, globals) : void 0);
      if (type) globals.set(d.name, type);
      if (item.storage === "const" || item.storage === "uniform" || item.addressSpace === "uniform" || item.storage === "override") uniformGlobals.add(d.name);
    }
    if (item.storage === "uniform" || item.addressSpace === "uniform") {
      if (item.name) uniformGlobals.add(item.name);
    }
  }
  const derivativeFunctions = /* @__PURE__ */ new Set();
  const bodies = items.filter((item) => item.kind === "function").map((item) => ({ item, body: parseBody(tokens, item.bodyOpen, item.bodyClose, language) }));
  for (let changed = true; changed; ) {
    changed = false;
    for (const { item, body } of bodies) {
      if (derivativeFunctions.has(item.name)) continue;
      let uses = false;
      walkStmts(body, (stmt) => expressions(stmt).forEach((expr) => walkExpr(expr, (e) => {
        if (e.kind === "call" && (DERIVATIVES.test(e.callee) || derivativeFunctions.has(e.callee))) uses = true;
      })));
      if (uses) {
        derivativeFunctions.add(item.name);
        changed = true;
      }
    }
  }
  const checkExpr = (expr, types, control = false, uniforms = uniformGlobals) => walkExpr(expr, (e) => {
    const checkControlled = (branch) => walkExpr(branch, (call) => {
      if (call.kind === "call" && (DERIVATIVES.test(call.callee) || derivativeFunctions.has(call.callee))) add("derivative-control-flow", "warning", call.tok, "Evaluate derivatives before non-uniform conditional expressions or short-circuit branches.");
    });
    if (e.kind === "ternary" && !uniformExpr(e.cond, uniforms, customFunctions)) {
      checkControlled(e.then);
      checkControlled(e.else);
    }
    if (e.kind === "binary" && ["&&", "||"].includes(e.op) && !uniformExpr(e.left, uniforms, customFunctions)) checkControlled(e.right);
    if (language === "glsl" && e.kind === "binary" && ["+", "-", "*", "/", "%"].includes(e.op) && (intLiteral(e.left) && typeOf(e.right, types) === "float" || intLiteral(e.right) && typeOf(e.left, types) === "float")) {
      add("integer-float-mix", "error", e.tok, "GLSL float arithmetic needs float literals (for example 2.0 * PI), or an explicit float() conversion.");
    }
    if (e.kind !== "call") return;
    const name = e.callee, a = e.args[0];
    if (name === "fract") {
      let sine = false;
      walkExpr(a, (x) => {
        if (x.kind === "call" && x.callee === "sin") sine = true;
      });
      if (sine) add("sine-hash", "error", e.tok, "Sine hashes vary across GPUs; use the library PCG-based hash12, hash22 or hash33 (WGSL names carry type suffixes).");
    }
    if (name === "round") add("round", "warning", e.tok, "round() tie behavior differs across shader languages and GPUs; prefer floor(x + 0.5) when that tie rule is intended.");
    if (control && (DERIVATIVES.test(name) || derivativeFunctions.has(name))) add("derivative-control-flow", "warning", e.tok, "Evaluate derivatives outside loops and non-uniform branches, then pass the result into the controlled code.");
    let risk = false;
    if (a) {
      if (name === "pow") risk = (lowerBound(a) ?? -Infinity) < 0;
      if (name === "sqrt") risk = (lowerBound(a) ?? -Infinity) < 0;
      if (name === "log" || name === "log2" || name === "inversesqrt") risk = (lowerBound(a) ?? -Infinity) <= 0;
      if (name === "normalize") risk = !nonzero(a);
      if ((name === "atan" || name === "atan2") && e.args.length === 2) risk = !e.args.some(nonzero);
    }
    if (risk) add("nan-risk", "warning", e.tok, `${name}() can receive a zero or negative argument; guard its domain with max/clamp or a nonzero fallback.`);
    if (language === "glsl" && ["clamp", "min", "max", "mix", "step", "smoothstep", "pow", "mod"].includes(name) && e.args.some((x) => typeOf(x, types) === "float") && e.args.some(intLiteral)) {
      add("integer-float-mix", "error", e.tok, `GLSL ${name}() mixes integer literals with float arguments; spell float literals with .0.`);
    }
  });
  for (const item of items) {
    if (item.kind !== "declaration") continue;
    for (const d of item.declarators ?? []) if (d.init) checkExpr(parseRange(tokens, d.init, language), globals);
    if (!item.declarators?.length && tokens[item.first]?.kind !== "ident") checkExpr(parseRange(tokens, [item.first, item.last + 1], language), globals);
  }
  for (const { item, body } of bodies) {
    const types = new Map(globals), uniforms = new Set(uniformGlobals);
    for (const p of item.params ?? []) {
      const type = numericType(p.type);
      if (type) types.set(p.name, type);
      uniforms.delete(p.name);
    }
    walkStmts(body, (stmt, parents) => {
      const controls = ["for", "while", "loop"].includes(stmt.kind) ? [...parents, stmt] : parents;
      const control = controls.some((p) => ["for", "while", "loop"].includes(p.kind) || p.kind === "if" && !uniformExpr(p.cond, uniforms, customFunctions) || p.kind === "switch" && !uniformExpr(p.selector, uniforms, customFunctions));
      expressions(stmt).forEach((expr) => {
        checkExpr(expr, types, control, uniforms);
        walkExpr(expr, (e) => {
          if (e.kind === "assign") {
            let target = e.target;
            while (target.kind === "member" || target.kind === "index") target = target.object;
            if (target.kind === "ident") {
              if (e.target.kind === "ident" && !control && uniformExpr(e.value, uniforms, customFunctions)) uniforms.add(target.name);
              else uniforms.delete(target.name);
            }
          }
        });
      });
      if (stmt.kind === "decl") for (const d of stmt.declarators) {
        const type = numericType(d.type) ?? (d.init ? typeOf(d.init, types) : void 0);
        if (type) types.set(d.name, type);
        if (d.init && uniformExpr(d.init, uniforms, customFunctions)) uniforms.add(d.name);
        else uniforms.delete(d.name);
      }
      if ((stmt.kind === "for" || stmt.kind === "while") && !bounded(stmt.cond)) add("unbounded-loop", "warning", stmt.tok, "Loop condition has no explicit comparison bound; use a bounded iteration count.");
      if (stmt.kind === "loop") {
        let bound = false;
        walkStmts([stmt.body], (s) => {
          if ((s.kind === "breakIf" || s.kind === "if") && bounded(s.cond)) bound = true;
        });
        if (!bound) add("unbounded-loop", "warning", stmt.tok, "WGSL loop has no visible bounded break; use a bounded iteration count.");
      }
    });
  }
  const heads = new Set(items.filter((i) => i.kind === "function" || i.kind === "prototype").map((i) => tokens.findIndex((t, k) => k >= i.first && k <= i.last && t.text === i.name)));
  for (let i = 0; i < tokens.length; i++) {
    if (tokens[i].kind !== "ident" || tokens[i + 1]?.text !== "(" || heads.has(i) || bodies.some(({ item }) => i > item.bodyOpen && i < item.bodyClose)) continue;
    let depth = 0, end = i + 1;
    for (; end < tokens.length; end++) {
      if (tokens[end].text === "(") depth++;
      if (tokens[end].text === ")" && --depth === 0) {
        end++;
        break;
      }
    }
    checkExpr(parseExpression(tokens, i, end, language), globals);
  }
  return findings.sort((a, b) => a.line - b.line || a.rule.localeCompare(b.rule));
}

// src/knowledge/shader-craft/credits.ts
var SHADER_CRAFT_CREDITS = {
  adaptedFrom: "The shader-art-coding skill of shader-skills by gokayfem (gokayfem/shader-skills, commit e09bc993bf04201f26c03c87c89210e9b472f526, 2026-10-19), MIT licence, Copyright (c) 2026 gokayfem. Adapted for Noisemaker effects by Noise Factor.",
  policy: "All GLSL in shader-skills is an original implementation released under the MIT licence. The techniques come from the published work below. Numeric constants (matrices, fit coefficients, physical coefficients) are facts reproduced from their sources. No third-party shader source is copied; Shadertoy shaders default to CC BY-NC-SA 3.0, which is incompatible with MIT.",
  techniques: [
    {
      key: "quilez-articles",
      technique: "SDF primitives, operators, smooth minimum, domain repetition, normals, soft shadows, intersectors, fog, palettes, filtered patterns, Voronoi borders, noise derivatives, domain warping",
      source: "Inigo Quilez, articles on distance functions, smooth minimum, soft shadows, intersectors, fog, palettes, filtering and noise",
      terms: "articles state no license; ideas reimplemented"
    },
    {
      key: "hg-sdf",
      technique: "Chamfer, stairs and engrave combinators, polar and mirrored repetition",
      source: "Mercury demogroup, hg_sdf",
      terms: "MIT OR CC BY-NC 4.0"
    },
    {
      key: "pcg-hash",
      technique: "PCG hashes (pcgHash, pcg3d, pcg4d) and hash quality data",
      source: 'Jarzynski and Olano, "Hash Functions for GPU Rendering", JCGT 9(3), 2020',
      terms: "paper CC BY-ND 3.0; arithmetic reimplemented"
    },
    {
      key: "interleaved-gradient-noise",
      technique: "Interleaved gradient noise",
      source: 'Jorge Jimenez, "Next Generation Post Processing in Call of Duty: Advanced Warfare", SIGGRAPH 2014',
      terms: "constants are facts"
    },
    {
      key: "r2-sequence",
      technique: "R2 low-discrepancy sequence",
      source: 'Martin Roberts, "The Unreasonable Effectiveness of Quasirandom Sequences"',
      terms: "constants are facts"
    },
    {
      key: "curl-noise",
      technique: "Curl noise",
      source: 'Bridson, Hourihan and Nordenstam, "Curl-Noise for Procedural Fluid Flow", SIGGRAPH 2007',
      terms: "math"
    },
    {
      key: "enhanced-sphere-tracing",
      technique: "Enhanced (over-relaxed) sphere tracing (documented, not shipped)",
      source: 'Keinert et al., "Enhanced Sphere Tracing", STAG 2014',
      terms: "math"
    },
    {
      key: "agx",
      technique: "AgX tonemapping (minimal polynomial version)",
      source: "Troy Sobotka (AgX); Benjamin Wrensch / iolite (polynomial fit)",
      terms: "MIT"
    },
    {
      key: "pbr-neutral",
      technique: "Khronos PBR Neutral tonemapping",
      source: "Khronos Group, PBR Neutral tone mapper (KhronosGroup ToneMapping repository)",
      terms: "Apache-2.0 (constants)"
    },
    {
      key: "aces-fit",
      technique: "ACES fitted (RRT+ODT)",
      source: "Stephen Hill, via MJP's BakingLab",
      terms: "MIT"
    },
    {
      key: "oklab",
      technique: "Oklab / OkLCh",
      source: 'Bjorn Ottosson, "A perceptual color space for image processing" (Oklab)',
      terms: "public domain / MIT"
    },
    {
      key: "blackbody",
      technique: "Blackbody chromaticity",
      source: "Krystek 1985 Planckian-locus fit",
      terms: "math"
    },
    {
      key: "filament-brdf",
      technique: "GGX, height-correlated Smith visibility, Schlick Fresnel",
      source: "Filament documentation (Google)",
      terms: "Apache-2.0 (formulas)"
    },
    {
      key: "env-brdf",
      technique: "Environment BRDF approximation",
      source: 'Brian Karis, "Physically Based Shading on Mobile" (after Lazarov)',
      terms: "constants are facts"
    },
    {
      key: "wrap-lighting",
      technique: "Energy-conserving wrap lighting",
      source: 'Stephen Hill, "Righting Wrap" (2011)',
      terms: "math"
    },
    {
      key: "fast-translucency",
      technique: "Fast translucency",
      source: "Barre-Brisebois and Bouchard, GDC 2011",
      terms: "math"
    },
    {
      key: "hillaire-volumes",
      technique: "Energy-conserving volume integration, sky constants",
      source: 'Sebastien Hillaire, Frostbite (SIGGRAPH 2015/2016) and "A Scalable and Production Ready Sky and Atmosphere Rendering Technique" (EGSR 2020)',
      terms: "math, constants are facts"
    },
    {
      key: "schneider-clouds",
      technique: "Beer-Powder cloud lighting, dual-lobe phase",
      source: "Andrew Schneider, Horizon Zero Dawn clouds (SIGGRAPH 2015)",
      terms: "math"
    },
    {
      key: "limb-darkening",
      technique: "Sun limb darkening",
      source: "Neckel 1996",
      terms: "constants are facts"
    },
    {
      key: "cornette-shanks",
      technique: "Cornette-Shanks phase function",
      source: "Cornette and Shanks 1992",
      terms: "math"
    },
    {
      key: "simplex-noise",
      technique: "Simplex noise and its analytic gradient",
      source: 'Stefan Gustavson, "Simplex noise demystified" (2005); Gustavson and McEwan, "Tiling simplex noise and flow noise in two and three dimensions", JCGT 11(1), 2022',
      terms: "papers; math reimplemented, the psrdnoise reference code is not used"
    },
    {
      key: "flow-noise",
      technique: "Flow noise (rotating gradients)",
      source: 'Perlin and Neyret, "Flow Noise", SIGGRAPH 2001 technical sketch',
      terms: "math"
    },
    {
      key: "turbulence",
      technique: "Turbulence",
      source: 'Ken Perlin, "An Image Synthesizer", SIGGRAPH 1985',
      terms: "math"
    },
    {
      key: "perlin-improved-noise",
      technique: "Gradient-noise learning reference",
      source: "Ken Perlin, improved noise reference",
      terms: "reference only; fixed-permutation Java code not copied"
    },
    {
      key: "book-of-shaders",
      technique: "Noise progression: fBm, ridges, cellular construction, domain warping",
      source: 'Gonzalez Vivo and Lowe, The Book of Shaders, chapters 12 ("Cellular Noise") and 13 ("Fractal Brownian Motion")',
      terms: "explanatory sources; no source code copied"
    },
    {
      key: "noise-code-catalog",
      technique: "External noise code catalog",
      source: "Gustavson / Ashima, webgl-noise; Gustavson and McEwan, psrdnoise; Auburn, FastNoise Lite",
      terms: "MIT alternatives named in the noise use-case reference; not vendored"
    },
    {
      key: "billow",
      technique: "Billow terminology",
      source: "libnoise Billow module documentation",
      terms: "reference only; code not copied; the library's weighted [0,1] billow differs"
    },
    {
      key: "hybrid-terrain",
      technique: "Hybrid terrain height and designed river composition",
      source: "shader-skills, hybridTerrainHeight and the noise terrain map template",
      terms: "original MIT composition; not a claim to implement Musgrave's hybrid multifractal or hydrological erosion"
    },
    {
      key: "finch-water",
      technique: "Sum-of-sines water with sharpened crests, deep-water dispersion",
      source: 'Mark Finch, "Effective Water Simulation from Physical Models", GPU Gems (2004), chapter 1',
      terms: "math"
    },
    {
      key: "normal-filtering",
      technique: "Filtering vanished normal detail into roughness",
      source: 'Toksvig, "Mipmapping Normal Maps" (2005); Olano and Baker, "LEAN Mapping" (I3D 2010)',
      terms: "math"
    },
    {
      key: "moss-egg",
      technique: "Four-arc (Moss) egg",
      source: "classical compass construction",
      terms: "geometry"
    },
    {
      key: "building-massing",
      technique: "Procedural building massing hierarchy",
      source: 'M\xFCller et al., "Procedural Modeling of Buildings", SIGGRAPH 2006; SIGGRAPH 2011 course on urban modeling',
      terms: "concepts reimplemented; not a CGA engine or copied grammar/code"
    },
    {
      key: "facade-windows",
      technique: "Filtered facade window coverage",
      source: "Inigo Quilez, filterable procedurals / analytic footprint integration",
      terms: "original periodic rectangle integral; no source copied"
    },
    {
      key: "geiss-terrain",
      technique: "Terrain representation and density/meshing distinction",
      source: 'Ryan Geiss, "Generating Complex Procedural Terrains Using the GPU", GPU Gems 3, chapter 1',
      terms: "explanatory source; the heightfield structures do not implement the chapter's meshing pipeline"
    },
    {
      key: "wave-dispersion",
      technique: "Finite-depth gravity-wave dispersion",
      source: "MIT 2.20 Marine Hydrodynamics, lecture 20",
      terms: "mathematical relation, original implementation"
    },
    {
      key: "pbrt-dielectric",
      technique: "Exact dielectric Fresnel and Beer-Lambert attenuation",
      source: 'Physically Based Rendering (PBRT), "Specular Reflection and Transmission" and "Transmittance"',
      terms: "equations reimplemented; no PBRT source copied"
    },
    {
      key: "gpu-gems-refraction",
      technique: "Coastal refraction pipeline comparison",
      source: 'GPU Gems 2, chapter 19, "Generic Refraction Simulation"',
      terms: "reference for scene-buffer alternatives; the coastal structure traces a procedural heightfield instead"
    },
    {
      key: "shader-skills",
      technique: "Original library code with no outside technique source in the upstream credits: helper and remapping functions, hex and Truchet tilings, camera rays, hemisphere and rim lighting, sRGB transfer functions, Reinhard tonemapping, film grain, vignette, TPDF dither, gyroid and fold helpers, SDF thickness, and debug views",
      source: "gokayfem, shader-skills (original implementations of standard formulas)",
      terms: "MIT"
    }
  ]
};

// src/knowledge/shader-craft/bundler.ts
var CREDIT_BLOCK = /\/\* shader-craft credits\n[\s\S]*?\*\//;
function bundleShaderSource(source, language) {
  const tokens = tokenize(source, language), items = scanTopLevel(source, language, tokens);
  const byId = new Map(SHADER_CRAFT_LIBRARY.map((e) => [e.id, e]));
  const definitions = /* @__PURE__ */ new Set(), definedNames = /* @__PURE__ */ new Set();
  for (const item of items) {
    if (item.kind === "prototype") continue;
    if (item.kind === "function") {
      definedNames.add(item.name);
      definitions.add(language === "glsl" ? `${item.name}(${item.params.map((p) => p.type).join(",")})` : item.name);
    } else {
      if (item.name) {
        definedNames.add(item.name);
        definitions.add(item.name);
      }
      for (const d of item.declarators ?? []) {
        definedNames.add(d.name);
        definitions.add(d.name);
      }
    }
  }
  const macros = new Set(items.filter((item) => item.directive === "define").map((item) => item.name));
  const own = (id) => {
    const e = byId.get(id);
    return language === "glsl" && macros.has(e.glsl.name) || definitions.has(language === "glsl" && e.kind === "function" ? e.id : e[language].name);
  };
  const byName = /* @__PURE__ */ new Map();
  for (const e of SHADER_CRAFT_LIBRARY) byName.set(e[language].name, [...byName.get(e[language].name) ?? [], e]);
  const required = /* @__PURE__ */ new Set(), visiting = /* @__PURE__ */ new Set();
  const include = (id) => {
    if (own(id) || required.has(id) || visiting.has(id)) return;
    visiting.add(id);
    const entry = byId.get(id);
    for (const dep of entry[language].dependencies) include(dep);
    required.add(id);
    if (language === "glsl") for (const overload of byName.get(entry.glsl.name)) include(overload.id);
    visiting.delete(id);
  };
  tokens.forEach((token, i) => {
    if (token.kind === "directive") {
      const item = items.find((item2) => item2.first === i);
      if (item?.macroBody) for (const ref of tokenize(item.macroBody, language)) for (const entry of byName.get(ref.text) ?? []) include(entry.id);
      return;
    }
    if (token.kind !== "ident" || tokens[i - 1]?.text === ".") return;
    const entries2 = byName.get(token.text);
    if (!entries2) return;
    for (const entry of entries2) {
      if (entry.kind === "function" && tokens[i + 1]?.text !== "(") continue;
      const declaration = items.find((item) => item.name === token.text && i >= item.first && i <= item.last && (item.kind !== "function" || i < item.bodyOpen));
      if (declaration) continue;
      include(entry.id);
    }
  });
  const added = SHADER_CRAFT_LIBRARY.filter((e) => required.has(e.id)).map((e) => e.id);
  if (!added.length) return { source, added: [], credits: [] };
  const requires = new Set(added.flatMap((id) => byId.get(id)[language].requires));
  for (const name of requires) {
    if (!definedNames.has(name)) throw new Error(`Shader-craft requires program symbol ${name}: ${SHADER_CRAFT_LIBRARY_PROGRAM_SYMBOLS.find((p) => p.name === name)?.[language]}`);
  }
  if (language === "wgsl" && requires.has("ZERO") && !items.some((item) => item.stage && tokens.slice(item.bodyOpen + 1, item.bodyClose).some((t, i, body) => t.text === "ZERO" && body[i + 1]?.text === "="))) {
    throw new Error("Shader-craft requires ZERO initialization in the WGSL entry point: ZERO = min(i32(frame), 0); use the program frame uniform.");
  }
  const credits = [...new Set(added.flatMap((id) => byId.get(id).credits))];
  const oldBlock = CREDIT_BLOCK.exec(source);
  const oldIds = oldBlock ? JSON.parse(/Included symbols: (\[[^\n]*\])/.exec(oldBlock[0])?.[1] ?? "[]") : [];
  const allIds = SHADER_CRAFT_LIBRARY.filter((e) => oldIds.includes(e.id) || required.has(e.id)).map((e) => e.id);
  const allCredits = new Set(allIds.flatMap((id) => byId.get(id).credits));
  const header = `/* shader-craft credits
${SHADER_CRAFT_CREDITS.adaptedFrom}
Included symbols: ${JSON.stringify(allIds)}
` + SHADER_CRAFT_CREDITS.techniques.filter((c) => allCredits.has(c.key)).map((c) => `${c.key}: ${c.source}; ${c.terms}.`).join("\n") + "\n*/";
  const firstFunction = items.find((item) => item.kind === "function");
  let cut = firstFunction?.start ?? source.length;
  if (firstFunction?.depth) {
    const opening = items.find((item) => item.start < cut && item.depth === 0 && ["if", "ifdef", "ifndef"].includes(item.directive ?? ""));
    if (opening) cut = opening.start;
  }
  const addedNames = new Set(added.map((id) => byId.get(id)[language].name));
  if (language === "glsl") for (const item of items) {
    if (item.start >= cut) break;
    if (item.kind === "declaration" && !["precision", "uniform", "in", "out", "layout"].includes(item.storage ?? "") && item.name !== "ZERO" && tokens.slice(item.first, item.last + 1).some((t) => addedNames.has(t.text))) {
      cut = item.start;
      break;
    }
  }
  if (language === "glsl" && requires.has("ZERO")) {
    const zero = items.find((i) => i.name === "ZERO");
    if (zero.start >= cut) throw new Error("Define ZERO in the GLSL preamble before the first function or library-dependent initializer.");
  }
  const dependencies = new Set(added.flatMap((id) => byId.get(id)[language].dependencies));
  const callerPrototypes = [];
  if (language === "glsl") for (const item of items) {
    if (item.kind !== "function" || item.start < cut || macros.has(item.name)) continue;
    const signature = (entry) => `${entry.name}(${entry.params.map((p) => p.type).join(",")})`;
    if (!dependencies.has(signature(item))) continue;
    if (items.some((entry) => entry.kind === "prototype" && entry.start < cut && signature(entry) === signature(item))) continue;
    callerPrototypes.push(source.slice(item.start, tokens[item.bodyOpen].start).trim() + ";");
  }
  const prototype = callerPrototypes.join("\n") + (callerPrototypes.length ? "\n\n" : "") + (language === "glsl" && requires.has("map") && !items.some((i) => i.kind === "prototype" && i.name === "map" && i.start < cut) ? "vec2 map(vec3 p);\n\n" : "");
  const library = added.map((id) => getShaderCraftSymbolSource(id, language)).join("\n\n");
  let result = source.slice(0, cut) + "\n" + (oldBlock ? "" : header + "\n\n") + prototype + library + "\n\n" + source.slice(cut);
  if (oldBlock) result = result.replace(CREDIT_BLOCK, header);
  return { source: result, added, credits };
}

// src/knowledge/shader-craft/search-library.ts
function searchShaderLibrary(query, options = {}) {
  const language = options.language ?? "glsl", words = query.toLowerCase().match(/[\w]+/g) ?? [];
  const limit = Number.isFinite(options.limit) ? Math.max(0, Math.floor(options.limit)) : 15;
  if (!words.length || !limit) return [];
  return SHADER_CRAFT_LIBRARY.map((e) => {
    const name = e[language].name.toLowerCase(), text = `${e[language].signature} ${e.summary} ${e.module}`.toLowerCase();
    const score = (e.kind === "function" ? 0.1 : 0) + words.reduce((score2, word) => score2 + (name === word ? 10 : name.includes(word) ? 5 : 0) + (text.includes(word) ? 1 : 0), 0);
    return { score, result: { id: e.id, language, name: e[language].name, signature: e[language].signature, summary: e.summary, module: e.module } };
  }).filter((e) => e.score >= 1).sort((a, b) => b.score - a.score).slice(0, limit).map((e) => e.result);
}

// src/knowledge/shader-craft/examples/alpine-valley.ts
var alpine_valley_default = {
  glsl: `const vec3 ALPINE_SUN=vec3(-0.7992474537, 0.5164368163, -0.3074028668);
const float SNOW_ALTITUDE=1.9;
const float FAR_DISTANCE=70.0;
const int ALPINE_TRACE_STEPS=320;
float alpineHeight(vec2 p) {
    float valley=1.0-exp(-0.085*p.x*p.x);
    float peaks=0.65+1.8*erodedFbm(p*vec2(0.30,0.25)+vec2(2.0,7.0),6)
                +0.35*ridgedFbm(p*0.2,4);
    float broad=0.5+0.5*fbm(p*0.12,4);
    float detail=0.06*fbm(p*1.8,3);
    return 0.18+(1.3+3.1*peaks+1.0*broad)*valley+detail;
}
vec2 map(vec3 p) {return vec2((p.y-alpineHeight(p.xz))*0.12,1.0);}
vec3 traceAlpine(vec3 ro,vec3 rd) {
    float t=0.02,previous=0.0;
    for(int i=0;i<ALPINE_TRACE_STEPS;i++) {
        vec3 p=ro+rd*t;
        float gap=p.y-alpineHeight(p.xz);
        if(gap<0.0) {
            float lo=previous,hi=t;
            for(int j=0;j<10;j++) {
                float mid=0.5*(lo+hi);
                vec3 q=ro+rd*mid;
                if(q.y>alpineHeight(q.xz))lo=mid;else hi=mid;
            }
            return vec3(0.5*(lo+hi),1.0,float(i));
        }
        previous=t;
        t+=0.04+0.015*t;
        if(t>FAR_DISTANCE)break;
    }
    return vec3(-1.0,0.0,float(ALPINE_TRACE_STEPS));
}
vec3 alpineSky(vec3 rd) {
    vec3 c=simpleSky(rd,ALPINE_SUN);
    float cloud=smoothstep(0.1,0.5,fbm(rd.xz/max(rd.y+0.45,0.15)*1.2,4));
    return mix(c,vec3(0.86,0.88,0.91),cloud*0.45*smoothstep(0.05,0.4,rd.y));
}
vec3 alpineRender(vec2 coord) {
    vec2 uv=(2.0*coord-resolution)/resolution.y;
    vec3 ro=vec3(0.15,2.1,10.0-0.25*sin(TAU*fract(time)));
    ro.y=max(ro.y,alpineHeight(ro.xz)+0.7);
    vec3 rd=cameraRay(cameraMatrix(ro,vec3(0.0,1.9,-15.0),0.0),uv,1.8);
    vec3 sky=alpineSky(rd);
    vec3 hit=traceAlpine(ro,rd);
    if(hit.x<0.0)return sky;
    vec3 p=ro+rd*hit.x;
    float footprint=hit.x*2.0/(resolution.y*1.8);
    vec3 n=calcNormal(p,max(0.002,footprint*0.5));
    float snow=smoothstep(SNOW_ALTITUDE-0.3,SNOW_ALTITUDE+0.4,p.y+0.22*fbm(p.xz*2.0,3))
              *smoothstep(0.35,0.75,n.y);
    float grass=smoothstep(0.6,0.9,n.y)*(1.0-smoothstep(1.4,2.5,p.y));
    float detailKeep=1.0-smoothstep(0.02,0.2,footprint);
    float grain=0.5+0.5*fbm(p.xz*18.0,3)*detailKeep;
    float strata=0.5+0.5*sin(p.y*35.0+fbm(p.xz*3.0,3)*2.0);
    vec3 rock=mix(vec3(0.16,0.15,0.14),vec3(0.32,0.29,0.25),grain)*(0.85+0.15*strata*detailKeep);
    vec3 albedo=mix(rock,mix(vec3(0.075,0.12,0.035),vec3(0.16,0.20,0.065),grain),grass);
    albedo=mix(albedo,vec3(0.78,0.84,0.9),snow);
    float shadow=softShadow(p+n*0.03,ALPINE_SUN,0.03,15.0,12.0);
    vec3 col=shadePBR(n,-rd,ALPINE_SUN,albedo,0.8,0.0)*vec3(3.4,3.0,2.5)*shadow;
    col+=albedo*hemisphereLight(n,vec3(0.4,0.58,0.85),vec3(0.16,0.13,0.095));
    vec3 haze=alpineSky(normalize(vec3(rd.x,0.04,rd.z)));
    float fog=heightFog(ro,rd,hit.x,0.011,0.18);
    return mix(col,haze,fog);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 col=alpineRender(sampleCoord);
    col=linearToSrgb(tonemapAgX(col*1.15))+ditherTPDF(sampleCoord,int(seed));
    fragColor=vec4(col,1.0);
}
`,
  wgsl: `const ALPINE_SUN: vec3f = vec3f((-0.7992474537), 0.5164368163, (-0.3074028668));

const SNOW_ALTITUDE: f32 = 1.9;

const FAR_DISTANCE: f32 = 70.0;

const ALPINE_TRACE_STEPS: i32 = 320;

fn alpineHeight(p_arg: vec2f) -> f32 {
    var p = p_arg;
    var valley: f32 = (1.0 - exp((((-0.085) * p.x) * p.x)));
    var peaks: f32 = ((0.65 + (1.8 * erodedFbm(((p * vec2f(0.30, 0.25)) + vec2f(2.0, 7.0)), 6))) + (0.35 * ridgedFbm((p * 0.2), 4)));
    var broad: f32 = (0.5 + (0.5 * fbm_f2i((p * 0.12), 4)));
    var detail: f32 = (0.06 * fbm_f2i((p * 1.8), 3));
    return ((0.18 + ((((1.3 + (3.1 * peaks)) + (1.0 * broad))) * valley)) + detail);
}

fn map(p_arg: vec3f) -> vec2f {
    var p = p_arg;
    return vec2f((((p.y - alpineHeight(p.xz))) * 0.12), 1.0);
}

fn traceAlpine(ro_arg: vec3f, rd_arg: vec3f) -> vec3f {
    var ro = ro_arg;
    var rd = rd_arg;
    var t: f32 = 0.02;
    var previous: f32 = 0.0;
    for (var i: i32 = 0; (i < ALPINE_TRACE_STEPS); i++) {
        var p: vec3f = (ro + (rd * t));
        var gap: f32 = (p.y - alpineHeight(p.xz));
        if ((gap < 0.0)) {
            var lo: f32 = previous;
            var hi: f32 = t;
            for (var j: i32 = 0; (j < 10); j++) {
                var mid: f32 = (0.5 * ((lo + hi)));
                var q: vec3f = (ro + (rd * mid));
                if ((q.y > alpineHeight(q.xz))) {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }
            return vec3f((0.5 * ((lo + hi))), 1.0, f32(i));
        }
        previous = t;
        t += (0.04 + (0.015 * t));
        if ((t > FAR_DISTANCE)) {
            break;
        }
    }
    return vec3f((-1.0), 0.0, f32(ALPINE_TRACE_STEPS));
}

fn alpineSky(rd_arg: vec3f) -> vec3f {
    var rd = rd_arg;
    var c: vec3f = simpleSky(rd, ALPINE_SUN);
    var cloud: f32 = smoothstep(0.1, 0.5, fbm_f2i(((rd.xz / vec2f(max((rd.y + 0.45), 0.15))) * 1.2), 4));
    return mix(c, vec3f(0.86, 0.88, 0.91), ((cloud * 0.45) * smoothstep(0.05, 0.4, rd.y)));
}

fn alpineRender(coord_arg: vec2f) -> vec3f {
    var coord = coord_arg;
    var uv: vec2f = ((((2.0 * coord) - resolution)) / vec2f(resolution.y));
    var ro: vec3f = vec3f(0.15, 2.1, (10.0 - (0.25 * sin((TAU * time)))));
    ro.y = max(ro.y, (alpineHeight(ro.xz) + 0.7));
    var rd: vec3f = cameraRay(cameraMatrix(ro, vec3f(0.0, 1.9, (-15.0)), 0.0), uv, 1.8);
    var sky: vec3f = alpineSky(rd);
    var hit: vec3f = traceAlpine(ro, rd);
    if ((hit.x < 0.0)) {
        return sky;
    }
    var p: vec3f = (ro + (rd * hit.x));
    var footprint: f32 = ((hit.x * 2.0) / ((resolution.y * 1.8)));
    var n: vec3f = calcNormal(p, max(0.002, (footprint * 0.5)));
    var snow: f32 = (smoothstep((SNOW_ALTITUDE - 0.3), (SNOW_ALTITUDE + 0.4), (p.y + (0.22 * fbm_f2i((p.xz * 2.0), 3)))) * smoothstep(0.35, 0.75, n.y));
    var grass: f32 = (smoothstep(0.6, 0.9, n.y) * ((1.0 - smoothstep(1.4, 2.5, p.y))));
    var detailKeep: f32 = (1.0 - smoothstep(0.02, 0.2, footprint));
    var grain: f32 = (0.5 + ((0.5 * fbm_f2i((p.xz * 18.0), 3)) * detailKeep));
    var strata: f32 = (0.5 + (0.5 * sin(((p.y * 35.0) + (fbm_f2i((p.xz * 3.0), 3) * 2.0)))));
    var rock: vec3f = (mix(vec3f(0.16, 0.15, 0.14), vec3f(0.32, 0.29, 0.25), grain) * ((0.85 + ((0.15 * strata) * detailKeep))));
    var albedo: vec3f = mix(rock, mix(vec3f(0.075, 0.12, 0.035), vec3f(0.16, 0.20, 0.065), grain), grass);
    albedo = mix(albedo, vec3f(0.78, 0.84, 0.9), snow);
    var shadow: f32 = softShadow((p + (n * 0.03)), ALPINE_SUN, 0.03, 15.0, 12.0);
    var col: vec3f = ((shadePBR(n, (-rd), ALPINE_SUN, albedo, 0.8, 0.0) * vec3f(3.4, 3.0, 2.5)) * shadow);
    col += (albedo * hemisphereLight(n, vec3f(0.4, 0.58, 0.85), vec3f(0.16, 0.13, 0.095)));
    var haze: vec3f = alpineSky(normalize(vec3f(rd.x, 0.04, rd.z)));
    var fog: f32 = heightFog(ro, rd, hit.x, 0.011, 0.18);
    return mix(col, haze, fog);
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var col: vec3f = alpineRender(sampleCoord);
    col = (linearToSrgb(tonemapAgX((col * 1.15))) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/coastal-water.ts
var coastal_water_default = {
  glsl: `const int WATER_AA=1;
const int WATER_WAVES=8;
const int WATER_STEPS=180;
const vec3 COAST_SUN=vec3(-0.3890330019, 0.6891441748, -0.6113375744);
const vec3 EXTINCTION=vec3(0.42,0.085,0.045);
const float WATER_IOR=1.333;
const float WATER_FAR=95.0;
float coastBed(vec2 p) {
    vec2 a=p-vec2(-7.0,-8.0),b=p-vec2(7.0,-19.0),c=p-vec2(-5.0,-1.0);
    float islands=5.7*exp(-0.055*dot(a,a))+5.0*exp(-0.07*dot(b,b))+1.1*exp(-0.15*dot(c,c));
    return -2.4+islands*(1.0+0.18*gradientNoise(p*0.75))+0.12*sin(p.x*1.7)*sin(p.y*1.2);
}
vec3 coastBedNormal(vec2 p,float eps) {
    vec2 d=vec2(coastBed(p+vec2(eps,0.0))-coastBed(p-vec2(eps,0.0)),
                coastBed(p+vec2(0.0,eps))-coastBed(p-vec2(0.0,eps)))/(2.0*eps);
    return normalize(vec3(-d.x,1.0,-d.y));
}
vec4 coastWaves(vec2 p,float footprint) {
    vec4 sum=vec4(0.0);
    for(int i=0;i<WATER_WAVES;i++) {
        float fi=float(i);
        float angle=0.7+fi*2.39996;
        float wavelength=4.5*pow(0.69,fi);
        float amp=0.075*pow(0.58,fi);
        sum+=waterWaveD(p+vec2(fi*1.37,fi*0.79)-vec2(cos(angle),sin(angle))*wavelength*max(1.0,floor(waterDispersion(TAU/wavelength,3.0,9.81)*8.0/TAU+0.5))*fract(time),0.0,vec2(cos(angle),sin(angle)),wavelength,amp,3.0,footprint);
    }
    return sum;
}
vec2 traceCoast(vec3 ro,vec3 rd,bool includeWater,int maxSteps) {
    float t=0.01,previous=0.0;
    float closing=max(0.05,abs(rd.y)+4.0*length(rd.xz));
    for(int i=0;i<WATER_STEPS;i++) {
        if(i>=maxSteps)break;
        vec3 p=ro+rd*t;
        float h=coastBed(p.xz);
        if(includeWater) {
            float geometryFootprint=2.0*t/(resolution.y*1.75*max(abs(rd.y),0.1));
            h=max(h,coastWaves(p.xz,geometryFootprint).x);
        }
        float gap=p.y-h;
        if(gap<0.0) {
            float lo=previous,hi=t;
            for(int j=0;j<10;j++) {
                float mid=0.5*(lo+hi);
                vec3 q=ro+rd*mid;
                float surface=coastBed(q.xz);
                if(includeWater) {
                    float fp=2.0*mid/(resolution.y*1.75*max(abs(rd.y),0.1));
                    surface=max(surface,coastWaves(q.xz,fp).x);
                }
                if(q.y>surface)lo=mid;else hi=mid;
            }
            return vec2(0.5*(lo+hi),float(i));
        }
        previous=t;
        t+=max(gap/closing,0.012+0.008*t);
        if(t>WATER_FAR)break;
    }
    if(includeWater && rd.y < -0.0001) return vec2(max(0.01,-ro.y/rd.y),float(maxSteps));
    return vec2(-1.0,float(maxSteps));
}
vec3 coastSky(vec3 rd) {
    vec3 c=mix(vec3(0.22,0.40,0.60),vec3(0.025,0.13,0.36),sqrt(max(rd.y,0.0)));
    float clouds=smoothstep(0.1,0.55,fbm(rd.xz/max(rd.y+0.4,0.15)*1.3,4));
    c=mix(c,vec3(0.95,0.97,1.0),clouds*0.18*smoothstep(0.03,0.3,rd.y));
    return c+vec3(9.0,8.0,6.0)*sunDisk(rd,COAST_SUN,0.012,0.002);
}
vec3 shadeCoastBed(vec3 p,vec3 n,bool submerged,float footprint) {
    float grain=0.5+0.5*fbm(p.xz*2.5,4)*(1.0-smoothstep(0.03,0.25,footprint));
    float rock=smoothstep(0.45,1.0,p.y)*(1.0-smoothstep(0.65,0.9,n.y));
    vec3 sand=mix(vec3(0.38,0.29,0.15),vec3(0.7,0.59,0.37),grain);
    vec3 albedo=mix(sand,vec3(0.17,0.15,0.12),rock);
    float vegetation=smoothstep(1.2,2.0,p.y)*smoothstep(0.5,0.82,n.y);
    albedo=mix(albedo,vec3(0.07,0.12,0.025),vegetation);
    vec3 direct=vec3(2.5,2.3,1.9)*max(dot(n,COAST_SUN),0.0);
    if(submerged) {
        direct*=beerTransmittance(EXTINCTION,max(-p.y,0.0)/COAST_SUN.y);
        float caustic=pow(max(0.0,sin(p.x*7.0+sin(p.z*4.0+TAU*fract(time))*1.3)*sin(p.z*6.0+cos(p.x*4.0-TAU*fract(time))*1.2)),9.0);
        float keep=1.0-smoothstep(0.02,0.12,footprint);
        direct*=1.0+caustic*keep*1.2;
    }
    return albedo*(direct+hemisphereLight(n,vec3(0.35,0.43,0.5),vec3(0.12,0.10,0.07)));
}
vec3 renderCoast(vec2 coord) {
    vec2 uv=(2.0*coord-resolution)/resolution.y;
    vec3 ro=vec3(0.0,3.5,7.5);
    vec3 rd=cameraRay(cameraMatrix(ro,vec3(-0.8,-0.1,-6.0),0.0),uv,1.75);
    vec3 sky=coastSky(rd);
    vec2 hit=traceCoast(ro,rd,true,WATER_STEPS);
    if(hit.x<0.0)return sky;
    vec3 p=ro+rd*hit.x;
    float footprint=2.0*hit.x/(resolution.y*1.75);
    float bed=coastBed(p.xz);
    vec3 col;
    if(bed>p.y-0.015) {
        vec3 n=coastBedNormal(p.xz,max(footprint,0.003));
        col=shadeCoastBed(p,n,false,footprint);
    } else {
        vec4 waves=coastWaves(p.xz,footprint/max(abs(rd.y),0.1));
        vec3 n=normalize(vec3(-waves.y,1.0,-waves.z));
        vec3 v=-rd;
        float F=fresnelDielectric(max(dot(n,v),0.0),1.0,WATER_IOR);
        vec3 refracted=refract(rd,n,1.0/WATER_IOR);
        vec2 bottomHit=traceCoast(p-n*0.006,refracted,false,WATER_STEPS);
        float path=bottomHit.x>0.0?bottomHit.x:30.0;
        vec3 bottomPoint=p-n*0.006+refracted*path;
        vec3 bottomColor=shadeCoastBed(bottomPoint,coastBedNormal(bottomPoint.xz,0.01),true,footprint);
        vec3 T=beerTransmittance(EXTINCTION,path);
        vec3 body=bottomColor*T+vec3(0.012,0.19,0.24)*(1.0-T);
        vec3 reflected=reflect(rd,n);
        vec3 reflection=coastSky(normalize(vec3(reflected.x,max(reflected.y,0.01),reflected.z)));
        vec2 reflectedHit=traceCoast(p+n*0.015,reflected,false,WATER_STEPS);
        if(reflectedHit.x>0.0) {
            vec3 rp=p+n*0.015+reflected*reflectedHit.x;
            if(rp.y>0.02)reflection=shadeCoastBed(rp,coastBedNormal(rp.xz,0.015),false,footprint);
        }
        float unresolved=smoothstep(0.02,0.18,footprint);
        float rough=mix(0.075,0.20,unresolved);
        vec3 glint=specularGGX(n,v,COAST_SUN,rough,vec3(0.02037))*vec3(3.5,3.2,2.7);
        float shallow=1.0-smoothstep(0.08,0.5,max(p.y-bed,0.0));
        float shorePulse=0.5+0.5*sin((p.y-bed)*19.0-TAU*fract(time)*2.0+fbm(p.xz*2.0,3)*3.0);
        float foam=shallow*smoothstep(0.25,0.7,shorePulse)*0.8;
        foam+=0.12*smoothstep(0.18,0.6,-waves.w)*(1.0-unresolved);
        foam=clamp(foam,0.0,1.0);
        col=mix(body*(1.0-F)+reflection*F+glint,vec3(0.8,0.84,0.82),foam);
    }
    return mix(col,coastSky(normalize(vec3(rd.x,0.025,rd.z))),1.0-exp(-hit.x*0.003));
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 col=vec3(0.0);
    for(int i=0;i<WATER_AA;i++) {
        vec3 c=renderCoast(sampleCoord);
        c=tonemapAgX(c*1.05);
        col+=c/float(WATER_AA);
    }
    col=linearToSrgb(col)+ditherTPDF(sampleCoord,int(seed));
    fragColor=vec4(col,1.0);
}
`,
  wgsl: `const WATER_AA: i32 = 1;

const WATER_WAVES: i32 = 8;

const WATER_STEPS: i32 = 180;

const COAST_SUN: vec3f = vec3f((-0.3890330019), 0.6891441748, (-0.6113375744));

const EXTINCTION: vec3f = vec3f(0.42, 0.085, 0.045);

const WATER_IOR: f32 = 1.333;

const WATER_FAR: f32 = 95.0;

fn coastBed(p_arg: vec2f) -> f32 {
    var p = p_arg;
    var a: vec2f = (p - vec2f((-7.0), (-8.0)));
    var b: vec2f = (p - vec2f(7.0, (-19.0)));
    var c: vec2f = (p - vec2f((-5.0), (-1.0)));
    var islands: f32 = (((5.7 * exp(((-0.055) * dot(a, a)))) + (5.0 * exp(((-0.07) * dot(b, b))))) + (1.1 * exp(((-0.15) * dot(c, c)))));
    return (((-2.4) + (islands * ((1.0 + (0.18 * gradientNoise_f2((p * 0.75))))))) + ((0.12 * sin((p.x * 1.7))) * sin((p.y * 1.2))));
}

fn coastBedNormal(p_arg: vec2f, eps_arg: f32) -> vec3f {
    var p = p_arg;
    var eps = eps_arg;
    var d: vec2f = (vec2f((coastBed((p + vec2f(eps, 0.0))) - coastBed((p - vec2f(eps, 0.0)))), (coastBed((p + vec2f(0.0, eps))) - coastBed((p - vec2f(0.0, eps))))) / vec2f(((2.0 * eps))));
    return normalize(vec3f((-d.x), 1.0, (-d.y)));
}

fn coastWaves(p_arg: vec2f, footprint_arg: f32) -> vec4f {
    var p = p_arg;
    var footprint = footprint_arg;
    var sum: vec4f = vec4f(0.0);
    for (var i: i32 = 0; (i < WATER_WAVES); i++) {
        var fi: f32 = f32(i);
        var angle: f32 = (0.7 + (fi * 2.39996));
        var wavelength: f32 = (4.5 * pow(0.69, fi));
        var amp: f32 = (0.075 * pow(0.58, fi));
        sum += waterWaveD(((p + vec2f((fi * 1.37), (fi * 0.79))) - (((vec2f(cos(angle), sin(angle)) * wavelength) * max(1.0, floor(waterDispersion(TAU / wavelength, 3.0, 9.81) * 8.0 / TAU + 0.5))) * time)), 0.0, vec2f(cos(angle), sin(angle)), wavelength, amp, 3.0, footprint);
    }
    return sum;
}

fn traceCoast(ro_arg: vec3f, rd_arg: vec3f, includeWater_arg: bool, maxSteps_arg: i32) -> vec2f {
    var ro = ro_arg;
    var rd = rd_arg;
    var includeWater = includeWater_arg;
    var maxSteps = maxSteps_arg;
    var t: f32 = 0.01;
    var previous: f32 = 0.0;
    var closing: f32 = max(0.05, (abs(rd.y) + (4.0 * length(rd.xz))));
    for (var i: i32 = 0; (i < WATER_STEPS); i++) {
        if ((i >= maxSteps)) {
            break;
        }
        var p: vec3f = (ro + (rd * t));
        var h: f32 = coastBed(p.xz);
        if (includeWater) {
            var geometryFootprint: f32 = ((2.0 * t) / (((resolution.y * 1.75) * max(abs(rd.y), 0.1))));
            h = max(h, coastWaves(p.xz, geometryFootprint).x);
        }
        var gap: f32 = (p.y - h);
        if ((gap < 0.0)) {
            var lo: f32 = previous;
            var hi: f32 = t;
            for (var j: i32 = 0; (j < 10); j++) {
                var mid: f32 = (0.5 * ((lo + hi)));
                var q: vec3f = (ro + (rd * mid));
                var surface: f32 = coastBed(q.xz);
                if (includeWater) {
                    var fp: f32 = ((2.0 * mid) / (((resolution.y * 1.75) * max(abs(rd.y), 0.1))));
                    surface = max(surface, coastWaves(q.xz, fp).x);
                }
                if ((q.y > surface)) {
                    lo = mid;
                } else {
                    hi = mid;
                }
            }
            return vec2f((0.5 * ((lo + hi))), f32(i));
        }
        previous = t;
        t += max((gap / closing), (0.012 + (0.008 * t)));
        if ((t > WATER_FAR)) {
            break;
        }
    }
    if ((includeWater && (rd.y < (-0.0001)))) {
        return vec2f(max(0.01, ((-ro.y) / rd.y)), f32(maxSteps));
    }
    return vec2f((-1.0), f32(maxSteps));
}

fn coastSky(rd_arg: vec3f) -> vec3f {
    var rd = rd_arg;
    var c: vec3f = mix(vec3f(0.22, 0.40, 0.60), vec3f(0.025, 0.13, 0.36), sqrt(max(rd.y, 0.0)));
    var clouds: f32 = smoothstep(0.1, 0.55, fbm_f2i(((rd.xz / vec2f(max((rd.y + 0.4), 0.15))) * 1.3), 4));
    c = mix(c, vec3f(0.95, 0.97, 1.0), ((clouds * 0.18) * smoothstep(0.03, 0.3, rd.y)));
    return (c + (vec3f(9.0, 8.0, 6.0) * sunDisk(rd, COAST_SUN, 0.012, 0.002)));
}

fn shadeCoastBed(p_arg: vec3f, n_arg: vec3f, submerged_arg: bool, footprint_arg: f32) -> vec3f {
    var p = p_arg;
    var n = n_arg;
    var submerged = submerged_arg;
    var footprint = footprint_arg;
    var grain: f32 = (0.5 + ((0.5 * fbm_f2i((p.xz * 2.5), 4)) * ((1.0 - smoothstep(0.03, 0.25, footprint)))));
    var rock: f32 = (smoothstep(0.45, 1.0, p.y) * ((1.0 - smoothstep(0.65, 0.9, n.y))));
    var sand: vec3f = mix(vec3f(0.38, 0.29, 0.15), vec3f(0.7, 0.59, 0.37), grain);
    var albedo: vec3f = mix(sand, vec3f(0.17, 0.15, 0.12), rock);
    var vegetation: f32 = (smoothstep(1.2, 2.0, p.y) * smoothstep(0.5, 0.82, n.y));
    albedo = mix(albedo, vec3f(0.07, 0.12, 0.025), vegetation);
    var direct: vec3f = (vec3f(2.5, 2.3, 1.9) * max(dot(n, COAST_SUN), 0.0));
    if (submerged) {
        direct *= beerTransmittance(EXTINCTION, (max((-p.y), 0.0) / COAST_SUN.y));
        var caustic: f32 = pow(max(0.0, (sin(((p.x * 7.0) + (sin(((p.z * 4.0) + (TAU * time))) * 1.3))) * sin(((p.z * 6.0) + (cos(((p.x * 4.0) - (TAU * time))) * 1.2))))), 9.0);
        var keep: f32 = (1.0 - smoothstep(0.02, 0.12, footprint));
        direct *= (1.0 + ((caustic * keep) * 1.2));
    }
    return (albedo * ((direct + hemisphereLight(n, vec3f(0.35, 0.43, 0.5), vec3f(0.12, 0.10, 0.07)))));
}

fn renderCoast(coord_arg: vec2f) -> vec3f {
    var coord = coord_arg;
    var uv: vec2f = ((((2.0 * coord) - resolution)) / vec2f(resolution.y));
    var ro: vec3f = vec3f(0.0, 3.5, 7.5);
    var rd: vec3f = cameraRay(cameraMatrix(ro, vec3f((-0.8), (-0.1), (-6.0)), 0.0), uv, 1.75);
    var sky: vec3f = coastSky(rd);
    var hit: vec2f = traceCoast(ro, rd, true, WATER_STEPS);
    if ((hit.x < 0.0)) {
        return sky;
    }
    var p: vec3f = (ro + (rd * hit.x));
    var footprint: f32 = ((2.0 * hit.x) / ((resolution.y * 1.75)));
    var bed: f32 = coastBed(p.xz);
    var col: vec3f;
    if ((bed > (p.y - 0.015))) {
        var n: vec3f = coastBedNormal(p.xz, max(footprint, 0.003));
        col = shadeCoastBed(p, n, false, footprint);
    } else {
        var waves: vec4f = coastWaves(p.xz, (footprint / max(abs(rd.y), 0.1)));
        var n: vec3f = normalize(vec3f((-waves.y), 1.0, (-waves.z)));
        var v: vec3f = (-rd);
        var F: f32 = fresnelDielectric(max(dot(n, v), 0.0), 1.0, WATER_IOR);
        var refracted: vec3f = refract(rd, n, (1.0 / WATER_IOR));
        var bottomHit: vec2f = traceCoast((p - (n * 0.006)), refracted, false, WATER_STEPS);
        var path: f32 = select(30.0, bottomHit.x, (bottomHit.x > 0.0));
        var bottomPoint: vec3f = ((p - (n * 0.006)) + (refracted * path));
        var bottomColor: vec3f = shadeCoastBed(bottomPoint, coastBedNormal(bottomPoint.xz, 0.01), true, footprint);
        var T: vec3f = beerTransmittance(EXTINCTION, path);
        var body: vec3f = ((bottomColor * T) + (vec3f(0.012, 0.19, 0.24) * ((vec3f(1.0) - T))));
        var reflected: vec3f = reflect(rd, n);
        var reflection: vec3f = coastSky(normalize(vec3f(reflected.x, max(reflected.y, 0.01), reflected.z)));
        var reflectedHit: vec2f = traceCoast((p + (n * 0.015)), reflected, false, WATER_STEPS);
        if ((reflectedHit.x > 0.0)) {
            var rp: vec3f = ((p + (n * 0.015)) + (reflected * reflectedHit.x));
            if ((rp.y > 0.02)) {
                reflection = shadeCoastBed(rp, coastBedNormal(rp.xz, 0.015), false, footprint);
            }
        }
        var unresolved: f32 = smoothstep(0.02, 0.18, footprint);
        var rough: f32 = mix(0.075, 0.20, unresolved);
        var glint: vec3f = (specularGGX(n, v, COAST_SUN, rough, vec3f(0.02037)) * vec3f(3.5, 3.2, 2.7));
        var shallow: f32 = (1.0 - smoothstep(0.08, 0.5, max((p.y - bed), 0.0)));
        var shorePulse: f32 = (0.5 + (0.5 * sin((((((p.y - bed)) * 19.0) - ((TAU * time) * 2.0)) + (fbm_f2i((p.xz * 2.0), 3) * 3.0)))));
        var foam: f32 = ((shallow * smoothstep(0.25, 0.7, shorePulse)) * 0.8);
        foam += ((0.12 * smoothstep(0.18, 0.6, (-waves.w))) * ((1.0 - unresolved)));
        foam = clamp(foam, 0.0, 1.0);
        col = mix((((body * ((1.0 - F))) + (reflection * F)) + glint), vec3f(0.8, 0.84, 0.82), foam);
    }
    return mix(col, coastSky(normalize(vec3f(rd.x, 0.025, rd.z))), (1.0 - exp(((-hit.x) * 0.003))));
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var col: vec3f = vec3f(0.0);
    for (var i: i32 = 0; (i < WATER_AA); i++) {
        var c: vec3f = renderCoast(sampleCoord);
        c = tonemapAgX((c * 1.05));
        col += (c / vec3f(f32(WATER_AA)));
    }
    col = (linearToSrgb(col) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/noise-progression.ts
var noise_progression_default = {
  glsl: `const float SCALE = 5.0;
const int OCTAVES = 5;
float noiseStudy(int id, vec2 p, float px) {
    if (id == 0) return 0.5 + 0.7 * gradientNoise(p);
    if (id == 1) return 1.0 - smoothstep(0.0, 0.13 + px, voronoiBorder(p, 0.85).x);
    if (id == 2) return 0.5 + 0.5 * simplexNoise(p);
    if (id == 3) return 0.5 + 0.5 * fbm(p, OCTAVES);
    if (id == 4) {
        vec2 q, r;
        float f = warpedFbm(p * 0.6, 1.5, 3, q, r);
        return 0.5 + 0.5 * sin(p.x * 2.0 + 6.0 * f);
    }
    if (id == 5) return valueNoise(p);
    if (id == 6) {
        vec4 cell = voronoi(p, 0.85);
        return saturate(1.8 * (cell.y - cell.x));
    }
    if (id == 7) return ridgedFbm(p, OCTAVES);
    if (id == 8) return billowFbm(p, OCTAVES);
    return hybridTerrainHeight(p, OCTAVES);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec2 board = sampleCoord / resolution * vec2(5.0, 2.0);
    ivec2 tile = ivec2(floor(board));
    int id = tile.x + (1 - tile.y) * 5;
    vec2 local = fract(board);
    vec2 p = local * SCALE + vec2(1.23, 4.56);
    float px = SCALE * 5.0 / resolution.x;
    float f = noiseStudy(id, p, px);
    vec3 col = vec3(saturate(f));
    vec2 edge = min(local,1.0-local);
    float frame = smoothstep(0.01,0.025,min(edge.x,edge.y));
    col = mix(vec3(0.035), col, frame);
    float tick = step(0.965,local.y) * step(0.1,local.x) * step(local.x,0.1+0.03*float(tile.x+1));
    col = mix(col,vec3(0.9),tick);
    fragColor = vec4(col + ditherTPDF(sampleCoord,int(seed)),1.0);
}
`,
  wgsl: `const SCALE: f32 = 5.0;

const OCTAVES: i32 = 5;

fn noiseStudy(id_arg: i32, p_arg: vec2f, px_arg: f32) -> f32 {
    var id = id_arg;
    var p = p_arg;
    var px = px_arg;
    if ((id == 0)) {
        return (0.5 + (0.7 * gradientNoise_f2(p)));
    }
    if ((id == 1)) {
        return (1.0 - smoothstep(0.0, (0.13 + px), voronoiBorder(p, 0.85).x));
    }
    if ((id == 2)) {
        return (0.5 + (0.5 * simplexNoise(p)));
    }
    if ((id == 3)) {
        return (0.5 + (0.5 * fbm_f2i(p, OCTAVES)));
    }
    if ((id == 4)) {
        var q: vec2f;
        var r: vec2f;
        var f: f32 = warpedFbm((p * 0.6), 1.5, 3, &q, &r);
        return (0.5 + (0.5 * sin(((p.x * 2.0) + (6.0 * f)))));
    }
    if ((id == 5)) {
        return valueNoise_f2(p);
    }
    if ((id == 6)) {
        var cell: vec4f = voronoi(p, 0.85);
        return saturate_f((1.8 * ((cell.y - cell.x))));
    }
    if ((id == 7)) {
        return ridgedFbm(p, OCTAVES);
    }
    if ((id == 8)) {
        return billowFbm_f2i(p, OCTAVES);
    }
    return hybridTerrainHeight(p, OCTAVES);
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var board: vec2f = ((sampleCoord / resolution) * vec2f(5.0, 2.0));
    var tile: vec2i = vec2i(floor(board));
    var id: i32 = (tile.x + (((1 - tile.y)) * 5));
    var local: vec2f = fract(board);
    var p: vec2f = ((local * SCALE) + vec2f(1.23, 4.56));
    var px: f32 = ((SCALE * 5.0) / resolution.x);
    var f: f32 = noiseStudy(id, p, px);
    var col: vec3f = vec3f(saturate_f(f));
    var edge: vec2f = min(local, (vec2f(1.0) - local));
    var frame: f32 = smoothstep(0.01, 0.025, min(edge.x, edge.y));
    col = mix(vec3f(0.035), col, frame);
    var tick: f32 = ((step(0.965, local.y) * step(0.1, local.x)) * step(local.x, (0.1 + (0.03 * f32((tile.x + 1))))));
    col = mix(col, vec3f(0.9), tick);
    fragColor = vec4f((col + ditherTPDF(sampleCoord, i32(seed))), 1.0);
}
`
};

// src/knowledge/shader-craft/examples/noise-terrain-map.ts
var noise_terrain_map_default = {
  glsl: `const int OCTAVES = 5;
const float WORLD_SCALE = 5.0;
const float RIVER_WIDTH = 0.10;
vec2 terrainMapFields(vec2 p) {
    float h = hybridTerrainHeight(p, OCTAVES);
    float bend = 0.9 * fbm(vec2(p.y * 0.36, 2.7), 4);
    float riverDistance = abs(p.x - bend);
    float river = 1.0 - smoothstep(RIVER_WIDTH, RIVER_WIDTH + 0.075, riverDistance);
    h = mix(h, 0.19, river);
    return vec2(h, river);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec2 uv = (2.0 * sampleCoord - resolution) / resolution.y;
    vec2 p = uv * WORLD_SCALE;
    vec2 field = terrainMapFields(p);
    float e = 2.0 * WORLD_SCALE / resolution.y;
    vec2 slope = vec2(terrainMapFields(p+vec2(e,0.0)).x-terrainMapFields(p-vec2(e,0.0)).x,
                      terrainMapFields(p+vec2(0.0,e)).x-terrainMapFields(p-vec2(0.0,e)).x) / (2.0*e);
    vec3 n = normalize(vec3(-slope.x,0.7,-slope.y));
    float hills = smoothstep(0.38,0.63,field.x);
    float rock = smoothstep(0.58,0.78,field.x) * smoothstep(0.2,0.75,length(slope));
    vec3 land = mix(srgbToLinear(vec3(0.32,0.42,0.20)),srgbToLinear(vec3(0.61,0.57,0.35)),hills);
    land = mix(land,srgbToLinear(vec3(0.57,0.56,0.50)),rock);
    float diffuse = max(dot(n,vec3(-0.4662524041, 0.8392543274, 0.2797514425)),0.0);
    vec3 col = land * (0.3 + 1.2 * diffuse);
    float bank = 1.0 - smoothstep(0.02,0.11,abs(field.y-0.4));
    col = mix(col,srgbToLinear(vec3(0.64,0.58,0.37)),bank*0.65);
    vec3 water = mix(vec3(0.01,0.12,0.15),vec3(0.05,0.31,0.36),0.5+0.5*sin(p.y*7.0+p.x*3.0));
    col = mix(col,water,field.y);
    col = linearToSrgb(tonemapAgX(col*1.2));
    fragColor = vec4(col+ditherTPDF(sampleCoord,int(seed)),1.0);
}
`,
  wgsl: `const OCTAVES: i32 = 5;

const WORLD_SCALE: f32 = 5.0;

const RIVER_WIDTH: f32 = 0.10;

fn terrainMapFields(p_arg: vec2f) -> vec2f {
    var p = p_arg;
    var h: f32 = hybridTerrainHeight(p, OCTAVES);
    var bend: f32 = (0.9 * fbm_f2i(vec2f((p.y * 0.36), 2.7), 4));
    var riverDistance: f32 = abs((p.x - bend));
    var river: f32 = (1.0 - smoothstep(RIVER_WIDTH, (RIVER_WIDTH + 0.075), riverDistance));
    h = mix(h, 0.19, river);
    return vec2f(h, river);
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var uv: vec2f = ((((2.0 * sampleCoord) - resolution)) / vec2f(resolution.y));
    var p: vec2f = (uv * WORLD_SCALE);
    var field: vec2f = terrainMapFields(p);
    var e: f32 = ((2.0 * WORLD_SCALE) / resolution.y);
    var slope: vec2f = (vec2f((terrainMapFields((p + vec2f(e, 0.0))).x - terrainMapFields((p - vec2f(e, 0.0))).x), (terrainMapFields((p + vec2f(0.0, e))).x - terrainMapFields((p - vec2f(0.0, e))).x)) / vec2f(((2.0 * e))));
    var n: vec3f = normalize(vec3f((-slope.x), 0.7, (-slope.y)));
    var hills: f32 = smoothstep(0.38, 0.63, field.x);
    var rock: f32 = (smoothstep(0.58, 0.78, field.x) * smoothstep(0.2, 0.75, length(slope)));
    var land: vec3f = mix(srgbToLinear(vec3f(0.32, 0.42, 0.20)), srgbToLinear(vec3f(0.61, 0.57, 0.35)), hills);
    land = mix(land, srgbToLinear(vec3f(0.57, 0.56, 0.50)), rock);
    var diffuse: f32 = max(dot(n, vec3f((-0.4662524041), 0.8392543274, 0.2797514425)), 0.0);
    var col: vec3f = (land * ((0.3 + (1.2 * diffuse))));
    var bank: f32 = (1.0 - smoothstep(0.02, 0.11, abs((field.y - 0.4))));
    col = mix(col, srgbToLinear(vec3f(0.64, 0.58, 0.37)), (bank * 0.65));
    var water: vec3f = mix(vec3f(0.01, 0.12, 0.15), vec3f(0.05, 0.31, 0.36), (0.5 + (0.5 * sin(((p.y * 7.0) + (p.x * 3.0))))));
    col = mix(col, water, field.y);
    col = linearToSrgb(tonemapAgX((col * 1.2)));
    fragColor = vec4f((col + ditherTPDF(sampleCoord, i32(seed))), 1.0);
}
`
};

// src/knowledge/shader-craft/examples/ocean.ts
var ocean_default = {
  glsl: `const vec3 SUN_DIR = vec3(0.1942938351, 0.1360056846, -0.9714691757);
const float SUN_INTENSITY = 20.0;
const float WIND_ANGLE = 1.9;
const float SWELL_LENGTH = 34.0;
const float SWELL_HEIGHT = 0.8;
const float CHOP = 0.7;
const float CREST_SHARPNESS = 2.4;
const float RIPPLE = 0.008;
const float FOAM_AMOUNT = 1.0;
const vec3 WATER_DEEP = vec3(0.004, 0.02, 0.04);
const vec3 WATER_GLOW = vec3(0.05, 0.26, 0.25);
const float HAZE = 6.0;
const float CAMERA_HEIGHT = 3.0;
const float EXPOSURE = 0.9;
const float FOCAL = 2.0;
const float GRAVITY = 9.81;
const float WAVELENGTH_RATIO = 0.8;
const int TRACE_WAVES = 12;
const int SHADE_WAVES = 28;
const int FOAM_WAVES = 6;
const float TRACE_FAR = 400.0;
void wave(int i, out vec2 dir, out float k, out float amp, out float phase) {
    float fi = float(i);
    vec3 h = hash32(vec2(fi, 17.0));
    float a = WIND_ANGLE + mix(0.35, 1.3, min(fi / 12.0, 1.0)) * (2.0 * h.x - 1.0);
    dir = vec2(cos(a), sin(a));
    k = TAU / (SWELL_LENGTH * pow(WAVELENGTH_RATIO, fi) * mix(0.85, 1.15, h.y));
    amp = SWELL_HEIGHT * pow(CHOP, fi);
    phase = TAU * h.z;
}
float wavePhase(vec2 dir, float k, float phase, vec2 xz) {
    return k * dot(dir, xz) - TAU * max(1.0, floor(sqrt(GRAVITY * k) * 8.0 / TAU + 0.5)) * fract(time) + phase;
}
float waveKeep(vec2 dir, float k, vec4 fp) {
    float footprint = length(vec2(dot(dir, vec2(-fp.y, fp.x)) * fp.z, dot(dir, fp.xy) * fp.w));
    return smoothstep(2.0, 6.0, TAU / (k * footprint));
}
float oceanHeight(vec2 xz, int count, vec4 fp) {
    float h = 0.0;
    for (int i = ZERO; i < SHADE_WAVES; i++) {
        if (i >= count) break;
        vec2 dir; float k, amp, phase;
        wave(i, dir, k, amp, phase);
        h += waveKeep(dir, k, fp) * amp * (exp(CREST_SHARPNESS * (sin(wavePhase(dir, k, phase, xz)) - 1.0)) - 0.3);
    }
    return h;
}
float profileMaxSlope() {
    float s = CREST_SHARPNESS;
    float sn = (sqrt(1.0 + 4.0 * s * s) - 1.0) / (2.0 * s);
    return s * sqrt(1.0 - sn * sn) * exp(s * (sn - 1.0));
}
vec3 oceanBounds() {
    float ampSum = 0.0, slopeSum = 0.0;
    for (int i = ZERO; i < TRACE_WAVES; i++) {
        vec2 dir; float k, amp, phase;
        wave(i, dir, k, amp, phase);
        ampSum += amp;
        slopeSum += amp * k;
    }
    return vec3(-0.3 * ampSum, 0.7 * ampSum, slopeSum * profileMaxSlope());
}
vec2 traceOcean(vec3 ro, vec3 rd, vec3 bounds, vec4 pixelSpread) {
    if (rd.y >= 0.0) return vec2(-1.0, 0.0);
    float t = max((ro.y - bounds.y) / -rd.y, 0.0);
    float tEnd = min((ro.y - bounds.x) / -rd.y, TRACE_FAR);
    float closing = -rd.y + 0.6 * bounds.z * length(rd.xz);
    float tPrev = t, gapPrev = 1e10;
    for (int i = ZERO; i < 200; i++) {
        vec3 p = ro + rd * t;
        float gap = p.y - oceanHeight(p.xz, TRACE_WAVES, pixelSpread * vec4(1.0, 1.0, t, t));
        if (gap < 0.0) return vec2(mix(tPrev, t, gapPrev / (gapPrev - gap)), float(i));
        if (t >= tEnd) break;
        tPrev = t;
        gapPrev = gap;
        t = min(t + max(gap / closing, 0.004 * t), tEnd);
    }
    return vec2(-1.0, 200.0);
}
vec4 oceanDetail(vec2 xz, vec4 fp, out float lostSlope2, out float crest) {
    const float slopeRms = 0.3 + 0.06 * CREST_SHARPNESS;
    vec4 s = vec4(0.0);
    lostSlope2 = 0.0;
    crest = 0.0;
    float crestMax = 0.0;
    for (int i = ZERO; i < SHADE_WAVES; i++) {
        vec2 dir; float k, amp, phase;
        wave(i, dir, k, amp, phase);
        float keep = waveKeep(dir, k, fp);
        float theta = wavePhase(dir, k, phase, xz);
        float sn = sin(theta), cs = cos(theta);
        float e = exp(CREST_SHARPNESS * (sn - 1.0));
        float d1 = CREST_SHARPNESS * cs * e;
        float d2 = CREST_SHARPNESS * (CREST_SHARPNESS * cs * cs - sn) * e;
        s += keep * amp * vec4(e - 0.3, k * d1 * dir, k * k * d2);
        lostSlope2 += (1.0 - keep) * (amp * k * slopeRms) * (amp * k * slopeRms);
        if (i < FOAM_WAVES) {
            crest -= keep * amp * k * k * d2;
            crestMax += amp * k * k * CREST_SHARPNESS;
        }
    }
    crest /= crestMax;
    return s;
}
vec3 sunTransmittance(float heightKm, vec3 dir) {
    vec3 ro = vec3(0.0, ATMOSPHERE_GROUND_KM + heightKm, 0.0);
    if (iSphere(ro, dir, vec3(0.0), ATMOSPHERE_GROUND_KM).x > 0.0) return vec3(0.0);
    float tl = iSphere(ro, dir, vec3(0.0), ATMOSPHERE_TOP_KM).y;
    vec3 depth = vec3(0.0);
    for (int i = 0; i < 12; i++) {
        vec3 q = ro + dir * ((float(i) + 0.5) * tl / 12.0);
        depth += atmosphereExtinction(atmosphereDensity(length(q) - ATMOSPHERE_GROUND_KM)) * tl / 12.0;
    }
    return exp(-depth);
}
vec3 render(vec2 sampleCoord) {
    vec2 uv = (2.0 * sampleCoord - resolution) / resolution.y;
    float pixelAngle = 2.0 / (resolution.y * FOCAL);
    float viewKm = CAMERA_HEIGHT * 0.001;
    vec3 ro = vec3(0.0, CAMERA_HEIGHT, 0.0);
    mat3 cam = cameraMatrix(ro, ro + vec3(0.0, -0.06, -1.0), 0.0);
    vec3 rd = cameraRay(cam, uv, FOCAL);
    vec3 sunColor = SUN_INTENSITY * 0.12 * sunTransmittance(viewKm, SUN_DIR);
    if (rd.y >= 0.0) {
        vec3 sky = atmosphereSky(rd, SUN_DIR, viewKm, SUN_INTENSITY);
        return sky + sunColor * 40.0 * sunDisk(rd, SUN_DIR, 0.012, pixelAngle);
    }
    vec4 pixelSpread = vec4(normalize(rd.xz), pixelAngle, pixelAngle / max(-rd.y, 0.01));
    vec3 bounds = oceanBounds();
    vec2 hit = traceOcean(ro, rd, bounds, pixelSpread);
    float t = (hit.x > 0.0) ? hit.x : ro.y / -rd.y;
    vec3 p = ro + rd * t;
    vec4 fp = pixelSpread * vec4(1.0, 1.0, t, t);
    float lostSlope2, crest;
    vec4 wv = oceanDetail(p.xz, fp, lostSlope2, crest);
    vec2 slope = wv.yz;
    float footprint = sqrt(fp.z * fp.w);
    float keepRipple = smoothstep(2.0, 6.0, 0.8 / footprint);
    vec3 r1 = simplexNoiseD(p.xz * 1.3 + vec2(cos(TAU*fract(time)),sin(TAU*fract(time)))*0.9, TAU * fract(time));
    vec3 r2 = simplexNoiseD(p.xz * 3.7 - vec2(cos(TAU*fract(time)),sin(TAU*fract(time)))*0.6, -2.0 * TAU * fract(time));
    slope += RIPPLE * keepRipple * (1.3 * r1.yz + 0.5 * 3.7 * r2.yz * smoothstep(2.0, 6.0, 0.3 / footprint));
    lostSlope2 += RIPPLE * RIPPLE * 4.0 * (1.0 - keepRipple);
    vec3 n = normalize(vec3(-slope.x, 1.0, -slope.y));
    float lace = billowFbm(p.xz * vec2(1.2, 2.4) + 0.5 * vec2(cos(TAU*fract(time)),sin(TAU*fract(time))), 6);
    float coverage = 0.7 * smoothstep(0.08, 0.3, crest);
    float foam = FOAM_AMOUNT * coverage * smoothstep(1.0 - coverage, 1.15 - coverage, lace);
    float bubbles = (1.0 - smoothstep(0.0, 0.22, voronoiBorder(p.xz * vec2(2.5, 4.0), 1.0).x));
    foam *= mix(0.75, mix(0.4, 1.0, bubbles), smoothstep(2.0, 6.0, 0.3 / footprint));
    vec3 v = -rd;
    float NoV = max(dot(n, v), 1e-3);
    vec3 F = fresnelSchlick(NoV, vec3(0.02));
    vec3 refl = reflect(rd, n);
    refl.y = abs(refl.y);
    vec3 skyRefl = atmosphereSky(refl, SUN_DIR, viewKm, SUN_INTENSITY);
    vec3 skyAmbient = atmosphereSky(vec3(0.0, 1.0, 0.0), SUN_DIR, viewKm, SUN_INTENSITY);
    float alpha = sqrt(0.02 * 0.02 + 2.0 * lostSlope2);
    vec3 glint = specularGGX(n, v, SUN_DIR, sqrt(alpha), vec3(0.02)) * sunColor;
    vec3 reflection = F * skyRefl;
    float backlit = pow(clamp(dot(rd, SUN_DIR), 0.0, 1.0), 4.0);
    float thin = smoothstep(0.45, 0.9, (wv.x - bounds.x) / (bounds.y - bounds.x));
    vec3 body = (1.0 - F) * (WATER_DEEP * (skyAmbient + sunColor * max(dot(n, SUN_DIR), 0.0))
                             + WATER_GLOW * sunColor * backlit * thin);
    vec3 foamColor = vec3(0.9) * (sunColor * (max(dot(n, SUN_DIR), 0.0) + 0.5 * backlit) + 3.0 * skyAmbient);
    vec3 col = mix(reflection + glint + body, foamColor, foam);
    vec3 fogColor = atmosphereSky(normalize(vec3(rd.x, 0.0, rd.z)), SUN_DIR, viewKm, SUN_INTENSITY);
    vec3 airT = exp(-t * 0.001 * HAZE * atmosphereExtinction(atmosphereDensity(0.0)));
    return col * airT + fogColor * (1.0 - airT);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 col = render(sampleCoord);
    col = linearToSrgb(tonemapAgXPunchy(col * EXPOSURE)) + ditherTPDF(sampleCoord, int(seed));
    fragColor = vec4(col, 1.0);
}
`,
  wgsl: `const SUN_DIR: vec3f = vec3f(0.1942938351, 0.1360056846, (-0.9714691757));

const SUN_INTENSITY: f32 = 20.0;

const WIND_ANGLE: f32 = 1.9;

const SWELL_LENGTH: f32 = 34.0;

const SWELL_HEIGHT: f32 = 0.8;

const CHOP: f32 = 0.7;

const CREST_SHARPNESS: f32 = 2.4;

const RIPPLE: f32 = 0.008;

const FOAM_AMOUNT: f32 = 1.0;

const WATER_DEEP: vec3f = vec3f(0.004, 0.02, 0.04);

const WATER_GLOW: vec3f = vec3f(0.05, 0.26, 0.25);

const HAZE: f32 = 6.0;

const CAMERA_HEIGHT: f32 = 3.0;

const EXPOSURE: f32 = 0.9;

const FOCAL: f32 = 2.0;

const GRAVITY: f32 = 9.81;

const WAVELENGTH_RATIO: f32 = 0.8;

const TRACE_WAVES: i32 = 12;

const SHADE_WAVES: i32 = 28;

const FOAM_WAVES: i32 = 6;

const TRACE_FAR: f32 = 400.0;

fn wave(i_arg: i32, dir: ptr<function, vec2f>, k: ptr<function, f32>, amp: ptr<function, f32>, phase: ptr<function, f32>) {
    var i = i_arg;
    var fi: f32 = f32(i);
    var h: vec3f = hash32(vec2f(fi, 17.0));
    var a: f32 = (WIND_ANGLE + (mix(0.35, 1.3, min((fi / 12.0), 1.0)) * (((2.0 * h.x) - 1.0))));
    (*dir) = vec2f(cos(a), sin(a));
    (*k) = (TAU / (((SWELL_LENGTH * pow(WAVELENGTH_RATIO, fi)) * mix(0.85, 1.15, h.y))));
    (*amp) = (SWELL_HEIGHT * pow(CHOP, fi));
    (*phase) = (TAU * h.z);
}

fn wavePhase(dir_arg: vec2f, k_arg: f32, phase_arg: f32, xz_arg: vec2f) -> f32 {
    var dir = dir_arg;
    var k = k_arg;
    var phase = phase_arg;
    var xz = xz_arg;
    return (((k * dot(dir, xz)) - ((TAU * max(1.0, floor(sqrt(GRAVITY * k) * 8.0 / TAU + 0.5))) * time)) + phase);
}

fn waveKeep(dir_arg: vec2f, k_arg: f32, fp_arg: vec4f) -> f32 {
    var dir = dir_arg;
    var k = k_arg;
    var fp = fp_arg;
    var footprint: f32 = length(vec2f((dot(dir, vec2f((-fp.y), fp.x)) * fp.z), (dot(dir, fp.xy) * fp.w)));
    return smoothstep(2.0, 6.0, (TAU / ((k * footprint))));
}

fn oceanHeight(xz_arg: vec2f, count_arg: i32, fp_arg: vec4f) -> f32 {
    var xz = xz_arg;
    var count = count_arg;
    var fp = fp_arg;
    var h: f32 = 0.0;
    for (var i: i32 = ZERO; (i < SHADE_WAVES); i++) {
        if ((i >= count)) {
            break;
        }
        var dir: vec2f;
        var k: f32;
        var amp: f32;
        var phase: f32;
        wave(i, &dir, &k, &amp, &phase);
        h += ((waveKeep(dir, k, fp) * amp) * ((exp((CREST_SHARPNESS * ((sin(wavePhase(dir, k, phase, xz)) - 1.0)))) - 0.3)));
    }
    return h;
}

fn profileMaxSlope() -> f32 {

    var s: f32 = CREST_SHARPNESS;
    var sn: f32 = (((sqrt((1.0 + ((4.0 * s) * s))) - 1.0)) / ((2.0 * s)));
    return ((s * sqrt((1.0 - (sn * sn)))) * exp((s * ((sn - 1.0)))));
}

fn oceanBounds() -> vec3f {

    var ampSum: f32 = 0.0;
    var slopeSum: f32 = 0.0;
    for (var i: i32 = ZERO; (i < TRACE_WAVES); i++) {
        var dir: vec2f;
        var k: f32;
        var amp: f32;
        var phase: f32;
        wave(i, &dir, &k, &amp, &phase);
        ampSum += amp;
        slopeSum += (amp * k);
    }
    return vec3f(((-0.3) * ampSum), (0.7 * ampSum), (slopeSum * profileMaxSlope()));
}

fn traceOcean(ro_arg: vec3f, rd_arg: vec3f, bounds_arg: vec3f, pixelSpread_arg: vec4f) -> vec2f {
    var ro = ro_arg;
    var rd = rd_arg;
    var bounds = bounds_arg;
    var pixelSpread = pixelSpread_arg;
    if ((rd.y >= 0.0)) {
        return vec2f((-1.0), 0.0);
    }
    var t: f32 = max((((ro.y - bounds.y)) / (-rd.y)), 0.0);
    var tEnd: f32 = min((((ro.y - bounds.x)) / (-rd.y)), TRACE_FAR);
    var closing: f32 = ((-rd.y) + ((0.6 * bounds.z) * length(rd.xz)));
    var tPrev: f32 = t;
    var gapPrev: f32 = 1e10;
    for (var i: i32 = ZERO; (i < 200); i++) {
        var p: vec3f = (ro + (rd * t));
        var gap: f32 = (p.y - oceanHeight(p.xz, TRACE_WAVES, (pixelSpread * vec4f(1.0, 1.0, t, t))));
        if ((gap < 0.0)) {
            return vec2f(mix(tPrev, t, (gapPrev / ((gapPrev - gap)))), f32(i));
        }
        if ((t >= tEnd)) {
            break;
        }
        tPrev = t;
        gapPrev = gap;
        t = min((t + max((gap / closing), (0.004 * t))), tEnd);
    }
    return vec2f((-1.0), 200.0);
}

fn oceanDetail(xz_arg: vec2f, fp_arg: vec4f, lostSlope2: ptr<function, f32>, crest: ptr<function, f32>) -> vec4f {
    var xz = xz_arg;
    var fp = fp_arg;
    let slopeRms: f32 = (0.3 + (0.06 * CREST_SHARPNESS));
    var s: vec4f = vec4f(0.0);
    (*lostSlope2) = 0.0;
    (*crest) = 0.0;
    var crestMax: f32 = 0.0;
    for (var i: i32 = ZERO; (i < SHADE_WAVES); i++) {
        var dir: vec2f;
        var k: f32;
        var amp: f32;
        var phase: f32;
        wave(i, &dir, &k, &amp, &phase);
        var keep: f32 = waveKeep(dir, k, fp);
        var theta: f32 = wavePhase(dir, k, phase, xz);
        var sn: f32 = sin(theta);
        var cs: f32 = cos(theta);
        var e: f32 = exp((CREST_SHARPNESS * ((sn - 1.0))));
        var d1: f32 = ((CREST_SHARPNESS * cs) * e);
        var d2: f32 = ((CREST_SHARPNESS * ((((CREST_SHARPNESS * cs) * cs) - sn))) * e);
        s += ((keep * amp) * vec4f((e - 0.3), ((k * d1) * dir), ((k * k) * d2)));
        (*lostSlope2) += ((((1.0 - keep)) * (((amp * k) * slopeRms))) * (((amp * k) * slopeRms)));
        if ((i < FOAM_WAVES)) {
            (*crest) -= ((((keep * amp) * k) * k) * d2);
            crestMax += (((amp * k) * k) * CREST_SHARPNESS);
        }
    }
    (*crest) /= crestMax;
    return s;
}

fn sunTransmittance(heightKm_arg: f32, dir_arg: vec3f) -> vec3f {
    var heightKm = heightKm_arg;
    var dir = dir_arg;
    var ro: vec3f = vec3f(0.0, (ATMOSPHERE_GROUND_KM + heightKm), 0.0);
    if ((iSphere(ro, dir, vec3f(0.0), ATMOSPHERE_GROUND_KM).x > 0.0)) {
        return vec3f(0.0);
    }
    var tl: f32 = iSphere(ro, dir, vec3f(0.0), ATMOSPHERE_TOP_KM).y;
    var depth: vec3f = vec3f(0.0);
    for (var i: i32 = 0; (i < 12); i++) {
        var q: vec3f = (ro + (dir * (((((f32(i) + 0.5)) * tl) / 12.0))));
        depth += ((atmosphereExtinction(atmosphereDensity((length(q) - ATMOSPHERE_GROUND_KM))) * tl) / vec3f(12.0));
    }
    return exp((-depth));
}

fn render(fragCoord_arg: vec2f) -> vec3f {
    var sampleCoord = fragCoord_arg;
    var uv: vec2f = ((((2.0 * sampleCoord) - resolution)) / vec2f(resolution.y));
    var pixelAngle: f32 = (2.0 / ((resolution.y * FOCAL)));
    var viewKm: f32 = (CAMERA_HEIGHT * 0.001);
    var ro: vec3f = vec3f(0.0, CAMERA_HEIGHT, 0.0);
    var cam: mat3x3f = cameraMatrix(ro, (ro + vec3f(0.0, (-0.06), (-1.0))), 0.0);
    var rd: vec3f = cameraRay(cam, uv, FOCAL);
    var sunColor: vec3f = ((SUN_INTENSITY * 0.12) * sunTransmittance(viewKm, SUN_DIR));
    if ((rd.y >= 0.0)) {
        var sky: vec3f = atmosphereSky(rd, SUN_DIR, viewKm, SUN_INTENSITY);
        return (sky + ((sunColor * 40.0) * sunDisk(rd, SUN_DIR, 0.012, pixelAngle)));
    }
    var pixelSpread: vec4f = vec4f(normalize(rd.xz), pixelAngle, (pixelAngle / max((-rd.y), 0.01)));
    var bounds: vec3f = oceanBounds();
    var hit: vec2f = traceOcean(ro, rd, bounds, pixelSpread);
    var t: f32 = select((ro.y / (-rd.y)), hit.x, ((hit.x > 0.0)));
    var p: vec3f = (ro + (rd * t));
    var fp: vec4f = (pixelSpread * vec4f(1.0, 1.0, t, t));
    var lostSlope2: f32;
    var crest: f32;
    var wv: vec4f = oceanDetail(p.xz, fp, &lostSlope2, &crest);
    var slope: vec2f = wv.yz;
    var footprint: f32 = sqrt((fp.z * fp.w));
    var keepRipple: f32 = smoothstep(2.0, 6.0, (0.8 / footprint));
    var r1: vec3f = simplexNoiseD_f2f(((p.xz * 1.3) + (vec2f(cos((TAU * time)), sin((TAU * time))) * 0.9)), (TAU * time));
    var r2: vec3f = simplexNoiseD_f2f(((p.xz * 3.7) - (vec2f(cos((TAU * time)), sin((TAU * time))) * 0.6)), (((-2.0) * TAU) * time));
    slope += ((RIPPLE * keepRipple) * (((1.3 * r1.yz) + (((0.5 * 3.7) * r2.yz) * smoothstep(2.0, 6.0, (0.3 / footprint))))));
    lostSlope2 += (((RIPPLE * RIPPLE) * 4.0) * ((1.0 - keepRipple)));
    var n: vec3f = normalize(vec3f((-slope.x), 1.0, (-slope.y)));
    var lace: f32 = billowFbm_f2i(((p.xz * vec2f(1.2, 2.4)) + (0.5 * vec2f(cos((TAU * time)), sin((TAU * time))))), 6);
    var coverage: f32 = (0.7 * smoothstep(0.08, 0.3, crest));
    var foam: f32 = ((FOAM_AMOUNT * coverage) * smoothstep((1.0 - coverage), (1.15 - coverage), lace));
    var bubbles: f32 = (1.0 - smoothstep(0.0, 0.22, voronoiBorder((p.xz * vec2f(2.5, 4.0)), 1.0).x));
    foam *= mix(0.75, mix(0.4, 1.0, bubbles), smoothstep(2.0, 6.0, (0.3 / footprint)));
    var v: vec3f = (-rd);
    var NoV: f32 = max(dot(n, v), 1e-3);
    var F: vec3f = fresnelSchlick(NoV, vec3f(0.02));
    var refl: vec3f = reflect(rd, n);
    refl.y = abs(refl.y);
    var skyRefl: vec3f = atmosphereSky(refl, SUN_DIR, viewKm, SUN_INTENSITY);
    var skyAmbient: vec3f = atmosphereSky(vec3f(0.0, 1.0, 0.0), SUN_DIR, viewKm, SUN_INTENSITY);
    var alpha: f32 = sqrt(((0.02 * 0.02) + (2.0 * lostSlope2)));
    var glint: vec3f = (specularGGX(n, v, SUN_DIR, sqrt(alpha), vec3f(0.02)) * sunColor);
    var reflection: vec3f = (F * skyRefl);
    var backlit: f32 = pow(clamp(dot(rd, SUN_DIR), 0.0, 1.0), 4.0);
    var thin: f32 = smoothstep(0.45, 0.9, (((wv.x - bounds.x)) / ((bounds.y - bounds.x))));
    var body: vec3f = (((vec3f(1.0) - F)) * (((WATER_DEEP * ((skyAmbient + (sunColor * max(dot(n, SUN_DIR), 0.0))))) + (((WATER_GLOW * sunColor) * backlit) * thin))));
    var foamColor: vec3f = (vec3f(0.9) * (((sunColor * ((max(dot(n, SUN_DIR), 0.0) + (0.5 * backlit)))) + (3.0 * skyAmbient))));
    var col: vec3f = mix(((reflection + glint) + body), foamColor, foam);
    var fogColor: vec3f = atmosphereSky(normalize(vec3f(rd.x, 0.0, rd.z)), SUN_DIR, viewKm, SUN_INTENSITY);
    var airT: vec3f = exp(((((-t) * 0.001) * HAZE) * atmosphereExtinction(atmosphereDensity(0.0))));
    return ((col * airT) + (fogColor * ((vec3f(1.0) - airT))));
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var col: vec3f = render(sampleCoord);
    col = (linearToSrgb(tonemapAgXPunchy((col * EXPOSURE))) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/pattern-swatches.ts
var pattern_swatches_default = {
  glsl: `vec3 marble(vec2 p) {
    vec2 q, r;
    float f = warpedFbm(p * 1.5, 3.0, 5, q, r);
    vec3 col = mixOklab(srgbToLinear(vec3(0.92, 0.90, 0.86)), srgbToLinear(vec3(0.35, 0.38, 0.45)), saturate(length(q) * 0.9));
    col = mix(col, srgbToLinear(vec3(0.62, 0.42, 0.30)), saturate(r.y * r.y * 2.0));
    return col * (0.85 + 0.25 * f);
}
vec3 crackedEarth(vec2 p, float px) {
    vec3 v = voronoiBorder(p * 4.0, 0.9);
    vec2 cell = floor(p * 4.0 + v.yz);
    float tint = hash12(cell);
    vec3 col = mix(srgbToLinear(vec3(0.62, 0.44, 0.30)), srgbToLinear(vec3(0.75, 0.58, 0.40)), tint);
    col *= 0.75 + 0.25 * smoothstep(0.0, 0.25, v.x);
    float plate = fillAA(0.03 - v.x, px * 4.0);
    return mix(srgbToLinear(vec3(0.12, 0.08, 0.06)), col, plate);
}
vec3 hexTiles(vec2 p, float px) {
    vec4 h = hexGrid(p * 5.0);
    float edge = hexEdgeDistance(h.xy);
    vec3 base = oklchToLinearSrgb(vec3(0.7, 0.09, 3.6 + 0.8 * hash12(h.zw)));
    float bevel = smoothstep(0.0, 0.12, edge);
    return mix(vec3(0.02), base * (0.7 + 0.3 * bevel), smoothstep(0.03 - px * 5.0, 0.03 + px * 5.0, edge));
}
vec3 truchet(vec2 p, float px) {
    float d = truchetArcs(p * 5.0, 0.12) / 5.0;
    float stripe = truchetArcs(p * 5.0, 0.03) / 5.0;
    vec3 col = srgbToLinear(vec3(0.08, 0.10, 0.16));
    col = mix(col, srgbToLinear(vec3(0.95, 0.75, 0.30)), fillAA(d, px));
    return mix(col, srgbToLinear(vec3(0.55, 0.20, 0.10)), fillAA(stripe, px));
}
vec3 organicCells(vec2 p) {
    float s = smoothVoronoi(p * 5.0, 12.0);
    vec3 col = mixOklab(srgbToLinear(vec3(0.95, 0.55, 0.55)), srgbToLinear(vec3(0.35, 0.05, 0.15)), saturate(s * 1.6));
    return col * (0.6 + 0.4 * smoothstep(0.1, 0.5, s));
}
vec3 checker(vec2 p, float px) {
    float z = 1.0 / max(0.55 - p.y, 0.02);
    vec2 floorUV = vec2(p.x * z, z) * 1.5;
    float c = filteredChecker(floorUV, vec2(px * z * z * 1.5 + px * z * 1.5));
    return mix(vec3(0.05), vec3(0.8), c) * (1.0 - smoothstep(0.3, 0.55, p.y));
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec2 uv = sampleCoord / resolution.y;
    float px = 1.0 / resolution.y;
    float aspect = resolution.x / resolution.y;
    vec2 grid = vec2(3.0, 2.0);
    vec2 tileSize = vec2(aspect, 1.0) / grid;
    vec2 id = floor(uv / tileSize);
    vec2 local = (uv - id * tileSize) / tileSize.y;
    vec2 p = local - 0.5 * vec2(tileSize.x / tileSize.y, 1.0);
    float k = id.x + 3.0 * (1.0 - id.y);
    float lpx = px / tileSize.y;
    vec3 col;
    if (k < 0.5) col = marble(p + 0.05 * vec2(cos(TAU*fract(time)),sin(TAU*fract(time))));
    else if (k < 1.5) col = crackedEarth(p, lpx);
    else if (k < 2.5) col = hexTiles(p, lpx);
    else if (k < 3.5) col = truchet(p, lpx);
    else if (k < 4.5) col = organicCells(p + 0.03 * vec2(cos(TAU*fract(time)),sin(TAU*fract(time))));
    else col = checker(p, lpx);
    vec2 e = min(local, vec2(tileSize.x / tileSize.y, 1.0) - local);
    col *= smoothstep(0.0, 0.02, min(e.x, e.y));
    fragColor = vec4(linearToSrgb(col) + ditherTPDF(sampleCoord, int(seed)), 1.0);
}
`,
  wgsl: `fn marble(p_arg: vec2f) -> vec3f {
    var p = p_arg;
    var q: vec2f;
    var r: vec2f;
    var f: f32 = warpedFbm((p * 1.5), 3.0, 5, &q, &r);
    var col: vec3f = mixOklab(srgbToLinear(vec3f(0.92, 0.90, 0.86)), srgbToLinear(vec3f(0.35, 0.38, 0.45)), saturate_f((length(q) * 0.9)));
    col = mix(col, srgbToLinear(vec3f(0.62, 0.42, 0.30)), saturate_f(((r.y * r.y) * 2.0)));
    return (col * ((0.85 + (0.25 * f))));
}

fn crackedEarth(p_arg: vec2f, px_arg: f32) -> vec3f {
    var p = p_arg;
    var px = px_arg;
    var v: vec3f = voronoiBorder((p * 4.0), 0.9);
    var cell: vec2f = floor(((p * 4.0) + v.yz));
    var tint: f32 = hash12(cell);
    var col: vec3f = mix(srgbToLinear(vec3f(0.62, 0.44, 0.30)), srgbToLinear(vec3f(0.75, 0.58, 0.40)), tint);
    col *= (0.75 + (0.25 * smoothstep(0.0, 0.25, v.x)));
    var plate: f32 = fillAA_ff((0.03 - v.x), (px * 4.0));
    return mix(srgbToLinear(vec3f(0.12, 0.08, 0.06)), col, plate);
}

fn hexTiles(p_arg: vec2f, px_arg: f32) -> vec3f {
    var p = p_arg;
    var px = px_arg;
    var h: vec4f = hexGrid((p * 5.0));
    var edge: f32 = hexEdgeDistance(h.xy);
    var base: vec3f = oklchToLinearSrgb(vec3f(0.7, 0.09, (3.6 + (0.8 * hash12(h.zw)))));
    var bevel: f32 = smoothstep(0.0, 0.12, edge);
    return mix(vec3f(0.02), (base * ((0.7 + (0.3 * bevel)))), smoothstep((0.03 - (px * 5.0)), (0.03 + (px * 5.0)), edge));
}

fn truchet(p_arg: vec2f, px_arg: f32) -> vec3f {
    var p = p_arg;
    var px = px_arg;
    var d: f32 = (truchetArcs((p * 5.0), 0.12) / 5.0);
    var stripe: f32 = (truchetArcs((p * 5.0), 0.03) / 5.0);
    var col: vec3f = srgbToLinear(vec3f(0.08, 0.10, 0.16));
    col = mix(col, srgbToLinear(vec3f(0.95, 0.75, 0.30)), fillAA_ff(d, px));
    return mix(col, srgbToLinear(vec3f(0.55, 0.20, 0.10)), fillAA_ff(stripe, px));
}

fn organicCells(p_arg: vec2f) -> vec3f {
    var p = p_arg;
    var s: f32 = smoothVoronoi((p * 5.0), 12.0);
    var col: vec3f = mixOklab(srgbToLinear(vec3f(0.95, 0.55, 0.55)), srgbToLinear(vec3f(0.35, 0.05, 0.15)), saturate_f((s * 1.6)));
    return (col * ((0.6 + (0.4 * smoothstep(0.1, 0.5, s)))));
}

fn checker(p_arg: vec2f, px_arg: f32) -> vec3f {
    var p = p_arg;
    var px = px_arg;
    var z: f32 = (1.0 / max((0.55 - p.y), 0.02));
    var floorUV: vec2f = (vec2f((p.x * z), z) * 1.5);
    var c: f32 = filteredChecker(floorUV, vec2f(((((px * z) * z) * 1.5) + ((px * z) * 1.5))));
    return (mix(vec3f(0.05), vec3f(0.8), c) * (1.0 - smoothstep(0.3, 0.55, p.y)));
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var uv: vec2f = (sampleCoord / vec2f(resolution.y));
    var px: f32 = (1.0 / resolution.y);
    var aspect: f32 = (resolution.x / resolution.y);
    var grid: vec2f = vec2f(3.0, 2.0);
    var tileSize: vec2f = (vec2f(aspect, 1.0) / grid);
    var id: vec2f = floor((uv / tileSize));
    var local: vec2f = (((uv - (id * tileSize))) / vec2f(tileSize.y));
    var p: vec2f = (local - (0.5 * vec2f((tileSize.x / tileSize.y), 1.0)));
    var k: f32 = (id.x + (3.0 * ((1.0 - id.y))));
    var lpx: f32 = (px / tileSize.y);
    var col: vec3f;
    if ((k < 0.5)) {
        col = marble((p + (0.05 * vec2f(cos((TAU * time)), sin((TAU * time))))));
    } else {
        if ((k < 1.5)) {
            col = crackedEarth(p, lpx);
        } else {
            if ((k < 2.5)) {
                col = hexTiles(p, lpx);
            } else {
                if ((k < 3.5)) {
                    col = truchet(p, lpx);
                } else {
                    if ((k < 4.5)) {
                        col = organicCells((p + (0.03 * vec2f(cos((TAU * time)), sin((TAU * time))))));
                    } else {
                        col = checker(p, lpx);
                    }
                }
            }
        }
    }
    var e: vec2f = min(local, (vec2f((tileSize.x / tileSize.y), 1.0) - local));
    col *= smoothstep(0.0, 0.02, min(e.x, e.y));
    fragColor = vec4f((linearToSrgb(col) + ditherTPDF(sampleCoord, i32(seed))), 1.0);
}
`
};

// src/knowledge/shader-craft/examples/procedural-city.ts
var procedural_city_default = {
  glsl: `const float PARCEL = 3.6;
const vec3 CITY_SUN = vec3(-0.6396021491, 0.6396021491, 0.4264014327);
const int AA = 1;
vec4 cityProfile(vec2 id) {
    vec4 b = buildingProfile(id,vec2(2.8,13.0),vec2(0.75,1.13));
    if (length(id)<0.5) b=vec4(18.0,1.15,1.15,2.0);
    return b;
}
vec2 map(vec3 p) {
    vec2 id=domRepeatId(p.xz,vec2(PARCEL));
    vec2 local=p.xz-id*PARCEL;
    vec2 res=vec2(p.y,0.0);
    for(int z=-1;z<=1;z++) for(int x=-1;x<=1;x++) {
        vec2 cell=id+vec2(float(x),float(z));
        vec4 b=cityProfile(cell);
        vec3 q=p-vec3(cell.x*PARCEL,0.0,cell.y*PARCEL);
        float body=sdRoundBox(q-vec3(0.0,b.x*0.38,0.0),vec3(b.y,b.x*0.38,b.z)-0.035,0.035);
        float upper=sdRoundBox(q-vec3(0.0,b.x*0.83,0.0),vec3(b.y*0.72,b.x*0.17,b.z*0.72)-0.025,0.025);
        float podium=sdBox(q-vec3(0.0,0.35,0.0),vec3(b.y+0.15,0.35,b.z+0.15));
        float d=min(podium,min(body,upper));
        if(b.w>0.5) d=min(d,sdBox(q-vec3(0.0,b.x+0.22,0.0),vec3(b.y*0.45,0.22,b.z*0.5)));
        if(b.w>1.5) d=min(d,sdCapsule(q,vec3(0.0,b.x,0.0),vec3(0.0,b.x+1.1,0.0),0.035));
        if(d<res.x)res=vec2(d,1.0);
    }
    float unvisited=min(1.5*PARCEL-abs(local.x),1.5*PARCEL-abs(local.y));
    res.x=min(res.x,unvisited);
    return res;
}
vec3 citySky(vec3 rd) {
    float h=smoothstep(-0.12,0.7,rd.y);
    vec3 c=mix(vec3(0.10,0.12,0.19),vec3(0.012,0.028,0.07),h);
    c+=vec3(0.12,0.055,0.025)*pow(max(dot(rd,CITY_SUN),0.0),12.0);
    return c;
}
vec3 renderCity(vec2 coord) {
    vec2 uv=(2.0*coord-resolution)/resolution.y;
    float orbit=0.5+TAU*fract(time);
    vec3 ro=vec3(32.0*sin(orbit),17.0,32.0*cos(orbit));
    vec3 rd=cameraRay(cameraMatrix(ro,vec3(0.0,6.0,0.0),0.0),uv,1.85);
    vec3 sky=citySky(rd);
    vec3 hit=raymarch(ro,rd,0.05,110.0,0.95);
    if(hit.x<0.0)return sky;
    vec3 p=ro+rd*hit.x;
    vec3 n=calcNormal(p,max(0.001,hit.x*0.00015));
    vec2 id=domRepeatId(p.xz,vec2(PARCEL));
    float variation=hash12(id);
    float fp=2.0*hit.x/(resolution.y*1.85);
    fp/=max(abs(dot(n,rd)),0.15);
    vec3 albedo=mix(vec3(0.16,0.19,0.21),vec3(0.32,0.29,0.25),variation);
    float windows=0.0;
    vec3 emission=vec3(0.0);
    if(hit.y>0.5 && n.y<0.6) {
        vec2 facade=vec2(abs(n.x)>abs(n.z)?p.z:p.x,p.y);
        vec2 grid=facade/vec2(0.30,0.43);
        windows=facadeWindowMask(grid,vec2(0.62,0.65),vec2(fp*3.8,fp*2.5));
        float occupied=step(0.42,hash13(vec3(floor(grid+0.5),variation*100.0)));
        float keep=1.0-smoothstep(0.3,1.2,fp/0.30);
        occupied=mix(0.58,occupied,keep);
        vec3 glass=vec3(0.018,0.035,0.055)+citySky(reflect(rd,n))*0.3;
        albedo=mix(albedo,glass,windows);
        emission=windows*occupied*mix(vec3(0.6,0.22,0.055),vec3(1.2,0.74,0.33),variation)*0.8;
    } else if(hit.y<0.5) {
        albedo=vec3(0.045,0.05,0.06);
        vec2 streets=abs(domRepeat(p.xz,vec2(PARCEL)));
        float marking=(1.0-smoothstep(0.025,0.025+fp,abs(streets.x-PARCEL*0.5)))
                     *filteredStripes(p.z*1.3,fp*1.3);
        albedo=mix(albedo,vec3(0.42,0.32,0.13),marking);
    }
    float ao=calcAO(p,n,0.18);
    float shadow=softShadow(p+n*0.015,CITY_SUN,0.02,20.0,10.0);
    vec3 col=shadePBR(n,-rd,CITY_SUN,albedo,0.4,0.15)*vec3(0.9,0.75,0.6)*shadow;
    col+=albedo*hemisphereLight(n,vec3(0.30,0.43,0.66),vec3(0.07,0.065,0.055))*ao;
    col+=emission;
    float haze=heightFog(ro,rd,hit.x,0.006,0.055);
    return mix(col,citySky(normalize(vec3(rd.x,0.06,rd.z))),haze);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 col=vec3(0.0);
    for(int i=0;i<AA;i++) {
        vec3 sampleColor=renderCity(sampleCoord);
        sampleColor=tonemapAgX(sampleColor*1.05);
        col+=sampleColor/float(AA);
    }
    col=linearToSrgb(col)+ditherTPDF(sampleCoord,int(seed));
    fragColor=vec4(col,1.0);
}
`,
  wgsl: `const PARCEL: f32 = 3.6;

const CITY_SUN: vec3f = vec3f((-0.6396021491), 0.6396021491, 0.4264014327);

const AA: i32 = 1;

fn cityProfile(id_arg: vec2f) -> vec4f {
    var id = id_arg;
    var b: vec4f = buildingProfile(id, vec2f(2.8, 13.0), vec2f(0.75, 1.13));
    if ((length(id) < 0.5)) {
        b = vec4f(18.0, 1.15, 1.15, 2.0);
    }
    return b;
}

fn map(p_arg: vec3f) -> vec2f {
    var p = p_arg;
    var id: vec2f = domRepeatId_f2f2(p.xz, vec2f(PARCEL));
    var local: vec2f = (p.xz - (id * PARCEL));
    var res: vec2f = vec2f(p.y, 0.0);
    for (var z: i32 = (-1); (z <= 1); z++) {
        for (var x: i32 = (-1); (x <= 1); x++) {
            var cell: vec2f = (id + vec2f(f32(x), f32(z)));
            var b: vec4f = cityProfile(cell);
            var q: vec3f = (p - vec3f((cell.x * PARCEL), 0.0, (cell.y * PARCEL)));
            var body: f32 = sdRoundBox((q - vec3f(0.0, (b.x * 0.38), 0.0)), (vec3f(b.y, (b.x * 0.38), b.z) - vec3f(0.035)), 0.035);
            var upper: f32 = sdRoundBox((q - vec3f(0.0, (b.x * 0.83), 0.0)), (vec3f((b.y * 0.72), (b.x * 0.17), (b.z * 0.72)) - vec3f(0.025)), 0.025);
            var podium: f32 = sdBox_f3f3((q - vec3f(0.0, 0.35, 0.0)), vec3f((b.y + 0.15), 0.35, (b.z + 0.15)));
            var d: f32 = min(podium, min(body, upper));
            if ((b.w > 0.5)) {
                d = min(d, sdBox_f3f3((q - vec3f(0.0, (b.x + 0.22), 0.0)), vec3f((b.y * 0.45), 0.22, (b.z * 0.5))));
            }
            if ((b.w > 1.5)) {
                d = min(d, sdCapsule(q, vec3f(0.0, b.x, 0.0), vec3f(0.0, (b.x + 1.1), 0.0), 0.035));
            }
            if ((d < res.x)) {
                res = vec2f(d, 1.0);
            }
        }
    }
    var unvisited: f32 = min(((1.5 * PARCEL) - abs(local.x)), ((1.5 * PARCEL) - abs(local.y)));
    res.x = min(res.x, unvisited);
    return res;
}

fn citySky(rd_arg: vec3f) -> vec3f {
    var rd = rd_arg;
    var h: f32 = smoothstep((-0.12), 0.7, rd.y);
    var c: vec3f = mix(vec3f(0.10, 0.12, 0.19), vec3f(0.012, 0.028, 0.07), h);
    c += (vec3f(0.12, 0.055, 0.025) * pow(max(dot(rd, CITY_SUN), 0.0), 12.0));
    return c;
}

fn renderCity(coord_arg: vec2f) -> vec3f {
    var coord = coord_arg;
    var uv: vec2f = ((((2.0 * coord) - resolution)) / vec2f(resolution.y));
    var orbit: f32 = (0.5 + (TAU * time));
    var ro: vec3f = vec3f((32.0 * sin(orbit)), 17.0, (32.0 * cos(orbit)));
    var rd: vec3f = cameraRay(cameraMatrix(ro, vec3f(0.0, 6.0, 0.0), 0.0), uv, 1.85);
    var sky: vec3f = citySky(rd);
    var hit: vec3f = raymarch(ro, rd, 0.05, 110.0, 0.95);
    if ((hit.x < 0.0)) {
        return sky;
    }
    var p: vec3f = (ro + (rd * hit.x));
    var n: vec3f = calcNormal(p, max(0.001, (hit.x * 0.00015)));
    var id: vec2f = domRepeatId_f2f2(p.xz, vec2f(PARCEL));
    var variation: f32 = hash12(id);
    var fp: f32 = ((2.0 * hit.x) / ((resolution.y * 1.85)));
    fp /= max(abs(dot(n, rd)), 0.15);
    var albedo: vec3f = mix(vec3f(0.16, 0.19, 0.21), vec3f(0.32, 0.29, 0.25), variation);
    var windows: f32 = 0.0;
    var emission: vec3f = vec3f(0.0);
    if (((hit.y > 0.5) && (n.y < 0.6))) {
        var facade: vec2f = vec2f(select(p.x, p.z, (abs(n.x) > abs(n.z))), p.y);
        var grid: vec2f = (facade / vec2f(0.30, 0.43));
        windows = facadeWindowMask(grid, vec2f(0.62, 0.65), vec2f((fp * 3.8), (fp * 2.5)));
        var occupied: f32 = step(0.42, hash13(vec3f(floor((grid + vec2f(0.5))), (variation * 100.0))));
        var keep: f32 = (1.0 - smoothstep(0.3, 1.2, (fp / 0.30)));
        occupied = mix(0.58, occupied, keep);
        var glass: vec3f = (vec3f(0.018, 0.035, 0.055) + (citySky(reflect(rd, n)) * 0.3));
        albedo = mix(albedo, glass, windows);
        emission = (((windows * occupied) * mix(vec3f(0.6, 0.22, 0.055), vec3f(1.2, 0.74, 0.33), variation)) * 0.8);
    } else {
        if ((hit.y < 0.5)) {
            albedo = vec3f(0.045, 0.05, 0.06);
            var streets: vec2f = abs(domRepeat_f2f2(p.xz, vec2f(PARCEL)));
            var marking: f32 = (((1.0 - smoothstep(0.025, (0.025 + fp), abs((streets.x - (PARCEL * 0.5)))))) * filteredStripes((p.z * 1.3), (fp * 1.3)));
            albedo = mix(albedo, vec3f(0.42, 0.32, 0.13), marking);
        }
    }
    var ao: f32 = calcAO(p, n, 0.18);
    var shadow: f32 = softShadow((p + (n * 0.015)), CITY_SUN, 0.02, 20.0, 10.0);
    var col: vec3f = ((shadePBR(n, (-rd), CITY_SUN, albedo, 0.4, 0.15) * vec3f(0.9, 0.75, 0.6)) * shadow);
    col += ((albedo * hemisphereLight(n, vec3f(0.30, 0.43, 0.66), vec3f(0.07, 0.065, 0.055))) * ao);
    col += emission;
    var haze: f32 = heightFog(ro, rd, hit.x, 0.006, 0.055);
    return mix(col, citySky(normalize(vec3f(rd.x, 0.06, rd.z))), haze);
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var col: vec3f = vec3f(0.0);
    for (var i: i32 = 0; (i < AA); i++) {
        var sampleColor: vec3f = renderCity(sampleCoord);
        sampleColor = tonemapAgX((sampleColor * 1.05));
        col += (sampleColor / vec3f(f32(AA)));
    }
    col = (linearToSrgb(col) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/raymarch-sdf.ts
var raymarch_sdf_default = {
  glsl: `const vec3 SUN_DIR = vec3(0.6965260331, 0.5970223141, -0.3980148761);
const vec3 SUN_COLOR = vec3(3.2, 2.8, 2.3);
const vec3 SKY_FILL = vec3(0.35, 0.45, 0.6);
const vec3 GROUND_FILL = vec3(0.18, 0.15, 0.12);
const float BLEND = 0.25;
const float EXPOSURE = 1.0;
const float FOCAL = 2.2;
const float MAT_FLOOR = 1.0;
const float MAT_PLINTH = 2.0;
const float MAT_GLAZE = 3.0;
const float MAT_GOLD = 4.0;
vec2 map(vec3 p) {
    vec2 res = vec2(p.y, MAT_FLOOR);
    float plinth = sdRoundBox(p - vec3(0.0, 0.3, 0.0), vec3(0.9, 0.3, 0.9), 0.04);
    if (plinth < res.x) res = vec2(plinth, MAT_PLINTH);
    vec3 q = p - vec3(0.0, 1.0, 0.0);
    q.xz = rot2(0.6) * q.xz;
    float block = sdRoundBox(q, vec3(0.32, 0.38, 0.32), 0.08);
    float ball = sdSphere(q - vec3(0.16, 0.44, 0.05), 0.3);
    vec2 blob = sminBlend(block, ball, BLEND);
    blob.x = smoothSubtract(blob.x, sdTorus(q - vec3(0.0, -0.08, 0.0), vec2(0.4, 0.05)), 0.04);
    if (blob.x < res.x) res = vec2(blob.x, MAT_GLAZE + 0.99 * blob.y);
    vec3 r = p - vec3(-0.45, 0.8, -0.5);
    r.yz = rot2(1.25) * r.yz;
    float ring = sdTorus(r, vec2(0.17, 0.035));
    if (ring < res.x) res = vec2(ring, MAT_GOLD);
    return res;
}
void material(float id, vec3 p, float footprint, out vec3 albedo, out float rough, out float metal) {
    float m = floor(id);
    rough = 0.5;
    metal = 0.0;
    if (m == MAT_FLOOR) {
        float checker = filteredChecker(p.xz * 2.0, vec2(footprint * 2.0));
        albedo = mix(vec3(0.30, 0.28, 0.26), vec3(0.42, 0.40, 0.37), checker);
        rough = 0.7;
    } else if (m == MAT_PLINTH) {
        albedo = vec3(0.55, 0.53, 0.5);
        rough = 0.85;
    } else if (m == MAT_GLAZE) {
        float w = fract(id) / 0.99;
        albedo = mixOklab(srgbToLinear(vec3(0.95, 0.45, 0.25)), srgbToLinear(vec3(0.15, 0.55, 0.6)), w);
        rough = 0.25;
    } else {
        albedo = vec3(1.0, 0.78, 0.34);
        rough = 0.2;
        metal = 1.0;
    }
}
vec3 render(vec2 sampleCoord) {
    vec2 uv = (2.0 * sampleCoord - resolution) / resolution.y;
    float an = TAU * fract(time);
    vec3 ro = vec3(3.4 * sin(an), 1.9, -3.4 * cos(an));
    vec3 ta = vec3(0.0, 0.85, 0.0);
    mat3 cam = cameraMatrix(ro, ta, 0.0);
    vec3 rd = cameraRay(cam, uv, FOCAL);
    vec3 sky = simpleSky(rd, SUN_DIR);
    vec3 hit = raymarch(ro, rd, 0.1, 30.0, 1.0);
    if (hit.x < 0.0) return sky;
    float t = hit.x;
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p, 0.0005 * t);
    vec3 v = -rd;
    vec3 albedo;
    float rough, metal;
    material(hit.y, p, t * 2.0 / (resolution.y * FOCAL), albedo, rough, metal);
    float sha = softShadow(p + n * 0.002, SUN_DIR, 0.01, 8.0, 12.0);
    float ao = calcAO(p, n, 0.15);
    vec3 refl = reflect(rd, n);
    vec3 f0 = mix(vec3(0.04), albedo, metal);
    vec3 key = shadePBR(n, v, SUN_DIR, albedo, rough, metal) * SUN_COLOR * sha;
    vec3 fill = albedo * (1.0 - metal) * hemisphereLight(n, SKY_FILL, GROUND_FILL) * ao;
    vec3 spec = envBRDFApprox(f0, max(dot(n, v), 0.0), rough) * simpleSky(refl, SUN_DIR)
              * ao * smoothstep(-0.1, 0.3, refl.y);
    vec3 bounceDir = normalize(vec3(-SUN_DIR.x, 0.0, -SUN_DIR.z));
    vec3 bounce = albedo * (1.0 - metal) * vec3(0.25, 0.18, 0.12) * clamp(dot(n, bounceDir), 0.0, 1.0) * ao;
    vec3 col = key + fill + spec + bounce;
    return mix(col, sky, distanceFog(t, 0.02));
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 acc = vec3(0.0);
    for (int i = 0; i < 1; i++) {
        vec3 c = render(sampleCoord);
        c = tonemapAgX(c * EXPOSURE);
        acc += c;
    }
    vec3 col = acc / float(1);
    col = linearToSrgb(col) + ditherTPDF(sampleCoord, int(seed));
    fragColor = vec4(col, 1.0);
}
`,
  wgsl: `const SUN_DIR: vec3f = vec3f(0.6965260331, 0.5970223141, (-0.3980148761));

const SUN_COLOR: vec3f = vec3f(3.2, 2.8, 2.3);

const SKY_FILL: vec3f = vec3f(0.35, 0.45, 0.6);

const GROUND_FILL: vec3f = vec3f(0.18, 0.15, 0.12);

const BLEND: f32 = 0.25;

const EXPOSURE: f32 = 1.0;

const FOCAL: f32 = 2.2;

const MAT_FLOOR: f32 = 1.0;

const MAT_PLINTH: f32 = 2.0;

const MAT_GLAZE: f32 = 3.0;

const MAT_GOLD: f32 = 4.0;

fn map(p_arg: vec3f) -> vec2f {
    var p = p_arg;
    var res: vec2f = vec2f(p.y, MAT_FLOOR);
    var plinth: f32 = sdRoundBox((p - vec3f(0.0, 0.3, 0.0)), vec3f(0.9, 0.3, 0.9), 0.04);
    if ((plinth < res.x)) {
        res = vec2f(plinth, MAT_PLINTH);
    }
    var q: vec3f = (p - vec3f(0.0, 1.0, 0.0));
    { let swizzleValue = (rot2(0.6) * q.xz); q.x = swizzleValue.x; q.z = swizzleValue.y; }
    var block: f32 = sdRoundBox(q, vec3f(0.32, 0.38, 0.32), 0.08);
    var ball: f32 = sdSphere((q - vec3f(0.16, 0.44, 0.05)), 0.3);
    var blob: vec2f = sminBlend(block, ball, BLEND);
    blob.x = smoothSubtract(blob.x, sdTorus((q - vec3f(0.0, (-0.08), 0.0)), vec2f(0.4, 0.05)), 0.04);
    if ((blob.x < res.x)) {
        res = vec2f(blob.x, (MAT_GLAZE + (0.99 * blob.y)));
    }
    var r: vec3f = (p - vec3f((-0.45), 0.8, (-0.5)));
    { let swizzleValue = (rot2(1.25) * r.yz); r.y = swizzleValue.x; r.z = swizzleValue.y; }
    var ring: f32 = sdTorus(r, vec2f(0.17, 0.035));
    if ((ring < res.x)) {
        res = vec2f(ring, MAT_GOLD);
    }
    return res;
}

fn material(id_arg: f32, p_arg: vec3f, footprint_arg: f32, albedo: ptr<function, vec3f>, rough: ptr<function, f32>, metal: ptr<function, f32>) {
    var id = id_arg;
    var p = p_arg;
    var footprint = footprint_arg;
    var m: f32 = floor(id);
    (*rough) = 0.5;
    (*metal) = 0.0;
    if ((m == MAT_FLOOR)) {
        var checker: f32 = filteredChecker((p.xz * 2.0), vec2f((footprint * 2.0)));
        (*albedo) = mix(vec3f(0.30, 0.28, 0.26), vec3f(0.42, 0.40, 0.37), checker);
        (*rough) = 0.7;
    } else {
        if ((m == MAT_PLINTH)) {
            (*albedo) = vec3f(0.55, 0.53, 0.5);
            (*rough) = 0.85;
        } else {
            if ((m == MAT_GLAZE)) {
                var w: f32 = (fract(id) / 0.99);
                (*albedo) = mixOklab(srgbToLinear(vec3f(0.95, 0.45, 0.25)), srgbToLinear(vec3f(0.15, 0.55, 0.6)), w);
                (*rough) = 0.25;
            } else {
                (*albedo) = vec3f(1.0, 0.78, 0.34);
                (*rough) = 0.2;
                (*metal) = 1.0;
            }
        }
    }
}

fn render(fragCoord_arg: vec2f) -> vec3f {
    var sampleCoord = fragCoord_arg;
    var uv: vec2f = ((((2.0 * sampleCoord) - resolution)) / vec2f(resolution.y));
    var an: f32 = (TAU * time);
    var ro: vec3f = vec3f((3.4 * sin(an)), 1.9, ((-3.4) * cos(an)));
    var ta: vec3f = vec3f(0.0, 0.85, 0.0);
    var cam: mat3x3f = cameraMatrix(ro, ta, 0.0);
    var rd: vec3f = cameraRay(cam, uv, FOCAL);
    var sky: vec3f = simpleSky(rd, SUN_DIR);
    var hit: vec3f = raymarch(ro, rd, 0.1, 30.0, 1.0);
    if ((hit.x < 0.0)) {
        return sky;
    }
    var t: f32 = hit.x;
    var p: vec3f = (ro + (rd * t));
    var n: vec3f = calcNormal(p, (0.0005 * t));
    var v: vec3f = (-rd);
    var albedo: vec3f;
    var rough: f32;
    var metal: f32;
    material(hit.y, p, ((t * 2.0) / ((resolution.y * FOCAL))), &albedo, &rough, &metal);
    var sha: f32 = softShadow((p + (n * 0.002)), SUN_DIR, 0.01, 8.0, 12.0);
    var ao: f32 = calcAO(p, n, 0.15);
    var refl: vec3f = reflect(rd, n);
    var f0: vec3f = mix(vec3f(0.04), albedo, metal);
    var key: vec3f = ((shadePBR(n, v, SUN_DIR, albedo, rough, metal) * SUN_COLOR) * sha);
    var fill: vec3f = (((albedo * ((1.0 - metal))) * hemisphereLight(n, SKY_FILL, GROUND_FILL)) * ao);
    var spec: vec3f = (((envBRDFApprox(f0, max(dot(n, v), 0.0), rough) * simpleSky(refl, SUN_DIR)) * ao) * smoothstep((-0.1), 0.3, refl.y));
    var bounceDir: vec3f = normalize(vec3f((-SUN_DIR.x), 0.0, (-SUN_DIR.z)));
    var bounce: vec3f = ((((albedo * ((1.0 - metal))) * vec3f(0.25, 0.18, 0.12)) * clamp(dot(n, bounceDir), 0.0, 1.0)) * ao);
    var col: vec3f = (((key + fill) + spec) + bounce);
    return mix(col, sky, distanceFog(t, 0.02));
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var acc: vec3f = vec3f(0.0);
    for (var i: i32 = 0; (i < 1); i++) {
        var c: vec3f = render(sampleCoord);
        c = tonemapAgX((c * EXPOSURE));
        acc += c;
    }
    var col: vec3f = (acc / vec3f(f32(1)));
    col = (linearToSrgb(col) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/sdf-2d-poster.ts
var sdf_2d_poster_default = {
  glsl: `const vec3 SKY_TOP = vec3(0.13, 0.10, 0.30);
const vec3 SKY_HORIZON = vec3(0.98, 0.52, 0.36);
const vec3 SUN = vec3(1.0, 0.86, 0.55);
const vec3 RIDGE_FAR = vec3(0.55, 0.30, 0.42);
const vec3 RIDGE_NEAR = vec3(0.20, 0.12, 0.26);
const vec3 FOLIAGE = vec3(0.07, 0.05, 0.12);
float ridge(vec2 uv, float base, float amp, float freq, float seed) {
    float h = base + amp * fbm(vec2(uv.x * freq + seed, seed), 5);
    return (uv.y - h) / sqrt(1.0 + 4.0 * amp * amp * freq * freq);
}
float plant(vec2 p) {
    float trunk = sdQuadraticBezier(p, vec2(0.0, -1.0), vec2(0.12, -0.45), vec2(0.02, 0.0)) - 0.025;
    vec2 q = p - vec2(0.02, 0.0);
    q = domPolar(q, 9.0);
    q.y += 0.06 * q.x * q.x;
    float leaf = sdVesica((q - vec2(0.24, 0.0)).yx, 0.32, 0.27);
    return min(trunk, leaf);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec2 uv = (2.0 * sampleCoord - resolution) / resolution.y;
    float px = 2.0 / resolution.y;
    vec3 col = mixOklab(srgbToLinear(SKY_HORIZON), srgbToLinear(SKY_TOP), smoothstep(-0.3, 1.0, uv.y));
    vec2 cell = floor(uv * 18.0);
    vec3 rnd = hash32(cell);
    float star = sdCircle(uv * 18.0 - cell - 0.2 - 0.6 * rnd.xy, 0.02 + 0.05 * rnd.z * rnd.z) / 18.0;
    float twinkle = 0.6 + 0.4 * sin(TAU * fract(time) * (1.0 + floor(3.0 * rnd.z)) + 6.0 * rnd.x);
    col += vec3(1.0, 0.95, 0.9) * fillAA(star, px) * smoothstep(0.1, 0.8, uv.y) * twinkle;
    vec2 sp = uv - vec2(0.42, 0.18);
    float sun = sdCircle(sp, 0.36);
    float gaps = filteredStripes(sp.y * 14.0 + 0.5, px * 14.0);
    float gapMask = mix(1.0, gaps, (1.0 - smoothstep(-0.3, 0.0, sp.y))) ;
    col = mix(col, srgbToLinear(SUN) * 1.6, fillAA(sun, px) * gapMask);
    col += srgbToLinear(SUN) * 0.25 * exp(-6.0 * max(sun, 0.0));
    col = mix(col, srgbToLinear(RIDGE_FAR), fillAA(ridge(uv, -0.1, 0.18, 1.2, 3.0), px));
    col = mix(col, mixOklab(srgbToLinear(RIDGE_FAR), srgbToLinear(RIDGE_NEAR), 0.6),
              fillAA(ridge(uv, -0.32, 0.14, 1.8, 11.0), px));
    col = mix(col, srgbToLinear(RIDGE_NEAR), fillAA(ridge(uv, -0.55, 0.10, 2.6, 23.0), px));
    float plants = min(plant((uv - vec2(-0.95, 0.15)) / 0.9) * 0.9, plant((uv - vec2(1.25, -0.05)) * vec2(-1.0, 1.0) / 0.7) * 0.7);
    col = mix(col, srgbToLinear(FOLIAGE), fillAA(plants, px));
    col = filmGrain(col, 0.04, hash13(vec3(sampleCoord, int(seed))) * 2.0 - 1.0);
    col = linearToSrgb(tonemapNeutral(col)) + ditherTPDF(sampleCoord, int(seed));
    fragColor = vec4(col, 1.0);
}
`,
  wgsl: `const SKY_TOP: vec3f = vec3f(0.13, 0.10, 0.30);

const SKY_HORIZON: vec3f = vec3f(0.98, 0.52, 0.36);

const SUN: vec3f = vec3f(1.0, 0.86, 0.55);

const RIDGE_FAR: vec3f = vec3f(0.55, 0.30, 0.42);

const RIDGE_NEAR: vec3f = vec3f(0.20, 0.12, 0.26);

const FOLIAGE: vec3f = vec3f(0.07, 0.05, 0.12);

fn ridge(uv_arg: vec2f, base_arg: f32, amp_arg: f32, freq_arg: f32, seed_arg: f32) -> f32 {
    var uv = uv_arg;
    var base = base_arg;
    var amp = amp_arg;
    var freq = freq_arg;
    var seed = seed_arg;
    var h: f32 = (base + (amp * fbm_f2i(vec2f(((uv.x * freq) + seed), seed), 5)));
    return (((uv.y - h)) / sqrt((1.0 + ((((4.0 * amp) * amp) * freq) * freq))));
}

fn plant(p_arg: vec2f) -> f32 {
    var p = p_arg;
    var trunk: f32 = (sdQuadraticBezier_f2f2f2f2(p, vec2f(0.0, (-1.0)), vec2f(0.12, (-0.45)), vec2f(0.02, 0.0)) - 0.025);
    var q: vec2f = (p - vec2f(0.02, 0.0));
    q = domPolar(q, 9.0);
    q.y += ((0.06 * q.x) * q.x);
    var leaf: f32 = sdVesica(((q - vec2f(0.24, 0.0))).yx, 0.32, 0.27);
    return min(trunk, leaf);
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var uv: vec2f = ((((2.0 * sampleCoord) - resolution)) / vec2f(resolution.y));
    var px: f32 = (2.0 / resolution.y);
    var col: vec3f = mixOklab(srgbToLinear(SKY_HORIZON), srgbToLinear(SKY_TOP), smoothstep((-0.3), 1.0, uv.y));
    var cell: vec2f = floor((uv * 18.0));
    var rnd: vec3f = hash32(cell);
    var star: f32 = (sdCircle(((((uv * 18.0) - cell) - vec2f(0.2)) - (0.6 * rnd.xy)), (0.02 + ((0.05 * rnd.z) * rnd.z))) / 18.0);
    var twinkle: f32 = (0.6 + (0.4 * sin((((TAU * time) * ((1.0 + floor((3.0 * rnd.z))))) + (6.0 * rnd.x)))));
    col += (((vec3f(1.0, 0.95, 0.9) * fillAA_ff(star, px)) * smoothstep(0.1, 0.8, uv.y)) * twinkle);
    var sp: vec2f = (uv - vec2f(0.42, 0.18));
    var sun: f32 = sdCircle(sp, 0.36);
    var gaps: f32 = filteredStripes(((sp.y * 14.0) + 0.5), (px * 14.0));
    var gapMask: f32 = mix(1.0, gaps, (1.0 - smoothstep(-0.3, 0.0, sp.y)));
    col = mix(col, (srgbToLinear(SUN) * 1.6), (fillAA_ff(sun, px) * gapMask));
    col += ((srgbToLinear(SUN) * 0.25) * exp(((-6.0) * max(sun, 0.0))));
    col = mix(col, srgbToLinear(RIDGE_FAR), fillAA_ff(ridge(uv, (-0.1), 0.18, 1.2, 3.0), px));
    col = mix(col, mixOklab(srgbToLinear(RIDGE_FAR), srgbToLinear(RIDGE_NEAR), 0.6), fillAA_ff(ridge(uv, (-0.32), 0.14, 1.8, 11.0), px));
    col = mix(col, srgbToLinear(RIDGE_NEAR), fillAA_ff(ridge(uv, (-0.55), 0.10, 2.6, 23.0), px));
    var plants: f32 = min((plant((((uv - vec2f((-0.95), 0.15))) / vec2f(0.9))) * 0.9), (plant(((((uv - vec2f(1.25, (-0.05)))) * vec2f((-1.0), 1.0)) / vec2f(0.7))) * 0.7));
    col = mix(col, srgbToLinear(FOLIAGE), fillAA_ff(plants, px));
    col = filmGrain(col, 0.04, ((hash13(vec3f(sampleCoord, seed)) * 2.0) - 1.0));
    col = (linearToSrgb(tonemapNeutral(col)) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/terrain.ts
var terrain_default = {
  glsl: `const vec3 SUN_DIR = vec3(0.8652772176, 0.2035946394, -0.4580879387);
const float SUN_INTENSITY = 20.0;
const float TERRAIN_SCALE = 0.32;
const float TERRAIN_HEIGHT = 2.0;
const float SNOW_LINE = 1.05;
const float EXPOSURE = 1.4;
const float FOCAL = 1.8;
float terrainHeight(vec2 xz) { return TERRAIN_HEIGHT * erodedFbm(xz * TERRAIN_SCALE, 9); }
vec2 map(vec3 p) {
    return vec2(0.45 * (p.y - terrainHeight(p.xz)), 1.0);
}
vec3 sunTransmittance(float heightKm, vec3 dir) {
    vec3 ro = vec3(0.0, ATMOSPHERE_GROUND_KM + heightKm, 0.0);
    if (iSphere(ro, dir, vec3(0.0), ATMOSPHERE_GROUND_KM).x > 0.0) return vec3(0.0);
    float tl = iSphere(ro, dir, vec3(0.0), ATMOSPHERE_TOP_KM).y;
    vec3 depth = vec3(0.0);
    for (int i = 0; i < 12; i++) {
        vec3 q = ro + dir * ((float(i) + 0.5) * tl / 12.0);
        depth += atmosphereExtinction(atmosphereDensity(length(q) - ATMOSPHERE_GROUND_KM)) * tl / 12.0;
    }
    return exp(-depth);
}
vec3 render(vec2 sampleCoord) {
    vec2 uv = (2.0 * sampleCoord - resolution) / resolution.y;
    vec3 ro = vec3(-3.0 + 0.2 * sin(TAU*fract(time)), 0.0, 4.0 - 0.6 * sin(TAU*fract(time)));
    ro.y = terrainHeight(ro.xz) + 0.9;
    vec3 ta = ro + vec3(0.25, -0.16, -1.0);
    mat3 cam = cameraMatrix(ro, ta, 0.0);
    vec3 rd = cameraRay(cam, uv, FOCAL);
    vec3 sky = atmosphereSky(rd, SUN_DIR, ro.y, SUN_INTENSITY);
    vec3 sunColor = SUN_INTENSITY * 0.12 * sunTransmittance(ro.y, SUN_DIR);
    vec3 hit = raymarch(ro, rd, 0.01, 40.0, 1.0);
    if (hit.x < 0.0) {
        return sky + sunColor * 40.0 * sunDisk(rd, SUN_DIR, 0.012, 2.0 / (resolution.y * FOCAL));
    }
    float t = hit.x;
    vec3 p = ro + rd * t;
    vec3 n = calcNormal(p, 0.001 * t);
    float flatness = smoothstep(0.72, 0.88, n.y);
    float snow = smoothstep(SNOW_LINE - 0.15, SNOW_LINE + 0.1, p.y + 0.25 * fbm(p.xz * 6.0, 3))
               * smoothstep(0.55, 0.8, n.y);
    float grain = 0.5 + 0.5 * fbm(p.xz * 40.0, 4);
    vec3 rock = mix(vec3(0.10, 0.085, 0.07), vec3(0.20, 0.17, 0.14), grain);
    vec3 grass = mix(vec3(0.06, 0.08, 0.03), vec3(0.11, 0.12, 0.05), grain);
    vec3 albedo = mix(rock, grass, flatness * (1.0 - smoothstep(0.6, 1.0, p.y)));
    albedo = mix(albedo, vec3(0.85, 0.88, 0.92), snow);
    float sha = softShadow(p + n * 0.01, SUN_DIR, 0.02, 20.0, 16.0);
    float NoL = clamp(dot(n, SUN_DIR), 0.0, 1.0);
    vec3 skyAmbient = atmosphereSky(vec3(0.0, 1.0, 0.0), SUN_DIR, p.y, SUN_INTENSITY);
    vec3 key = albedo * sunColor * NoL * sha;
    vec3 fill = albedo * skyAmbient * (0.5 + 0.5 * n.y) * 2.0;
    vec3 bounce = albedo * sunColor * 0.08 * clamp(dot(n, normalize(vec3(-SUN_DIR.x, 0.0, -SUN_DIR.z))), 0.0, 1.0);
    vec3 col = key + fill + bounce;
    vec3 fogColor = atmosphereSky(normalize(vec3(rd.x, max(rd.y, 0.02), rd.z)), SUN_DIR, ro.y, SUN_INTENSITY);
    vec3 airT = exp(-t * atmosphereExtinction(atmosphereDensity(0.5 * (ro.y + p.y))) * 4.0);
    return col * airT + fogColor * (1.0 - airT);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 col = render(sampleCoord);
    col = linearToSrgb(tonemapAgX(col * EXPOSURE)) + ditherTPDF(sampleCoord, int(seed));
    fragColor = vec4(col, 1.0);
}
`,
  wgsl: `const SUN_DIR: vec3f = vec3f(0.8652772176, 0.2035946394, (-0.4580879387));

const SUN_INTENSITY: f32 = 20.0;

const TERRAIN_SCALE: f32 = 0.32;

const TERRAIN_HEIGHT: f32 = 2.0;

const SNOW_LINE: f32 = 1.05;

const EXPOSURE: f32 = 1.4;

const FOCAL: f32 = 1.8;

fn terrainHeight(xz_arg: vec2f) -> f32 {
    var xz = xz_arg;
    return (TERRAIN_HEIGHT * erodedFbm((xz * TERRAIN_SCALE), 9));
}

fn map(p_arg: vec3f) -> vec2f {
    var p = p_arg;
    return vec2f((0.45 * ((p.y - terrainHeight(p.xz)))), 1.0);
}

fn sunTransmittance(heightKm_arg: f32, dir_arg: vec3f) -> vec3f {
    var heightKm = heightKm_arg;
    var dir = dir_arg;
    var ro: vec3f = vec3f(0.0, (ATMOSPHERE_GROUND_KM + heightKm), 0.0);
    if ((iSphere(ro, dir, vec3f(0.0), ATMOSPHERE_GROUND_KM).x > 0.0)) {
        return vec3f(0.0);
    }
    var tl: f32 = iSphere(ro, dir, vec3f(0.0), ATMOSPHERE_TOP_KM).y;
    var depth: vec3f = vec3f(0.0);
    for (var i: i32 = 0; (i < 12); i++) {
        var q: vec3f = (ro + (dir * (((((f32(i) + 0.5)) * tl) / 12.0))));
        depth += ((atmosphereExtinction(atmosphereDensity((length(q) - ATMOSPHERE_GROUND_KM))) * tl) / vec3f(12.0));
    }
    return exp((-depth));
}

fn render(fragCoord_arg: vec2f) -> vec3f {
    var sampleCoord = fragCoord_arg;
    var uv: vec2f = ((((2.0 * sampleCoord) - resolution)) / vec2f(resolution.y));
    var ro: vec3f = vec3f(((-3.0) + (0.2 * sin((TAU * time)))), 0.0, (4.0 - (0.6 * sin((TAU * time)))));
    ro.y = (terrainHeight(ro.xz) + 0.9);
    var ta: vec3f = (ro + vec3f(0.25, (-0.16), (-1.0)));
    var cam: mat3x3f = cameraMatrix(ro, ta, 0.0);
    var rd: vec3f = cameraRay(cam, uv, FOCAL);
    var sky: vec3f = atmosphereSky(rd, SUN_DIR, ro.y, SUN_INTENSITY);
    var sunColor: vec3f = ((SUN_INTENSITY * 0.12) * sunTransmittance(ro.y, SUN_DIR));
    var hit: vec3f = raymarch(ro, rd, 0.01, 40.0, 1.0);
    if ((hit.x < 0.0)) {
        return (sky + ((sunColor * 40.0) * sunDisk(rd, SUN_DIR, 0.012, (2.0 / ((resolution.y * FOCAL))))));
    }
    var t: f32 = hit.x;
    var p: vec3f = (ro + (rd * t));
    var n: vec3f = calcNormal(p, (0.001 * t));
    var flatness: f32 = smoothstep(0.72, 0.88, n.y);
    var snow: f32 = (smoothstep((SNOW_LINE - 0.15), (SNOW_LINE + 0.1), (p.y + (0.25 * fbm_f2i((p.xz * 6.0), 3)))) * smoothstep(0.55, 0.8, n.y));
    var grain: f32 = (0.5 + (0.5 * fbm_f2i((p.xz * 40.0), 4)));
    var rock: vec3f = mix(vec3f(0.10, 0.085, 0.07), vec3f(0.20, 0.17, 0.14), grain);
    var grass: vec3f = mix(vec3f(0.06, 0.08, 0.03), vec3f(0.11, 0.12, 0.05), grain);
    var albedo: vec3f = mix(rock, grass, (flatness * ((1.0 - smoothstep(0.6, 1.0, p.y)))));
    albedo = mix(albedo, vec3f(0.85, 0.88, 0.92), snow);
    var sha: f32 = softShadow((p + (n * 0.01)), SUN_DIR, 0.02, 20.0, 16.0);
    var NoL: f32 = clamp(dot(n, SUN_DIR), 0.0, 1.0);
    var skyAmbient: vec3f = atmosphereSky(vec3f(0.0, 1.0, 0.0), SUN_DIR, p.y, SUN_INTENSITY);
    var key: vec3f = (((albedo * sunColor) * NoL) * sha);
    var fill: vec3f = (((albedo * skyAmbient) * ((0.5 + (0.5 * n.y)))) * 2.0);
    var bounce: vec3f = (((albedo * sunColor) * 0.08) * clamp(dot(n, normalize(vec3f((-SUN_DIR.x), 0.0, (-SUN_DIR.z)))), 0.0, 1.0));
    var col: vec3f = ((key + fill) + bounce);
    var fogColor: vec3f = atmosphereSky(normalize(vec3f(rd.x, max(rd.y, 0.02), rd.z)), SUN_DIR, ro.y, SUN_INTENSITY);
    var airT: vec3f = exp((((-t) * atmosphereExtinction(atmosphereDensity((0.5 * ((ro.y + p.y)))))) * 4.0));
    return ((col * airT) + (fogColor * ((vec3f(1.0) - airT))));
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var col: vec3f = render(sampleCoord);
    col = (linearToSrgb(tonemapAgX((col * EXPOSURE))) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/examples/volumetric-clouds.ts
var volumetric_clouds_default = {
  glsl: `const vec3 SUN_DIR = vec3(0.6045512662, 0.2518963609, -0.7556890828);
const vec3 SUN_COLOR = vec3(6.0, 5.2, 4.2);
const float CLOUD_BOTTOM = 1.5;
const float CLOUD_TOP = 3.2;
const float COVERAGE = 0.42;
const float DENSITY = 9.0;
const float WIND = 0.06;
const float EXPOSURE = 1.0;
float cloudDensity(vec3 p, int octaves) {
    float h = (p.y - CLOUD_BOTTOM) / (CLOUD_TOP - CLOUD_BOTTOM);
    if (h < 0.0 || h > 1.0) return 0.0;
    float profile = smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.45, 1.0, h));
    vec3 q = p * 0.55 + vec3(cos(TAU*fract(time))*WIND, 0.0, sin(TAU*fract(time))*WIND);
    float n = 0.5 + 0.5 * fbm(q, octaves, 2.02, 0.5);
    float d = saturate((n * profile - (1.0 - COVERAGE)) / COVERAGE);
    return d * DENSITY;
}
vec3 render(vec2 sampleCoord) {
    vec2 uv = (2.0 * sampleCoord - resolution) / resolution.y;
    vec3 ro = vec3(0.0, 0.3, 0.0);
    mat3 cam = cameraMatrix(ro, ro + vec3(0.35, 0.32, -1.0), 0.0);
    vec3 rd = cameraRay(cam, uv, 1.6);
    vec3 sky = simpleSky(rd, SUN_DIR) * 1.2;
    vec3 col = sky + SUN_COLOR * sunDisk(rd, SUN_DIR, 0.03, 2.0 / (resolution.y * 1.6));
    if (rd.y <= 0.01) return col;
    float t0 = (CLOUD_BOTTOM - ro.y) / rd.y;
    float t1 = min((CLOUD_TOP - ro.y) / rd.y, 30.0);
    const int STEPS = 48;
    float dt = (t1 - t0) / float(STEPS);
    float t = t0 + dt * interleavedGradientNoise(floor(sampleCoord), int(seed));
    float mu = dot(rd, SUN_DIR);
    float phase = 4.0 * PI * phaseDualHG(mu, 0.75, -0.25, 0.75);
    vec3 radiance = vec3(0.0), transmittance = vec3(1.0);
    for (int i = 0; i < STEPS; i++) {
        vec3 p = ro + rd * t;
        float sigma = cloudDensity(p, 5);
        if (sigma > 0.001) {
            float depth = 0.0;
            for (int j = 0; j < 5; j++) depth += cloudDensity(p + SUN_DIR * (0.1 + 0.25 * float(j)), 3) * 0.25;
            float h = (p.y - CLOUD_BOTTOM) / (CLOUD_TOP - CLOUD_BOTTOM);
            vec3 sunLight = SUN_COLOR * phase * mix(exp(-depth), beerPowder(depth), 0.5 - 0.5 * mu);
            vec3 ambient = vec3(0.22, 0.28, 0.38) * (0.3 + 0.7 * h);
            volumeStep(radiance, transmittance, vec3(sigma), sigma * (sunLight + ambient), dt);
        }
        if (transmittance.x < 0.01) break;
        t += dt;
    }
    float fade = exp(-0.04 * max(t0, 0.0));
    return mix(col, col * transmittance + radiance, fade);
}
void main() {
    vec2 sampleCoord = gl_FragCoord.xy;
    vec3 col = render(sampleCoord);
    col = linearToSrgb(tonemapAgX(col * EXPOSURE)) + ditherTPDF(sampleCoord, int(seed));
    fragColor = vec4(col, 1.0);
}
`,
  wgsl: `const SUN_DIR: vec3f = vec3f(0.6045512662, 0.2518963609, (-0.7556890828));

const SUN_COLOR: vec3f = vec3f(6.0, 5.2, 4.2);

const CLOUD_BOTTOM: f32 = 1.5;

const CLOUD_TOP: f32 = 3.2;

const COVERAGE: f32 = 0.42;

const DENSITY: f32 = 9.0;

const WIND: f32 = 0.06;

const EXPOSURE: f32 = 1.0;

fn cloudDensity(p_arg: vec3f, octaves_arg: i32) -> f32 {
    var p = p_arg;
    var octaves = octaves_arg;
    var h: f32 = (((p.y - CLOUD_BOTTOM)) / ((CLOUD_TOP - CLOUD_BOTTOM)));
    if (((h < 0.0) || (h > 1.0))) {
        return 0.0;
    }
    var profile: f32 = (smoothstep(0.0, 0.12, h) * (1.0 - smoothstep(0.45, 1.0, h)));
    var q: vec3f = ((p * 0.55) + vec3f((cos((TAU * time)) * WIND), 0.0, (sin((TAU * time)) * WIND)));
    var n: f32 = (0.5 + (0.5 * fbm_f3iff(q, octaves, 2.02, 0.5)));
    var d: f32 = saturate_f(((((n * profile) - ((1.0 - COVERAGE)))) / COVERAGE));
    return (d * DENSITY);
}

fn render(fragCoord_arg: vec2f) -> vec3f {
    var sampleCoord = fragCoord_arg;
    var uv: vec2f = ((((2.0 * sampleCoord) - resolution)) / vec2f(resolution.y));
    var ro: vec3f = vec3f(0.0, 0.3, 0.0);
    var cam: mat3x3f = cameraMatrix(ro, (ro + vec3f(0.35, 0.32, (-1.0))), 0.0);
    var rd: vec3f = cameraRay(cam, uv, 1.6);
    var sky: vec3f = (simpleSky(rd, SUN_DIR) * 1.2);
    var col: vec3f = (sky + (SUN_COLOR * sunDisk(rd, SUN_DIR, 0.03, (2.0 / ((resolution.y * 1.6))))));
    if ((rd.y <= 0.01)) {
        return col;
    }
    var t0: f32 = (((CLOUD_BOTTOM - ro.y)) / rd.y);
    var t1: f32 = min((((CLOUD_TOP - ro.y)) / rd.y), 30.0);
    let STEPS: i32 = 48;
    var dt: f32 = (((t1 - t0)) / f32(STEPS));
    var t: f32 = (t0 + (dt * interleavedGradientNoise_f2i(floor(sampleCoord), i32(seed))));
    var mu: f32 = dot(rd, SUN_DIR);
    var phase: f32 = ((4.0 * PI) * phaseDualHG(mu, 0.75, (-0.25), 0.75));
    var radiance: vec3f = vec3f(0.0);
    var transmittance: vec3f = vec3f(1.0);
    for (var i: i32 = 0; (i < STEPS); i++) {
        var p: vec3f = (ro + (rd * t));
        var sigma: f32 = cloudDensity(p, 5);
        if ((sigma > 0.001)) {
            var depth: f32 = 0.0;
            for (var j: i32 = 0; (j < 5); j++) {
                depth += (cloudDensity((p + (SUN_DIR * ((0.1 + (0.25 * f32(j)))))), 3) * 0.25);
            }
            var h: f32 = (((p.y - CLOUD_BOTTOM)) / ((CLOUD_TOP - CLOUD_BOTTOM)));
            var sunLight: vec3f = ((SUN_COLOR * phase) * mix(exp((-depth)), beerPowder(depth), (0.5 - (0.5 * mu))));
            var ambient: vec3f = (vec3f(0.22, 0.28, 0.38) * ((0.3 + (0.7 * h))));
            volumeStep(&radiance, &transmittance, vec3f(sigma), (sigma * ((sunLight + ambient))), dt);
        }
        if ((transmittance.x < 0.01)) {
            break;
        }
        t += dt;
    }
    var fade: f32 = exp(((-0.04) * max(t0, 0.0)));
    return mix(col, ((col * transmittance) + radiance), fade);
}

fn exampleMain() {

    var sampleCoord: vec2f = pixel;
    var col: vec3f = render(sampleCoord);
    col = (linearToSrgb(tonemapAgX((col * EXPOSURE))) + ditherTPDF(sampleCoord, i32(seed)));
    fragColor = vec4f(col, 1.0);
}
`
};

// src/knowledge/shader-craft/provenance.json
var provenance_default = {
  name: "shader-craft",
  description: "Shader-craft knowledge for Noisemaker effects, adapted from the shader-art-coding skill. Compare each file blob with a newer upstream commit to find what changed, then bring the change into the adapted copy by hand.",
  upstream: {
    repository: "gokayfem/shader-skills",
    host: "github.com",
    commit: "e09bc993bf04201f26c03c87c89210e9b472f526",
    date: "2026-10-19T15:42:26Z",
    license: "MIT",
    copyright: "Copyright (c) 2026 gokayfem"
  },
  adaptation: {
    target: "Noisemaker effects (definition plus GLSL and WGSL programs)",
    adapted: "2026-10-20"
  },
  files: [
    {
      path: "skills/shader-art-coding/SKILL.md",
      blob: "24914feb912c99350e78c9814756a2f52cd2a0b3",
      adaptedAs: [
        "shader-craft-workflow",
        "SHADER_CRAFT_WORKFLOW"
      ]
    },
    {
      path: "skills/shader-art-coding/references/composition-and-debugging.md",
      blob: "34fe7716b15da1c5b07ac7d0fc8e61c3b9082833",
      adaptedAs: [
        "shader-craft-composition-and-debugging"
      ]
    },
    {
      path: "skills/shader-art-coding/references/formula-code-couples-materials.md",
      blob: "dd3080cc6b9e90dffc9450af8aef87fb74b2b0e9",
      adaptedAs: [
        "shader-craft-formula-code-couples-materials"
      ]
    },
    {
      path: "skills/shader-art-coding/references/formula-code-couples-sdf.md",
      blob: "028391ce8678d48a2c16ddb9fa5f42a9f06e4125",
      adaptedAs: [
        "shader-craft-formula-code-couples-sdf"
      ]
    },
    {
      path: "skills/shader-art-coding/references/formula-code-couples-terrain.md",
      blob: "f72c8a26f1e1b578993bcc0462dacbfa69af5a86",
      adaptedAs: [
        "shader-craft-formula-code-couples-terrain"
      ]
    },
    {
      path: "skills/shader-art-coding/references/formula-cookbook.md",
      blob: "c880b921d1188389337974f1c1e983326d310567",
      adaptedAs: [
        "shader-craft-formula-cookbook"
      ]
    },
    {
      path: "skills/shader-art-coding/references/library-index.md",
      blob: "f166a01c876c7dd9ae5927ecdfa2b738cd6932a6",
      adaptedAs: [
        "shader-craft-library-index",
        "shader-craft-library-common",
        "shader-craft-library-hash",
        "shader-craft-library-noise",
        "shader-craft-library-pattern",
        "shader-craft-library-sdf3d",
        "shader-craft-library-sdf2d",
        "shader-craft-library-operators",
        "shader-craft-library-domain",
        "shader-craft-library-architecture",
        "shader-craft-library-raymarch",
        "shader-craft-library-intersect",
        "shader-craft-library-camera",
        "shader-craft-library-shading",
        "shader-craft-library-water",
        "shader-craft-library-color",
        "shader-craft-library-tonemap",
        "shader-craft-library-volume",
        "shader-craft-library-atmosphere",
        "shader-craft-library-post",
        "shader-craft-library-debug"
      ]
    },
    {
      path: "skills/shader-art-coding/references/noise-use-cases.md",
      blob: "3b213cada0c8e2ee157e70323036efbd9ed9304f",
      adaptedAs: [
        "shader-craft-noise-use-cases"
      ]
    },
    {
      path: "skills/shader-art-coding/references/procedural-buildings.md",
      blob: "b36e89dc4433dbeab3d251b968d0ab2e2dcb7f6e",
      adaptedAs: [
        "shader-craft-procedural-buildings"
      ]
    },
    {
      path: "skills/shader-art-coding/references/rendering-pipeline.md",
      blob: "7e2a07631553417e4088c383a00e8463a66fdf66",
      adaptedAs: [
        "shader-craft-rendering-pipeline"
      ]
    },
    {
      path: "skills/shader-art-coding/references/sdf-library-guide.md",
      blob: "4550d3f2f37cb981acc751a1ebbe84a46d901720",
      adaptedAs: [
        "shader-craft-sdf-library-guide"
      ]
    },
    {
      path: "skills/shader-art-coding/references/shader-workflow.md",
      blob: "ce048c5778a5b908fe13df197f0a7cda8020bb18",
      adaptedAs: [
        "shader-craft-shader-workflow"
      ]
    },
    {
      path: "skills/shader-art-coding/references/subject-routing.md",
      blob: "de0aefcbd7d0ad0efd8fb2f91bbe02b596544911",
      adaptedAs: [
        "shader-craft-subject-routing"
      ]
    },
    {
      path: "skills/shader-art-coding/references/terrain-production.md",
      blob: "cfcc7dd158bcc4abeb2f4123703c5d4b8b4dd476",
      adaptedAs: [
        "shader-craft-terrain-production"
      ]
    },
    {
      path: "skills/shader-art-coding/references/water-quality.md",
      blob: "0322396e189e9c7c261895b5cb8ce58107b1c07a",
      adaptedAs: [
        "shader-craft-water-quality"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/common.glsl",
      blob: "ce62c27af0dd6aeb4c7fc00e702be37b18725602",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.common",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/hash.glsl",
      blob: "3fab3da4f07add2da53ee5be7cde51199f7643c6",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.hash",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/noise.glsl",
      blob: "00775b1717d95c32eb6fb07f30e2b1ea68e5c703",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.noise",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/pattern.glsl",
      blob: "e9c4ebee60a73b26a1d04b0de9ed43efcd2b9ff6",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.pattern",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/sdf3d.glsl",
      blob: "750286d7f5443c59d8b81f7bd9aa4684f8983ddd",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.sdf3d",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/sdf2d.glsl",
      blob: "66ae8b1a569f523ae4d2aa3cb3cc53cd61a062a0",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.sdf2d",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/operators.glsl",
      blob: "4250163fc791dd63e46ae6dd86b123c3c493c410",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.operators",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/domain.glsl",
      blob: "c459870a5bcdd2a6fb63927a395457eb6a17b1f9",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.domain",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/architecture.glsl",
      blob: "5448f2e5fd4da242493e550ad6ae1a26489ba349",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.architecture",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/raymarch.glsl",
      blob: "1a8c45c882aa5c9b4bf6396beb23a554b7a9179c",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.raymarch",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/intersect.glsl",
      blob: "49f3f4babfee5257a031034b263d0d4402ee74ab",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.intersect",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/camera.glsl",
      blob: "46fbbed70a89970372fc9a93e57e9908568b1598",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.camera",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/shading.glsl",
      blob: "f4c6bfbe092cdee1c81f35e18227eab3bbde53a3",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.shading",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/water.glsl",
      blob: "7ed57c0580666946044266d3b5f8e5ceed269f6a",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.water",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/color.glsl",
      blob: "309aea9e3693bbef4c18cca42312a3f501cd173e",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.color",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/tonemap.glsl",
      blob: "149257b4eaca432e47fa18ee3163e568ab85f825",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.tonemap",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/volume.glsl",
      blob: "b1fe89e210526ed45c449a08c5f6b2a761fd54d8",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.volume",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/atmosphere.glsl",
      blob: "a05476230119509f0b5431eb26a533fb6129e463",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.atmosphere",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/post.glsl",
      blob: "3994cac273a34564bab7e27a12f8e2ba5d7964ce",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.post",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "skills/shader-art-coding/glsl/debug.glsl",
      blob: "0396650c0fcc9bdca77d55069890935dad1b9b15",
      adaptedAs: [
        "SHADER_CRAFT_LIBRARY_MODULES.debug",
        "SHADER_CRAFT_LIBRARY"
      ]
    },
    {
      path: "prompts/video-to-shader-prompt.md",
      blob: "3ce101fddc9aa4c8f00453cd1f98026ceee44dc5",
      adaptedAs: [
        "shader-craft-video-to-effect",
        "SHADER_CRAFT_VIDEO_TO_EFFECT"
      ]
    },
    {
      path: "CREDITS.md",
      blob: "d317ee028799e4aea386db46fcb37ac933e02c29",
      adaptedAs: [
        "SHADER_CRAFT_CREDITS"
      ]
    },
    {
      path: "LICENSE",
      blob: "9c70bdc8bad3d368a3a3e199c6424df0d0f90e75",
      adaptedAs: [
        "SHADER_CRAFT_LICENSE"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/alpine-valley.glsl",
      blob: "8f60a36e2170cefa8733a37f6970afa1c81eac7e",
      adaptedAs: [
        "shader-craft-example-alpine-valley",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/coastal-water.glsl",
      blob: "4e4fa671ef2ea4ddbbb9dccb6e353862939ca552",
      adaptedAs: [
        "shader-craft-example-coastal-water",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/noise-progression.glsl",
      blob: "b43ec0347dca47a9a289f62e2565184a3c101687",
      adaptedAs: [
        "shader-craft-example-noise-progression",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/noise-terrain-map.glsl",
      blob: "b63820600f6118912252316cb99398f03205c54f",
      adaptedAs: [
        "shader-craft-example-noise-terrain-map",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/ocean.glsl",
      blob: "e0bd15455ac258c9dfc528df4acc04edda8d6a9f",
      adaptedAs: [
        "shader-craft-example-ocean",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/pattern-swatches.glsl",
      blob: "35c855637f6db0cc0dcb3bbea1713210b2448592",
      adaptedAs: [
        "shader-craft-example-pattern-swatches",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/procedural-city.glsl",
      blob: "a1a67fabb6f3109112e693a498edab52289cd9d7",
      adaptedAs: [
        "shader-craft-example-procedural-city",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/raymarch-sdf.glsl",
      blob: "474b14666be7b3c5606d94332e7d4c5dba691995",
      adaptedAs: [
        "shader-craft-example-raymarch-sdf",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/sdf-2d-poster.glsl",
      blob: "bed4655f8a34f1a6a0b22ca864a4e470391c1b47",
      adaptedAs: [
        "shader-craft-example-sdf-2d-poster",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/terrain.glsl",
      blob: "809587d7f5c14f0160a45cdd9bd7667e3559c77a",
      adaptedAs: [
        "shader-craft-example-terrain",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    },
    {
      path: "skills/shader-art-coding/templates/volumetric-clouds.glsl",
      blob: "1f0376e65a9615ecb400986dbd9e6c9773b3dbbd",
      adaptedAs: [
        "shader-craft-example-volumetric-clouds",
        "SHADER_CRAFT_EXAMPLES",
        "getShaderCraftExample"
      ]
    }
  ]
};

// src/knowledge/shader-craft/provenance.ts
var SHADER_CRAFT_PROVENANCE = provenance_default;

// src/knowledge/shader-craft/license.ts
var SHADER_CRAFT_LICENSE = `MIT License

Copyright (c) 2026 gokayfem

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

// src/knowledge/shader-craft/examples.ts
var programs = {
  "alpine-valley": alpine_valley_default,
  "coastal-water": coastal_water_default,
  "noise-progression": noise_progression_default,
  "noise-terrain-map": noise_terrain_map_default,
  ocean: ocean_default,
  "pattern-swatches": pattern_swatches_default,
  "procedural-city": procedural_city_default,
  "raymarch-sdf": raymarch_sdf_default,
  "sdf-2d-poster": sdf_2d_poster_default,
  terrain: terrain_default,
  "volumetric-clouds": volumetric_clouds_default
};
var entries = [
  ["alpine-valley", "craftAlpineValley", "Alpine valley", "Designed valley heightfield, multiscale ridges, snow, strata, terrain shadows and aerial depth."],
  ["coastal-water", "craftCoastalWater", "Coastal water", "Finite-depth waves, refracted seabed, reflected land, dielectric Fresnel, Beer-Lambert extinction and shore foam."],
  ["noise-progression", "craftNoiseProgression", "Noise progression", "Ten noise studies: gradient, Voronoi borders, simplex, fBm, domain warp, value, Worley, ridged, billow and hybrid terrain."],
  ["noise-terrain-map", "craftNoiseTerrainMap", "Noise terrain map", "Top-down hybrid relief, warped river contour, slope lighting and biome masks."],
  ["ocean", "craftOcean", "Ocean", "Dispersive exp-sine waves, analytic slope and curvature, footprint filtering, GGX glints, crest foam and atmospheric sky."],
  ["pattern-swatches", "craftPatternSwatches", "Pattern swatches", "Six filtered material studies: warped marble, cracked earth, hex tiles, Truchet, organic cells and checker."],
  ["procedural-city", "craftProceduralCity", "Procedural city", "Parcel massing, setbacks, roofs, filtered facade windows, emissive occupancy, shadows and blue-hour haze."],
  ["raymarch-sdf", "craftRaymarchSdf", "Raymarch SDF", "Smooth-blended sculpture and gold ring on a plinth, PBR, soft shadows, AO and sky reflections."],
  ["sdf-2d-poster", "craftSdf2dPoster", "SDF 2D poster", "Layered dusk poster with striped sun, ridges, vesica foliage, twinkling stars and Oklab palette."],
  ["terrain", "craftTerrain", "Terrain", "Derivative-damped eroded mountains, slope and altitude materials, snow, shadows and atmospheric scattering."],
  ["volumetric-clouds", "craftVolumetricClouds", "Volumetric clouds", "Coverage-remapped cumulus density, height profile, energy-conserving integration, dual-lobe phase and light marching."]
];
var SHADER_CRAFT_EXAMPLES = entries.map(([id, func, name, summary]) => ({
  id,
  func,
  name,
  summary,
  upstreamPath: `skills/shader-art-coding/templates/${id}.glsl`
}));
function getShaderCraftExample(id) {
  const example = SHADER_CRAFT_EXAMPLES.find((example2) => example2.id === id);
  if (!example) throw new Error(`Unknown shader-craft example: ${id}`);
  const program = programs[id];
  const upstream = SHADER_CRAFT_PROVENANCE.upstream;
  const credit = `/* Adapted from ${upstream.repository}, ${example.upstreamPath} at ${upstream.commit}.
${upstream.copyright}; ${upstream.license}. See LICENSE.
Scene and material formulas retained; Noisemaker bindings, final-only branches, fixed-seed sampling and seamless normalized-time motion.
Physical wave frequencies are quantized to integer loop harmonics; advection follows closed orbits. */
`;
  const definition = {
    name: example.name,
    namespace: "user",
    func: example.func,
    description: example.summary,
    tags: ["shader-craft", "example", example.id],
    starter: true,
    uniformLayout: {
      resolution: { slot: 0, components: "xy" },
      time: { slot: 0, components: "z" },
      aspectRatio: { slot: 0, components: "w" },
      seed: { slot: 1, components: "x" }
    },
    globals: { seed: { type: "int", default: 42, uniform: "seed", min: 0, max: 65535 } },
    passes: [{ name: "render", program: example.func, inputs: {}, outputs: { fragColor: "outputTex" } }]
  };
  const glsl = bundleShaderSource(`#version 300 es
precision highp float;
precision highp int;
uniform vec2 resolution;
uniform float time;
uniform float seed;
out vec4 fragColor;
#define ZERO (min(int(seed), 0))
${credit}${program.glsl}`, "glsl");
  const wgsl = bundleShaderSource(`struct Uniforms { data: array<vec4f, 2>, };
@group(0) @binding(0) var<uniform> uniforms: Uniforms;
var<private> resolution: vec2f;
var<private> time: f32;
var<private> seed: f32;
var<private> pixel: vec2f;
var<private> fragColor: vec4f;
var<private> ZERO: i32;
${credit}${program.wgsl}
@fragment fn main(@builtin(position) position: vec4f) -> @location(0) vec4f {
    resolution = uniforms.data[0].xy;
    time = fract(uniforms.data[0].z);
    seed = uniforms.data[1].x;
    ZERO = min(i32(seed), 0);
    pixel = position.xy;
    exampleMain();
    return fragColor;
}`, "wgsl");
  return {
    example: { ...example },
    definition,
    shaders: { glsl, wgsl },
    files: {
      "definition.js": `import { Effect } from '../../../src/runtime/effect.js'

export default new Effect(${JSON.stringify(definition, null, 2)})
`,
      [`glsl/${example.func}.glsl`]: glsl.source,
      [`wgsl/${example.func}.wgsl`]: wgsl.source,
      LICENSE: SHADER_CRAFT_LICENSE
    }
  };
}
export {
  SHADER_CRAFT_EXAMPLES,
  bundleShaderSource,
  checkShaderSource,
  getShaderCraftExample,
  searchShaderLibrary
};
//# sourceMappingURL=shader-craft.js.map