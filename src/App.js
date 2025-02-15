import React, { useState } from 'react';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import dayjs from 'dayjs';
import './App.css';
import CancellationsByMonth from './components/CancellationsByMonth';
import ReservationsOverTime from './components/ReservationsOverTime';
import ReservationSourcesPie from './components/ReservationSourcesPie';
import GroupedBarChart from './components/GroupedBarChart';
import AverageDailyRate from './components/AverageDailyRate';
import AverageTicket from './components/AverageTicket';
import apiService from './services/apiService';
import StatsContainer from './components/StatsContainer';

function App() {
  const [formData, setFormData] = useState({
    startDate: null,
    endDate: null,
    listingId: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cancellations, setCancellations] = useState(null);
  const [reservations, setReservations] = useState(null);
  const [availability, setAvailability] = useState(null);
  const [listingDetails, setListingDetails] = useState(null);

  const theme = createTheme({
    palette: {
      primary: {
        main: '#FF385C',
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: 'white',
            borderRadius: '32px',
            boxShadow: '0 1px 2px rgba(0,0,0,0.08), 0 4px 12px rgba(0,0,0,0.05)',
            '& .MuiOutlinedInput-root': {
              cursor: 'pointer',
              '& input': {
                cursor: 'pointer',
              },
              '& fieldset': {
                borderColor: '#DDDDDD',
              },
              '&:hover fieldset': {
                borderColor: '#FF385C',
              },
            },
          },
        },
      },
      MuiSvgIcon: {
        styleOverrides: {
          root: {
            width: '20px',
            height: '20px',
          },
        },
      },
    },
  });

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
      const [cancellationsData, reservationsData, availabilityData, listingData] = await Promise.all([
        apiService.getCancellations({
          from: formData.startDate?.format('YYYY-MM-DD'),
          to: formData.endDate?.format('YYYY-MM-DD'),
          ...(formData.listingId && { listingId: formData.listingId })
        }),
        apiService.getReservations({
          from: formData.startDate?.format('YYYY-MM-DD'),
          to: formData.endDate?.format('YYYY-MM-DD'),
          ...(formData.listingId && { listingId: formData.listingId })
        }),
        apiService.getAvailability(
          formData.listingId || 'CK01H',
          {
            from: formData.startDate?.format('YYYY-MM-DD'),
            to: formData.endDate?.format('YYYY-MM-DD')
          }
        ),
        apiService.getListingDetails(formData.listingId || 'CK01H')
      ]);

      setCancellations(cancellationsData);
      setReservations(reservationsData);
      setAvailability(availabilityData);
      setListingDetails(listingData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="App">
          <div className="search-bar">
            <div className="search-inputs">
              <div className="date-inputs">
                <DesktopDatePicker
                  value={formData.startDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      startDate: newValue
                    }));
                  }}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "Data inicial",
                      sx: { 
                        '& .MuiInputBase-root': {
                          height: '48px',
                          borderRadius: '32px',
                          '&:hover': {
                            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                          },
                        },
                      },
                    },
                  }}
                />
                <DesktopDatePicker
                  value={formData.endDate}
                  onChange={(newValue) => {
                    setFormData(prev => ({
                      ...prev,
                      endDate: newValue
                    }));
                  }}
                  minDate={formData.startDate}
                  format="DD/MM/YYYY"
                  slotProps={{
                    textField: {
                      size: "small",
                      placeholder: "Data final",
                      sx: { 
                        '& .MuiInputBase-root': {
                          height: '48px',
                          borderRadius: '32px',
                          '&:hover': {
                            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="listing-input">
                <input 
                  type="text" 
                  name="listingId" 
                  value={formData.listingId}
                  onChange={handleInputChange}
                  placeholder="ID da propriedade"
                  className="listing-search"
                />
              </div>
              <button 
                className="search-button"
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? 'Searching...' : 'Search'}
              </button>
            </div>
          </div>
          
          <div style={{ 
            display: 'flex',
            position: 'relative',
            paddingLeft: reservations ? '290px' : '0'  // Padding condicional
          }}>
            {reservations && (  // Mostra StatsContainer apenas quando houver dados
              <div style={{ 
                position: 'absolute',
                left: '20px',
                top: '0',
                width: '250px'
              }}>
                <StatsContainer 
                  listingDetails={listingDetails} 
                  listingId={formData.listingId || 'CK01H'} 
                />
              </div>
            )}

            <div style={{ 
              width: '800px',
              margin: '0 auto'
            }}>
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
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
