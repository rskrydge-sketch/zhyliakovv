import { cn } from '@/utils/cn';

const Card = ({ className, children, onClick, ...props }) => {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl border border-gray-100 shadow-sm p-4',
        onClick && 'cursor-pointer hover:border-pink-200 hover:shadow-md transition-all',
        className
      )}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

export default Card;
