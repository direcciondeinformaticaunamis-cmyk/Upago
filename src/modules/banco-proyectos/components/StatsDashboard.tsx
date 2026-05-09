import React, { useState, useEffect } from 'react';
import {
    PieChart,
    TrendingUp,
    Users,
    BookOpen,
    MapPin,
    Clock,
    Activity,
    Plus,
    FileSearch,
    BrainCircuit,
    Award
} from 'lucide-react';
import { motion } from 'framer-motion';
import ImpactMap from './ImpactMap';

const StatsDashboard = () => {
    const [stats, setStats] = useState<any>(null);

    useEffect(() => {
        fetch('api-banco.php?action=stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(err => console.error(err));
    }, []);

    const cards = [
        { label: 'Total Investigaciones', value: '42', icon: Activity, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        { label: 'Proyectos de Extensión', value: '18', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Tesis Registradas', value: '125', icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' },
        { label: 'Integrantes Activos', value: '312', icon: Users, color: 'text-primary', bg: 'bg-primary-soft' },
    ];

    return (
        <div className="p-8 space-y-8">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {cards.map((card, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className={`${card.bg} p-6 rounded-[2.5rem] border border-white/50 shadow-sm`}
                    >
                        <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center ${card.color} shadow-sm mb-4`}>
                            <card.icon size={24} />
                        </div>
                        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{card.label}</h4>
                        <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Impact Map Visualization Area */}
                <div className="lg:col-span-2">
                    <ImpactMap />
                </div>

                {/* Main Stats Summary */}
                <div className="bg-slate-50 rounded-[3rem] p-10 border border-slate-100 flex flex-col justify-center items-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8">
                        <Activity className="text-primary/10" size={120} />
                    </div>

                    <div className="text-center relative">
                        <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <BrainCircuit className="text-primary" size={40} />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 leading-tight">Producción Regional</h3>
                        <p className="text-sm font-medium text-slate-500 mt-2 max-w-xs">Consolidado 2026 de todas las sedes UNAMIS.</p>

                        <div className="mt-8 flex flex-col gap-2">
                            <div className="px-6 py-2 bg-white rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200">+24% INTERANUAL</div>
                            <div className="px-6 py-2 bg-white rounded-xl text-[10px] font-bold text-slate-400 uppercase tracking-widest border border-slate-200">14 SEDES ACTIVAS</div>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white border border-slate-100 rounded-[3rem] p-8 shadow-sm">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Actividad Reciente</h3>
                        <Activity size={16} className="text-primary" />
                    </div>

                    <div className="space-y-6">
                        {(stats?.recent || [
                            { titulo: 'Sistema de Riego Solar', tipo_proyecto: 'extension', fecha_registro: 'Hace 2 horas' },
                            { titulo: 'Análisis Literario Regional', tipo_proyecto: 'tesis', fecha_registro: 'Hace 5 horas' },
                            { titulo: 'Impacto de Microclimas', tipo_proyecto: 'investigacion', fecha_registro: 'Ayer' },
                        ]).map((act: any, i: number) => (
                            <div key={i} className="flex gap-4 group cursor-pointer">
                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-primary group-hover:text-white transition-all shrink-0">
                                    <Clock size={18} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-bold text-slate-800 truncate group-hover:text-primary transition-colors">{act.titulo}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{act.tipo_proyecto}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{act.fecha_registro}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <button className="w-full mt-10 py-4 bg-slate-50 rounded-2xl text-[10px] font-black text-slate-400 uppercase tracking-widest hover:bg-primary hover:text-white transition-all">
                        Ver todo el historial
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StatsDashboard;
