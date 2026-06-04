#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y docker.io docker-compose-plugin awscli jq curl git

systemctl enable docker
systemctl start docker

mkdir -p /opt/receiptiq
mkdir -p /home/ubuntu

# ── fetch secrets ────────────────────────────────────────────────────────────
REGION="${AWS_REGION}"

DB_URL=$(aws secretsmanager get-secret-value \
  --region "$REGION" \
  --secret-id "${DB_SECRET_ARN}" \
  --query SecretString --output text)

NEXTAUTH_SECRET_VAL=$(aws secretsmanager get-secret-value \
  --region "$REGION" \
  --secret-id "${NEXTAUTH_SECRET_ARN}" \
  --query SecretString --output text)

EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# ── write env file (used by both initial start and CI/CD deploys) ─────────────
# startup.js resolves ANTHROPIC_API_KEY from Secrets Manager at container start.
cat > /home/ubuntu/receiptiq.env <<ENVEOF
DATABASE_URL=$DB_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET_VAL
NEXTAUTH_URL=http://$EC2_PUBLIC_IP
ANTHROPIC_SECRET_ARN=${ANTHROPIC_SECRET_ARN}
AWS_REGION=${AWS_REGION}
S3_BUCKET_NAME=${S3_BUCKET}
CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}
NODE_ENV=production
ENVEOF
chmod 600 /home/ubuntu/receiptiq.env

# Keep a copy in /opt for reference
cp /home/ubuntu/receiptiq.env /opt/receiptiq/.env

# ── pull and start from ECR (CI/CD will take over subsequent deploys) ─────────
# The CI/CD pipeline handles docker pull + run via SSM; initial boot just
# ensures Docker is ready and the env file exists.
echo "ReceiptIQ env configured at $(date). CI/CD will deploy the image."
