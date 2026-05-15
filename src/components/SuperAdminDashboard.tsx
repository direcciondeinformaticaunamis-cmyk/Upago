import React, { useState, useEffect } from 'react';
import { 
    LayoutDashboard, 
    Users, 
    Settings, 
    ShieldCheck, 
    Database, 
    ArrowLeft,
    LogOut,
    Bell,
    Mail,
    FileText,
    Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SystemSettings from './SystemSettings';
import ExternalUserManager from './ExternalUserManager';
import AdminDashboard from './AdminDashboard';
import AdminFinanceDashboard from './AdminFinanceDashboard';

interface SuperAdminDashboardProps {
    user: any;
    onLogout: () => void;
}

const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user, onLogout }) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'finance' | 'external' | 'config' | 'logs'>('overview');

    const menuItems = [
        { id: 'overview', label: 'Vista General', icon: LayoutDashboard },
        { id: 'finance', label: 'Gestión Financiera', icon: Database },
        { id: 'external', label: 'Cuentas Externas', icon: Users },
        { id: 'config', label: 'Configuración Sistema', icon: Settings },
        { id: 'logs', label: 'Auditoría', icon: Activity },
    ];

    const [logs, setLogs] = useState<any[]>([]);
    const [isLoadingLogs, setIsLoadingLogs] = useState(false);

    useEffect(() => {
        if (activeTab === 'logs' || activeTab === 'overview') {
            fetchLogs();
        }
    }, [activeTab]);

    const fetchLogs = async () => {
        setIsLoadingLogs(true);
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            const response = await fetch(`${baseUrl}/api.php?system_logs=true`);
            const result = await response.json();
            if (result.status === 'success') {
                setLogs(result.data || []);
            }
        } catch (error) {
            console.error('Error fetching logs', error);
        } finally {
            setIsLoadingLogs(false);
        }
    };

    return (
        <div className="flex h-screen bg-[#f8fafc] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-72 bg-slate-900 text-white flex flex-col p-6 shadow-2xl z-50">
                <div className="mb-10 px-2">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-[#a31e32] rounded-xl flex items-center justify-center shadow-lg shadow-[#a31e32]/20">
                            <ShieldCheck size={24} />
                        </div>
                        <h2 className="text-xl font-black tracking-tighter">SUPER ADMIN</h2>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{user.email}</p>
                </div>

                <nav className="flex-1 space-y-2">
                    {menuItems.map((item) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id as any)}
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${
                                activeTab === item.id 
                                    ? 'bg-[#a31e32] text-white shadow-lg shadow-[#a31e32]/20 font-bold' 
                                    : 'text-slate-400 hover:bg-white/5 hover:text-white font-medium'
                            }`}
                        >
                            <item.icon size={20} />
                            <span className="text-xs uppercase tracking-widest">{item.label}</span>
                        </button>
                    ))}
                </nav>

                <div className="mt-auto pt-6 border-t border-white/10">
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center gap-4 px-5 py-4 text-red-400 hover:bg-red-500/10 rounded-xl transition-all font-bold group"
                    >
                        <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        <span className="text-xs uppercase tracking-widest">Finalizar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
                {/* Top Bar */}
                <header className="h-20 bg-white border-b border-slate-100 flex items-center justify-between px-10 shrink-0 z-40">
                    <div className="flex items-center gap-4">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest">Panel de Control Maestro</h3>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <p className="text-sm font-bold text-slate-600">{menuItems.find(i => i.id === activeTab)?.label}</p>
                    </div>
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-full border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Servidor Online</span>
                        </div>
                        <button className="relative text-slate-400 hover:text-[#a31e32] transition-colors">
                            <Bell size={20} />
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#a31e32] rounded-full"></span>
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto bg-[#f8fafc]">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeTab}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="p-10"
                        >
                            {activeTab === 'overview' && (
                                <div className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 group hover:shadow-xl transition-all">
                                            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6">
                                                <Users size={28} />
                                            </div>
                                            <h4 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">1,248</h4>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Usuarios Totales</p>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                                                <Activity size={28} />
                                            </div>
                                            <h4 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">98.2%</h4>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Salud del Sistema</p>
                                        </div>
                                        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
                                            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mb-6">
                                                <Mail size={28} />
                                            </div>
                                            <h4 className="text-4xl font-black text-slate-800 tracking-tighter mb-2">45</h4>
                                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Notificaciones</p>
                                        </div>
                                    </div>
                                    
                                    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-slate-100">
                                        <div className="flex items-center justify-between mb-8">
                                            <h3 className="text-xl font-black text-slate-800 uppercase tracking-tighter">Actividad Global Reciente</h3>
                                            <button className="text-xs font-black text-[#a31e32] uppercase tracking-widest hover:underline">Ver logs completos</button>
                                        </div>
                                        <div className="space-y-4">
                                            {logs.length > 0 ? logs.slice(0, 5).map((log, i) => (
                                                <div key={i} className="flex items-center gap-6 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                                    <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                                                        <FileText size={18} />
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-slate-700">{log.action}</p>
                                                        <p className="text-xs text-slate-400">{log.details}</p>
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-300">{log.timestamp.split(' ')[1]}</span>
                                                </div>
                                            )) : (
                                                <p className="text-sm text-slate-400 text-center py-4">No hay actividad reciente.</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'finance' && (
                                <div className="-m-10">
                                    <AdminFinanceDashboard user={user} onLogout={onLogout} />
                                </div>
                            )}

                            {activeTab === 'external' && (
                                <ExternalUserManager onBack={() => setActiveTab('overview')} />
                            )}

                            {activeTab === 'config' && (
                                <SystemSettings />
                            )}

                            {activeTab === 'logs' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <div>
                                            <h1 className="text-3xl font-black text-slate-800 tracking-tight">Registro de Auditoría</h1>
                                            <p className="text-slate-500 font-medium text-sm">Trazabilidad completa de las acciones del sistema.</p>
                                        </div>
                                        <button onClick={fetchLogs} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-[#a31e32]">
                                            <Activity size={20} />
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100">
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Fecha / Hora</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Acción</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Detalles</th>
                                                        <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Dirección IP</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-50">
                                                    {isLoadingLogs ? (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-10 text-center text-slate-400 italic">Cargando registros...</td>
                                                        </tr>
                                                    ) : logs.length > 0 ? (
                                                        logs.map((log, index) => (
                                                            <tr key={index} className="hover:bg-slate-50 transition-colors group">
                                                                <td className="px-8 py-4 whitespace-nowrap">
                                                                    <p className="text-sm font-bold text-slate-700">{log.timestamp.split(' ')[0]}</p>
                                                                    <p className="text-[10px] text-slate-400 font-mono">{log.timestamp.split(' ')[1]}</p>
                                                                </td>
                                                                <td className="px-8 py-4">
                                                                    <span className="text-xs font-bold text-[#a31e32] bg-[#a31e32]/10 px-3 py-1 rounded-full">
                                                                        {log.user}
                                                                    </span>
                                                                </td>
                                                                <td className="px-8 py-4 text-sm font-black text-slate-800 uppercase tracking-tight">{log.action}</td>
                                                                <td className="px-8 py-4 text-xs font-medium text-slate-600 max-w-xs truncate" title={log.details}>
                                                                    {log.details}
                                                                </td>
                                                                <td className="px-8 py-4 text-right">
                                                                    <span className="text-[10px] font-mono text-slate-400 bg-slate-100 px-2 py-1 rounded">{log.ip}</span>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={5} className="px-8 py-10 text-center text-slate-400 italic">No hay registros de actividad.</td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            )}

                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
};

export default SuperAdminDashboard;
