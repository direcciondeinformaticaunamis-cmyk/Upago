import React, { InputHTMLAttributes } from 'react';
import { LucideIcon } from 'lucide-react';

interface AppInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    icon?: LucideIcon;
    containerClassName?: string;
}

const AppInput = React.forwardRef<HTMLInputElement, AppInputProps>(
    ({ label, error, icon: Icon, containerClassName = '', className = '', ...props }, ref) => {
        const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
            if (props.onChange) {
                const isEmail = props.type === 'email' || props.name === 'correo' || props.name === 'email';
                const isPassword = props.type === 'password' || props.name === 'password';
                const isSearch = props.name === 'search' || className.includes('search-input') || className.includes('no-uppercase');

                if (isEmail) {
                    e.target.value = e.target.value.toLowerCase();
                } else if (!isPassword && !isSearch) {
                    e.target.value = e.target.value.toUpperCase();
                }
                props.onChange(e);
            }
        };

        return (
            <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`}>
                {label && (
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                        {label}
                    </label>
                )}
                <div className="relative group">
                    <input
                        ref={ref}
                        className={`
              w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 transition-all duration-300
              placeholder:text-slate-400 focus:outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary
              ${error ? 'border-danger bg-danger-soft/30' : 'hover:border-slate-300'}
              ${Icon ? 'pr-12' : ''}
              ${className}
            `}
                        {...props}
                        onChange={props.onChange ? handleChange : undefined}
                    />
                    {Icon && (
                        <div className={`absolute right-4 top-1/2 -translate-y-1/2 transition-colors duration-300 ${error ? 'text-danger' : 'text-slate-300 group-focus-within:text-primary'}`}>
                            <Icon size={18} strokeWidth={1.5} />
                        </div>
                    )}
                </div>
                {error && (
                    <span className="text-[10px] font-bold text-danger uppercase tracking-wider ml-1 animate-in fade-in slide-in-from-top-1 duration-300">
                        {error}
                    </span>
                )}
            </div>
        );
    }
);

AppInput.displayName = 'AppInput';

export default AppInput;
