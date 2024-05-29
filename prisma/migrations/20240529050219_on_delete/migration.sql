-- DropForeignKey
ALTER TABLE "OrderTimeline" DROP CONSTRAINT "OrderTimeline_orderId_fkey";

-- DropForeignKey
ALTER TABLE "OrderTimeline" DROP CONSTRAINT "OrderTimeline_orderKategoriId_fkey";

-- AlterTable
ALTER TABLE "OrderTimeline" ALTER COLUMN "orderKategoriId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "OrderTimeline" ADD CONSTRAINT "OrderTimeline_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTimeline" ADD CONSTRAINT "OrderTimeline_orderKategoriId_fkey" FOREIGN KEY ("orderKategoriId") REFERENCES "OrderKategori"("id") ON DELETE SET NULL ON UPDATE CASCADE;
