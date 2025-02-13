import React, { useState } from 'react';
import './App.css';
import CancellationsByMonth from './components/CancellationsByMonth';
import ReservationsOverTime from './components/ReservationsOverTime';
import ReservationSourcesPie from './components/ReservationSourcesPie';
import GroupedBarChart from './components/GroupedBarChart';
import AverageDailyRate from './components/AverageDailyRate';
import AverageTicket from './components/AverageTicket';
import apiService from './services/apiService';

function App() {
  const [formData, setFormData] = useState({
    startDate: '',
    endDate: '',
    listingId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellations, setCancellations] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [availability, setAvailability] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      const [cancellationsData, reservationsData, availabilityData] = await Promise.all([
        apiService.getCancellations({
          from: formData.startDate,
          to: formData.endDate,
          ...(formData.listingId && { listingId: formData.listingId })
        }),
        apiService.getReservations({
          from: formData.startDate,
          to: formData.endDate,
          ...(formData.listingId && { listingId: formData.listingId })
        }),
        apiService.getAvailability(
          formData.listingId || 'CK01H',
          {
            from: formData.startDate,
            to: formData.endDate
          }
        )
      ]);

      setCancellations(cancellationsData);
      setReservations(reservationsData);
      setAvailability(availabilityData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <div className="input-container">
        <label>
          Start Date:
          <input 
            type="date" 
            name="startDate" 
            value={formData.startDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          End Date:
          <input 
            type="date" 
            name="endDate" 
            value={formData.endDate}
            onChange={handleInputChange}
          />
        </label>
        <label>
          Listing ID:
          <input 
            type="text" 
            name="listingId" 
            value={formData.listingId}
            onChange={handleInputChange}
          />
        </label>
        <button 
          onClick={handleSearch}
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>
      
      {cancellations && <CancellationsByMonth reservations={cancellations} />}
      {reservations && (
        <>
          <ReservationsOverTime reservations={reservations} />
          <ReservationSourcesPie reservations={reservations} />
          <AverageTicket reservations={reservations} />
        </>
      )}
      {availability && (
        <>
          <GroupedBarChart availability={availability} />
          <AverageDailyRate rates={availability} />
        </>
      )}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
