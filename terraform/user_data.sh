#!/bin/bash
set -euo pipefail

export DEBIAN_FRONTEND=noninteractive
apt-get update -y
apt-get install -y docker.io docker-compose-plugin awscli jq curl git

systemctl enable docker
systemctl start docker

mkdir -p /opt/receiptiq

# ── fetch secrets ────────────────────────────────────────────────────────────
REGION="${AWS_REGION}"

DB_URL=$(aws secretsmanager get-secret-value \
  --region "$REGION" \
  --secret-id "${DB_SECRET_ARN}" \
  --query SecretString --output text)

ANTHROPIC_KEY=$(aws secretsmanager get-secret-value \
  --region "$REGION" \
  --secret-id "${ANTHROPIC_SECRET_ARN}" \
  --query SecretString --output text)

NEXTAUTH_SECRET_VAL=$(aws secretsmanager get-secret-value \
  --region "$REGION" \
  --secret-id "${NEXTAUTH_SECRET_ARN}" \
  --query SecretString --output text)

EC2_PUBLIC_IP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

# ── write env ────────────────────────────────────────────────────────────────
cat > /opt/receiptiq/.env <<ENVEOF
DATABASE_URL=$DB_URL
NEXTAUTH_SECRET=$NEXTAUTH_SECRET_VAL
NEXTAUTH_URL=http://$EC2_PUBLIC_IP
ANTHROPIC_API_KEY=$ANTHROPIC_KEY
AWS_REGION=${AWS_REGION}
S3_BUCKET_NAME=${S3_BUCKET}
CLOUDFRONT_DOMAIN=${CLOUDFRONT_DOMAIN}
NODE_ENV=production
ENVEOF
chmod 600 /opt/receiptiq/.env

# ── clone & build ────────────────────────────────────────────────────────────
git clone https://github.com/pramodk-glitch/receiptIQ.git /opt/receiptiq/repo
cd /opt/receiptiq/repo
cp /opt/receiptiq/.env .env

docker build -t receiptiq/app:latest .

# ── run migrations then start ─────────────────────────────────────────────────
docker run --rm --env-file /opt/receiptiq/.env receiptiq/app:latest \
  sh -c "npx prisma migrate deploy"

docker run -d \
  --name receiptiq \
  --restart unless-stopped \
  -p 80:3000 \
  --env-file /opt/receiptiq/.env \
  receiptiq/app:latest

echo "ReceiptIQ started $(date)"
