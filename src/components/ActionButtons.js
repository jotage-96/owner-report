import React from 'react';

const ActionButtons = () => {
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

  return (
    <div style={containerStyle}>
      <button style={buttonStyle}>
        Criar bloqueio
      </button>
      <button style={buttonStyle}>
        Alterar preço
      </button>
      <button style={buttonStyle}>
        Editar regras
      </button>
    </div>
  );
};

export default ActionButtons; 