# CI/CD Secrets Configuration Guide

## Required GitHub Secrets

### Deployment (Netlify)
- `NETLIFY_AUTH_TOKEN` - Your Netlify authentication token
- `NETLIFY_SITE_ID_STAGING` - Site ID for staging environment
- `NETLIFY_SITE_ID_PROD` - Site ID for production environment
- `PRODUCTION_URL` - Production deployment URL for health checks

### Monitoring & Security
- `LHCI_GITHUB_APP_TOKEN` - Lighthouse CI GitHub token
- `SNYK_TOKEN` - Snyk security scanning token
- `CODECOV_TOKEN` - Codecov coverage reporting token (optional)

## How to Add Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its name and value

## Getting Your Tokens

### Netlify Auth Token
1. Log in to Netlify
2. Go to User Settings → Applications → Personal access tokens
3. Create a new token with appropriate permissions

### Netlify Site ID
1. Go to your Netlify site dashboard
2. Navigate to Site configuration → General
3. Copy the Site ID

### Lighthouse CI Token
1. Install Lighthouse CI GitHub App
2. Follow the setup instructions at https://github.com/apps/lighthouse-ci

### Snyk Token
1. Sign up at https://snyk.io
2. Go to Account Settings
3. Generate an API token

### Codecov Token
1. Sign up at https://codecov.io
2. Connect your GitHub repository
3. Find your upload token in settings

## Environment Variables

Copy `.env.example` to `.env` and fill in your Firebase and payment gateway credentials.

```bash
cp .env.example .env
```

## Local Testing

Before pushing to CI/CD, test locally:

```bash
npm run test          # Run tests
npm run test:coverage # Run tests with coverage
npm run build         # Build production bundle
npm run lint          # Check code quality
```

## Deployment Workflow

### Development Branch (`develop`)
- Automatic deployment to staging environment
- Runs all tests and linting
- Performance monitoring enabled

### Main Branch (`main`)
- Automatic deployment to production
- Requires all tests to pass
- Security scans run weekly
- Performance checks every 6 hours

## Monitoring Dashboards

### Lighthouse CI
- Performance scores tracked automatically
- Accessibility audits
- Best practices verification
- SEO optimization checks

### Codecov
- Test coverage reports
- Coverage diff on pull requests
- Historical coverage trends

### Snyk
- Dependency vulnerability scanning
- Automated security alerts
- License compliance checks

## Troubleshooting

### Build Fails
1. Check Node version (should be 20)
2. Clear node_modules and reinstall: `rm -rf node_modules; npm install`
3. Verify all environment variables are set

### Tests Fail
1. Run `npm run test:coverage` locally
2. Check for missing mocks in test setup
3. Ensure all dependencies are installed

### Deployment Fails
1. Verify Netlify tokens are correct
2. Check build output in GitHub Actions logs
3. Ensure dist folder is generated correctly

## Support

For issues with CI/CD pipeline:
1. Check GitHub Actions logs
2. Review workflow files in `.github/workflows/`
3. Test locally first
4. Consult documentation in README.md
