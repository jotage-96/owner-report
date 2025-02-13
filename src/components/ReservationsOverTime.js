import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ReservationsOverTime = ({ reservations }) => {
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

  const processReservationsByMonth = (data) => {
    const months = getMonthsInRange(data);
    const monthCounts = {};
    
    // Initialize selected months
    months.forEach(month => {
      monthCounts[month] = 0;
    });

    // Count reservations by month using checkInDate
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
          label: 'Reservations by Check-in Month',
          data: months.map(month => monthCounts[month]),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
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
        text: 'Reservations by Check-in Month',
      },
      tooltip: {
        callbacks: {
          title: (tooltipItems) => {
            return `Month: ${tooltipItems[0].label}`;
          },
          label: (context) => {
            return `Reservations: ${context.raw}`;
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
          text: 'Number of Reservations'
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

  const chartData = processReservationsByMonth(reservations || []);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default ReservationsOverTime; 