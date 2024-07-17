import { ReactElement } from "react";

export interface RadioGroupProps {
    options: { label: string; sublabel?: string; value: string }[];
    name: string;
    onChange: (value: string) => void;
    label?: string | ReactElement;
    required?: boolean;
    errorMessage?: string;
  }