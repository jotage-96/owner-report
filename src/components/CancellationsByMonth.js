import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const CancellationsByMonth = ({ reservations }) => {
  // Process the data
  const processCancellationsByMonth = (data) => {
    const monthCounts = {};
    
    // Initialize all months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    months.forEach(month => {
      monthCounts[month] = 0;
    });

    // Count cancellations by month using checkInDate
    data.forEach(reservation => {
      // Parse the checkInDate
      const date = new Date(reservation.checkInDate);
      const month = months[date.getMonth()];
      monthCounts[month]++;
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Cancellations by Check-in Month',
          data: months.map(month => monthCounts[month]),
          backgroundColor: 'rgba(255, 99, 132, 0.5)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Cancellations by Check-in Month',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `Month: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `Cancellations: ${context.raw}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
        title: {
          display: true,
          text: 'Number of Cancellations'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Check-in Month'
        }
      }
    },
  };

  const chartData = processCancellationsByMonth(reservations || []);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default CancellationsByMonth; 