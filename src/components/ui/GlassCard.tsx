'use client';

import { HTMLAttributes, forwardRef } from 'react';

interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  gradientBorder?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  ({ gradientBorder, padding = 'md', className = '', children, ...props }, ref) => {
    const paddings = { none: '', sm: 'p-3', md: 'p-5', lg: 'p-7' };

    return (
      <div
        ref={ref}
        className={`glass rounded-2xl ${paddings[padding]} ${gradientBorder ? 'gradient-border' : ''} ${className}`}
        {...props}
      >
        {children}
      </div>
    );
  }
);

GlassCard.displayName = 'GlassCard';
export default GlassCard;
