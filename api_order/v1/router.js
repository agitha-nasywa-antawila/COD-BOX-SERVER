const router = require("express").Router();
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/userMiddlewares");
const { upload } = require("../../services/minio");
const c = require("./controllers");

router.use(loginRequired);
router.post("/owner", allowedRole("BASE"), c.createOrder);
router.post(
    "/owner/generate-token/:type",
    allowedRole("BASE"),
    c.userGenerateTokenForOpenBox
);
router.post(
    "/owner/take-picture/:nomor_resi",
    allowedRole("BASE"),
    upload.single("file"),
    c.userTakeMoneyPicture
);
router.get(
    "/owner/check-delivery/:nomor_resi",
    allowedRole("BASE"),
    c.checkDeliveryStatus
);
router.get("/owner/order", allowedRole("BASE"), c.userOrderList);
router.post(
    "/owner/take-good-picture/:nomor_resi",
    allowedRole("BASE"),
    upload.single("file"),
    c.userTakeGoodPicture
);
router.get(
    "/timeline/:nomorResi",
    allowedRole("BASE", "KURIR"),
    c.orderTimeLine
);

module.exports = router;
