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

const normalizeBinanceError = (error) => {
  if (error && error.response) {
    const { status, data } = error.response;
    const message = (data && typeof data === 'object' && (data.msg || data.message))
      || (typeof data === 'string' ? data : 'Binance API request failed');

    return {
      message,
      status: status || 500,
      code: data && typeof data === 'object' ? data.code : undefined,
      details: data,
    };
  }

  return {
    message: error && error.message ? error.message : 'Unexpected request error',
    status: 500,
    code: undefined,
    details: undefined,
  };
};

const binanceRequest = async (user, request, params = {}, marketType = 'spot', environment = 'testnet') => {
  try {
    console.log('User: ', user, ' | Request: ', request);

    const { apiKey, apiSecret } = getConfig(user, marketType, environment);

    const baseUrl = BASE_URLS[marketType][environment];

    const endpoint = ENDPOINTS[request][marketType];
    const signed = ENDPOINTS[request]['signed'];
    const method = ENDPOINTS[request]['method'];
    const requestParams = { ...params };

    if (signed.toUpperCase() === 'Y') {
      const timeEndpoint = ENDPOINTS['time'][marketType];
      const serverTime = await getServerTime(baseUrl + timeEndpoint);
      requestParams.timestamp = serverTime;
      requestParams.signature = generateSignature(apiSecret, new URLSearchParams(requestParams).toString());
    }

    const response = await axios({
      method,
      url: `${baseUrl}${endpoint}`,
      params: requestParams,
      headers: {
        'X-MBX-APIKEY': apiKey,
      },
    });
    return response.data;
  } catch (error) {
    const normalizedError = normalizeBinanceError(error);
    console.error('Error response from Binance:', normalizedError.details || normalizedError.message);

    const wrappedError = new Error(normalizedError.message);
    wrappedError.status = normalizedError.status;
    wrappedError.code = normalizedError.code;
    wrappedError.details = normalizedError.details;
    throw wrappedError;
  }
};

module.exports = { binanceRequest, generateSignature, normalizeBinanceError };
