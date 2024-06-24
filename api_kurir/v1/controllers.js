const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = require("../../prisma/client");

exports.kurirAmbilPesanan = async (req, res) => {
    try {
        const { nomor_resi: nomorResi } = req.body;
        const userId = req.userid;

        // Cari apakah order sudah ada di database
        const order = await prisma.order.findUnique({
            where: { resi: nomorResi },
        });

        if (!order) throw "Pesanan tidak ditemukan";

        // Cek apakah pesanan telah di ambil kurir sebelumnya dengan memeriksa id kurir di tabel pesanan
        if (order.kurirId != null) throw "Pesanan telah diambil kurir lainnya";

        // Perbaharui data order dengan memsukan data kurir
        await prisma.order.update({
            where: {
                id: order.id,
            },
            data: {
                kurirId: userId,
            },
        });

        // Buat log kurir sudah mengambil pesanan
        const kategoriKurirMengambilPesanan =
            await prisma.orderKategori.findUnique({
                where: {
                    name: "KURIR MEMASUKAN RESI",
                },
            });

        if (!kategoriKurirMengambilPesanan)
            throw new Error("Kategori tidak ditemukan");

        // Kita Buat Data Di Tabel Order Time Line
        await prisma.orderTimeline.create({
            data: {
                orderId: order.id,
                userId: userId,
                orderKategoriId: kategoriKurirMengambilPesanan.id,
            },
        });

        return resSuccess({
            res,
            title: "Berhasil Mengambil Pesanan",
            data: order,
        });
    } catch (error) {
        return resError({
            res,
            title: "Kurir gagal mengambil pesanan",
            errors: error,
        });
    }
};
