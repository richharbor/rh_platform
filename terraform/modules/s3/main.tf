resource "aws_s3_bucket" "assets" {
  bucket = "richharbor-${var.project_name}-${var.environment}-assets"

  tags = {
    Name        = "richharbor-${var.project_name}-${var.environment}-assets"
    Environment = var.environment
  }
}

resource "aws_s3_bucket" "documents" {
  bucket = "richharbor-${var.project_name}-${var.environment}-documents"


  tags = {
    Name        = "${var.project_name}-${var.environment}-documents"
    Environment = var.environment
  }
}

resource "aws_s3_bucket_public_access_block" "assets" {
  bucket = aws_s3_bucket.assets.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}
