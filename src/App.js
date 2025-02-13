import React, { useState } from 'react';
import './App.css';
import CancellationsByMonth from './components/CancellationsByMonth';
import ReservationsOverTime from './components/ReservationsOverTime';
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSearch = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fazer as duas chamadas em paralelo
      const [cancellationsData, reservationsData] = await Promise.all([
        apiService.getCancellations({
          from: formData.startDate,
          to: formData.endDate,
          ...(formData.listingId && { listingId: formData.listingId })
        }),
        apiService.getReservations({
          from: formData.startDate,
          to: formData.endDate,
          ...(formData.listingId && { listingId: formData.listingId })
        })
      ]);

      setCancellations(cancellationsData);
      setReservations(reservationsData);
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
      {reservations && <ReservationsOverTime reservations={reservations} />}
      
      {error && <div className="error-message">{error}</div>}
    </div>
  );
}

export default App;
