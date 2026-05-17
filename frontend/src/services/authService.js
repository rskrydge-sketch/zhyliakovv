import axios from 'axios';
import { responseStatus } from '@/utils/consts';

const TOKEN_KEY = 'crm_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);

export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token);

export const removeToken = () => localStorage.removeItem(TOKEN_KEY);

export const isAuthenticated = () => !!getToken();

export const login = async (email, password) => {
  try {
    const response = await axios.post('/api/auth/login', { email, password });

    if (response.status === responseStatus.HTTP_OK && response.data.token) {
      setToken(response.data.token);
      return { success: true };
    }

    return { success: false, error: 'Невірні дані для входу' };
  } catch (error) {
    if (error.response?.status === responseStatus.HTTP_UNAUTHORIZED) {
      return { success: false, error: 'Невірний email або пароль' };
    }
    return { success: false, error: 'Помилка сервера. Спробуйте пізніше.' };
  }
};

export const logout = () => {
  removeToken();
};

// Axios interceptor — додаємо токен до кожного запиту
axios.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Axios interceptor — якщо 401, редіректимо на логін
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === responseStatus.HTTP_UNAUTHORIZED) {
      removeToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
