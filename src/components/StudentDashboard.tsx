import React, { useState } from 'react';
import { Person as User, Description, AccountBalanceWallet as Wallet, Logout as LogoutIcon, FileUpload as Upload, FileDownload as Download, CheckCircle, AccessTime as Clock, Close as X, Receipt, AssignmentTurnedIn as FileCheck, Add as Plus, Check, Notifications, Help, Settings, Dashboard, AddCircle, CalendarToday, AccountBalanceWallet, PendingActions, FilterList, ReceiptLong, Error as ErrorIcon, Info as InfoIcon, SupportAgent, FilterListAlt, CloudUpload, School, Payment as PaymentIcon, Message as MessageIcon } from '@mui/icons-material';
import MisDatosModule from './MisDatosModule';
import PaymentRegistrationForm from './aranceles/PaymentRegistrationForm';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '../services/NotificationService';

interface StudentDashboardProps {
    user: { 
        nombre: string; 
        apellido: string; 
        email: string; 
        cedula: string; 
        rol: string; 
        expediente_aprobado?: boolean; 
        carrera?: string;
        sede?: string;
        numero_expediente?: string;
    };
    onLogout: () => void;
}

import { FinanceService, Payment as Pago } from '../services/FinanceService';

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout }) => {
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
<style>body{font-family:Arial;padding:40px;max-width:800px;margin:0 auto}.header{text-align:center;border-bottom:2px solid #a31e32;padding-bottom:20px;margin-bottom:30px}.logo{font-size:32px;font-weight:bold;color:#a31e32}.monto{font-size:28px;font-weight:bold;color:#a31e32;margin:20px 0}</style></head>
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
        <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
            {/* SideNavBar */}
            <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#e6e8ea] p-6 space-y-4 z-40">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-[#a31e32] flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <span className="text-lg font-black text-[#a31e32] tracking-tight">UNAMIS</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-white rounded-xl shadow-sm">
                        <div className="w-10 h-10 rounded-full bg-[#a31e32] flex items-center justify-center">
                            <User className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-[#a31e32]">
                                {user.rol === 'concursante_docente' ? 'Portal del Concursante' : 'Portal del Postulante'}
                            </p>
                            <p className="text-[10px] text-[#43474f]">UNAMIS Institucional</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <button onClick={() => setActiveSection('datos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'datos' ? 'bg-white shadow-sm text-[#a31e32]' : 'text-[#43474f] hover:bg-[#d8dadc]'}`}>
                        <Dashboard style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Mis Datos</span>
                    </button>
                    <button onClick={() => setActiveSection('pagos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'pagos' ? 'bg-white shadow-sm text-[#a31e32]' : 'text-[#43474f] hover:bg-[#d8dadc]'}`}>
                        <Wallet style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Pagos</span>
                    </button>
                    <button onClick={() => setActiveSection('documentos_digitales')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'documentos_digitales' ? 'bg-white shadow-sm text-[#a31e32]' : 'text-[#43474f] hover:bg-[#d8dadc]'}`}>
                        <Description style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Trámites</span>
                    </button>
                    <button className="w-full flex items-center gap-3 px-4 py-3 text-[#43474f] hover:bg-[#d8dadc] rounded-md transition-all duration-200 hover:translate-x-1">
                        <Settings style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Configuración</span>
                    </button>
                </nav>
                <button 
                    onClick={() => setActiveSection('registro_pago')} 
                    disabled={!user.expediente_aprobado && !isMedicina}
                    className={`w-full py-3 px-4 text-white rounded-md font-bold text-sm shadow-lg flex items-center justify-center gap-2 mb-4 transition-all ${(user.expediente_aprobado || isMedicina) ? 'bg-gradient-to-r from-[#a31e32] to-[#7a1424]' : 'bg-slate-400 cursor-not-allowed'}`}
                    title={(!user.expediente_aprobado && !isMedicina) ? 'Requiere aprobación de expediente' : ''}
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
                <header className="bg-white docked full-width top-0 z-50 flex justify-between items-center w-full px-6 md:px-12 py-4 max-w-full mx-auto">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-[#a31e32] tracking-tight">UNAMIS</h1>
                        <nav className="hidden lg:flex items-center gap-6">
                            <button onClick={() => setActiveSection('pagos')} className={`text-sm font-medium transition-colors ${activeSection === 'pagos' ? 'text-[#a31e32] border-b-2 border-[#a31e32] pb-1 font-bold' : 'text-[#43474f] hover:text-[#a31e32]'}`}>Mis Pagos</button>
                            <button onClick={() => setActiveSection('editar_datos')} className={`text-sm font-medium transition-colors ${activeSection === 'editar_datos' ? 'text-[#a31e32] border-b-2 border-[#a31e32] pb-1 font-bold' : 'text-[#43474f] hover:text-[#a31e32]'}`}>Editar/Cargar Datos</button>
                            <button onClick={() => setActiveSection('documentos_digitales')} className={`text-sm font-medium transition-colors ${activeSection === 'documentos_digitales' ? 'text-[#a31e32] border-b-2 border-[#a31e32] pb-1 font-bold' : 'text-[#43474f] hover:text-[#a31e32]'}`}>Expediente Digital</button>
                            <button className="text-[#43474f] hover:text-[#a31e32] transition-colors text-sm font-medium">Certificados</button>
                        </nav>
                    </div>
                    <div className="flex items-center gap-4">
                        <NotificationCenter />
                        <button className="p-2 text-[#43474f] hover:bg-[#f2f4f6] rounded-full transition-all">
                            <Help />
                        </button>
                        <div className="h-8 w-[1px] bg-[#f2f4f6] mx-2"></div>
                        <div className="w-8 h-8 rounded-full bg-[#a31e32] flex items-center justify-center">
                            <User className="text-white" style={{fontSize: 16}} />
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
                            {/* Student Profile Summary */}
                            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h2 className="text-3xl md:text-4xl font-black text-[#a31e32] tracking-tight mb-2">
                                {user.rol === 'concursante_docente' ? 'Mis Concursos' : 'Mis Pagos'}
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
                            className="px-6 py-3 rounded-md font-bold shadow-lg flex items-center gap-2 self-start md:self-auto transition-transform bg-gradient-to-br from-[#a31e32] to-[#7a1424] text-white active:scale-95"
                        >
                            <AddCircle />
                            Subir Nuevo Comprobante
                        </button>
                    </section>

                    {/* Account Summary - Bento Grid */}
                    <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-white p-6 rounded-xl shadow-[0px_24px_48px_rgba(25,28,30,0.04)] flex flex-col justify-between group hover:bg-[#a31e32] transition-colors duration-300">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-[#a31e32]/5 rounded-lg group-hover:bg-white/10 transition-colors">
                                    <AccountBalanceWallet className="text-[#a31e32] group-hover:text-white" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#43474f] group-hover:text-[#d5e3ff] transition-colors">Total Pagado</span>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-[#a31e32] group-hover:text-white transition-colors">{totalPagado.toLocaleString()} PYG</p>
                                <p className="text-xs text-[#43474f] mt-1 group-hover:text-white/70 transition-colors">Ciclo Lectivo 2024</p>
                            </div>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-[0px_24px_48px_rgba(25,28,30,0.04)] flex flex-col justify-between border-l-4 border-[#ba1a1a]">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2 bg-[#ba1a1a]/5 rounded-lg">
                                    <PendingActions className="text-[#ba1a1a]" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#43474f]">Cuotas Pendientes</span>
                            </div>
                            <div>
                                <p className="text-2xl font-black text-[#191c1e]">{pendienteCount} Trámites</p>
                                <p className="text-xs text-[#ba1a1a] font-semibold mt-1">Saldo: {pendienteMonto.toLocaleString()} PYG</p>
                            </div>
                        </div>
                        <div className="bg-[#a31e32] p-6 rounded-xl shadow-[0px_24px_48px_rgba(128,0,32,0.1)] flex flex-col justify-between relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <CalendarToday style={{fontSize: 120}} />
                            </div>
                            <div className="flex justify-between items-start mb-4 relative z-10">
                                <div className="p-2 bg-white/10 rounded-lg">
                                    <CalendarToday className="text-white" />
                                </div>
                                <span className="text-[10px] font-bold uppercase tracking-widest text-[#d5e3ff]">Próximo Vencimiento</span>
                            </div>
                            <div className="relative z-10">
                                <p className="text-2xl font-black text-white">15 Mayo, 2024</p>
                                <p className="text-xs text-white/70 mt-1">Cuota 04 - Administración I</p>
                            </div>
                        </div>
                    </section>

                    {/* Payment History Table */}
                    <section className="space-y-4">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xl font-bold text-[#a31e32]">Historial de Pagos</h3>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#43474f] bg-[#e6e8ea] rounded-full hover:bg-[#e0e3e5] transition-colors">
                                    <FilterListAlt className="text-sm" />
                                    Filtrar
                                </button>
                                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-[#43474f] bg-[#e6e8ea] rounded-full hover:bg-[#e0e3e5] transition-colors">
                                    <Download className="text-sm" />
                                    Exportar PDF
                                </button>
                            </div>
                        </div>
                        <div className="bg-white rounded-xl shadow-[0px_24px_48px_rgba(25,28,30,0.04)] overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#f2f4f6]">
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#43474f]">Fecha</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#43474f]">Concepto</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#43474f] text-right">Monto (PYG)</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#43474f] text-center">Estado</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#43474f] text-right">Acciones</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[#e6e8ea]">
                                    {misPagos?.map((pago) => (
                                        <tr key={pago.id} className="hover:bg-[#e6e8ea] transition-colors group">
                                            <td className="px-6 py-4 text-sm font-medium text-[#191c1e]">{pago.fecha_pago || ''}</td>
                                            <td className="px-6 py-4">
                                                <p className="text-sm font-bold text-[#a31e32]">{pago.concepto}</p>
                                                <p className="text-[10px] text-[#43474f]">Ciclo 2024</p>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-bold text-right font-mono">{pago.monto.toLocaleString()}</td>
                                            <td className="px-6 py-4 text-center">
                                                {pago.estado === 'verificado' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-800 text-[10px] font-bold">
                                                        <CheckCircle style={{fontSize: 12}} /> VERIFIED
                                                    </span>
                                                )}
                                                {pago.estado === 'pendiente' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                                                        <Clock style={{fontSize: 12}} /> PENDING
                                                    </span>
                                                )}
                                                {pago.estado === 'rechazado' && (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-800 text-[10px] font-bold">
                                                        <ErrorIcon style={{fontSize: 12}} /> REJECTED
                                                    </span>
                                                )}
                                                {pago.observaciones && (
                                                    <div className="mt-1 flex items-center gap-1 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-100 group-relative cursor-help" title={pago.observaciones}>
                                                        <MessageIcon style={{fontSize: 10}} />
                                                        <span>Ver Observación</span>
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                {pago.estado === 'verificado' ? (
                                                    <button onClick={() => descargarBoleta(pago)} className="text-[#a31e32] hover:bg-[#a31e32]/5 p-2 rounded-lg transition-colors" title="Descargar Recibo">
                                                        <ReceiptLong />
                                                    </button>
                                                ) : (
                                                    <button className="text-[#43474f] cursor-not-allowed p-2" disabled={true}>
                                                        <ReceiptLong />
                                                    </button>
                                                )}
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
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#a31e32] shadow-sm">
                                <SupportAgent />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#a31e32] mb-1">¿Necesitas ayuda con tus pagos?</h4>
                                <p className="text-sm text-[#43474f] leading-relaxed">Si tienes problemas con la validación de tus comprobantes, contacta a Tesorería al (021) 123-4567 o escribe a pagos@unamis.edu.py</p>
                            </div>
                        </div>
                        <div className="flex gap-4 p-6 bg-white rounded-xl">
                            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white flex items-center justify-center text-[#43474f] shadow-sm">
                                <InfoIcon />
                            </div>
                            <div>
                                <h4 className="font-bold text-[#a31e32] mb-1">Políticas de Pago</h4>
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
                                onSuccess={() => setActiveSection('pagos')} 
                                onBack={() => setActiveSection('pagos')} 
                            />
                        </div>
                    ) : (
                        <div className="text-center py-20 text-[#43474f] bg-white rounded-xl shadow-sm border border-[#e6e8ea]">
                            <h2 className="text-2xl font-bold mb-2 text-[#a31e32]">Sección en construcción</h2>
                            <p>Esta sección estará disponible próximamente.</p>
                        </div>
                    )}
                </div>
            </main>

            {/* BottomNavBar for Mobile */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-[#c3c6d1]/10 px-6 py-3 flex justify-between items-center z-50">
                <button onClick={() => setActiveSection('datos')} className={`flex flex-col items-center gap-1 ${activeSection === 'datos' ? 'text-[#a31e32]' : 'text-[#43474f]'}`}>
                    <Dashboard />
                    <span className="text-[10px] font-medium">Mis Datos</span>
                </button>
                <button onClick={() => setActiveSection('pagos')} className={`flex flex-col items-center gap-1 ${activeSection === 'pagos' ? 'text-[#a31e32]' : 'text-[#43474f]'}`}>
                    <Wallet />
                    <span className="text-[10px] font-bold">Pagos</span>
                </button>
                <button onClick={() => setActiveSection('documentos_digitales')} className={`flex flex-col items-center gap-1 ${activeSection === 'documentos_digitales' ? 'text-[#a31e32]' : 'text-[#43474f]'}`}>
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

export default StudentDashboard;