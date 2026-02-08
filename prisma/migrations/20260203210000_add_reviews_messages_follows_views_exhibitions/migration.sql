-- Ajout des champs réseaux sociaux à artist_profiles
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "twitter" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "facebook" TEXT;
ALTER TABLE "artist_profiles" ADD COLUMN IF NOT EXISTS "linkedin" TEXT;

-- Création de la table reviews
CREATE TABLE IF NOT EXISTS "reviews" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "title" TEXT,
    "comment" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- Création de la table messages
CREATE TABLE IF NOT EXISTS "messages" (
    "id" TEXT NOT NULL,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "subject" TEXT,
    "content" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "readAt" TIMESTAMP(3),
    "artworkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- Création de la table follows
CREATE TABLE IF NOT EXISTS "follows" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "follows_pkey" PRIMARY KEY ("id")
);

-- Création de la table artwork_views
CREATE TABLE IF NOT EXISTS "artwork_views" (
    "id" TEXT NOT NULL,
    "artworkId" TEXT NOT NULL,
    "userId" TEXT,
    "ipHash" TEXT,
    "userAgent" TEXT,
    "referrer" TEXT,
    "viewedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "artwork_views_pkey" PRIMARY KEY ("id")
);

-- Création de la table exhibitions
CREATE TABLE IF NOT EXISTS "exhibitions" (
    "id" TEXT NOT NULL,
    "artistId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "location" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "imageUrl" TEXT,
    "link" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exhibitions_pkey" PRIMARY KEY ("id")
);

-- Index pour reviews
CREATE INDEX IF NOT EXISTS "reviews_artworkId_idx" ON "reviews"("artworkId");
CREATE INDEX IF NOT EXISTS "reviews_userId_idx" ON "reviews"("userId");
CREATE UNIQUE INDEX IF NOT EXISTS "reviews_userId_artworkId_key" ON "reviews"("userId", "artworkId");

-- Index pour messages
CREATE INDEX IF NOT EXISTS "messages_senderId_idx" ON "messages"("senderId");
CREATE INDEX IF NOT EXISTS "messages_receiverId_idx" ON "messages"("receiverId");
CREATE INDEX IF NOT EXISTS "messages_read_idx" ON "messages"("read");

-- Index pour follows
CREATE INDEX IF NOT EXISTS "follows_userId_idx" ON "follows"("userId");
CREATE INDEX IF NOT EXISTS "follows_artistId_idx" ON "follows"("artistId");
CREATE UNIQUE INDEX IF NOT EXISTS "follows_userId_artistId_key" ON "follows"("userId", "artistId");

-- Index pour artwork_views
CREATE INDEX IF NOT EXISTS "artwork_views_artworkId_idx" ON "artwork_views"("artworkId");
CREATE INDEX IF NOT EXISTS "artwork_views_userId_idx" ON "artwork_views"("userId");
CREATE INDEX IF NOT EXISTS "artwork_views_viewedAt_idx" ON "artwork_views"("viewedAt");

-- Index pour exhibitions
CREATE INDEX IF NOT EXISTS "exhibitions_artistId_idx" ON "exhibitions"("artistId");

-- Foreign keys pour reviews
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys pour messages
ALTER TABLE "messages" ADD CONSTRAINT "messages_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "messages" ADD CONSTRAINT "messages_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys pour follows
ALTER TABLE "follows" ADD CONSTRAINT "follows_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "follows" ADD CONSTRAINT "follows_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Foreign keys pour artwork_views
ALTER TABLE "artwork_views" ADD CONSTRAINT "artwork_views_artworkId_fkey" FOREIGN KEY ("artworkId") REFERENCES "artworks"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "artwork_views" ADD CONSTRAINT "artwork_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Foreign keys pour exhibitions
ALTER TABLE "exhibitions" ADD CONSTRAINT "exhibitions_artistId_fkey" FOREIGN KEY ("artistId") REFERENCES "artist_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
