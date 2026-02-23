import prisma from "@/lib/prisma"

export async function getManagerArtistIds(managerId: string): Promise<string[]> {
  const assignments = await prisma.artistAssignment.findMany({
    where: { managerId },
    select: { artistId: true }
  })
  return assignments.map(a => a.artistId)
}
