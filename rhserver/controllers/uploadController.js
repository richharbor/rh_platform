const {
  PutObjectCommand,
  ListObjectsV2Command,
  DeleteObjectCommand,
} = require("@aws-sdk/client-s3");
const s3 = require("../config/aws");
const asyncWrapper = require("../utils/asyncWrapper");

// Ported from tps-next-backend's controllers/fileUploadController.js —
// blogs-only subset (uploadBlogsFile / getAllBlogFiles / deleteBlogFile).
// Every non-blog upload type in the source file (ai-products, recordings,
// resumes, events, projects, written-course, the generic media-library
// picker across multiple prefixes) is out of scope for this build.
//
// AWS_BLOG_BUCKET_URL is the blog *prefix* URL (e.g.
// `https://<bucket>.s3.<region>.amazonaws.com/blogs`), not the bucket root —
// see the equivalent note in source. Keys are stored/served relative to it.

// POST /upload/blogs — multipart/form-data, field name "file".
const uploadBlogsFile = asyncWrapper(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded." });
  }

  const file = req.file;
  const timestamp = Date.now();
  const fileName = `${timestamp}-${file.originalname}`;

  const uploadParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `blogs/${fileName}`,
    Body: file.buffer,
    ContentType: file.mimetype,
  };

  await s3.send(new PutObjectCommand(uploadParams));

  const fileUrl = `${process.env.AWS_BLOG_BUCKET_URL}/${fileName}`;

  res.status(200).json({
    message: "File uploaded successfully",
    fileUrl,
  });
});

// GET /upload/blogs — lists everything under the blogs/ prefix.
const getAllBlogFiles = asyncWrapper(async (req, res) => {
  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Prefix: "blogs/",
  };

  const data = await s3.send(new ListObjectsV2Command(params));

  if (!data.Contents || data.Contents.length === 0) {
    return res.status(200).json({ message: "No files found in blogs folder", files: [] });
  }

  const files = data.Contents.map((file) => {
    const keyWithoutPrefix = file.Key.replace(/^blogs\//, "");
    return {
      key: keyWithoutPrefix,
      url: `${process.env.AWS_BLOG_BUCKET_URL}/${keyWithoutPrefix}`,
      size: file.Size,
      lastModified: file.LastModified,
    };
  });

  res.status(200).json({
    message: "Files retrieved successfully",
    files,
  });
});

// DELETE /upload/blogs — { key } (key without the "blogs/" prefix).
const deleteBlogFile = asyncWrapper(async (req, res) => {
  const { key } = req.body;

  if (!key) {
    return res.status(400).json({ message: "File key is required" });
  }

  const deleteParams = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: `blogs/${key}`,
  };

  await s3.send(new DeleteObjectCommand(deleteParams));

  res.status(200).json({
    message: "File deleted successfully",
    deletedKey: key,
  });
});

module.exports = {
  uploadBlogsFile,
  getAllBlogFiles,
  deleteBlogFile,
};
