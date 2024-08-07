const { resSuccess, resError } = require("../../services/responseHandler");
const prisma = require("../../prisma/client");
const { generateString } = require("../../util/string");
const { fileUploader } = require("../../services/minio");

exports.createOrder = async (req, res) => {
    try {
        const {
            nomor_resi,
            nomor_pesanan,
            harga_barang,
            tipe_pembayaran,
            cod_box_id,
        } = req.body;

        const userId = req.userid;

        // validasi apakah terdapat cod box
        const device = await prisma.device.findUnique({
            select: {
                id: true,
                isDeviceInUse: true,
            },
            where: {
                id: cod_box_id,
            },
        });

        if (!device.id)
            throw "Cod Box yang ingin anda gunakan tidak ada, coba gunakan box lain";
        if (device.isDeviceInUse)
            throw "Cod Box yang ingin anda gunakan sedang digunakan, coba gunakan box lain";

        // cek pesanan apakah sudah ada
        const isOrderIdExist = await prisma.order.findMany({
            select: {
                id: true,
            },
            where: {
                OR: [{ nomor_pesanan: nomor_pesanan }, { resi: nomor_resi }],
            },
        });

        if (isOrderIdExist.length > 0)
            throw "Nomor resi atau pesanan sudah terdaftar sebelumnya";

        // Masukan Data Ke Tabel Order
        const newOrder = await prisma.order.create({
            data: {
                nomor_pesanan: nomor_pesanan,
                resi: nomor_resi,
                harga_barang: harga_barang,
                ownerId: userId,
                deviceId: cod_box_id,
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

        // Update device sedang di gunakan
        await prisma.device.update({
            where: { id: cod_box_id },
            data: { isDeviceInUse: true },
        });

        return resSuccess({
            res,
            title: "Success listed all role",
            data: newOrder,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

// Fungsi untuk membuat url untuk membuka loker
/*
    Fungsi ini akan menerima paramter berupa nomor resi, 
    kemudian akan mengembalikan data beruba sebuah token yang akan digunakan untuk membuka device
    URL tersebut berisi kode device dan token yang akan aktif selama 1 menit
*/
exports.userGenerateTokenForOpenBox = async (req, res) => {
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
        if (order?.tipe_pembayaran == "ONLINE" && type == "LACI")
            throw "Pembayaran menggunakan online payment tidak perlu membuka laci untuk memasukan uang";

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
            typeDescription = "PENGGUNA MEMBUKA BOX UNTUK MELETAKAN UANG";
        } else {
            typeDescription = "PENGGUNA MEMBUKA LACI UNTUK MELETAKAN UANG";
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

exports.userTakeMoneyPicture = async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const presignedUrl = await fileUploader(fileName, filePath);
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

        // User Meletakan Uang
        const putMoney = await prisma.orderKategori.findUnique({
            where: {
                name: "PENGGUNA MELETAKAN UANG",
            },
        });

        const takeMoneyPicture = await prisma.orderKategori.findUnique({
            where: {
                name: "PENGGUNA MENGAMBIL FOTO BUKTI UANG",
            },
        });

        await prisma.orderTimeline.createMany({
            data: [
                {
                    orderId: order.id,
                    orderKategoriId: putMoney.id,
                    userId: userId,
                },
                {
                    orderId: order.id,
                    orderKategoriId: takeMoneyPicture.id,
                    value: presignedUrl,
                    userId: userId,
                },
            ],
        });

        return resSuccess({
            res,
            title: "Success take money picture",
            data: {
                url: presignedUrl,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

// Fungsi untuk melakukan pengecekan apakah kurir sudah mengirimkan paket
/*
    Fungsi ini akan di gunakan ketika user membuka tab "Foto Barang", ketika kurir belum meletakan barang
    Maka user belum bisa mengakses tab tersebut dan menyelesaikan pesanan
*/
exports.checkDeliveryStatus = async (req, res) => {
    try {
        const { nomor_resi } = req.params;
        const userId = req.userid;

        const order = await prisma.order.findUnique({
            where: { resi: nomor_resi },
            select: {
                id: true,
            },
        });

        if (order == null) throw "Pesanan tidak ditemukan";

        const orderTimeline = await prisma.orderTimeline.findMany({
            where: {
                orderId: order.id,
            },
            select: {
                kategori: {
                    select: {
                        name: true,
                    },
                },
            },
        });

        const isGoodHasDeliver = orderTimeline.find(
            (d) => d.kategori.name === "KURIR MELETAKAN BARANG"
        );

        return resSuccess({
            res,
            title: "Success get delivery status",
            data: {
                isGoodHasDeliver: isGoodHasDeliver ? true : false,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.userOrderList = async (req, res) => {
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
                ownerId: userId,
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

exports.userOrderDetail = async (req, res) => {
    try {
        const { nomorResi } = req.params;
        const data = await prisma.order.findUnique({
            where: {
                resi: nomorResi,
            },
            select: {
                resi: true,
                nomor_pesanan: true,
                tipe_pembayaran: true,
                createdAt: true,
            },
        });
        return resSuccess({
            res,
            title: "Success get order data",
            data: data,
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.userTakeGoodPicture = async (req, res) => {
    try {
        const filePath = req.file.path;
        const fileName = req.file.originalname;
        const presignedUrl = await fileUploader(fileName, filePath);
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

        // User Mengambil foto Barang
        const takeGoodPicture = await prisma.orderKategori.findUnique({
            where: {
                name: "PENGGUNA MENGAMBIL FOTO BARANG",
            },
        });

        const takeGood = await prisma.orderKategori.findUnique({
            where: {
                name: "PENGGUNA MENGAMBIL BARANG",
            },
        });

        const finishTransaction = await prisma.orderKategori.findUnique({
            where: {
                name: "TRANSAKSI SELESAI",
            },
        });

        await prisma.orderTimeline.create({
            data: {
                orderId: order.id,
                orderKategoriId: takeGood.id,
                userId: userId,
            },
        });

        await prisma.orderTimeline.create({
            data: {
                orderId: order.id,
                orderKategoriId: takeGoodPicture.id,
                userId: userId,
                value: presignedUrl,
            },
        });

        await prisma.orderTimeline.create({
            data: {
                orderId: order.id,
                orderKategoriId: finishTransaction.id,
                userId: userId,
            },
        });

        await prisma.order.update({
            where: { id: order.id },
            data: {
                isOrderComplate: true,
            },
        });

        await prisma.device.update({
            where: { id: order.deviceId },
            data: { isDeviceInUse: false },
        });

        return resSuccess({
            res,
            title: "Success finish order",
            data: {
                orderId: order.id,
                photoUrl: presignedUrl,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};

exports.orderTimeLine = async (req, res) => {
    try {
        const nomorResi = req.params.nomorResi;
        const userId = req.userid;

        const order = await prisma.order.findUnique({
            where: { resi: nomorResi },
            select: {
                id: true,
                resi: true,
                Owner: {
                    select: {
                        username: true,
                    },
                },
                Kurir: {
                    select: {
                        username: true,
                    },
                },
                createdAt: true,
            },
        });

        if (order == null) throw "Pesanan tidak ditemukan";

        const rawData = await prisma.orderTimeline.findMany({
            where: {
                orderId: order.id,
            },
            select: {
                id: true,
                kategori: {
                    select: {
                        name: true,
                    },
                },
                user: {
                    select: {
                        username: true,
                    },
                },
                value: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: "asc",
            },
        });

        return resSuccess({
            res,
            title: "Success get order timeline",
            data: {
                header: {
                    resi: order.resi,
                    owner: order.Owner.username,
                    kurir: order.Kurir.username,
                    createdAt: order.createdAt,
                    finishAt: rawData.at(-1).createdAt,
                },
                timeline: rawData,
            },
        });
    } catch (error) {
        return resError({ res, errors: error });
    }
};
