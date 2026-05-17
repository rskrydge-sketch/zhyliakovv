import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronLeft, ChevronRight, User, Scissors } from 'lucide-react';
import { fetchAppointments } from '@/services/appointmentService';
import Card from '@/components/elements/Card';
import Button from '@/components/elements/Button';
import Badge from '@/components/elements/Badge';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';
import { appointmentStatuses, appointmentStatusColors } from '@/utils/consts';

const formatDate = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' });
};

const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const AppointmentsPage = () => {
  const navigate = useNavigate();

  const [selectedDate, setSelectedDate]   = useState(new Date());
  const [appointments, setAppointments]   = useState([]);
  const [totalItems, setTotalItems]       = useState(0);
  const [loading, setLoading]             = useState(true);
  const [showForm, setShowForm]           = useState(false);
  const [statusFilter, setStatusFilter]   = useState('');

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    const result = await fetchAppointments({
      date:   toDateStr(selectedDate),
      status: statusFilter || undefined,
    });
    setAppointments(result.data);
    setTotalItems(result.totalItems);
    setLoading(false);
  }, [selectedDate, statusFilter]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const changeDay = (delta) => {
    setSelectedDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + delta);
      return d;
    });
  };

  const handleSaved = () => {
    setShowForm(false);
    loadAppointments();
  };

  const isToday = toDateStr(selectedDate) === toDateStr(new Date());

  return (
    <div className="flex flex-col">
      {/* Date picker bar */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-20">
        <div className="flex items-center justify-between px-4 py-3">
          <button
            onClick={() => changeDay(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="text-center">
            <div className="font-semibold text-gray-900 capitalize">{formatDate(selectedDate)}</div>
            {!isToday && (
              <button
                onClick={() => setSelectedDate(new Date())}
                className="text-xs text-pink-500 mt-0.5"
              >
                Сьогодні
              </button>
            )}
          </div>
          <button
            onClick={() => changeDay(1)}
            className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        {/* Status filter */}
        <div className="flex gap-1.5 px-4 pb-3 overflow-x-auto">
          {[['', 'Усі'], ['planned', 'Заплановано'], ['completed', 'Виконано'], ['cancelled', 'Скасовано']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === val
                  ? 'bg-pink-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-4 py-3 flex flex-col gap-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-gray-500">{totalItems} записів</span>
          <Button size="sm" onClick={() => setShowForm(true)}>
            <Plus size={15} /> Додати
          </Button>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-6 h-6 border-2 border-pink-400 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : appointments.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Calendar size={40} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">Записів на цей день немає</p>
          </div>
        ) : (
          appointments.map((appt) => (
            <AppointmentItem
              key={appt.id}
              appointment={appt}
              onRefresh={loadAppointments}
              onNavigate={() => navigate(`/appointments/${appt.id}`)}
            />
          ))
        )}
      </div>

      <AppointmentFormModal
        open={showForm}
        onClose={() => setShowForm(false)}
        onSaved={handleSaved}
      />
    </div>
  );
};

const AppointmentItem = ({ appointment, onNavigate }) => {
  const time = new Date(appointment.scheduledAt).toLocaleTimeString('uk-UA', {
    hour: '2-digit', minute: '2-digit',
  });

  return (
    <Card onClick={onNavigate}>
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center">
          <span className="text-xl font-bold text-gray-900 leading-none">{time.split(':')[0]}</span>
          <span className="text-sm text-gray-400 leading-none">{time.split(':')[1]}</span>
        </div>
        <div className="w-px bg-gray-100 self-stretch mx-1" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <User size={13} className="text-gray-400 flex-shrink-0" />
            <span className="font-semibold text-gray-900 truncate">{appointment.client?.nickname}</span>
            {appointment.client?.name && (
              <span className="text-sm text-gray-500 truncate hidden sm:block">{appointment.client.name}</span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Scissors size={13} className="text-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">{appointment.service?.name}</span>
          </div>
          {appointment.notes && (
            <p className="text-xs text-gray-400 mt-1 line-clamp-1">{appointment.notes}</p>
          )}
        </div>
        <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
          <span className="font-bold text-gray-900">{appointment.price} грн</span>
          <Badge className={appointmentStatusColors[appointment.status]}>
            {appointmentStatuses[appointment.status]}
          </Badge>
        </div>
      </div>
    </Card>
  );
};

export default AppointmentsPage;
