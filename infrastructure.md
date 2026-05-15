# ReceiptIQ — Implementation & AWS Deployment Plan

---

## Team

| Role | Responsibility | Phase needed |
|---|---|---|
| Full-stack engineer (web + API) | Next.js frontend, Node.js API, database | Phase 1 |
| Mobile engineer (React Native) | iOS + Android app, camera, push notifications | Phase 1 |
| AI / integrations engineer | OCR pipeline, email parsers, Claude API | Phase 1 |
| DevOps engineer (part-time) | AWS provisioning, CI/CD, monitoring | Phase 1 |
| Product / design | UI decisions, user research, copy | Phase 1 |

A lean founding team of 2–3 strong full-stack engineers can cover these roles to get Phase 1 into production. Mobile and DevOps are where gaps show up first.

---

## Timeline

| Phase | What ships | Estimated duration |
|---|---|---|
| Phase 1 — Core | Auth, OCR scan, line-item storage, dashboard | 10–14 weeks |
| Phase 2 — Intelligence | Price history, vendor comparison, inflation tracker | +8 weeks |
| Phase 3 — Smart Shopping | List estimator, budget alerts, spend forecasting | +8 weeks |
| Phase 4 — Auto-Ingestion + Bills | Gmail OAuth, email parsers, bills, weekly review, push notifications | +10 weeks |
| Phase 5 — Full Life Spend | Medical bills, browser extension, retailer API partnerships | +12 weeks |

**Total to full v1: 12–18 months** with a team of 3, assuming no major pivots.

---

## AWS Architecture

### Core services

| Service | Purpose |
|---|---|
| **ECS Fargate** | Runs Node.js API containers — auto-scales without managing servers |
| **RDS PostgreSQL** | Primary database, Multi-AZ for reliability, TimescaleDB extension for price history |
| **ElastiCache Redis** | Sessions, rate limiting, job queues |
| **S3** | Receipt image storage |
| **Lambda** | OCR processing jobs — triggered when a receipt image lands in S3, pay per scan only |
| **SES + API Gateway** | Inbound email ingestion for receipts@receiptiq.app (forward-to-email channel) |
| **SNS** | Fan-out push notifications to APNs (Apple) and FCM (Google) |
| **SQS** | Background job queue for email parsing, backfill jobs, and notification scheduling |
| **CloudFront** | CDN in front of S3 for fast receipt image delivery |
| **Cognito** | OAuth (Google, Apple) — avoids building auth from scratch |
| **Route 53** | DNS for receiptiq.app and receipts.receiptiq.app subdomain |
| **Certificate Manager** | Free SSL for all domains |
| **Secrets Manager** | OAuth tokens, API keys, Claude API key — encrypted at rest |

### Frontend hosting
- **Vercel** for the Next.js web app — simpler than AWS Amplify, deploys on every merge, integrates with GitHub natively
- Points to the ECS API via environment variable

### Architecture diagram
```
User (iOS / Android / Web)
        │
        ├── Vercel (Next.js web)
        │
        └── CloudFront → ECS Fargate (Node.js API)
                                │
                ┌───────────────┼───────────────┐
                │               │               │
           RDS Postgres    ElastiCache     S3 (images)
           + TimescaleDB     Redis
                │               │
                │           SQS Queue
                │               │
                │           Lambda (OCR jobs / email parsing)
                │               │
                │           Claude API (Vision + Intelligence)
                │
                └── SNS → APNs (iOS push)
                       └── FCM (Android push)

Inbound email:
receipts@receiptiq.app → SES → API Gateway → Lambda → SQS → Parser
```

---

## CI/CD Pipeline

```
Developer pushes to GitHub
        │
        └── GitHub Actions
                ├── Run tests (Jest + Playwright)
                ├── Build Docker image
                ├── Push to ECR (Elastic Container Registry)
                ├── Deploy to ECS Fargate (rolling update)
                ├── Run DB migrations (Flyway)
                └── Expo EAS Build (mobile OTA update or store build)

Environments: dev → staging → production
Merges to main → staging auto-deploy
Merges to release → production deploy with manual approval gate
```

### Infrastructure as code
- **Terraform** or **AWS CDK** — entire AWS setup version-controlled and reproducible
- Separate stacks for networking, compute, database, and storage
- Environment variables injected from Secrets Manager at deploy time

---

## Monthly AWS Cost Estimates

| Stage | Monthly cost | What's running |
|---|---|---|
| Dev / staging | ~$80–150 | Small RDS t3.micro, single Fargate task, minimal Lambda |
| Early production (0–1k users) | ~$300–500 | RDS t3.medium, Fargate autoscaling, S3, CloudFront |
| Growth (1k–10k users) | ~$800–1,500 | RDS scaling up, more Lambda invocations, Redis cluster |
| Scale (10k+ users) | ~$2,500–5,000 | Multi-AZ RDS, larger Fargate cluster, heavy Lambda usage |

### Additional costs (not AWS)
| Service | Cost |
|---|---|
| Claude API (OCR + intelligence) | ~$0.003 per receipt scan — 10k scans/mo ≈ $30 |
| Vercel (web hosting) | Free tier covers early stage, Pro $20/mo |
| Expo EAS Build (mobile) | Free tier for low volume, $29/mo at scale |
| SendGrid (inbound email parsing) | Free up to 100 inbound/day, $19.95/mo beyond |
| Sentry (error monitoring) | Free tier, $26/mo for teams |
| Datadog (APM) | ~$15/host/mo |

---

## Hardest Parts — Where to Budget Extra Time

### 1. Email parser maintenance
Retailer email templates change 2–4× per year. Each parser needs a version hash and a monitoring system that alerts when confidence scores drop. Plan for ongoing maintenance — this never stops.

### 2. Claude Vision OCR accuracy
Works well for clean receipts, struggles with crumpled paper, bad lighting, or handwritten checks. A user-facing "correct this item" flow is required from Phase 1, not a nice-to-have.

### 3. Vendor price comparison
No clean API for live retail prices exists. The plan relies on Google Shopping data, selective web scraping (with legal caution), and Claude's knowledge. This is the fuzziest part of the technical spec and the most likely to need an architectural pivot.

### 4. Mobile camera UX
Getting receipt scanning to feel fast and reliable on a phone requires real polish — lighting detection, auto-crop, angle correction. Allocate 2–3 extra weeks here versus the estimate.

### 5. TimescaleDB at scale
Straightforward to start. Query optimization on price history across millions of items and users needs attention from ~50k users onward.

### 6. iOS push notification background actions
The inline Keep / Dismiss buttons in push notifications require a background fetch entitlement on iOS and careful handling of the UNNotificationResponse API. Allow extra time for App Store review with this entitlement.

---

## De-risking — What to Validate First

Before building any UI, validate these in order:

1. **OCR pipeline** — run Claude Vision against 50 real-world receipt photos (crumpled, dark, angled). If accuracy is below 90%, the product concept needs to adjust before any other work starts
2. **Email parser on real inboxes** — test against actual Amazon and Walmart emails, not samples. Retailer emails vary by account type, region, and order type
3. **One real user scanning real receipts** — within the first 4 weeks of Phase 1, not a demo
4. **Vendor price comparison feasibility** — spike this in week 2; don't assume it works at acceptable cost and accuracy
5. **Push notification inline actions** — test on a real iOS device early; the simulator behaviour differs from production

---

## Security Checklist

- [ ] All OAuth tokens encrypted at rest in Secrets Manager — never in environment variables
- [ ] RDS in private subnet — no public internet access
- [ ] API rate limiting on all endpoints via Redis (ElastiCache)
- [ ] Input validation on all receipt uploads (file type, size, MIME)
- [ ] Receipt images in private S3 bucket — CloudFront signed URLs only
- [ ] Raw email content never written to disk or database — parsed in-memory only
- [ ] Account numbers and policy numbers redacted before storage (regex + Claude detection)
- [ ] Medical data flagged with sensitivity level, excluded from household shared views
- [ ] JWT refresh token rotation on every use
- [ ] GDPR: full data export endpoint + deletion endpoint from day one
- [ ] Penetration test before public launch

---

## Launch Readiness Checklist

- [ ] Error monitoring live (Sentry)
- [ ] APM live (Datadog)
- [ ] Automated DB backups tested and restored at least once
- [ ] Load test at 10× expected day-one traffic
- [ ] App Store and Google Play submissions approved
- [ ] Privacy policy and terms of service live at receiptiq.app/privacy
- [ ] GDPR data processing agreement available
- [ ] Support email / help desk set up
- [ ] Status page live (statuspage.io or similar)
- [ ] Runbook written for the 5 most likely outage scenarios
