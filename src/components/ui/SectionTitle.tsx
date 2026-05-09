import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SectionTitleProps {
    title: string;
    subtitle?: string;
    icon?: LucideIcon;
    className?: string;
}

const SectionTitle: React.FC<SectionTitleProps> = ({ title, subtitle, icon: Icon, className = '' }) => {
    return (
        <div className={`mb-8 ${className}`}>
            <div className="flex items-center gap-3 mb-1">
                {Icon && (
                    <div className="w-8 h-8 rounded-lg bg-primary-soft text-primary flex items-center justify-center flex-shrink-0">
                        <Icon size={18} />
                    </div>
                )}
                <h3 className="text-base font-bold text-slate-800 tracking-tight">{title}</h3>
            </div>
            {subtitle && <p className="text-sm text-slate-500 ml-11 leading-tight">{subtitle}</p>}
            <div className="h-px bg-slate-100 mt-6 w-full" />
        </div>
    );
};

export default SectionTitle;
