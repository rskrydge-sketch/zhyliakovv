import { cn } from '@/utils/cn';

const Textarea = ({ label, error, className, ...props }) => {
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label className="text-sm font-medium text-gray-700">{label}</label>
      )}
      <textarea
        className={cn(
          'w-full px-3 py-2.5 rounded-xl border border-gray-300 bg-white text-sm resize-none',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent',
          'disabled:bg-gray-50 disabled:cursor-not-allowed',
          error && 'border-red-400',
          className
        )}
        rows={3}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default Textarea;
