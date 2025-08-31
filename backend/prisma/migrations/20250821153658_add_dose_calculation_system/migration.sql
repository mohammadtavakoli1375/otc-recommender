-- CreateTable
CREATE TABLE "drugs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name_fa" TEXT NOT NULL,
    "name_en" TEXT NOT NULL,
    "generic_name" TEXT NOT NULL,
    "brand_names" TEXT,
    "atc_code" TEXT,
    "infant_dose_mg_kg" REAL,
    "child_dose_mg_kg" REAL,
    "adult_dose_mg" REAL,
    "max_single_dose_mg" REAL,
    "max_daily_dose_mg" REAL,
    "min_age_months" INTEGER,
    "max_age_years" INTEGER,
    "contraindications" TEXT,
    "drug_interactions" TEXT,
    "warnings" TEXT,
    "dosing_interval_hours" INTEGER NOT NULL DEFAULT 8,
    "max_doses_per_day" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "dose_calculations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "drug_id" TEXT NOT NULL,
    "user_id" TEXT,
    "patient_age_years" REAL NOT NULL,
    "patient_age_months" INTEGER NOT NULL,
    "patient_weight_kg" REAL NOT NULL,
    "age_group" TEXT NOT NULL,
    "calculated_dose_mg" REAL NOT NULL,
    "calculated_dose_ml" REAL,
    "doses_per_day" INTEGER NOT NULL,
    "total_daily_dose_mg" REAL NOT NULL,
    "is_safe" BOOLEAN NOT NULL DEFAULT true,
    "safety_warnings" TEXT,
    "calculation_notes" TEXT,
    "calculated_by" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "dose_calculations_drug_id_fkey" FOREIGN KEY ("drug_id") REFERENCES "drugs" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "dose_calculations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "dose_calculations_drug_id_idx" ON "dose_calculations"("drug_id");

-- CreateIndex
CREATE INDEX "dose_calculations_user_id_idx" ON "dose_calculations"("user_id");

-- CreateIndex
CREATE INDEX "dose_calculations_createdAt_idx" ON "dose_calculations"("createdAt");
