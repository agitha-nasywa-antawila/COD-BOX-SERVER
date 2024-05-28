const router = require("express").Router();
const { appLogoutRequired } = require("../middlewares/appMiddleware");
const controller = require("./controller");

router.use(appLogoutRequired);
router.get("/login", controller.login);
router.get("/register", controller.register);

module.exports = router;
