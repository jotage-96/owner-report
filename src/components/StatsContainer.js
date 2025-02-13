import React from 'react';
import ListingCard from './ListingCard';

const StatsContainer = () => {
  return (
    <div style={{
      width: '250px',
      padding: '20px',
      backgroundColor: '#f5f5f5',
      borderRadius: '8px',
      marginRight: '20px',
      height: 'fit-content'
    }}>
      <ListingCard />
      {/* Outros cards de estatísticas virão aqui depois */}
    </div>
  );
};

export default StatsContainer; 