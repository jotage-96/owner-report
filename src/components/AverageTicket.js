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

const AverageTicket = ({ reservations }) => {
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

  const processData = (data) => {
    const months = getMonthsInRange(data);
    const monthlyData = months.map(() => ({ total: 0, count: 0 }));
    
    // Processar cada reserva
    data.forEach(reservation => {
      if (reservation.checkInDate && 
          reservation.price?.hostingDetails?._f_total) {
        const date = new Date(reservation.checkInDate);
        const monthName = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'][date.getMonth()];
        const monthIndex = months.indexOf(monthName);
        
        if (monthIndex !== -1) {
          const totalValue = parseFloat(reservation.price.hostingDetails._f_total);
          monthlyData[monthIndex].total += totalValue;
          monthlyData[monthIndex].count += 1;
        }
      }
    });

    // Calcular média mensal (ticket médio)
    const averages = monthlyData.map((month) => 
      month.count > 0 ? month.total / month.count : null
    );

    return {
      labels: months,
      datasets: [
        {
          label: 'Ticket Médio',
          data: averages,
          backgroundColor: 'rgba(153, 102, 255, 0.5)',
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1,
          borderRadius: 5,
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
        text: 'Ticket Médio por Mês'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            if (value === null) return 'Sem reservas';
            return `Ticket Médio: R$ ${value.toFixed(2)}`;
          }
        }
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Valor (R$)'
        },
        ticks: {
          callback: (value) => `R$ ${value.toFixed(2)}`
        }
      },
      x: {
        title: {
          display: false,
        }
      }
    }
  };

  const chartData = processData(reservations || []);

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto' }}>
      <Bar options={options} data={chartData} />
    </div>
  );
};

export default AverageTicket; 