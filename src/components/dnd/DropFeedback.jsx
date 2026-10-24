'use client';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

export default function DropFeedback({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.4, opacity: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="pointer-events-none absolute inset-0 flex items-center justify-center"
        >
          <div className="rounded-full bg-emerald-400/20 p-3 ring-2 ring-emerald-400/50">
            <Check className="h-6 w-6 text-emerald-300" />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
