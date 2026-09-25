import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { useTrip } from '../../context/TripContext';

export const Toast: React.FC = () => {
  const { toast } = useTrip();

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 pointer-events-none flex flex-col gap-2">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="pointer-events-auto flex items-center gap-3 px-4 py-3 bg-slate-900/90 text-white text-sm font-medium rounded-xl shadow-xl backdrop-blur-md border border-slate-700/50 max-w-md"
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />}
            {toast.type === 'warning' && <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-sky-400 shrink-0" />}
            <span>{toast.text}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
