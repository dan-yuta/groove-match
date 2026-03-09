'use client';

interface BadgeProps {
  variant?: 'default' | 'primary' | 'secondary' | 'accent' | 'success' | 'warning';
  size?: 'sm' | 'md';
  children: React.ReactNode;
  className?: string;
}

export default function Badge({ variant = 'default', size = 'md', children, className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-surface-lighter text-text-secondary',
    primary: 'bg-primary/20 text-primary-light',
    secondary: 'bg-secondary/20 text-secondary-light',
    accent: 'bg-accent/20 text-accent',
    success: 'bg-emerald-500/20 text-emerald-400',
    warning: 'bg-amber-500/20 text-amber-400',
  };

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-3 py-1 text-xs',
  };

  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]} ${className}`}>
      {children}
    </span>
  );
}
