import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { ResponsiveContainer } from 'recharts';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend
);

const ReservationSourcesPie = ({ reservations }) => {
  const processReservationSources = (data) => {
    // Contar reservas por fonte (partner.name)
    const sourceCounts = {};
    
    data.forEach(reservation => {
      const sourceName = reservation.partner?.name || 'Direct';
      sourceCounts[sourceName] = (sourceCounts[sourceName] || 0) + 1;
    });

    // Preparar dados para o gráfico
    const sources = Object.keys(sourceCounts);
    
    // Cores para cada fonte
    const colors = [
      'rgba(255, 99, 132, 0.5)',   // vermelho
      'rgba(54, 162, 235, 0.5)',   // azul
      'rgba(255, 206, 86, 0.5)',   // amarelo
      'rgba(75, 192, 192, 0.5)',   // verde
      'rgba(153, 102, 255, 0.5)',  // roxo
      'rgba(255, 159, 64, 0.5)',   // laranja
    ];

    const borderColors = colors.map(color => color.replace('0.5)', '1)'));

    return {
      labels: sources,
      datasets: [
        {
          data: sources.map(source => sourceCounts[source]),
          backgroundColor: colors.slice(0, sources.length),
          borderColor: borderColors.slice(0, sources.length),
          borderWidth: 1,
        },
      ],
    };
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Distribuição das Fontes de Reserva'
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((acc, curr) => acc + curr, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} reservas (${percentage}%)`;
          }
        }
      }
    }
  };

  const chartData = processReservationSources(reservations || []);

  return (
    <div style={{ height: '400px', width: '600px', marginBottom: '20px' }}>
      <ResponsiveContainer width="100%" height="100%">
        <Pie options={options} data={chartData} />
      </ResponsiveContainer>
    </div>
  );
};

export default ReservationSourcesPie; 