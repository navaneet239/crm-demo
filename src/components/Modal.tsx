import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  maxWidth?: string;
  id?: string;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = 'max-w-lg',
  id,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      id={id ? `${id}-backdrop` : 'modal-backdrop'}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#101828]/40 backdrop-blur-[2px] transition-opacity"
      onClick={onClose}
    >
      <div
        id={id}
        className={`w-full ${maxWidth} bg-white rounded-[8px] border border-[#DDE3EC] card-shadow overflow-hidden flex flex-col max-h-[90vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#DDE3EC] bg-white">
          <h2 className="font-serif text-lg font-semibold text-[#101828]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-[6px] text-[#5C6880] hover:text-[#101828] hover:bg-[#F0F4F9] transition-colors"
            aria-label="Close dialog"
          >
            <X size={18} strokeWidth={1.75} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
};
