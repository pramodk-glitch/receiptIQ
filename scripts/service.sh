#!/usr/bin/env bash
# ReceiptIQ service management script
# Usage:
#   ./scripts/service.sh status          — check if site is up
#   ./scripts/service.sh logs [N]        — tail last N lines of container logs (default 50)
#   ./scripts/service.sh restart         — restart container with current image (no redeploy)
#   ./scripts/service.sh deploy          — trigger a fresh GHA build+deploy via workflow_dispatch
#   ./scripts/service.sh rollback        — restart with the previous ECR image
#   ./scripts/service.sh images          — list available ECR images

set -euo pipefail

INSTANCE_ID="i-0379ced6f271d21f5"
REGION="us-east-1"
REGISTRY="277623824865.dkr.ecr.us-east-1.amazonaws.com"
REPO="receiptiq"
ENV_FILE="/home/ubuntu/receiptiq.env"
NETWORK="receiptiq_net"
GH_REPO="pramodk-glitch/receiptIQ"
GH_BRANCH="develop"

# ── Helpers ───────────────────────────────────────────────────────────────────
run_ssm() {
  local cmd="$1"
  local cmd_id
  cmd_id=$(aws ssm send-command \
    --instance-ids "$INSTANCE_ID" \
    --document-name "AWS-RunShellScript" \
    --parameters "commands=[\"$cmd\"]" \
    --region "$REGION" \
    --query "Command.CommandId" \
    --output text)

  echo "SSM command: $cmd_id" >&2

  for i in $(seq 1 30); do
    local status
    status=$(aws ssm get-command-invocation \
      --command-id "$cmd_id" \
      --instance-id "$INSTANCE_ID" \
      --region "$REGION" \
      --query "Status" \
      --output text 2>/dev/null || echo "Pending")

    if [ "$status" = "Success" ]; then
      aws ssm get-command-invocation \
        --command-id "$cmd_id" \
        --instance-id "$INSTANCE_ID" \
        --region "$REGION" \
        --query "StandardOutputContent" \
        --output text
      return 0
    elif [ "$status" = "Failed" ] || [ "$status" = "Cancelled" ] || [ "$status" = "TimedOut" ]; then
      echo "❌ SSM command failed:" >&2
      aws ssm get-command-invocation \
        --command-id "$cmd_id" \
        --instance-id "$INSTANCE_ID" \
        --region "$REGION" \
        --query "[StandardOutputContent,StandardErrorContent]" \
        --output text >&2
      return 1
    fi
    sleep 3
  done
  echo "❌ Timed out waiting for SSM command" >&2
  return 1
}

latest_image() {
  aws ssm get-command-invocation \
    --command-id "$(aws ssm send-command \
      --instance-ids "$INSTANCE_ID" \
      --document-name "AWS-RunShellScript" \
      --parameters "commands=[\"docker images $REGISTRY/$REPO --format '{{.Repository}}:{{.Tag}}' | head -1\"]" \
      --region "$REGION" \
      --query "Command.CommandId" \
      --output text 2>/dev/null)" \
    --instance-id "$INSTANCE_ID" \
    --region "$REGION" \
    --query "StandardOutputContent" \
    --output text 2>/dev/null | head -1 | tr -d '[:space:]'
}

# ── Commands ──────────────────────────────────────────────────────────────────
cmd_status() {
  echo "🔍 Checking service status..."
  run_ssm "docker ps --format 'Name: {{.Names}}  Status: {{.Status}}  Ports: {{.Ports}}' | grep -E 'receiptiq|tsdb' || echo 'No containers running'"
  echo ""
  echo "🌐 HTTP check..."
  PUBLIC_IP=$(aws ec2 describe-instances \
    --instance-ids "$INSTANCE_ID" \
    --region "$REGION" \
    --query "Reservations[0].Instances[0].PublicIpAddress" \
    --output text 2>/dev/null || echo "unknown")
  if curl -sf --max-time 5 "http://$PUBLIC_IP" -o /dev/null; then
    echo "✅ Site is UP at http://$PUBLIC_IP"
  else
    echo "❌ Site is DOWN at http://$PUBLIC_IP"
  fi
}

cmd_logs() {
  local lines="${1:-50}"
  echo "📋 Last $lines lines of container logs..."
  run_ssm "docker logs receiptiq --tail $lines 2>&1 | strings | tail -$lines"
}

cmd_restart() {
  echo "🔄 Restarting container with current image..."
  local image
  image=$(run_ssm "docker inspect receiptiq --format '{{.Config.Image}}' 2>/dev/null || docker images $REGISTRY/$REPO --format '{{.Repository}}:{{.Tag}}' | head -1")
  image=$(echo "$image" | tr -d '[:space:]')
  echo "Using image: $image"
  run_ssm "/usr/local/bin/aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $REGISTRY 2>/dev/null; docker rm -f receiptiq 2>/dev/null || true; docker run -d --name receiptiq --network $NETWORK --env-file $ENV_FILE -p 80:3000 --restart unless-stopped $image && sleep 8 && docker ps | grep receiptiq && echo STARTED"
  echo "✅ Container restarted"
}

cmd_rollback() {
  echo "⏪ Rolling back to previous image..."
  local images
  images=$(run_ssm "docker images $REGISTRY/$REPO --format '{{.Repository}}:{{.Tag}}' | head -3")
  echo "Available images:"
  echo "$images"
  # Use the second image (index 1 = previous)
  local prev_image
  prev_image=$(echo "$images" | sed -n '2p' | tr -d '[:space:]')
  if [ -z "$prev_image" ]; then
    echo "❌ No previous image found"
    exit 1
  fi
  echo "Rolling back to: $prev_image"
  run_ssm "docker rm -f receiptiq 2>/dev/null || true && docker run -d --name receiptiq --network $NETWORK --env-file $ENV_FILE -p 80:3000 --restart unless-stopped $prev_image && sleep 8 && docker ps | grep receiptiq && echo ROLLED_BACK"
  echo "✅ Rolled back to $prev_image"
}

cmd_deploy() {
  echo "🚀 Triggering GHA build + deploy on branch: $GH_BRANCH"
  if ! command -v gh &>/dev/null; then
    echo "❌ GitHub CLI (gh) not installed. Install from https://cli.github.com"
    exit 1
  fi
  gh workflow run "Build and Deploy" --repo "$GH_REPO" --ref "$GH_BRANCH"
  echo "✅ Workflow triggered — check progress at:"
  echo "   https://github.com/$GH_REPO/actions"
}

cmd_images() {
  echo "📦 Available ECR images on EC2:"
  run_ssm "docker images $REGISTRY/$REPO --format 'Tag: {{.Tag}}  Created: {{.CreatedAt}}  Size: {{.Size}}'"
}

# ── Entry point ───────────────────────────────────────────────────────────────
CMD="${1:-status}"
shift || true

case "$CMD" in
  status)   cmd_status ;;
  logs)     cmd_logs "${1:-50}" ;;
  restart)  cmd_restart ;;
  rollback) cmd_rollback ;;
  deploy)   cmd_deploy ;;
  images)   cmd_images ;;
  *)
    echo "Usage: $0 {status|logs [N]|restart|rollback|deploy|images}"
    exit 1
    ;;
esac
