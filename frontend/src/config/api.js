// API Configuration
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // Use relative path in production (same domain)
  : 'http://localhost:8000/api';

export default API_BASE_URL;
export { API_BASE_URL };
