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
    <div className="flex justify-center px-0 pt-16 lg:pt-0 lg:px-16 min-h-screen">
      <div className="relative w-full max-w-full flex flex-col justify-start gap-4 px-4 md:px-6 lg:max-w-[824px] lg:px-6 xl1:max-w-[968px] xl:max-w-[1248px] xl:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8 py-8"
        >
          {children}
        </motion.div>
      </div>
    </div>
  );
}