import React, { useState, useEffect } from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import apiService from '../services/apiService';

const ActionButtons = () => {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comment, setComment] = useState('');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);

  const buttonStyle = {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    border: '1px solid #ddd',
    borderRadius: '8px',
    backgroundColor: 'white',
    cursor: 'pointer',
    textAlign: 'center',
    fontSize: '14px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'background-color 0.2s',
  };

  const containerStyle = {
    marginTop: '20px',
  };

  const modalStyle = {
    position: 'fixed',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '500px',
    zIndex: 1000,
  };

  const fetchAvailability = async () => {
    setLoading(true);
    try {
      // Pegando dados dos próximos 12 meses
      const startDate = dayjs();
      const endDate = dayjs().add(12, 'month');
      
      const data = await apiService.getAvailability('CK01H', {
        from: startDate.format('YYYY-MM-DD'),
        to: endDate.format('YYYY-MM-DD')
      });
      
      setAvailability(data);
    } catch (error) {
      console.error('Error fetching availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = async () => {
    await fetchAvailability();
    setShowModal(true);
  };

  // Função para verificar se uma data está bloqueada
  const shouldDisableDate = (date) => {
    const formattedDate = date.format('YYYY-MM-DD');
    const dayData = availability.find(day => day.date === formattedDate);
    return dayData ? dayData.avail === 0 : false;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle the block creation logic here
    console.log({
      startDate: startDate?.format('YYYY-MM-DD'),
      endDate: endDate?.format('YYYY-MM-DD'),
      comment
    });
    setShowModal(false);
  };

  return (
    <div style={containerStyle}>
      <button 
        style={buttonStyle} 
        onClick={handleOpenModal}
        disabled={loading}
      >
        {loading ? 'Carregando...' : 'Criar bloqueio'}
      </button>
      <button style={buttonStyle}>
        Alterar preço
      </button>
      <button style={buttonStyle}>
        Editar regras
      </button>

      {showModal && (
        <div style={modalStyle}>
          <h2>Criar Bloqueio</h2>
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '15px' }}>
              <label>De:</label>
              <DesktopDatePicker
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                format="DD/MM/YYYY"
                shouldDisableDate={shouldDisableDate}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Data inicial",
                    onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button').click(),
                    sx: { 
                      width: '100%',
                      marginTop: '5px',
                      '& .MuiInputBase-root': {
                        height: '48px',
                        borderRadius: '32px',
                        cursor: 'pointer',
                        '& input': {
                          cursor: 'pointer',
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
                    },
                  },
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Até:</label>
              <DesktopDatePicker
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate}
                format="DD/MM/YYYY"
                shouldDisableDate={shouldDisableDate}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Data final",
                    onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button').click(),
                    sx: { 
                      width: '100%',
                      marginTop: '5px',
                      '& .MuiInputBase-root': {
                        height: '48px',
                        borderRadius: '32px',
                        cursor: 'pointer',
                        '& input': {
                          cursor: 'pointer',
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
                    },
                  },
                }}
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label>Comentário:</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                style={{ width: '100%', padding: '8px', marginTop: '5px', minHeight: '100px', borderRadius: '8px', border: '1px solid #ddd' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setShowModal(false)}
                style={{ ...buttonStyle, width: 'auto' }}
              >
                Cancelar
              </button>
              <button
                type="submit"
                style={{ ...buttonStyle, width: 'auto', backgroundColor: '#007bff', color: 'white' }}
              >
                Confirmar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ActionButtons; 