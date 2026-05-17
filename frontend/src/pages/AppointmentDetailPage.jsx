import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User, Scissors, Calendar, DollarSign } from 'lucide-react';
import { fetchAppointments, deleteAppointment, updateAppointment } from '@/services/appointmentService';
import Button from '@/components/elements/Button';
import Badge from '@/components/elements/Badge';
import Card from '@/components/elements/Card';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';
import { appointmentStatuses, appointmentStatusColors } from '@/utils/consts';

const AppointmentDetailPage = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [appointment, setAppointment] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [showEdit, setShowEdit]       = useState(false);

  const loadAppointment = async () => {
    setLoading(true);
    // Використовуємо список з фільтром — простіше ніж окремий endpoint
    const response = await fetch(`/api/appointments/${id}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem('crm_token')}` },
    });
    if (response.ok) {
      setAppointment(await response.json());
    }
    setLoading(false);
  };

  useEffect(() => {
    loadAppointment();
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Видалити запис?')) return;
    const result = await deleteAppointment(id);
    if (result.success) navigate('/appointments');
  };

  const handleStatusChange = async (status) => {
    const result = await updateAppointment(id, { status });
    if (result.success) setAppointment((prev) => ({ ...prev, status }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p>Запис не знайдено</p>
        <Button variant="ghost" className="mt-4" onClick={() => navigate('/appointments')}>Назад</Button>
      </div>
    );
  }

  const date = new Date(appointment.scheduledAt);
  const formattedDate = date.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
  const formattedTime = date.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="flex flex-col">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-14 z-20 flex items-center gap-3">
        <button onClick={() => navigate('/appointments')} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500 -ml-2">
          <ArrowLeft size={20} />
        </button>
        <span className="font-semibold text-gray-900 flex-1">Запис</span>
        <button onClick={() => setShowEdit(true)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500">
          <Edit size={18} />
        </button>
        <button onClick={handleDelete} className="p-2 rounded-xl hover:bg-red-50 text-red-400">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="px-4 py-4 flex flex-col gap-3">
        {/* Status badge */}
        <div className="flex items-center justify-between">
          <Badge className={`${appointmentStatusColors[appointment.status]} text-sm px-3 py-1`}>
            {appointmentStatuses[appointment.status]}
          </Badge>
          <div className="flex gap-2">
            {appointment.status !== 'completed' && (
              <Button size="sm" variant="secondary" onClick={() => handleStatusChange('completed')}>
                Виконано
              </Button>
            )}
            {appointment.status !== 'cancelled' && (
              <Button size="sm" variant="ghost" onClick={() => handleStatusChange('cancelled')}>
                Скасувати
              </Button>
            )}
          </div>
        </div>

        {/* Info cards */}
        <Card>
          <div className="flex flex-col gap-3">
            <InfoRow icon={Calendar} label="Час">
              <span className="capitalize">{formattedDate}</span>
              <span className="text-pink-500 font-semibold"> о {formattedTime}</span>
            </InfoRow>
            <div className="h-px bg-gray-100" />
            <InfoRow icon={User} label="Клієнт">
              <button
                className="text-blue-500 font-medium"
                onClick={() => navigate(`/clients/${appointment.client?.id}`)}
              >
                {appointment.client?.nickname}
              </button>
              {appointment.client?.name && <span className="text-gray-500"> ({appointment.client.name})</span>}
            </InfoRow>
            <div className="h-px bg-gray-100" />
            <InfoRow icon={Scissors} label="Послуга">
              <span>{appointment.service?.name}</span>
            </InfoRow>
            <div className="h-px bg-gray-100" />
            <InfoRow icon={DollarSign} label="Ціна">
              <span className="text-xl font-bold text-gray-900">{appointment.price} грн</span>
              {appointment.service?.basePrice && parseFloat(appointment.price) !== parseFloat(appointment.service.basePrice) && (
                <span className="text-xs text-gray-400 ml-2">базова: {appointment.service.basePrice} грн</span>
              )}
            </InfoRow>
          </div>
        </Card>

        {appointment.notes && (
          <Card>
            <p className="text-sm text-gray-600 leading-relaxed">{appointment.notes}</p>
          </Card>
        )}
      </div>

      <AppointmentFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        onSaved={(data) => { setShowEdit(false); setAppointment(data); }}
        appointment={appointment}
      />
    </div>
  );
};

const InfoRow = ({ icon: Icon, label, children }) => (
  <div className="flex items-start gap-3">
    <Icon size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
    <div className="flex-1">
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className="text-sm text-gray-900">{children}</div>
    </div>
  </div>
);

export default AppointmentDetailPage;
