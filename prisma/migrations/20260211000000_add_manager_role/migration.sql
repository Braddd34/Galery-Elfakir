-- AlterEnum: Add MANAGER to UserRole
ALTER TYPE "UserRole" ADD VALUE 'MANAGER';

-- CreateTable: artist_assignments
CREATE TABLE "artist_assignments" (
    "id" TEXT NOT NULL,
    "managerId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artist_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "artist_assignments_managerId_idx" ON "artist_assignments"("managerId");

-- CreateIndex
CREATE INDEX "artist_assignments_artistId_idx" ON "artist_assignments"("artistId");

-- CreateIndex
CREATE UNIQUE INDEX "artist_assignments_managerId_artistId_key" ON "artist_assignments"("managerId", "artistId");

-- AddForeignKey
ALTER TABLE "artist_assignments" ADD CONSTRAINT "artist_assignments_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "artist_assignments" ADD CONSTRAINT "artist_assignments_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable: audit_logs
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "details" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "audit_logs_userId_idx" ON "audit_logs"("userId");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_createdAt_idx" ON "audit_logs"("createdAt");

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
