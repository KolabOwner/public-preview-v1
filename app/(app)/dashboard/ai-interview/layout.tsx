// app/dashboard/ai-interview/layout.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function AIInterviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="min-h-screen"
      >
        {children}
      </motion.div>
    </div>
  );
}