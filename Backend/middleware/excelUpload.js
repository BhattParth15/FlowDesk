const multer=require("multer");

const storage=multer.memoryStorage();

const excelUpload=multer({
    storage,
    limits:{ fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
            file.originalname.endsWith(".xlsx")
        ) {
            cb(null, true);
        } else {
            cb(new Error("Only Excel files allowed"));
        }
    }
});

module.exports=excelUpload;