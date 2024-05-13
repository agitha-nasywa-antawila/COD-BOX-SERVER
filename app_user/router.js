const router = require("express").Router();
const controller = require("./controller");

router.get("/transaksi/buat", controller.userBuatPesanan)

module.exports = router;