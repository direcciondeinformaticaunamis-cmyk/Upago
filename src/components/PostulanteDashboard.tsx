import React, { useState } from 'react';
import User from '@mui/icons-material/Person';
import Description from '@mui/icons-material/Description';
import Wallet from '@mui/icons-material/AccountBalanceWallet';
import LogoutIcon from '@mui/icons-material/Logout';
import Upload from '@mui/icons-material/FileUpload';
import Download from '@mui/icons-material/FileDownload';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Clock from '@mui/icons-material/AccessTime';
import X from '@mui/icons-material/Close';
import Receipt from '@mui/icons-material/Receipt';
import FileCheck from '@mui/icons-material/AssignmentTurnedIn';
import Plus from '@mui/icons-material/Add';
import Check from '@mui/icons-material/Check';
import Notifications from '@mui/icons-material/Notifications';
import Help from '@mui/icons-material/Help';
import Settings from '@mui/icons-material/Settings';
import Dashboard from '@mui/icons-material/Dashboard';
import AddCircle from '@mui/icons-material/AddCircle';
import CalendarToday from '@mui/icons-material/CalendarToday';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import PendingActions from '@mui/icons-material/PendingActions';
import FilterList from '@mui/icons-material/FilterList';
import ReceiptLong from '@mui/icons-material/ReceiptLong';
import ErrorIcon from '@mui/icons-material/Error';
import InfoIcon from '@mui/icons-material/Info';
import SupportAgent from '@mui/icons-material/SupportAgent';
import FilterListAlt from '@mui/icons-material/FilterListAlt';
import CloudUpload from '@mui/icons-material/CloudUpload';
import School from '@mui/icons-material/School';
import PaymentIcon from '@mui/icons-material/Payment';
import MessageIcon from '@mui/icons-material/Message';
import { motion } from 'framer-motion';
import MisDatosModule from './MisDatosModule';
import PaymentRegistrationForm from './aranceles/PaymentRegistrationForm';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '../services/NotificationService';

interface PostulanteDashboardProps {
    user: { 
        nombre: string; 
        apellido: string; 
        email: string; 
        cedula: string; 
        rol: string; 
        expediente_aprobado?: boolean; 
        carrera?: string;
        sede?: string;
        tipo_usuario?: string;
        numero_expediente?: string;
    };
    onLogout: () => void;
}

import { FinanceService, Payment as Pago } from '../services/FinanceService';

const PostulanteDashboard: React.FC<PostulanteDashboardProps> = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState<'datos' | 'documentos' | 'pagos' | 'registro_pago' | 'editar_datos' | 'documentos_digitales'>(
        user.expediente_aprobado ? 'pagos' : 'datos'
    );
    const [showModalPago, setShowModalPago] = useState(false);
    const isMedicina = user.carrera === 'Medicina' || user.carrera?.includes('Medicina');
    const [misPagos, setMisPagos] = useState<Pago[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    React.useEffect(() => {
        loadPagos();
    }, []);

    const loadPagos = async () => {
        setIsLoading(true);
        try {
            const data = await FinanceService.getPagos(user.cedula);
            setMisPagos(data);
        } catch (error) {
            console.error('Error loading payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const documentos = [
        { id: 'cedula', nombre: 'Cédula de Identidad', estado: 'verificado' },
        { id: 'nacimiento', nombre: 'Certificado de Nacimiento', estado: 'pendiente' },
        { id: 'titulo', nombre: 'Título de Grado', estado: 'pendiente' },
    ];

    const generarBoletaHTML = (pago: Pago) => {
        return `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>BOLETA ${pago.numero_boleta}</title>
<style>body{font-family:Arial;padding:40px;max-width:800px;margin:0 auto}.header{text-align:center;border-bottom:2px solid #002f6c;padding-bottom:20px;margin-bottom:30px}.logo{font-size:32px;font-weight:bold;color:#002f6c}.monto{font-size:28px;font-weight:bold;color:#002f6c;margin:20px 0}</style></head>
<body><div class="header"><div class="logo">UNIVERSIDAD NACIONAL DE MISIONES</div><div>BOLETA OFICIAL DE PAGO</div></div>
<p><strong>Número:</strong> ${pago.numero_boleta}</p><p><strong>Fecha:</strong> ${new Date().toLocaleDateString('es-ES')}</p>
<p><strong>Postulante:</strong> ${user.nombre} ${user.apellido}</p><p><strong>Email:</strong> ${user.email}</p>
<p><strong>Concepto:</strong> ${pago.concepto}</p><div class="monto">Gs. ${pago.monto.toLocaleString()}</div>
<p><small>Esta boleta es válida con el sello de Tesorería UNAMIS</small></p></body></html>`;
    };

    const descargarBoleta = (pago: Pago) => {
        const blob = new Blob([generarBoletaHTML(pago)], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${pago.numero_boleta || 'boleta'}.html`;
        a.click();
    };



    const totalPagado = misPagos?.filter(p => p.estado === 'verificado').reduce((sum, p) => sum + p.monto, 0) || 0;
    const pendienteCount = misPagos?.filter(p => p.estado === 'pendiente').length || 0;
    const pendienteMonto = misPagos?.filter(p => p.estado === 'pendiente').reduce((sum, p) => sum + p.monto, 0) || 0;

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--background)]">
            {/* SideNavBar */}
            <aside className="hidden md:flex flex-col h-screen w-72 fixed left-0 top-0 bg-white border-r border-[var(--border-subtle)] p-8 space-y-6 z-40">
                <div className="mb-10">
                    <div className="flex items-center gap-3 mb-10 px-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] flex items-center justify-center shadow-lg shadow-[var(--primary-100)]">
                            <span className="text-white font-black text-lg">U</span>
                        </div>
                        <span className="text-2xl font-black text-[var(--primary)] tracking-tighter uppercase">UNAMIS</span>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-[var(--background)] rounded-2xl border border-[var(--border-subtle)]">
                        <div className="w-11 h-11 rounded-full bg-white flex items-center justify-center shadow-sm border border-[var(--border-subtle)]">
                            <User className="text-[var(--primary)]" style={{fontSize: 22}} />
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-[var(--text)] truncate">
                                {user.nombre} {user.apellido}
                            </p>
                            <p className="text-[10px] text-[var(--text-muted)] font-medium uppercase tracking-wider">
                                {(user.rol === 'concursante_docente' || user.tipo_usuario === 'concursante_docente') ? 'Docente Titular' : ((user.rol === 'auxiliar_docente' || user.tipo_usuario === 'auxiliar_docente') ? 'Auxiliar Docente' : 'Postulante')}
                            </p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 space-y-2">
                    {[
                        { id: 'datos', label: 'Mis Datos', icon: Dashboard },
                        { id: 'pagos', label: 'Pagos', icon: Wallet },
                        { id: 'documentos_digitales', label: 'Trámites', icon: Description },
                        { id: 'config', label: 'Ajustes', icon: Settings },
                    ].map((item) => (
                        <button 
                            key={item.id}
                            onClick={() => setActiveSection(item.id as any)} 
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 group ${
                                activeSection === item.id 
                                    ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary-100)]' 
                                    : 'text-[var(--text-secondary)] hover:bg-[var(--background)] hover:text-[var(--primary)]'
                            }`}
                        >
                            <item.icon style={{fontSize: 20}} className={activeSection === item.id ? 'text-white' : 'text-[var(--text-muted)] group-hover:text-[var(--primary)]'} />
                            <span className="text-sm font-bold uppercase tracking-widest text-[11px]">{item.label}</span>
                        </button>
                    ))}
                </nav>
                <button 
                    onClick={() => setActiveSection('registro_pago')} 
                    disabled={!user.expediente_aprobado && !isMedicina && user.rol !== 'concursante_docente' && user.rol !== 'auxiliar_docente'}
                    className={`w-full py-3 px-4 text-white rounded-md font-bold text-sm shadow-lg flex items-center justify-center gap-2 mb-4 transition-all ${(user.expediente_aprobado || isMedicina || user.rol === 'concursante_docente' || user.rol === 'auxiliar_docente') ? 'bg-gradient-to-r from-[#002f6c] to-[#001738]' : 'bg-slate-400 cursor-not-allowed'}`}
                    title={(!user.expediente_aprobado && !isMedicina && user.rol !== 'concursante_docente' && user.rol !== 'auxiliar_docente') ? 'Requiere aprobación de expediente' : ''}
                >
                    <CloudUpload style={{fontSize: 18}} />
                    Subir Comprobante
                </button>
                <div className="pt-4 border-t border-[#c3c6d1]/20">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-md transition-colors">
                        <LogoutIcon style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 md:ml-64 h-screen overflow-y-auto bg-[#f7f9fb]">
                {/* TopAppBar */}
                <header className="bg-white/80 backdrop-blur-xl sticky top-0 z-50 flex justify-between items-center w-full px-8 md:px-12 py-5 border-b border-[var(--border-subtle)]">
                    <div className="flex items-center gap-12">
                        <h1 className="text-2xl font-black text-[var(--primary)] tracking-tighter uppercase lg:hidden">UNAMIS</h1>
                        <nav className="hidden lg:flex items-center gap-8">
                            {[
                                { id: 'pagos', label: 'Mis Pagos' },
                                { id: 'editar_datos', label: 'Mis Datos' },
                                { id: 'documentos_digitales', label: 'Expediente' },
                            ].map(item => (
                                <button 
                                    key={item.id}
                                    onClick={() => setActiveSection(item.id as any)} 
                                    className={`text-xs font-bold uppercase tracking-widest transition-all relative py-2 ${
                                        activeSection === item.id 
                                            ? 'text-[var(--primary)]' 
                                            : 'text-[var(--text-muted)] hover:text-[var(--primary)]'
                                    }`}
                                >
                                    {item.label}
                                    {activeSection === item.id && (
                                        <motion.div layoutId="nav-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[var(--primary)] rounded-full" />
                                    )}
                                </button>
                            ))}
                        </nav>
                    </div>
                    <div className="flex items-center gap-6">
                        <NotificationCenter />
                        <div className="h-6 w-px bg-[var(--border-subtle)]"></div>
                        <div className="flex items-center gap-3 pl-2">
                            <div className="text-right hidden sm:block">
                                <p className="text-[11px] font-bold text-[var(--text)] leading-none mb-1">{user.nombre}</p>
                                <p className="text-[9px] font-bold text-[var(--primary)] uppercase tracking-widest">{user.rol === 'admin' ? 'Admin' : 'Online'}</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-[var(--background)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--primary)] shadow-sm">
                                <User style={{fontSize: 20}} />
                            </div>
                        </div>
                    </div>
                </header>

                <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto space-y-8">
                    {activeSection === 'pagos' ? (
                        <>
                            {!user.expediente_aprobado && (
                                <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-start gap-3 mb-6 shadow-sm">
                                    <ErrorIcon className="text-amber-600 mt-0.5" />
                                    <div>
                                        <h4 className="font-bold text-amber-800">Aprobación Pendiente</h4>
                                        <p className="text-sm text-amber-700 mt-1">
                                            {isMedicina 
                                                ? "Su expediente está en revisión. Sin embargo, por tratarse del Examen de Admisión de Medicina, ya se encuentra habilitado para registrar su comprobante de pago."
                                                : "Debe esperar a que la Coordinación Académica verifique y apruebe su expediente digital ('Mis Datos'). Una vez aprobado, podrá registrar sus pagos de aranceles."
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                            {/* Postulante Profile Summary */}
                            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-[#002f6c] tracking-tight mb-2">
                                {(user.rol === 'concursante_docente' || user.rol === 'auxiliar_docente') ? 'Mis Concursos' : 'Mis Pagos'}
                            </h2>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                                <span className="flex items-center gap-2 text-[#43474f] font-medium">
                                    <User className="text-sm" />
                                    {user.nombre} {user.apellido}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#c3c6d1]"></div>
                                <span className="flex items-center gap-2 text-[#43474f]">
                                    <School className="text-sm" />
                                    {user.carrera || 'Medicina'}
                                </span>
                                <div className="w-1.5 h-1.5 rounded-full bg-[#c3c6d1]"></div>
                                <span className="text-[#43474f] font-mono text-sm bg-[#e6e8ea] px-2 py-0.5 rounded">
                                    EXP: {user.numero_expediente || 'UNAMIS-2026-REG-PENDIENTE'}
                                </span>
                            </div>
                        </div>
                        <button 
                            onClick={() => setActiveSection('registro_pago')} 
                            className="px-6 py-3 rounded-md font-bold shadow-lg flex items-center gap-2 self-start md:self-auto transition-transform bg-gradient-to-br from-[#002f6c] to-[#001738] text-white active:scale-95"
                        >
                            <AddCircle />
                            Subir Nuevo Comprobante
                        </button>
                    </section>

                    {/* Account Summary - Bento Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="bg-white p-8 rounded-[var(--radius-2xl)] shadow-card flex flex-col justify-between group hover:shadow-lg transition-all duration-500 border border-[var(--border-subtle)] relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary-50)] rounded-bl-[100px] -mr-8 -mt-8 transition-all group-hover:scale-150" />
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-[var(--primary-50)] rounded-2xl group-hover:bg-[var(--primary)] transition-colors duration-500">
                                    <AccountBalanceWallet className="text-[var(--primary)] group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors">Total Pagado</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-3xl font-black text-[var(--text)]">{totalPagado.toLocaleString()} <span className="text-sm font-bold text-[var(--text-muted)]">PYG</span></p>
                                <p className="text-xs text-[var(--text-muted)] mt-2 font-medium">Ciclo Lectivo 2026</p>
                            </div>
                        </div>
                        
                        <div className="bg-white p-8 rounded-[var(--radius-2xl)] shadow-card flex flex-col justify-between border border-[var(--border-subtle)] relative group">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-amber-50 rounded-2xl">
                                    <PendingActions className="text-amber-600" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Pendientes</span>
                            </div>
                            <div>
                                <p className="text-3xl font-black text-[var(--text)]">{pendienteCount} <span className="text-sm font-bold text-[var(--text-muted)]">Trámites</span></p>
                                <p className="text-xs text-amber-600 font-bold mt-2 uppercase tracking-tighter">Saldo: {pendienteMonto.toLocaleString()} PYG</p>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-8 rounded-[var(--radius-2xl)] shadow-premium flex flex-col justify-between relative overflow-hidden group">
                            <div className="absolute -right-6 -top-6 opacity-10 group-hover:scale-110 transition-transform duration-700">
                                <CalendarToday style={{fontSize: 140}} />
                            </div>
                            <div className="flex justify-between items-start mb-6 relative z-10">
                                <div className="p-3 bg-white/10 backdrop-blur-md rounded-2xl border border-white/10">
                                    <CalendarToday className="text-white" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60">Próximo Vencimiento</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-3xl font-black text-white">15 Mayo, 2026</p>
                                <p className="text-xs text-white/70 mt-2 font-medium">Admisión / Matriculación</p>
                            </div>
                        </div>
                    </section>

                    {/* Payment History Table */}
                    <section className="space-y-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-xl font-black text-[var(--text)] tracking-tight">Historial de Transacciones</h3>
                                <p className="text-xs text-[var(--text-muted)] font-medium uppercase tracking-widest mt-1">Registros Administrativos Oficiales</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-[var(--text-secondary)] bg-white border border-[var(--border-subtle)] rounded-xl hover:bg-[var(--background)] transition-all shadow-sm">
                                    <FilterListAlt style={{fontSize: 14}} />
                                    Filtrar
                                </button>
                                <button className="flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-white bg-[var(--text)] rounded-xl hover:bg-[var(--primary-dark)] transition-all shadow-sm">
                                    <Download style={{fontSize: 14}} />
                                    PDF
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-[var(--radius-2xl)] shadow-card overflow-hidden border border-[var(--border-subtle)]">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[var(--background)]">
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Fecha</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">Concepto / Referencia</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-right">Monto</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-center">Estado</th>
                                        <th className="px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] text-right">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border-subtle)]">
                                    {misPagos?.map((pago) => (
                                        <tr key={pago.id} className="hover:bg-[var(--background)]/50 transition-colors group">
                                            <td className="px-8 py-6 text-xs font-bold text-[var(--text-secondary)]">{pago.fecha_pago || ''}</td>
                                            <td className="px-8 py-6">
                                                <p className="text-sm font-bold text-[var(--text)]">{pago.concepto}</p>
                                                {pago.asignatura && (
                                                    <p className="text-[10px] text-purple-700 font-bold bg-purple-50 px-2 py-0.5 rounded border border-purple-100 w-fit mt-1 uppercase tracking-wider">
                                                        Asignatura: {pago.asignatura}
                                                    </p>
                                                )}
                                                <p className="text-[10px] text-[var(--text-muted)] font-medium mt-1">Ciclo Académico 2026</p>
                                            </td>
                                            <td className="px-8 py-6 text-sm font-black text-right text-[var(--text)]">
                                                <span className="text-[10px] font-bold text-[var(--text-muted)] mr-1">PYG</span>
                                                {pago.monto.toLocaleString()}
                                            </td>
                                            <td className="px-8 py-6 text-center">
                                                {pago.estado === 'verificado' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--success-soft)] text-[var(--success)] text-[9px] font-black uppercase tracking-widest border border-[var(--success-soft)]">
                                                        <CheckCircle style={{fontSize: 12}} /> Aprobado
                                                    </span>
                                                )}
                                                {pago.estado === 'pendiente' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--warning-soft)] text-[var(--warning)] text-[9px] font-black uppercase tracking-widest border border-[var(--warning-soft)]">
                                                        <Clock style={{fontSize: 12}} /> Pendiente
                                                    </span>
                                                )}
                                                {pago.estado === 'rechazado' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[var(--danger-soft)] text-[var(--danger)] text-[9px] font-black uppercase tracking-widest border border-[var(--danger-soft)]">
                                                        <ErrorIcon style={{fontSize: 12}} /> Rechazado
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-8 py-6 text-right">
                                                <button 
                                                    onClick={() => pago.estado === 'verificado' && descargarBoleta(pago)}
                                                    disabled={pago.estado !== 'verificado'}
                                                    className={`p-2.5 rounded-xl transition-all ${pago.estado === 'verificado' ? 'bg-[var(--primary-50)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white' : 'text-[var(--text-light)] cursor-not-allowed'}`}
                                                >
                                                    <ReceiptLong style={{fontSize: 20}} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </section>

                    {/* Support Cards */}
                    <section className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                        <div className="flex gap-4 p-6 bg-[#d5e3fc]/30 rounded-xl">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#002f6c] shadow-sm">
                                <SupportAgent />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#002f6c] mb-1">¿Necesitas ayuda con tus pagos?</h4>
                                <p className="text-sm text-[#43474f] leading-relaxed">Si tienes problemas con la validación de tus comprobantes, contacta a Tesorería al (021) 123-4567 o escribe a pagos@unamis.edu.py</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-xl">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#43474f] shadow-sm">
                                <InfoIcon />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#002f6c] mb-1">Políticas de Pago</h4>
                                <p className="text-sm text-[#43474f] leading-relaxed">Recuerda que los pagos realizados vía transferencia bancaria pueden tardar hasta 48 horas hábiles en ser validados por nuestro equipo administrativo.</p>
                            </div>
                        </div>
                    </section>
                        </>
                    ) : activeSection === 'datos' ? (
                        <MisDatosModule key="datos-resumen" user={user} />
                    ) : activeSection === 'editar_datos' ? (
                        <MisDatosModule key="datos-edit" user={user} forceEdit={true} initialStep={1} />
                    ) : activeSection === 'documentos_digitales' ? (
                        <MisDatosModule key="datos-docs" user={user} forceEdit={true} initialStep={2} />
                    ) : activeSection === 'registro_pago' ? (
                        <div className="-mx-6 md:-mx-12 -my-8 bg-slate-50/50 min-h-screen">
                            <PaymentRegistrationForm 
                                mode="postulante" 
                                postulanteName={`${user.nombre} ${user.apellido}`} 
                                postulanteCedula={user.cedula} 
                                postulanteCarrera={user.carrera || 'Medicina'}
                                postulanteSede={user.sede || 'Sede San Ignacio Guazú'}
                                postulanteTelefono={(user as any).telefono || ''}
                                postulanteDireccion={(user as any).direccion || ''}
                                isDocente={user.rol === 'concursante_docente' || user.rol === 'auxiliar_docente'}
                                onSuccess={() => setActiveSection('pagos')} 
                                onBack={() => setActiveSection('pagos')} 
                            />
                        </div>
                    ) : (
                        <div className="text-center py-20 text-[#43474f] bg-white rounded-xl shadow-sm border border-[#e6e8ea]">
                            <h2 className="text-2xl font-bold mb-2 text-[#002f6c]">Sección en construcción</h2>
                            <p>Esta sección estará disponible próximamente.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* BottomNavBar for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#c3c6d1]/10 px-6 py-3 flex justify-between items-center z-50">
                <button onClick={() => setActiveSection('datos')} className={`flex flex-col items-center gap-1 ${activeSection === 'datos' ? 'text-[#002f6c]' : 'text-[#43474f]'}`}>
                    <Dashboard />
                    <span className="text-[10px] font-medium">Mis Datos</span>
                </button>
                <button onClick={() => setActiveSection('pagos')} className={`flex flex-col items-center gap-1 ${activeSection === 'pagos' ? 'text-[#002f6c]' : 'text-[#43474f]'}`}>
                    <Wallet />
                    <span className="text-[10px] font-bold">Pagos</span>
                </button>
                <button onClick={() => setActiveSection('documentos_digitales')} className={`flex flex-col items-center gap-1 ${activeSection === 'documentos_digitales' ? 'text-[#002f6c]' : 'text-[#43474f]'}`}>
                    <Description />
                    <span className="text-[10px] font-medium">Trámites</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-[#43474f]">
                    <Settings />
                    <span className="text-[10px] font-medium">Ajustes</span>
                </button>
            </nav>

        </div>
    );
};

export default PostulanteDashboard;
