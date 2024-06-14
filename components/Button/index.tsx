import React from 'react';

interface ButtonProps {
  onClick: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  color?: string;
  bgColor?: string;
  children?: React.ReactNode;
  text?: string;
}

const Button: React.FC<ButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  color = 'text-white',
  bgColor = 'bg-blue',
  children,
  text,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!disabled && !isLoading) {
      onClick();
    }
  };

  return (
    <button
      onClick={handleClick}
      className={`${bgColor}-500 ${color} py-1.5 px-4 rounded-md w-full flex items-center justify-center ${
        (isLoading || disabled) ? 'opacity-50' : `hover:${bgColor}-700` 
      } ${isLoading ? 'cursor-process' : disabled ? 'cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <div className="loader border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-6 w-6"></div>
      ) : (
        children ? children : <span>{text}</span>
      )}
    </button>
  );
};

export default Button;