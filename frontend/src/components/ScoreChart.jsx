import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip } from 'chart.js';

ChartJS.register(ArcElement, Tooltip);

const ScoreChart = ({ score = 0, size = 200 }) => {
  const getColor = (s) => {
    if (s >= 80) return { main: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)' };
    if (s >= 60) return { main: '#eab308', bg: 'rgba(234, 179, 8, 0.1)' };
    if (s >= 40) return { main: '#f97316', bg: 'rgba(249, 115, 22, 0.1)' };
    return { main: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)' };
  };

  const colors = getColor(score);

  const data = {
    datasets: [
      {
        data: [score, 100 - score],
        backgroundColor: [colors.main, 'rgba(30, 41, 59, 0.5)'],
        borderColor: ['transparent', 'transparent'],
        borderWidth: 0,
        borderRadius: score > 0 && score < 100 ? 8 : 0,
        cutout: '78%',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      tooltip: { enabled: false },
    },
    animation: {
      animateRotate: true,
      duration: 1500,
      easing: 'easeOutQuart',
    },
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Excellent';
    if (s >= 60) return 'Good';
    if (s >= 40) return 'Fair';
    return 'Needs Work';
  };

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-bold text-white">{score}</span>
        <span className="text-sm font-medium" style={{ color: colors.main }}>
          {getLabel(score)}
        </span>
      </div>
    </div>
  );
};

export default ScoreChart;
