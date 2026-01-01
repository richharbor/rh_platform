resource "aws_sns_topic" "otp" {
  name = "${var.project_name}-${var.environment}-otp-topic"

  tags = {
    Name        = "${var.project_name}-${var.environment}-otp-topic"
    Environment = var.environment
  }
}

# Example: SMS attributes (setting to transactional for OTP)
resource "aws_sns_sms_preferences" "update_sms_prefs" {
  default_sms_type = "Transactional"
}
