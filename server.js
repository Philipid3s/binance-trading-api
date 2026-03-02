// server.js
require('dotenv').config();

const express = require('express');
const moment = require('moment');
const { binanceRequest: defaultBinanceRequest } = require('./binance');

const port = 3000;
const ALLOWED_MARKETS = new Set(['spot', 'futures']);
const ALLOWED_ENVIRONMENTS = new Set(['testnet', 'live']);
const ALLOWED_INTERVALS = new Set(['1m', '5m', '15m', '30m', '1h', '4h', '1d']);
const API_KEY_HEADER = 'x-api-key';

const badRequest = (res, error) => res.status(400).json({ error });

const validateUser = (user) => {
  if (!user || typeof user !== 'string' || user.trim() === '') {
    return 'Missing parameter: user';
  }
  return null;
};

const validateSymbol = (symbol) => {
  if (!symbol || typeof symbol !== 'string' || !/^[A-Z0-9]{3,20}$/i.test(symbol.trim())) {
    return 'Invalid symbol format';
  }
  return null;
};

const validateMarket = (market) => {
  if (!ALLOWED_MARKETS.has(market)) {
    return "Invalid market. Allowed values: 'spot', 'futures'";
  }
  return null;
};

const validateEnvironment = (environment) => {
  if (!ALLOWED_ENVIRONMENTS.has(environment)) {
    return "Invalid environment. Allowed values: 'testnet', 'live'";
  }
  return null;
};

const validateInterval = (interval) => {
  if (!ALLOWED_INTERVALS.has(interval)) {
    return "Invalid interval. Allowed values: 1m, 5m, 15m, 30m, 1h, 4h, 1d";
  }
  return null;
};

const validateDateTime = (value, fieldName) => {
  if (!value || !moment(value, 'YYYYMMDDHHmm', true).isValid()) {
    return `Invalid ${fieldName} format. Use YYYYMMDDHHmm`;
  }
  return null;
};

const validateOrderSide = (side) => {
  if (!side || !['BUY', 'SELL'].includes(String(side).toUpperCase())) {
    return "Invalid side. Allowed values: 'BUY', 'SELL'";
  }
  return null;
};

const validateQuantity = (quantity) => {
  const parsedQuantity = Number(quantity);
  if (!Number.isFinite(parsedQuantity) || parsedQuantity <= 0) {
    return 'Invalid quantity. Must be a number greater than 0';
  }
  return null;
};

const sendServerError = (res, error, message) => {
  const details = error.details || error.message || 'Unknown error';
  res.status(error.status || 500).json({ error: message, details });
};

const parseAuthTokens = (input) => {
  if (Array.isArray(input)) {
    return input.map((token) => String(token).trim()).filter(Boolean);
  }

  if (!input) {
    return [];
  }

  return String(input).split(',').map((token) => token.trim()).filter(Boolean);
};

const getRequestToken = (req) => {
  const apiKey = req.get(API_KEY_HEADER);
  if (apiKey) {
    return apiKey.trim();
  }

  const authorization = req.get('authorization');
  if (authorization && authorization.startsWith('Bearer ')) {
    return authorization.slice(7).trim();
  }

  return '';
};

const createAuthMiddleware = (authTokens) => (req, res, next) => {
  const providedToken = getRequestToken(req);

  if (!providedToken) {
    return res.status(401).json({ error: `Missing auth token. Provide '${API_KEY_HEADER}' header or Bearer token.` });
  }

  if (!authTokens.includes(providedToken)) {
    return res.status(403).json({ error: 'Invalid auth token' });
  }

  return next();
};

const createApp = ({ binanceRequest = defaultBinanceRequest, authTokens } = {}) => {
  const configuredTokens = parseAuthTokens(authTokens || process.env.API_AUTH_TOKENS || process.env.API_AUTH_TOKEN);
  if (configuredTokens.length === 0) {
    throw new Error('Missing API auth token configuration. Set API_AUTH_TOKEN or API_AUTH_TOKENS.');
  }

  const app = express();
  app.use(express.json());
  app.use(createAuthMiddleware(configuredTokens));

  app.post('/order', async (req, res) => {
    const { user, symbol, side, quantity, market = 'spot', environment = 'testnet' } = req.body;

    const validationError = validateUser(user)
      || validateSymbol(symbol)
      || validateOrderSide(side)
      || validateQuantity(quantity)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
      const response = await binanceRequest(user, 'order', {
        symbol: symbol.toUpperCase(),
        side: side.toUpperCase(),
        type: 'MARKET',
        quantity,
      }, market, environment);
      res.json(response);
    } catch (error) {
      sendServerError(res, error, 'Error placing order');
    }
  });

  app.delete('/cancel', async (req, res) => {
    const { user, symbol, orderId, market = 'spot', environment = 'testnet' } = req.body;

    const validationError = validateUser(user)
      || validateSymbol(symbol)
      || (!orderId ? 'Missing parameter: orderId' : null)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
      const response = await binanceRequest(user, 'cancel', {
        symbol: symbol.toUpperCase(),
        orderId,
      }, market, environment);
      res.json(response);
    } catch (error) {
      sendServerError(res, error, 'Error cancelling order');
    }
  });

  app.get('/account', async (req, res) => {
    const { user, market = 'spot', environment = 'testnet' } = req.query;

    const validationError = validateUser(user)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
      const response = await binanceRequest(user, 'account', {}, market, environment);

      const account = response;

      res.json(account);
    } catch (error) {
      sendServerError(res, error, 'Error fetching account data');
    }
  });

  app.get('/balance', async (req, res) => {
    const { user, symbol, market = 'spot', environment = 'testnet' } = req.query;

    const validationError = validateUser(user)
      || validateSymbol(symbol)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
        const response = await binanceRequest(user, 'account', {}, market, environment);

        let balances;
        if (market === 'spot') {
          balances = response.balances;
        } else {
          balances = response.assets;
        }

        const assetBalance = balances.find((asset) => asset.asset === symbol.toUpperCase());

        if (!assetBalance) {
            return res.status(404).json({ error: 'Asset not found in account balance' });
        }

        res.json(assetBalance);
    } catch (error) {
      sendServerError(res, error, 'Error fetching account balance');
    }
  });

  app.get('/price', async (req, res) => {
    const { user, symbol, market = 'spot', environment = 'testnet' } = req.query;

    const validationError = validateUser(user)
      || validateSymbol(symbol)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
      const response = await binanceRequest(user, 'price', {
        symbol: symbol.toUpperCase(),
      }, market, environment);

      res.json(response);
    } catch (error) {
      sendServerError(res, error, 'Error fetching ticker price');
    }
  });

  app.get('/historical-price-range', async (req, res) => {
    const { user, symbol, startTime, endTime, interval = '1h', market = 'spot', environment = 'testnet' } = req.query;

    const validationError = validateUser(user)
      || validateSymbol(symbol)
      || validateDateTime(startTime, 'startTime')
      || validateDateTime(endTime, 'endTime')
      || validateInterval(interval)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
    // Parse startTime and endTime
      const startTimestamp = moment(startTime, 'YYYYMMDDHHmm', true).valueOf();
      const endTimestamp = moment(endTime, 'YYYYMMDDHHmm', true).valueOf();

      if (endTimestamp <= startTimestamp) {
        return badRequest(res, 'endTime must be greater than startTime');
      }

    // Convert symbol to uppercase
      const upperCaseSymbol = symbol.toUpperCase();

    // Binance API allows a max of 1000 data points per request, we'll paginate if needed.
      let currentTime = startTimestamp;
      let allData = [];

      while (currentTime < endTimestamp) {
        const response = await binanceRequest(user, 'klines', {
          symbol: upperCaseSymbol,
          interval,
          startTime: currentTime,
          endTime: Math.min(currentTime + (500 * 60 * 60000), endTimestamp),
          limit: 500,
        }, market, environment);

        if (!response || response.length === 0) {
          break;
        }

        allData = allData.concat(response);
        currentTime = response[response.length - 1][0] + 1;
      }

      if (allData.length === 0) {
        return res.status(404).json({ error: 'No historical data found for the given time range' });
      }

    // Extracting relevant information
      const formattedData = allData.map(([openTime, open, high, low, close]) => ({
        time: moment(openTime).format('YYYYMMDDHHmm'),
        open,
        high,
        low,
        close,
      }));

      res.json({ symbol: upperCaseSymbol, interval, data: formattedData });
    } catch (error) {
      sendServerError(res, error, 'Error fetching historical price');
    }
  });

  app.get('/historical-price', async (req, res) => {
    const { user, symbol, datetime, interval = '1h', market = 'spot', environment = 'testnet' } = req.query;

    const validationError = validateUser(user)
      || validateSymbol(symbol)
      || validateDateTime(datetime, 'datetime')
      || validateInterval(interval)
      || validateMarket(market)
      || validateEnvironment(environment);

    if (validationError) {
      return badRequest(res, validationError);
    }

    try {
    // Parse datetime
      const timestamp = moment(datetime, 'YYYYMMDDHHmm', true).valueOf();

    // Convert symbol to uppercase
      const upperCaseSymbol = symbol.toUpperCase();

    // Calculate the startTime and endTime to fetch the exact candle
      let startTime;
      let endTime;

      switch (interval) {
        case '1m':
          startTime = timestamp;
          endTime = timestamp + 60 * 1000;
          break;
        case '5m':
          startTime = timestamp;
          endTime = timestamp + 5 * 60 * 1000;
          break;
        case '15m':
          startTime = timestamp;
          endTime = timestamp + 15 * 60 * 1000;
          break;
        case '30m':
          startTime = timestamp;
          endTime = timestamp + 30 * 60 * 1000;
          break;
        case '1h':
          startTime = timestamp;
          endTime = timestamp + 60 * 60 * 1000;
          break;
        case '4h':
          startTime = timestamp;
          endTime = timestamp + 4 * 60 * 60 * 1000;
          break;
        case '1d':
          startTime = timestamp;
          endTime = timestamp + 24 * 60 * 60 * 1000;
          break;
        default:
          return badRequest(res, 'Unsupported interval');
      }

    // Fetch the historical data from Binance API
      const response = await binanceRequest(user, 'klines', {
        symbol: upperCaseSymbol,
        interval,
        startTime,
        endTime,
        limit: 1,
      }, market, environment);

      if (!response || response.length === 0) {
        return res.status(404).json({ error: 'No data found for the given datetime' });
      }

    // Extract relevant data from the response
      const [openTime, open, high, low, close] = response[0];
      const singlePriceData = {
        time: moment(openTime).format('YYYYMMDDHHmm'),
        open,
        high,
        low,
        close,
      };

      res.json({ symbol: upperCaseSymbol, interval, data: singlePriceData });
    } catch (error) {
      sendServerError(res, error, 'Error fetching single price');
    }
  });

  return app;
};

if (require.main === module) {
  const app = createApp();
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
}

module.exports = { createApp };
