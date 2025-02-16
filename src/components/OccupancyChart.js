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
          return `${label}: ${value}%`;
        }
      }
    }
  },
  scales: {
    y: {
      beginAtZero: true,
      max: 100,
      ticks: {
        callback: (value) => `${value}%`
      }
    }
  }
};

return (
  <div style={{ height: '400px', width: '600px', marginBottom: '20px' }}>
    <h3 style={{ marginBottom: '20px' }}>Taxa de Ocupação</h3>
    <Line options={options} data={chartData} />
  </div>
); 