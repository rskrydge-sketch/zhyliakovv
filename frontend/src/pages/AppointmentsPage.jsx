import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Calendar, ChevronLeft, ChevronRight, User, Scissors, List, Pencil, Trash2, Check, X, RotateCcw } from 'lucide-react';
import { fetchAppointments, updateAppointment, deleteAppointment } from '@/services/appointmentService';
import { useToast } from '@/utils/ToastContext';
import Card from '@/components/elements/Card';
import Button from '@/components/elements/Button';
import Badge from '@/components/elements/Badge';
import AppointmentFormModal from '@/components/appointments/AppointmentFormModal';
import { appointmentStatuses, appointmentStatusColors } from '@/utils/consts';

const WEEKDAYS   = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Нд'];
const MONTHS_UK  = ['Січень','Лютий','Березень','Квітень','Травень','Червень','Липень','Серпень','Вересень','Жовтень','Листопад','Грудень'];

const toDateStr = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const weekdayIndex = (date) => (new Date(date).getDay() + 6) % 7;

const AppointmentsPage = () => {
  const navigate       = useNavigate();
  const { showToast }  = useToast();

  const [view, setView]                 = useState('day');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [calDate, setCalDate]           = useState(new Date());

  const [appointments, setAppointments] = useState([]);
  const [totalItems, setTotalItems]     = useState(0);
  const [loading, setLoading]           = useState(true);
  const [monthDots, setMonthDots]       = useState({});
  const [yearDots, setYearDots]         = useState({});
  const [showForm, setShowForm]         = useState(false);
  const [editingAppt, setEditingAppt]   = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  // --- завантаження ---

  const loadDay = useCallback(async () => {
    setLoading(true);
    const result = await fetchAppointments({ date: toDateStr(selectedDate), status: statusFilter || undefined });
    setAppointments(result.data);
    setTotalItems(result.totalItems);
    setLoading(false);
  }, [selectedDate, statusFilter]);

  const loadMonth = useCallback(async () => {
    const year  = calDate.getFullYear();
    const month = calDate.getMonth();
    const from  = toDateStr(new Date(year, month, 1));
    const to    = toDateStr(new Date(year, month + 1, 0));
    const result = await fetchAppointments({ dateFrom: from, dateTo: to, limit: 500 });
    const dots = {};
    (result.data || []).forEach((a) => { const k = a.scheduledAt.slice(0, 10); dots[k] = (dots[k] || 0) + 1; });
    setMonthDots(dots);
  }, [calDate]);

  const loadYear = useCallback(async () => {
    const year = calDate.getFullYear();
    const result = await fetchAppointments({
      dateFrom: `${year}-01-01`,
      dateTo:   `${year}-12-31`,
      limit:    2000,
    });
    const dots = {};
    (result.data || []).forEach((a) => {
      const m = parseInt(a.scheduledAt.slice(5, 7), 10) - 1;
      dots[m] = (dots[m] || 0) + 1;
    });
    setYearDots(dots);
  }, [calDate]);

  useEffect(() => { if (view === 'day')   loadDay();   }, [view, loadDay]);
  useEffect(() => { if (view === 'month') loadMonth(); }, [view, loadMonth]);
  useEffect(() => { if (view === 'year')  loadYear();  }, [view, loadYear]);

  // --- навігація ---

  const changeDay = (delta) => setSelectedDate((p) => { const d = new Date(p); d.setDate(d.getDate() + delta); return d; });

  const changeMonth = (delta) => setCalDate((p) => { const d = new Date(p); d.setMonth(d.getMonth() + delta); return d; });

  const changeYear = (delta) => setCalDate((p) => { const d = new Date(p); d.setFullYear(d.getFullYear() + delta); return d; });

  const openMonth = (monthIndex) => {
    setCalDate(new Date(calDate.getFullYear(), monthIndex, 1));
    setView('month');
  };

  const openDay = (day) => {
    setSelectedDate(day);
    setView('day');
  };

  const handleSaved = (_data, isNew) => {
    setShowForm(false);
    setEditingAppt(null);
    showToast(isNew ? 'Запис успішно створено' : 'Запис оновлено');
    if (view === 'day') loadDay(); else loadMonth();
  };

  const handleStatusChange = async (appt, status) => {
    await updateAppointment(appt.id, { status });
    showToast('Статус оновлено');
    loadDay();
  };

  const handleDelete = async (appt) => {
    if (!window.confirm(`Видалити запис для ${appt.client?.nickname}?`)) return;
    await deleteAppointment(appt.id);
    showToast('Запис видалено');
    loadDay();
  };

  // --- calendar grid ---

  const buildMonthCells = () => {
    const year   = calDate.getFullYear();
    const month  = calDate.getMonth();
    const offset = weekdayIndex(new Date(year, month, 1));
    const days   = new Date(year, month + 1, 0).getDate();
    const cells  = Array(offset).fill(null);
    for (let d = 1; d <= days; d++) cells.push(new Date(year, month, d));
    return cells;
  };

  const todayStr   = toDateStr(new Date());
  const today      = new Date();
  const monthCells = view === 'month' ? buildMonthCells() : [];

  return (
    <div className="flex flex-col">

      {/* ===== HEADER ===== */}
      <div className="bg-white border-b border-gray-100 sticky top-14 z-20">

        {/* Day header */}
        {view === 'day' && (
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => changeDay(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronLeft size={20} /></button>
            <div className="text-center">
              <button
                onClick={() => { setCalDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1)); setView('month'); }}
                className="font-semibold text-gray-900 capitalize hover:text-pink-500 transition-colors"
              >
                {new Date(selectedDate).toLocaleDateString('uk-UA', { weekday: 'long', day: 'numeric', month: 'long' })}
              </button>
              {toDateStr(selectedDate) === todayStr && <div className="text-xs text-pink-500">Сьогодні</div>}
            </div>
            <button onClick={() => changeDay(1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronRight size={20} /></button>
          </div>
        )}

        {/* Month header */}
        {view === 'month' && (
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => changeMonth(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronLeft size={20} /></button>
            <button
              onClick={() => setView('year')}
              className="font-semibold text-gray-900 capitalize hover:text-pink-500 transition-colors"
            >
              {new Date(calDate.getFullYear(), calDate.getMonth(), 1)
                .toLocaleDateString('uk-UA', { month: 'long', year: 'numeric' })}
            </button>
            <button onClick={() => changeMonth(1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronRight size={20} /></button>
          </div>
        )}

        {/* Year header */}
        {view === 'year' && (
          <div className="flex items-center justify-between px-4 py-3">
            <button onClick={() => changeYear(-1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronLeft size={20} /></button>
            <span className="font-semibold text-gray-900">{calDate.getFullYear()}</span>
            <button onClick={() => changeYear(1)} className="p-2 rounded-xl hover:bg-gray-100 text-gray-500"><ChevronRight size={20} /></button>
          </div>
        )}

        {/* View toggle + status filters (only in day view) */}
        <div className="flex items-center gap-1.5 px-4 pb-3 overflow-x-auto">
          <button
            onClick={() => setView(view === 'day' ? 'month' : 'day')}
            className="p-1.5 rounded-xl hover:bg-gray-100 text-gray-500 flex-shrink-0"
            title={view === 'day' ? 'Календар' : 'День'}
          >
            {view === 'day' ? <Calendar size={18} /> : <List size={18} />}
          </button>

          {view === 'day' && [['', 'Усі'], ['planned', 'Заплановано'], ['completed', 'Виконано'], ['cancelled', 'Скасовано']].map(([val, label]) => (
            <button
              key={val}
              onClick={() => setStatusFilter(val)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                statusFilter === val ? 'bg-pink-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* ===== YEAR VIEW ===== */}
      {view === 'year' && (
        <div className="px-4 py-4 grid grid-cols-3 gap-3">
          {MONTHS_UK.map((name, i) => {
            const isCurrentMonth = today.getFullYear() === calDate.getFullYear() && today.getMonth() === i;
            const count = yearDots[i] || 0;
            return (
              <button
                key={i}
                onClick={() => openMonth(i)}
                className={`flex flex-col items-center py-3 rounded-2xl transition-colors ${
                  isCurrentMonth ? 'bg-pink-500 text-white' : 'bg-gray-50 hover:bg-pink-50 text-gray-700'
                }`}
              >
                <span className="text-sm font-medium">{name}</span>
                {count > 0 && (
                  <span className={`mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    isCurrentMonth ? 'bg-white/25 text-white' : 'bg-pink-100 text-pink-600'
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ===== MONTH VIEW ===== */}
      {view === 'month' && (
        <div className="px-4 py-3">
          <div className="grid grid-cols-7 mb-1">
            {WEEKDAYS.map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-y-1">
            {monthCells.map((day, i) => {
              if (!day) return <div key={`e-${i}`} />;
              const str      = toDateStr(day);
              const isT      = str === todayStr;
              const selected = toDateStr(selectedDate) === str;
              const count    = monthDots[str] || 0;
              return (
                <button
                  key={str}
                  onClick={() => openDay(day)}
                  className={`relative flex flex-col items-center py-1.5 rounded-xl transition-colors ${
                    isT ? 'bg-pink-500 text-white' : selected ? 'bg-pink-100 text-pink-700' : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <span className="text-sm font-medium leading-none">{day.getDate()}</span>
                  {count > 0 && (
                    <span className={`mt-1 w-1.5 h-1.5 rounded-full ${isT ? 'bg-white' : 'bg-pink-400'}`} />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ===== DAY VIEW ===== */}
      {view === 'day' && (
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
                onNavigate={() => navigate(`/appointments/${appt.id}`)}
                onEdit={() => setEditingAppt(appt)}
                onDelete={() => handleDelete(appt)}
                onStatusChange={(status) => handleStatusChange(appt, status)}
              />
            ))
          )}
        </div>
      )}

      <AppointmentFormModal
        open={showForm || !!editingAppt}
        onClose={() => { setShowForm(false); setEditingAppt(null); }}
        onSaved={handleSaved}
        appointment={editingAppt}
      />
    </div>
  );
};

const STATUS_ACTIONS = {
  planned:   [{ status: 'completed', label: 'Виконано',    icon: Check,      cls: 'text-green-600 hover:bg-green-50' },
              { status: 'cancelled', label: 'Скасовано',   icon: X,          cls: 'text-red-500   hover:bg-red-50'   }],
  completed: [{ status: 'planned',   label: 'Заплановано', icon: RotateCcw,  cls: 'text-gray-500  hover:bg-gray-100' }],
  cancelled: [{ status: 'planned',   label: 'Заплановано', icon: RotateCcw,  cls: 'text-gray-500  hover:bg-gray-100' }],
};

const AppointmentItem = ({ appointment, onNavigate, onEdit, onDelete, onStatusChange }) => {
  const startDate       = new Date(appointment.scheduledAt);
  const startTime       = startDate.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  const durationMinutes = appointment.service?.durationMinutes;
  const endTime         = durationMinutes
    ? new Date(startDate.getTime() + durationMinutes * 60000).toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' })
    : null;

  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <Card onClick={onNavigate}>
      {/* Основна інформація */}
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center min-w-[42px]">
          <span className="text-xl font-bold text-gray-900 leading-none">{startTime}</span>
          {endTime && <span className="text-xs text-gray-400 leading-none mt-0.5">{endTime}</span>}
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

      {/* Панель дій */}
      <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-gray-100">
        <div className="flex items-center gap-1">
          {(STATUS_ACTIONS[appointment.status] || []).map(({ status, label, icon: Icon, cls }) => (
            <button
              key={status}
              onClick={stop(() => onStatusChange(status))}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${cls}`}
            >
              <Icon size={13} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={stop(onEdit)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={stop(onDelete)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      </div>
    </Card>
  );
};

export default AppointmentsPage;
