const axios = require('axios');
const crypto = require('crypto');
const getConfig = require('./config');

// live url
// const BASE_URL = 'https://api.binance.com/api/v3';
// test url
const BASE_URL = 'https://testnet.binance.vision/api/v3';

const getServerTime = async () => {
  const { data: { serverTime } } = await axios.get(`${BASE_URL}/time`);
  return serverTime;
};

const generateSignature = (apiSecret, queryString) => {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
};

const binanceRequest = async (user, signed, method, endpoint, params = {}) => {
  try {
    console.log('User: ', user, ' | Endpoint: ', endpoint, ' | Method: ', method, ' | Signed: ', signed);

    const { apiKey, apiSecret } = getConfig(user);

    if (signed.toUpperCase() == 'Y') {
      const serverTime = await getServerTime();
      params.timestamp = serverTime;
      params.signature = generateSignature(apiSecret, new URLSearchParams(params).toString());
    }

    const response = await axios({
      method,
      url: `${BASE_URL}${endpoint}`,
      params,
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error('Error response from Binance:', error.response.data);
      throw new Error(error.response.data);
    } else {
      console.error('Error:', error.message);
      throw new Error(error.message);
    }
  }
};

module.exports = { binanceRequest };
