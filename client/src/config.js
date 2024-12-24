const isDevelopment = process.env.NODE_ENV === 'development';

const config = {
  // Im Development-Modus verwenden wir localhost:3002, ansonsten die Produktions-URL
  API_BASE_URL: isDevelopment 
    ? 'http://localhost:3002/api' 
    : process.env.REACT_APP_API_URL,
};

export default config;