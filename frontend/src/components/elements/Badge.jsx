import { cn } from '@/utils/cn';

const Badge = ({ className, children }) => {
  return (
    <span className={cn('inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium', className)}>
      {children}
    </span>
  );
};

export default Badge;
