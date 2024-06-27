const router = require("express").Router();
const { appLoginRequired } = require("../middlewares/appMiddleware");
const controller = require("./controller");

router.use(appLoginRequired);
router.get("/transaksi/buat", controller.userBuatPesanan);
router.get("/transaksi/daftar", controller.userDaftarPesanan);

module.exports = router;
