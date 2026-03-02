const request = require('supertest');
const { createApp } = require('../server');

describe('server routes', () => {
  const authToken = 'test-token';
  const withAuth = (req) => req.set('x-api-key', authToken);

  test('returns 401 when auth token is missing', async () => {
    const app = createApp({ binanceRequest: jest.fn(), authTokens: [authToken] });
    const response = await request(app)
      .get('/price')
      .query({ user: '2', symbol: 'BTCUSDT' });

    expect(response.status).toBe(401);
    expect(response.body.error).toContain('Missing auth token');
  });

  test('returns 400 for invalid order side', async () => {
    const mockBinanceRequest = jest.fn();
    const app = createApp({ binanceRequest: mockBinanceRequest, authTokens: [authToken] });

    const response = await withAuth(request(app)
      .post('/order')
      .send({ user: '2', symbol: 'BTCUSDT', side: 'HOLD', quantity: '0.01' }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid side');
    expect(mockBinanceRequest).not.toHaveBeenCalled();
  });

  test('returns 400 for invalid market in price route', async () => {
    const mockBinanceRequest = jest.fn();
    const app = createApp({ binanceRequest: mockBinanceRequest, authTokens: [authToken] });

    const response = await withAuth(request(app)
      .get('/price')
      .query({ user: '2', symbol: 'BTCUSDT', market: 'margin' }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid market');
    expect(mockBinanceRequest).not.toHaveBeenCalled();
  });

  test('uses testnet default environment for historical-price route', async () => {
    const mockBinanceRequest = jest.fn().mockResolvedValue([
      [1704067200000, '42000', '42100', '41900', '42050'],
    ]);

    const app = createApp({ binanceRequest: mockBinanceRequest, authTokens: [authToken] });

    const response = await withAuth(request(app)
      .get('/historical-price')
      .query({ user: '2', symbol: 'BTCUSDT', datetime: '202401010000', interval: '1h' }));

    expect(response.status).toBe(200);
    expect(mockBinanceRequest).toHaveBeenCalledWith(
      '2',
      'klines',
      expect.objectContaining({ symbol: 'BTCUSDT', interval: '1h' }),
      'spot',
      'testnet'
    );
  });

  test('returns 400 for invalid historical interval', async () => {
    const mockBinanceRequest = jest.fn();
    const app = createApp({ binanceRequest: mockBinanceRequest, authTokens: [authToken] });

    const response = await withAuth(request(app)
      .get('/historical-price-range')
      .query({
        user: '2',
        symbol: 'BTCUSDT',
        startTime: '202401010000',
        endTime: '202401020000',
        interval: '2h',
      }));

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('Invalid interval');
    expect(mockBinanceRequest).not.toHaveBeenCalled();
  });
});
