const express=require("express");
const taskControll=require("../controllers/taskController.js");
const auth=require("../middleware/auth_Middleware.js");
//const role=require("../middleware/role_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const isStaffOwner = require("../middleware/staffOwner_Middleware.js");
const isTaskOwner = require("../middleware/isTaskOwner_Middleware.js");
const upload = require("../middleware/multer.js");

const router=express.Router();

router.get("/",auth,checkPermission("task","read"),taskControll.getTasks);

// router.post("/",auth,role("admin"),taskControll.createTask);
router.put("/:id",auth,checkPermission("task","update"),isTaskOwner,upload.fields([{ name: "image", maxCount: 5 },{ name: "video", maxCount: 1 }]),taskControll.updateTask);
router.delete("/:id",auth,checkPermission("task","delete"),isTaskOwner,taskControll.deleteTask);
router.post("/",auth,checkPermission("task","create"),upload.fields([{ name: "image", maxCount: 5 },{ name: "video", maxCount: 1 }]),  taskControll.createTask);
router.put("/complete",auth,checkPermission("task","complete"),isTaskOwner, taskControll.completeTask)

module.exports=router;