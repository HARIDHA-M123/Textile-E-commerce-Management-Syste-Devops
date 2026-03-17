# CI/CD Secrets Configuration Guide

## Required GitHub Secrets

### Deployment (Netlify)
- `NETLIFY_AUTH_TOKEN` - Your Netlify authentication token
- `NETLIFY_SITE_ID_STAGING` - Site ID for staging environment
- `NETLIFY_SITE_ID_PROD` - Site ID for production environment
- `PRODUCTION_URL` - Production deployment URL for health checks

### Monitoring & Security
- `GRAFANA_API_TOKEN` - Grafana Cloud API token for metrics
- `GRAFANA_API_URL` - Your Grafana instance URL (e.g., https://your-instance.grafana.net/api)
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

### Grafana API Token
1. Log in to Grafana Cloud (or your hosted Grafana instance).
2. Go to Settings → API Keys.
3. Create a new key with appropriate permissions.
4. Use this token to authenticate Grafana integrations.

### Snyk Token
1. Sign up at https://snyk.io
2. Go to Account Settings
3. Generate an API token

### Codecov Token
1. Sign up at https://codecov.io
2. Connect your GitHub repository
3. Find your upload token in settings

## Environment Variables

### Grafana Setup

#### Setting Up Grafana Cloud
1. **Sign up for Grafana Cloud** at https://grafana.com
2. **Create a new stack** or use existing one
3. **Generate an API token:**
   - Go to Organization → API Keys
   - Create a key with `MetricsPublisher` permissions
   - Copy the token and save it securely
4. **Get your instance URL:**
   - Your Grafana URL will be like: `https://your-stack-id.grafana.net`
   - Use this as `GRAFANA_API_URL`

#### Configuring Data Sources
1. **Log in to your Grafana Cloud instance**
2. **Navigate to Connections → Data sources**
3. **Add Prometheus data source:**
   - Click "Add data source"
   - Select "Prometheus"
   - Use the provided Prometheus URL from Grafana Cloud
   - Click "Save & Test"

#### Import Dashboard
1. **Download the dashboard configuration** from your repository:
   - File: `grafana-dashboard.json`
2. **In Grafana, go to Dashboards → Import**
3. **Upload the JSON file**
4. **Select your Prometheus data source**
5. **Click "Import"**

#### Dashboard Panels
The pre-configured dashboard includes:
- **Deployment Status** - Current deployment state per environment
- **Build Success Rate** - Percentage of successful builds
- **Test Coverage Trend** - Code coverage over time
- **Security Vulnerabilities** - Total vulnerabilities found
- **Deployment Frequency** - How often deployments happen

#### CI/CD Integration
The GitHub Actions workflow automatically sends metrics to Grafana:
- Deployment timestamps
- Commit information
- Build status
- Test coverage results
- Security scan results

#### Grafana Cloud Token (Optional)
- If using Grafana Cloud, generate an API token:
  1. Log in to Grafana Cloud.
  2. Go to Settings → API Keys.
  3. Create a new key with appropriate permissions.
- Add the token as a GitHub secret:
  - `GRAFANA_API_TOKEN` - Grafana Cloud API token.

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
