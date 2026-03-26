const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth_Middleware.js");
const { createCompany, getCompany, updateCompany, deleteCompany,getMyCompany,CompanyTiming} = require("../controllers/companyController.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");

router.post("/", createCompany);
router.get("/", authMiddleware, checkPermission("company","read"), getCompany);
router.put("/:id", authMiddleware, checkPermission("company","update"), updateCompany);
router.delete("/:id", authMiddleware, checkPermission("company","delete"), deleteCompany);
router.get("/my", authMiddleware, getMyCompany);
router.post("/timing", authMiddleware, CompanyTiming);
router.put("/timing", authMiddleware, CompanyTiming);

module.exports = router;
