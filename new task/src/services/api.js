import axios from 'axios';

// Base URL for the Express/MySQL backend (server/back.js), unchanged from the
// original project so no backend code has to change.
export const API_BASE_URL = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE_URL,
});

export default api;
