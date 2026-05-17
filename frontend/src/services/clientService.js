import axios from 'axios';
import { responseStatus } from '@/utils/consts';

const defaultList = { data: [], totalItems: 0 };

export const fetchClients = async (search = '', page = 1, limit = 50) => {
  try {
    const params = { page, limit };
    if (search) params.search = search;

    const response = await axios.get('/api/clients', { params });

    if (response.status === responseStatus.HTTP_OK) {
      return response.data;
    }

    return defaultList;
  } catch (error) {
    return defaultList;
  }
};

export const fetchClient = async (id) => {
  try {
    const response = await axios.get(`/api/clients/${id}`);

    if (response.status === responseStatus.HTTP_OK) {
      return response.data;
    }

    return null;
  } catch (error) {
    return null;
  }
};

export const createClient = async (data) => {
  try {
    const response = await axios.post('/api/clients', data);

    if (response.status === responseStatus.HTTP_CREATED) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка створення клієнта' };
  } catch (error) {
    const message = error.response?.data?.error || 'Помилка створення клієнта';
    return { success: false, error: message };
  }
};

export const updateClient = async (id, data) => {
  try {
    const response = await axios.patch(`/api/clients/${id}`, data);

    if (response.status === responseStatus.HTTP_OK) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка оновлення клієнта' };
  } catch (error) {
    const message = error.response?.data?.error || 'Помилка оновлення клієнта';
    return { success: false, error: message };
  }
};

export const deleteClient = async (id) => {
  try {
    const response = await axios.delete(`/api/clients/${id}`);

    if (response.status === responseStatus.HTTP_NO_CONTENT) {
      return { success: true };
    }

    return { success: false, error: 'Помилка видалення клієнта' };
  } catch (error) {
    return { success: false, error: 'Помилка видалення клієнта' };
  }
};
