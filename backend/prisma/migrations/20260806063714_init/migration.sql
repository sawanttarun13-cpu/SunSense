-- CreateEnum
CREATE TYPE "RiskLevel" AS ENUM ('LOW', 'MODERATE', 'HIGH', 'VERY_HIGH', 'EXTREME');

-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('BURN_WARNING', 'REAPPLY_SUNSCREEN', 'DAILY_LIMIT', 'OFFLINE_SYNC', 'BATTERY_LOW');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SUCCESS', 'PARTIAL', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "password_hash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(255),
    "skin_type" SMALLINT NOT NULL,
    "preferred_spf" SMALLINT NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "devices" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "firmware_version" VARCHAR(50),
    "battery_level" SMALLINT,
    "wifi_ssid" VARCHAR(255),
    "ip_address" VARCHAR(50),
    "last_ping" TIMESTAMP(6),
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "device_tokens" (
    "device_id" UUID NOT NULL,
    "api_key_hash" VARCHAR(255) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_used_at" TIMESTAMP(6),

    CONSTRAINT "device_tokens_pkey" PRIMARY KEY ("device_id")
);

-- CreateTable
CREATE TABLE "uv_readings" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "uv_index" DECIMAL(4,2) NOT NULL,
    "recorded_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uv_readings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "exposure_sessions" (
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "start_time" TIMESTAMP(6) NOT NULL,
    "end_time" TIMESTAMP(6) NOT NULL,
    "duration_seconds" INTEGER NOT NULL,
    "average_uv_index" DECIMAL(4,2) NOT NULL,
    "accumulated_sed" DECIMAL(6,2) NOT NULL,
    "calculated_risk" "RiskLevel" NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "exposure_sessions_pkey" PRIMARY KEY ("session_id")
);

-- CreateTable
CREATE TABLE "sunscreen_applications" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "applied_spf" SMALLINT NOT NULL,
    "applied_at" TIMESTAMP(6) NOT NULL,
    "expires_at" TIMESTAMP(6) NOT NULL,
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sunscreen_applications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alerts" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "type" "AlertType" NOT NULL,
    "message" TEXT NOT NULL,
    "triggered_at" TIMESTAMP(6) NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "is_dismissed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "user_id" UUID NOT NULL,
    "alert_threshold" DECIMAL(4,2) NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "notification_preferences" (
    "user_id" UUID NOT NULL,
    "email_notifications" BOOLEAN NOT NULL DEFAULT true,
    "push_notifications" BOOLEAN NOT NULL DEFAULT true,
    "smart_alert_preferences" JSONB NOT NULL DEFAULT '{}',
    "reminder_preferences" JSONB NOT NULL DEFAULT '{}',
    "quiet_hours_start" TIME NOT NULL,
    "quiet_hours_end" TIME NOT NULL,
    "updated_at" TIMESTAMP(6) NOT NULL,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "device_sync_logs" (
    "id" UUID NOT NULL,
    "device_id" UUID NOT NULL,
    "sync_time" TIMESTAMP(6) NOT NULL,
    "records_uploaded" INTEGER NOT NULL,
    "status" "SyncStatus" NOT NULL,

    CONSTRAINT "device_sync_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "devices_user_id_key" ON "devices"("user_id");

-- CreateIndex
CREATE INDEX "uv_readings_device_id_idx" ON "uv_readings"("device_id");

-- CreateIndex
CREATE INDEX "uv_readings_recorded_at_idx" ON "uv_readings"("recorded_at");

-- CreateIndex
CREATE UNIQUE INDEX "uv_readings_device_id_recorded_at_key" ON "uv_readings"("device_id", "recorded_at");

-- CreateIndex
CREATE INDEX "exposure_sessions_user_id_idx" ON "exposure_sessions"("user_id");

-- CreateIndex
CREATE INDEX "sunscreen_applications_user_id_idx" ON "sunscreen_applications"("user_id");

-- CreateIndex
CREATE INDEX "alerts_user_id_idx" ON "alerts"("user_id");

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_tokens" ADD CONSTRAINT "device_tokens_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "uv_readings" ADD CONSTRAINT "uv_readings_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exposure_sessions" ADD CONSTRAINT "exposure_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "exposure_sessions" ADD CONSTRAINT "exposure_sessions_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sunscreen_applications" ADD CONSTRAINT "sunscreen_applications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alerts" ADD CONSTRAINT "alerts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "settings" ADD CONSTRAINT "settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "device_sync_logs" ADD CONSTRAINT "device_sync_logs_device_id_fkey" FOREIGN KEY ("device_id") REFERENCES "devices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
