output "assets_bucket_name" {
  value = aws_s3_bucket.assets.id
}

output "documents_bucket_name" {
  value = aws_s3_bucket.documents.id
}
