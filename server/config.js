const config = {
  API_BASE_URL: process.env.NODE_ENV === 'production'
    ? 'https://www.cms.codeclover.de/api'
    : 'http://localhost:5000/api',
  // Andere Konfigurationen hier...
};

module.exports = config;