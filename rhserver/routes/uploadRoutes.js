const express = require("express");
const upload = require("../middlewares/multer");
const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");
const {
  uploadBlogsFile,
  getAllBlogFiles,
  deleteBlogFile,
} = require("../controllers/uploadController");

const router = express.Router();

// Backs the Blog Files media library. All routes require an active admin
// session; uploading/deleting requires the "edit" permission on blogs
// (viewing the library only requires "view").
router.get("/blogs", authenticate, requirePermission("blogs", "view"), getAllBlogFiles);
router.post(
  "/blogs",
  authenticate,
  requirePermission("blogs", "edit"),
  upload.single("file"),
  uploadBlogsFile
);
router.delete(
  "/blogs",
  authenticate,
  requirePermission("blogs", "edit"),
  deleteBlogFile
);

module.exports = router;
