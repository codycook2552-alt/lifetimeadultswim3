import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'outline-white' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}) => {
  const baseStyles = "inline-flex items-center justify-center rounded-md font-medium transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed tracking-wide";

  const variants = {
    primary: "bg-zinc-900 text-white hover:bg-black focus:ring-zinc-800 shadow-sm",
    secondary: "bg-zinc-100 text-zinc-900 hover:bg-zinc-200 focus:ring-zinc-500",
    outline: "border border-zinc-300 bg-transparent text-zinc-900 hover:bg-zinc-50 focus:ring-zinc-500",
    "outline-white": "border border-white bg-transparent text-white hover:bg-white/10 focus:ring-white",
    danger: "bg-red-700 text-white hover:bg-red-800 focus:ring-red-500"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs uppercase font-semibold tracking-wider",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};