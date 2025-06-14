// components/landing/GlowingButton.tsx
import {motion} from 'framer-motion';

interface GlowingButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export const GlowingButton: React.FC<GlowingButtonProps> = ({
  children,
  onClick,
  href,
  variant = 'primary',
  size = 'md'
}) => {
  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3',
    lg: 'px-8 py-4 text-lg'
  };

  const Component = href ? 'a' : 'button';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="relative group"
    >
      <div className={`absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg blur-md group-hover:blur-lg transition-all duration-300 ${variant === 'primary' ? 'opacity-75' : 'opacity-0'}`} />
      <Component
        href={href}
        onClick={onClick}
        className={`
          relative ${sizeClasses[size]} font-semibold rounded-lg transition-all duration-300
          ${variant === 'primary' 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white' 
            : 'bg-white/10 backdrop-blur-sm text-white border border-white/20 hover:bg-white/20'
          }
        `}
      >
        {children}
      </Component>
    </motion.div>
  );
};