import { useState, useEffect } from 'react';
import Modal from '@/components/elements/Modal';
import Input from '@/components/elements/Input';
import Textarea from '@/components/elements/Textarea';
import Button from '@/components/elements/Button';
import { createClient, updateClient } from '@/services/clientService';

const ClientFormModal = ({ open, onClose, onSaved, client = null }) => {
  const isEdit = !!client;

  const [form, setForm]     = useState({ nickname: '', name: '', phone: '', instagram: '', notes: '' });
  const [error, setError]   = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (client) {
      setForm({
        nickname:  client.nickname  || '',
        name:      client.name      || '',
        phone:     client.phone     || '',
        instagram: client.instagram || '',
        notes:     client.notes     || '',
      });
    } else {
      setForm({ nickname: '', name: '', phone: '', instagram: '', notes: '' });
    }
    setError('');
  }, [client, open]);

  const set = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nickname.trim()) {
      setError("Нікнейм є обов'язковим полем");
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      nickname:  form.nickname.trim(),
      name:      form.name.trim() || null,
      phone:     form.phone.trim() || null,
      instagram: form.instagram.trim() || null,
      notes:     form.notes.trim() || null,
    };

    const result = isEdit
      ? await updateClient(client.id, payload)
      : await createClient(payload);

    if (result.success) {
      onSaved(result.data, !isEdit);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Редагувати клієнта' : 'Новий клієнт'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          label="Нікнейм *"
          placeholder="@username"
          value={form.nickname}
          onChange={set('nickname')}
          autoFocus
        />
        <Input
          label="Ім'я"
          placeholder="Аня Петренко"
          value={form.name}
          onChange={set('name')}
        />
        <Input
          label="Телефон"
          type="tel"
          placeholder="+380 99 000 00 00"
          value={form.phone}
          onChange={set('phone')}
        />
        <Input
          label="Instagram"
          placeholder="@instagram_username"
          value={form.instagram}
          onChange={set('instagram')}
        />
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

export default ClientFormModal;
