const axios = require('axios');
const crypto = require('crypto');
const getConfig = require('./config');
const {BASE_URLS, ENDPOINTS} = require('./static');

const getServerTime = async (url) => {
  const { data: { serverTime } } = await axios.get(url);
  return serverTime;
};

const generateSignature = (apiSecret, queryString) => {
  return crypto.createHmac('sha256', apiSecret).update(queryString).digest('hex');
};

const binanceRequest = async (user, request, params = {}, marketType = 'spot', environment = 'testnet') => {
  try {
    console.log('User: ', user, ' | Request: ', request);

    const { apiKey, apiSecret } = getConfig(user, marketType, environment);

    const baseUrl = BASE_URLS[marketType][environment];

    const endpoint = ENDPOINTS[request][marketType];
    const signed = ENDPOINTS[request]['signed'];
    const method = ENDPOINTS[request]['method'];

    if (signed.toUpperCase() === 'Y') {
      const timeEndpoint = ENDPOINTS['time'][marketType];
      const serverTime = await getServerTime(baseUrl + timeEndpoint);
      params.timestamp = serverTime;
      params.signature = generateSignature(apiSecret, new URLSearchParams(params).toString());
    }

    const response = await axios({
      method,
      url: `${baseUrl}${endpoint}`,
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
