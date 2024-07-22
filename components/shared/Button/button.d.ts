export interface ButtonProps {
    onClick?: (e: any) => void;
    isLoading?: boolean;
    disabled?: boolean;
    color?: string;
    bgColor?: string;
    children?: React.ReactNode;
    text?: string;
    variant?: 'primary' | 'secondary' | 'accent' | 'danger' | 'transparent';
    type?: string;
    title?: string;
  }