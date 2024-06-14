// app.js
const { binanceRequest } = require('./binance');

const SYMBOL = 'BTCUSDT'; // Change this to your desired trading pair

const buyOrder = async () => {
  try {
    // Place a test market order for buying 0.001 BTC
    const response = await binanceRequest('user1', 'Y', 'POST', '/order', {
      symbol: SYMBOL,
      side: 'BUY',
      type: 'MARKET',
      quantity: 0.001,
    });

    console.log('Test Order Response:', response);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Error placing test order:', error.response.data);
    } else {
      console.error('Error placing test order:', error.message);
    }
  }
};

buyOrder();
