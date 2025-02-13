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
  const processData = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyRates = months.map(() => ({ sum: 0, count: 0 }));
    
    // Processar cada dia
    data.forEach(dayData => {
      // Verificar se tem preços e se tem valor em BRL
      if (dayData.prices && dayData.prices.length > 0) {
        const price = dayData.prices[0]._mcval?.BRL;
        if (price) {
          const date = new Date(dayData.date);
          const monthIndex = date.getMonth();
          monthlyRates[monthIndex].sum += price;
          monthlyRates[monthIndex].count += 1;
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
        position: 'top',
      },
      title: {
        display: true,
        text: 'Média de Diária por Mês'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            return value ? `Média: R$ ${value.toFixed(2)}` : 'Sem dados';
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
          display: true,
          text: 'Mês'
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