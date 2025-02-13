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

  const theme = createTheme({
    palette: {
      primary: {
        main: '#61dafb',
      },
    },
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            backgroundColor: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            '& .MuiOutlinedInput-root': {
              cursor: 'pointer',
              '& input': {
                cursor: 'pointer',
              },
              '& fieldset': {
                borderColor: '#ccc',
              },
              '&:hover fieldset': {
                borderColor: '#61dafb',
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
      const [cancellationsData, reservationsData, availabilityData] = await Promise.all([
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
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="App">
          <div className="input-container">
            <label>
              Start Date
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
                    placeholder: "Select start date",
                    sx: { 
                      width: '200px',
                      '& .MuiInputBase-root': {
                        height: '35px',
                        padding: '0 8px',
                        '& .MuiInputAdornment-root': {
                          marginLeft: '2px',
                          marginRight: '-6px',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '8px',
                        cursor: 'pointer',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                      },
                    },
                    onClick: (e) => {
                      e.currentTarget.querySelector('button').click();
                    }
                  },
                  field: {
                    readOnly: true,
                    placeholder: "Select start date"
                  }
                }}
                onClose={() => {
                  if (!formData.startDate) {
                    const input = document.querySelector('input[placeholder="Select start date"]');
                    if (input) input.value = '';
                  }
                }}
              />
            </label>
            <label>
              End Date
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
                    placeholder: "Select end date",
                    sx: { 
                      width: '200px',
                      '& .MuiInputBase-root': {
                        height: '35px',
                        padding: '0 8px',
                        '& .MuiInputAdornment-root': {
                          marginLeft: '2px',
                          marginRight: '-6px',
                        },
                      },
                      '& .MuiOutlinedInput-input': {
                        padding: '8px',
                        cursor: 'pointer',
                      },
                    },
                    onClick: (e) => {
                      e.currentTarget.querySelector('button').click();
                    }
                  },
                  field: {
                    readOnly: true,
                    placeholder: "Select end date"
                  }
                }}
                onClose={() => {
                  if (!formData.endDate) {
                    const input = document.querySelector('input[placeholder="Select end date"]');
                    if (input) input.value = '';
                  }
                }}
              />
            </label>
            <label>
              Listing ID
              <input 
                type="text" 
                name="listingId" 
                value={formData.listingId}
                onChange={handleInputChange}
                placeholder="Enter listing ID"
              />
            </label>
            <button 
              onClick={handleSearch}
              disabled={loading}
            >
              {loading ? 'Searching...' : 'Search'}
            </button>
          </div>
          
          <div style={{ 
            display: 'flex',
            position: 'relative',
            paddingLeft: '290px'  // Espaço para o StatsContainer
          }}>
            <div style={{ 
              position: 'absolute',
              left: '20px',
              top: '0',
              width: '250px'
            }}>
              <StatsContainer />
            </div>

            <div style={{ 
              width: '800px',
              margin: '0 auto'  // Centraliza os gráficos
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
