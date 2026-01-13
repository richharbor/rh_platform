module "vpc" {
  source       = "../../modules/vpc"
  project_name = var.project_name
  environment  = var.environment
}

module "security_groups" {
  source       = "../../modules/security_groups"
  project_name = var.project_name
  environment  = var.environment
  vpc_id       = module.vpc.vpc_id
}

module "rds" {
  source         = "../../modules/rds"
  project_name   = var.project_name
  environment    = var.environment
  db_name        = "rh_server"

  db_username    = "postgres"
  db_password    = var.db_password
  subnet_ids     = module.vpc.public_subnet_ids
  db_sg_id       = module.security_groups.db_sg_id
  instance_class = "db.t3.small"
}


module "ec2" {
  source           = "../../modules/ec2"
  project_name     = var.project_name
  environment      = var.environment
  public_subnet_id = module.vpc.public_subnet_ids[0]
  web_sg_id        = module.security_groups.web_sg_id
  key_name         = var.key_name
}

module "s3" {
  source       = "../../modules/s3"
  project_name = var.project_name
  environment  = var.environment
}

module "sns" {
  source       = "../../modules/sns"
  project_name = var.project_name
  environment  = var.environment
}
