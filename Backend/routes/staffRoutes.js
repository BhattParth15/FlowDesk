const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth_Middleware.js");
const { createStaff, getStaff, updateStaff, deleteStaff,getStaffByProject} = require("../controllers/staffController.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isStaffOwner = require("../middleware/staffOwner_Middleware.js");
const checkPlanLimit = require("../middleware/checkPlanLimit_Middleware.js");

router.post("/", authMiddleware, checkPermission("staff","create"),checkPlanLimit("staff"), createStaff);
router.get("/", authMiddleware, checkPermission("staff","read"), getStaff);
router.put("/:id", authMiddleware, isStaffOwner,checkPermission("staff","update"), updateStaff);
router.delete("/:id", authMiddleware,isStaffOwner, checkPermission("staff","delete"),  deleteStaff);
router.get("/project", authMiddleware, checkPermission("staff","read"), getStaffByProject);

module.exports = router;
