import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

const HistoryChart = ({ history = [] }) => {
  if (history.length === 0) return null;

  const sorted = [...history].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

  const labels = sorted.map((h) =>
    new Date(h.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  );

  const scores = sorted.map((h) => h.atsScore);

  const data = {
    labels,
    datasets: [
      {
        label: 'ATS Score',
        data: scores,
        borderColor: '#818cf8',
        backgroundColor: 'rgba(129, 140, 248, 0.1)',
        fill: true,
        tension: 0.4,
        pointBackgroundColor: '#818cf8',
        pointBorderColor: '#1e1b4b',
        pointBorderWidth: 2,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 } },
      },
      y: {
        min: 0,
        max: 100,
        grid: { color: 'rgba(51, 65, 85, 0.3)' },
        ticks: { color: '#94a3b8', font: { size: 11 }, stepSize: 20 },
      },
    },
    plugins: {
      tooltip: {
        backgroundColor: '#1e293b',
        titleColor: '#e2e8f0',
        bodyColor: '#94a3b8',
        borderColor: '#334155',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      },
    },
    animation: {
      duration: 1000,
      easing: 'easeOutQuart',
    },
  };

  return (
    <div style={{ height: 250 }}>
      <Line data={data} options={options} />
    </div>
  );
};

export default HistoryChart;
