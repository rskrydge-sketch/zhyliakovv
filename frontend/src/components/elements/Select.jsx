import { cn } from '@/utils/cn';

const Select = ({ label, error, options = [], placeholder, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <select
        className={cn(
          'w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm appearance-none',
          'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error && 'border-red-400',
          className
        )}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Select;
