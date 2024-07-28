const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = require("../../prisma/client");
const { generateString } = require("../../util/string");
const { fileUploader } = require("../../services/minio");

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

// Fungsi untuk membuat url untuk membuka loker
/*
    Fungsi ini akan menerima paramter berupa nomor resi, 
    kemudian akan mengembalikan data beruba sebuah token yang akan digunakan untuk membuka device
    URL tersebut berisi kode device dan token yang akan aktif selama 1 menit
*/
exports.kurirGenerateTokenForOpenBox = async (req, res) => {
    const { nomor_resi } = req.body;
    const type =
        String(req.params?.type).toUpperCase() == "LACI" ? "LACI" : "BOX";
    const userId = req.userid;

    try {
        // Pengecekan nomor resi, jika menggunakan online payment maka tidak perlu meletakan uang untuk COD
        const order = await prisma.order.findUnique({
            where: { resi: nomor_resi },
            select: {
                id: true,
                tipe_pembayaran: true,
                deviceId: true,
            },
        });

        if (order == null) throw "Pesanan tidak ditemukan";
        if (order?.tipe_pembayaran == "ONLINE" && type === "LACI")
            throw "Pembayaran menggunakan online payment tidak perlu membuka laci untuk mengambil uang";

        // Generate Token dan Expired Date
        const token = generateString(32);
        let expiredDate = new Date();
        expiredDate.setTime(expiredDate.getTime() + 3 * 60_000);

        // Lakukan update pada device yang digunakan
        await prisma.device.update({
            where: {
                id: order.deviceId,
            },
            data: {
                token: token,
                tokenExpiredAt: expiredDate,
            },
        });

        let typeDescription;
        if (type === "BOX") {
            typeDescription = "KURIR MEMBUKA BOX";
        } else {
            typeDescription = "KURIR MEMBUKA LACI";
        }

        const kategori = await prisma.orderKategori.findUnique({
            where: {
                name: typeDescription,
            },
        });

        if (!kategori) throw new Error("Kategori tidak ditemukan");

        // Kita Buat Data Di Tabel Order Time Line
        await prisma.orderTimeline.create({
            data: {
                orderId: order.id,
                userId: userId,
                orderKategoriId: kategori.id,
            },
        });

        return resSuccess({
            res,
            data: {
                token: token,
                type: type,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.kurirTakeMoneyPicture = async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const fileId = await fileUploader(fileName, filePath);
        const { nomor_resi } = req.params;
        const userId = req.userid;

        const order = await prisma.order.findUnique({
            where: { resi: nomor_resi },
            select: {
                id: true,
                tipe_pembayaran: true,
                deviceId: true,
            },
        });

        if (order == null) throw "Pesanan tidak ditemukan";
        if (order?.tipe_pembayaran == "ONLINE")
            throw "Pembayaran menggunakan online payment tidak perlu mengambil foto uang";

        // Kurir mengambil bukti uang
        const takeMoneyPicture = await prisma.orderKategori.findUnique({
            where: {
                name: "KURIR MENGAMBIL BUKTI UANG",
            },
        });

        // Kurir mengambil uang
        const takeMoney = await prisma.orderKategori.findUnique({
            where: {
                name: "KURIR MENGAMBIL UANG",
            },
        });

        await prisma.orderTimeline.createMany({
            data: [
                {
                    orderId: order.id,
                    orderKategoriId: takeMoneyPicture.id,
                    value: fileId,
                    userId: userId,
                },
                {
                    orderId: order.id,
                    orderKategoriId: takeMoney.id,
                    userId: userId,
                },
            ],
        });

        return resSuccess({
            res,
            title: "Success take money picture",
            data: {
                url: fileId,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.kurirTakeGoodPicture = async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const { nomor_resi } = req.params;
        const userId = req.userid;

        const order = await prisma.order.findUnique({
            where: { resi: nomor_resi },
            select: {
                id: true,
                tipe_pembayaran: true,
                deviceId: true,
            },
        });

        if (order == null) throw "Pesanan tidak ditemukan";
        const fileId = await fileUploader(fileName, filePath);

        // Kurir ketika meletakan barang
        const putGoods = await prisma.orderKategori.findUnique({
            where: {
                name: "KURIR MELETAKAN BARANG",
            },
        });

        // Kurir meletakan barang
        const takeGoodsPicture = await prisma.orderKategori.findUnique({
            where: {
                name: "KURIR MENGAMBIL FOTO BARANG",
            },
        });

        await prisma.orderTimeline.createMany({
            data: [
                {
                    orderId: order.id,
                    orderKategoriId: putGoods.id,
                    value: fileId,
                    userId: userId,
                },
                {
                    orderId: order.id,
                    orderKategoriId: takeGoodsPicture.id,
                    userId: userId,
                },
            ],
        });

        return resSuccess({
            res,
            title: "Success take goods picture",
            data: {
                url: fileId,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.kurirOrderList = async (req, res) => {
    try {
        const item = Number(req.query?.item) ? Number(req.query.item) : 100;
        const search = req.query?.search ? req.query.search : "";
        const cursor = req.query?.cursor ? req.query.cursor : "";
        let searchQuery = {};
        let cursorQuery;
        let skipRecord = 0;

        if (cursor) {
            skipRecord = 1;
            cursorQuery = {
                cursor: {
                    id: cursor,
                },
            };
        }

        if (search) {
            searchQuery = { contains: search, mode: "insensitive" };
        }

        const userId = req.userid;
        const data = [];
        const rawData = await prisma.order.findMany({
            ...cursorQuery,
            skip: skipRecord,
            take: item,
            select: {
                id: true,
                resi: true,
                tipe_pembayaran: true,
                isOrderComplate: true,
                OrderTimeline: {
                    take: 1,
                    orderBy: {
                        createdAt: "desc",
                    },
                    select: {
                        createdAt: true,
                        kategori: {
                            select: {
                                name: true,
                            },
                        },
                    },
                },
            },
            where: {
                kurirId: userId,
                resi: searchQuery,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        for (let i = 0; i < rawData.length; i++) {
            const orderData = rawData[i];
            data.push({
                order_id: orderData.id,
                order_resi: orderData.resi,
                isOrderComplate: orderData?.isOrderComplate,
                tipe_pembayaran: orderData.tipe_pembayaran,
                status_terakhir_deskripsi:
                    orderData?.OrderTimeline[0]?.kategori.name || "-",
                status_terakhir_waktu:
                    orderData?.OrderTimeline[0]?.createdAt || "",
            });
        }
        return resSuccess({
            res,
            title: "Success get order data",
            data: data,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.detail = async (req, res) => {
    try {
        const id = await getUser(req);
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                username: true,
                email: true,
                profil: { select: { full_name: true, photo: true } },
                role: { select: { name: true } },
            },
        });
        return resSuccess({
            res,
            title: "Success get user information",
            data: user,
        });
    } catch (error) {
        return resError({
            res,
            title: "Failed to get user data",
            errors: error,
        });
    }
};
