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
  const getMonthsInRange = (data) => {
    if (!data || data.length === 0) return [];
    
    // Pegar a primeira e última data do conjunto de dados
    const dates = data.map(item => new Date(item.date));
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

  const processData = (data) => {
    const months = getMonthsInRange(data);
    const monthCounts = months.map(() => ({ available: 0, unavailable: 0 }));
    
    // Processar cada dia do payload
    data.forEach(dayData => {
      const date = new Date(dayData.date);
      const monthName = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][date.getMonth()];
      const monthIndex = months.indexOf(monthName);
      
      if (monthIndex !== -1) {
        if (dayData.avail === 1) {
          monthCounts[monthIndex].available++;
        } else {
          monthCounts[monthIndex].unavailable++;
        }
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