const express = require("express");
const auth = require("../middleware/auth_Middleware.js");
const checkPermission = require("../middleware/role_Middleware.js");
const isSuperAdmin = require("../middleware/isSuperAdmin_Middleware.js");
const isTaskOwner = require("../middleware/isTaskOwner_Middleware.js");
const upload = require("../middleware/multer.js");
const {createDocument,getDocuments,updateAccess,updateDocument,deleteDocument,viewDocument,requestAccess,createTextDocument,updateTextDocument,viewTextDocument} = require("../controllers/documentController.js");
const checkPlanLimit = require("../middleware/checkPlanLimit_Middleware.js");

const router = express.Router();

router.post( "/",auth,checkPermission("document", "create"),checkPlanLimit("document"),upload.single("file"),createDocument);
router.get("/",auth,checkPermission("document", "read"),getDocuments);

router.get("/view/:id",auth,checkPermission("document", "read"),viewDocument);

router.put("/:id",auth, checkPermission("document", "update"),upload.single("file"),updateDocument);

router.delete("/:id",auth,checkPermission("document", "delete"),deleteDocument);
router.post("/request-access",auth,checkPermission("document", "read"),requestAccess);
router.post("/update-access",auth,updateAccess);
router.post("/create-text",auth,checkPermission("document", "create"),createTextDocument);
router.put("/update-text/:id",auth,checkPermission("document", "update"),updateTextDocument);
router.get("/view-text/:id",auth,checkPermission("document", "read"),viewTextDocument);

module.exports = router;