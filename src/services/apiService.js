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

  // Add new endpoint methods here as needed
}

export default new ApiService(); 