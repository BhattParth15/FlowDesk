const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const fileFilter = (req, file, cb) => {
    const imageTypes = /jpeg|jpg|png/;
    const videoTypes = /mp4|mov|avi/;
    const docTypes = /pdf|doc|docx|ppt|pptx/;
    const ext = path.extname(file.originalname).toLowerCase();
    // Image validation
    if (file.fieldname === "image") {
        if (!imageTypes.test(ext)) {
            return cb(new Error("Only PNG, JPG, JPEG images allowed"));
        }
        // Image count validation
        if (!req.imageCount) req.imageCount = 0;
        req.imageCount++;

        if (req.imageCount > 5) {
            return cb(new Error("Maximum 5 images allowed"));
        }
        return cb(null, true);
    }
    // Video validation
    if (file.fieldname === "video") {
        if (!videoTypes.test(ext)) {
            return cb(new Error("Only MP4, MOV, AVI videos allowed"));
        }
        return cb(null, true);
    }
    if (file.fieldname === "file") {
        if (!docTypes.test(ext)) {
            return cb(new Error("Only PDF, DOC, DOCX, PPT, PPTX files allowed"));
        }
        return cb(null, true);
    }
    cb(new Error("Invalid file type"));
};

const upload = multer({
    storage,
    limits: { fileSize: 10 * 1024 * 1024 }, // 20MB
    fileFilter
});

module.exports = upload;
