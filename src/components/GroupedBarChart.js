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

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const GroupedBarChart = ({ availability }) => {
  const processData = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthCounts = months.map(() => ({ available: 0, unavailable: 0 }));
    
    // Processar cada dia do payload
    data.forEach(dayData => {
      const date = new Date(dayData.date);
      const monthIndex = date.getMonth();
      
      if (dayData.avail === 1) {
        monthCounts[monthIndex].available++;
      } else {
        monthCounts[monthIndex].unavailable++;
      }
    });

    return {
      labels: months,
      datasets: [
        {
          label: 'Não Disponível',
          data: monthCounts.map(count => count.unavailable),
          backgroundColor: 'rgba(255, 99, 132, 0.7)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1,
        },
        {
          label: 'Disponível',
          data: monthCounts.map(count => count.available),
          backgroundColor: 'rgba(53, 162, 235, 0.7)',
          borderColor: 'rgba(53, 162, 235, 1)',
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        title: {
          display: true,
          text: 'Meses'
        }
      },
      y: {
        stacked: true,
        beginAtZero: true,
        title: {
          display: true,
          text: 'Dias'
        },
        ticks: {
          stepSize: 1
        }
      }
    },
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Disponibilidade por Mês'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.dataset.label || '';
            const value = context.raw || 0;
            return `${label}: ${value.toFixed(0)} dias`;
          }
        }
      }
    }
  };

  const chartData = processData(availability || []);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default GroupedBarChart; 