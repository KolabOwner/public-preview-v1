// components/landing/GradientText.tsx
interface GradientTextProps {
  children: React.ReactNode;
  className?: string;
  gradient?: string;
}

export const GradientText: React.FC<GradientTextProps> = ({
  children,
  className = '',
  gradient = 'from-purple-600 to-pink-600'
}) => {
  return (
    <span className={`text-transparent bg-clip-text bg-gradient-to-r ${gradient} ${className}`}>
      {children}
    </span>
  );
};