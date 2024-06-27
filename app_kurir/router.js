const router = require("express").Router();
const { appLoginRequired } = require("../middlewares/appMiddleware");
const { allowedRole } = require("../middlewares/userMiddlewares");
const controller = require("./controller");

router.use(appLoginRequired, allowedRole("KURIR"));
router.get("/pesanan/antar", controller.kurirAntarPesanan);
router.get("/pesanan/list", controller.kurirDaftarPesanan);
router.get("/pesanan/detail", controller.kurirDetailPesanan);

module.exports = router;
