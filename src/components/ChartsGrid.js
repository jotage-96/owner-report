import React from 'react';
import ReservationsOverTime from './ReservationsOverTime';
import ReservationSourcesPie from './ReservationSourcesPie';
import AverageTicket from './AverageTicket';
import CancellationsByMonth from './CancellationsByMonth';
import GroupedBarChart from './GroupedBarChart';
import AverageDailyRate from './AverageDailyRate';

const ChartsGrid = ({ reservations, cancellations, availability }) => {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: '20px',
      width: '800px',
      margin: '0 auto',
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      {reservations && (
        <>
          <div>
            <ReservationsOverTime reservations={reservations} />
          </div>
          <div>
            <ReservationSourcesPie reservations={reservations} />
          </div>
          <div>
            <AverageTicket reservations={reservations} />
          </div>
        </>
      )}
      {cancellations && (
        <div>
          <CancellationsByMonth reservations={cancellations} />
        </div>
      )}
      {availability && (
        <>
          <div>
            <GroupedBarChart availability={availability} />
          </div>
          <div>
            <AverageDailyRate rates={availability} />
          </div>
        </>
      )}
    </div>
  );
};

export default ChartsGrid; 