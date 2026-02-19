const express=require("express");

const authMiddleware=require("../middleware/auth_Middleware.js");
const checkPermission=require("../middleware/role_Middleware.js");
const isSuperAdmin=require("../middleware/isSuperAdmin_Middleware.js");
const isTaskOwner = require("../middleware/isTaskOwner_Middleware.js")
const {createTaskStatus,getTaskStatus,getTaskStatusByID,updateTaskStatus,deleteTaskStatus}=require("../controllers/taskStatusController.js");

const router=express.Router();

router.get("/",authMiddleware,checkPermission("taskstatus","read"),getTaskStatus);
router.get("/:id",authMiddleware,checkPermission("taskstatus","read"),getTaskStatusByID);
router.post("/",authMiddleware,checkPermission("taskstatus","create"),isSuperAdmin,createTaskStatus);
router.put("/:id",authMiddleware,checkPermission("taskstatus","update"),isSuperAdmin,updateTaskStatus);
router.delete("/:id",authMiddleware,checkPermission("taskstatus","delete"),isSuperAdmin,deleteTaskStatus);

module.exports=router;