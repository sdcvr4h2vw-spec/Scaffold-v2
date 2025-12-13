import React from 'react';
import { ButtonProps } from '../types';

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '', 
  ...props 
}) => {
  
  const baseStyles = "relative font-bold text-lg uppercase tracking-wider py-4 px-6 rounded-lg transition-all active:top-[4px] active:shadow-none outline-none select-none flex items-center justify-center";
  
  // Styles logic to match the high fidelity visual identity
  // Primary: Red/Rust with Dark Red Shadow (Used on Yellow screens)
  // Cream: Cream/Beige with Darker Beige Shadow (Used on Gradient/Red screens)
  // Outline: Dashed border style for "Add Player"
  
  const variants = {
    primary: "bg-scaffold-red text-white shadow-[0_4px_0_0_#8F2626] hover:bg-red-700",
    cream: "bg-scaffold-cream text-scaffold-red shadow-[0_4px_0_0_#D4B886] hover:bg-amber-100",
    outline: "bg-transparent border-2 border-dashed border-gray-600 text-gray-800 hover:bg-black/5 active:top-0 active:bg-black/10",
    ghost: "bg-transparent text-gray-800 font-bold hover:bg-black/5 active:top-0"
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthStyle} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};
