// server.js
const express = require('express');
const { binanceRequest } = require('./binance');

const app = express();
const port = 3000;

app.use(express.json());

app.get('/order', async (req, res) => {
    const { symbol, side, quantity } = req.query;
  
    if (!symbol || !side || !quantity) {
      return res.status(400).json({ error: 'Missing parameters: symbol, side, quantity' });
    }
  
    try {
      const response = await binanceRequest('POST', '/order', {
        symbol,
        side,
        type: 'MARKET',
        quantity,
      });
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error placing order' });
    }
});

app.get('/balance', async (req, res) => {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({ error: 'Missing parameter: symbol' });
    }

    
    try {
        const response = await binanceRequest('GET', '/account');

        const balances = response.balances;
        const assetBalance = balances.find(asset => asset.asset === symbol.toUpperCase());

        if (!assetBalance) {
            return res.status(404).json({ error: 'Asset not found in account balance' });
        }

        res.json(assetBalance);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching account balance' });
    }
});

// Endpoint to retrieve spot rate of a specific symbol : works only on live URL !!!!
app.get('/spot-rate', async (req, res) => {
    const { symbol } = req.query;
  
    if (!symbol) {
      return res.status(400).json({ error: 'Missing parameter: symbol' });
    }
  
    try {
      const response = await binanceRequest('GET', '/ticker/price', {
        symbol,
      });
  
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Error fetching spot rate' });
    }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
