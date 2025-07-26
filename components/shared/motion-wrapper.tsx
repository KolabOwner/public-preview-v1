'use client';

import { ReactNode } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import framer-motion components to reduce initial bundle
const MotionDiv = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.div })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse" />
  }
);

const MotionSection = dynamic(
  () => import('framer-motion').then(mod => ({ default: mod.motion.section })),
  {
    ssr: false,
    loading: () => <div className="animate-pulse" />
  }
);

interface MotionWrapperProps {
  children: ReactNode;
  className?: string;
  initial?: any;
  animate?: any;
  whileInView?: any;
  whileHover?: any;
  transition?: any;
  viewport?: any;
  as?: 'div' | 'section';
}

export default function MotionWrapper({ 
  children, 
  as = 'div',
  ...motionProps 
}: MotionWrapperProps) {
  const Component = as === 'section' ? MotionSection : MotionDiv;
  
  return (
    <Component {...motionProps}>
      {children}
    </Component>
  );
}