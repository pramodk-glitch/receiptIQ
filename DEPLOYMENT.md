# Deployment Guide

This project includes two GitHub Actions workflows for deployment.

## 1. Vercel deployment

Workflow: `.github/workflows/vercel-deploy.yml`

### Required secrets
- `VERCEL_TOKEN`: your Vercel personal token.
- `ANTHROPIC_API_KEY`: your Anthropic API key.
- `USE_LEGACY_ANTHROPIC_API`: set to `1` to enable the legacy Anthropic OCR endpoint.

### Optional secrets
- `VERCEL_ORG_ID`: if your token requires an explicit org ID.
- `VERCEL_PROJECT_ID`: if your token requires an explicit project ID.

### Trigger
- Push to `main`.
- Or run the workflow manually from GitHub Actions.

## 2. Docker image build and publish

Workflow: `.github/workflows/docker-build-push.yml`

### Required secrets
- `ANTHROPIC_API_KEY`
- `USE_LEGACY_ANTHROPIC_API`: set to `1` for the legacy API flow.

### Optional secrets
- `DOCKERHUB_USERNAME`
- `DOCKERHUB_TOKEN`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_SECRETS_MANAGER_SECRET_NAME`
- `AWS_REGION` (defaults to `us-east-1`)

### AWS Secrets Manager support

If your Anthropic API key is stored in AWS Secrets Manager, set the optional AWS secrets above and the workflows will retrieve `ANTHROPIC_API_KEY` at runtime from Secrets Manager. The value may be stored as either a plain string or a JSON object with `ANTHROPIC_API_KEY` as a key.

### Output
- Pushes image to GitHub Container Registry under `ghcr.io/<owner>/receiptiq:latest`
- If Docker Hub credentials are set, also pushes to `docker.io/<username>/receiptiq:latest`

## Local deployment quick start

```powershell
# install and build locally
npm install
npm run build
```

### Run with Docker locally

```powershell
docker build -t receiptiq:latest .
docker run -e ANTHROPIC_API_KEY="<your_key>" -e USE_LEGACY_ANTHROPIC_API="1" -p 3000:3000 receiptiq:latest
```

## Notes

- `USE_LEGACY_ANTHROPIC_API=1` is required if you want the code to use the legacy Anthropic endpoint.
- The Vercel workflow also uses the same env secrets during build so the app can compile with the correct OCR settings.
