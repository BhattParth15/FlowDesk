const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const isStaffOwner = require("../middleware/staffOwner_Middleware.js");

const {createPermission,getPermissions,getPermissionById,updatePermission,deletePermission} = require("../controllers/permissionController.js");

// Create
router.post("/",authMiddleware,isSuperAdmin,createPermission);

// Get All (Pagination)
router.get("/",authMiddleware,checkPermission("permission","read"),getPermissions);

// Get By ID
router.get("/:id",authMiddleware,checkPermission("permission","read"),getPermissionById);

// Update
router.put("/:id",authMiddleware,isSuperAdmin,updatePermission);

// Soft Delete
router.delete("/:id",authMiddleware,isSuperAdmin,deletePermission);

module.exports = router;
