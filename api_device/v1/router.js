const router = require("express").Router();
const { loginRequired } = require("../../middlewares/userMiddlewares");
const c = require("./controllers");

router.post("/", c.createDevice);
router.post("/open", c.openDevice);

module.exports = router;
