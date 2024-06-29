const apiKeys = {
  'user1': {
    spot: {
      testnet: {
        apiKey: 'yourTestnetSpotApiKey',
        apiSecret: 'yourTestnetSpotApiSecret',
      },
      live: {
        apiKey: 'yourLiveSpotApiKey',
        apiSecret: 'yourLiveSpotApiSecret',
      },
    },
    futures: {
      testnet: {
        apiKey: 'yourTestnetFuturesApiKey',
        apiSecret: 'yourTestnetFuturesApiSecret',
      },
      live: {
        apiKey: 'yourLiveFuturesApiKey',
        apiSecret: 'yourLiveFuturesApiSecret',
      },
    },
  },
  'user2': {
    spot: {
      testnet: {
        apiKey: 'anotherSpotTestnetApiKeyForUser2',
        apiSecret: 'anotherSpotTestnetApiSecretForUser2',
      },
      live: {
        apiKey: 'anotherLiveSpotApiKeyForUser2',
        apiSecret: 'anotherLiveSpotApiSecretForUser2',
      },
    },
    futures: {
      testnet: {
        apiKey: 'anotherFuturesTestnetApiKeyForUser2',
        apiSecret: 'anotherFuturesTestnetApiSecretForUser2',
      },
      live: {
        apiKey: 'anotherLiveFuturesApiKeyForUser2',
        apiSecret: 'anotherLiveFuturesApiSecretForUser2',
      },
    },
  },
  // Add more users and their corresponding API keys and secrets here
};

module.exports = function getConfig(userId, marketType, environment) {
  const config = apiKeys[userId];
  if (!config) {
    throw new Error(`No API keys found for user ID: ${userId}`);
  }

  const envConfig = config[marketType]?.[environment];
  if (!envConfig) {
    throw new Error(`No API keys found for user ID: ${userId}, Market Type: ${marketType}, Environment: ${environment}`);
  }

  return envConfig;
};
