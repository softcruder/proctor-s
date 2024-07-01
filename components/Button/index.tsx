import React from 'react';
import { ThreeDots } from 'react-loader-spinner';
import { ThreeDotsProps } from 'react-loader-spinner';

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
        (isLoading || disabled) ? 'opacity-80' : `hover:${bgColor}-700` 
      } ${isLoading ? 'cursor-process' : disabled ? 'cursor-not-allowed' : ''}`}
      disabled={disabled || isLoading}
    >
      {isLoading ? (
        <ThreeDots
        visible={true}
        height="20"
        width="40"
        color="#216fed"
        radius="15"
        ariaLabel="three-dots-loading"
        wrapperClass="loader-dots"
        /> || <div className="loader border-t-transparent border-solid animate-spin rounded-full border-white border-4 h-6 w-6"></div>
      ) : (
        children ? children : <span>{text}</span>
      )}
    </button>
  );
};

export default Button;