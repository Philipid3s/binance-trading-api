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

app.get('/historical-price', async (req, res) => {
  const { user, symbol, time, interval = '1h', market = 'spot', environment = 'live' } = req.query;

  if (!user || !symbol || !time) {
      return res.status(400).json({ error: 'Missing parameters: symbol, time, user' });
  }

  try {
      const startTime = moment(time, 'YYYYMMDDHHmm').valueOf();

      if (isNaN(startTime)) {
          return res.status(400).json({ error: 'Invalid time format. Use YYYYmmDDHHmm' });
      }

      // Extending the endTime to be more inclusive
      const endTime = startTime + 60 * 60000; // 1 hour range

      console.log(`Fetching data for ${symbol} from ${startTime} to ${endTime}`);

      const response = await binanceRequest(user, 'klines', {
          symbol: symbol.toUpperCase(),
          interval,
          startTime,
          endTime,
          limit: 500,
      }, market || 'spot', environment || 'testnet');

      if (!response || response.length === 0) {
          return res.status(404).json({ error: 'No historical data found for the given time' });
      }

      const [openTime, open, high, low, close] = response[0];

      res.json({ symbol, time: moment(openTime).format('YYYYMMDDHHmm'), open, high, low, close });
  } catch (error) {
      console.error('Error fetching historical price:', error);
      res.status(500).json({ error: 'Error fetching historical price' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
