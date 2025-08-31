/*
  Warnings:

  - A unique constraint covering the columns `[generic_name]` on the table `drugs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "patient_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATETIME NOT NULL,
    "gender" TEXT NOT NULL,
    "weight_kg" REAL NOT NULL,
    "height_cm" REAL,
    "phone" TEXT,
    "emergency_contact" TEXT,
    "blood_type" TEXT,
    "allergies" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "patient_profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medical_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_profile_id" TEXT NOT NULL,
    "condition_name" TEXT NOT NULL,
    "condition_type" TEXT NOT NULL,
    "diagnosed_date" DATETIME,
    "is_chronic" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medical_history_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "medication_history" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_profile_id" TEXT NOT NULL,
    "drug_id" TEXT,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "frequency" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "is_current" BOOLEAN NOT NULL DEFAULT true,
    "prescribed_by" TEXT,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "medication_history_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "medication_history_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "reminders" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "patient_profile_id" TEXT NOT NULL,
    "medication_history_id" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "medication_name" TEXT NOT NULL,
    "dosage" TEXT NOT NULL,
    "start_date" DATETIME NOT NULL,
    "end_date" DATETIME,
    "frequency_type" TEXT NOT NULL,
    "frequency_value" INTEGER NOT NULL,
    "times_per_day" INTEGER NOT NULL DEFAULT 1,
    "specific_times" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notification_enabled" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reminders_patient_profile_id_fkey" FOREIGN KEY ("patient_profile_id") REFERENCES "patient_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminders_medication_history_id_fkey" FOREIGN KEY ("medication_history_id") REFERENCES "medication_history" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "faqs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question_fa" TEXT NOT NULL,
    "question_en" TEXT,
    "answer_fa" TEXT NOT NULL,
    "answer_en" TEXT,
    "category" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "published_by" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "educational_content" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title_fa" TEXT NOT NULL,
    "title_en" TEXT,
    "content_fa" TEXT NOT NULL,
    "content_en" TEXT,
    "summary_fa" TEXT,
    "summary_en" TEXT,
    "category" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "tags" TEXT,
    "featured_image" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "is_published" BOOLEAN NOT NULL DEFAULT true,
    "published_by" TEXT,
    "published_at" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "patient_profiles_user_id_key" ON "patient_profiles"("user_id");

-- CreateIndex
CREATE INDEX "medical_history_patient_profile_id_idx" ON "medical_history"("patient_profile_id");

-- CreateIndex
CREATE INDEX "medication_history_patient_profile_id_idx" ON "medication_history"("patient_profile_id");

-- CreateIndex
CREATE INDEX "medication_history_drug_id_idx" ON "medication_history"("drug_id");

-- CreateIndex
CREATE INDEX "reminders_patient_profile_id_idx" ON "reminders"("patient_profile_id");

-- CreateIndex
CREATE INDEX "reminders_start_date_idx" ON "reminders"("start_date");

-- CreateIndex
CREATE UNIQUE INDEX "faqs_slug_key" ON "faqs"("slug");

-- CreateIndex
CREATE INDEX "faqs_category_idx" ON "faqs"("category");

-- CreateIndex
CREATE INDEX "faqs_is_published_idx" ON "faqs"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "educational_content_slug_key" ON "educational_content"("slug");

-- CreateIndex
CREATE INDEX "educational_content_category_idx" ON "educational_content"("category");

-- CreateIndex
CREATE INDEX "educational_content_type_idx" ON "educational_content"("type");

-- CreateIndex
CREATE INDEX "educational_content_is_published_idx" ON "educational_content"("is_published");

-- CreateIndex
CREATE UNIQUE INDEX "drugs_generic_name_key" ON "drugs"("generic_name");
