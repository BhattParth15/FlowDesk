const express = require("express");
const router = express.Router();

const authMiddleware = require("../middleware/auth_Middleware.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isStaffOwner = require("../middleware/staffOwner_Middleware.js");

const {createRole,getRoles,getRoleById,updateRole,deleteRole,updateCompanyOwnerPermissions} = require("../controllers/roleController.js");
const checkPlanLimit = require("../middleware/checkPlanLimit_Middleware.js");

// Create Role
router.post("/",authMiddleware,checkPermission("role","create"),checkPlanLimit("role"),createRole);

// Get All Roles
router.get("/",authMiddleware,checkPermission("role","read"),getRoles);

// Get Role By ID
router.get("/:id",authMiddleware,checkPermission("role","read"),getRoleById);

// Update Role
router.put("/:id",authMiddleware,checkPermission("role","update"),updateRole);
router.put("/update-company-owner-permissions/:companyId",authMiddleware,isSuperAdmin,updateCompanyOwnerPermissions);

// Soft Delete Role
router.delete("/:id",authMiddleware,checkPermission("role","delete"),deleteRole);

module.exports = router;
