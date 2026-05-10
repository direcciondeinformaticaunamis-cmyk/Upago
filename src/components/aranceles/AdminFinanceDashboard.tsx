import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, Wallet, Banknote, Clock, ArrowUpRight, 
    Download, Printer, Filter, Search, User, 
    MoreHorizontal, CheckCircle2, AlertTriangle, 
    ArrowRight, BarChart3, Database, FileSpreadsheet,
    Plus, Bell, Settings, LayoutDashboard, FileText, Users, RefreshCw,
    DollarSign as DollarSignIcon
} from 'lucide-react';

interface FinanceStat {
    label: string;
    value: string;
    subtext: string;
    isUp: boolean;
    icon: any;
    color: string;
    category: string;
}

const RecentActivity = [
    { id: '1', name: 'Miguel Angel Ortiz', cedula: '2024-00129', concepto: 'INSCRIPCIÓN A CONCURSO ENCARGADO DE CÁTEDRA', monto: 300000, fecha: '10:45', estado: 'verificado' },
    { id: '2', name: 'Elena Rodriguez', cedula: '2024-00456', concepto: 'EXAMEN DE ADMISIÓN - CARRERA DE MEDICINA', monto: 1000000, fecha: '10:12', estado: 'pendiente' },
    { id: '3', name: 'Juan Carlos Perez', cedula: '2024-00982', concepto: 'CONVALIDACIONES DE ASIGNATURA', monto: 150000, fecha: '09:55', estado: 'verificado' },
    { id: '4', name: 'Lucía Méndez', cedula: '2024-00331', concepto: 'CERTIFICADO DE ESTUDIOS', monto: 53000, fecha: '09:30', estado: 'rechazado' },
];

const AdminFinanceDashboard: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statsData, setStatsData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const res = await fetch('api.php?stats_finance');
                const data = await res.json();
                setStatsData(data);
            } catch (e) {
                console.error("Error fetching stats:", e);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const formatGs = (n: number) => new Intl.NumberFormat('es-PY').format(n);

    const stats = [
        { 
            label: 'Recaudación Hoy', 
            value: statsData ? `Gs. ${formatGs(statsData.recaudacion_hoy)}` : 'Gs. 0', 
            subtext: '+12.5% vs ayer', 
            isUp: true, 
            icon: DollarSignIcon, 
            color: 'text-emerald-500', 
            category: 'HOY' 
        },
        { 
            label: 'Pendientes Conciliar', 
            value: statsData ? statsData.pendientes_conciliar.toString() : '0', 
            subtext: 'Promedio: 4.2 horas', 
            isUp: false, 
            icon: RefreshCw, 
            color: 'text-amber-500', 
            category: 'PENDIENTES' 
        },
        { 
            label: 'Estudiantes Hoy', 
            value: statsData ? statsData.registrados_hoy.toString() : '0', 
            subtext: 'Matrícula activa: 12.4k', 
            isUp: true, 
            icon: Users, 
            color: 'text-blue-500', 
            category: 'ESTUDIANTES' 
        },
    ];

    const DollarSign = Wallet; // Fallback for the icon variable if not imported exactly

    return (
        <div className="w-full space-y-10">
            {/* Top Bar with Search and Notifications */}
            <header className="flex items-center justify-between gap-6 mb-12">
                <div className="flex items-center gap-6">
                    <nav className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        <span className="text-slate-900 border-b-2 border-primary pb-1">UNAMIS</span>
                        <span className="hover:text-primary transition-colors cursor-pointer">Sede Central</span>
                    </nav>
                </div>
                
                <div className="flex-1 max-w-xl relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar transacción..."
                        className="w-full pl-12 pr-6 py-3 bg-slate-100 border-none rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex items-center gap-4">
                    <button className="p-3 bg-white text-slate-400 hover:text-primary transition-colors">
                        <Bell size={20} />
                    </button>
                    <button className="p-3 bg-white text-slate-400 hover:text-primary transition-colors">
                        <Settings size={20} />
                    </button>
                    <div className="w-10 h-10 rounded-full bg-slate-200 overflow-hidden border-2 border-white shadow-sm">
                        <img src={`https://ui-avatars.com/api/?name=Admin+Unamis&background=800020&color=fff`} alt="User" />
                    </div>
                </div>
            </header>

            {/* Dashboard Title & New Record Button */}
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-6xl font-black text-slate-900 tracking-tighter mb-2">Dashboard</h1>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Resumen administrativo de la Sede Central</p>
                </div>
                <button className="flex items-center gap-3 px-8 py-4 bg-[#002147] text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-[#002147]/20">
                    <Plus size={18} /> Nuevo Registro
                </button>
            </div>

            {/* Main Stats Grid */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {stats.map((stat, i) => (
                    <motion.div 
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-premium relative overflow-hidden group"
                    >
                        <div className="flex justify-between items-start mb-8">
                            <div className="p-4 bg-slate-50 rounded-2xl text-primary group-hover:bg-primary group-hover:text-white transition-all duration-500">
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{stat.category}</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">{stat.value}</h3>
                        <p className={`text-[10px] font-bold ${stat.isUp ? 'text-emerald-500' : 'text-amber-500'} uppercase tracking-widest`}>
                            {stat.subtext}
                        </p>
                    </motion.div>
                ))}
            </section>

            {/* Middle Section: Trends & Goals */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
                <div className="lg:col-span-8 bg-white p-12 rounded-[3rem] border border-slate-100 shadow-premium">
                    <div className="flex justify-between items-center mb-12">
                        <div>
                            <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-1">Tendencia de Recaudación</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Comparativa últimos 6 meses</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="px-4 py-2 bg-slate-100 text-[9px] font-black uppercase rounded-lg text-slate-400">Mensual</button>
                            <button className="px-4 py-2 bg-[#002147] text-[9px] font-black uppercase rounded-lg text-white">Anual</button>
                        </div>
                    </div>
                    
                    {/* Bar Chart Mockup */}
                    <div className="flex items-end justify-between h-64 gap-4 px-4">
                        {[40, 65, 30, 85, 45, 90].map((h, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                                <motion.div 
                                    initial={{ height: 0 }}
                                    animate={{ height: `${h}%` }}
                                    className={`w-full max-w-[40px] rounded-t-xl transition-all duration-500 ${i === 5 ? 'bg-primary' : 'bg-slate-100 group-hover:bg-slate-200'}`}
                                />
                                <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'][i]}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4 bg-[#002147] p-12 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col justify-between">
                    <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/5 rounded-full blur-3xl" />
                    
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40 mb-4">META MENSUAL</p>
                        <h4 className="text-4xl font-black tracking-tighter mb-2 italic">Gs. 450.000.000</h4>
                        <p className="text-xs font-bold opacity-60">Objetivo de recaudación para Sede Central.</p>
                    </div>

                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest">Progreso</span>
                            <span className="text-2xl font-black tracking-tighter">74%</span>
                        </div>
                        <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                            <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: '74%' }}
                                className="h-full bg-white" 
                            />
                        </div>
                    </div>

                    <button className="w-full py-4 bg-white text-[#002147] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-100 transition-all">
                        Ver Detalles del POA
                    </button>
                </div>
            </div>

            {/* Bottom Section: Activity Table */}
            <section className="bg-white rounded-[3rem] border border-slate-100 shadow-premium overflow-hidden">
                <div className="p-10 border-b border-slate-50 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-black text-slate-900 tracking-tighter uppercase mb-1">Actividad Reciente</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Últimas transacciones procesadas</p>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary transition-colors">
                        <FileSpreadsheet size={16} /> Exportar Reporte
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50/50">
                            <tr className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em]">
                                <th className="px-10 py-6">Estudiante</th>
                                <th className="px-6 py-6">Concepto</th>
                                <th className="px-6 py-6">Monto</th>
                                <th className="px-6 py-6">Estado</th>
                                <th className="pl-6 pr-10 py-6 text-right">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {RecentActivity.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                    <td className="px-10 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                {item.name[0]}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 tracking-tight uppercase">{item.name}</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item.cedula}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">{item.concepto}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <p className="text-sm font-black text-slate-900">Gs. {formatGs(item.monto)}</p>
                                    </td>
                                    <td className="px-6 py-6">
                                        <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest ${
                                            item.estado === 'verificado' ? 'bg-emerald-50 text-emerald-600' : 
                                            item.estado === 'pendiente' ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600'
                                        }`}>
                                            {item.estado}
                                        </span>
                                    </td>
                                    <td className="pl-6 pr-10 py-6 text-right">
                                        <button className="p-3 bg-white border border-slate-100 rounded-xl text-slate-300 hover:text-primary hover:border-primary/20 transition-all">
                                            <ArrowRight size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-10 border-t border-slate-50 flex justify-center">
                    <button className="text-[10px] font-black text-primary uppercase tracking-[0.3em] hover:underline">
                        Ver todas las transacciones
                    </button>
                </div>
            </section>
        </div>
    );
};

export default AdminFinanceDashboard;
