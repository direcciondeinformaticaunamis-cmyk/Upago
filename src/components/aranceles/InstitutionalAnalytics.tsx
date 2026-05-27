
import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, GraduationCap, DollarSign, Award, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';

const InstitutionalAnalytics: React.FC = () => {
    // Datos simulados para los gráficos
    const carreraInscritos = [
        { name: 'Medicina', value: 450, color: '#002f6c' },
        { name: 'Enfermería', value: 280, color: '#002f6c' },
        { name: 'Contabilidad', value: 150, color: '#a37c58' },
        { name: 'Derecho', value: 120, color: '#475569' },
    ];

    const ingresosMensuales = [
        { month: 'Ene', value: 120 }, { month: 'Feb', value: 145 },
        { month: 'Mar', value: 280 }, { month: 'Abr', value: 190 },
        { month: 'May', value: 310 }, { month: 'Jun', value: 250 }
    ];

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 pt-4">
            {/* Header */}
            <div className="mb-10">
                <h1 className="text-3xl font-black text-[#001738] tracking-tight mb-2">Análisis Estratégico Institucional</h1>
                <p className="text-slate-500 font-medium">Visualización de KPIs de rendimiento académico y financiero para la toma de decisiones.</p>
            </div>

            {/* Quick Stats Bento */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-red-50 rounded-2xl text-[#002f6c]">
                            <Users size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-emerald-600 font-black text-[10px]">
                            <ArrowUpRight size={14} /> +12%
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Postulantes</p>
                    <h3 className="text-3xl font-black text-[#001738]">1,248</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-blue-50 rounded-2xl text-[#002f6c]">
                            <DollarSign size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-emerald-600 font-black text-[10px]">
                            <ArrowUpRight size={14} /> +18%
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Ingresos Globales</p>
                    <h3 className="text-3xl font-black text-[#001738]">$2.4M</h3>
                </div>

                <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-amber-50 rounded-2xl text-amber-600">
                            <Activity size={24} />
                        </div>
                        <span className="flex items-center gap-1 text-red-600 font-black text-[10px]">
                            <ArrowDownRight size={14} /> -3%
                        </span>
                    </div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Tiempo de Aprobación</p>
                    <h3 className="text-3xl font-black text-[#001738]">4.2h</h3>
                </div>

                <div className="bg-[#001738] p-6 rounded-[2rem] shadow-xl shadow-blue-900/10 text-white">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-3 bg-white/10 rounded-2xl text-white">
                            <Award size={24} />
                        </div>
                    </div>
                    <p className="text-[10px] font-black text-white/40 uppercase tracking-widest mb-1">Eficiencia de Recaudo</p>
                    <h3 className="text-3xl font-black text-white">94.8%</h3>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* Chart 1: Carreras */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <h3 className="text-lg font-black text-[#001738] mb-8">Distribución por Carrera</h3>
                    <div className="flex items-center gap-12">
                        {/* Custom Circular Chart (Simplified SVG) */}
                        <div className="relative w-48 h-48">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#f1f5f9" strokeWidth="4"></circle>
                                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#002f6c" strokeWidth="4" strokeDasharray="40 100"></circle>
                                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#002f6c" strokeWidth="4" strokeDasharray="25 100" strokeDashoffset="-40"></circle>
                                <circle cx="18" cy="18" r="16" fill="transparent" stroke="#a37c58" strokeWidth="4" strokeDasharray="15 100" strokeDashoffset="-65"></circle>
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-2xl font-black text-[#001738]">1,248</span>
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Postulantes</span>
                            </div>
                        </div>
                        <div className="flex-1 space-y-4">
                            {carreraInscritos.map((c) => (
                                <div key={c.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: c.color }}></div>
                                        <span className="text-xs font-bold text-slate-600">{c.name}</span>
                                    </div>
                                    <span className="text-xs font-black text-[#001738]">{c.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chart 2: Ingresos Mensuales */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <h3 className="text-lg font-black text-[#001738]">Evolución de Ingresos</h3>
                        <select className="bg-slate-50 border-none rounded-lg text-[10px] font-black uppercase tracking-widest px-3 py-1.5 outline-none">
                            <option>Primer Semestre</option>
                        </select>
                    </div>
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                        {ingresosMensuales.map((m) => (
                            <div key={m.month} className="flex-1 flex flex-col items-center gap-3 group">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${(m.value / 310) * 100}%` }}
                                    className="w-full bg-[#001738]/5 group-hover:bg-[#002f6c] transition-colors rounded-t-xl relative"
                                >
                                    <div className="absolute -top-1 left-0 right-0 h-1 bg-[#002f6c] rounded-full scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                                </motion.div>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{m.month}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Efficiency Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black text-[#001738]">Eficiencia Operativa por Sede</h3>
                        <p className="text-xs text-slate-400 font-medium">Comparativa de tiempos de respuesta y volumen de trámites.</p>
                    </div>
                    <button className="px-5 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-200 transition-colors">
                        Descargar Reporte PDF
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Postulantes</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tiempo Prom.</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Efectividad</th>
                                <th className="px-8 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5 text-sm font-black text-[#001738]">Sede Central</td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-600">850</td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-600">3.5h</td>
                                <td className="px-8 py-5">
                                    <div className="w-32 bg-slate-100 h-1.5 rounded-full">
                                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: '92%' }}></div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-black rounded-full uppercase tracking-widest">Excelente</span>
                                </td>
                            </tr>
                            <tr className="hover:bg-slate-50 transition-colors">
                                <td className="px-8 py-5 text-sm font-black text-[#001738]">Sede San Ignacio</td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-600">240</td>
                                <td className="px-8 py-5 text-sm font-medium text-slate-600">5.2h</td>
                                <td className="px-8 py-5">
                                    <div className="w-32 bg-slate-100 h-1.5 rounded-full">
                                        <div className="bg-amber-500 h-full rounded-full" style={{ width: '78%' }}></div>
                                    </div>
                                </td>
                                <td className="px-8 py-5">
                                    <span className="px-3 py-1 bg-amber-100 text-amber-700 text-[10px] font-black rounded-full uppercase tracking-widest">Estable</span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InstitutionalAnalytics;
