const router = require("express").Router();
const controller = require("./controller");

router.get("/login", controller.login);
router.get("/register", controller.register);

module.exports = router;
