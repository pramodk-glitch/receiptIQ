variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "app_name" {
  description = "Application name prefix"
  type        = string
  default     = "receiptiq"
}

variable "db_password" {
  description = "PostgreSQL master password"
  type        = string
  sensitive   = true
}

variable "anthropic_api_key" {
  description = "Anthropic API key for Claude Vision OCR"
  type        = string
  sensitive   = true
}

variable "nextauth_secret" {
  description = "NextAuth.js secret (random string)"
  type        = string
  sensitive   = true
}

variable "app_domain" {
  description = "Optional custom domain for the app (leave empty to use EC2 public IP)"
  type        = string
  default     = ""
}

variable "instance_type" {
  description = "EC2 instance type"
  type        = string
  default     = "t3.micro"
}

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"
}

variable "allowed_ssh_cidr" {
  description = "CIDR block allowed to SSH into EC2 (use your IP/32)"
  type        = string
  default     = "0.0.0.0/0"
}
