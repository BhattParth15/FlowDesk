const express=require("express");
const router=express.Router();
const excelUpload=require("../middleware/excelUpload.js");
const {bulkUpload}=require("../controllers/bulkController.js");
const auth=require("../middleware/auth_Middleware.js");



router.post("/upload",auth,excelUpload.single("file"), bulkUpload);

module.exports = router;