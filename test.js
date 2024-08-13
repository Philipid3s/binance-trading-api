// app.js
const { binanceRequest } = require('./binance');

const SYMBOL = 'BTCUSDT'; // Change this to your desired trading pair

const buyOrder = async () => {
  try {

    const response = await binanceRequest('user1', 'order', {
      symbol: SYMBOL,
      side: 'BUY',
      quantity: 0.01,
      type: 'MARKET'
    }, 'spot', 'testnet');

    console.log('Test Buy Response:', response);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Error placing test order:', error.response.data);
    } else {
      console.error('Error placing test order:', error.message);
    }
  }
};

const sellOrder = async () => {
  try {

    const response = await binanceRequest('user1', 'order', {
      symbol: SYMBOL,
      side: 'SELL',
      quantity: 0.01,
      type: 'MARKET'
    }, 'spot', 'testnet');

    console.log('Test Sell Order Response:', response);
  } catch (error) {
    if (error.response && error.response.data) {
      console.error('Error placing test order:', error.response.data);
    } else {
      console.error('Error placing test order:', error.message);
    }
  }
};


const getBalance = async () => {
  try {
    // Send GET request to retrieve account information
    const response = await binanceRequest('user1', 'account', {},  'spot', 'testnet');

    let balances = response.balances;
    let assetBalance = balances.find(asset => asset.asset === 'BTC');

    console.log('Test Balance Response:', assetBalance);
  } catch (error) {
    if (error.code && error.msg) {
      console.error('Error fetching account information:', `${error.code} - ${error.msg}`);
    } else {
      console.error('Error fetching account information:', error);
    }
  }
};

buyOrder();
sellOrder();
getBalance();