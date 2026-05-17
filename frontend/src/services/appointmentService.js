import axios from 'axios';
import { responseStatus } from '@/utils/consts';

const defaultList = { data: [], totalItems: 0 };

export const fetchAppointments = async ({ clientId, date, dateFrom, dateTo, status, page = 1, limit = 50 } = {}) => {
  try {
    const params = { page, limit };
    if (clientId)  params.clientId  = clientId;
    if (date)      params.date      = date;
    if (dateFrom)  params.dateFrom  = dateFrom;
    if (dateTo)    params.dateTo    = dateTo;
    if (status)    params.status    = status;

    const response = await axios.get('/api/appointments', { params });

    if (response.status === responseStatus.HTTP_OK) {
      return response.data;
    }

    return defaultList;
  } catch (error) {
    return defaultList;
  }
};

const extractApiError = (error, fallback) => {
  const errors = error.response?.data?.data?.errors;
  if (errors) {
    const first = errors[0];
    return Array.isArray(first) ? first[0] : first;
  }
  return error.response?.data?.error || fallback;
};

export const createAppointment = async (data) => {
  try {
    const response = await axios.post('/api/appointments', data);

    if (response.status === responseStatus.HTTP_CREATED) {
      return { success: true, data: response.data };
    }

    return { success: false, error: 'Помилка створення запису' };
  } catch (error) {
    return { success: false, error: extractApiError(error, 'Помилка створення запису') };
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
    return { success: false, error: extractApiError(error, 'Помилка оновлення запису') };
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
