const router = require("express").Router();
const { loginRequired } = require("../../middlewares/userMiddlewares");
const c = require("./controllers");

router.post("/", c.createDevice);

module.exports = router;
