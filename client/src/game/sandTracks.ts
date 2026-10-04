export type SandPattern =
  | "straight"
  | "curve"
  | "waves"
  | "zigzag"
  | "fork"
  | "color-order"
  | "precision"
  | "branched";

export type SandPoint = { x: number; y: number };

export type SandTrackGeometry = {
  route: SandPoint[];
  decoyRoutes: SandPoint[][];
  hitRadius: number;
  checkpointColors: string[];
};

const ROUTE_CONTROLS: Record<SandPattern, SandPoint[]> = {
  straight: [{ x: 145, y: 238 }, { x: 760, y: 222 }],
  curve: [
    { x: 145, y: 240 }, { x: 285, y: 229 }, { x: 425, y: 176 },
    { x: 590, y: 188 }, { x: 760, y: 222 },
  ],
  waves: [
    { x: 145, y: 215 }, { x: 290, y: 260 }, { x: 445, y: 194 },
    { x: 590, y: 257 }, { x: 760, y: 218 },
  ],
  zigzag: [
    { x: 145, y: 238 }, { x: 290, y: 176 }, { x: 435, y: 255 },
    { x: 585, y: 177 }, { x: 760, y: 228 },
  ],
  fork: [
    { x: 145, y: 238 }, { x: 350, y: 238 }, { x: 500, y: 180 }, { x: 760, y: 222 },
  ],
  "color-order": [
    { x: 145, y: 238 }, { x: 265, y: 240 }, { x: 375, y: 184 },
    { x: 500, y: 184 }, { x: 615, y: 238 }, { x: 760, y: 222 },
  ],
  precision: [
    { x: 145, y: 238 }, { x: 260, y: 194 }, { x: 370, y: 238 },
    { x: 480, y: 192 }, { x: 590, y: 238 }, { x: 680, y: 198 }, { x: 760, y: 222 },
  ],
  branched: [
    { x: 145, y: 238 }, { x: 280, y: 238 }, { x: 385, y: 184 },
    { x: 500, y: 238 }, { x: 615, y: 178 }, { x: 760, y: 222 },
  ],
};

const HIT_RADII: Record<SandPattern, number> = {
  straight: 104,
  curve: 94,
  waves: 84,
  zigzag: 76,
  fork: 86,
  "color-order": 74,
  precision: 62,
  branched: 62,
};

const COLOR_SEQUENCE = ["#e7ae45", "#55aabd", "#df7a6a"];

function samplePolyline(points: SandPoint[], count: number): SandPoint[] {
  const segments = points.slice(1).map((point, index) => {
    const start = points[index];
    return { start, end: point, length: Math.hypot(point.x - start.x, point.y - start.y) };
  });
  const totalLength = segments.reduce((sum, segment) => sum + segment.length, 0);
  const safeCount = Math.max(2, Math.floor(count));

  return Array.from({ length: safeCount }, (_, index) => {
    const distance = (totalLength * index) / (safeCount - 1);
    let walked = 0;
    let segment = segments.at(-1)!;
    for (const candidate of segments) {
      if (walked + candidate.length >= distance) {
        segment = candidate;
        break;
      }
      walked += candidate.length;
    }
    const progress = segment.length ? Math.max(0, Math.min(1, (distance - walked) / segment.length)) : 0;
    return {
      x: Math.round(segment.start.x + (segment.end.x - segment.start.x) * progress),
      y: Math.round(segment.start.y + (segment.end.y - segment.start.y) * progress),
    };
  });
}

export function buildSandTrackGeometry(pattern: SandPattern, target: number): SandTrackGeometry {
  const safeTarget = Math.max(2, Math.min(12, Math.floor(Number.isFinite(target) ? target : 5)));
  const route = samplePolyline(ROUTE_CONTROLS[pattern], safeTarget);
  const decoyRoutes: SandPoint[][] = pattern === "fork"
    ? [[{ x: 350, y: 238 }, { x: 500, y: 286 }, { x: 760, y: 278 }]]
    : pattern === "branched"
      ? [
          [{ x: 280, y: 238 }, { x: 375, y: 128 }, { x: 530, y: 132 }],
          [{ x: 500, y: 238 }, { x: 600, y: 284 }, { x: 760, y: 278 }],
        ]
      : [];
  const checkpointColors = pattern === "color-order"
    ? route.map((_, index) => COLOR_SEQUENCE[index % COLOR_SEQUENCE.length])
    : route.map(() => "#a77549");

  return { route, decoyRoutes, hitRadius: HIT_RADII[pattern], checkpointColors };
}
