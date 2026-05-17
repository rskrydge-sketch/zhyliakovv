import { useState, useEffect } from 'react';
import Modal from '@/components/elements/Modal';
import Input from '@/components/elements/Input';
import Select from '@/components/elements/Select';
import Textarea from '@/components/elements/Textarea';
import Button from '@/components/elements/Button';
import DateTimePicker from '@/components/elements/DateTimePicker';
import { createAppointment, updateAppointment } from '@/services/appointmentService';
import { fetchClients } from '@/services/clientService';
import { fetchServices } from '@/services/serviceService';

const statusOptions = [
  { value: 'planned',   label: 'Заплановано' },
  { value: 'completed', label: 'Виконано'    },
  { value: 'cancelled', label: 'Скасовано'   },
];

const AppointmentFormModal = ({ open, onClose, onSaved, appointment = null, preselectedClientId = null }) => {
  const isEdit = !!appointment;

  const [form, setForm]         = useState({ clientId: '', serviceId: '', scheduledAt: '', price: '', notes: '', status: 'planned' });
  const [clients, setClients]   = useState([]);
  const [services, setServices] = useState([]);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  useEffect(() => {
    if (!open) return;

    fetchClients('', 1, 200).then((r) => setClients(r.data));
    fetchServices().then((r) => setServices(r.data));

    if (appointment) {
      const dt = new Date(appointment.scheduledAt);
      const local = new Date(dt.getTime() - dt.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setForm({
        clientId:    appointment.client?.id  || '',
        serviceId:   appointment.service?.id || '',
        scheduledAt: local,
        price:       appointment.price       || '',
        notes:       appointment.notes       || '',
        status:      appointment.status      || 'planned',
      });
    } else {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      now.setHours(now.getHours() + 1);
      const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);

      setForm({
        clientId:    preselectedClientId || '',
        serviceId:   '',
        scheduledAt: local,
        price:       '',
        notes:       '',
        status:      'planned',
      });
    }
    setError('');
  }, [appointment, open, preselectedClientId]);

  const set = (field) => (e) => {
    const value = e.target.value;
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      // Автоматично підставляємо базову ціну при виборі послуги
      if (field === 'serviceId' && !isEdit) {
        const svc = services.find((s) => String(s.id) === String(value));
        if (svc) next.price = svc.basePrice;
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId)    { setError('Оберіть клієнта'); return; }
    if (!form.serviceId)   { setError('Оберіть послугу'); return; }
    if (!form.scheduledAt) { setError('Вкажіть дату і час'); return; }
    if (!form.price)       { setError('Вкажіть ціну'); return; }

    setLoading(true);
    setError('');

    const payload = {
      clientId:    parseInt(form.clientId),
      serviceId:   parseInt(form.serviceId),
      scheduledAt: form.scheduledAt.replace('T', ' ') + ':00',
      price:       parseFloat(form.price),
      notes:       form.notes.trim() || null,
      status:      form.status,
    };

    const result = isEdit
      ? await updateAppointment(appointment.id, payload)
      : await createAppointment(payload);

    if (result.success) {
      onSaved(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  const clientOptions  = clients.map((c) => ({ value: c.id, label: `${c.nickname}${c.name ? ' — ' + c.name : ''}` }));
  const serviceOptions = services.map((s) => ({ value: s.id, label: `${s.name} (${s.basePrice} грн)` }));

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редагувати запис' : 'Новий запис'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Select
          label="Клієнт *"
          placeholder="Оберіть клієнта..."
          options={clientOptions}
          value={form.clientId}
          onChange={set('clientId')}
          disabled={!!preselectedClientId && !isEdit}
        />
        <Select
          label="Послуга *"
          placeholder="Оберіть послугу..."
          options={serviceOptions}
          value={form.serviceId}
          onChange={set('serviceId')}
        />
        <DateTimePicker
          label="Дата і час *"
          value={form.scheduledAt}
          onChange={set('scheduledAt')}
        />
        <Input
          label="Ціна (грн) *"
          type="number"
          min="0"
          step="0.01"
          placeholder="500"
          value={form.price}
          onChange={set('price')}
        />
        {isEdit && (
          <Select
            label="Статус"
            options={statusOptions}
            value={form.status}
            onChange={set('status')}
          />
        )}
        <Textarea
          label="Нотатки"
          placeholder="Додаткова інформація..."
          value={form.notes}
          onChange={set('notes')}
        />

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-3 py-2.5 rounded-xl">{error}</div>
        )}

        <div className="flex gap-3 mt-1">
          <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
            Скасувати
          </Button>
          <Button type="submit" className="flex-1" disabled={loading}>
            {loading ? 'Збереження...' : 'Зберегти'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AppointmentFormModal;
