import React from 'react';
import { TextInputProps } from './inputfield';

const TextInput: React.FC<TextInputProps> = ({
  value,
  name,
  placeholder,
  onChange,
  label,
  required,
  errorMessage,
  ...props
}) => {
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <input
        type="text"
        value={value}
        name={name}
        id={name}
        placeholder={placeholder || `Enter your ${label}`}
        onChange={onChange}
        className={`mt-1 block w-full px-3 text-black py-2 border ${
          errorMessage ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        required={required}
        {...props}
      />
      {errorMessage && (
        <p className="mt-1 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default TextInput;
