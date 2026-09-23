const express = require("express");
const {
  addBlog,
  getAllBlogs,
  getBlogById,
  editBlog,
  deleteBlog,
  toggleFeaturedStatus,
  toggleRecommendedStatus,
  getBlogsByUrl,
  getLatestBlogsByCategory,
  getAllBlogsPaginated,
  getAdminBlogsPaginated,
  schedulePublish,
  cancelSchedulePublish,
  updateBlogPublishStatus,
  checkSlugAvailability,
} = require("../controllers/blogController");
const authenticate = require("../middlewares/authenticate");
const requirePermission = require("../middlewares/requirePermission");

const router = express.Router();

// Public read endpoints — kept unauthenticated so the public website can
// still list/fetch published blogs, mirroring tps-next-backend's blogRoutes.
router.get("/", getAllBlogs);
router.get("/all-blogs", getAllBlogsPaginated);
router.get("/latest", getLatestBlogsByCategory);
router.get("/slug-availability", checkSlugAvailability);
router.post("/search", getBlogsByUrl);

// Admin-only endpoints — require a valid session and the relevant
// blogs.<action> permission.
router.get(
  "/admin/all-blogs",
  authenticate,
  requirePermission("blogs", "view"),
  getAdminBlogsPaginated
);
router.post("/add", authenticate, requirePermission("blogs", "create"), addBlog);
router.post(
  "/schedule",
  authenticate,
  requirePermission("blogs", "publish"),
  schedulePublish
);
router.post(
  "/:blogId/cancel",
  authenticate,
  requirePermission("blogs", "publish"),
  cancelSchedulePublish
);
router.get("/:id", authenticate, requirePermission("blogs", "view"), getBlogById);
router.patch(
  "/featured/:id",
  authenticate,
  requirePermission("blogs", "edit"),
  toggleFeaturedStatus
);
router.patch(
  "/recommended/:id",
  authenticate,
  requirePermission("blogs", "edit"),
  toggleRecommendedStatus
);
router.put("/edit/:id", authenticate, requirePermission("blogs", "edit"), editBlog);
router.delete(
  "/delete/:id",
  authenticate,
  requirePermission("blogs", "delete"),
  deleteBlog
);
router.post(
  "/:id/publish",
  authenticate,
  requirePermission("blogs", "publish"),
  updateBlogPublishStatus
);

module.exports = router;
