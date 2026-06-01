# ReceiptIQ

ReceiptIQ is a Next.js receipt tracking and OCR app.

## Deployment

This repo includes two GitHub Actions workflows for deployment:

- `.github/workflows/vercel-deploy.yml` — builds the app and deploys to Vercel.
- `.github/workflows/docker-build-push.yml` — builds a Docker image and pushes it to GitHub Container Registry (and Docker Hub if configured).

### Required secrets

- `VERCEL_TOKEN`
- `ANTHROPIC_API_KEY`
- `USE_LEGACY_ANTHROPIC_API` (set to `1` for the legacy Anthropic OCR endpoint)

### Optional secrets

- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID`
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`

### Quick local build

```powershell
npm install
npm run build
```

### Quick local Docker run

```powershell
docker build -t receiptiq:latest .
docker run -e ANTHROPIC_API_KEY="<your_key>" -e USE_LEGACY_ANTHROPIC_API="1" -p 3000:3000 receiptiq:latest
```

For more details, see `DEPLOYMENT.md`.
