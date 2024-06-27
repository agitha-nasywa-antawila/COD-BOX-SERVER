const router = require("express").Router();
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/userMiddlewares");
const { upload } = require("../../services/minio");
const c = require("./controllers");

router.use(loginRequired, allowedRole("BASE"));
router.post("/owner", c.createOrder);
router.post("/owner/generate-token/:type", c.userGenerateTokenForOpenBox);
router.post(
    "/owner/take-picture/:nomor_resi",
    upload.single("file"),
    c.userTakeMoneyPicture
);
router.get("/owner/check-delivery/:nomor_resi", c.checkDeliveryStatus);
router.get("/owner/order", c.userOrderList);

module.exports = router;
