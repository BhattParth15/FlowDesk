const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth_Middleware.js");
const { createStaff, getStaff, updateStaff, deleteStaff } = require("../controllers/staffController.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isStaffOwner = require("../middleware/staffOwner_Middleware.js");

router.post("/", authMiddleware, checkPermission("staff","create"), createStaff);
router.get("/", authMiddleware, checkPermission("staff","read"), getStaff);
router.put("/:id", authMiddleware, checkPermission("staff","update"), isStaffOwner, updateStaff);
router.delete("/:id", authMiddleware, checkPermission("staff","delete"), isStaffOwner, deleteStaff);

module.exports = router;
