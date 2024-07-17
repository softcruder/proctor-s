import React from 'react';
import { CheckboxProps } from './checkbox';

const Checkbox: React.FC<CheckboxProps> = ({ label, checked, onChange }) => {
  return (
    <div className="flex items-center space-x-2" >
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => {
            onChange(e.target.checked)
        }}
        className="text-blue-500"
        value={checked?.toString()}
      />
      <label className="text-gray-700 text-sm">{label}</label>
    </div>
  );
};

export default Checkbox;