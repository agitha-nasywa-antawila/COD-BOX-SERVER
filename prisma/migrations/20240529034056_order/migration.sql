-- CreateEnum
CREATE TYPE "TIPE_PEMBAYARAN" AS ENUM ('COD', 'ONLINE');

-- CreateTable
CREATE TABLE "Order" (
    "id" TEXT NOT NULL,
    "resi" TEXT NOT NULL,
    "nomor_pesanan" TEXT NOT NULL,
    "harga_barang" TEXT NOT NULL,
    "tipe_pembayaran" "TIPE_PEMBAYARAN" NOT NULL,
    "ownerId" TEXT,
    "kurirId" TEXT,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderTimeline" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "orderKategoriId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,

    CONSTRAINT "OrderTimeline_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OrderKategori" (
    "id" TEXT NOT NULL,
    "sequence" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "OrderKategori_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OrderKategori_sequence_key" ON "OrderKategori"("sequence");

-- CreateIndex
CREATE UNIQUE INDEX "OrderKategori_name_key" ON "OrderKategori"("name");

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_kurirId_fkey" FOREIGN KEY ("kurirId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTimeline" ADD CONSTRAINT "OrderTimeline_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTimeline" ADD CONSTRAINT "OrderTimeline_orderKategoriId_fkey" FOREIGN KEY ("orderKategoriId") REFERENCES "OrderKategori"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTimeline" ADD CONSTRAINT "OrderTimeline_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
