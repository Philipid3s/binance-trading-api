REST API for interacting with the Binance trading platform

## prerequisites

### spot market
1. Create account on the Binance Spot Test Network: https://testnet.binance.vision/
2. Generate API keys

### futures market
3. Create account on the Binance Futures Test Network: https://testnet.binancefuture.com/
4. Copy API keys from API Keys tab

### config file
5. Rename config-sample.js to config.js and input the API keys

## install NodeJS packages

    npm install

## start API server

    npm start

## Endpoints

### Place Order

**URL**: `/order`

**Method**: `GET`

**Query Parameters**:
- `user` (required): User identifier
- `symbol` (required): Trading pair symbol (e.g., BTCUSDT)
- `side` (required): Order side (BUY or SELL)
- `quantity` (required): Order quantity
- `market` (optional): Market type (`spot` or `futures`, default is `spot`)
- `environment` (optional): Environment type (`testnet` or `live`, default is `testnet`)

**Response**:
- JSON object containing the order response

**Example**:

```bash
curl "http://localhost:3000/order?user=user1&symbol=BTCUSDT&side=BUY&quantity=0.01"
```

### Fetch Account Data

**URL**: `/account`

**Method**: `GET`

**Query Parameters**:
- `user` (required): User identifier
- `market` (optional): Market type (`spot` or `futures`, default is `spot`)
- `environment` (optional): Environment type (`testnet` or `live`, default is `testnet`)

**Response**:
- JSON object containing the account data

**Example**:
```bash
curl "http://localhost:3000/account?user=user1"
```

### Check Balance
**URL**: `/balance`

**Method**: `GET`

**Query Parameters**:
- `user` (required): User identifier
- `symbol` (required): Asset symbol (e.g., BTC)
- `market` (optional): Market type (`spot` or `futures`, default is `spot`)
- `environment` (optional): Environment type (`testnet` or `live`, default is `testnet`)

**Response**:
- JSON object containing the asset balance

**Example**:
```bash
curl "http://localhost:3000/balance?user=user1&symbol=BTC"
```

### Retrieve Ticker Price
**URL**: `/price`

**Method**: `GET`

**Query Parameters**:
- `user` (required): User identifier
- `symbol` (required): Trading pair symbol (e.g., BTCUSDT)
- `market` (optional): Market type (`spot` or `futures`, default is `spot`)
- `environment` (optional): Environment type (`testnet` or `live`, default is `testnet`)

**Response**:
- JSON object containing the ticker price

**Example**:
```bash
curl "http://localhost:3000/balance?user=user1&symbol=BTC"
```
