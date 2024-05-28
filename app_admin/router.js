const router = require("express").Router();
const { appLoginRequired } = require("../middlewares/appMiddleware");
const controller = require("./controller");

router.use(appLoginRequired);
router.get("/transaksi/riwayat", controller.adminRiwayatPesananPengguna);
router.get("/pengguna/daftar", controller.daftarPengguna);
router.get("/transaksi/detail", controller.adminRiwayatDetail);

module.exports = router;
