-- CreateTable
CREATE TABLE "symptoms" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "name_fa" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "conditions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "title_fa" TEXT NOT NULL,
    "title_en" TEXT NOT NULL,
    "education_md" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "atc" TEXT,
    "rxnorm" TEXT,
    "otc_bool" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "protocols" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "condition_id" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "rules_jsonb" JSONB NOT NULL,
    "created_by" TEXT NOT NULL,
    "published_at" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "protocols_condition_id_fkey" FOREIGN KEY ("condition_id") REFERENCES "conditions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "protocols_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "recommendations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "protocol_id" TEXT NOT NULL,
    "ingredient_id" TEXT NOT NULL,
    "age_min" INTEGER,
    "age_max" INTEGER,
    "max_days" INTEGER,
    "dose_note" TEXT,
    "rationale_md" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recommendations_protocol_id_fkey" FOREIGN KEY ("protocol_id") REFERENCES "protocols" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "recommendations_ingredient_id_fkey" FOREIGN KEY ("ingredient_id") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "symptoms_code_key" ON "symptoms"("code");

-- CreateIndex
CREATE UNIQUE INDEX "conditions_slug_key" ON "conditions"("slug");

-- CreateIndex
CREATE INDEX "conditions_slug_idx" ON "conditions"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "protocols_condition_id_version_idx" ON "protocols"("condition_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "protocols_condition_id_version_key" ON "protocols"("condition_id", "version");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
