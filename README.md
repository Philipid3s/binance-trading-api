REST API for interacting with Binance Spot and Futures markets.

## Prerequisites
1. Create Binance testnet accounts:
`https://testnet.binance.vision/`
`https://demo-fapi.binance.com/`
2. Generate API keys.
3. Copy `config-sample.js` to `config.js` and set your keys.
4. Copy `.env.example` to `.env` and set `API_AUTH_TOKEN`.

## Setup
```bash
npm install
```

## Run
```bash
npm start
```

## Test
```bash
npm test
```

## Config and Security
- `config.js` is ignored by git (`.gitignore`) and should contain real keys.
- `.env` is ignored by git and should contain your API auth token.
- `config-sample.js` is committed and should only contain placeholders.
- `.env.example` is committed as a template.
- Server authentication is required for every endpoint.
- Provide auth via `x-api-key: <token>` header or `Authorization: Bearer <token>`.
- Configure token using `API_AUTH_TOKEN` (single token) or `API_AUTH_TOKENS` (comma-separated list).

## Global Validation Rules
- `market`: `spot` or `futures`
- `environment`: `testnet` or `live`
- `interval`: `1m`, `5m`, `15m`, `30m`, `1h`, `4h`, `1d`
- `symbol`: uppercase alphanumeric pair format (example: `BTCUSDT`)
- Datetime fields (`datetime`, `startTime`, `endTime`): `YYYYMMDDHHmm`

## Endpoints

### Place Order
- URL: `/order`
- Method: `POST`
Request body:
- `user` required
- `symbol` required
- `side` required: `BUY` or `SELL`
- `quantity` required: number > 0
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```bash
curl -X POST "http://localhost:3000/order" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: replace-with-strong-token" ^
  -d "{\"user\":\"user1\",\"symbol\":\"BTCUSDT\",\"side\":\"BUY\",\"quantity\":0.01}"
```

### Cancel Order
- URL: `/cancel`
- Method: `DELETE`
Request body:
- `user` required
- `symbol` required
- `orderId` required
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```bash
curl -X DELETE "http://localhost:3000/cancel" ^
  -H "Content-Type: application/json" ^
  -H "x-api-key: replace-with-strong-token" ^
  -d "{\"user\":\"user1\",\"symbol\":\"BTCUSDT\",\"orderId\":\"123456\"}"
```

### Fetch Account Data
- URL: `/account`
- Method: `GET`
Query parameters:
- `user` required
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```bash
curl -H "x-api-key: replace-with-strong-token" "http://localhost:3000/account?user=user1"
```

### Check Balance
- URL: `/balance`
- Method: `GET`
Query parameters:
- `user` required
- `symbol` required
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```bash
curl -H "x-api-key: replace-with-strong-token" "http://localhost:3000/balance?user=user1&symbol=BTC"
```

### Retrieve Ticker Price
- URL: `/price`
- Method: `GET`
Query parameters:
- `user` required
- `symbol` required
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```bash
curl -H "x-api-key: replace-with-strong-token" "http://localhost:3000/price?user=user1&symbol=BTCUSDT"
```

### Historical Price
- URL: `/historical-price`
- Method: `GET`
Query parameters:
- `user` required
- `symbol` required
- `datetime` required (`YYYYMMDDHHmm`)
- `interval` optional, default `1h`
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```http
GET /historical-price?user=user1&symbol=BTCUSDT&datetime=202401020000&interval=1h
```

### Historical Price Range
- URL: `/historical-price-range`
- Method: `GET`
Query parameters:
- `user` required
- `symbol` required
- `startTime` required (`YYYYMMDDHHmm`)
- `endTime` required (`YYYYMMDDHHmm`)
- `interval` optional, default `1h`
- `market` optional, default `spot`
- `environment` optional, default `testnet`

Example:
```http
GET /historical-price-range?user=user1&symbol=BTCUSDT&startTime=202401010000&endTime=202401020000&interval=1h&market=spot&environment=testnet
```


