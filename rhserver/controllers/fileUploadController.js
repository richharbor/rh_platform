const { PutObjectCommand, DeleteObjectCommand } = require("@aws-sdk/client-s3");
const s3 = require("../config/aws.js");

exports.uploadDocumentFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No file uploaded." });
        }

        const file = req.file;
        const fileName = `${file.originalname}`;

        const uploadParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `document/${fileName}`,
            Body: file.buffer,
            ContentType: file.mimetype,
        };

        await s3.send(new PutObjectCommand(uploadParams));

        const fileUrl = `${process.env.AWS_DOCUMENT_BUCKET_URL}/${fileName}`;

        res.status(200).json({
            message: "File uploaded successfully",
            fileUrl,
        });
    } catch (error) {
        console.error("S3 Upload Error:", error);
        res.status(500).json({ message: "Upload failed", error });
    }
};

exports.deleteDocumentFile = async (req, res) => {
    try {
        const { key } = req.body;

        if (!key) {
            return res.status(400).json({ message: "File key is required" });
        }

        const deleteParams = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: `document/${key}`,
        };

        await s3.send(new DeleteObjectCommand(deleteParams));

        res.status(200).json({
            message: "File deleted successfully",
            deletedKey: key,
        });
    } catch (error) {
        console.error("S3 Delete Error:", error);
        res.status(500).json({ message: "Delete failed", error });
    }
};