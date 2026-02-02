-- CreateTable
CREATE TABLE "ad_views" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "adType" VARCHAR(20) NOT NULL DEFAULT 'video',
    "adUnitId" VARCHAR(100),
    "provider" VARCHAR(20) NOT NULL DEFAULT 'wechat',
    "status" VARCHAR(20) NOT NULL DEFAULT 'started',
    "rewardQuota" INTEGER NOT NULL DEFAULT 1,
    "rewarded" BOOLEAN NOT NULL DEFAULT false,
    "rewardedAt" TIMESTAMP(3),
    "ip" VARCHAR(50),
    "deviceId" VARCHAR(100),
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ad_views_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ad_daily_stats" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "date" VARCHAR(10) NOT NULL,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "rewardCount" INTEGER NOT NULL DEFAULT 0,
    "totalRewardQuota" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ad_daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ad_views_userId_idx" ON "ad_views"("userId");

-- CreateIndex
CREATE INDEX "ad_views_status_idx" ON "ad_views"("status");

-- CreateIndex
CREATE INDEX "ad_views_createdAt_idx" ON "ad_views"("createdAt");

-- CreateIndex
CREATE INDEX "ad_daily_stats_userId_idx" ON "ad_daily_stats"("userId");

-- CreateIndex
CREATE INDEX "ad_daily_stats_date_idx" ON "ad_daily_stats"("date");

-- CreateIndex
CREATE UNIQUE INDEX "ad_daily_stats_userId_date_key" ON "ad_daily_stats"("userId", "date");

-- AddForeignKey
ALTER TABLE "ad_views" ADD CONSTRAINT "ad_views_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
