export const responseStatus = {
  HTTP_OK: 200,
  HTTP_CREATED: 201,
  HTTP_NO_CONTENT: 204,
  HTTP_BAD_REQUEST: 400,
  HTTP_UNAUTHORIZED: 401,
  HTTP_FORBIDDEN: 403,
  HTTP_NOT_FOUND: 404,
  HTTP_UNPROCESSABLE_ENTITY: 422,
  HTTP_CONFLICT: 409,
};

export const appointmentStatuses = {
  planned: 'Заплановано',
  completed: 'Виконано',
  cancelled: 'Скасовано',
};

export const appointmentStatusColors = {
  planned: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};
