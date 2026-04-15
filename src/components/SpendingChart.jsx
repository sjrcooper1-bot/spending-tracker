import { useEffect, useRef } from 'react';
import { Chart, ArcElement, Tooltip, Legend, DoughnutController } from 'chart.js';

Chart.register(ArcElement, Tooltip, Legend, DoughnutController);

/**
 * SpendingChart
 * Doughnut chart of spend by category using Chart.js.
 * @param {Array} breakdown — [{category, total, percentage, colour}]
 */
export default function SpendingChart({ breakdown }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current || !breakdown.length) return;

    // Destroy previous instance before creating a new one
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const labels = breakdown.map(d => d.category);
    const data = breakdown.map(d => d.total);
    const colours = breakdown.map(d => d.colour ?? '#94a3b8');

    chartRef.current = new Chart(canvasRef.current, {
      type: 'doughnut',
      data: {
        labels,
        datasets: [{
          data,
          backgroundColor: colours,
          borderColor: '#ffffff',
          borderWidth: 2,
          hoverOffset: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        cutout: '60%',
        plugins: {
          legend: {
            display: false, // we render our own legend in the table
          },
          tooltip: {
            callbacks: {
              label(ctx) {
                const item = breakdown[ctx.dataIndex];
                return ` £${item.total.toFixed(2)} · ${item.percentage}%`;
              },
            },
          },
        },
      },
    });

    return () => {
      chartRef.current?.destroy();
      chartRef.current = null;
    };
  }, [breakdown]);

  return (
    <div className="flex justify-center">
      <div className="w-64 h-64">
        <canvas ref={canvasRef} />
      </div>
    </div>
  );
}
