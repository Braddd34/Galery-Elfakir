export type LayoutId = "intime" | "classique" | "contemporaine" | "monumentale"
export type ThemeId = "white" | "dark" | "concrete" | "wood"

export const LAYOUT_IDS: LayoutId[] = ["intime", "classique", "contemporaine", "monumentale"]
export const THEME_IDS: ThemeId[] = ["white", "dark", "concrete", "wood"]

export interface WallSegment {
  id: string
  position: [number, number, number]
  rotation: [number, number, number]
  width: number
  height: number
  capacity: number
}

export interface PartitionWall {
  id: string
  position: [number, number, number]
  rotationY: number
  width: number
  height: number
  thickness: number
  segments: [WallSegment, WallSegment]
}

export interface DoorwayConfig {
  position: [number, number, number]
  width: number
  height: number
}

export interface GeneratedLayout {
  room: { width: number; length: number; height: number }
  outerWalls: WallSegment[]
  partitions: PartitionWall[]
  doorways: DoorwayConfig[]
  allSegments: WallSegment[]
}

export interface LayoutDefinition {
  id: LayoutId
  name: string
  description: string
  minArtworks: number
  maxArtworks: number
  generate(artworkCount: number): GeneratedLayout
}

export interface PlacedArtwork {
  artworkIndex: number
  segmentId: string
  positionX: number
  positionY: number
  scale: number
}

export const LAYOUT_META: Record<LayoutId, { name: string; description: string; range: string }> = {
  intime: {
    name: "Intime",
    description: "Salle unique, idéale pour une sélection raffinée",
    range: "1 – 10 œuvres",
  },
  classique: {
    name: "Classique",
    description: "Galerie avec alcôves, parcours en zigzag élégant",
    range: "10 – 30 œuvres",
  },
  contemporaine: {
    name: "Contemporaine",
    description: "Grand espace ouvert avec cloisons libres",
    range: "20 – 60 œuvres",
  },
  monumentale: {
    name: "Monumentale",
    description: "Vaste musée avec parcours guidé",
    range: "40 – 100 œuvres",
  },
}

export const THEME_META: Record<ThemeId, { name: string; description: string; accent: string }> = {
  white: {
    name: "Blanc Classique",
    description: "Murs blanc cassé, parquet clair, lumière naturelle",
    accent: "#e8e4de",
  },
  dark: {
    name: "Noir Contemporain",
    description: "Murs sombres, béton poli, spots dramatiques",
    accent: "#1e1e1e",
  },
  concrete: {
    name: "Béton Brut",
    description: "Style industriel, murs gris texturés, accents métal",
    accent: "#8a8a8a",
  },
  wood: {
    name: "Bois & Lumière",
    description: "Murs chauds, sol chêne, éclairage doré",
    accent: "#c4a882",
  },
}
