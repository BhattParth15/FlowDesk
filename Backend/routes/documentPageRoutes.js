const express = require("express");
const router = express.Router();

const {createPagedDocument,viewPagedDocument,updatePageContent,downloadDocument,deletePagedDocument} = require("../controllers/pagestoreController.js");

const auth = require("../middleware/auth_Middleware.js");

router.post("/create-paged",auth,createPagedDocument);

router.get("/pages/:documentId",auth,viewPagedDocument);

router.put("/page/:documentId",auth,updatePageContent);

router.get("/download/:documentId",auth,downloadDocument);

router.delete("/:documentId",auth,deletePagedDocument);

module.exports = router;