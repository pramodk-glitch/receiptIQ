output "ec2_public_ip" {
  description = "Public IP address of the EC2 instance"
  value       = aws_eip.app.public_ip
}

output "ec2_public_dns" {
  description = "Public DNS of the EC2 instance"
  value       = aws_eip.app.public_dns
}

output "app_url" {
  description = "Application URL"
  value       = "http://${aws_eip.app.public_ip}"
}

output "cloudfront_domain" {
  description = "CloudFront distribution domain for receipt images"
  value       = aws_cloudfront_distribution.receipts.domain_name
}

output "s3_bucket_name" {
  description = "S3 bucket name for receipt images"
  value       = aws_s3_bucket.receipts.id
}

output "rds_endpoint" {
  description = "RDS PostgreSQL endpoint"
  value       = aws_db_instance.postgres.endpoint
  sensitive   = true
}

output "db_secret_arn" {
  description = "Secrets Manager ARN containing the DB connection string"
  value       = aws_secretsmanager_secret.db_url.arn
}

output "lambda_function_name" {
  description = "OCR Lambda function name"
  value       = aws_lambda_function.ocr_processor.function_name
}
