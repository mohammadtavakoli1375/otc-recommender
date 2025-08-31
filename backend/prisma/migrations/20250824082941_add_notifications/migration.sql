-- CreateTable
CREATE TABLE "reminder_deliveries" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "reminder_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'SCHEDULED',
    "scheduled_at" DATETIME NOT NULL,
    "sent_at" DATETIME,
    "failed_at" DATETIME,
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "max_retries" INTEGER NOT NULL DEFAULT 3,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "push_subscription_id" TEXT,
    "phone_number" TEXT,
    "email_address" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "reminder_deliveries_reminder_id_fkey" FOREIGN KEY ("reminder_id") REFERENCES "reminders" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminder_deliveries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reminder_deliveries_push_subscription_id_fkey" FOREIGN KEY ("push_subscription_id") REFERENCES "push_subscriptions" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "push_subscriptions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "user_agent" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "push_subscriptions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "role" TEXT NOT NULL DEFAULT 'VIEWER',
    "phone" TEXT,
    "phone_verified" BOOLEAN NOT NULL DEFAULT false,
    "notification_preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_users" ("createdAt", "email", "id", "password", "role", "updatedAt") SELECT "createdAt", "email", "id", "password", "role", "updatedAt" FROM "users";
DROP TABLE "users";
ALTER TABLE "new_users" RENAME TO "users";
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "users_email_idx" ON "users"("email");
CREATE INDEX "users_role_idx" ON "users"("role");
CREATE INDEX "users_phone_idx" ON "users"("phone");
CREATE INDEX "users_createdAt_idx" ON "users"("createdAt");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "reminder_deliveries_reminder_id_idx" ON "reminder_deliveries"("reminder_id");

-- CreateIndex
CREATE INDEX "reminder_deliveries_user_id_idx" ON "reminder_deliveries"("user_id");

-- CreateIndex
CREATE INDEX "reminder_deliveries_channel_idx" ON "reminder_deliveries"("channel");

-- CreateIndex
CREATE INDEX "reminder_deliveries_status_idx" ON "reminder_deliveries"("status");

-- CreateIndex
CREATE INDEX "reminder_deliveries_scheduled_at_idx" ON "reminder_deliveries"("scheduled_at");

-- CreateIndex
CREATE INDEX "push_subscriptions_user_id_idx" ON "push_subscriptions"("user_id");

-- CreateIndex
CREATE INDEX "push_subscriptions_is_active_idx" ON "push_subscriptions"("is_active");

-- CreateIndex
CREATE UNIQUE INDEX "push_subscriptions_user_id_endpoint_key" ON "push_subscriptions"("user_id", "endpoint");

-- CreateIndex
CREATE INDEX "drugs_generic_name_idx" ON "drugs"("generic_name");

-- CreateIndex
CREATE INDEX "drugs_name_fa_idx" ON "drugs"("name_fa");

-- CreateIndex
CREATE INDEX "drugs_atc_code_idx" ON "drugs"("atc_code");

-- CreateIndex
CREATE INDEX "drugs_createdAt_idx" ON "drugs"("createdAt");

-- CreateIndex
CREATE INDEX "patient_profiles_user_id_idx" ON "patient_profiles"("user_id");
