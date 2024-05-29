/*
  Warnings:

  - A unique constraint covering the columns `[resi]` on the table `Order` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nomor_pesanan]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Order_resi_key" ON "Order"("resi");

-- CreateIndex
CREATE UNIQUE INDEX "Order_nomor_pesanan_key" ON "Order"("nomor_pesanan");
