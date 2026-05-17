import { cn } from '@/utils/cn';

const variants = {
  primary:     'bg-pink-500 hover:bg-pink-600 text-white shadow-sm',
  secondary:   'bg-gray-100 hover:bg-gray-200 text-gray-800',
  destructive: 'bg-red-500 hover:bg-red-600 text-white shadow-sm',
  ghost:       'hover:bg-gray-100 text-gray-700',
  outline:     'border border-gray-300 hover:bg-gray-50 text-gray-700',
};

const sizes = {
  sm:   'h-8 px-3 text-xs',
  md:   'h-10 px-4 text-sm',
  lg:   'h-12 px-6 text-base',
  icon: 'h-10 w-10',
};

const Button = ({ variant = 'primary', size = 'md', className, children, ...props }) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-pink-400',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
