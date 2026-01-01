output "instance_public_ip" {
  value = aws_eip.main.public_ip
}
