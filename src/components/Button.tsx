import { type ReactNode } from 'react';
import { motion, type HTMLMotionProps } from 'framer-motion';
import './Button.css';

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "ref"> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
}

const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  className = '',
  disabled,
  ...props
}: ButtonProps) => {
  const baseClasses = `btn btn-${variant} btn-${size} ${fullWidth ? 'btn-full' : ''} ${disabled ? 'btn-disabled' : ''} ${className}`;

  return (
    <motion.button
      whileHover={disabled ? undefined : { scale: 1.02 }}
      whileTap={disabled ? undefined : { scale: 0.98 }}
      className={baseClasses.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default Button;
