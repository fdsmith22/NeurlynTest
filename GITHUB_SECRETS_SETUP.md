# GitHub Secrets Setup for CI/CD

## Quick Setup Steps

### 1. Navigate to GitHub Secrets

Go to: https://github.com/fdsmith22/NeurlynTest/settings/secrets/actions

### 2. Required Secrets

#### MongoDB (Required for Backend)

**Secret Name:** `MONGODB_URI`
**Where to get it:**

- **MongoDB Atlas (Cloud):**
  1. Go to https://cloud.mongodb.com
  2. Click "Connect" on your cluster
  3. Choose "Connect your application"
  4. Copy the connection string
  5. Replace `<password>` with your actual password

- **Local MongoDB:** Use `mongodb://localhost:27017/neurlyn` for development only

#### Stripe (Required for Payments)

**Secret Name:** `STRIPE_SECRET_KEY`
**Where to get it:**

1. Go to https://dashboard.stripe.com/apikeys
2. Copy your Secret key (starts with `sk_test_` for test mode)

**Secret Name:** `STRIPE_WEBHOOK_SECRET`
**Where to get it:**

1. Go to https://dashboard.stripe.com/webhooks
2. Create a webhook endpoint
3. Copy the signing secret (starts with `whsec_`)

### 3. Optional Secrets

#### Snyk Security Scanning

**Secret Name:** `SNYK_TOKEN`
**Where to get it:**

1. Go to https://app.snyk.io/account
2. Click on "Auth Token"
3. Generate and copy token

## How to Add Secrets

1. Go to repository Settings → Secrets and variables → Actions
2. Click "New repository secret"
3. Enter the secret name exactly as shown above
4. Paste the secret value
5. Click "Add secret"

## Verify CI/CD is Working

After adding secrets, the CI/CD pipeline will automatically run when you:

- Push to main branch
- Create a pull request
- Manually trigger from Actions tab

### Check Pipeline Status

Go to: https://github.com/fdsmith22/NeurlynTest/actions

## GitHub Pages Setup

GitHub Pages should automatically deploy after successful builds.

To enable GitHub Pages:

1. Go to Settings → Pages
2. Source: Deploy from a branch
3. Branch: gh-pages (created by CI/CD)
4. Folder: / (root)

Your site will be available at:
https://fdsmith22.github.io/NeurlynTest/

## Environment-Specific Configuration

The application automatically detects environment:

- **Development:** localhost
- **Staging:** staging.neurlyn.com (if configured)
- **Production:** fdsmith22.github.io/NeurlynTest

## Troubleshooting

### Pipeline Fails at MongoDB Connection

- Ensure MONGODB_URI is correctly set
- Check if MongoDB Atlas IP whitelist includes GitHub Actions IPs (0.0.0.0/0 for testing)

### Stripe Webhook Fails

- Ensure webhook endpoint matches your deployment URL
- Update STRIPE_WEBHOOK_SECRET after creating webhook

### Build Fails

- Check that all npm packages are listed in package.json
- Ensure no console.log statements in production code
- Verify all tests pass locally with `npm test`

## Test Locally First

Before pushing, always test:

```bash
npm run lint
npm run test
npm run build
```

## Support

For CI/CD issues, check:

- GitHub Actions logs: https://github.com/fdsmith22/NeurlynTest/actions
- Repository Issues: https://github.com/fdsmith22/NeurlynTest/issues
