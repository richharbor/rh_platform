const express = require("express");
const router = express.Router();
const upload = require("../middleware/multer");
const { uploadDocumentFile, deleteDocumentFile } = require("../controllers/fileUploadController");

router.post("/documents", upload.single("file"), uploadDocumentFile);
router.delete("/documents", deleteDocumentFile);

module.exports = router;