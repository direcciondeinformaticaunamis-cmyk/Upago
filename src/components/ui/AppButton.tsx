import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AppButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    icon?: LucideIcon;
    iconPosition?: 'left' | 'right';
    loading?: boolean;
    fullWidth?: boolean;
}

const AppButton: React.FC<AppButtonProps> = ({
    children,
    variant = 'primary',
    size = 'md',
    icon: Icon,
    iconPosition = 'left',
    loading = false,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}) => {
    const baseStyles = 'inline-flex items-center justify-center font-bold transition-all duration-300 active:scale-95 disabled:opacity-50 disabled:pointer-events-none rounded-xl';

    const variants = {
        primary: 'bg-primary text-white shadow-premium hover:bg-primary-hover hover:shadow-premium-hover',
        secondary: 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200',
        ghost: 'bg-transparent text-slate-500 hover:bg-slate-50 hover:text-primary',
        danger: 'bg-danger-soft text-danger hover:bg-danger hover:text-white border border-danger/20',
    };

    const sizes = {
        sm: 'px-4 py-2 text-[10px] uppercase tracking-wider',
        md: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
    };

    const widthStyle = fullWidth ? 'w-full' : '';

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? (
                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            ) : Icon && iconPosition === 'left' ? (
                <Icon size={size === 'sm' ? 14 : 18} className="mr-2" />
            ) : null}

            {children}

            {!loading && Icon && iconPosition === 'right' ? (
                <Icon size={size === 'sm' ? 14 : 18} className="ml-2" />
            ) : null}
        </button>
    );
};

export default AppButton;
