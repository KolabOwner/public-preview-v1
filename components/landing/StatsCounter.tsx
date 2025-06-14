import React from 'react';
import { motion } from 'framer-motion';

interface StatsCounterProps {
  end: number;
  suffix?: string;
  label: string;
}

export const StatsCounter: React.FC<StatsCounterProps> = ({ end, suffix = '', label }) => {
  const [count, setCount] = React.useState(0);
  const [isVisible, setIsVisible] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  React.useEffect(() => {
    if (isVisible) {
      const duration = 2000;
      const steps = 50;
      const increment = end / steps;
      let current = 0;

      timerRef.current = setInterval(() => {
        current += increment;
        if (current >= end) {
          setCount(end);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setCount(Math.floor(current));
        }
      }, duration / steps);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isVisible, end]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      onViewportEnter={() => setIsVisible(true)}
      className="text-center"
    >
      <div 
        className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600"
        aria-live="polite"
      >
        {count}{suffix}
      </div>
      <div className="text-gray-600 dark:text-gray-300 mt-2">{label}</div>
    </motion.div>
  );
};
