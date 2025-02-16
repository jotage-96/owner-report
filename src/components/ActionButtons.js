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
  const [openSecondPicker, setOpenSecondPicker] = useState(false);
  const [showRulesModal, setShowRulesModal] = useState(false);
  const [rules, setRules] = useState(null);
  const [loadingRules, setLoadingRules] = useState(false);
  const [rulesError, setRulesError] = useState(null);

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

  const datePickerStyles = {
    textField: {
      size: "small",
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
        '&.Mui-selected': {
          backgroundColor: 'rgba(25, 118, 210, 0.1) !important',
          '&:hover': {
            backgroundColor: 'rgba(25, 118, 210, 0.2) !important',
          }
        },
      },
    },
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
    
    // Se for a data inicial selecionada, não deve desabilitar
    if (startDate && date.isSame(startDate, 'day')) {
      return false;
    }
    
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

  const handleStartDateChange = (newValue) => {
    setStartDate(newValue);
    setError(null);
    // Abre o segundo DatePicker automaticamente
    setOpenSecondPicker(true);
  };

  const handleEndDateChange = (newValue) => {
    setEndDate(newValue);
    setError(null);
    setOpenSecondPicker(false);

    // Adiciona um pequeno delay para garantir que o DatePicker feche completamente
    setTimeout(() => {
      const commentTextarea = document.querySelector('textarea');
      if (commentTextarea) {
        commentTextarea.focus();
      }
    }, 100);
  };

  const handleEndDateClick = (e) => {
    if (startDate) { // Só permite abrir se tiver uma data inicial
      setOpenSecondPicker(true);
    }
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

  const formatDisplayDate = (date) => {
    if (!date) return '';
    
    const meses = [
      'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
      'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
    ];
    
    return `${date.date()} de ${meses[date.month()]}`;
  };

  // Mock dos dados que virão da API
  const mockRules = {
    smoking: false,
    pets: {
      allowed: "upon_request", // "yes", "no", "upon_request"
      charge: "paid" // "free", "paid"
    },
    events: false,
    quiet_hours: {
      enabled: true,
      start: "21:00",
      end: "08:00"
    },
    additional_rules: "Regras adicionais em português..." // Simplificado para string única
  };

  const handleOpenRulesModal = async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      // Simular chamada API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setRules(mockRules);
      setShowRulesModal(true);
    } catch (error) {
      setRulesError(error.message);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleCloseRulesModal = () => {
    setShowRulesModal(false);
    setRules(null);
    setRulesError(null);
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
      <button 
        style={buttonStyle}
        onClick={handleOpenRulesModal}
        disabled={loadingRules}
      >
        {loadingRules ? 'Carregando...' : 'Editar regras'}
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
                    placeholder: "Data inicial",
                    onClick: (e) => e.target.closest('.MuiFormControl-root').querySelector('button').click(),
                    inputProps: {
                      value: startDate ? formatDisplayDate(startDate) : '',
                      readOnly: true,
                    }
                  },
                  day: datePickerStyles.day
                }}
              />
              <DesktopDatePicker
                value={endDate}
                open={openSecondPicker}
                onClose={() => setOpenSecondPicker(false)}
                onChange={handleEndDateChange}
                minDate={startDate}
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
                    placeholder: "Data final",
                    onClick: handleEndDateClick,
                    inputProps: {
                      value: endDate ? formatDisplayDate(endDate) : '',
                      readOnly: true,
                    }
                  },
                  day: datePickerStyles.day
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
                    textAlign: 'left',
                    fontSize: '16px',
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

      {showRulesModal && (
        <div style={overlayStyle} onClick={(e) => {
          if (e.target === e.currentTarget) handleCloseRulesModal();
        }}>
          <div style={modalStyle}>
            <h2 style={{ marginTop: 0 }}>Editar Regras</h2>
            
            {rulesError && (
              <div style={{ 
                color: 'red', 
                marginBottom: '15px', 
                padding: '10px', 
                backgroundColor: 'rgba(255,0,0,0.1)',
                borderRadius: '4px'
              }}>
                {rulesError}
              </div>
            )}

            {loadingRules ? (
              <div style={{ textAlign: 'center', padding: '20px' }}>
                Carregando regras...
              </div>
            ) : rules ? (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px' }}>
                    É permitido fumar na acomodação?
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.smoking ? '#007bff' : 'white',
                        color: rules.smoking ? 'white' : 'black',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: !rules.smoking ? '#007bff' : 'white',
                        color: !rules.smoking ? 'white' : 'black',
                      }}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px' }}>
                    Você aceita animais de estimação?
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.pets.allowed === 'yes' ? '#007bff' : 'white',
                        color: rules.pets.allowed === 'yes' ? 'white' : 'black',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.pets.allowed === 'no' ? '#007bff' : 'white',
                        color: rules.pets.allowed === 'no' ? 'white' : 'black',
                      }}
                    >
                      Não
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.pets.allowed === 'upon_request' ? '#007bff' : 'white',
                        color: rules.pets.allowed === 'upon_request' ? 'white' : 'black',
                      }}
                    >
                      Mediante Solicitação
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.pets.charge === 'free' ? '#007bff' : 'white',
                        color: rules.pets.charge === 'free' ? 'white' : 'black',
                      }}
                    >
                      Grátis
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.pets.charge === 'paid' ? '#007bff' : 'white',
                        color: rules.pets.charge === 'paid' ? 'white' : 'black',
                      }}
                    >
                      Possibilidade de Cobrança
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px' }}>
                    É permitido fazer eventos?
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.events ? '#007bff' : 'white',
                        color: rules.events ? 'white' : 'black',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: !rules.events ? '#007bff' : 'white',
                        color: !rules.events ? 'white' : 'black',
                      }}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px' }}>
                    Há regras de silêncio?
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: rules.quiet_hours.enabled ? '#007bff' : 'white',
                        color: rules.quiet_hours.enabled ? 'white' : 'black',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: !rules.quiet_hours.enabled ? '#007bff' : 'white',
                        color: !rules.quiet_hours.enabled ? 'white' : 'black',
                      }}
                    >
                      Não
                    </button>
                  </div>
                  {rules.quiet_hours.enabled && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="time"
                        value={rules.quiet_hours.start}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                        }}
                      />
                      <span>até</span>
                      <input
                        type="time"
                        value={rules.quiet_hours.end}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                        }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ display: 'block', marginBottom: '10px' }}>
                    Regras adicionais
                  </label>
                  <textarea
                    value={rules.additional_rules}
                    placeholder="Digite aqui as regras adicionais..."
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      minHeight: '100px', 
                      borderRadius: '8px', 
                      border: '1px solid #ddd',
                      fontSize: '16px',
                    }}
                  />
                </div>
              </div>
            ) : null}

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button
                onClick={handleCloseRulesModal}
                style={{ ...buttonStyle, width: 'auto' }}
              >
                Fechar
              </button>
              <button
                style={{ 
                  ...buttonStyle, 
                  width: 'auto', 
                  backgroundColor: '#007bff', 
                  color: 'white' 
                }}
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons; 