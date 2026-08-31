-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "AlertType" ADD VALUE 'HIGH_RISK';
ALTER TYPE "AlertType" ADD VALUE 'EXTREME_UV';
ALTER TYPE "AlertType" ADD VALUE 'RAPID_UV_INCREASE';

-- AlterTable
ALTER TABLE "alerts" ADD COLUMN     "reference_id" VARCHAR(255);

-- CreateIndex
CREATE UNIQUE INDEX "alerts_user_id_type_reference_id_key" ON "alerts"("user_id", "type", "reference_id");

