import React from 'react';
import { ToastContainer, toast, ToastPosition } from 'react-toastify'; // Import ToastPosition from react-toastify
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';  // Ensure Tailwind is imported

export interface NotifyProps {
  message: string;
  type: 'success' | 'danger' | 'default'; // Adjust type to be specific options
  position?: ToastPosition; // Use ToastPosition type for position
}

const ToastNotification: React.FC<NotifyProps> = ({ message, type, position = 'top-right' }) => {
  const transformPos = position?.toUpperCase() || 'TOP_RIGHT';

  const notifySuccess = () => {
    toast.success(message || 'Successful!', {
      position: transformPos as ToastPosition,
      className: 'bg-green-500 text-white',
      progressClassName: 'bg-green-700',
    });
  };

  const notifyError = () => {
    toast.error(message || 'Error!', {
      position: transformPos as ToastPosition,
      className: 'bg-red-500 text-white',
      progressClassName: 'bg-red-700',
    });
  };

  const notifyDefault = () => {
    toast(message || 'Default!', {
      position: transformPos as ToastPosition,
      className: 'bg-blue-500 text-white',
      progressClassName: 'bg-blue-700',
    });
  };
  
  const notify = () => {
    switch (type) {
      case 'success':
        notifySuccess();
        break;
      case 'danger':
        notifyError();
        break;
      default:
        notifyDefault();
        break;
    }
  };

  return (
    <div>
      <ToastContainer />
    </div>
  );
};

export default ToastNotification;