const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'right',
    },
    tooltip: {
      callbacks: {
        label: (context) => {
          const label = context.label || '';
          const value = context.raw || 0;
          return `${label}: ${value} cancelamentos`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        stepSize: 1
      }
    }
  }
};

return (
  <div style={{ height: '400px', width: '600px', marginBottom: '20px' }}>
    <h3 style={{ marginBottom: '20px' }}>Cancelamento de Reservas</h3>
    <Bar options={options} data={chartData} />
  </div>
); 