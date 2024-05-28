const router = require("express").Router();
const {
    appLogoutRequired,
    appLoginRequired,
} = require("../middlewares/appMiddleware");
const controller = require("./controller");

router.get("/login", appLogoutRequired, controller.login);
router.get("/logout", appLoginRequired, controller.logout);
router.get("/register", appLogoutRequired, controller.register);

module.exports = router;
