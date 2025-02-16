const BASE_URL = 'https://joaoguilherme.stays.com.br';

class ApiService {
  constructor() {
    this.clientId = process.env.REACT_APP_CLIENT_ID;
    this.clientSecret = process.env.REACT_APP_CLIENT_SECRET;
    
    // Debug log
    console.log('Credentials loaded:', {
      clientId: !!this.clientId,
      clientSecret: !!this.clientSecret
    });
  }

  getAuthHeader() {
    const auth = btoa(`${this.clientId}:${this.clientSecret}`);
    // Debug log
    console.log('Auth header generated:', !!auth);
    return auth;
  }

  async fetchData(endpoint, queryParams = {}) {
    try {
      // Garantir ordem específica dos parâmetros
      const orderedParams = new URLSearchParams();
      
      // Adicionar parâmetros na ordem correta
      if (queryParams.from) orderedParams.append('from', queryParams.from);
      if (queryParams.to) orderedParams.append('to', queryParams.to);
      if (queryParams.dateType) orderedParams.append('dateType', queryParams.dateType);
      if (queryParams.type) orderedParams.append('type', queryParams.type);
      if (queryParams.listingId) orderedParams.append('listingId', queryParams.listingId);
      
      const response = await fetch(
        `/external/v1/${endpoint}?${orderedParams}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${this.getAuthHeader()}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      throw error;
    }
  }

  // Specific endpoint methods
  async getCancellations(params) {
    return this.fetchData('booking/reservations', {
      ...params,
      dateType: 'arrival',
      type: 'canceled'
    });
  }

  async getReservations(params) {
    return this.fetchData('booking/reservations', {
      ...params,
      dateType: 'arrival'
    });
  }

  async getAvailability(listingId, params) {
    return this.fetchData(`calendar/listing/${listingId}`, {
      ...params,
      availNoPrices: true
    });
  }

  async getListingDetails(listingId) {
    try {
      const response = await fetch(
        `/external/v1/content/listings/${listingId}`,
        {
          method: 'GET',
          headers: {
            'Authorization': `Basic ${this.getAuthHeader()}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error('Falha ao buscar detalhes do imóvel');
      }

      const data = await response.json();
      return {
        title: data._mstitle?.pt_BR,
        imageUrl: data._t_mainImageMeta?.url,
        state: data.address?.state,
        maxGuests: data._i_maxGuests,
        rooms: data._i_rooms
      };
    } catch (error) {
      console.error('Erro ao buscar detalhes do imóvel:', error);
      throw error;
    }
  }

  async createBlock(blockData) {
    try {
      const response = await fetch(
        `/external/v1/booking/reservations`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Basic ${this.getAuthHeader()}`
          },
          body: JSON.stringify({
            type: 'blocked',
            listingId: blockData.listingId,
            checkInDate: blockData.startDate,
            checkOutDate: blockData.endDate,
            internalNote: blockData.comment
          })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Falha ao criar bloqueio');
      }

      return await response.json();
    } catch (error) {
      throw new Error(`Erro ao criar bloqueio: ${error.message}`);
    }
  }

  async getRules(listingId) {
    try {
      const response = await fetch(`${BASE_URL}/rules/${listingId}`);
      if (!response.ok) {
        throw new Error('Falha ao buscar regras');
      }
      return await response.json();
    } catch (error) {
      throw new Error('Erro ao buscar regras: ' + error.message);
    }
  }
}

export default new ApiService();