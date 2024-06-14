import React from 'react';

interface TextInputProps {
  value: string;
  name: string;
  placeholder?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  required?: boolean;
  errorMessage?: string;
}

const TextInput: React.FC<TextInputProps> = ({
  value,
  name,
  placeholder,
  onChange,
  label,
  required,
  errorMessage,
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
        placeholder={placeholder}
        onChange={onChange}
        className={`mt-1 block w-full px-3 py-2 border ${
          errorMessage ? 'border-red-500' : 'border-gray-300'
        } rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
        required={required}
      />
      {errorMessage && (
        <p className="mt-2 text-sm text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default TextInput;
