const apiKeys = {
  'user1': {
     apiKey: 'apiKeyForUser1',
     apiSecret: 'apiSecretForUser1',
   },
  
   // Add more users and their corresponding API keys and secrets here
  'user2': {
     apiKey: 'anotherApiKeyForUser2',
     apiSecret: 'anotherApiSecretForUser2',
   },
};
  
module.exports = function getConfig(userId) {
   const config = apiKeys[userId];
   if (!config) {
     throw new Error(`No API keys found for user ID: ${userId}`);
   }
   return config; 
};