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
import { ResponsiveContainer } from 'recharts';

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
    const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    
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
      const monthName = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][date.getMonth()];
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
        display: false,
      },
      title: {
        display: true,
        text: 'Cancelamentos por Mês'
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `Mês: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `Cancelamentos: ${context.raw}`;
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
          text: 'Número de Cancelamentos'
        }
      },
      x: {
        title: {
          display: false,
        }
      }
    },
  };

  const chartData = processCancellationsByMonth(reservations || []);

  return (
    <div style={{ height: '400px', width: '600px', marginBottom: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <Bar options={options} data={chartData} />
      </ResponsiveContainer>
    </div>
  );
};

export default CancellationsByMonth; 