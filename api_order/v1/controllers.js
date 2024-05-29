const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = require("../../prisma/client");

exports.createOrder = async (req, res) => {
    try {
        const { nomor_resi, nomor_pesanan, harga_barang, tipe_pembayaran } =
            req.body;
        const userId = req.userid;

        // Masukan Data Ke Tabel Order
        const newOrder = await prisma.order.create({
            data: {
                nomor_pesanan: nomor_pesanan,
                resi: nomor_resi,
                harga_barang: harga_barang,
                ownerId: userId,
                tipe_pembayaran:
                    String(tipe_pembayaran).toUpperCase() === "COD"
                        ? "COD"
                        : "ONLINE",
            },
        });

        const kategori = await prisma.orderKategori.findUnique({
            where: {
                name: "PESANAN DIBUAT",
            },
        });

        if (!kategori) throw new Error("Kategori tidak ditemukan");

        // Kita Buat Data Di Tabel Order Time Line
        await prisma.orderTimeline.create({
            data: {
                orderId: newOrder.id,
                userId: userId,
                orderKategoriId: kategori.id,
            },
        });

        return resSuccess({
            res,
            title: "Success listed all role",
            data: newOrder,
        });
    } catch (error) {
        console.log(error);
        return resError({ res, errors: error });
    }
};
