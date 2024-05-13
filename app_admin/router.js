const router = require("express").Router();
const controller = require("./controller");

router.get("/transaksi/riwayat", controller.adminRiwayatPesananPengguna);
router.get("/pengguna/daftar",controller.daftarPengguna);
router.get("/transaksi/detail", controller.adminRiwayatDetail);

module.exports = router;
