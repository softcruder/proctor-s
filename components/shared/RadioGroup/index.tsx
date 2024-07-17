import React, { useState } from 'react';
import { RadioGroupProps } from './radiogroup';

const RadioGroup: React.FC<RadioGroupProps> = ({ label, options, name, onChange, required, errorMessage }) => {
  const [selectedValue, setSelectedValue] = useState<string>('');

  const handleChange = (value: string) => {
    setSelectedValue(value);
    onChange(value);
  };

  return (
    <div className="flex-col space-x-4">
      {label && (
        <label htmlFor={name} className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="flex mt-2 m-0">
      {options.map((option) => {
        const { label, sublabel, value } = option;
        return (
          <div
            key={label}
            className={`px-4 py-1.5 mr-2 border rounded-lg cursor-pointer ${selectedValue === value ? 'border-blue-600 bg-blue-500 hover:bg-blue-300' : 'border-gray-300'} hover:text-gray-500 hover:border-blue-500`}
            onClick={() => handleChange(value)}
          >
            <div className="flex space-x-2">
              <input type="radio" name={name} id={name} checked={selectedValue === value} value={selectedValue} onClick={() => handleChange(value)}/>
              <div className={`font-medium ${selectedValue === value ? 'text-white' : ''}`}>{label}</div>
            </div>
            {label && <div className="text-gray-600">{sublabel}</div>}
          </div>
        )
      })}
      </div>
      {errorMessage && (
        <p className="mt-1 text-xs text-red-600">
          {errorMessage}
        </p>
      )}
    </div>
  );
};

export default RadioGroup;