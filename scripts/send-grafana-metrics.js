#!/usr/bin/env node

/**
 * Grafana Metrics Reporter
 * Sends build and deployment metrics to Grafana Cloud
 */

const GRAFANA_API_URL = process.env.GRAFANA_API_URL || 'https://grafana.com/api';
const GRAFANA_API_TOKEN = process.env.GRAFANA_API_TOKEN;

async function sendMetrics(metrics) {
  if (!GRAFANA_API_TOKEN) {
    console.log('⚠️  GRAFANA_API_TOKEN not set. Skipping metrics upload.');
    return;
  }

  try {
    // Use Grafana Cloud's Prometheus remote write endpoint
    const response = await fetch(`${GRAFANA_API_URL}/api/v1/import/prometheus`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GRAFANA_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ metrics })
    });

    if (response.ok) {
      console.log('✅ Metrics sent to Grafana successfully');
    } else {
      const error = await response.text();
      console.error('❌ Failed to send metrics:', error);
    }
  } catch (error) {
    console.error('❌ Error sending metrics to Grafana:', error.message);
  }
}

async function main() {
  const metrics = {
    deployment_timestamp: new Date().toISOString(),
    commit_sha: process.env.GITHUB_SHA || 'unknown',
    branch: process.env.GITHUB_REF_NAME || 'unknown',
    environment: process.env.GITHUB_REF === 'refs/heads/main' ? 'production' : 'staging',
    build_status: 'success',
    workflow_run_id: process.env.GITHUB_RUN_ID || 'unknown',
    repository: process.env.GITHUB_REPOSITORY || 'unknown'
  };

  console.log('📊 Preparing metrics for Grafana...');
  console.log('Metrics:', JSON.stringify(metrics, null, 2));

  await sendMetrics({ metrics });
}

main().catch(console.error);
