const express=require("express");

const authMiddleware=require("../middleware/auth_Middleware.js");
const checkPermission=require("../middleware/role_Middleware.js");
const isSuperAdmin=require("../middleware/isSuperAdmin_Middleware.js");
const isTaskOwner = require("../middleware/isTaskOwner_Middleware.js")
const {createProject,getProjects,getProjectById,updateProject,deleteProject,getProjectStaff}=require("../controllers/projectController.js");
const checkPlanLimit = require("../middleware/checkPlanLimit_Middleware.js");

const router=express.Router();

router.get("/",authMiddleware,checkPermission("project","read"),getProjects);
router.get("/:id",authMiddleware,checkPermission("project","read"),getProjectById);
router.post("/",authMiddleware,checkPermission("project","create"),checkPlanLimit("project"),createProject);
router.put("/:id",authMiddleware,checkPermission("project","update"),isSuperAdmin,updateProject);
router.delete("/:id",authMiddleware,checkPermission("project","delete"),isSuperAdmin,deleteProject);
router.get("/:id/staff", authMiddleware,checkPermission("project","read"),getProjectStaff);

module.exports=router;