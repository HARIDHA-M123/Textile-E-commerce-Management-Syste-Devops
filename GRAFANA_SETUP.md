# 📊 Grafana Monitoring Setup Guide

This guide will help you set up Grafana monitoring for your Coolbros e-commerce application.

## 🎯 What's Monitored

- ✅ Deployment status and frequency
- ✅ Build success/failure rates
- ✅ Test coverage trends
- ✅ Security vulnerability counts
- ✅ CI/CD pipeline metrics

## 🚀 Quick Start

### Step 1: Create Grafana Cloud Account

1. Go to [https://grafana.com](https://grafana.com)
2. Click **"Sign Up"** (free tier available)
3. Complete registration
4. Create a new **stack** (or use default)

### Step 2: Get Your Credentials

#### Get API Token:
1. In Grafana Cloud, click on your profile → **Organization**
2. Go to **API Keys** tab
3. Click **"Add API Key"**
4. Set:
   - **Name**: `github-actions`
   - **Role**: `MetricsPublisher`
   - **Time to Live**: `Never` (or set expiration)
5. Click **"Create"**
6. **Copy the token immediately** (you won't see it again!)

#### Get Your Instance URL:
1. Go to your stack dashboard
2. Your URL looks like: `https://your-stack-id.grafana.net`
3. Copy this URL (add `/api` at the end)
   - Example: `https://your-stack-id.grafana.net/api`

### Step 3: Add GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions

Add these secrets:

| Secret Name | Value | Example |
|------------|-------|---------|
| `GRAFANA_API_TOKEN` | Your API key from Step 2 | `glsa_abc123xyz...` |
| `GRAFANA_API_URL` | Your instance URL with `/api` | `https://your-stack-id.grafana.net/api` |

### Step 4: Import Dashboard

1. **In Grafana Cloud:**
   - Click **Dashboards** in left sidebar
   - Click **"Import dashboard"**
   - Click **"Upload dashboard JSON file"**

2. **Upload the file:**
   - From your repo: `grafana-dashboard.json`
   - Or copy the content and paste as JSON

3. **Configure:**
   - Select your **Prometheus data source**
   - Click **"Import"**

### Step 5: Verify It's Working

After your next push to `main` or `develop`:

1. Go to GitHub → Actions
2. Click on **"Performance Monitoring with Grafana"**
3. Check the step: **"Send metrics to Grafana Cloud"**
4. Should show: `✅ Metrics sent to Grafana successfully`

Then check your Grafana dashboard - you should see data appearing!

## 📈 Dashboard Panels Explained

### 1. Deployment Status
- Shows current deployment state per environment
- Green = Success, Red = Failed

### 2. Build Success Rate
- Gauge showing percentage of successful builds
- Target: >95%

### 3. Test Coverage Trend
- Line graph showing code coverage over time
- Tracks if coverage is improving or declining

### 4. Security Vulnerabilities
- Count of vulnerabilities found by Snyk
- Should trend downward to zero

### 5. Deployment Frequency
- How many deployments happen per hour
- Shows team velocity

## 🔧 Customization

### Add More Metrics

Edit `.github/workflows/performance-monitoring.yml`:

```yaml
- name: Send custom metrics to Grafana
  run: |
    curl -X POST \
      -H "Authorization: Bearer ${{ secrets.GRAFANA_API_TOKEN }}" \
      -H "Content-Type: application/json" \
      -d '{
        "metrics": {
          "custom_metric_name": YOUR_VALUE,
          "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'"
        }
      }' \
      ${{ secrets.GRAFANA_API_URL }}/metrics
```

### Modify Dashboard

1. In Grafana, click on any panel → **Edit**
2. Adjust queries, colors, thresholds
3. Click **"Save dashboard"** when done

### Add Alerts

1. Click **Alerting** → **New alert rule**
2. Select metric (e.g., `build_success_rate`)
3. Set threshold (e.g., `< 90%`)
4. Configure notification (email, Slack, etc.)
5. Save rule

## 🛠️ Troubleshooting

### "Metrics not appearing in Grafana"

1. Check GitHub Actions logs for errors
2. Verify `GRAFANA_API_TOKEN` secret is correct
3. Ensure token has `MetricsPublisher` permissions
4. Check that workflow is actually running

### "Authentication failed"

1. Regenerate API token in Grafana
2. Update GitHub secret
3. Wait 5 minutes for propagation

### "Dashboard shows no data"

1. Check time range selector (top right)
2. Set to last 1-6 hours
3. Verify Prometheus data source is connected
4. Check metric names match exactly

### "Workflow fails with curl error"

1. The `|| echo` in the command prevents failure
2. Check if GRAFANA_API_TOKEN is set
3. Verify the API URL format is correct

## 📊 Example Queries

You can create custom panels with these PromQL queries:

```promql
# Average build time
rate(build_duration_seconds_sum[1h]) / rate(build_duration_seconds_count[1h])

# Deployments today
sum(increase(deployments_total[24h]))

# Coverage trend
test_coverage_percent{branch="main"}

# Failed builds in last week
sum(increase(build_status{status="failed"}[7d]))
```

## 🎉 Next Steps

1. ✅ Set up email/Slack alerts for failed builds
2. ✅ Share dashboard with your team
3. ✅ Create mobile-friendly view
4. ✅ Set up automated reports
5. ✅ Add custom business metrics (e.g., orders/hour)

## 📚 Resources

- [Grafana Cloud Docs](https://grafana.com/docs/grafana-cloud/)
- [Prometheus Query Language](https://prometheus.io/docs/prometheus/latest/querying/basics/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)

## 💡 Tips

- Use **template variables** to switch between environments easily
- Set up **alert notifications** to Slack/Email
- Create **different views** for dev vs production
- Use **annotations** to mark deployments on graphs
- Enable **public sharing** for stakeholder dashboards

---

**Need Help?** Check the main `CI_CD_SETUP.md` for complete CI/CD configuration.
