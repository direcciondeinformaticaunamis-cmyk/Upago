import React from 'react';

interface ProgressBarProps {
    progress: number;
    label?: string;
    showText?: boolean;
    className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    progress,
    label,
    showText = true,
    className = ''
}) => {
    const clampedProgress = Math.min(100, Math.max(0, progress));

    return (
        <div className={`w-full ${className}`}>
            <div className="flex justify-between items-end mb-2.5 px-1">
                {label && (
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
                        {label}
                    </span>
                )}
                {showText && (
                    <span className="text-sm font-black text-primary tabular-nums">
                        {Math.round(clampedProgress)}%
                    </span>
                )}
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                <div
                    className="h-full bg-primary rounded-full transition-all duration-1000 cubic-bezier(0.65, 0, 0.35, 1) relative"
                    style={{ width: `${clampedProgress}%` }}
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite]" />
                </div>
            </div>
        </div>
    );
};

export default ProgressBar;
