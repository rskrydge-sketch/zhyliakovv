import axios from 'axios';
import { responseStatus } from '@/utils/consts';

const defaultList = { data: [] };

export const fetchServices = async (search = '') => {
  try {
    const params = {};
    if (search) params.search = search;

    const response = await axios.get('/api/services', { params });

    if (response.status === responseStatus.HTTP_OK) {
      return response.data;
    }

    return defaultList;
  } catch (error) {
    return defaultList;
  }
};

export const createService = async (data) => {
  try {
    const response = await axios.post('/api/services', data);

    if (response.status === responseStatus.HTTP_CREATED) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка створення послуги' };
  } catch (error) {
    const message = error.response?.data?.error || 'Помилка створення послуги';
    return { success: false, error: message };
  }
};

export const updateService = async (id, data) => {
  try {
    const response = await axios.patch(`/api/services/${id}`, data);

    if (response.status === responseStatus.HTTP_OK) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка оновлення послуги' };
  } catch (error) {
    const message = error.response?.data?.error || 'Помилка оновлення послуги';
    return { success: false, error: message };
  }
};

export const deleteService = async (id) => {
  try {
    const response = await axios.delete(`/api/services/${id}`);

    if (response.status === responseStatus.HTTP_NO_CONTENT) {
      return { success: true };
    }

    return { success: false, error: 'Помилка видалення послуги' };
  } catch (error) {
    return { success: false, error: 'Помилка видалення послуги' };
  }
};
