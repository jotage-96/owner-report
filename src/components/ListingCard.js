import React from 'react';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import LaunchIcon from '@mui/icons-material/Launch';
import HotelIcon from '@mui/icons-material/Hotel';

const ListingCard = ({ listingDetails, listingId }) => {
  if (!listingDetails) return null;

  const listingUrl = `https://joaoguilherme.stays.com.br/pt/apartment/${listingId}`;

  return (
    <div style={{
      backgroundColor: 'white',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      marginBottom: '20px'
    }}>
      <div style={{ position: 'relative' }}>
        <img 
          src={listingDetails.imageUrl}
          alt={listingDetails.title}
          style={{
            width: '100%',
            height: '150px',
            objectFit: 'cover'
          }}
        />
        <a 
          href={listingUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '28px',
            height: '28px',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
            borderRadius: '50%',
            transition: 'background-color 0.2s'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 1)'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.9)'}
        >
          <LaunchIcon style={{ fontSize: '20px', color: '#666' }} />
        </a>
      </div>
      <div style={{ padding: '15px' }}>
        <h3 style={{
          margin: '0 0 12px 0',
          fontSize: '16px',
          fontWeight: 'bold',
          color: '#333',
          textAlign: 'left'
        }}>
          {listingDetails.title}
        </h3>
        <div style={{
          fontSize: '14px',
          color: '#666',
          marginBottom: '8px',
          display: 'flex',
          alignItems: 'center',
          gap: '4px'
        }}>
          <LocationOnIcon style={{ fontSize: '16px', color: '#ff385c' }} />
          {listingDetails.state}
        </div>
        <div style={{
          display: 'flex',
          gap: '12px'
        }}>
          <div style={{
            fontSize: '14px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <PersonIcon style={{ fontSize: '16px', color: '#666' }} />
            <span>{listingDetails.maxGuests} pessoas</span>
          </div>
          <div style={{
            fontSize: '14px',
            color: '#666',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}>
            <HotelIcon style={{ fontSize: '16px', color: '#666' }} />
            <span>{listingDetails.rooms} quartos</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingCard; 