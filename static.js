// Base URLs for different environments and markets
const BASE_URLS = {
    spot: {
      testnet: 'https://testnet.binance.vision',
      live: 'https://api.binance.com',
    },
    futures: {
      testnet: 'https://testnet.binancefuture.com',
      live: 'https://fapi.binance.com',
    },
  };
  
// Binance Endpoints
const ENDPOINTS = {
    time: {
      spot: '/api/v3/time',
      futures: '/fapi/v1/time',
  
      method: 'GET',
      signed: 'N'
    },
    order: {
      spot: '/api/v3/order',
      futures: '/fapi/v1/order',
  
      method: 'POST',
      signed: 'Y'
    },
    cancel: {
      spot: '/api/v3/order',
      futures: '/fapi/v1/order',
  
      method: 'DELETE',
      signed: 'Y'
    },
    price: {
      spot: '/api/v3/ticker/price',
      futures: '/fapi/v1/ticker/price',
  
      method: 'GET',
      signed: 'N'
    },
    account: {
      spot: '/api/v3/account',
      futures: '/fapi/v2/account',
  
      method: 'GET',
      signed: 'Y'
    },
    klines: {
      spot: '/api/v3/klines',
      futures: '/api/v3/klines',
  
      method: 'GET',
      signed: 'N'
    }
};

module.exports = { BASE_URLS, ENDPOINTS };
