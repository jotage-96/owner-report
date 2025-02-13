import React from 'react';

const ListingCard = () => {
  // Dados mocados
  const mockListing = {
    title: "Apartamento teste 02",
    state: "Rio de Janeiro",
    maxCapacity: 6,
    imageUrl: "https://placehold.co/250x150" // placeholder temporário
  };

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <img 
        src={mockListing.imageUrl}
        alt={mockListing.title}
        style={{
          width: '100%',
          height: '150px',
          objectFit: 'cover'
        }}
      />
      <div style={{ padding: '15px' }}>
        <h3 style={{
          margin: '0 0 8px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {mockListing.title}
        </h3>
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '4px'
        }}>
          {mockListing.state}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#666',
          display: 'flex',
          alignItems: 'center'
        }}>
          <span>Capacidade máxima: {mockListing.maxCapacity} pessoas</span>
        </div>
      </div>
    </div>
  );
};

export default ListingCard; 