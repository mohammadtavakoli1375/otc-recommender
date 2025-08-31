-- CreateTable
CREATE TABLE "medications" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "drugName" TEXT NOT NULL,
    "form" TEXT,
    "strength" TEXT,
    "notes" TEXT,
    "startAt" DATETIME NOT NULL,
    "endAt" DATETIME,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Tehran',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medications_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medication_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicationId" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "times" JSONB,
    "intervalHrs" INTEGER,
    "maxPerDay" INTEGER,
    "quietHours" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medication_schedules_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medication_adherence" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "medicationId" TEXT NOT NULL,
    "dueAt" DATETIME NOT NULL,
    "takenAt" DATETIME,
    "status" TEXT NOT NULL,
    "channel" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medication_adherence_medicationId_fkey" FOREIGN KEY ("medicationId") REFERENCES "medications" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "medications_userId_idx" ON "medications"("userId");

-- CreateIndex
CREATE INDEX "medications_startAt_idx" ON "medications"("startAt");

-- CreateIndex
CREATE INDEX "medication_schedules_medicationId_idx" ON "medication_schedules"("medicationId");

-- CreateIndex
CREATE INDEX "medication_adherence_medicationId_idx" ON "medication_adherence"("medicationId");

-- CreateIndex
CREATE INDEX "medication_adherence_dueAt_idx" ON "medication_adherence"("dueAt");

-- CreateIndex
CREATE INDEX "medication_adherence_status_idx" ON "medication_adherence"("status");
