# 🚀 Quick Setup - Add Grafana Credentials

## Your Repository is Updated! ✅

The code has been pushed to: 
**https://github.com/HARIDHA-M123/Textile-E-commerce-Management-Syste-Devops.git**

---

## ⚡ Next: Add GitHub Secrets (5 minutes)

### Step 1: Get Grafana Credentials

1. **Go to https://grafana.com**
2. **Sign up** (free account)
3. **Create a stack** (or use default)
4. **Get your API token:**
   - Click profile → **Organization**
   - Go to **API Keys** tab
   - Click **"Add API Key"**
   - Name: `github-actions`
   - Role: **MetricsPublisher**
   - Click **Create**
   - **COPY THE TOKEN** (you won't see it again!)

5. **Get your instance URL:**
   - Your URL: `https://YOUR-STACK-ID.grafana.net`
   - Add `/api`: `https://YOUR-STACK-ID.grafana.net/api`

---

### Step 2: Add Secrets to GitHub

1. **Go to your repository:**
   https://github.com/HARIDHA-M123/Textile-E-commerce-Management-Syste-Devops/settings/secrets/actions

2. **Click "New repository secret"**

3. **Add GRAFANA_API_TOKEN:**
   ```
   Name: GRAFANA_API_TOKEN
   Value: (paste your token from Grafana)
   ```
   Click **"Add secret"**

4. **Add GRAFANA_API_URL:**
   ```
   Name: GRAFANA_API_URL
   Value: https://your-stack-id.grafana.net/api
   ```
   Click **"Add secret"**

---

### Step 3: Verify It Works

1. **Go to Actions tab:**
   https://github.com/HARIDHA-M123/Textile-E-commerce-Management-Syste-Devops/actions

2. **You should see:** "Performance Monitoring with Grafana" workflow

3. **Wait for it to complete** (or click "Run workflow" to test manually)

4. **Check the logs:**
   - Click on the workflow run
   - Look for step: "Send metrics to Grafana Cloud"
   - Should show: ✅ "Metrics sent to Grafana successfully"

---

### Step 4: Import Dashboard in Grafana

1. **In Grafana Cloud:**
   - Click **Dashboards** → **Import dashboard**
   
2. **Upload the JSON file:**
   - From your repo: `grafana-dashboard.json`
   - Or download from: https://github.com/HARIDHA-M123/Textile-E-commerce-Management-Syste-Devops/blob/main/grafana-dashboard.json

3. **Select your Prometheus data source**

4. **Click "Import"**

5. **Done!** You should now see your monitoring dashboard! 🎉

---

## 📋 Summary of Secrets Needed

| Secret Name | Where to Get | Example |
|------------|--------------|---------|
| `GRAFANA_API_TOKEN` | Grafana Org → API Keys | `glsa_abc123xyz...` |
| `GRAFANA_API_URL` | Your Grafana stack URL + `/api` | `https://abc123.grafana.net/api` |

---

## 🔗 Quick Links

- **Add Secrets:** https://github.com/HARIDHA-M123/Textile-E-commerce-Management-Syste-Devops/settings/secrets/actions/new
- **View Actions:** https://github.com/HARIDHA-M123/Textile-E-commerce-Management-Syste-Devops/actions
- **Grafana Dashboard:** https://grafana.com
- **Setup Guide:** See `GRAFANA_SETUP.md` in your repo

---

## ✅ Checklist

- [ ] Created Grafana Cloud account
- [ ] Generated API token
- [ ] Added `GRAFANA_API_TOKEN` to GitHub secrets
- [ ] Added `GRAFANA_API_URL` to GitHub secrets
- [ ] Verified workflow runs successfully
- [ ] Imported dashboard in Grafana

---

**Need Help?** Check `GRAFANA_SETUP.md` for detailed instructions!
