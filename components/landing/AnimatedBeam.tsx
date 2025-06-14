// components/landing/AnimatedBeam.tsx
import React from 'react';
import { motion } from 'framer-motion';

export const AnimatedBeam = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        className="absolute w-[40rem] h-[40rem] -top-20 -left-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 2 }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 blur-3xl animate-pulse" />
      </motion.div>
    </div>
  );
};
