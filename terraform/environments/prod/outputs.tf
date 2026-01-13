output "ec2_public_ip" {
  value = module.ec2.instance_public_ip
}

output "rds_endpoint" {
  value = module.rds.db_instance_endpoint
}

output "assets_bucket" {
  value = module.s3.assets_bucket_name
}

output "documents_bucket" {
  value = module.s3.documents_bucket_name
}

output "sns_topic_arn" {
  value = module.sns.sns_topic_arn
}
