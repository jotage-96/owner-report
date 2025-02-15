import React, { useState, useEffect } from 'react';
import { DesktopDatePicker } from '@mui/x-date-pickers/DesktopDatePicker';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';  // Importando o locale português
import apiService from '../services/apiService';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Configurando o locale português como padrão
dayjs.locale('pt-br');

const ActionButtons = () => {
  const [showModal, setShowModal] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [comment, setComment] = useState('');
  const [availability, setAvailability] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

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

  const overlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Fundo escuro semi-transparente
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999, // Garante que fique acima de outros elementos
  };

  const modalStyle = {
    backgroundColor: 'white',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
    width: '90%',
    maxWidth: '500px',
    position: 'relative', // Removido position: fixed pois agora o overlay centraliza
    zIndex: 1000,
  };

  const successModalStyle = {
    ...modalStyle,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
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

  // Função para verificar se há datas indisponíveis no intervalo
  const hasUnavailableDatesInRange = (start, end) => {
    if (!start || !end) return false;

    let currentDate = start.clone();
    while (currentDate.isBefore(end) || currentDate.isSame(end, 'day')) {
      if (shouldDisableDate(currentDate)) {
        return true;
      }
      currentDate = currentDate.add(1, 'day');
    }
    return false;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Validações
      if (!startDate || !endDate) {
        throw new Error('Por favor, selecione as datas inicial e final');
      }

      if (endDate.isBefore(startDate)) {
        throw new Error('A data final não pode ser anterior à data inicial');
      }

      if (hasUnavailableDatesInRange(startDate, endDate)) {
        throw new Error('Existem datas indisponíveis no período selecionado');
      }

      await apiService.createBlock({
        startDate: startDate.format('YYYY-MM-DD'),
        endDate: endDate.format('YYYY-MM-DD'),
        listingId: 'CK01H',
        comment: comment
      });

      setSuccessMessage('Bloqueio criado com sucesso!');
      
      // Limpa o formulário após 2 segundos e fecha o modal
      setTimeout(() => {
        setStartDate(null);
        setEndDate(null);
        setComment('');
        setShowModal(false);
        setSuccessMessage(null);
      }, 2000);

    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleOverlayClick = (e) => {
    // Fecha o modal apenas se o clique foi no overlay (fundo escuro)
    // e não em algum elemento dentro do modal
    if (e.target === e.currentTarget && !loading) {
      setShowModal(false);
      // Limpa os dados do formulário
      setStartDate(null);
      setEndDate(null);
      setComment('');
      setError(null);
    }
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

      {showModal && !successMessage && (
        <div style={overlayStyle} onClick={handleOverlayClick}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Criar Bloqueio</h2>
            
            {error && (
              <div style={{ 
                color: 'red', 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: 'rgba(255,0,0,0.1)',
                borderRadius: '4px'
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <DesktopDatePicker
                value={startDate}
                onChange={(newValue) => {
                  setStartDate(newValue);
                  setError(null); // Limpa erros ao mudar a data
                }}
                format="DD/MM/YYYY"
                shouldDisableDate={shouldDisableDate}
                localeText={{
                  cancelButtonLabel: 'Cancelar',
                  toolbarTitle: 'Selecionar data',
                  okButtonLabel: 'Confirmar',
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Data inicial",
                    onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button').click(),
                    sx: { 
                      width: '100%',
                      marginBottom: '15px',
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
                    },
                  },
                }}
              />
              <DesktopDatePicker
                value={endDate}
                onChange={(newValue) => {
                  setEndDate(newValue);
                  setError(null); // Limpa erros ao mudar a data
                }}
                minDate={startDate}
                format="DD/MM/YYYY"
                shouldDisableDate={shouldDisableDate}
                localeText={{
                  cancelButtonLabel: 'Cancelar',
                  toolbarTitle: 'Selecionar data',
                  okButtonLabel: 'Confirmar',
                }}
                slotProps={{
                  textField: {
                    size: "small",
                    placeholder: "Data final",
                    onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button').click(),
                    sx: { 
                      width: '100%',
                      marginBottom: '15px',
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
                    },
                  },
                }}
              />
              <div style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', textAlign: 'left' }}>Comentário:</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  style={{ 
                    width: '100%', 
                    padding: '8px', 
                    marginTop: '5px', 
                    minHeight: '100px', 
                    borderRadius: '8px', 
                    border: '1px solid #ddd',
                    textAlign: 'center',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ ...buttonStyle, width: 'auto' }}
                  disabled={loading}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ ...buttonStyle, width: 'auto', backgroundColor: '#007bff', color: 'white' }}
                  disabled={loading}
                >
                  {loading ? 'Criando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showModal && successMessage && (
        <div style={overlayStyle}>
          <div style={successModalStyle}>
            <svg 
              viewBox="0 0 24 24" 
              style={{ 
                width: '240px',  // Reduzido para 240px
                height: '240px', // Reduzido para 240px
                marginBottom: '40px',
                filter: 'drop-shadow(0px 4px 8px rgba(0, 0, 0, 0.1))'
              }}
            >
              <circle 
                cx="12" 
                cy="12" 
                r="11" 
                fill="#4CAF50" 
                fillOpacity="0.1"
              />
              <circle 
                cx="12" 
                cy="12" 
                r="8" 
                fill="#4CAF50"
              />
              <path 
                d="M8.5 12.5L11 15L15.5 9" 
                stroke="white" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                fill="none"
              />
            </svg>
            <h2 style={{ 
              color: '#333',
              marginBottom: '20px',
              fontSize: '24px'
            }}>
              Bloqueio confirmado!
            </h2>
            <p style={{
              color: '#666',
              fontSize: '16px',
              margin: 0
            }}>
              O período selecionado foi bloqueado com sucesso.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons; 