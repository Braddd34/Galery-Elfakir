import type {
  LayoutId,
  LayoutDefinition,
  GeneratedLayout,
  WallSegment,
  PartitionWall,
  DoorwayConfig,
} from "./types"

const WALL_INSET = 0.1
const PARTITION_THICKNESS = 0.15
const ARTWORK_SLOT = 2.0
const DOORWAY_WIDTH = 2.0
const DOORWAY_HEIGHT = 2.8

function clamp(v: number, min: number, max: number) {
  return Math.max(min, Math.min(max, v))
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * clamp(t, 0, 1)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function createOuterWalls(
  width: number,
  length: number,
  height: number
): { walls: WallSegment[]; doorways: DoorwayConfig[] } {
  const halfW = width / 2
  const halfL = length / 2
  const sideWidth = (width - DOORWAY_WIDTH) / 2

  const walls: WallSegment[] = [
    {
      id: "north",
      position: [0, height / 2, -halfL + WALL_INSET],
      rotation: [0, 0, 0],
      width,
      height,
      capacity: Math.floor(width / ARTWORK_SLOT),
    },
    {
      id: "east",
      position: [halfW - WALL_INSET, height / 2, 0],
      rotation: [0, -Math.PI / 2, 0],
      width: length,
      height,
      capacity: Math.floor(length / ARTWORK_SLOT),
    },
    {
      id: "west",
      position: [-halfW + WALL_INSET, height / 2, 0],
      rotation: [0, Math.PI / 2, 0],
      width: length,
      height,
      capacity: Math.floor(length / ARTWORK_SLOT),
    },
    {
      id: "south-left",
      position: [-halfW + sideWidth / 2, height / 2, halfL - WALL_INSET],
      rotation: [0, Math.PI, 0],
      width: sideWidth,
      height,
      capacity: Math.max(1, Math.floor(sideWidth / ARTWORK_SLOT)),
    },
    {
      id: "south-right",
      position: [halfW - sideWidth / 2, height / 2, halfL - WALL_INSET],
      rotation: [0, Math.PI, 0],
      width: sideWidth,
      height,
      capacity: Math.max(1, Math.floor(sideWidth / ARTWORK_SLOT)),
    },
  ]

  const doorways: DoorwayConfig[] = [
    {
      position: [0, DOORWAY_HEIGHT / 2, halfL - WALL_INSET],
      width: DOORWAY_WIDTH,
      height: DOORWAY_HEIGHT,
    },
  ]

  return { walls, doorways }
}

/**
 * Creates a partition wall with two artwork-facing segments.
 * orientation "x" = wall extends along world X axis (faces ±Z)
 * orientation "z" = wall extends along world Z axis (faces ±X)
 */
function createPartition(
  id: string,
  centerX: number,
  centerZ: number,
  partWidth: number,
  height: number,
  orientation: "x" | "z" = "x"
): PartitionWall {
  const ht = PARTITION_THICKNESS / 2
  const cap = Math.max(1, Math.floor(partWidth / ARTWORK_SLOT))

  let segA: WallSegment
  let segB: WallSegment

  if (orientation === "x") {
    segA = {
      id: `${id}-a`,
      position: [centerX, height / 2, centerZ + ht],
      rotation: [0, 0, 0],
      width: partWidth,
      height,
      capacity: cap,
    }
    segB = {
      id: `${id}-b`,
      position: [centerX, height / 2, centerZ - ht],
      rotation: [0, Math.PI, 0],
      width: partWidth,
      height,
      capacity: cap,
    }
  } else {
    segA = {
      id: `${id}-a`,
      position: [centerX + ht, height / 2, centerZ],
      rotation: [0, -Math.PI / 2, 0],
      width: partWidth,
      height,
      capacity: cap,
    }
    segB = {
      id: `${id}-b`,
      position: [centerX - ht, height / 2, centerZ],
      rotation: [0, Math.PI / 2, 0],
      width: partWidth,
      height,
      capacity: cap,
    }
  }

  return {
    id,
    position: [centerX, height / 2, centerZ],
    rotationY: orientation === "x" ? 0 : Math.PI / 2,
    width: partWidth,
    height,
    thickness: PARTITION_THICKNESS,
    segments: [segA, segB],
  }
}

function buildLayout(
  walls: WallSegment[],
  partitions: PartitionWall[],
  doorways: DoorwayConfig[],
  room: { width: number; length: number; height: number }
): GeneratedLayout {
  const allSegments = [
    ...walls,
    ...partitions.flatMap((p) => p.segments),
  ]
  return { room, outerWalls: walls, partitions, doorways, allSegments }
}

// ---------------------------------------------------------------------------
// Layout: Intime  (1-10 artworks)
// ---------------------------------------------------------------------------

function generateIntime(artworkCount: number): GeneratedLayout {
  const n = clamp(artworkCount, 1, 10)
  const width = lerp(7, 10, (n - 1) / 9)
  const length = lerp(8, 12, (n - 1) / 9)
  const height = 3.5
  const { walls, doorways } = createOuterWalls(width, length, height)
  return buildLayout(walls, [], doorways, { width, length, height })
}

// ---------------------------------------------------------------------------
// Layout: Classique  (10-30 artworks)
// Zigzag partitions from alternating walls
// ---------------------------------------------------------------------------

function generateClassique(artworkCount: number): GeneratedLayout {
  const n = clamp(artworkCount, 10, 30)
  const t = (n - 10) / 20

  const width = lerp(12, 16, t)
  const length = lerp(16, 26, t)
  const height = 3.5

  const { walls, doorways } = createOuterWalls(width, length, height)

  const numParts = clamp(Math.ceil(n / 8), 1, 4)
  const halfW = width / 2
  const halfL = length / 2
  const partLength = width * 0.55
  const spacing = length / (numParts + 1)

  const partitions: PartitionWall[] = []
  for (let i = 0; i < numParts; i++) {
    const fromLeft = i % 2 === 0
    const zPos = -halfL + spacing * (i + 1)
    const cx = fromLeft
      ? -halfW + WALL_INSET + partLength / 2
      : halfW - WALL_INSET - partLength / 2

    partitions.push(createPartition(`p${i}`, cx, zPos, partLength, height, "x"))
  }

  return buildLayout(walls, partitions, doorways, { width, length, height })
}

// ---------------------------------------------------------------------------
// Layout: Contemporaine  (20-60 artworks)
// Zigzag + island (floating) partitions
// ---------------------------------------------------------------------------

function generateContemporaine(artworkCount: number): GeneratedLayout {
  const n = clamp(artworkCount, 20, 60)
  const t = (n - 20) / 40

  const width = lerp(16, 22, t)
  const length = lerp(22, 38, t)
  const height = 4.0

  const { walls, doorways } = createOuterWalls(width, length, height)

  const halfW = width / 2
  const halfL = length / 2

  const numZigzag = clamp(Math.ceil(n / 10), 2, 6)
  const numIslands = clamp(Math.floor(n / 25), 0, 3)
  const zigzagLength = width * 0.5
  const islandLength = width * 0.3
  const zigzagSpacing = length / (numZigzag + 1)

  const partitions: PartitionWall[] = []

  for (let i = 0; i < numZigzag; i++) {
    const fromLeft = i % 2 === 0
    const zPos = -halfL + zigzagSpacing * (i + 1)
    const cx = fromLeft
      ? -halfW + WALL_INSET + zigzagLength / 2
      : halfW - WALL_INSET - zigzagLength / 2

    partitions.push(
      createPartition(`p${i}`, cx, zPos, zigzagLength, height, "x")
    )
  }

  for (let i = 0; i < numIslands; i++) {
    const zPos = -halfL + length * ((i + 1) / (numIslands + 1))
    partitions.push(
      createPartition(`island${i}`, 0, zPos, islandLength, height, "z")
    )
  }

  return buildLayout(walls, partitions, doorways, { width, length, height })
}

// ---------------------------------------------------------------------------
// Layout: Monumentale  (40-100 artworks)
// Grid pattern: perpendicular bays + central parallel partitions
// ---------------------------------------------------------------------------

function generateMonumentale(artworkCount: number): GeneratedLayout {
  const n = clamp(artworkCount, 40, 100)
  const t = (n - 40) / 60

  const width = lerp(20, 26, t)
  const length = lerp(30, 52, t)
  const height = 4.5

  const { walls, doorways } = createOuterWalls(width, length, height)

  const halfW = width / 2
  const halfL = length / 2

  const numPerp = clamp(Math.ceil(n / 12), 3, 8)
  const numParallel = clamp(Math.floor(n / 30), 1, 4)
  const perpLength = width * 0.38
  const parallelLength = length * 0.22
  const perpSpacing = length / (numPerp + 1)

  const partitions: PartitionWall[] = []

  for (let i = 0; i < numPerp; i++) {
    const fromLeft = i % 2 === 0
    const zPos = -halfL + perpSpacing * (i + 1)
    const cx = fromLeft
      ? -halfW + WALL_INSET + perpLength / 2
      : halfW - WALL_INSET - perpLength / 2

    partitions.push(
      createPartition(`p${i}`, cx, zPos, perpLength, height, "x")
    )
  }

  const parallelSpacing = width / (numParallel + 1)
  for (let i = 0; i < numParallel; i++) {
    const xPos = -halfW + parallelSpacing * (i + 1)
    partitions.push(
      createPartition(`c${i}`, xPos, 0, parallelLength, height, "z")
    )
  }

  return buildLayout(walls, partitions, doorways, { width, length, height })
}

// ---------------------------------------------------------------------------
// Registry
// ---------------------------------------------------------------------------

const layoutGenerators: Record<LayoutId, (n: number) => GeneratedLayout> = {
  intime: generateIntime,
  classique: generateClassique,
  contemporaine: generateContemporaine,
  monumentale: generateMonumentale,
}

export const LAYOUT_DEFINITIONS: LayoutDefinition[] = [
  {
    id: "intime",
    name: "Intime",
    description: "Salle unique, idéale pour une sélection raffinée",
    minArtworks: 1,
    maxArtworks: 10,
    generate: generateIntime,
  },
  {
    id: "classique",
    name: "Classique",
    description: "Galerie avec alcôves, parcours en zigzag élégant",
    minArtworks: 10,
    maxArtworks: 30,
    generate: generateClassique,
  },
  {
    id: "contemporaine",
    name: "Contemporaine",
    description: "Grand espace ouvert avec cloisons libres",
    minArtworks: 20,
    maxArtworks: 60,
    generate: generateContemporaine,
  },
  {
    id: "monumentale",
    name: "Monumentale",
    description: "Vaste musée avec parcours guidé",
    minArtworks: 40,
    maxArtworks: 100,
    generate: generateMonumentale,
  },
]

/**
 * Generates a layout from an id and artwork count.
 * Falls back to the best-fit layout if the count is outside the chosen layout's range.
 */
export function generateLayout(
  layoutId: LayoutId,
  artworkCount: number
): GeneratedLayout {
  const gen = layoutGenerators[layoutId]
  if (!gen) return generateIntime(artworkCount)
  return gen(artworkCount)
}

/**
 * Picks the best layout for a given artwork count.
 */
export function suggestLayout(artworkCount: number): LayoutId {
  if (artworkCount <= 10) return "intime"
  if (artworkCount <= 30) return "classique"
  if (artworkCount <= 60) return "contemporaine"
  return "monumentale"
}
