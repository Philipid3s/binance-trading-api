// server.js
const express = require('express');
const { binanceRequest } = require('./binance');

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
        if (marketType == 'spot') {
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

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
