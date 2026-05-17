const HOURS   = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'));
const MINUTES = Array.from({ length: 12 }, (_, i) => String(i * 5).padStart(2, '0'));

const parse = (value) => {
  if (!value) return { date: '', hour: '09', minute: '00' };
  const [datePart, timePart = ''] = value.split('T');
  const [hour = '09', minute = '00'] = timePart.split(':');
  return { date: datePart, hour, minute };
};

const DateTimePicker = ({ label, value, onChange }) => {
  const { date, hour, minute } = parse(value);

  const emit = (nextDate, nextHour, nextMinute) => {
    if (!nextDate) return;
    onChange({ target: { value: `${nextDate}T${nextHour}:${nextMinute}` } });
  };

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <div className="flex gap-2">
        <input
          type="date"
          value={date}
          onChange={(e) => emit(e.target.value, hour, minute)}
          className="flex-1 h-11 px-3 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
        />
        <select
          value={hour}
          onChange={(e) => emit(date, e.target.value, minute)}
          className="w-20 h-11 px-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
        >
          {HOURS.map((h) => (
            <option key={h} value={h}>{h}</option>
          ))}
        </select>
        <select
          value={minute}
          onChange={(e) => emit(date, hour, e.target.value)}
          className="w-20 h-11 px-2 rounded-xl border border-gray-200 bg-white text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-400"
        >
          {MINUTES.map((m) => (
            <option key={m} value={m}>{m}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default DateTimePicker;
