import React, { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FaTimes } from 'react-icons/fa';
import { backdrop, panel } from '../lib/motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  style?: React.CSSProperties;
  noBlur?: boolean;
}

// Pop-up used across the app. Closes on the X, a click outside, or Escape.
export default function Modal({ isOpen, onClose, children, title, style, noBlur }: ModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...backdrop}
          className={`fixed inset-0 z-[10000] flex items-center justify-center bg-ink/30 p-4 ${noBlur ? '' : 'backdrop-blur-sm'}`}
          onClick={onClose}
        >
          <motion.div
            {...panel}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="card relative max-h-[90vh] w-full max-w-xl overflow-y-auto p-6 text-ink sm:p-8"
            style={style}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              aria-label="Close"
              className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-muted transition hover:bg-iris-soft hover:text-ink"
            >
              <FaTimes />
            </button>
            {title && <h2 className="mb-6 pr-10 font-display text-2xl">{title}</h2>}
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
