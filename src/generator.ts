/**
 * Geometry and SVG Generation Engine
 * Handles math and node builders for all 8 abstract geometric pattern types.
 */

import { PatternSettings } from "./types";
import { PRNG } from "./prng";

// Helper for generating smooth polar coordinates
interface Point {
  x: number;
  y: number;
}

const toCartesian = (cx: number, cy: number, r: number, angleRad: number): Point => ({
  x: cx + r * Math.cos(angleRad),
  y: cy + r * Math.sin(angleRad),
});

/**
 * Main dispatcher class for patterns
 */
export class PatternGenerator {
  static generate(settings: PatternSettings): string {
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

    try {
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
        default:
          pathsContent = this.buildRosace(settings, prng, cx, cy, strokeColor);
      }
    } catch (err) {
      console.error("Error generating pattern paths:", err);
      // Fallback
      pathsContent = `<circle cx="${cx}" cy="${cy}" r="100" fill="none" stroke="${strokeColor}" stroke-width="${settings.strokeWidth}" />`;
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
  <g transform="translate(${cx}, ${cy}) rotate(${baseRotation}) scale(${scaleFactor}) translate(${-cx}, ${-cy})">
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

    let elements = "";

    for (let r = 0; r < rings; r++) {
      const ringScaling = 1 - r * 0.13;
      const currentRadius = baseRadius * ringScaling;
      const currentOffsetDist = offsetDist * (1 + r * 0.2);
      const ringRotation = (r * Math.PI) / count;

      for (let i = 0; i < count; i++) {
        const theta = ((2 * Math.PI) / count) * i + ringRotation;
        const pt = toCartesian(cx, cy, currentOffsetDist, theta);

        // Render overlapping circle or rounded curve
        if (settings.density > 0.6) {
          elements += `<circle cx="${pt.x}" cy="${pt.y}" r="${currentRadius}" fill="none" stroke="${stroke}" stroke-width="${strokeW}" opacity="0.8" class="pattern-element" />\n`;
        } else {
          // Render overlapping vesica piscis petals using ellipse
          const rotDeg = (theta * 180) / Math.PI;
          elements += `<ellipse cx="${pt.x}" cy="${pt.y}" rx="${currentRadius}" ry="${currentRadius * 0.6}" transform="rotate(${rotDeg}, ${pt.x}, ${pt.y})" fill="none" stroke="${stroke}" stroke-width="${strokeW}" opacity="0.8" class="pattern-element" />\n`;
        }

        // Add support spokes or accent small dots if difficulty/complexity is high
        if (settings.complexity >= 4 && i % 2 === 0) {
          const outerPt = toCartesian(cx, cy, currentOffsetDist + currentRadius, theta);
          elements += `<circle cx="${outerPt.x}" cy="${outerPt.y}" r="${strokeW * 1.5}" fill="${stroke}" />\n`;
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

    let elements = "";

    // Outer boundary circle
    elements += `<circle cx="${cx}" cy="${cy}" r="${maxRadius}" fill="none" stroke="${stroke}" stroke-width="${sw * 1.5}" opacity="0.7" />\n`;

    for (let l = 1; l <= layers; l++) {
      const layerRadius = maxRadius * (l / layers);
      const previousRadius = maxRadius * ((l - 1) / layers);
      const elementCount = sym * (l % 2 === 0 ? 1 : 2);

      // Radial outlines
      elements += `<circle cx="${cx}" cy="${cy}" r="${layerRadius}" fill="none" stroke="${stroke}" stroke-width="${sw * 0.6}" stroke-dasharray="${l % 3 === 0 ? "5,5" : "none"}" opacity="0.4" />\n`;

      for (let i = 0; i < elementCount; i++) {
        const theta = ((2 * Math.PI) / elementCount) * i;

        // Visual types per layer (determined deterministically using current layer)
        const layerType = (l + prng.intRange(0, 1)) % 5;

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
          elements += `<path d="M ${pt1.x} ${pt1.y} L ${leftPt.x} ${leftPt.y} L ${pt2.x} ${pt2.y} L ${rightPt.x} ${rightPt.y} Z" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" opacity="0.85" />\n`;
        } else if (layerType === 1) {
          // Petals/leaves
          const cpOffset = (layerRadius - previousRadius) * 0.4;
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
          elements += `<path d="M ${pt1.x} ${pt1.y} Q ${cpL.x} ${cpL.y} ${pt2.x} ${pt2.y} Q ${cpR.x} ${cpR.y} ${pt1.x} ${pt1.y}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="0.9" />\n`;
        } else if (layerType === 2) {
          // Ring of dense nested geometry (arches)
          const midTheta = theta + Math.PI / elementCount;
          const midPt = toCartesian(cx, cy, layerRadius, midTheta);
          elements += `<path d="M ${pt2.x} ${pt2.y} A ${layerRadius - previousRadius} ${layerRadius - previousRadius} 0 0 1 ${midPt.x} ${midPt.y}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="0.8" />\n`;
        } else if (layerType === 3) {
          // Radial line spokes
          elements += `<line x1="${pt1.x}" y1="${pt1.y}" x2="${pt2.x}" y2="${pt2.y}" stroke="${stroke}" stroke-width="${sw}" opacity="0.7" />\n`;

          // Little satellite circles on top of spokes
          if (baseDensity > 0.4) {
            elements += `<circle cx="${pt2.x}" cy="${pt2.y}" r="${sw * (0.8 + baseDensity * 2)}" fill="${fill}" stroke="${stroke}" stroke-width="${sw * 0.8}" />\n`;
          }
        } else {
          // Concentric triangles
          const midTheta = theta + Math.PI / elementCount;
          const midPtOuter = toCartesian(cx, cy, layerRadius, midTheta);
          elements += `<path d="M ${pt1.x} ${pt1.y} L ${midPtOuter.x} ${midPtOuter.y} L ${pt2.x} ${pt2.y}" fill="none" stroke="${stroke}" stroke-width="${sw * 0.8}" opacity="0.75" />\n`;
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
    const maxLevels = Math.min(settings.complexity, 6); // Cap at 6 to prevent server lagging
    const baseLength = settings.canvasSize * 0.14 * (0.5 + settings.density);
    const angleOffset = (Math.PI / 4) * (0.5 + settings.spacing * 1.5);

    let paths = "";

    // We generate branches for 'count' symmetric directions
    for (let i = 0; i < count; i++) {
      const baseAngle = ((2 * Math.PI) / count) * i;

      // Recursive drawer for a single branch tree
      const renderBranch = (
        x: number,
        y: number,
        length: number,
        angle: number,
        currentDepth: number,
      ) => {
        if (currentDepth > maxLevels) return;

        const endX = x + length * Math.cos(angle);
        const endY = y + length * Math.sin(angle);

        // Calculate opacity and line width based on depth
        const opacity = 1 - (currentDepth / (maxLevels + 1)) * 0.55;
        const currentSW = Math.max(0.5, sw * (1 - currentDepth * 0.12));

        paths += `<line x1="${x}" y1="${y}" x2="${endX}" y2="${endY}" stroke="${stroke}" stroke-width="${currentSW}" stroke-linecap="round" opacity="${opacity}" />\n`;

        // Sub-branches based on density/complexity
        const nextLength = length * (0.6 + settings.spacing * 0.2);

        // Split into 2 branches
        renderBranch(endX, endY, nextLength, angle - angleOffset, currentDepth + 1);
        renderBranch(endX, endY, nextLength, angle + angleOffset, currentDepth + 1);

        // Add middle branch if density is high
        if (settings.density > 0.6) {
          renderBranch(endX, endY, nextLength * 0.8, angle, currentDepth + 1);
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
    const tileSize = 60 + settings.spacing * 100;
    const rows = Math.ceil(size / tileSize) + 1;
    const cols = Math.ceil(size / tileSize) + 1;

    let paths = "";

    const edgeVariant = prng.intRange(0, 2); // Deterministic pattern layout selector

    for (let r = -1; r < rows; r++) {
      for (let c = -1; c < cols; c++) {
        const tx = c * tileSize;
        const ty = r * tileSize;

        // Use seed based random values for this tile coordinates
        const internalRand = prng.next();

        if (edgeVariant === 0) {
          // Classic curvilinear Truchet Tiles (joined overlapping waves)
          if (internalRand > 0.5) {
            paths += `<path d="M ${tx} ${ty + tileSize / 2} A ${tileSize / 2} ${tileSize / 2} 0 0 1 ${tx + tileSize / 2} ${ty} 
                             M ${tx + tileSize / 2} ${ty + tileSize} A ${tileSize / 2} ${tileSize / 2} 0 0 0 ${tx + tileSize} ${ty + tileSize / 2}" 
                             fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />\n`;
          } else {
            paths += `<path d="M ${tx + tileSize / 2} ${ty} A ${tileSize / 2} ${tileSize / 2} 0 0 1 ${tx + tileSize} ${ty + tileSize / 2} 
                             M ${tx} ${ty + tileSize / 2} A ${tileSize / 2} ${tileSize / 2} 0 0 0 ${tx + tileSize / 2} ${ty + tileSize}" 
                             fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" />\n`;
          }
        } else if (edgeVariant === 1) {
          // Geometric concentric nested diamond tiles
          const center = tileSize / 2;
          const levels = Math.max(1, Math.min(Math.floor(settings.complexity / 2), 4));

          for (let step = 0; step < levels; step++) {
            const fraction = (step + 1) / levels;
            const radius = center * fraction * settings.density;
            paths += `<path d="M ${tx + center - radius} ${ty + center} 
                             L ${tx + center} ${ty + center - radius} 
                             L ${tx + center + radius} ${ty + center} 
                             L ${tx + center} ${ty + center + radius} Z" 
                             fill="none" stroke="${stroke}" stroke-width="${sw * (1 - step * 0.15)}" opacity="${1 - step * 0.15}" />\n`;
          }
        } else {
          // Interlocking rings/stars
          const cx = tx + tileSize / 2;
          const cy = ty + tileSize / 2;
          const radius = tileSize * 0.45 * settings.scale;

          paths += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="0.6" />\n`;

          if (settings.complexity >= 4) {
            // Little quadrant arches overlapping
            paths += `<path d="M ${tx} ${ty} L ${tx + tileSize} ${ty + tileSize} M ${tx + tileSize} ${ty} L ${tx} ${ty + tileSize}" 
                             stroke="${stroke}" stroke-width="${sw * 0.5}" opacity="0.25" />\n`;
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

    let path = "";

    // Outer framing square with corner ticks
    path += `<rect x="${size * 0.05}" y="${size * 0.05}" width="${size * 0.9}" height="${size * 0.9}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="0.5" />\n`;

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
      path += `<line x1="${corner.x - tickLen}" y1="${corner.y}" x2="${corner.x + tickLen}" y2="${corner.y}" stroke="${stroke}" stroke-width="${sw * 0.5}" opacity="0.8" />\n`;
      path += `<line x1="${corner.x}" y1="${corner.y - tickLen}" x2="${corner.x}" y2="${corner.y + tickLen}" stroke="${stroke}" stroke-width="${sw * 0.5}" opacity="0.8" />\n`;
      path += `<circle cx="${corner.x}" cy="${corner.y}" r="${sw * 3}" fill="none" stroke="${stroke}" stroke-width="${sw * 0.5}" />\n`;
    });

    // Concentric blueprint circles
    for (let i = 1; i <= densityCount; i++) {
      const radius = size * 0.42 * (i / densityCount);
      const strokeW = i % 4 === 0 ? sw : sw * 0.5;
      const dash = i % 2 === 0 ? "none" : "4,4";
      const opacity = i % 3 === 0 ? 0.7 : 0.35;

      path += `<circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${stroke}" stroke-width="${strokeW}" stroke-dasharray="${dash}" opacity="${opacity}" />\n`;
    }

    // Grid Cartesian lines
    const lineSpacing = (size * 0.9) / densityCount;
    for (let c = 1; c < densityCount; c++) {
      const coord = size * 0.05 + c * lineSpacing;
      // Verticals & Horizontals (drawn with low opacity to preserve technical blueprint aesthetic)
      path += `<line x1="${coord}" y1="${size * 0.05}" x2="${coord}" y2="${size * 0.95}" stroke="${stroke}" stroke-width="${sw * 0.3}" stroke-dasharray="2,8" opacity="0.2" />\n`;
      path += `<line x1="${size * 0.05}" y1="${coord}" x2="${size * 0.95}" y2="${coord}" stroke="${stroke}" stroke-width="${sw * 0.3}" stroke-dasharray="2,8" opacity="0.2" />\n`;
    }

    // Radial symmetry blueprint spokes
    for (let s = 0; s < sym; s++) {
      const angle = ((Math.PI * 2) / sym) * s;
      const outerPt = toCartesian(cx, cy, size * 0.42, angle);
      path += `<line x1="${cx}" y1="${cy}" x2="${outerPt.x}" y2="${outerPt.y}" stroke="${stroke}" stroke-width="${sw * 0.6}" opacity="0.4" />\n`;

      // Outer polygon connecting points
      const nextAngle = ((Math.PI * 2) / sym) * (s + 1);
      const nextOuterPt = toCartesian(cx, cy, size * 0.42, nextAngle);
      path += `<line x1="${outerPt.x}" y1="${outerPt.y}" x2="${nextOuterPt.x}" y2="${nextOuterPt.y}" stroke="${stroke}" stroke-width="${sw * 0.5}" opacity="0.35" />\n`;

      // Draw mathematical star connector cords
      if (settings.complexity >= 5) {
        const skipAngle = ((Math.PI * 2) / sym) * (s + 2);
        const skipPt = toCartesian(cx, cy, size * 0.42, skipAngle);
        path += `<line x1="${outerPt.x}" y1="${outerPt.y}" x2="${skipPt.x}" y2="${skipPt.y}" stroke="${stroke}" stroke-width="${sw * 0.4}" stroke-dasharray="2,2" opacity="0.25" />\n`;
      }
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
    let paths = "";

    // Choose mode based on spacing: regular ray pattern or offset multi-spiral patterns
    if (settings.density < 0.3) {
      // Clean high-contrast Ray burst
      for (let i = 0; i < rays; i++) {
        const theta = ((2 * Math.PI) / rays) * i;
        const radius = settings.canvasSize * 0.46;
        const pt = toCartesian(cx, cy, radius, theta);

        // Dashed lines if complexity demands it, or double spokes
        if (settings.complexity >= 6) {
          paths += `<line x1="${cx}" y1="${cy}" x2="${pt.x}" y2="${pt.y}" stroke="${stroke}" stroke-width="${sw}" stroke-dasharray="8,4,2,4" opacity="0.9" />\n`;
        } else {
          paths += `<line x1="${cx}" y1="${cy}" x2="${pt.x}" y2="${pt.y}" stroke="${stroke}" stroke-width="${sw}" opacity="0.8" />\n`;
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
        const numCoils = 4 + settings.density * 6;
        const resolution = 200; // number of steps in spiral
        const maxRadius = settings.canvasSize * 0.48;

        const numArms = Math.max(1, Math.floor(settings.repetitions / 10));

        for (let arm = 0; arm < numArms; arm++) {
          const armAngleOffset = angleOffset + ((Math.PI * 2) / numArms) * arm;
          let pathPoints = "";

          for (let step = 0; step <= resolution; step++) {
            const fraction = step / resolution;
            const currentRadius = fraction * maxRadius;
            const totalRotation = fraction * numCoils * Math.PI * 2 * spiralDirection;
            const currentAngle = totalRotation + armAngleOffset;

            const pt = toCartesian(startX, startY, currentRadius, currentAngle);
            if (step === 0) {
              pathPoints += `M ${pt.x} ${pt.y}`;
            } else {
              pathPoints += ` L ${pt.x} ${pt.y}`;
            }
          }

          paths += `<path d="${pathPoints}" fill="none" stroke="${stroke}" stroke-width="${sw}" opacity="${customOpacity}" stroke-linecap="round" />\n`;
        }
      };

      // Base spiral
      drawSpiral(cx, cy, 0, 1, 0.9);

      // Multiplied overlapping spiral offset by spacing parameter
      const spacingOffset = settings.spacing * (settings.canvasSize * 0.15);
      const angleOffset = settings.spacing * Math.PI * 0.25;

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

    let paths = "";

    // Generating points for a single sector shape
    // sector angle:
    const sectorAngle = (Math.PI * 2) / sym;

    // Create random layout nodes for the sector
    const rawPoints: Point[] = [];
    rawPoints.push({ x: cx, y: cy }); // Start at center

    for (let s = 1; s < segments - 1; s++) {
      const radiusFrac = s / (segments - 1);
      const r = radiusFrac * maxRadius * (0.4 + settings.density * 0.6);

      // Stay boundary constrained in the sector half
      const angleFrac = prng.range(0.05, 0.95);
      const a = sectorAngle * angleFrac;

      rawPoints.push(toCartesian(cx, cy, r, a));
    }

    // Mirror corner constraints
    const outerRadius = maxRadius * (0.7 + prng.range(0, 0.3));
    rawPoints.push(toCartesian(cx, cy, outerRadius, sectorAngle / 2)); // Lock midpoint of sector corner for neat connections

    // Build the SVG path statement
    const makePolygonD = (pts: Point[]) => {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length; i++) {
        d += ` L ${pts[i].x} ${pts[i].y}`;
      }
      d += " Z";
      return d;
    };

    const makeSmoothedD = (pts: Point[]) => {
      if (pts.length < 3) return makePolygonD(pts);
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 1; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x} ${pts[i].y} ${xc} ${yc}`;
      }
      d += ` L ${pts[pts.length - 1].x} ${pts[pts.length - 1].y} Z`;
      return d;
    };

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
      settings.density > 0.55 ? makeSmoothedD(mirroredPoints) : makePolygonD(mirroredPoints);

    // Distribute around circles
    for (let slice = 0; slice < sym; slice++) {
      const angleDeg = (slice * sectorAngle * 180) / Math.PI;

      // Draw outlines
      paths += `<g transform="rotate(${angleDeg}, ${cx}, ${cy})">
        <path d="${polygonD}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" opacity="0.85" />
      </g>\n`;

      // Fill option for highly dense geometric stamps
      if (settings.density > 0.75) {
        paths += `<g transform="rotate(${angleDeg}, ${cx}, ${cy})">
          <path d="${polygonD}" fill="${stroke}" opacity="${0.08 + settings.strokeWidth * 0.012}" />
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
    let paths = "";

    const R = settings.canvasSize * 0.44; // fixed outer ring radius

    // Choose gear parameters deterministically using seed and density settings
    const innerDenominator = prng.intRange(3, 11);
    const rFraction = 0.2 + baseDensity * 0.6;
    const r = R * rFraction; // Inner gear radius
    const d = r * (0.4 + settings.spacing * 0.82); // Pen offset

    const resolution = 720 + Math.ceil(settings.complexity * 250); // Capped safe resolution
    let pathPoints = "";

    for (let step = 0; step <= resolution; step++) {
      // Scale theta linearly
      const theta = (step * Math.PI * 2 * innerDenominator) / resolution;

      // Standard mathematical hypotrochoid equations:
      const x = (R - r) * Math.cos(theta) + d * Math.cos(((R - r) / r) * theta);
      const y = (R - r) * Math.sin(theta) - d * Math.sin(((R - r) / r) * theta);

      const cartX = cx + x;
      const cartY = cy + y;

      if (step === 0) {
        pathPoints += `M ${cartX} ${cartY}`;
      } else {
        pathPoints += ` L ${cartX} ${cartY}`;
      }
    }

    paths += `<path d="${pathPoints}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" opacity="0.9" class="pattern-element" />\n`;

    // Layer multiple concentric orbits if complexity is extra high (e.g. nested overlapping spirographs)
    if (settings.complexity >= 5) {
      let secondaryPoints = "";
      const R2 = R * 0.7;
      const r2 = R2 * rFraction * 0.9;
      const d2 = r2 * 0.6;

      for (let step = 0; step <= resolution; step++) {
        const theta = (step * Math.PI * 2 * 5) / resolution;
        const x = (R2 - r2) * Math.cos(theta) + d2 * Math.cos(((R2 - r2) / r2) * theta);
        const y = (R2 - r2) * Math.sin(theta) - d2 * Math.sin(((R2 - r2) / r2) * theta);

        // Add secondary orbital rotation
        const rotatedTheta = theta * 0.05 + 0.5;
        const rotX = x * Math.cos(rotatedTheta) - y * Math.sin(rotatedTheta);
        const rotY = x * Math.sin(rotatedTheta) + y * Math.cos(rotatedTheta);

        const cartX = cx + rotX;
        const cartY = cy + rotY;

        if (step === 0) {
          secondaryPoints += `M ${cartX} ${cartY}`;
        } else {
          secondaryPoints += ` L ${cartX} ${cartY}`;
        }
      }

      paths += `<path d="${secondaryPoints}" fill="none" stroke="${stroke}" stroke-width="${sw * 0.7}" opacity="0.6" stroke-dasharray="3,3" />\n`;
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

    const numAttractors = Math.max(3, Math.min(Math.floor(complexityVal / 1.5) + 3, 8));
    const attractors: { x: number; y: number; strength: number; radius: number }[] = [];

    for (let i = 0; i < numAttractors; i++) {
      // Create attractors strategically in the viewport
      attractors.push({
        x: prng.range(size * 0.1, size * 0.9),
        y: prng.range(size * 0.1, size * 0.9),
        strength: prng.range(100, 260) * (prng.boolean() ? 1 : -1) * (0.6 + densityVal * 0.8),
        radius: prng.range(130, 310),
      });
    }

    let paths = "";
    // Symmetry is even generates nested contour loops, odd generates flowing streams
    const isRingMode = settings.symmetry % 2 === 0;

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
              attr.strength * weight * Math.sin(dist * 0.045 - settings.spacing * Math.PI * 2);
          });

          const waveHarmonic =
            Math.sin(x * 0.012 + i * 0.18 + settings.spacing * Math.PI) * (15 + densityVal * 25);
          y += deflection + waveHarmonic;

          points.push({ x, y });
        }

        // Draw smooth path
        let d = `M ${points[0].x} ${points[0].y}`;
        for (let j = 0; j < points.length - 1; j++) {
          const xc = (points[j].x + points[j + 1].x) / 2;
          const yc = (points[j].y + points[j + 1].y) / 2;
          d += ` Q ${points[j].x} ${points[j].y} ${xc} ${yc}`;
        }
        d += ` L ${points[points.length - 1].x} ${points[points.length - 1].y}`;

        paths += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" opacity="0.85" />\n`;
      }
    } else {
      // MODE B: Concentric nested topology rings
      const numRings = Math.max(14, Math.floor(count * 0.6));
      // Anchor rings on the positions of the primary 3 attractors to build overlapping hills
      const cores = attractors.slice(0, Math.min(3, attractors.length));

      cores.forEach((core, coreIdx) => {
        const ringSpacingFactor = (size * 0.38) / numRings;

        for (let r = 1; r <= numRings; r++) {
          const radius = r * ringSpacingFactor * (0.4 + settings.scale * 0.6);
          // Keep bounds in reasonable scale
          if (radius > size * 0.55) continue;

          const steps = 150;
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
                Math.cos(angle * 2.5 + idx + settings.spacing * Math.PI * 2);
            });

            const waveHarmonic = Math.sin(angle * 4 + r * 0.25) * (6 + densityVal * 16);
            currentRadius += distortion + waveHarmonic;

            if (currentRadius < 5) currentRadius = 5;

            points.push(toCartesian(core.x, core.y, currentRadius, angle));
          }

          let d = `M ${points[0].x} ${points[0].y}`;
          for (let j = 0; j < points.length - 1; j++) {
            const xc = (points[j].x + points[j + 1].x) / 2;
            const yc = (points[j].y + points[j + 1].y) / 2;
            d += ` Q ${points[j].x} ${points[j].y} ${xc} ${yc}`;
          }
          d += " Z";

          paths += `<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linejoin="round" opacity="0.85" />\n`;
        }
      });
    }

    return paths;
  }
}
