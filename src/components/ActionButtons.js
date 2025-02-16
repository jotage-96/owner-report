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
  const [isEditing, setIsEditing] = useState(false);
  const [editedRules, setEditedRules] = useState(null);

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

  const handleOpenRulesModal = async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      const rulesData = await apiService.getRules('CK01H');
      const mappedRules = {
        smoking: rulesData.smokingAllowed,
        pets: {
          allowed: rulesData.petsAllowed,
          charge: rulesData.petsPriceType
        },
        events: rulesData.eventsAllowed,
        quiet_hours: {
          enabled: rulesData.quietHours,
          start: "21:00",
          end: "08:00"
        },
        additional_rules: rulesData._mshouserules.pt_BR
      };
      setRules(mappedRules);
      setEditedRules(mappedRules); // Inicializa o estado de edição com os valores atuais
      setShowRulesModal(true);
    } catch (error) {
      setRulesError(error.message);
    } finally {
      setLoadingRules(false);
    }
  };

  const handleSaveRules = async () => {
    setLoadingRules(true);
    setRulesError(null);
    try {
      await apiService.updateRules('CK01H', editedRules);
      setRules(editedRules);
      setIsEditing(false);
      // Opcional: mostrar mensagem de sucesso
    } catch (error) {
      setRulesError(error.message);
    } finally {
      setLoadingRules(false);
    }
  };

  // Funções para atualizar os campos
  const handleUpdateRule = (field, value) => {
    setEditedRules(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleUpdatePetsRule = (field, value) => {
    setEditedRules(prev => ({
      ...prev,
      pets: {
        ...prev.pets,
        [field]: value
      }
    }));
  };

  const handleUpdateQuietHours = (field, value) => {
    setEditedRules(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        [field]: value
      }
    }));
  };

  const handleCloseRulesModal = () => {
    setShowRulesModal(false);
    setRules(null);
    setRulesError(null);
  };

  const handleAdditionalRulesChange = (e) => {
    setEditedRules(prev => ({
      ...prev,
      additional_rules: e.target.value
    }));
  };

  const handleQuietHoursTimeChange = (field, e) => {
    setEditedRules(prev => ({
      ...prev,
      quiet_hours: {
        ...prev.quiet_hours,
        [field]: e.target.value
      }
    }));
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
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '20px'
            }}>
              <h2 style={{ margin: 0 }}>Regras da Casa</h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                style={{
                  ...buttonStyle,
                  width: 'auto',
                  backgroundColor: isEditing ? '#dc3545' : '#007bff',
                  color: 'white',
                  padding: '8px 16px',
                }}
              >
                {isEditing ? 'Cancelar Edição' : 'Editar Regras'}
              </button>
            </div>

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
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px',
                    textAlign: 'left', // Alinhamento à esquerda
                    fontWeight: '500'
                  }}>
                    É permitido fumar na acomodação?
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      disabled={!isEditing}
                      onClick={() => handleUpdateRule('smoking', true)}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.smoking ? '#007bff' : 'white',
                        color: editedRules?.smoking ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: !editedRules?.smoking ? '#007bff' : 'white',
                        color: !editedRules?.smoking ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    Você aceita animais de estimação?
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      disabled={!isEditing}
                      onClick={() => handleUpdatePetsRule('allowed', 'yes')}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.pets.allowed === 'yes' ? '#007bff' : 'white',
                        color: editedRules?.pets.allowed === 'yes' ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.pets.allowed === 'no' ? '#007bff' : 'white',
                        color: editedRules?.pets.allowed === 'no' ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Não
                    </button>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.pets.allowed === 'upon_request' ? '#007bff' : 'white',
                        color: editedRules?.pets.allowed === 'upon_request' ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Mediante Solicitação
                    </button>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.pets.charge === 'free' ? '#007bff' : 'white',
                        color: editedRules?.pets.charge === 'free' ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Grátis
                    </button>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.pets.charge === 'paid' ? '#007bff' : 'white',
                        color: editedRules?.pets.charge === 'paid' ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Possibilidade de Cobrança
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    É permitido fazer eventos?
                  </label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      disabled={!isEditing}
                      onClick={() => handleUpdateRule('events', true)}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.events ? '#007bff' : 'white',
                        color: editedRules?.events ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: !editedRules?.events ? '#007bff' : 'white',
                        color: !editedRules?.events ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Não
                    </button>
                  </div>
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    Há regras de silêncio?
                  </label>
                  <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
                    <button
                      disabled={!isEditing}
                      onClick={() => handleUpdateQuietHours('enabled', true)}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: editedRules?.quiet_hours.enabled ? '#007bff' : 'white',
                        color: editedRules?.quiet_hours.enabled ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Sim
                    </button>
                    <button
                      disabled={!isEditing}
                      style={{
                        ...buttonStyle,
                        width: 'auto',
                        backgroundColor: !editedRules?.quiet_hours.enabled ? '#007bff' : 'white',
                        color: !editedRules?.quiet_hours.enabled ? 'white' : 'black',
                        opacity: !isEditing ? 0.7 : 1,
                        cursor: isEditing ? 'pointer' : 'default',
                      }}
                    >
                      Não
                    </button>
                  </div>
                  {editedRules?.quiet_hours.enabled && (
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <input
                        type="time"
                        value={editedRules?.quiet_hours.start || ''}
                        onChange={(e) => handleQuietHoursTimeChange('start', e)}
                        disabled={!isEditing}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          opacity: !isEditing ? 0.7 : 1,
                          cursor: isEditing ? 'text' : 'default',
                        }}
                      />
                      <span>até</span>
                      <input
                        type="time"
                        value={editedRules?.quiet_hours.end || ''}
                        onChange={(e) => handleQuietHoursTimeChange('end', e)}
                        disabled={!isEditing}
                        style={{
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          opacity: !isEditing ? 0.7 : 1,
                          cursor: isEditing ? 'text' : 'default',
                        }}
                      />
                    </div>
                  )}
                </div>

                <div style={{ marginBottom: '20px' }}>
                  <label style={{ 
                    display: 'block', 
                    marginBottom: '10px',
                    textAlign: 'left',
                    fontWeight: '500'
                  }}>
                    Regras adicionais
                  </label>
                  <textarea
                    value={editedRules?.additional_rules || ''}
                    onChange={handleAdditionalRulesChange}
                    disabled={!isEditing}
                    placeholder="Digite aqui as regras adicionais..."
                    style={{ 
                      width: '100%', 
                      padding: '8px', 
                      minHeight: '100px', 
                      borderRadius: '8px', 
                      border: '1px solid #ddd',
                      fontSize: '16px',
                      backgroundColor: !isEditing ? '#f5f5f5' : 'white',
                      cursor: isEditing ? 'text' : 'default',
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
              {isEditing && (
                <button
                  onClick={handleSaveRules}
                  disabled={loadingRules}
                  style={{ 
                    ...buttonStyle, 
                    width: 'auto', 
                    backgroundColor: '#007bff', 
                    color: 'white' 
                  }}
                >
                  {loadingRules ? 'Salvando...' : 'Salvar'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActionButtons; 