/**
 * Geometry and SVG Generation Engine
 * Handles math and node builders for all abstract geometric pattern types.
 */

import { PatternSettings } from "./types";
import { PRNG } from "./prng";
import { normalizePatternSettings } from "./settings";

// Helper for generating smooth polar coordinates
interface Point {
  x: number;
  y: number;
}

const fmt = (value: number): string => {
  const normalized = Math.abs(value) < 0.0001 ? 0 : value;
  return Number.isInteger(normalized)
    ? `${normalized}`
    : normalized.toFixed(3).replace(/\.?0+$/, "");
};

const toRad = (degrees: number): number => (degrees * Math.PI) / 180;

const toCartesian = (cx: number, cy: number, r: number, angleRad: number): Point => ({
  x: cx + r * Math.cos(angleRad),
  y: cy + r * Math.sin(angleRad),
});

const rotatePoint = (point: Point, cx: number, cy: number, angleRad: number): Point => {
  const dx = point.x - cx;
  const dy = point.y - cy;
  return {
    x: cx + dx * Math.cos(angleRad) - dy * Math.sin(angleRad),
    y: cy + dx * Math.sin(angleRad) + dy * Math.cos(angleRad),
  };
};

const pointsToPath = (points: Point[], closed = false): string => {
  if (points.length === 0) return "";
  const parts = [`M ${fmt(points[0].x)} ${fmt(points[0].y)}`];
  for (let i = 1; i < points.length; i++) {
    parts.push(`L ${fmt(points[i].x)} ${fmt(points[i].y)}`);
  }
  if (closed) parts.push("Z");
  return parts.join(" ");
};

const smoothPath = (points: Point[], closed = false): string => {
  if (points.length < 3) return pointsToPath(points, closed);
  const parts = [`M ${fmt(points[0].x)} ${fmt(points[0].y)}`];
  const limit = closed ? points.length : points.length - 1;

  for (let i = 1; i < limit; i++) {
    const current = points[i];
    const next = points[(i + 1) % points.length];
    const mid = { x: (current.x + next.x) / 2, y: (current.y + next.y) / 2 };
    parts.push(`Q ${fmt(current.x)} ${fmt(current.y)} ${fmt(mid.x)} ${fmt(mid.y)}`);
  }

  if (closed) {
    parts.push("Z");
  } else {
    const last = points[points.length - 1];
    parts.push(`L ${fmt(last.x)} ${fmt(last.y)}`);
  }

  return parts.join(" ");
};

const strokeDashAttrs = (settings: PatternSettings, width = settings.strokeWidth): string => {
  if (settings.strokeStyle === "dashed") {
    return ` stroke-dasharray="${fmt(width * 5)} ${fmt(width * 2.6)}"`;
  }
  if (settings.strokeStyle === "dotted") {
    return ` stroke-dasharray="${fmt(Math.max(0.1, width * 0.1))} ${fmt(width * 2.4)}"`;
  }
  return "";
};

const strokeAttrs = (
  settings: PatternSettings,
  stroke: string,
  width = settings.strokeWidth,
  opacity = 1,
  solid = false,
): string => {
  const attrs = [
    `stroke="${stroke}"`,
    `stroke-width="${fmt(width)}"`,
    `stroke-linecap="round"`,
    `stroke-linejoin="round"`,
  ];
  if (opacity < 1) attrs.push(`opacity="${fmt(opacity)}"`);
  if (!solid) attrs.push(strokeDashAttrs(settings, width).trim());
  return attrs.filter(Boolean).join(" ");
};

const variantIs = (settings: PatternSettings, ...variants: string[]): boolean =>
  variants.includes(settings.variant);

/**
 * Main dispatcher class for patterns
 */
export class PatternGenerator {
  static generate(rawSettings: PatternSettings): string {
    const settings = normalizePatternSettings(rawSettings);
    const prng = new PRNG(settings.seed);
    const { canvasSize, inverted } = settings;
    const cx = canvasSize / 2;
    const cy = canvasSize / 2;

    const strokeColor = inverted ? "#ffffff" : "#000000";
    const fillColor = inverted ? "#000000" : "#ffffff";

    // Scale translation matrix
    const scaleFactor = settings.scale;
    const baseRotation = settings.rotation;

    // Build the inside content depends on the type
    let pathsContent = "";

    switch (settings.type) {
      case "rosace":
        pathsContent = this.buildRosace(settings, prng, cx, cy, strokeColor);
        break;
      case "mandala":
        pathsContent = this.buildMandala(settings, prng, cx, cy, strokeColor, fillColor);
        break;
      case "fractal":
        pathsContent = this.buildFractal(settings, prng, cx, cy, strokeColor);
        break;
      case "tessellation":
        pathsContent = this.buildTessellation(settings, prng, strokeColor, fillColor);
        break;
      case "grid":
        pathsContent = this.buildGeometricGrid(settings, prng, cx, cy, strokeColor);
        break;
      case "radial":
        pathsContent = this.buildRadial(settings, prng, cx, cy, strokeColor);
        break;
      case "symmetry":
        pathsContent = this.buildSymmetry(settings, prng, cx, cy, strokeColor, fillColor);
        break;
      case "generative":
        pathsContent = this.buildGenerative(settings, prng, cx, cy, strokeColor);
        break;
      case "topography":
        pathsContent = this.buildTopography(settings, prng, cx, cy, strokeColor);
        break;
      case "guilloche":
        pathsContent = this.buildGuilloche(settings, prng, cx, cy, strokeColor);
        break;
      case "woven":
        pathsContent = this.buildWoven(settings, prng, strokeColor, fillColor);
        break;
      case "lattice":
        pathsContent = this.buildLattice(settings, prng, cx, cy, strokeColor);
        break;
    }

    // Outer SVG structure with styles
    return `<svg 
  id="pattern-svg-output" 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 ${canvasSize} ${canvasSize}" 
  width="100%" 
  height="100%"
  style="background-color: ${fillColor}; transition: background-color 0.3s ease;"
>
  <style>
    .pattern-element {
      transition: all 0.2s ease-out;
    }
  </style>
  <rect width="${canvasSize}" height="${canvasSize}" fill="${fillColor}" />
  <g transform="translate(${fmt(cx)}, ${fmt(cy)}) rotate(${fmt(baseRotation)}) scale(${fmt(scaleFactor)}) translate(${fmt(-cx)}, ${fmt(-cy)})"${strokeDashAttrs(settings)}>
    ${pathsContent}
  </g>
</svg>`;
  }

  /**
   * 1. Rosace Builder
   * Interlocking circular petals forming complex symmetric shapes.
   */
  private static buildRosace(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const count = Math.max(3, settings.repetitions);
    const strokeW = settings.strokeWidth;
    const baseRadius = settings.canvasSize * 0.18 * (0.5 + settings.density * 1.5);
    const offsetDist = settings.spacing * (settings.canvasSize * 0.25);
    const rings = Math.max(1, Math.min(settings.complexity, 6));
    const phase = toRad(settings.phase);
    const variation = settings.variation;
    const petalMode = variantIs(settings, "petal");
    const orbitMode = variantIs(settings, "orbit");

    let elements = "";

    for (let r = 0; r < rings; r++) {
      const ringScaling = 1 - r * (orbitMode ? 0.1 : 0.13);
      const currentRadius = baseRadius * ringScaling;
      const currentOffsetDist = offsetDist * (1 + r * (orbitMode ? 0.34 : 0.2));
      const ringRotation = (r * Math.PI) / count + phase * (0.25 + r * 0.08);

      for (let i = 0; i < count; i++) {
        const theta =
          ((2 * Math.PI) / count) * i +
          ringRotation +
          Math.sin(i * 1.7 + r + phase) * variation * 0.045;
        const radiusJitter = 1 + Math.sin(i * 2.31 + r * 0.63 + phase) * variation * 0.12;
        const pt = toCartesian(cx, cy, currentOffsetDist * radiusJitter, theta);

        // Render overlapping circle or rounded curve
        if (settings.density > 0.6 && !petalMode) {
          const radius = currentRadius * (orbitMode ? 0.82 + r * 0.04 : 1);
          elements += `<circle cx="${fmt(pt.x)}" cy="${fmt(pt.y)}" r="${fmt(radius)}" fill="none" ${strokeAttrs(settings, stroke, strokeW, 0.8)} class="pattern-element" />\n`;
        } else {
          // Render overlapping vesica piscis petals using ellipse
          const rotDeg = (theta * 180) / Math.PI;
          const squash = petalMode ? 0.38 : 0.6;
          elements += `<ellipse cx="${fmt(pt.x)}" cy="${fmt(pt.y)}" rx="${fmt(currentRadius)}" ry="${fmt(currentRadius * squash)}" transform="rotate(${fmt(rotDeg)}, ${fmt(pt.x)}, ${fmt(pt.y)})" fill="none" ${strokeAttrs(settings, stroke, strokeW, 0.8)} class="pattern-element" />\n`;
        }

        // Add support spokes or accent small dots if difficulty/complexity is high
        if (settings.complexity >= 4 && i % 2 === 0) {
          const outerPt = toCartesian(cx, cy, currentOffsetDist + currentRadius, theta);
          elements += `<circle cx="${fmt(outerPt.x)}" cy="${fmt(outerPt.y)}" r="${fmt(strokeW * 1.5)}" fill="${stroke}" />\n`;
        }
      }
    }

    return elements;
  }

  /**
   * 2. Mandala Builder
   * Concentric rows of repeating geometric elements with high complexity levels.
   */
  private static buildMandala(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
    fill: string,
  ): string {
    const sw = settings.strokeWidth;
    const sym = Math.max(4, settings.symmetry);
    const layers = Math.max(2, Math.min(settings.complexity, 8));
    const maxRadius = settings.canvasSize * 0.45;
    const baseDensity = settings.density;
    const phase = toRad(settings.phase);
    const lotusMode = variantIs(settings, "lotus");
    const crownMode = variantIs(settings, "crown");

    let elements = "";

    // Outer boundary circle
    elements += `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(maxRadius)}" fill="none" ${strokeAttrs(settings, stroke, sw * 1.5, 0.7)} />\n`;

    for (let l = 1; l <= layers; l++) {
      const layerRadius = maxRadius * (l / layers);
      const previousRadius = maxRadius * ((l - 1) / layers);
      const elementCount = sym * (l % 2 === 0 || crownMode ? 1 : 2);

      // Radial outlines
      const ringDash =
        settings.strokeStyle === "solid" && l % 3 === 0 ? ` stroke-dasharray="5 5"` : "";
      elements += `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(layerRadius)}" fill="none" ${strokeAttrs(settings, stroke, sw * 0.6, 0.4)}${ringDash} />\n`;

      for (let i = 0; i < elementCount; i++) {
        const theta =
          ((2 * Math.PI) / elementCount) * i +
          phase * (0.18 + l * 0.03) +
          Math.sin(i + l * 1.9 + phase) * settings.variation * 0.035;

        // Visual types per layer (determined deterministically using current layer)
        const layerType = lotusMode
          ? 1
          : crownMode && l % 2 === 0
            ? 0
            : (l + prng.intRange(0, 1)) % 5;

        const pt1 = toCartesian(cx, cy, previousRadius, theta);
        const pt2 = toCartesian(cx, cy, layerRadius, theta);

        if (layerType === 0) {
          // Sharp spokes/diamonds
          const leftPt = toCartesian(
            cx,
            cy,
            (previousRadius + layerRadius) / 2,
            theta - Math.PI / elementCount,
          );
          const rightPt = toCartesian(
            cx,
            cy,
            (previousRadius + layerRadius) / 2,
            theta + Math.PI / elementCount,
          );
          elements += `<path d="${pointsToPath([pt1, leftPt, pt2, rightPt], true)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.85)} />\n`;
        } else if (layerType === 1) {
          // Petals/leaves
          const cpOffset = (layerRadius - previousRadius) * (0.35 + settings.variation * 0.18);
          const cpL = toCartesian(
            cx,
            cy,
            previousRadius + cpOffset,
            theta - Math.PI / (elementCount * 0.8),
          );
          const cpR = toCartesian(
            cx,
            cy,
            previousRadius + cpOffset,
            theta + Math.PI / (elementCount * 0.8),
          );
          elements += `<path d="M ${fmt(pt1.x)} ${fmt(pt1.y)} Q ${fmt(cpL.x)} ${fmt(cpL.y)} ${fmt(pt2.x)} ${fmt(pt2.y)} Q ${fmt(cpR.x)} ${fmt(cpR.y)} ${fmt(pt1.x)} ${fmt(pt1.y)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.9)} />\n`;
        } else if (layerType === 2) {
          // Ring of dense nested geometry (arches)
          const midTheta = theta + Math.PI / elementCount;
          const midPt = toCartesian(cx, cy, layerRadius, midTheta);
          elements += `<path d="M ${fmt(pt2.x)} ${fmt(pt2.y)} A ${fmt(layerRadius - previousRadius)} ${fmt(layerRadius - previousRadius)} 0 0 1 ${fmt(midPt.x)} ${fmt(midPt.y)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.8)} />\n`;
        } else if (layerType === 3) {
          // Radial line spokes
          elements += `<line x1="${fmt(pt1.x)}" y1="${fmt(pt1.y)}" x2="${fmt(pt2.x)}" y2="${fmt(pt2.y)}" ${strokeAttrs(settings, stroke, sw, 0.7)} />\n`;

          // Little satellite circles on top of spokes
          if (baseDensity > 0.4) {
            elements += `<circle cx="${fmt(pt2.x)}" cy="${fmt(pt2.y)}" r="${fmt(sw * (0.8 + baseDensity * 2))}" fill="${fill}" ${strokeAttrs(settings, stroke, sw * 0.8)} />\n`;
          }
        } else {
          // Concentric triangles
          const midTheta = theta + Math.PI / elementCount;
          const midPtOuter = toCartesian(cx, cy, layerRadius, midTheta);
          elements += `<path d="${pointsToPath([pt1, midPtOuter, pt2])}" fill="none" ${strokeAttrs(settings, stroke, sw * 0.8, 0.75)} />\n`;
        }
      }
    }

    return elements;
  }

  /**
   * 3. Fractal Builder
   * Symmetric generative fractal trees / nested symmetric ice-crystals.
   */
  private static buildFractal(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const sw = settings.strokeWidth;
    const count = Math.max(3, settings.symmetry);
    const maxLevels = Math.min(
      settings.complexity,
      settings.symmetry > 12 && settings.density > 0.65 ? 5 : 6,
    ); // Cap recursive branching to keep SVG size predictable
    const baseLength = settings.canvasSize * 0.14 * (0.5 + settings.density);
    const angleOffset = (Math.PI / 4) * (0.5 + settings.spacing * 1.5);
    const phase = toRad(settings.phase);
    const crystalMode = variantIs(settings, "crystal");
    const vineMode = variantIs(settings, "vine");

    let paths = "";

    // We generate branches for 'count' symmetric directions
    for (let i = 0; i < count; i++) {
      const baseAngle = ((2 * Math.PI) / count) * i + phase;

      // Recursive drawer for a single branch tree
      const renderBranch = (
        x: number,
        y: number,
        length: number,
        angle: number,
        currentDepth: number,
      ) => {
        if (currentDepth > maxLevels) return;

        const wave = vineMode
          ? Math.sin(currentDepth * 1.7 + phase + i) * settings.variation * 0.3
          : 0;
        const endX = x + length * Math.cos(angle + wave);
        const endY = y + length * Math.sin(angle + wave);

        // Calculate opacity and line width based on depth
        const opacity = 1 - (currentDepth / (maxLevels + 1)) * 0.55;
        const currentSW = Math.max(0.5, sw * (1 - currentDepth * 0.12));

        paths += `<line x1="${fmt(x)}" y1="${fmt(y)}" x2="${fmt(endX)}" y2="${fmt(endY)}" ${strokeAttrs(settings, stroke, currentSW, opacity)} />\n`;

        // Sub-branches based on density/complexity
        const nextLength = length * (0.58 + settings.spacing * 0.22 - settings.variation * 0.04);
        const branchJitter = prng.range(-0.18, 0.18) * settings.variation;

        // Split into 2 branches
        renderBranch(endX, endY, nextLength, angle - angleOffset + branchJitter, currentDepth + 1);
        renderBranch(endX, endY, nextLength, angle + angleOffset - branchJitter, currentDepth + 1);

        // Add middle branch if density is high
        if (settings.density > 0.6 || crystalMode) {
          renderBranch(endX, endY, nextLength * 0.8, angle, currentDepth + 1);
        }

        if (crystalMode && currentDepth % 2 === 0) {
          const notchLength = nextLength * 0.42;
          const notchAngle = angle + Math.PI / 2;
          const notchA = {
            x: endX + notchLength * Math.cos(notchAngle),
            y: endY + notchLength * Math.sin(notchAngle),
          };
          const notchB = {
            x: endX - notchLength * Math.cos(notchAngle),
            y: endY - notchLength * Math.sin(notchAngle),
          };
          paths += `<line x1="${fmt(notchA.x)}" y1="${fmt(notchA.y)}" x2="${fmt(notchB.x)}" y2="${fmt(notchB.y)}" ${strokeAttrs(settings, stroke, currentSW * 0.65, opacity * 0.65)} />\n`;
        }
      };

      // Run tree starting from center
      renderBranch(cx, cy, baseLength, baseAngle, 1);
    }

    return paths;
  }

  /**
   * 4. Tessellation Builder
   * Repeating grid tiles filling the viewBox (Truchet / waves / chains).
   */
  private static buildTessellation(
    settings: PatternSettings,
    prng: PRNG,
    stroke: string,
    _fill: string,
  ): string {
    const sw = settings.strokeWidth;
    const size = settings.canvasSize;
    // Spacing determines tile size
    const tileSize = 52 + settings.spacing * 108;
    const rows = Math.ceil(size / tileSize) + 1;
    const cols = Math.ceil(size / tileSize) + 1;
    const phase = toRad(settings.phase);

    let paths = "";

    const edgeVariant = variantIs(settings, "diamond")
      ? 1
      : variantIs(settings, "rings")
        ? 2
        : prng.intRange(0, 2); // Deterministic pattern layout selector

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const tx = c * tileSize + Math.sin(phase) * tileSize * 0.2;
        const ty = r * tileSize + Math.cos(phase) * tileSize * 0.2;

        // Use seed based random values for this tile coordinates
        const internalRand =
          (prng.next() + Math.sin((r + 17) * (c + 3) + phase) * settings.variation + 1) % 1;

        if (edgeVariant === 0) {
          // Classic curvilinear Truchet Tiles (joined overlapping waves)
          if (internalRand > 0.5) {
            paths += `<path d="M ${fmt(tx)} ${fmt(ty + tileSize / 2)} A ${fmt(tileSize / 2)} ${fmt(tileSize / 2)} 0 0 1 ${fmt(tx + tileSize / 2)} ${fmt(ty)} 
                             M ${fmt(tx + tileSize / 2)} ${fmt(ty + tileSize)} A ${fmt(tileSize / 2)} ${fmt(tileSize / 2)} 0 0 0 ${fmt(tx + tileSize)} ${fmt(ty + tileSize / 2)}" 
                             fill="none" ${strokeAttrs(settings, stroke, sw)} />\n`;
          } else {
            paths += `<path d="M ${fmt(tx + tileSize / 2)} ${fmt(ty)} A ${fmt(tileSize / 2)} ${fmt(tileSize / 2)} 0 0 1 ${fmt(tx + tileSize)} ${fmt(ty + tileSize / 2)} 
                             M ${fmt(tx)} ${fmt(ty + tileSize / 2)} A ${fmt(tileSize / 2)} ${fmt(tileSize / 2)} 0 0 0 ${fmt(tx + tileSize / 2)} ${fmt(ty + tileSize)}" 
                             fill="none" ${strokeAttrs(settings, stroke, sw)} />\n`;
          }
        } else if (edgeVariant === 1) {
          // Geometric concentric nested diamond tiles
          const center = tileSize / 2;
          const levels = Math.max(1, Math.min(Math.floor(settings.complexity / 2), 4));

          for (let step = 0; step < levels; step++) {
            const fraction = (step + 1) / levels;
            const radius = center * fraction * settings.density;
            const points = [
              { x: tx + center - radius, y: ty + center },
              { x: tx + center, y: ty + center - radius },
              { x: tx + center + radius, y: ty + center },
              { x: tx + center, y: ty + center + radius },
            ].map((point) => rotatePoint(point, tx + center, ty + center, phase * 0.3));
            paths += `<path d="${pointsToPath(points, true)}" fill="none" ${strokeAttrs(settings, stroke, sw * (1 - step * 0.15), 1 - step * 0.15)} />\n`;
          }
        } else {
          // Interlocking rings/stars
          const cx = tx + tileSize / 2;
          const cy = ty + tileSize / 2;
          const radius = tileSize * 0.45 * settings.scale;

          paths += `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.6)} />\n`;

          if (settings.complexity >= 4) {
            // Little quadrant arches overlapping
            paths += `<path d="M ${fmt(tx)} ${fmt(ty)} L ${fmt(tx + tileSize)} ${fmt(ty + tileSize)} M ${fmt(tx + tileSize)} ${fmt(ty)} L ${fmt(tx)} ${fmt(ty + tileSize)}" 
                             ${strokeAttrs(settings, stroke, sw * 0.5, 0.25)} />\n`;
          }
        }
      }
    }

    return paths;
  }

  /**
   * 5. Geometric Grid Builder
   * technical blueprints, drafting vectors, and radial guide markings.
   */
  private static buildGeometricGrid(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const sw = settings.strokeWidth;
    const size = settings.canvasSize;
    const densityCount = Math.floor(4 + settings.density * 16);
    const sym = Math.max(4, settings.symmetry);
    const phase = toRad(settings.phase);
    const isometricMode = variantIs(settings, "isometric");
    const radarMode = variantIs(settings, "radar");

    let path = "";

    // Outer framing square with corner ticks
    path += `<rect x="${fmt(size * 0.05)}" y="${fmt(size * 0.05)}" width="${fmt(size * 0.9)}" height="${fmt(size * 0.9)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.5)} />\n`;

    // Corner crosshairs / technical drafting markers
    const framePadding = size * 0.05;
    const tickLen = 15;
    const offsetCorners = [
      { x: framePadding, y: framePadding },
      { x: size - framePadding, y: framePadding },
      { x: framePadding, y: size - framePadding },
      { x: size - framePadding, y: size - framePadding },
    ];

    offsetCorners.forEach((corner) => {
      path += `<line x1="${fmt(corner.x - tickLen)}" y1="${fmt(corner.y)}" x2="${fmt(corner.x + tickLen)}" y2="${fmt(corner.y)}" ${strokeAttrs(settings, stroke, sw * 0.5, 0.8)} />\n`;
      path += `<line x1="${fmt(corner.x)}" y1="${fmt(corner.y - tickLen)}" x2="${fmt(corner.x)}" y2="${fmt(corner.y + tickLen)}" ${strokeAttrs(settings, stroke, sw * 0.5, 0.8)} />\n`;
      path += `<circle cx="${fmt(corner.x)}" cy="${fmt(corner.y)}" r="${fmt(sw * 3)}" fill="none" ${strokeAttrs(settings, stroke, sw * 0.5)} />\n`;
    });

    // Concentric blueprint circles
    for (let i = 1; i <= densityCount; i++) {
      const radius = size * 0.42 * (i / densityCount);
      const strokeW = i % 4 === 0 ? sw : sw * 0.5;
      const opacity = i % 3 === 0 ? 0.7 : 0.35;
      const dash = settings.strokeStyle === "solid" && i % 2 !== 0 ? ` stroke-dasharray="4 4"` : "";

      path += `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" fill="none" ${strokeAttrs(settings, stroke, strokeW, opacity)}${dash} />\n`;
    }

    // Grid Cartesian lines
    const lineSpacing = (size * 0.9) / densityCount;
    for (let c = 1; c < densityCount; c++) {
      const coord = size * 0.05 + c * lineSpacing;
      // Verticals & Horizontals (drawn with low opacity to preserve technical blueprint aesthetic)
      const drift = Math.sin(c * 1.7 + phase) * settings.variation * lineSpacing * 0.18;
      path += `<line x1="${fmt(coord + drift)}" y1="${fmt(size * 0.05)}" x2="${fmt(coord - drift)}" y2="${fmt(size * 0.95)}" ${strokeAttrs(settings, stroke, sw * 0.3, 0.2)} />\n`;
      path += `<line x1="${fmt(size * 0.05)}" y1="${fmt(coord - drift)}" x2="${fmt(size * 0.95)}" y2="${fmt(coord + drift)}" ${strokeAttrs(settings, stroke, sw * 0.3, 0.2)} />\n`;

      if (isometricMode) {
        const diagOffset = c * lineSpacing;
        path += `<path d="M ${fmt(size * 0.05 + diagOffset)} ${fmt(size * 0.05)} L ${fmt(size * 0.05)} ${fmt(size * 0.05 + diagOffset)} M ${fmt(size * 0.95 - diagOffset)} ${fmt(size * 0.95)} L ${fmt(size * 0.95)} ${fmt(size * 0.95 - diagOffset)}" ${strokeAttrs(settings, stroke, sw * 0.22, 0.18)} />\n`;
      }
    }

    // Radial symmetry blueprint spokes
    for (let s = 0; s < sym; s++) {
      const angle = ((Math.PI * 2) / sym) * s + phase * 0.35;
      const outerPt = toCartesian(cx, cy, size * 0.42, angle);
      path += `<line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(outerPt.x)}" y2="${fmt(outerPt.y)}" ${strokeAttrs(settings, stroke, sw * 0.6, radarMode ? 0.55 : 0.4)} />\n`;

      // Outer polygon connecting points
      const nextAngle = ((Math.PI * 2) / sym) * (s + 1) + phase * 0.35;
      const nextOuterPt = toCartesian(cx, cy, size * 0.42, nextAngle);
      path += `<line x1="${fmt(outerPt.x)}" y1="${fmt(outerPt.y)}" x2="${fmt(nextOuterPt.x)}" y2="${fmt(nextOuterPt.y)}" ${strokeAttrs(settings, stroke, sw * 0.5, 0.35)} />\n`;

      // Draw mathematical star connector cords
      if (settings.complexity >= 5) {
        const skipAngle = ((Math.PI * 2) / sym) * (s + 2) + phase * 0.35;
        const skipPt = toCartesian(cx, cy, size * 0.42, skipAngle);
        path += `<line x1="${fmt(outerPt.x)}" y1="${fmt(outerPt.y)}" x2="${fmt(skipPt.x)}" y2="${fmt(skipPt.y)}" ${strokeAttrs(settings, stroke, sw * 0.4, 0.25)} />\n`;
      }
    }

    if (radarMode) {
      const sweep = toCartesian(cx, cy, size * 0.42, phase);
      path += `<path d="M ${fmt(cx)} ${fmt(cy)} L ${fmt(sweep.x)} ${fmt(sweep.y)}" ${strokeAttrs(settings, stroke, sw * 1.2, 0.55)} />\n`;
    }

    return path;
  }

  /**
   * 6. Radial Builder
   * Concentric Archimedean spirals and rays causing beautiful moiré overlapping wave bands.
   */
  private static buildRadial(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const sw = settings.strokeWidth;
    const rays = Math.max(8, settings.repetitions);
    const phase = toRad(settings.phase);
    const burstMode = variantIs(settings, "burst");
    const spiralMode = variantIs(settings, "spiral");
    let paths = "";

    // Choose mode based on spacing: regular ray pattern or offset multi-spiral patterns
    if (settings.density < 0.3 || burstMode) {
      // Clean high-contrast Ray burst
      for (let i = 0; i < rays; i++) {
        const theta =
          ((2 * Math.PI) / rays) * i +
          phase +
          Math.sin(i * 1.31 + phase) * settings.variation * 0.04;
        const radius =
          settings.canvasSize *
          0.46 *
          (1 - settings.variation * 0.08 + prng.next() * settings.variation * 0.14);
        const pt = toCartesian(cx, cy, radius, theta);

        // Dashed lines if complexity demands it, or double spokes
        if (settings.complexity >= 6) {
          const dash = settings.strokeStyle === "solid" ? ` stroke-dasharray="8 4 2 4"` : "";
          paths += `<line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(pt.x)}" y2="${fmt(pt.y)}" ${strokeAttrs(settings, stroke, sw, 0.9)}${dash} />\n`;
        } else {
          paths += `<line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(pt.x)}" y2="${fmt(pt.y)}" ${strokeAttrs(settings, stroke, sw, 0.8)} />\n`;
        }
      }
    } else {
      // Beautiful complex Moiré generating spiral coils
      // We overlay 2 spirals with slight angular or spacing offset
      const drawSpiral = (
        startX: number,
        startY: number,
        angleOffset: number,
        spiralDirection = 1,
        customOpacity = 0.8,
      ) => {
        const numCoils = 4 + settings.density * 6 + (spiralMode ? 2 : 0);
        const resolution = 200; // number of steps in spiral
        const maxRadius = settings.canvasSize * 0.48;

        const numArms = Math.max(1, Math.floor(settings.repetitions / (spiralMode ? 8 : 10)));

        for (let arm = 0; arm < numArms; arm++) {
          const armAngleOffset = angleOffset + ((Math.PI * 2) / numArms) * arm;
          const points: Point[] = [];

          for (let step = 0; step <= resolution; step++) {
            const fraction = step / resolution;
            const currentRadius = fraction * maxRadius;
            const totalRotation = fraction * numCoils * Math.PI * 2 * spiralDirection;
            const wobble = Math.sin(fraction * Math.PI * 12 + phase + arm) * settings.variation * 7;
            const currentAngle = totalRotation + armAngleOffset + phase * 0.4;

            points.push(toCartesian(startX, startY, currentRadius + wobble, currentAngle));
          }

          paths += `<path d="${pointsToPath(points)}" fill="none" ${strokeAttrs(settings, stroke, sw, customOpacity)} />\n`;
        }
      };

      // Base spiral
      drawSpiral(cx, cy, phase, 1, 0.9);

      // Multiplied overlapping spiral offset by spacing parameter
      const spacingOffset = settings.spacing * (settings.canvasSize * 0.15);
      const angleOffset = settings.spacing * Math.PI * 0.25 + phase;

      if (spacingOffset > 2) {
        // Draw reverse or matching spiral offset from center triggering interference moiré arrays
        const secondaryCX = cx + spacingOffset * Math.cos(angleOffset);
        const secondaryCY = cy + spacingOffset * Math.sin(angleOffset);
        drawSpiral(secondaryCX, secondaryCY, angleOffset, -1, 0.65);
      }
    }

    return paths;
  }

  /**
   * 7. Symmetry Builder
   * Closed custom polygons mirrored dynamically across symmetry axes.
   */
  private static buildSymmetry(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
    _fill: string,
  ): string {
    const sw = settings.strokeWidth;
    const size = settings.canvasSize;
    const sym = Math.max(3, settings.symmetry);
    const segments = Math.max(3, Math.min(settings.complexity + 1, 10)); // level of nodes
    const maxRadius = size * 0.44;
    const phase = toRad(settings.phase);
    const runeMode = variantIs(settings, "rune");
    const mirrorMode = variantIs(settings, "mirror");

    let paths = "";

    // Generating points for a single sector shape
    // sector angle:
    const sectorAngle = (Math.PI * 2) / sym;

    // Create random layout nodes for the sector
    const rawPoints: Point[] = [];
    rawPoints.push({ x: cx, y: cy }); // Start at center

    for (let s = 1; s < segments - 1; s++) {
      const radiusFrac = s / (segments - 1);
      const r =
        radiusFrac *
        maxRadius *
        (0.4 + settings.density * 0.6) *
        (1 + Math.sin(s * 2.1 + phase) * settings.variation * 0.12);

      // Stay boundary constrained in the sector half
      const angleFrac = mirrorMode ? 0.5 : prng.range(0.05, 0.95);
      const a = sectorAngle * angleFrac;

      rawPoints.push(toCartesian(cx, cy, r, a));
    }

    // Mirror corner constraints
    const outerRadius = maxRadius * (0.7 + prng.range(0, 0.3) + settings.variation * 0.06);
    rawPoints.push(toCartesian(cx, cy, outerRadius, sectorAngle / 2)); // Lock midpoint of sector corner for neat connections

    // Build the SVG path statement
    // Reflect points to make symmetrical half-shapes
    const mirroredPoints = [...rawPoints];
    for (let s = segments - 2; s > 0; s--) {
      // Find distance and polar angle, reflect across sector line.
      const p = rawPoints[s];
      const dx = p.x - cx;
      const dy = p.y - cy;
      const r = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);
      // Reflect angle around sectorLine half
      const reflectedAngle = sectorAngle - angle;
      mirroredPoints.push(toCartesian(cx, cy, r, reflectedAngle));
    }

    // Re-loop back to make perfect symmetry polygon
    const polygonD =
      settings.density > 0.55 && !runeMode
        ? smoothPath(mirroredPoints, true)
        : pointsToPath(mirroredPoints, true);

    // Distribute around circles
    for (let slice = 0; slice < sym; slice++) {
      const angleDeg = (slice * sectorAngle * 180) / Math.PI + settings.phase * 0.12;

      // Draw outlines
      paths += `<g transform="rotate(${angleDeg}, ${cx}, ${cy})">
        <path d="${polygonD}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.85)} />
      </g>\n`;

      // Fill option for highly dense geometric stamps
      if (settings.density > 0.75) {
        paths += `<g transform="rotate(${angleDeg}, ${cx}, ${cy})">
          <path d="${polygonD}" fill="${stroke}" opacity="${0.08 + settings.strokeWidth * 0.012}" />
        </g>\n`;
      }

      if (runeMode) {
        const end = toCartesian(cx, cy, maxRadius * 0.72, sectorAngle / 2);
        paths += `<g transform="rotate(${fmt(angleDeg)}, ${fmt(cx)}, ${fmt(cy)})">
          <line x1="${fmt(cx)}" y1="${fmt(cy)}" x2="${fmt(end.x)}" y2="${fmt(end.y)}" ${strokeAttrs(settings, stroke, sw * 0.55, 0.5)} />
        </g>\n`;
      }
    }

    return paths;
  }

  /**
   * 8. Generative (Spirograph) Builder
   * Intricate mathematical spirographs (hypotrochoids & complex orbit roses).
   */
  private static buildGenerative(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const sw = settings.strokeWidth;
    const baseDensity = settings.density;
    const phase = toRad(settings.phase);
    const flowerMode = variantIs(settings, "flower");
    const orbitMode = variantIs(settings, "orbit");
    let paths = "";

    const R = settings.canvasSize * 0.44; // fixed outer ring radius

    // Choose gear parameters deterministically using seed and density settings
    const innerDenominator = flowerMode ? Math.max(5, settings.symmetry) : prng.intRange(3, 11);
    const seedPhaseOffset = prng.range(-Math.PI, Math.PI) * (0.04 + settings.variation * 0.08);
    const seedRadiusScale = 1 + prng.range(-0.04, 0.04) * (0.4 + settings.variation);
    const rFraction = 0.2 + baseDensity * 0.6;
    const r = R * rFraction * seedRadiusScale; // Inner gear radius
    const d = r * (0.4 + settings.spacing * 0.82 + settings.variation * 0.15); // Pen offset

    const resolution = 720 + Math.ceil(settings.complexity * 250); // Capped safe resolution
    const points: Point[] = [];

    for (let step = 0; step <= resolution; step++) {
      // Scale theta linearly
      const theta = (step * Math.PI * 2 * innerDenominator) / resolution + phase + seedPhaseOffset;
      const radiusBreath = 1 + Math.sin(theta * 0.5 + phase) * settings.variation * 0.04;

      // Standard mathematical hypotrochoid equations:
      const x = (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
      const y = (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);

      points.push({ x: cx + x * radiusBreath, y: cy + y * radiusBreath });
    }

    paths += `<path d="${pointsToPath(points)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.9)} class="pattern-element" />\n`;

    // Layer multiple concentric orbits if complexity is extra high (e.g. nested overlapping spirographs)
    if (settings.complexity >= 5 || orbitMode) {
      const secondaryPoints: Point[] = [];
      const R2 = R * (orbitMode ? 0.82 : 0.7);
      const r2 = R2 * rFraction * 0.9;
      const d2 = r2 * (orbitMode ? 0.82 : 0.6);

      for (let step = 0; step <= resolution; step++) {
        const theta =
          (step * Math.PI * 2 * (orbitMode ? 7 : 5)) / resolution + phase * 1.4 - seedPhaseOffset;
        const x = (R2 - r2) * Math.cos(theta) + d2 * Math.cos(((R2 - r2) / r2) * theta);
        const y = (R2 - r2) * Math.sin(theta) - d2 * Math.sin(((R2 - r2) / r2) * theta);

        // Add secondary orbital rotation
        const rotatedTheta = theta * (orbitMode ? 0.09 : 0.05) + 0.5 + phase * 0.2;
        const rotX = x * Math.cos(rotatedTheta) - y * Math.sin(rotatedTheta);
        const rotY = x * Math.sin(rotatedTheta) + y * Math.cos(rotatedTheta);

        secondaryPoints.push({ x: cx + rotX, y: cy + rotY });
      }

      const dash = settings.strokeStyle === "solid" ? ` stroke-dasharray="3 3"` : "";
      paths += `<path d="${pointsToPath(secondaryPoints)}" fill="none" ${strokeAttrs(settings, stroke, sw * 0.7, 0.6)}${dash} />\n`;
    }

    return paths;
  }

  /**
   * 9. Topography Builder
   * Organic flowing rivers and nested closed contour elevations mirroring reaction-diffusion.
   */
  private static buildTopography(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const sw = settings.strokeWidth;
    const size = settings.canvasSize;
    const count = Math.max(12, settings.repetitions);
    const densityVal = settings.density;
    const complexityVal = settings.complexity;
    const phase = toRad(settings.phase);
    const riverMode = variantIs(settings, "river");
    const woodgrainMode = variantIs(settings, "woodgrain");

    const numAttractors = Math.max(3, Math.min(Math.floor(complexityVal / 1.5) + 3, 8));
    const attractors: { x: number; y: number; strength: number; radius: number }[] = [];

    for (let i = 0; i < numAttractors; i++) {
      // Create attractors strategically in the viewport
      attractors.push({
        x: prng.range(size * 0.1, size * 0.9),
        y: prng.range(size * 0.1, size * 0.9),
        strength:
          prng.range(100, 260) *
          (prng.boolean() ? 1 : -1) *
          (0.6 + densityVal * 0.8 + settings.variation * 0.45),
        radius: prng.range(130, 310),
      });
    }

    let paths = "";
    // Symmetry is even generates nested contour loops, odd generates flowing streams
    const isRingMode = woodgrainMode || (!riverMode && settings.symmetry % 2 === 0);

    if (!isRingMode) {
      // MODE A: Wave streams flowing left to right
      const stepSize = 10;
      const numSteps = Math.ceil(size / stepSize) + 2;

      for (let i = 0; i < count; i++) {
        const startY = (size / (count - 1)) * i;
        const points: { x: number; y: number }[] = [];

        for (let s = 0; s < numSteps; s++) {
          const x = s * stepSize;
          let y = startY;

          let deflection = 0;
          attractors.forEach((attr) => {
            const dx = x - attr.x;
            const dy = y - attr.y;
            const distSq = dx * dx + dy * dy;
            const dist = Math.sqrt(distSq);

            const weight = Math.exp(-distSq / (2 * attr.radius * attr.radius));
            // Rotate flow deflection angle
            deflection +=
              attr.strength *
              weight *
              Math.sin(dist * 0.045 - settings.spacing * Math.PI * 2 + phase);
          });

          const waveHarmonic =
            Math.sin(x * 0.012 + i * 0.18 + settings.spacing * Math.PI + phase) *
            (15 + densityVal * 25 + settings.variation * 16);
          y += deflection + waveHarmonic;

          points.push({ x, y });
        }

        paths += `<path d="${smoothPath(points)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.85)} />\n`;
      }
    } else {
      // MODE B: Concentric nested topology rings
      const numRings = Math.max(14, Math.min(30, Math.floor(count * 0.5)));
      // Anchor rings on the positions of the primary 3 attractors to build overlapping hills
      const cores = attractors.slice(0, Math.min(3, attractors.length));

      cores.forEach((core, coreIdx) => {
        const ringSpacingFactor = (size * 0.38) / numRings;

        for (let r = 1; r <= numRings; r++) {
          const radius =
            r *
            ringSpacingFactor *
            (0.4 + settings.scale * 0.6) *
            (woodgrainMode ? 0.72 + coreIdx * 0.12 : 1);
          // Keep bounds in reasonable scale
          if (radius > size * 0.55) continue;

          const steps = 92 + Math.min(settings.complexity, 8) * 4;
          const points: { x: number; y: number }[] = [];

          for (let step = 0; step <= steps; step++) {
            const angle = ((Math.PI * 2) / steps) * step;
            let currentRadius = radius;

            const samplePt = toCartesian(core.x, core.y, radius, angle);

            let distortion = 0;
            // Deflect matching topography circles around fields of other attractors
            attractors.forEach((attr, idx) => {
              if (idx === coreIdx) return; // Skip self
              const dx = samplePt.x - attr.x;
              const dy = samplePt.y - attr.y;
              const distSq = dx * dx + dy * dy;

              const influence = Math.exp(-distSq / (2 * attr.radius * attr.radius));
              distortion +=
                attr.strength *
                0.8 *
                influence *
                Math.cos(
                  angle * (woodgrainMode ? 5.5 : 2.5) +
                    idx +
                    settings.spacing * Math.PI * 2 +
                    phase,
                );
            });

            const waveHarmonic =
              Math.sin(angle * (woodgrainMode ? 7 : 4) + r * 0.25 + phase) *
              (6 + densityVal * 16 + settings.variation * 12);
            currentRadius += distortion + waveHarmonic;

            if (currentRadius < 5) currentRadius = 5;

            points.push(toCartesian(core.x, core.y, currentRadius, angle));
          }

          paths += `<path d="${smoothPath(points, true)}" fill="none" ${strokeAttrs(settings, stroke, sw, 0.85)} />\n`;
        }
      });
    }

    return paths;
  }

  /**
   * 10. Guilloche Builder
   * Security-style rosettes, medallions and ribbon curves using epicyclic wave layers.
   */
  private static buildGuilloche(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const sw = settings.strokeWidth;
    const phase = toRad(settings.phase);
    const size = settings.canvasSize;
    const maxRadius = size * 0.42;
    const layers = Math.max(3, Math.min(settings.complexity + 2, 10));
    const resolution = Math.min(1200, 420 + settings.repetitions * 8 + settings.complexity * 55);
    const medallionMode = variantIs(settings, "medallion");
    const ribbonMode = variantIs(settings, "ribbon");
    let paths = "";

    if (ribbonMode) {
      const ribbons = Math.max(3, Math.min(12, Math.floor(settings.symmetry / 2) + 3));
      const amplitude = size * (0.035 + settings.density * 0.04);
      const laneHeight = (size * 0.72) / ribbons;

      for (let lane = 0; lane < ribbons; lane++) {
        const yBase = cy - (laneHeight * (ribbons - 1)) / 2 + lane * laneHeight;
        const frequency = prng.intRange(2, 6) + lane * 0.25;
        const points: Point[] = [];

        for (let step = 0; step <= resolution; step++) {
          const t = step / resolution;
          const x = size * 0.08 + t * size * 0.84;
          const wave =
            Math.sin(t * Math.PI * 2 * frequency + phase + lane) * amplitude +
            Math.sin(t * Math.PI * 2 * (frequency + 1.5) - phase) * amplitude * settings.variation;
          points.push({ x, y: yBase + wave });
        }

        paths += `<path d="${smoothPath(points)}" fill="none" ${strokeAttrs(settings, stroke, sw * (1.1 - lane * 0.03), 0.78)} />\n`;
      }

      return paths;
    }

    for (let layer = 0; layer < layers; layer++) {
      const layerRatio = (layer + 1) / layers;
      const baseRadius = maxRadius * (0.18 + layerRatio * 0.76);
      const amplitude = maxRadius * (0.025 + settings.density * 0.055) * (1 - layer * 0.045);
      const lobes = Math.max(3, Math.floor(settings.symmetry / 2) + prng.intRange(0, 5) + layer);
      const gear = prng.intRange(3, 10) + (medallionMode ? layer % 3 : 0);
      const direction = prng.boolean() ? 1 : -1;
      const points: Point[] = [];

      for (let step = 0; step <= resolution; step++) {
        const t = (step / resolution) * Math.PI * 2;
        const radialWave =
          Math.sin(t * lobes + phase + layer * 0.4) * amplitude +
          Math.sin(t * gear * direction - phase * 0.7) * amplitude * settings.variation;
        const epicycle =
          Math.cos(t * (gear + lobes * 0.5) + phase) * amplitude * (0.35 + settings.variation);
        const radius = baseRadius + radialWave;
        points.push({
          x: cx + Math.cos(t) * radius + Math.cos(t * gear + phase) * epicycle,
          y: cy + Math.sin(t) * radius - Math.sin(t * (gear - 1) - phase) * epicycle,
        });
      }

      paths += `<path d="${pointsToPath(points, true)}" fill="none" ${strokeAttrs(settings, stroke, sw * (1 - layer * 0.045), 0.82 - layer * 0.035)} />\n`;
    }

    if (medallionMode) {
      const rings = Math.max(3, Math.min(8, settings.complexity));
      for (let ring = 1; ring <= rings; ring++) {
        const radius = maxRadius * (ring / (rings + 1));
        paths += `<circle cx="${fmt(cx)}" cy="${fmt(cy)}" r="${fmt(radius)}" fill="none" ${strokeAttrs(settings, stroke, sw * 0.42, 0.26)} />\n`;
      }
    }

    return paths;
  }

  /**
   * 11. Woven Builder
   * Over-under loom bands and Celtic-style interlaced strips.
   */
  private static buildWoven(
    settings: PatternSettings,
    prng: PRNG,
    stroke: string,
    fill: string,
  ): string {
    const size = settings.canvasSize;
    const phase = toRad(settings.phase);
    const celticMode = variantIs(settings, "celtic");
    const basketMode = variantIs(settings, "basket");
    const bandCount = Math.max(
      5,
      Math.min(
        18,
        Math.floor(5 + settings.density * 7 + settings.repetitions / (basketMode ? 10 : 14)),
      ),
    );
    const gap = size / (bandCount + 1);
    const bandWidth = settings.strokeWidth * (basketMode ? 5.4 : 4.2) + settings.spacing * 8;
    const weaveSpan = gap * 0.42;
    const waveAmplitude = gap * settings.variation * (celticMode ? 0.24 : 0.1);
    const jitter = prng.range(-gap, gap) * settings.variation * 0.12;
    let paths = "";

    const makeHorizontal = (yBase: number, x1 = size * 0.06, x2 = size * 0.94): Point[] => {
      const points: Point[] = [];
      const steps = Math.max(4, Math.min(80, Math.ceil(Math.abs(x2 - x1) / 8)));
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const x = x1 + (x2 - x1) * t;
        const y = yBase + Math.sin(t * Math.PI * 2 * (celticMode ? 2 : 1) + phase) * waveAmplitude;
        points.push({ x, y });
      }
      return points;
    };

    const makeVertical = (xBase: number, y1 = size * 0.06, y2 = size * 0.94): Point[] => {
      const points: Point[] = [];
      const steps = Math.max(4, Math.min(80, Math.ceil(Math.abs(y2 - y1) / 8)));
      for (let step = 0; step <= steps; step++) {
        const t = step / steps;
        const y = y1 + (y2 - y1) * t;
        const x = xBase + Math.cos(t * Math.PI * 2 * (celticMode ? 2 : 1) - phase) * waveAmplitude;
        points.push({ x, y });
      }
      return points;
    };

    for (let i = 1; i <= bandCount; i++) {
      const coord = i * gap + jitter * Math.sin(i + phase);
      paths += `<path d="${smoothPath(makeHorizontal(coord))}" fill="none" ${strokeAttrs(settings, stroke, bandWidth, 0.24)} />\n`;
      paths += `<path d="${smoothPath(makeVertical(coord))}" fill="none" ${strokeAttrs(settings, stroke, bandWidth, 0.24)} />\n`;
    }

    for (let row = 1; row <= bandCount; row++) {
      const y = row * gap + jitter * Math.sin(row + phase);
      for (let col = 1; col <= bandCount; col++) {
        const x = col * gap + jitter * Math.cos(col - phase);
        const horizontalOver = (row + col + Math.floor(settings.phase / 45)) % 2 === 0;

        if (horizontalOver) {
          const segment = makeHorizontal(y, x - weaveSpan, x + weaveSpan);
          paths += `<path d="${smoothPath(segment)}" fill="none" ${strokeAttrs(settings, fill, bandWidth + 4, 1, true)} />\n`;
          paths += `<path d="${smoothPath(segment)}" fill="none" ${strokeAttrs(settings, stroke, bandWidth, 0.86)} />\n`;
        } else {
          const segment = makeVertical(x, y - weaveSpan, y + weaveSpan);
          paths += `<path d="${smoothPath(segment)}" fill="none" ${strokeAttrs(settings, fill, bandWidth + 4, 1, true)} />\n`;
          paths += `<path d="${smoothPath(segment)}" fill="none" ${strokeAttrs(settings, stroke, bandWidth, 0.86)} />\n`;
        }
      }
    }

    if (celticMode) {
      const diagonals = Math.max(4, Math.min(10, settings.complexity + 2));
      for (let i = -diagonals; i <= diagonals; i++) {
        const offset = i * gap * 1.4;
        const a = { x: size * 0.08 + offset, y: size * 0.08 };
        const b = { x: size * 0.92 + offset, y: size * 0.92 };
        const c = { x: size * 0.92 - offset, y: size * 0.08 };
        const d = { x: size * 0.08 - offset, y: size * 0.92 };
        paths += `<path d="${pointsToPath([a, b])}" fill="none" ${strokeAttrs(settings, stroke, bandWidth * 0.36, 0.34)} />\n`;
        paths += `<path d="${pointsToPath([c, d])}" fill="none" ${strokeAttrs(settings, stroke, bandWidth * 0.36, 0.34)} />\n`;
      }
    }

    return paths;
  }

  /**
   * 12. Lattice Builder
   * Hexagonal, triangular, star and quasi-crystal geometric networks.
   */
  private static buildLattice(
    settings: PatternSettings,
    prng: PRNG,
    cx: number,
    cy: number,
    stroke: string,
  ): string {
    const size = settings.canvasSize;
    const sw = settings.strokeWidth;
    const phase = toRad(settings.phase);
    const starMode = variantIs(settings, "star");
    const quasicrystalMode = variantIs(settings, "quasicrystal");
    const cell = 38 + settings.spacing * 58;
    const rows = Math.ceil(size / (cell * 0.86)) + 3;
    const cols = Math.ceil(size / cell) + 3;
    const jitterAmount = cell * settings.variation * 0.16;
    const points: Point[][] = [];
    let paths = "";

    for (let row = 0; row < rows; row++) {
      points[row] = [];
      for (let col = 0; col < cols; col++) {
        const x =
          -cell +
          col * cell +
          (row % 2) * (cell / 2) +
          Math.sin(row * 1.7 + col + phase) * jitterAmount * prng.next();
        const y =
          -cell +
          row * cell * 0.86 +
          Math.cos(col * 1.3 - row + phase) * jitterAmount * prng.next();
        points[row][col] = { x, y };
      }
    }

    const connect = (a: Point | undefined, b: Point | undefined, opacity: number): void => {
      if (!a || !b) return;
      paths += `<line x1="${fmt(a.x)}" y1="${fmt(a.y)}" x2="${fmt(b.x)}" y2="${fmt(b.y)}" ${strokeAttrs(settings, stroke, sw, opacity)} />\n`;
    };

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const point = points[row][col];
        const opacity = 0.32 + settings.density * 0.38;
        connect(point, points[row][col + 1], opacity);
        connect(point, points[row + 1]?.[col], opacity * 0.82);
        connect(point, points[row + 1]?.[col - (row % 2 === 0 ? 1 : 0)], opacity * 0.82);

        if (settings.density > 0.58 && (row + col) % 3 === 0) {
          paths += `<circle cx="${fmt(point.x)}" cy="${fmt(point.y)}" r="${fmt(sw * 1.4)}" fill="${stroke}" opacity="0.55" />\n`;
        }
      }
    }

    if (starMode) {
      const starCount = Math.max(5, Math.min(18, settings.symmetry + settings.complexity));
      const radius = cell * (0.4 + settings.density * 0.35);
      for (let i = 0; i < starCount; i++) {
        const angle = (Math.PI * 2 * i) / starCount + phase;
        const center = toCartesian(cx, cy, size * 0.34 * (0.35 + (i % 3) * 0.28), angle);
        const vertices = Math.max(5, Math.min(12, Math.floor(settings.symmetry / 2) + 3));
        const starPoints: Point[] = [];
        for (let v = 0; v < vertices * 2; v++) {
          const r = v % 2 === 0 ? radius : radius * 0.42;
          starPoints.push(toCartesian(center.x, center.y, r, phase + (Math.PI * v) / vertices));
        }
        paths += `<path d="${pointsToPath(starPoints, true)}" fill="none" ${strokeAttrs(settings, stroke, sw * 0.78, 0.72)} />\n`;
      }
    }

    if (quasicrystalMode) {
      const families = Math.max(5, Math.min(12, settings.symmetry));
      const lineCount = Math.ceil(size / cell) + 4;
      for (let family = 0; family < families; family++) {
        const angle = phase + (family * Math.PI) / families;
        const normal = angle + Math.PI / 2;
        for (let i = -lineCount; i <= lineCount; i++) {
          const offset = i * cell * 0.62;
          const center = {
            x: cx + Math.cos(normal) * offset,
            y: cy + Math.sin(normal) * offset,
          };
          const a = {
            x: center.x - Math.cos(angle) * size,
            y: center.y - Math.sin(angle) * size,
          };
          const b = {
            x: center.x + Math.cos(angle) * size,
            y: center.y + Math.sin(angle) * size,
          };
          paths += `<line x1="${fmt(a.x)}" y1="${fmt(a.y)}" x2="${fmt(b.x)}" y2="${fmt(b.y)}" ${strokeAttrs(settings, stroke, sw * 0.38, 0.18)} />\n`;
        }
      }
    }

    return paths;
  }
}
