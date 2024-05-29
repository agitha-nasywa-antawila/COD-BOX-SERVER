const router = require("express").Router();
const { loginRequired } = require("../../middlewares/userMiddlewares");
const c = require("./controllers");

router.use(loginRequired);
router.post("/owner", c.createOrder);

module.exports = router;
