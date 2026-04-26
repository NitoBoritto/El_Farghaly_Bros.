/* ═══════════════════════════════════════════════════════
   dashboard.js
   Owns all live API calls and real-data chart rendering.
   UI animations and effects stay in main.js.
═══════════════════════════════════════════════════════ */

(function () {

  const chartTextColor = '#f4fbff';

  async function fetchLoanByAgeData() {
    const res = await fetch('/api/charts/personal-loan-by-age');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchCampaignsByMonthData() {
    const res = await fetch('/api/charts/campaigns-by-month');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchDefaultByJobData() {
    const res = await fetch('/api/charts/default-by-job');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  async function fetchFinancialCommitmentLevelData() {
    const res = await fetch('/api/charts/financial-commitment-level');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function renderLoanByAge(chartData) {
    const canvas = document.getElementById('ageDistChart');
    if (!canvas) return;

    if (window._ageDistChart instanceof Chart) {
      window._ageDistChart.destroy();
    }

    const labels = Array.isArray(chartData.labels) ? chartData.labels : [];
    const yes = Array.isArray(chartData.loan_yes) ? chartData.loan_yes : [];
    const no = Array.isArray(chartData.loan_no) ? chartData.loan_no : [];

    window._ageDistChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Loan: Yes',
            data: yes,
            backgroundColor: 'rgba(0, 229, 160, 0.65)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Loan: No',
            data: no,
            backgroundColor: 'rgba(255, 76, 106, 0.65)',
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 900 },
        plugins: {
          legend: {
            labels: {
              color: chartTextColor,
              boxWidth: 10,
              font: { size: 9, family: 'JetBrains Mono, monospace' },
            },
          },
          tooltip: {
            backgroundColor: '#0a1223',
            borderColor: 'rgba(240,180,41,0.3)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} customers`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: { color: chartTextColor, font: { size: 9 } },
          },
          y: {
            grid: { color: 'rgba(240,180,41,0.05)' },
            ticks: { color: chartTextColor },
            title: {
              display: true,
              text: 'Number of Customers',
              color: chartTextColor,
              font: { size: 9 },
            },
          },
        },
      },
    });
  }

  function renderCampaignsByMonth(chartData) {
    const canvas = document.getElementById('campaignsByMonthChart');
    if (!canvas) return;

    if (window._campaignsByMonthChart instanceof Chart) {
      window._campaignsByMonthChart.destroy();
    }

    const labels = Array.isArray(chartData.labels) ? chartData.labels : [];
    const campaigns = Array.isArray(chartData.campaigns_total) ? chartData.campaigns_total : [];

    window._campaignsByMonthChart = new Chart(canvas, {
      type: 'line',
      data: {
        labels,
        datasets: [
          {
            label: 'Total Campaign Contacts',
            data: campaigns,
            borderColor: '#f0b429',
            backgroundColor: 'rgba(240,180,41,0.12)',
            fill: true,
            tension: 0.35,
            borderWidth: 2.5,
            pointRadius: 3,
            pointHoverRadius: 5,
            pointBackgroundColor: '#f0b429',
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 900 },
        plugins: {
          legend: {
            labels: {
              color: chartTextColor,
              boxWidth: 10,
              font: { size: 9, family: 'JetBrains Mono, monospace' },
            },
          },
          tooltip: {
            backgroundColor: '#0a1223',
            borderColor: 'rgba(240,180,41,0.3)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw}`,
            },
          },
        },
        scales: {
          x: {
            grid: { color: 'rgba(240,180,41,0.04)' },
            ticks: { color: chartTextColor, font: { size: 9 } },
            title: {
              display: true,
              text: 'Month',
              color: chartTextColor,
              font: { size: 9 },
            },
          },
          y: {
            grid: { color: 'rgba(240,180,41,0.05)' },
            ticks: { color: chartTextColor },
            title: {
              display: true,
              text: 'Campaign Count',
              color: chartTextColor,
              font: { size: 9 },
            },
          },
        },
      },
    });
  }

  function renderDefaultByJob(chartData) {
    const canvas = document.getElementById('defaultByJobChart');
    if (!canvas) return;

    if (window._defaultByJobChart instanceof Chart) {
      window._defaultByJobChart.destroy();
    }

    const labels = Array.isArray(chartData.labels) ? chartData.labels : [];
    const yes = Array.isArray(chartData.default_yes) ? chartData.default_yes : [];
    const no = Array.isArray(chartData.default_no) ? chartData.default_no : [];

    window._defaultByJobChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels,
        datasets: [
          {
            label: 'Default: Yes',
            data: yes,
            backgroundColor: 'rgba(255, 76, 106, 0.72)',
            borderRadius: 4,
            borderSkipped: false,
          },
          {
            label: 'Default: No',
            data: no,
            backgroundColor: 'rgba(0, 229, 160, 0.65)',
            borderRadius: 4,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 900 },
        plugins: {
          legend: {
            labels: {
              color: chartTextColor,
              boxWidth: 10,
              font: { size: 9, family: 'JetBrains Mono, monospace' },
            },
          },
          tooltip: {
            backgroundColor: '#0a1223',
            borderColor: 'rgba(240,180,41,0.3)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.dataset.label}: ${ctx.raw} customers`,
            },
          },
        },
        scales: {
          x: {
            grid: { display: false },
            ticks: {
              color: chartTextColor,
              maxRotation: 35,
              minRotation: 20,
              font: { size: 9 },
            },
            title: {
              display: true,
              text: 'Job Title',
              color: chartTextColor,
              font: { size: 9 },
            },
          },
          y: {
            grid: { color: 'rgba(240,180,41,0.05)' },
            ticks: { color: chartTextColor },
            title: {
              display: true,
              text: 'Number of Customers',
              color: chartTextColor,
              font: { size: 9 },
            },
          },
        },
      },
    });
  }

  function renderFinancialCommitmentLevel(chartData) {
    const canvas = document.getElementById('financialCommitmentChart');
    if (!canvas) return;

    if (window._financialCommitmentChart instanceof Chart) {
      window._financialCommitmentChart.destroy();
    }

    const labels = Array.isArray(chartData.labels) ? chartData.labels : [];
    const values = Array.isArray(chartData.values) ? chartData.values : [];

    window._financialCommitmentChart = new Chart(canvas, {
      type: 'pie',
      data: {
        labels,
        datasets: [
          {
            data: values,
            backgroundColor: [
              'rgba(0, 229, 160, 0.78)',
              'rgba(240, 180, 41, 0.82)',
              'rgba(255, 76, 106, 0.78)',
              'rgba(68, 138, 255, 0.78)',
            ],
            borderColor: '#070d1a',
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        animation: { duration: 900 },
        plugins: {
          legend: {
            position: 'bottom',
            labels: {
              color: chartTextColor,
              boxWidth: 10,
              font: { size: 9, family: 'JetBrains Mono, monospace' },
            },
          },
          tooltip: {
            backgroundColor: '#0a1223',
            borderColor: 'rgba(240,180,41,0.3)',
            borderWidth: 1,
            callbacks: {
              label: ctx => ` ${ctx.label}: ${ctx.raw} customers`,
            },
          },
        },
      },
    });
  }

  function renderError(message) {
    const canvas = document.getElementById('ageDistChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = 'rgba(255,76,106,0.7)';
    ctx.font = '11px JetBrains Mono, monospace';
    ctx.textAlign = 'center';
    ctx.fillText(message, canvas.width / 2, canvas.height / 2);
  }

  async function initDashboard() {
    try {
      const [loanByAgeData, financialCommitmentLevelData, campaignsByMonthData, defaultByJobData] = await Promise.all([
        fetchLoanByAgeData(),
        fetchFinancialCommitmentLevelData(),
        fetchCampaignsByMonthData(),
        fetchDefaultByJobData(),
      ]);

      if (window.Chart) {
        renderLoanByAge(loanByAgeData);
        renderFinancialCommitmentLevel(financialCommitmentLevelData);
        renderCampaignsByMonth(campaignsByMonthData);
        renderDefaultByJob(defaultByJobData);
      } else {
        const interval = setInterval(() => {
          if (window.Chart) {
            clearInterval(interval);
            renderLoanByAge(loanByAgeData);
            renderFinancialCommitmentLevel(financialCommitmentLevelData);
            renderCampaignsByMonth(campaignsByMonthData);
            renderDefaultByJob(defaultByJobData);
          }
        }, 150);
      }
    } catch (err) {
      console.error('[dashboard.js] Failed to load chart data:', err);
      renderError('Could not load data — check API connection');
    }
  }

  const section = document.getElementById('analytics');
  if (section) {
    const io = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        initDashboard();
        io.disconnect();
      }
    }, { threshold: 0.05 });
    io.observe(section);
  } else {
    initDashboard();
  }

  async function fetchOverviewMetrics() {
    const res = await fetch('/api/overview/performance');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  }

  function setMetricValue(id, value, suffix) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = `${value}${suffix || ''}`;
    el.classList.remove('empty');
  }

  function setMetricMeta(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    el.textContent = value;
  }

  async function initOverviewMetrics() {
    try {
      const metrics = await fetchOverviewMetrics();
      setMetricValue('totalCustomersValue', Number(metrics.total_customers || 0).toLocaleString(), '');
      setMetricMeta('totalCustomersMeta', 'Row count from Transformed.Bank');

      setMetricValue('subscriptionRateValue', Number(metrics.subscription_rate || 0).toFixed(1), '%');
      setMetricMeta('subscriptionRateMeta', 'Computed from y yes/no split');

      setMetricValue('avgCallDurationValue', Number(metrics.avg_call_duration || 0).toFixed(1), ' s');
      setMetricMeta('avgCallDurationMeta', 'Average duration from the database');

      setMetricValue('macroEnvironmentLabelValue', metrics.most_frequent_macro_environment || 'Unknown', '');
      setMetricMeta('macroEnvironmentLabelMeta', 'Mode of macro_environment_label');

      setMetricValue('avgEngagementScoreValue', Number(metrics.avg_engagement_score || 0).toFixed(2), '');
      setMetricMeta('avgEngagementScoreMeta', 'Average engagement_score from the database');
    } catch (err) {
      console.error('[dashboard.js] Failed to load overview metrics:', err);
    }
  }

  initOverviewMetrics();

})();