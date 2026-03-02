jest.mock('axios');
jest.mock('../config', () => jest.fn(() => ({ apiKey: 'test-key', apiSecret: 'test-secret' })));

const axios = require('axios');
const { binanceRequest, normalizeBinanceError, generateSignature } = require('../binance');

describe('binance adapter', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get = jest.fn();
  });

  test('generateSignature returns deterministic hmac', () => {
    const signature = generateSignature('my-secret', 'symbol=BTCUSDT&timestamp=1700000000');
    expect(signature).toBe('2801c6c66fccce77d308043e3c26fc10ffb242a463a6b2b3b3ffe25c312fa405');
  });

  test('normalizes axios response errors', () => {
    const normalized = normalizeBinanceError({
      response: {
        status: 400,
        data: { code: -1121, msg: 'Invalid symbol.' },
      },
    });

    expect(normalized).toEqual({
      message: 'Invalid symbol.',
      status: 400,
      code: -1121,
      details: { code: -1121, msg: 'Invalid symbol.' },
    });
  });

  test('includes timestamp and signature for signed endpoints', async () => {
    axios.get.mockResolvedValue({ data: { serverTime: 1700000000000 } });
    axios.mockResolvedValue({ data: { ok: true } });

    const result = await binanceRequest('2', 'account', { recvWindow: 5000 }, 'spot', 'testnet');

    expect(result).toEqual({ ok: true });
    expect(axios.get).toHaveBeenCalledWith('https://testnet.binance.vision/api/v3/time');
    expect(axios).toHaveBeenCalledWith(expect.objectContaining({
      method: 'GET',
      url: 'https://testnet.binance.vision/api/v3/account',
      headers: { 'X-MBX-APIKEY': 'test-key' },
      params: expect.objectContaining({
        recvWindow: 5000,
        timestamp: 1700000000000,
        signature: expect.any(String),
      }),
    }));
  });

  test('throws wrapped error with status/code/details', async () => {
    axios.get.mockResolvedValue({ data: { serverTime: 1700000000000 } });
    axios.mockRejectedValue({
      response: {
        status: 400,
        data: { code: -1121, msg: 'Invalid symbol.' },
      },
    });

    await expect(binanceRequest('2', 'account', {}, 'spot', 'testnet')).rejects.toMatchObject({
      message: 'Invalid symbol.',
      status: 400,
      code: -1121,
      details: { code: -1121, msg: 'Invalid symbol.' },
    });
  });
});
