import React from 'react';
import { ThreeDots } from 'react-loader-spinner';
import { ButtonProps } from './button';

const Button: React.FC<ButtonProps> = ({
  onClick,
  isLoading = false,
  disabled = false,
  variant = 'primary',
  children,
  text,
  title,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (!disabled && !isLoading) {
      typeof onClick === 'function' && onClick(e);
    }
  };

  const baseStyles = 'px-4 py-2 rounded font-semibold focus:outline-none focus:ring';
  const variantStyles = {
    primary: 'bg-blue-500 text-white hover:bg-blue-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    accent: 'bg-green-500 text-white hover:bg-green-600',
  };

  return (
    <button
      onClick={handleClick}
      className={`${baseStyles} ${variantStyles[variant]} flex items-center justify-center ${
        (isLoading || disabled) ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled || isLoading}
      title={title}
    >
      {isLoading ? (
        <ThreeDots
          visible={true}
          height="20"
          width="40"
          color="#fff"
          ariaLabel="three-dots-loading"
        />
      ) : (
        children ? children : <span>{text}</span>
      )}
    </button>
  );
};

export default Button;
