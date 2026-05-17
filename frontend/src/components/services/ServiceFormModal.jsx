import { useState, useEffect } from 'react';
import Modal from '@/components/elements/Modal';
import Input from '@/components/elements/Input';
import Textarea from '@/components/elements/Textarea';
import Button from '@/components/elements/Button';
import { createService, updateService } from '@/services/serviceService';

const ServiceFormModal = ({ open, onClose, onSaved, service = null }) => {
  const isEdit = !!service;

  const [form, setForm]       = useState({ name: '', description: '', basePrice: '', durationMinutes: '', isActive: true });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (service) {
      setForm({
        name:            service.name            || '',
        description:     service.description     || '',
        basePrice:       service.basePrice       ?? '',
        durationMinutes: service.durationMinutes ?? '',
        isActive:        service.isActive        ?? true,
      });
    } else {
      setForm({ name: '', description: '', basePrice: '', durationMinutes: '', isActive: true });
    }
    setError('');
  }, [service, open]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) { setError("Назва є обов'язковою"); return; }
    if (!form.basePrice && form.basePrice !== 0) { setError('Вкажіть базову ціну'); return; }

    setLoading(true);
    setError('');

    const payload = {
      name:            form.name.trim(),
      description:     form.description.trim() || null,
      basePrice:       parseFloat(form.basePrice),
      durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : null,
      isActive:        form.isActive,
    };

    const result = isEdit
      ? await updateService(service.id, payload)
      : await createService(payload);

    if (result.success) {
      onSaved(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редагувати послугу' : 'Нова послуга'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Назва *"
          placeholder="Наприклад: Фарбування коренів"
          value={form.name}
          onChange={set('name')}
          autoFocus
        />
        <Textarea
          label="Опис"
          placeholder="Короткий опис послуги..."
          value={form.description}
          onChange={set('description')}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Базова ціна (грн) *"
            type="number"
            min="0"
            step="0.01"
            placeholder="500"
            value={form.basePrice}
            onChange={set('basePrice')}
          />
          <Input
            label="Тривалість (хв)"
            type="number"
            min="0"
            step="5"
            placeholder="120"
            value={form.durationMinutes}
            onChange={set('durationMinutes')}
          />
        </div>

        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            className="w-4 h-4 rounded accent-pink-500"
          />
          <span className="text-sm text-gray-700">Послуга активна</span>
        </label>

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

export default ServiceFormModal;
