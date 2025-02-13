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
  const getMonthsInRange = (data) => {
    if (!data || data.length === 0) return [];
    
    // Pegar a primeira e última data do conjunto de dados
    const dates = data.map(item => new Date(item.checkInDate));
    const startDate = new Date(Math.min(...dates));
    const endDate = new Date(Math.max(...dates));
    
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const monthName = monthNames[currentDate.getMonth()];
      if (!months.includes(monthName)) {
        months.push(monthName);
      }
      currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return months;
  };

  const processCancellationsByMonth = (data) => {
    const months = getMonthsInRange(data);
    const monthCounts = {};
    
    // Initialize selected months
    months.forEach(month => {
      monthCounts[month] = 0;
    });

    // Count cancellations by month using checkInDate
    data.forEach(reservation => {
      const date = new Date(reservation.checkInDate);
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
      if (months.includes(monthName)) {
        monthCounts[monthName]++;
      }
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