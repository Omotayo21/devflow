import React, { useEffect, Fragment } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
}) => {
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    full: 'max-w-[95vw]',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-300" 
        onClick={onClose} 
      />
      <div
        className={cn(
          'relative w-full transform overflow-hidden rounded-xl border border-zinc-800 bg-zinc-950 p-6 shadow-2xl transition-all animate-in zoom-in-95 fade-in duration-300',
          sizes[size],
          className
        )}
      >
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-zinc-100">{title}</h3>}
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="-mr-2 text-zinc-500 hover:text-zinc-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="mt-2 text-zinc-400">
          {children}
        </div>

        {footer && (
          <div className="mt-6 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
