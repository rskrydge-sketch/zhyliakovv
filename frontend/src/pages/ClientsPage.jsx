import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, User, Phone, AtSign, CalendarPlus } from 'lucide-react';
import { fetchClients } from '@/services/clientService';
import { useToast } from '@/utils/ToastContext';
import Card from '@/components/elements/Card';
import Button from '@/components/elements/Button';
import ClientFormModal from '@/components/clients/ClientFormModal';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';

const ClientsPage = () => {
  const navigate      = useNavigate();
  const { showToast } = useToast();

  const [clients, setClients]                   = useState([]);
  const [totalItems, setTotalItems]             = useState(0);
  const [search, setSearch]                     = useState('');
  const [loading, setLoading]                   = useState(true);
  const [showForm, setShowForm]                 = useState(false);
  const [appointmentClientId, setAppointmentClientId] = useState(null);

  const loadClients = useCallback(async () => {
    setLoading(true);
    const result = await fetchClients(search);
    setClients(result.data);
    setTotalItems(result.totalItems);
    setLoading(false);
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(loadClients, 300);
    return () => clearTimeout(timer);
  }, [loadClients]);

  const handleClientCreated = (_data, isNew) => {
    setShowForm(false);
    showToast(isNew ? 'Клієнта створено' : 'Клієнта оновлено');
    loadClients();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Search bar */}
      <div className="bg-white px-4 py-3 border-b border-gray-100 sticky top-14 z-20">
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Пошук за нікнеймом, ім'ям, телефоном, Instagram..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 h-10 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">{totalItems} клієнтів</span>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Додати
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : clients.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <User size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Клієнтів не знайдено</p>
          </div>
        ) : (
          clients.map((client) => (
            <Card key={client.id} onClick={() => navigate(`/clients/${client.id}`)}>
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-pink-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <User size={18} className="text-pink-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900 truncate">
                      {client.nickname}
                    </span>
                    {client.name && (
                      <span className="text-sm text-gray-500 truncate">{client.name}</span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                    {client.phone && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Phone size={11} /> {client.phone}
                      </span>
                    )}
                    {client.instagram && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <AtSign size={11} /> {client.instagram.replace('@', '')}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setAppointmentClientId(client.id); }}
                  className="p-2 rounded-xl text-gray-400 hover:text-pink-500 hover:bg-pink-50 transition-colors flex-shrink-0 self-center"
                  title="Новий запис"
                >
                  <CalendarPlus size={18} />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      <ClientFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleClientCreated}
      />

      <AppointmentFormModal
        open={!!appointmentClientId}
        onClose={() => setAppointmentClientId(null)}
        onSaved={() => { setAppointmentClientId(null); showToast('Запис успішно створено'); }}
        preselectedClientId={appointmentClientId}
      />
    </div>
  );
};

export default ClientsPage;
