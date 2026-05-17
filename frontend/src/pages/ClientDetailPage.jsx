import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, AtSign, Edit, Trash2, Plus, User, Calendar } from 'lucide-react';
import { fetchClient, deleteClient } from '@/services/clientService';
import Button from '@/components/elements/Button';
import Badge from '@/components/elements/Badge';
import Card from '@/components/elements/Card';
import ClientFormModal from '@/components/clients/ClientFormModal';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';
import { appointmentStatuses, appointmentStatusColors } from '@/utils/consts';

const ClientDetailPage = () => {
  const { id }     = useParams();
  const navigate   = useNavigate();

  const [client, setClient]             = useState(null);
  const [loading, setLoading]           = useState(true);
  const [showEdit, setShowEdit]         = useState(false);
  const [showNewAppt, setShowNewAppt]   = useState(false);

  const loadClient = async () => {
    setLoading(true);
    const data = await fetchClient(id);
    setClient(data);
    setLoading(false);
  };

  useEffect(() => {
    loadClient();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Видалити клієнта? Всі записи також будуть видалені.')) return;
    const result = await deleteClient(id);
    if (result.success) navigate('/clients');
  };

  const handleClientSaved = (updated) => {
    setShowEdit(false);
    setClient((prev) => ({ ...prev, ...updated }));
  };

  const handleAppointmentSaved = () => {
    setShowNewAppt(false);
    loadClient();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!client) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Клієнта не знайдено</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/clients')}>
          Назад
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-14 z-20 flex items-center gap-3">
        <button
          onClick={() => navigate('/clients')}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 -ml-2"
        >
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-gray-900 flex-1 truncate">{client.nickname}</span>
        <button
          onClick={() => setShowEdit(true)}
          className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
        >
          <Edit size={18} />
        </button>
        <button
          onClick={handleDelete}
          className="p-2 rounded-xl hover:bg-red-50 text-red-400"
        >
          <Trash2 size={18} />
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-4">
        {/* Profile card */}
        <Card>
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 bg-pink-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <User size={24} className="text-pink-500" />
            </div>
            <div className="flex-1 flex flex-col gap-1.5">
              <h2 className="text-xl font-bold text-gray-900">{client.nickname}</h2>
              {client.name && <p className="text-gray-600 text-sm">{client.name}</p>}
              {client.phone && (
                <a href={`tel:${client.phone}`} className="flex items-center gap-1.5 text-sm text-blue-500">
                  <Phone size={13} /> {client.phone}
                </a>
              )}
              {client.instagram && (
                <span className="flex items-center gap-1.5 text-sm text-gray-600">
                  <AtSign size={13} /> {client.instagram.replace('@', '')}
                </span>
              )}
            </div>
          </div>
          {client.notes && (
            <p className="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-500 leading-relaxed">
              {client.notes}
            </p>
          )}
        </Card>

        {/* Appointments */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-900">
              Записи ({client.appointments?.length || 0})
            </h3>
            <Button size="sm" onClick={() => setShowNewAppt(true)}>
              <Plus size={15} /> Новий запис
            </Button>
          </div>

          {client.appointments?.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar size={32} className="mx-auto mb-2 opacity-30" />
              <p className="text-sm">Записів ще немає</p>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              {client.appointments?.map((appt) => (
                <AppointmentCard key={appt.id} appointment={appt} onRefresh={loadClient} />
              ))}
            </div>
          )}
        </div>
      </div>

      <ClientFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={handleClientSaved}
        client={client}
      />

      <AppointmentFormModal
        open={showNewAppt}
        onClose={() => setShowNewAppt(false)}
        onSaved={handleAppointmentSaved}
        preselectedClientId={client.id}
      />
    </div>
  );
};

const AppointmentCard = ({ appointment, onRefresh }) => {
  const navigate = useNavigate();
  const date = new Date(appointment.scheduledAt);
  const formattedDate = date.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return (
    <Card
      className="cursor-pointer"
      onClick={() => navigate(`/appointments/${appointment.id}`)}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="font-medium text-gray-900 truncate">{appointment.service?.name}</div>
          <div className="text-sm text-gray-500 mt-0.5">{formattedDate} о {formattedTime}</div>
          {appointment.notes && (
            <div className="text-xs text-gray-400 mt-1 line-clamp-1">{appointment.notes}</div>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="font-semibold text-gray-900">{appointment.price} грн</span>
          <Badge className={appointmentStatusColors[appointment.status]}>
            {appointmentStatuses[appointment.status]}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default ClientDetailPage;
