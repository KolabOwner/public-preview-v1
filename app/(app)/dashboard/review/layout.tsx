// File: app/dashboard/review/layout.tsx
'use client';

import React from 'react';
import { motion } from 'framer-motion';

export default function ReviewLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container max-w-6xl mx-auto py-8 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {children}
      </motion.div>
    </div>
  );
}