// server.js
const express = require('express');
const { binanceRequest } = require('./binance');
const moment = require('moment'); // Add moment.js for easy date parsing

const app = express();
const port = 3000;

app.use(express.json());

app.get('/order', async (req, res) => {
    const { user, symbol, side, quantity, market = 'spot', environment = 'testnet' } = req.query;
  
    if (!user || !symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Missing parameters: symbol, side, quantity, user' });
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
      res.status(500).json({ error: 'Error placing order' });
    }
});

app.get('/cancel', async (req, res) => {
  const { user, symbol, orderId, market = 'spot', environment = 'testnet' } = req.query;

  if (!user || !symbol || !orderId) {
    return res.status(400).json({ error: 'Missing parameters: symbol, orderId, user' });
  }

  try {
    const response = await binanceRequest(user, 'cancel', {
      symbol: symbol.toUpperCase(),
      orderId: orderId,
    }, market, environment);
    res.json(response);
  } catch (error) {
    res.status(500).json({ error: 'Error placing order' });
  }
});

app.get('/account', async (req, res) => {
  const { user, market = 'spot', environment = 'testnet' } = req.query;

  if (!user) {
    return res.status(400).json({ error: 'Missing parameter: user' });
  }

  try {
      const response = await binanceRequest(user, 'account', {}, market, environment);

      const account = response;

      res.json(account);
  } catch (error) {
      res.status(500).json({ error: 'Error fetching account data' });
  }
});

app.get('/balance', async (req, res) => {
    const { user, symbol, market = 'spot', environment = 'testnet' } = req.query;

    if (!user || !symbol) {
      return res.status(400).json({ error: 'Missing parameter: symbol, user' });
    }

    try {
        const response = await binanceRequest(user, 'account', {}, market, environment);

        let balances;
        if (market == 'spot') {
          balances = response.balances;
        } else {
          balances = response.assets;
        }

        let assetBalance = balances.find(asset => asset.asset === symbol.toUpperCase());

        if (!assetBalance) {
            return res.status(404).json({ error: 'Asset not found in account balance' });
        }

        res.json(assetBalance);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching account balance' });
    }
});

app.get('/price', async (req, res) => {
    const { user, symbol, market = 'spot', environment = 'testnet' } = req.query;
  
    if (!user || !symbol) {
      return res.status(400).json({ error: 'Missing parameter: symbol, user' });
    }
  
    try {
      const response = await binanceRequest(user, 'price', {
        symbol,
      }, market, environment);
  
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching ticker price' });
    }
});

app.get('/historical-price-range', async (req, res) => {
  const { user, symbol, startTime, endTime, interval = '1h', market = 'spot', environment = 'live' } = req.query;

  if (!user || !symbol || !startTime || !endTime) {
    return res.status(400).json({ error: 'Missing parameters: symbol, startTime, endTime, user' });
  }

  try {
    // Parse startTime and endTime
    const startTimestamp = moment(startTime, 'YYYYMMDDHHmm').valueOf();
    const endTimestamp = moment(endTime, 'YYYYMMDDHHmm').valueOf();

    if (isNaN(startTimestamp) || isNaN(endTimestamp)) {
      return res.status(400).json({ error: 'Invalid datetime format. Use YYYYMMDDHHmm' });
    }

    if (endTimestamp <= startTimestamp) {
      return res.status(400).json({ error: 'endTime must be greater than startTime' });
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
        endTime: Math.min(currentTime + (500 * 60 * 60000), endTimestamp), // Fetch up to 500 hours at a time
        limit: 500,
      }, market || 'spot', environment || 'testnet');

      if (!response || response.length === 0) {
        break;
      }

      allData = allData.concat(response);
      currentTime = response[response.length - 1][0] + 1; // Move to the next interval
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
    console.error('Error fetching historical price:', error);

    // Check if the error response is an object and format it appropriately
    const errorDetails = error.response && error.response.data
      ? JSON.stringify(error.response.data)
      : error.message;

    res.status(500).json({ error: 'Error fetching historical price', details: errorDetails });
  }
});

app.get('/historical-price', async (req, res) => {
  const { user, symbol, datetime, interval = '1h', market = 'spot', environment = 'live' } = req.query;

  if (!user || !symbol || !datetime) {
    return res.status(400).json({ error: 'Missing parameters: symbol, datetime, user' });
  }

  try {
    // Parse datetime
    const timestamp = moment(datetime, 'YYYYMMDDHHmm').valueOf();

    if (isNaN(timestamp)) {
      return res.status(400).json({ error: 'Invalid datetime format. Use YYYYMMDDHHmm' });
    }

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
        return res.status(400).json({ error: 'Unsupported interval' });
    }

    // Fetch the historical data from Binance API
    const response = await binanceRequest(user, 'klines', {
      symbol: upperCaseSymbol,
      interval,
      startTime,
      endTime,
      limit: 1, // We only need one data point
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
    console.error('Error fetching single price:', error);

    // Check if the error response is an object and format it appropriately
    const errorDetails = error.response && error.response.data
      ? JSON.stringify(error.response.data)
      : error.message;

    res.status(500).json({ error: 'Error fetching single price', details: errorDetails });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
