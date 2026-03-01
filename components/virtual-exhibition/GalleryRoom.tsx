import * as THREE from "three"
import type { ThemeId } from "@/lib/virtual-exhibition/types"
import type { GeneratedLayout } from "@/lib/virtual-exhibition/types"

const WALL_THICKNESS = 0.2
const BASEBOARD_HEIGHT = 0.12

export const themeColors: Record<
  ThemeId,
  {
    wall: string
    floor: string
    ceiling: string
    baseboard: string
    edge: string
    partition: string
    wallRoughness: number
    floorRoughness: number
    floorMetalness: number
    ceilingRoughness: number
    ceilingMetalness: number
  }
> = {
  white: {
    wall: "#f8f7f5",
    floor: "#e8e6e2",
    ceiling: "#fafafa",
    baseboard: "#e0deda",
    edge: "#e0deda",
    partition: "#f0eeeb",
    wallRoughness: 0.92,
    floorRoughness: 0.85,
    floorMetalness: 0,
    ceilingRoughness: 0.88,
    ceilingMetalness: 0,
  },
  dark: {
    wall: "#1a1a1a",
    floor: "#252525",
    ceiling: "#161616",
    baseboard: "#2a2a2a",
    edge: "#333333",
    partition: "#222222",
    wallRoughness: 0.85,
    floorRoughness: 0.5,
    floorMetalness: 0.08,
    ceilingRoughness: 0.85,
    ceilingMetalness: 0,
  },
  concrete: {
    wall: "#8c8c88",
    floor: "#7a7a76",
    ceiling: "#9a9a96",
    baseboard: "#6a6a66",
    edge: "#6a6a66",
    partition: "#858581",
    wallRoughness: 0.95,
    floorRoughness: 0.8,
    floorMetalness: 0,
    ceilingRoughness: 0.92,
    ceilingMetalness: 0,
  },
  wood: {
    wall: "#f5f0e8",
    floor: "#a07850",
    ceiling: "#f8f4ee",
    baseboard: "#8a6a45",
    edge: "#8a6a45",
    partition: "#f0ebe4",
    wallRoughness: 0.88,
    floorRoughness: 0.75,
    floorMetalness: 0,
    ceilingRoughness: 0.88,
    ceilingMetalness: 0,
  },
}

interface GalleryRoomProps {
  theme: ThemeId
  layout: GeneratedLayout
}

export default function GalleryRoom({ theme, layout }: GalleryRoomProps) {
  const { room, outerWalls, partitions, doorways } = layout
  const { width, length, height } = room
  const colors = themeColors[theme]

  const wallMat = {
    color: colors.wall,
    roughness: colors.wallRoughness,
    metalness: 0,
    side: THREE.DoubleSide as THREE.Side,
  }

  const halfW = width / 2
  const halfL = length / 2
  const wallInset = WALL_THICKNESS / 2
  const doorway = doorways[0]
  const doorW = doorway?.width ?? 2
  const doorH = doorway?.height ?? 2.8
  const sideWidth = (width - doorW) / 2
  const topAboveDoor = height - doorH

  return (
    <group>
      {/* ===== OUTER WALLS ===== */}

      {/* North wall */}
      <mesh position={[0, height / 2, -halfL + wallInset]} receiveShadow castShadow>
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* South wall — left */}
      <mesh
        position={[-halfW + sideWidth / 2, height / 2, halfL - wallInset]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[sideWidth, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* South wall — right */}
      <mesh
        position={[halfW - sideWidth / 2, height / 2, halfL - wallInset]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[sideWidth, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* South wall — above doorway */}
      {topAboveDoor > 0 && (
        <mesh
          position={[0, doorH + topAboveDoor / 2, halfL - wallInset]}
          rotation={[0, Math.PI, 0]}
          receiveShadow
          castShadow
        >
          <planeGeometry args={[doorW, topAboveDoor]} />
          <meshStandardMaterial {...wallMat} />
        </mesh>
      )}

      {/* East wall */}
      <mesh
        position={[halfW - wallInset, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* West wall */}
      <mesh
        position={[-halfW + wallInset, height / 2, 0]}
        rotation={[0, Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ===== FLOOR ===== */}
      <mesh position={[0, 0, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color={colors.floor}
          roughness={colors.floorRoughness}
          metalness={colors.floorMetalness}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== CEILING ===== */}
      <mesh position={[0, height, 0]} rotation={[Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color={colors.ceiling}
          roughness={colors.ceilingRoughness}
          metalness={colors.ceilingMetalness}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== OUTER BASEBOARDS ===== */}
      <mesh position={[0, BASEBOARD_HEIGHT / 2, -halfL + wallInset]} receiveShadow>
        <boxGeometry args={[width, BASEBOARD_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={colors.baseboard} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-halfW + sideWidth / 2, BASEBOARD_HEIGHT / 2, halfL - wallInset]} receiveShadow>
        <boxGeometry args={[sideWidth, BASEBOARD_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={colors.baseboard} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[halfW - sideWidth / 2, BASEBOARD_HEIGHT / 2, halfL - wallInset]} receiveShadow>
        <boxGeometry args={[sideWidth, BASEBOARD_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial color={colors.baseboard} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[halfW - wallInset, BASEBOARD_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, BASEBOARD_HEIGHT, length]} />
        <meshStandardMaterial color={colors.baseboard} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-halfW + wallInset, BASEBOARD_HEIGHT / 2, 0]} receiveShadow>
        <boxGeometry args={[WALL_THICKNESS, BASEBOARD_HEIGHT, length]} />
        <meshStandardMaterial color={colors.baseboard} roughness={0.9} side={THREE.DoubleSide} />
      </mesh>

      {/* ===== CORNERS ===== */}
      {[
        [-halfW + 0.01, -halfL + 0.01],
        [halfW - 0.01, -halfL + 0.01],
        [-halfW + 0.01, halfL - 0.01],
        [halfW - 0.01, halfL - 0.01],
      ].map(([cx, cz], i) => (
        <mesh key={`corner-${i}`} position={[cx, height / 2, cz]}>
          <boxGeometry args={[0.06, height, 0.06]} />
          <meshStandardMaterial color={colors.edge} roughness={0.7} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {/* ===== CROWN MOLDINGS ===== */}
      <mesh position={[0, height - 0.02, -halfL + wallInset]}>
        <boxGeometry args={[width, 0.04, WALL_THICKNESS]} />
        <meshStandardMaterial color={colors.edge} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[halfW - wallInset, height - 0.02, 0]}>
        <boxGeometry args={[WALL_THICKNESS, 0.04, length]} />
        <meshStandardMaterial color={colors.edge} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-halfW + wallInset, height - 0.02, 0]}>
        <boxGeometry args={[WALL_THICKNESS, 0.04, length]} />
        <meshStandardMaterial color={colors.edge} roughness={0.7} side={THREE.DoubleSide} />
      </mesh>

      {/* ===== PARTITION WALLS ===== */}
      {partitions.map((part) => (
        <group key={part.id}>
          <mesh
            position={part.position}
            rotation={[0, part.rotationY, 0]}
            receiveShadow
            castShadow
          >
            <boxGeometry args={[part.width, part.height, part.thickness]} />
            <meshStandardMaterial
              color={colors.partition}
              roughness={colors.wallRoughness}
              metalness={0}
              side={THREE.DoubleSide}
            />
          </mesh>

          {/* Partition baseboard */}
          <mesh
            position={[part.position[0], BASEBOARD_HEIGHT / 2, part.position[2]]}
            rotation={[0, part.rotationY, 0]}
            receiveShadow
          >
            <boxGeometry args={[part.width + 0.04, BASEBOARD_HEIGHT, part.thickness + 0.04]} />
            <meshStandardMaterial color={colors.baseboard} roughness={0.9} side={THREE.DoubleSide} />
          </mesh>

          {/* Partition cap (top edge) */}
          <mesh
            position={[part.position[0], part.height - 0.015, part.position[2]]}
            rotation={[0, part.rotationY, 0]}
          >
            <boxGeometry args={[part.width + 0.02, 0.03, part.thickness + 0.02]} />
            <meshStandardMaterial color={colors.edge} roughness={0.7} side={THREE.DoubleSide} />
          </mesh>
        </group>
      ))}
    </group>
  )
}
