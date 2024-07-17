export interface TextInputProps {
    value?: string;
    name: string;
    placeholder?: string;
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    label?: string;
    required?: boolean;
    errorMessage?: string;
    type?: string;
  }