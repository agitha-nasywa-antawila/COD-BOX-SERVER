-- AlterTable
ALTER TABLE "Device" ADD COLUMN     "token" TEXT,
ADD COLUMN     "tokenExpiredAt" TIMESTAMP(3);
