import prisma from "@/lib/prisma"

export async function logAudit(params: {
  userId: string
  action: string
  target: string
  details?: any
  ipAddress?: string
}) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: params.userId,
        action: params.action,
        target: params.target,
        details: params.details || undefined,
        ipAddress: params.ipAddress || undefined,
      }
    })
  } catch (error) {
    console.error("Audit log error:", error)
  }
}
