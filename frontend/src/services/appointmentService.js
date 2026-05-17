import axios from 'axios';
import { responseStatus } from '@/utils/consts';

const defaultList = { data: [], totalItems: 0 };

export const fetchAppointments = async ({ clientId, date, status, page = 1, limit = 50 } = {}) => {
  try {
    const params = { page, limit };
    if (clientId) params.clientId = clientId;
    if (date) params.date = date;
    if (status) params.status = status;

    const response = await axios.get('/api/appointments', { params });

    if (response.status === responseStatus.HTTP_OK) {
      return response.data;
    }

    return defaultList;
  } catch (error) {
    return defaultList;
  }
};

export const createAppointment = async (data) => {
  try {
    const response = await axios.post('/api/appointments', data);

    if (response.status === responseStatus.HTTP_CREATED) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка створення запису' };
  } catch (error) {
    const message = error.response?.data?.error || 'Помилка створення запису';
    return { success: false, error: message };
  }
};

export const updateAppointment = async (id, data) => {
  try {
    const response = await axios.patch(`/api/appointments/${id}`, data);

    if (response.status === responseStatus.HTTP_OK) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка оновлення запису' };
  } catch (error) {
    const message = error.response?.data?.error || 'Помилка оновлення запису';
    return { success: false, error: message };
  }
};

export const deleteAppointment = async (id) => {
  try {
    const response = await axios.delete(`/api/appointments/${id}`);

    if (response.status === responseStatus.HTTP_NO_CONTENT) {
      return { success: true };
    }

    return { success: false, error: 'Помилка видалення запису' };
  } catch (error) {
    return { success: false, error: 'Помилка видалення запису' };
  }
};
