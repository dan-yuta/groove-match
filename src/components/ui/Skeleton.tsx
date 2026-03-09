interface SkeletonProps {
  variant?: 'text' | 'circle' | 'card' | 'rectangle';
  width?: string;
  height?: string;
  className?: string;
}

export default function Skeleton({ variant = 'text', width, height, className = '' }: SkeletonProps) {
  const variants = {
    text: 'h-4 w-full rounded',
    circle: 'w-10 h-10 rounded-full',
    card: 'w-full h-48 rounded-2xl',
    rectangle: 'w-full h-20 rounded-xl',
  };

  return (
    <div
      className={`skeleton ${variants[variant]} ${className}`}
      style={{ width, height }}
    />
  );
}
