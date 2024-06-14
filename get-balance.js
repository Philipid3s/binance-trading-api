const { binanceRequest } = require('./binance');

const getBalance = async () => {
    try {
      // Send GET request to retrieve account information
      const response = await binanceRequest('user1', 'Y', 'GET', '/account');
  
      console.log('Test Account Response:', response);
    } catch (error) {
      if (error.code && error.msg) {
        console.error('Error fetching account information:', `${error.code} - ${error.msg}`);
      } else {
        console.error('Error fetching account information:', error);
      }
    }
  };

getBalance();