import React from 'react';
import ListingCard from './ListingCard';

const StatsContainer = ({ listingDetails, listingId }) => {
  return (
    <div style={{
      padding: '20px',
    }}>
      <ListingCard listingDetails={listingDetails} listingId={listingId} />
      {/* Outros cards de estatísticas virão aqui depois */}
    </div>
  );
};

export default StatsContainer; 