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

const AverageDailyRate = ({ rates }) => {
  const getMonthsInRange = (data) => {
    if (!data || data.length === 0) return [];
    
    // Pegar a primeira e última data do conjunto de dados
    const dates = data.map(item => new Date(item.date));
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

  const processData = (data) => {
    const months = getMonthsInRange(data);
    const monthlyRates = months.map(() => ({ sum: 0, count: 0 }));
    
    // Processar cada dia
    data.forEach(dayData => {
      if (dayData.prices && dayData.prices.length > 0) {
        const price = dayData.prices[0]._mcval?.BRL;
        if (price) {
          const date = new Date(dayData.date);
          const monthName = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][date.getMonth()];
          const monthIndex = months.indexOf(monthName);
          if (monthIndex !== -1) {
            monthlyRates[monthIndex].sum += price;
            monthlyRates[monthIndex].count += 1;
          }
        }
      }
    });

    // Calcular médias mensais
    const averages = monthlyRates.map(month => 
      month.count > 0 ? month.sum / month.count : null
    );

    return {
      labels: months,
      datasets: [
        {
          label: 'Média de Diária (R$)',
          data: averages,
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
          tension: 0.3,
          fill: false,
          pointRadius: 5,
          pointHoverRadius: 7,
        }
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
        text: 'Média de Diária por Mês'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            return `R$ ${context.raw.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: false,
        title: {
          display: true,
          text: 'Valor (R$)'
        },
        ticks: {
          callback: (value) => `R$ ${value}`
        }
      },
      x: {
        title: {
          display: false,
        }
      }
    },
    interaction: {
      intersect: false,
      mode: 'index',
    },
  };

  const chartData = processData(rates || []);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Line options={options} data={chartData} />
    </div>
  );
};

export default AverageDailyRate; 