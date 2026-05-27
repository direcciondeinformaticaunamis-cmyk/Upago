import React, { useState, useEffect } from 'react';
import User from '@mui/icons-material/Person';
import Dashboard from '@mui/icons-material/Dashboard';
import Payments from '@mui/icons-material/Payments';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Assessment from '@mui/icons-material/Assessment';
import Help from '@mui/icons-material/Help';
import Logout from '@mui/icons-material/Logout';
import Search from '@mui/icons-material/Search';
import Notifications from '@mui/icons-material/Notifications';
import Settings from '@mui/icons-material/Settings';
import Add from '@mui/icons-material/Add';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Schedule from '@mui/icons-material/Schedule';
import Group from '@mui/icons-material/Group';
import PersonAdd from '@mui/icons-material/PersonAdd';
import FileDownload from '@mui/icons-material/FileDownload';
import Print from '@mui/icons-material/Print';
import History from '@mui/icons-material/History';
import Mail from '@mui/icons-material/Mail';
import MoreVert from '@mui/icons-material/MoreVert';
import Visibility from '@mui/icons-material/Visibility';
import LogoutIcon from '@mui/icons-material/Logout';
import Receipt from '@mui/icons-material/Receipt';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Storage from '@mui/icons-material/Storage';

import BankReconciliation from './aranceles/BankReconciliation';
import FinancialReports from './aranceles/FinancialReports';
import OfficialReceipt from './aranceles/OfficialReceipt';
import PaymentRegistrationForm from './aranceles/PaymentRegistrationForm';
import NotificationCenter from './NotificationCenter';
import { FinanceService, Payment, FinanceStats } from '../services/FinanceService';
import InstitutionalAnalytics from './aranceles/InstitutionalAnalytics';
import SystemSettings from './SystemSettings';
import ExternalUserManager from './ExternalUserManager';
import { CashClosures } from './aranceles/CashClosures';
import DocumentPreviewModal from './DocumentPreviewModal';

interface AdminDashboardProps {
    user: { nombre: string; apellido: string; email: string; rol: string };
    onLogout: () => void;
}

const AdminFinanceDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState<'dashboard' | 'pagos' | 'conciliacion' | 'reportes' | 'facturas' | 'metricas' | 'postulantes' | 'external' | 'config' | 'cierres'>('dashboard');
    const [payments, setPayments] = useState<Payment[]>([]);
    const [postulantes, setPostulantes] = useState<any[]>([]);
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [pagosData, statsData, postulantesData] = await Promise.all([
                FinanceService.getPagos(),
                FinanceService.getFinanceStats(),
                FinanceService.getPostulantes()
            ]);
            
            setPayments(pagosData || []);
            setPostulantes(postulantesData || []);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading admin finance data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(amount);
    };

    const handleExportExcel = () => {
        if (!payments || payments.length === 0) {
            alert("No hay registros de pagos para exportar.");
            return;
        }

        const headers = ["ID", "Fecha de Registro", "Nombre", "Apellido", "Cédula/ID", "Concepto", "Monto", "Estado"];
        const rows = payments.map(p => [
            p.id,
            p.fecha_pago || (p.fecha_registro ? new Date(p.fecha_registro).toLocaleDateString() : 'N/A'),
            p.nombre || '',
            p.apellido || '',
            p.postulante_cedula || '',
            p.concepto || '',
            p.monto || 0,
            p.estado || ''
        ]);

        const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
            + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
        
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Reporte_Pagos_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
            {/* SideNavBar */}
            <aside className="hidden md:flex flex-col h-screen p-6 gap-2 bg-[#f8fafc] w-72 border-r border-slate-200">
                <div className="mb-10">
                    <h2 className="text-xl font-black text-[#001738] tracking-tighter leading-tight">UPAGO Finanzas</h2>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-black mt-1">Administración Central</p>
                </div>
                <nav className="flex-1 space-y-3">
                    {[
                        { id: 'dashboard', label: 'Dashboard', icon: Dashboard },
                        { id: 'postulantes', label: 'Gestión Usuarios', icon: Group },
                        { id: 'pagos', label: 'Registro de Pago', icon: Payments },
                        { id: 'conciliacion', label: 'Conciliación', icon: AccountBalanceWallet },
                        { id: 'cierres', label: 'Cierres de Caja', icon: FileDownload },
                        { id: 'reportes', label: 'Reportes', icon: Assessment },
                        { id: 'metricas', label: 'Métricas', icon: TrendingUp },
                        { id: 'facturas', label: 'Facturas', icon: Receipt },
                        ...(user.rol === 'superadmin' ? [{ id: 'config', label: 'Configuración', icon: Settings }] : []),
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveSection(item.id as any)} 
                            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-xl transition-all duration-300 ${activeSection === item.id ? 'bg-white text-[#002f6c] shadow-[0_4px_20px_rgba(0,0,0,0.05)] font-black' : 'text-slate-500 hover:bg-slate-100 font-bold'}`}
                        >
                            <item.icon style={{fontSize: 22}} />
                            <span className="text-[11px] uppercase tracking-[0.1em]">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-slate-100 space-y-2">
                    <button onClick={onLogout} className="w-full flex items-center gap-4 px-5 py-3 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-xl transition-all font-bold">
                        <LogoutIcon style={{fontSize: 20}} />
                        <span className="text-[11px] uppercase tracking-wider">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
                {/* TopAppBar */}
                <header className="flex justify-between items-center w-full px-12 py-5 bg-white border-b border-slate-100">
                    <div className="flex items-center gap-8">
                        <span className="text-xl font-black text-[#001738] tracking-tighter">UNAMIS</span>
                        <span className="w-px h-6 bg-slate-200 hidden lg:block"></span>
                        <nav className="hidden lg:flex gap-6">
                            <span className="text-sm font-bold text-[#002f6c] border-b-2 border-[#002f6c] pb-1">Sede Central</span>
                        </nav>
                    </div>
                        <div className="flex items-center gap-4">
                            <NotificationCenter />
                            <button className="p-2 text-[#43474f] hover:bg-[#f2f4f6] rounded-full transition-colors">
                                <Settings style={{fontSize: 20}} />
                            </button>
                            <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-[#d5e3ff]">
                                <div className="w-full h-full bg-[#002f6c] flex items-center justify-center">
                                    <User className="text-white" style={{fontSize: 16}} />
                                </div>
                            </div>
                        </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f7f9fb]">
                    {activeSection === 'dashboard' ? (
                        <>
                            {/* Welcome Section */}
                            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                                <div>
                                    <h1 className="text-[3.5rem] font-extrabold text-[#a31e32] leading-tight tracking-tight">Dashboard</h1>
                                    <p className="text-[#43474f] font-medium">Resumen administrativo de la Sede Central</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => setActiveSection('pagos')} className="px-6 py-2.5 bg-gradient-to-r from-[#a31e32] to-[#7a1424] text-white rounded-lg font-semibold text-sm shadow-md flex items-center gap-2">
                                        <Add style={{fontSize: 18}} />
                                        Nuevo Registro
                                    </button>
                                </div>
                            </div>

                            {/* Bento Grid Summary Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm group hover:bg-[#a31e32] transition-all duration-300">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-[#d5e3ff] rounded-lg text-[#a31e32] group-hover:bg-white group-hover:text-[#a31e32] transition-colors">
                                            <Payments style={{fontSize: 20}} />
                                        </div>
                                        <span className="text-xs font-bold text-[#43474f] uppercase tracking-widest group-hover:text-white/70">Hoy</span>
                                    </div>
                                    <h3 className="text-[#43474f] text-sm font-semibold mb-1 group-hover:text-white/80 transition-colors">Recaudación del Día</h3>
                                    <p className="text-2xl font-extrabold text-[#a31e32] group-hover:text-white transition-colors">{stats ? formatCurrency(stats.recaudacion_hoy) : '0'}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#381300] group-hover:text-white/90">
                                        <TrendingUp style={{fontSize: 14}} />
                                        <span>Actualizado</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-[#ffdbca] rounded-lg text-[#381300]">
                                            <AccountBalanceWallet style={{fontSize: 20}} />
                                        </div>
                                        <span className="text-xs font-bold text-[#43474f] uppercase tracking-widest">Pendientes</span>
                                    </div>
                                    <h3 className="text-[#43474f] text-sm font-semibold mb-1">Pagos por Conciliar</h3>
                                    <p className="text-3xl font-extrabold text-[#a31e32]">{stats?.pendientes_conciliar || 0}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#43474f]">
                                        <Schedule style={{fontSize: 14}} />
                                        <span>Cola de espera</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-[#a31e32]">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-[#d5e3fc] rounded-lg text-[#515f74]">
                                            <Group style={{fontSize: 20}} />
                                        </div>
                                        <span className="text-xs font-bold text-[#43474f] uppercase tracking-widest">Postulantes</span>
                                    </div>
                                    <h3 className="text-[#43474f] text-sm font-semibold mb-1">Registrados hoy</h3>
                                    <p className="text-3xl font-extrabold text-[#a31e32]">{stats?.registrados_hoy || 0}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#43474f]">
                                        <PersonAdd style={{fontSize: 14}} />
                                        <span>Nuevos ingresos</span>
                                    </div>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-emerald-600">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-700">
                                            <CheckCircle style={{fontSize: 20}} />
                                        </div>
                                        <span className="text-xs font-bold text-[#43474f] uppercase tracking-widest">Aprobaciones</span>
                                    </div>
                                    <h3 className="text-[#43474f] text-sm font-semibold mb-1">Pagos Verificados</h3>
                                    <p className="text-3xl font-extrabold text-emerald-700">{payments?.filter(p => p.estado === 'verificado').length || 0}</p>
                                    <div className="mt-4 flex items-center gap-2 text-xs font-bold text-[#43474f]">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                        <span>Sincronizado</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
                                <div className="lg:col-span-3 bg-white rounded-xl p-8 shadow-sm">
                                    <div className="flex justify-between items-center mb-8">
                                        <h2 className="text-xl font-bold text-[#a31e32]">Tendencia Mensual de Pagos</h2>
                                        <div className="flex gap-2">
                                            <span className="px-3 py-1 bg-[#f2f4f6] text-[#43474f] text-[10px] font-bold rounded-md uppercase">{new Date().getFullYear()}</span>
                                            <MoreVert className="text-[#737780] cursor-pointer" />
                                        </div>
                                    </div>
                                    <div className="relative h-64 w-full flex items-end gap-2">
                                        {stats?.tendencia?.map((item, idx) => (
                                            <div key={idx} className="flex-1 bg-[#a31e32]/10 rounded-t-sm relative group" style={{ height: `${Math.min(100, (item.total / 10000000) * 100)}%` }}>
                                                <div className="absolute -top-1 bg-[#a31e32] w-full h-1 rounded-full"></div>
                                                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-[#001738] text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                                    {item.mes}: {formatCurrency(item.total)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="flex justify-between mt-4 text-[10px] font-bold text-[#c3c6d1] uppercase">
                                        {stats?.tendencia?.map(i => <span key={i.mes}>{i.mes}</span>)}
                                    </div>
                                </div>

                                <div className="lg:col-span-2 space-y-8">
                                    <div className="bg-[#a31e32] p-8 rounded-xl text-white relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h3 className="text-sm font-semibold opacity-80 mb-2 uppercase tracking-widest">Objetivo Mensual</h3>
                                            <p className="text-3xl font-black mb-4">450.000.000 PYG</p>
                                            <div className="w-full bg-white/20 h-2 rounded-full mb-2">
                                                <div className="bg-[#d5e3ff] h-full rounded-full" style={{ width: `${Math.min(100, (stats?.recaudacion_hoy || 0) / 4500000 * 100)}%` }}></div>
                                            </div>
                                            <p className="text-xs font-bold opacity-80">Progreso según recaudación actual</p>
                                        </div>
                                        <div className="absolute -right-4 -bottom-4 opacity-10">
                                            <AccountBalanceWallet style={{fontSize: 120}} />
                                        </div>
                                    </div>

                                    <div className="bg-white p-6 rounded-xl shadow-sm">
                                        <h2 className="text-sm font-bold text-[#a31e32] mb-4 uppercase tracking-widest">Accesos Rápidos</h2>
                                        <div className="grid grid-cols-2 gap-4">
                                            <button 
                                                onClick={handleExportExcel}
                                                className="flex flex-col items-center justify-center p-4 bg-[#f7f9fb] rounded-lg hover:bg-[#d5e3ff] transition-colors gap-2 group"
                                            >
                                                <FileDownload className="text-[#a31e32]" />
                                                <span className="text-[10px] font-bold uppercase text-[#43474f] group-hover:text-[#a31e32]">Exp. Excel</span>
                                            </button>
                                            <button onClick={() => setActiveSection('facturas')} className="flex flex-col items-center justify-center p-4 bg-[#f7f9fb] rounded-lg hover:bg-[#d5e3ff] transition-colors gap-2 group">
                                                <Print className="text-[#a31e32]" />
                                                <span className="text-[10px] font-bold uppercase text-[#43474f] group-hover:text-[#a31e32]">FACTURAS</span>
                                            </button>
                                            <button 
                                                onClick={() => setActiveSection('cierres')}
                                                className="flex flex-col items-center justify-center p-4 bg-[#f7f9fb] rounded-lg hover:bg-[#d5e3ff] transition-colors gap-2 group"
                                            >
                                                <History className="text-[#a31e32]" />
                                                <span className="text-[10px] font-bold uppercase text-[#43474f] group-hover:text-[#a31e32]">Bitácora</span>
                                            </button>
                                            <button 
                                                onClick={() => window.location.href = `${window.location.origin}/api.php?action=export_db`}
                                                className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors gap-2 group border border-slate-700"
                                            >
                                                <Storage className="text-emerald-400" />
                                                <span className="text-[10px] font-bold uppercase text-white group-hover:text-emerald-400">Respaldo SQL</span>
                                            </button>
                                            <button 
                                                onClick={() => alert("Bandeja de avisos: No hay alertas urgentes pendientes en este momento.")}
                                                className="flex flex-col items-center justify-center p-4 bg-[#f7f9fb] rounded-lg hover:bg-[#d5e3ff] transition-colors gap-2 group"
                                            >
                                                <Mail className="text-[#a31e32]" />
                                                <span className="text-[10px] font-bold uppercase text-[#43474f] group-hover:text-[#a31e32]">Avisos</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white rounded-xl overflow-hidden shadow-sm">
                                <div className="px-8 py-6 flex justify-between items-center border-b border-[#e6e8ea]">
                                    <h2 className="text-xl font-bold text-[#a31e32]">Actividades Recientes (Pagos)</h2>
                                    <button onClick={() => setActiveSection('reportes')} className="text-[#a31e32] font-bold text-xs uppercase hover:underline">Ver Todo</button>
                                </div>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="bg-[#f2f4f6]">
                                                <th className="px-4 py-3 text-[9px] font-black text-[#43474f] uppercase tracking-widest">Expediente N°</th>
                                                <th className="px-4 py-3 text-[9px] font-black text-[#43474f] uppercase tracking-widest">Postulante</th>
                                                <th className="px-4 py-3 text-[9px] font-black text-[#43474f] uppercase tracking-widest">Concepto</th>
                                                <th className="px-4 py-3 text-[9px] font-black text-[#43474f] uppercase tracking-widest">Monto</th>
                                                <th className="px-4 py-3 text-[9px] font-black text-[#43474f] uppercase tracking-widest">Estado</th>
                                                <th className="px-4 py-3 text-right"></th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {payments?.map((p) => (
                                                <tr key={p.id} className="hover:bg-[#e6e8ea] transition-colors">
                                                    <td className="px-4 py-3 text-xs font-bold text-[#001738]">{p.numero_expediente || 'PENDIENTE'}</td>
                                                    <td className="px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded bg-[#a31e32] flex items-center justify-center text-white font-bold text-xs">
                                                                {p.nombre?.[0]}{p.apellido?.[0]}
                                                            </div>
                                                            <div>
                                                                <div className="text-sm font-bold text-[#a31e32]">
                                                                    {p.nombre} {p.apellido}
                                                                </div>
                                                                <div className="text-[10px] text-[#43474f]">ID: {p.postulante_cedula}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-4 py-3 text-xs font-medium">{p.concepto}</td>
                                                    <td className="px-4 py-3 text-xs font-bold">{formatCurrency(p.monto)}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`px-2 py-1 text-[9px] font-bold rounded uppercase ${
                                                            p.estado === 'verificado' ? 'bg-green-100 text-green-700' :
                                                            p.estado === 'pendiente' ? 'bg-[#ffdbca] text-[#381300]' : 'bg-[#ffdad6] text-[#93000a]'
                                                        }`}>
                                                            {p.estado}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-3 text-right">
                                                        <div className="flex justify-end gap-3 items-center">
                                                            {p.comprobante_url ? (
                                                                <span 
                                                                    className="cursor-pointer hover:scale-115 transition-transform flex items-center"
                                                                    title="Ver Comprobante Cargado"
                                                                    onClick={() => {
                                                                        setPreviewUrl(p.comprobante_url || null);
                                                                        setPreviewTitle(`Comprobante - ${p.nombre} ${p.apellido}`);
                                                                    }}
                                                                >
                                                                    <Visibility className="text-[#002f6c]" />
                                                                </span>
                                                            ) : (
                                                                <span title="Sin comprobante cargado" className="flex items-center">
                                                                    <Visibility className="text-slate-200 cursor-not-allowed" />
                                                                </span>
                                                            )}
                                                            <span 
                                                                className="cursor-pointer hover:scale-115 transition-transform flex items-center"
                                                                title="Ver Factura / Recibo Oficial"
                                                                onClick={() => {
                                                                    setSelectedPayment(p);
                                                                    setActiveSection('facturas');
                                                                }}
                                                            >
                                                                <Receipt className="text-[#a31e32]" />
                                                            </span>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                            {(payments?.length === 0 || !payments) && !isLoading && (
                                                <tr>
                                                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400 italic">No hay actividad reciente.</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </>
                    ) : activeSection === 'conciliacion' ? (
                        <div className="-m-8">
                            <BankReconciliation />
                        </div>
                    ) : activeSection === 'pagos' ? (
                        <div className="-m-8 bg-slate-50/50 min-h-screen">
                            <PaymentRegistrationForm mode="admin" onSuccess={() => setActiveSection('dashboard')} onBack={() => setActiveSection('dashboard')} />
                        </div>
                    ) : activeSection === 'facturas' ? (
                        <div className="-m-8 bg-slate-50/50 min-h-screen p-8">
                            <OfficialReceipt 
                                receiptNumber={selectedPayment ? `000${selectedPayment.id}` : '0000000'}
                                fecha={selectedPayment ? new Date(selectedPayment.fecha_registro).toLocaleDateString() : ''}
                                pagador={selectedPayment ? `${selectedPayment.nombre} ${selectedPayment.apellido}` : 'Estudiante'}
                                cedula={selectedPayment?.postulante_cedula}
                                items={selectedPayment ? [
                                    { codigo: '1.01', concepto: selectedPayment.concepto, cantidad: 1, unitario: selectedPayment.monto, total: selectedPayment.monto }
                                ] : []}
                                onClose={() => setActiveSection('dashboard')}
                            />
                        </div>
                    ) : activeSection === 'metricas' ? (
                        <div className="-m-8">
                            <InstitutionalAnalytics />
                        </div>
                    ) : activeSection === 'postulantes' ? (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center mb-8">
                                <div>
                                    <h1 className="text-3xl font-black text-[#a31e32] tracking-tight">Gestión de Usuarios</h1>
                                    <p className="text-slate-500 font-medium text-sm">Listado total de postulantes y concursantes docentes registrados.</p>
                                </div>
                                <div className="flex gap-3">
                                    {user.rol === 'superadmin' && (
                                        <button 
                                            onClick={() => setActiveSection('external')}
                                            className="px-6 py-2 bg-[#a31e32] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-[#7a1424] transition-all shadow-md flex items-center gap-2"
                                        >
                                            <PersonAdd style={{fontSize: 18}} /> Cuentas Externas
                                        </button>
                                    )}
                                    <button onClick={loadData} className="p-3 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all text-[#a31e32]">
                                        <History />
                                    </button>
                                </div>
                            </div>

                            <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50">
                                            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Expediente N°</th>
                                            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Nombre y Apellido</th>
                                            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">CI / Cédula</th>
                                            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Carrera / Área</th>
                                            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Perfil</th>
                                            <th className="px-4 py-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">Estado</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {postulantes?.map((post: any) => (
                                            <tr key={post.cedula} className="hover:bg-slate-50 transition-colors group">
                                                <td className="px-4 py-4 text-sm font-bold text-slate-700">{post.numero_expediente || 'PENDIENTE'}</td>
                                                <td className="px-4 py-4">
                                                    <p className="text-sm font-bold text-slate-800">{post.nombre} {post.apellido}</p>
                                                    <p className="text-[10px] text-slate-400 font-mono">{post.correo}</p>
                                                </td>
                                                <td className="px-4 py-4 text-sm font-black text-[#a31e32]">{post.cedula}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-slate-600">{post.carrera || 'No especificada'}</td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${post.tipo_usuario === 'postulante' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'}`}>
                                                        {post.tipo_usuario === 'postulante' ? 'Postulante' : 'Concursante'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${post.estado_revision === 'verificado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                                                        {post.estado_revision}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : activeSection === 'external' ? (
                        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                            <ExternalUserManager onBack={() => setActiveSection('postulantes')} />
                        </div>
                    ) : activeSection === 'config' ? (
                        <div className="-m-8 bg-slate-50/50 min-h-screen p-8">
                            <SystemSettings />
                        </div>
                    ) : activeSection === 'cierres' ? (
                        <div className="-m-8 bg-slate-50/50 min-h-screen p-8">
                            <CashClosures />
                        </div>
                    ) : (
                        <div className="-m-8 bg-slate-50/50 min-h-screen">
                            <FinancialReports />
                        </div>
                    )}
                    <div className="h-8"></div>
                </div>

                {/* Modal de Vista Previa de Comprobante */}
                <DocumentPreviewModal 
                    isOpen={!!previewUrl} 
                    onClose={() => setPreviewUrl(null)} 
                    url={previewUrl || ''} 
                    title={previewTitle} 
                />

                {/* Footer */}
                <footer className="flex justify-between items-center px-12 w-full py-4 border-t border-[#e6e8ea] bg-[#f7f9fb]">
                    <p className="text-[11px] font-normal text-[#43474f]">© {new Date().getFullYear()} UPAGO - Gestión Institucional</p>
                    <div className="flex gap-6">
                        <a className="text-[11px] text-[#43474f] hover:text-[#800020] transition-colors" href="#">Privacidad</a>
                        <a className="text-[11px] text-[#43474f] hover:text-[#800020] transition-colors" href="#">Términos</a>
                    </div>
                </footer>
            </main>
        </div>
    );
};

export default AdminFinanceDashboard;