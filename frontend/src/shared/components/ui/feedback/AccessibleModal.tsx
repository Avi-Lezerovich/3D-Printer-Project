import { useEffect, useRef, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { trapFocus, announceToScreenReader, generateUniqueId } from '../../../utils/accessibility';
import { useAnimations } from '../../../../hooks/useAnimations';

interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  description?: string;
  closeButtonLabel?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  initialFocusRef?: React.RefObject<HTMLElement>;
  finalFocusRef?: React.RefObject<HTMLElement>;
}

export default function AccessibleModal({
  isOpen,
  onClose,
  children,
  title,
  description,
  closeButtonLabel = 'Close dialog',
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  initialFocusRef,
  finalFocusRef
}: AccessibleModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useRef(generateUniqueId('modal-title'));
  const descriptionId = useRef(generateUniqueId('modal-description'));
  
  const { scaleIn, fadeIn } = useAnimations();

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  useEffect(() => {
    if (isOpen) {
      // Store reference to previously focused element
      previousFocusRef.current = document.activeElement as HTMLElement;
      
      // Announce modal opening
      announceToScreenReader('Dialog opened', 'assertive');
      
      // Trap focus in modal
      let cleanupFocus: (() => void) | undefined;
      
      setTimeout(() => {
        if (modalRef.current) {
          cleanupFocus = trapFocus(modalRef.current);
          
          // Focus initial element or first focusable element
          if (initialFocusRef?.current) {
            initialFocusRef.current.focus();
          }
        }
      }, 100);

      return () => {
        cleanupFocus?.();
      };
    }
  }, [isOpen, initialFocusRef]);

  useEffect(() => {
    if (!isOpen && previousFocusRef.current) {
      // Return focus to previously focused element or final focus target
      const focusTarget = finalFocusRef?.current || previousFocusRef.current;
      focusTarget?.focus();
      
      // Announce modal closing
      announceToScreenReader('Dialog closed', 'assertive');
    }
  }, [isOpen, finalFocusRef]);

  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose, closeOnEscape]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            {...fadeIn}
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={handleBackdropClick}
            aria-hidden="true"
          />
          
          {/* Modal */}
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId.current : undefined}
            aria-describedby={description ? descriptionId.current : undefined}
          >
            <motion.div
              ref={modalRef}
              {...scaleIn}
              className={`
                panel w-full ${sizeClasses[size]} max-h-[90vh] overflow-y-auto
                shadow-2xl
              `}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-lg border-b border-var(--border)">
                <div>
                  {title && (
                    <h2 
                      id={titleId.current}
                      className="text-xl font-semibold text-var(--text)"
                    >
                      {title}
                    </h2>
                  )}
                  {description && (
                    <p 
                      id={descriptionId.current}
                      className="mt-1 text-sm text-var(--text-secondary)"
                    >
                      {description}
                    </p>
                  )}
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-var(--text-secondary) hover:text-var(--text) hover:bg-var(--border) transition-colors"
                  aria-label={closeButtonLabel}
                >
                  <X size={20} />
                </button>
              </div>

              {/* Content */}
              <div className="p-lg">
                {children}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}