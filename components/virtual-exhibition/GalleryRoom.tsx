import * as THREE from "three"

const WALL_THICKNESS = 0.2
const DOORWAY_WIDTH = 2
const DOORWAY_HEIGHT = 2.8
const BASEBOARD_HEIGHT = 0.1

type Theme = "white" | "dark"

interface GalleryRoomProps {
  theme: Theme
  roomConfig?: {
    width?: number
    length?: number
    height?: number
  }
}

const themeColors = {
  white: {
    wall: "#e8e4de",
    floor: "#b89b78",
    ceiling: "#f5f5f0",
    baseboard: "#6b5a45",
    edge: "#c8c0b4",
    wallRoughness: 0.9,
    floorRoughness: 0.85,
    floorMetalness: 0.02,
    ceilingRoughness: 0.8,
    ceilingMetalness: 0,
  },
  dark: {
    wall: "#1e1e1e",
    floor: "#2a2a2a",
    ceiling: "#111111",
    baseboard: "#0d0d0d",
    edge: "#333333",
    wallRoughness: 0.8,
    floorRoughness: 0.4,
    floorMetalness: 0.1,
    ceilingRoughness: 0.8,
    ceilingMetalness: 0,
  },
}

export default function GalleryRoom({ theme, roomConfig }: GalleryRoomProps) {
  const width = roomConfig?.width ?? 8
  const length = roomConfig?.length ?? 10
  const height = roomConfig?.height ?? 3.5

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

  const leftWallWidth = (width - DOORWAY_WIDTH) / 2
  const leftWallCenterX = -halfW + leftWallWidth / 2
  const rightWallCenterX = halfW - leftWallWidth / 2

  const topAboveDoor = height - DOORWAY_HEIGHT
  const topAboveDoorY = DOORWAY_HEIGHT + topAboveDoor / 2

  return (
    <group>
      {/* ===== NORTH WALL — planeGeometry facing +Z (toward room center) ===== */}
      <mesh
        position={[0, height / 2, -halfL + wallInset]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[width, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ===== SOUTH WALL — left piece, facing -Z ===== */}
      <mesh
        position={[leftWallCenterX, height / 2, halfL - wallInset]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[leftWallWidth, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ===== SOUTH WALL — right piece, facing -Z ===== */}
      <mesh
        position={[rightWallCenterX, height / 2, halfL - wallInset]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[leftWallWidth, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ===== SOUTH WALL — piece above doorway ===== */}
      <mesh
        position={[0, topAboveDoorY, halfL - wallInset]}
        rotation={[0, Math.PI, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[DOORWAY_WIDTH, topAboveDoor]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ===== EAST WALL — facing -X (toward room center) ===== */}
      <mesh
        position={[halfW - wallInset, height / 2, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[length, height]} />
        <meshStandardMaterial {...wallMat} />
      </mesh>

      {/* ===== WEST WALL — facing +X (toward room center) ===== */}
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
      <mesh
        position={[0, 0, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        receiveShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color={colors.floor}
          roughness={colors.floorRoughness}
          metalness={colors.floorMetalness}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== CEILING ===== */}
      <mesh
        position={[0, height, 0]}
        rotation={[Math.PI / 2, 0, 0]}
        receiveShadow
        castShadow
      >
        <planeGeometry args={[width, length]} />
        <meshStandardMaterial
          color={colors.ceiling}
          roughness={colors.ceilingRoughness}
          metalness={colors.ceilingMetalness}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== BASEBOARDS ===== */}
      <mesh
        position={[0, BASEBOARD_HEIGHT / 2, -halfL + wallInset]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[width, BASEBOARD_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial
          color={colors.baseboard}
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[leftWallCenterX, BASEBOARD_HEIGHT / 2, halfL - wallInset]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[leftWallWidth, BASEBOARD_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial
          color={colors.baseboard}
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[rightWallCenterX, BASEBOARD_HEIGHT / 2, halfL - wallInset]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[leftWallWidth, BASEBOARD_HEIGHT, WALL_THICKNESS]} />
        <meshStandardMaterial
          color={colors.baseboard}
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[halfW - wallInset, BASEBOARD_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[WALL_THICKNESS, BASEBOARD_HEIGHT, length]} />
        <meshStandardMaterial
          color={colors.baseboard}
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      <mesh
        position={[-halfW + wallInset, BASEBOARD_HEIGHT / 2, 0]}
        receiveShadow
        castShadow
      >
        <boxGeometry args={[WALL_THICKNESS, BASEBOARD_HEIGHT, length]} />
        <meshStandardMaterial
          color={colors.baseboard}
          roughness={0.9}
          metalness={0}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ===== CORNER EDGES ===== */}
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
    </group>
  )
}
