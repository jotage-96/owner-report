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
  const processData = (data) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData = months.map(() => ({ total: 0, count: 0 }));
    
    // Processar cada reserva
    data.forEach(reservation => {
      // Verificar se tem a data de check-in e o valor total
      if (reservation.checkInDate && 
          reservation.price?.hostingDetails?._f_total) {
        const date = new Date(reservation.checkInDate);
        const monthIndex = date.getMonth();
        
        const totalValue = parseFloat(reservation.price.hostingDetails._f_total);
        monthlyData[monthIndex].total += totalValue;
        monthlyData[monthIndex].count += 1;
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
        position: 'top',
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
          display: true,
          text: 'Mês'
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