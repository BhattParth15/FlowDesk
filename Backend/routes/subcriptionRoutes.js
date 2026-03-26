const express = require("express");
const router = express.Router();
const {createPlan,getPlans,getPlanById,updatePlan,deletePlan,applyPlan,checkLimitAPI,getAllPlansForCompany} = require("../controllers/subscriptionController.js");
const auth = require("../middleware/auth_Middleware.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");

router.post("/",auth,isSuperAdmin,createPlan);
router.get("/all", auth, getAllPlansForCompany);
router.post("/apply", auth, applyPlan);
router.get("/",auth, getPlans);
router.get("/:id",auth,isSuperAdmin, getPlanById);
router.put("/:id",auth,isSuperAdmin, updatePlan);
router.delete("/:id",auth,isSuperAdmin, deletePlan);

router.get("/checklimit", auth, isSuperAdmin, checkLimitAPI);

module.exports = router;