"use client"
import React from 'react';

interface RangeComponentProps {
  min: number;
  max: number;
  value: number;
  onChange: (value: number) => void;
  label: string;
  additionalStyles?: any;
}

const RangeComponent: React.FC<RangeComponentProps> = ({ min, max, value, onChange, label, additionalStyles }) => {
  return (
    <div className={`flex flex-col items-center space-y-2 ${additionalStyles}`}>
      <label className="font-bold">{label}</label>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={0.01}
        value={value} 
        onChange={(e) => onChange(Number(e.target.valueAsNumber))} 
        className="w-full accent-blue-500"
      />
      <span className="font-bold">{value}</span>
    </div>
  );
};

export default RangeComponent;
