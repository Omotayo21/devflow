import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from './Button';

interface SlideOverProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const SlideOver: React.FC<SlideOverProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
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

  return (
    <div className={cn('fixed inset-0 z-50 overflow-hidden', !isOpen && 'pointer-events-none')}>
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-500',
          isOpen ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div
          className={cn(
            'pointer-events-auto w-screen max-w-md transform border-l border-zinc-800 bg-zinc-950 shadow-2xl transition duration-500 ease-in-out sm:duration-700',
            isOpen ? 'translate-x-0' : 'translate-x-full'
          )}
        >
          <div className="flex h-full flex-col overflow-y-scroll py-6">
            <div className="px-4 sm:px-6">
              <div className="flex items-start justify-between">
                {title && <h2 className="text-lg font-semibold text-zinc-100">{title}</h2>}
                <div className="ml-3 flex h-7 items-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="-mr-2 text-zinc-500 hover:text-zinc-100"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="relative mt-6 flex-1 px-4 sm:px-6">
              {children}
            </div>

            {footer && (
              <div className="border-t border-zinc-800 px-4 py-4 sm:px-6">
                <div className="flex justify-end space-x-3">{footer}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
