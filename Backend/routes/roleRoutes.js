const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth_Middleware.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isStaffOwner = require("../middleware/staffOwner_Middleware.js");

const {createRole,getRoles,getRoleById,updateRole,deleteRole} = require("../controllers/roleController.js");

// Create Role
router.post("/",authMiddleware,isSuperAdmin,createRole);

// Get All Roles
router.get("/",authMiddleware,checkPermission("role","read"),getRoles);

// Get Role By ID
router.get("/:id",authMiddleware,checkPermission("role","read"),getRoleById);

// Update Role
router.put("/:id",authMiddleware,isSuperAdmin,updateRole);

// Soft Delete Role
router.delete("/:id",authMiddleware,isSuperAdmin,deleteRole);

module.exports = router;
