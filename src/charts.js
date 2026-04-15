/**
 * charts.js
 * Renders Chart.js bar and doughnut charts from aggregated category data.
 * Requires Chart.js to be loaded via CDN.
 */

let barChart = null;
let doughnutChart = null;

const COLOUR_PALETTE = [
  '#4f46e5', '#7c3aed', '#db2777', '#dc2626', '#ea580c',
  '#ca8a04', '#16a34a', '#0891b2', '#2563eb', '#9333ea',
  '#64748b', '#374151',
];

/**
 * Render (or update) both charts.
 * @param {Array<{category: string, total: number, percentage: number}>} data
 */
export function renderCharts(data) {
  renderBarChart(data);
  renderDoughnutChart(data);
}

function renderBarChart(data) {
  const ctx = document.getElementById('barChart').getContext('2d');

  if (barChart) barChart.destroy();

  barChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        label: 'Spend (£)',
        data: data.map(d => d.total),
        backgroundColor: data.map((_, i) => COLOUR_PALETTE[i % COLOUR_PALETTE.length]),
        borderRadius: 4,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` £${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: value => `£${value}`,
          },
        },
      },
    },
  });
}

function renderDoughnutChart(data) {
  const ctx = document.getElementById('doughnutChart').getContext('2d');

  if (doughnutChart) doughnutChart.destroy();

  doughnutChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: data.map(d => d.category),
      datasets: [{
        data: data.map(d => d.total),
        backgroundColor: data.map((_, i) => COLOUR_PALETTE[i % COLOUR_PALETTE.length]),
        borderWidth: 2,
      }],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'right',
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.label}: £${ctx.parsed.toFixed(2)} (${data[ctx.dataIndex].percentage}%)`,
          },
        },
      },
    },
  });
}
