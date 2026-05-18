import { Loader2 } from 'lucide-react';

interface SpinnerProps {
  className?: string;
  size?: number;
}

export const Spinner = ({ className = '', size = 24 }: SpinnerProps) => {
  return (
    <Loader2 
      className={`animate-spin text-blue-600 ${className}`} 
      size={size} 
    />
  );
};
