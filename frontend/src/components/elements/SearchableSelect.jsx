import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Search, X } from 'lucide-react';
import { cn } from '@/utils/cn';

const SearchableSelect = ({ label, error, options = [], placeholder, className, value, onChange, disabled }) => {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState('');
  const containerRef      = useRef(null);
  const inputRef          = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));

  const filtered = query
    ? options.filter((o) => {
        const text = (o.searchText || o.label).toLowerCase();
        return text.includes(query.toLowerCase());
      })
    : options;

  useEffect(() => {
    const onClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setQuery('');
      }
    };
    document.addEventListener('mousedown', onClickOutside);

    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const handleOpen = () => {
    if (disabled) return;
    setOpen(true);
    setQuery('');
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const handleSelect = (option) => {
    onChange({ target: { value: option.value } });
    setOpen(false);
    setQuery('');
  };

  const handleClear = (e) => {
    e.stopPropagation();
    onChange({ target: { value: '' } });
  };

  return (
    <div className="flex flex-col gap-1" ref={containerRef}>
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}

      <div className="relative">
        <button
          type="button"
          onClick={handleOpen}
          disabled={disabled}
          className={cn(
            'w-full h-11 px-3 rounded-xl border border-gray-300 bg-white text-sm text-left flex items-center justify-between gap-2',
            'focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent',
            'disabled:bg-gray-50 disabled:cursor-not-allowed',
            error && 'border-red-400',
            className
          )}
        >
          <span className={cn('truncate', selected ? 'text-gray-900' : 'text-gray-400')}>
            {selected ? selected.label : (placeholder || 'Оберіть...')}
          </span>
          <div className="flex items-center gap-1 flex-shrink-0">
            {value && !disabled && (
              <span
                onClick={handleClear}
                className="p-0.5 rounded hover:bg-gray-100 text-gray-400 hover:text-gray-600"
              >
                <X size={13} />
              </span>
            )}
            <ChevronDown size={15} className={cn('text-gray-400 transition-transform', open && 'rotate-180')} />
          </div>
        </button>

        {open && (
          <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
            <div className="p-2 border-b border-gray-100">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Пошук..."
                  className="w-full pl-7 pr-3 h-8 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent"
                />
              </div>
            </div>

            <div className="max-h-52 overflow-y-auto">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-sm text-gray-400 text-center">Нічого не знайдено</div>
              ) : (
                filtered.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option)}
                    className={cn(
                      'w-full text-left px-3 py-2.5 text-sm hover:bg-pink-50 hover:text-pink-700 transition-colors',
                      String(option.value) === String(value) && 'bg-pink-50 text-pink-700 font-medium'
                    )}
                  >
                    {option.label}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
};

export default SearchableSelect;
