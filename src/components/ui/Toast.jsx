'use client';
import { AnimatePresence, motion } from 'framer-motion';

export default function Toast({ message }) {
  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.96 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="fixed bottom-6 right-6 z-[60] rounded-lg border border-cyan-400/30 bg-[#0a0a12]/95 px-4 py-2 text-sm text-cyan-200 shadow-2xl backdrop-blur"
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
