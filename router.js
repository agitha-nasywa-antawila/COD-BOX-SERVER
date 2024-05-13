const router = require("express").Router();
const APP_ROUTER_V1 = require("./app/router");
const ADMIN_ROUTER_V1 = require("./app_admin/router");
const USER_ROUTER_V1 = require("./app_user/router");
const ROLE_V1 = require("./api_role/v1/router");
const USER_V1 = require("./api_user/v1/router");

router.use("/", APP_ROUTER_V1);
router.use("/admin", ADMIN_ROUTER_V1);
router.use("/user", USER_ROUTER_V1);
router.use("/api/v1/role", ROLE_V1);
router.use("/api/v1/user", USER_V1);

module.exports = router;
