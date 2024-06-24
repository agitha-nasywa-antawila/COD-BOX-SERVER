const router = require("express").Router();
const { upload } = require("../../services/minio");
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/userMiddlewares");
const c = require("./controllers");

router.use(loginRequired, allowedRole("KURIR"));
router.post("/take/order", c.kurirAmbilPesanan);
router.post("/generate-token/:type", c.kurirGenerateTokenForOpenBox);

router.post(
    "/kurir/take-picture/:nomor_resi",
    upload.single("file"),
    c.kurirGenerateTokenForOpenBox
);

module.exports = router;
