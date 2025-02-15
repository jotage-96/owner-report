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
import ListingCard from './components/ListingCard';
import ActionButtons from './components/ActionButtons';

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
  const [openSecondPicker, setOpenSecondPicker] = useState(false);

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

  const handleStartDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      startDate: newValue
    }));
    setOpenSecondPicker(true);
  };

  const handleEndDateChange = (newValue) => {
    setFormData(prev => ({
      ...prev,
      endDate: newValue
    }));
    setOpenSecondPicker(false);
  };

  const handleEndDateClick = (e) => {
    if (formData.startDate) {
      setOpenSecondPicker(true);
    }
  };

  const datePickerStyles = {
    textField: {
      size: "small",
      sx: { 
        width: '100%',
        '& .MuiInputBase-root': {
          height: '48px',
          borderRadius: '32px',
          cursor: 'pointer',
          '& input': {
            cursor: 'pointer',
            textAlign: 'center',
          },
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
          },
        },
      },
    },
    day: {
      sx: {
        '&.Mui-disabled': {
          backgroundColor: 'rgba(255, 0, 0, 0.1)',
        },
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.1) !important',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.2) !important',
          }
        },
      },
    },
  };

  const shouldDisableDate = (date) => {
    if (!date) return false;
    const formattedDate = date.format('YYYY-MM-DD');
    const dayData = availability?.find(day => day.date === formattedDate);
    return dayData ? dayData.avail === 0 : false;
  };

  const formatDisplayDate = (date) => {
    if (!date) return '';
    
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    return `${date.date()} de ${meses[date.month()]}`;
  };

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="App">
          <div className="search-bar">
            <div className="search-inputs" style={{ 
              display: 'flex',
              alignItems: 'center',
              gap: '10px'
            }}>
              <div className="date-inputs" style={{
                display: 'flex',
                gap: '10px'
              }}>
                <DesktopDatePicker
                  value={formData.startDate}
                  onChange={handleStartDateChange}
                  views={['day']}
                  shouldDisableDate={shouldDisableDate}
                  localeText={{
                    cancelButtonLabel: 'Cancelar',
                    toolbarTitle: 'Selecionar data',
                    okButtonLabel: 'Confirmar',
                  }}
                  slotProps={{
                    textField: {
                      ...datePickerStyles.textField,
                      placeholder: "Check-in",
                      onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button').click(),
                      inputProps: {
                        value: formData.startDate ? formatDisplayDate(formData.startDate) : '',
                      }
                    },
                    day: datePickerStyles.day
                  }}
                />
                <DesktopDatePicker
                  value={formData.endDate}
                  open={openSecondPicker}
                  onClose={() => setOpenSecondPicker(false)}
                  onChange={handleEndDateChange}
                  minDate={formData.startDate}
                  views={['day']}
                  shouldDisableDate={shouldDisableDate}
                  localeText={{
                    cancelButtonLabel: 'Cancelar',
                    toolbarTitle: 'Selecionar data',
                    okButtonLabel: 'Confirmar',
                  }}
                  slotProps={{
                    textField: {
                      ...datePickerStyles.textField,
                      placeholder: "Check-out",
                      onClick: handleEndDateClick,
                      inputProps: {
                        value: formData.endDate ? formatDisplayDate(formData.endDate) : '',
                      }
                    },
                    day: datePickerStyles.day
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
                  style={{
                    height: '48px',
                    borderRadius: '32px',
                    border: '1px solid #DDDDDD',
                    padding: '0 16px',
                    fontSize: '14px',
                    width: '100%',
                    textAlign: 'center',
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: '0 2px 4px rgba(0,0,0,0.18)',
                    },
                  }}
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
          }}>
            <div style={{
              width: '290px',
              minHeight: '100%',
              borderRight: '1px solid #ccc',
              backgroundColor: '#fff',
              padding: '20px',
              position: 'sticky',
              top: '0',
            }}>
              {listingDetails && (
                <>
                  <ListingCard 
                    listing={listingDetails}
                    startDate={formData.startDate}
                    endDate={formData.endDate}
                  />
                  <div style={{ marginTop: '20px' }}>
                    <StatsContainer 
                      listingDetails={listingDetails} 
                      listingId={formData.listingId || 'CK01H'} 
                    />
                  </div>
                  <ActionButtons />
                </>
              )}
            </div>

            <div style={{ 
              flex: 1,
              display: 'flex',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '1240px',
                padding: '20px'
              }}>
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '40px',
                }}>
                  {cancellations && (
                    <div>
                      <CancellationsByMonth reservations={cancellations} />
                    </div>
                  )}
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
              </div>
            </div>
          </div>
          
          {error && <div className="error-message">{error}</div>}
        </div>
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
