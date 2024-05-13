const router = require("express").Router();
const controller = require("./controlers");

router.get("/", controller.tes);
router.get("/tes", controller.tes2);
router.get("/view/1", controller.view1);

module.exports = router;
