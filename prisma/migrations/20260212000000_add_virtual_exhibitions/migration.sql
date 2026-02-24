-- CreateTable
CREATE TABLE "virtual_exhibitions" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "slug" TEXT NOT NULL,
    "theme" TEXT NOT NULL DEFAULT 'white',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "roomConfig" JSONB,
    "coverImage" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "views" INTEGER NOT NULL DEFAULT 0,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "virtual_exhibitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "virtual_exhibition_artworks" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "wall" TEXT NOT NULL,
    "positionX" DOUBLE PRECISION NOT NULL,
    "positionY" DOUBLE PRECISION NOT NULL,
    "scale" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "virtual_exhibition_artworks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exhibition_analytics" (
    "id" TEXT NOT NULL,
    "exhibitionId" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT NOT NULL,
    "enteredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "exitedAt" TIMESTAMP(3),
    "duration" INTEGER,
    "artworkClicks" JSONB,
    "cartAdds" JSONB,
    "device" TEXT,
    "source" TEXT,

    CONSTRAINT "exhibition_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "virtual_exhibitions_slug_key" ON "virtual_exhibitions"("slug");

-- CreateIndex
CREATE INDEX "virtual_exhibitions_createdById_idx" ON "virtual_exhibitions"("createdById");

-- CreateIndex
CREATE INDEX "virtual_exhibitions_status_idx" ON "virtual_exhibitions"("status");

-- CreateIndex
CREATE INDEX "virtual_exhibitions_slug_idx" ON "virtual_exhibitions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "virtual_exhibition_artworks_exhibitionId_artworkId_key" ON "virtual_exhibition_artworks"("exhibitionId", "artworkId");

-- CreateIndex
CREATE INDEX "virtual_exhibition_artworks_exhibitionId_idx" ON "virtual_exhibition_artworks"("exhibitionId");

-- CreateIndex
CREATE INDEX "exhibition_analytics_exhibitionId_idx" ON "exhibition_analytics"("exhibitionId");

-- CreateIndex
CREATE INDEX "exhibition_analytics_userId_idx" ON "exhibition_analytics"("userId");

-- CreateIndex
CREATE INDEX "exhibition_analytics_enteredAt_idx" ON "exhibition_analytics"("enteredAt");

-- AddForeignKey
ALTER TABLE "virtual_exhibitions" ADD CONSTRAINT "virtual_exhibitions_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_exhibition_artworks" ADD CONSTRAINT "virtual_exhibition_artworks_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "virtual_exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "virtual_exhibition_artworks" ADD CONSTRAINT "virtual_exhibition_artworks_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_analytics" ADD CONSTRAINT "exhibition_analytics_exhibitionId_fkey" FOREIGN KEY ("exhibitionId") REFERENCES "virtual_exhibitions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exhibition_analytics" ADD CONSTRAINT "exhibition_analytics_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
