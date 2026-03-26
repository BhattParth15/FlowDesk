const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth_Middleware");
const { getDashboard } = require("../controllers/dashboardController.js");

router.get("/", auth, getDashboard);

module.exports = router;