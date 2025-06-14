// components/landing/FloatingIcons.tsx
import {motion} from 'framer-motion';

export const FloatingIcons = () => {
  const icons = [
    { icon: '📄', delay: 0, duration: 20 },
    { icon: '✨', delay: 5, duration: 25 },
    { icon: '🎯', delay: 10, duration: 30 },
    { icon: '💼', delay: 15, duration: 22 },
    { icon: '🚀', delay: 3, duration: 28 },
  ];

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {icons.map((item, index) => (
        <motion.div
          key={index}
          className="absolute text-4xl"
          initial={{
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 100
          }}
          animate={{
            y: -100,
            x: Math.random() * window.innerWidth,
          }}
          transition={{
            duration: item.duration,
            delay: item.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        >
          {item.icon}
        </motion.div>
      ))}
    </div>
  );
};