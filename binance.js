// binance.js
const axios = require('axios');
const crypto = require('crypto');
const config = require('./config');

// live url
//const BASE_URL = 'https://api.binance.com/api/v3';
// test url
const BASE_URL = 'https://testnet.binance.vision/api/v3';

const getServerTime = async () => {
  const { data: { serverTime } } = await axios.get(`${BASE_URL}/time`);
  return serverTime;
};

const generateSignature = (queryString) => {
  return crypto.createHmac('sha256', config.apiSecret).update(queryString).digest('hex');
};

const binanceRequest = async (method, endpoint, params = {}) => {
  const serverTime = await getServerTime();
  params.timestamp = serverTime;
  params.signature = generateSignature(new URLSearchParams(params).toString());

  try {
    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      params,
      headers: {
        'X-MBX-APIKEY': config.apiKey,
      },
    });

    return response.data;
  } catch (error) {
    if (error.response) {
      throw error.response.data;
    } else {
      throw error.message;
    }
  }
};

module.exports = { binanceRequest };
