import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

interface ParallaxSectionProps {
  children: React.ReactNode;
  offset?: number;
}

export const ParallaxSection: React.FC<ParallaxSectionProps> = ({ children, offset = 50 }) => {
  const { scrollYProgress } = useScroll();
  const y = useTransform(scrollYProgress, [0, 1], [0, offset]); // Remove `{ ease: [...] }`

  return (
    <motion.div style={{ y }} className="relative overflow-hidden">
      {children}
    </motion.div>
  );
};
