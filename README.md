## prerequisites
-1- Create account on the Binance Test Sport Network: https://testnet.binance.vision/
-2- Generate API keys
-3- Rename config-sample.js to config.js and input the API key

## install NodeJS packages

    npm install

## start API server

    npm start

## API endpoints

### Order Endpoint

    http://localhost:3000/order?symbol=BTCUSDT&side=BUY&quantity=0.001
    
**Description**: This endpoint allows you to place a market order for a specific symbol.

**URL**: /order

**Method**: GET

**Parameters**:
1. symbol: Trading pair symbol (e.g., BTCUSDT)
2. side: Order side (BUY or SELL)
3. quantity: Quantity of the asset to buy or sell

**Response**:
Successful response: Returns the response from the Binance API after placing the order.
Error response: Returns an error message if any parameters are missing or if there's an error placing the order.

### Balance Endpoint

    localhost:3000/balance?symbol=BTC
    
**Description**: This endpoint allows you to retrieve the balance of a specific asset in your Binance account.

**URL**: /balance

**Method**: GET

**Parameters**:
1. symbol: Asset symbol for which you want to retrieve the balance (e.g., BTC)

**Response**:
Successful response: Returns the balance of the specified asset in your Binance account.
Error response: Returns an error message if the symbol parameter is missing or if the asset is not found in your account balance.
