const { Op } = require("sequelize");
const { blog: blogs } = require("../models");
const asyncWrapper = require("../utils/asyncWrapper");
const { getPaginationParams, getMeta } = require("../utils/pagination");

// Ported from tps-next-backend's controllers/blogController.js.
//
// Deviations from source:
//   - Agenda-based scheduling (jobs/blogScheduler.js: scheduleBlogPublish /
//     cancelBlogPublish) is dropped. This build has no job queue to push a
//     one-off timer into — scheduling is just a row: `type: "scheduled"` +
//     `scheduledAt`, and jobs/blogPublishScheduler.js (node-cron, polling
//     every minute) is what actually flips it to published when due.
//   - Source's `type` values were effectively only "draft"/"publish" (the
//     agenda job set type: "publish"; schedulePublish oddly left type as
//     "draft" while scheduled, relying on agenda alone to know it was due).
//     This build uses three explicit values instead — "draft", "scheduled",
//     "published" — per the plan's field description, so a scheduled blog is
//     visibly distinguishable from a plain draft without cross-referencing
//     scheduledAt. Endpoints that source spelled as "publish" (the
//     status query/body value) still accept "publish" for source parity but
//     it is normalized to the stored value "published".
//   - `placement` passthrough is kept (default "blog") but there are no
//     placement-specific ("Landing Blogs" block-builder) endpoints.

const normalizeStatus = (status) => (status === "publish" ? "published" : status);

// POST /blogs/add
const addBlog = asyncWrapper(async (req, res) => {
  const blog = await blogs.create(req.body);
  res.status(201).json({ message: "Blog added successfully", blog });
});

// GET /blogs — public, unpaginated list (kept for the public website).
const getAllBlogs = asyncWrapper(async (req, res) => {
  const placement = req.query.placement || "blog";
  const blog = await blogs.findAll({ where: { placement } });
  res.json(blog);
});

// GET /blogs/all-blogs — public paginated list.
const getAllBlogsPaginated = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const categories = req.query.categories ? req.query.categories.split(",") : [];

  const sortBy = req.query.sortBy || "newest";
  const type = req.query.type || "all";
  const placement = req.query.placement || "blog";

  let order = [["publishedDate", "DESC"]];
  if (sortBy === "oldest") order = [["publishedDate", "ASC"]];
  if (sortBy === "popular") order = [["title", "ASC"]];

  const where = { placement };

  if (type !== "all") {
    where.type = normalizeStatus(type);
    where.url = { [Op.ne]: "" };
  }

  if (categories.length > 0) {
    where.category = categories;
  }

  const { count, rows } = await blogs.findAndCountAll({ where, limit, offset, order });
  const meta = getMeta(count, page, limit);

  res.json({ success: true, meta, data: rows });
});

// GET /blogs/admin/all-blogs — admin listing, requires auth+view permission.
// Sorted by createdAt (newest first), supports free-text search across
// title, author, category and slug (url).
const getAdminBlogsPaginated = asyncWrapper(async (req, res) => {
  const { page, limit, offset } = getPaginationParams(req.query);
  const placement = req.query.placement || "blog";
  const search = (req.query.search || "").trim();

  const where = { placement };

  if (search) {
    const like = { [Op.iLike]: `%${search}%` };
    where[Op.or] = [{ title: like }, { author: like }, { category: like }, { url: like }];
  }

  const { count, rows } = await blogs.findAndCountAll({
    where,
    limit,
    offset,
    order: [["createdAt", "DESC"]],
  });

  const meta = getMeta(count, page, limit);
  res.json({ success: true, meta, data: rows });
});

// GET /blogs/:id
const getBlogById = asyncWrapper(async (req, res) => {
  const blog = await blogs.findByPk(req.params.id);
  if (!blog) return res.status(404).json({ error: "Blog not found" });
  res.json(blog);
});

// PUT /blogs/edit/:id
const editBlog = asyncWrapper(async (req, res) => {
  const blog = await blogs.findByPk(req.params.id);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  await blog.update(req.body);
  res.json({ message: "Blog updated successfully", blog });
});

// DELETE /blogs/delete/:id
const deleteBlog = asyncWrapper(async (req, res) => {
  const blog = await blogs.findByPk(req.params.id);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  await blog.destroy();
  res.json({ message: "Blog deleted successfully" });
});

// PATCH /blogs/featured/:id
const toggleFeaturedStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const blog = await blogs.findByPk(id);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  blog.featured = !blog.featured;
  await blog.save();

  res.json({ message: "Featured status toggled", featured: blog.featured });
});

// PATCH /blogs/recommended/:id
const toggleRecommendedStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;

  const blog = await blogs.findByPk(id);
  if (!blog) return res.status(404).json({ error: "Blog not found" });

  blog.recommended = !blog.recommended;
  await blog.save();

  res.json({ message: "Recommended status toggled", recommended: blog.recommended });
});

// POST /blogs/search — lookup by slug (public route consumed by the website).
const getBlogsByUrl = asyncWrapper(async (req, res) => {
  const { url, placement } = req.body;

  if (!url) return res.status(400).json({ error: "Url query parameter is required" });

  // The public route may pass the slug with dashes turned into spaces (a v1
  // convention where urls were stored with spaces). v2 stores dash-slugs,
  // so match both the space form and the dash form.
  const variants = [url];
  const dashed = url.replace(/\s+/g, "-");
  if (dashed !== url) variants.push(dashed);

  const where = { url: { [Op.in]: variants } };
  if (placement) where.placement = placement;

  const blogList = await blogs.findAll({ where });
  res.json(blogList);
});

// GET /blogs/slug-availability?slug=my-slug — used by the editor to check
// whether a URL slug is already taken.
const checkSlugAvailability = asyncWrapper(async (req, res) => {
  const { slug, blogId } = req.query;

  if (!slug) return res.status(400).json({ error: "slug query parameter is required" });

  const where = { url: slug.trim() };
  // When editing, ignore the blog's own current slug.
  if (blogId) where.blog_id = { [Op.ne]: blogId };

  const existing = await blogs.findOne({ where });
  res.json({ available: !existing });
});

// GET /blogs/latest?category=technology
const getLatestBlogsByCategory = asyncWrapper(async (req, res) => {
  const { category, id } = req.query;
  const placement = req.query.placement || "blog";

  if (!category) return res.status(400).json({ error: "Category query parameter is required" });

  const whereClause = {
    category,
    type: "published",
    placement,
  };

  if (id) {
    whereClause.blog_id = { [Op.not]: id };
  }

  const latestBlogs = await blogs.findAll({
    where: whereClause,
    order: [["publishedDate", "DESC"]],
    limit: 3,
  });

  res.json(latestBlogs);
});

// POST /blogs/schedule — { blogId, publishAt }
// Stores the schedule on the row; jobs/blogPublishScheduler.js is what
// actually publishes it once scheduledAt has passed.
const schedulePublish = asyncWrapper(async (req, res) => {
  const { blogId, publishAt } = req.body;

  if (!blogId || !publishAt) {
    return res.status(400).json({ message: "blogId and publishAt are required" });
  }

  const blog = await blogs.findByPk(blogId);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  blog.scheduledAt = publishAt;
  blog.type = "scheduled";
  await blog.save();

  res.json({
    message: "Blog publish scheduled successfully",
    blogId,
    publishAt,
  });
});

// POST /blogs/:blogId/cancel
const cancelSchedulePublish = asyncWrapper(async (req, res) => {
  const { blogId } = req.params;

  const blog = await blogs.findByPk(blogId);
  if (!blog) {
    return res.status(404).json({ message: "Blog not found" });
  }

  if (!blog.scheduledAt) {
    return res.status(400).json({ message: "Blog is not scheduled" });
  }

  blog.scheduledAt = null;
  blog.type = "draft";
  await blog.save();

  res.status(200).json({ message: "Blog publish schedule cancelled successfully" });
});

// POST /blogs/:id/publish — { status: "publish" | "draft" }
const updateBlogPublishStatus = asyncWrapper(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (status !== "publish" && status !== "draft") {
    return res.status(400).json({ error: "'status' must be either 'publish' or 'draft'" });
  }

  const blog = await blogs.findByPk(id);
  if (!blog) {
    return res.status(404).json({ error: "Blog not found" });
  }

  blog.type = normalizeStatus(status);
  blog.scheduledAt = null;
  if (blog.type === "published") {
    blog.publishedAt = new Date();
  }
  await blog.save();

  return res.status(200).json({
    result: "SUCCESS",
    message: `Blog ${blog.type === "published" ? "published" : "drafted"} successfully`,
    blog,
  });
});

module.exports = {
  addBlog,
  schedulePublish,
  cancelSchedulePublish,
  getAllBlogsPaginated,
  getAdminBlogsPaginated,
  getAllBlogs,
  getBlogById,
  editBlog,
  deleteBlog,
  toggleFeaturedStatus,
  toggleRecommendedStatus,
  getBlogsByUrl,
  getLatestBlogsByCategory,
  updateBlogPublishStatus,
  checkSlugAvailability,
};
