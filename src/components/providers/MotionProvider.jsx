'use client';
import { MotionConfig } from 'framer-motion';

export default function MotionProvider({ children }) {
  // reducedMotion="user" makes Framer Motion respect prefers-reduced-motion
  // across every motion.* component in the tree.
  return (
    <MotionConfig reducedMotion="user">
      {children}
    </MotionConfig>
  );
}
