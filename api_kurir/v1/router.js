const router = require("express").Router();
const {
    loginRequired,
    allowedRole,
} = require("../../middlewares/userMiddlewares");
const c = require("./controllers");

router.use(loginRequired, allowedRole("KURIR"));
router.post("/take/order", c.kurirAmbilPesanan);

module.exports = router;
