import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Check } from 'lucide-react';
import AppButton from './AppButton';

interface DatePickerProps {
    value: string;
    onChange: (value: string) => void;
    label: string;
    error?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ value, onChange, label, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [tempDate, setTempDate] = useState({
        day: 1,
        month: 1,
        year: 2000
    });

    // Synchronize temp state when modal opens
    useEffect(() => {
        if (isOpen) {
            if (value && value.includes('-')) {
                const parts = value.split('-');
                setTempDate({
                    year: parseInt(parts[0]) || 2000,
                    month: parseInt(parts[1]) || 1,
                    day: parseInt(parts[2]) || 1
                });
            } else {
                setTempDate({ day: 1, month: 1, year: 2000 });
            }
        }
    }, [isOpen, value]);

    const days = Array.from({ length: 31 }, (_, i) => i + 1);
    const months = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);

    const handleConfirm = () => {
        const formattedDate = `${tempDate.year}-${String(tempDate.month).padStart(2, '0')}-${String(tempDate.day).padStart(2, '0')}`;
        onChange(formattedDate);
        setIsOpen(false);
    };

    return (
        <div className="w-full">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1 mb-1.5 block">
                {label}
            </label>
            {/* Triguer Button (Mobile Only) */}
            <div className="md:hidden">
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className={`
                        w-full flex items-center justify-between px-4 py-3.5 bg-white border rounded-xl text-sm transition-all duration-300
                        ${error ? 'border-danger bg-danger-soft/30 text-danger' : 'border-slate-200 text-slate-800 hover:border-slate-300'}
                    `}
                >
                    <span className={!value ? 'text-slate-400' : 'font-bold'}>
                        {value ? value.split('-').reverse().join('/') : 'Seleccionar fecha'}
                    </span>
                    <Calendar size={18} className={error ? 'text-danger' : 'text-slate-300'} />
                </button>
            </div>

            {/* Manual Input (Desktop Only) */}
            <div className="hidden md:block">
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    className={`
                        w-full px-4 py-3 bg-white border rounded-xl text-sm font-bold text-slate-800 outline-none transition-all duration-300
                        ${error ? 'border-danger bg-danger-soft/30 text-danger' : 'border-slate-200 focus:border-primary'}
                    `}
                />
            </div>

            {error && (
                <span className="text-[10px] font-bold text-danger uppercase tracking-wider ml-1 mt-1 block animate-in fade-in slide-in-from-top-1">
                    {error}
                </span>
            )}

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[2.5rem] p-8 z-[70] shadow-2xl"
                        >
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tighter">Fecha de Nacimiento</h3>
                                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="flex gap-4 h-48 overflow-hidden relative">
                                {/* Gradient overlays for wheel effect */}
                                <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
                                <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 border-y border-slate-100 z-0 pointer-events-none" />

                                {/* Day Wheel */}
                                <div className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar text-center py-20">
                                    {days.map(d => (
                                        <div
                                            key={d}
                                            onClick={() => setTempDate(prev => ({ ...prev, day: d }))}
                                            className={`h-10 snap-center flex items-center justify-center text-sm font-black transition-colors ${tempDate.day === d ? 'text-primary' : 'text-slate-300'}`}
                                        >
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Month Wheel */}
                                <div className="flex-[2] overflow-y-scroll snap-y snap-mandatory no-scrollbar text-center py-20">
                                    {months.map((m, i) => (
                                        <div
                                            key={m}
                                            onClick={() => setTempDate(prev => ({ ...prev, month: i + 1 }))}
                                            className={`h-10 snap-center flex items-center justify-center text-sm font-black transition-colors ${tempDate.month === i + 1 ? 'text-primary' : 'text-slate-300'}`}
                                        >
                                            {m}
                                        </div>
                                    ))}
                                </div>

                                {/* Year Wheel */}
                                <div className="flex-1 overflow-y-scroll snap-y snap-mandatory no-scrollbar text-center py-20">
                                    {years.map(y => (
                                        <div
                                            key={y}
                                            onClick={() => setTempDate(prev => ({ ...prev, year: y }))}
                                            className={`h-10 snap-center flex items-center justify-center text-sm font-black transition-colors ${tempDate.year === y ? 'text-primary' : 'text-slate-300'}`}
                                        >
                                            {y}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <AppButton
                                fullWidth
                                size="lg"
                                className="mt-8 !rounded-2xl shadow-xl shadow-primary/20"
                                onClick={handleConfirm}
                                icon={Check}
                            >
                                Confirmar Fecha
                            </AppButton>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DatePicker;
