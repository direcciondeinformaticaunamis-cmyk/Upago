import React, { useState } from 'react';
import { Person as User, Dashboard, Payments, AccountBalanceWallet, Assessment, Help, Logout, Search, Notifications, Settings, Add, TrendingUp, Schedule, Group, PersonAdd, FileDownload, Print, History, Mail, MoreVert, Visibility, Logout as LogoutIcon, CheckCircle, Warning, Description, Edit, UploadFile, AssignmentInd, Assignment, FactCheck as FileCheck, AccessTime as Clock, FilterList, Close as X, Check } from '@mui/icons-material';
import MisDatosModule from './MisDatosModule';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '../services/NotificationService';
import { AcademicService, Expediente } from '../services/AcademicService';

interface AcademicDashboardProps {
    user: { nombre: string; apellido: string; email: string; cedula: string; rol: string };
    onLogout: () => void;
}

const AcademicDashboard: React.FC<AcademicDashboardProps> = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState<'admision' | 'dashboard' | 'nueva_inscripcion' | 'reportes'>('admision');
    const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
    const [expedientes, setExpedientes] = useState<Expediente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCarrera, setFilterCarrera] = useState('');
    const [filterSede, setFilterSede] = useState('');

    React.useEffect(() => {
        loadExpedientes();
    }, []);

    const loadExpedientes = async () => {
        setIsLoading(true);
        try {
            const data = await AcademicService.getExpedientes();
            setExpedientes(data);
        } catch (error) {
            console.error('Error loading expedientes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAprobarExpediente = async (cedula: string) => {
        try {
            await AcademicService.approveExpediente(cedula);
            notificationService.send(
                'Expediente Aprobado', 
                `El expediente ha sido validado completamente. El postulante ya puede realizar el pago.`,
                'success'
            );
            loadExpedientes();
            setSelectedExpediente(null);
        } catch (error) {
            console.error('Error approving expediente:', error);
        }
    };

    const handleValidarDocumento = async (cedula: string, docId: string) => {
        try {
            await AcademicService.validateDocument(cedula, docId);
            notificationService.send('Documento Validado', `Se ha marcado como válido.`, 'success');
            // Refresh documents in the modal
            const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
            if (selectedExpediente) {
                setSelectedExpediente({ ...selectedExpediente, documentos: updatedDocs });
            }
        } catch (error) {
            console.error('Error validating document:', error);
        }
    };

    const handleSaveObservation = async (cedula: string, docId: string, obs: string) => {
        try {
            await AcademicService.saveDocumentObservation(cedula, docId, obs);
            notificationService.send('Observación Guardada', `Se notificó: ${obs}`, 'info');
            // Refresh
            const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
            if (selectedExpediente) {
                setSelectedExpediente({ ...selectedExpediente, documentos: updatedDocs });
            }
        } catch (error) {
            console.error('Error saving observation:', error);
        }
    };

    const pendientes = expedientes.filter(e => e.estado === 'pendiente').length;

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
            {/* SideNavBar */}
            <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#0f172a] p-6 space-y-4 z-40">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <span className="text-lg font-black text-white tracking-tight">UNAMIS</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl shadow-sm border border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                            <User className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400">Portal Académico</p>
                            <p className="text-[10px] text-slate-400">{user.nombre} {user.apellido}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <button onClick={() => setActiveSection('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'dashboard' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Dashboard style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveSection('admision')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'admision' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <FileCheck style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Gestión de Admisión</span>
                    </button>
                    <button onClick={() => setActiveSection('nueva_inscripcion')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'nueva_inscripcion' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <PersonAdd style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Nueva Inscripción</span>
                    </button>
                    <button onClick={() => setActiveSection('reportes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'reportes' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Assessment style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Reportes e Impresión</span>
                    </button>
                </nav>
                <div className="pt-4 border-t border-slate-800">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <LogoutIcon style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 md:ml-64 h-screen overflow-y-auto bg-[#f7f9fb]">
                <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 md:px-12 py-4">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión Académica</h1>
                    </div>
                </header>

                <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto space-y-8">
                    {activeSection === 'admision' && (
                        <>
                            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Revisión de Expedientes</h2>
                                    <p className="text-slate-500">Verifique los documentos digitales para habilitar el pago de aranceles.</p>
                                </div>
                                <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-emerald-200">
                                    <Clock /> {pendientes} Pendientes de Revisión
                                </div>
                            </section>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize: 18}} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar por CI o nombre..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500" 
                                        />
                                    </div>
                                    <select 
                                        value={filterCarrera}
                                        onChange={(e) => setFilterCarrera(e.target.value)}
                                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Todas las Carreras</option>
                                        <option value="Medicina">Medicina</option>
                                        <option value="Derecho">Derecho</option>
                                        <option value="Ingeniería">Ingeniería</option>
                                    </select>
                                    <select 
                                        value={filterSede}
                                        onChange={(e) => setFilterSede(e.target.value)}
                                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Todas las Sedes</option>
                                        <option value="Santa Rosa">Santa Rosa</option>
                                        <option value="San Ignacio">San Ignacio</option>
                                        <option value="Ayolas">Ayolas</option>
                                    </select>
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Postulante / CI</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Programa / Tipo</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Fecha Envío</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {expedientes
                                            ?.filter(e => 
                                                (e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || e.cedula.includes(searchTerm)) &&
                                                (filterCarrera === '' || e.carrera.includes(filterCarrera)) &&
                                                (filterSede === '' || e.sede?.includes(filterSede))
                                            )
                                            .map((exp) => (
                                            <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-800">{exp.nombre}</p>
                                                    <p className="text-xs text-slate-500 font-mono">CI: {exp.cedula}</p>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-800">{exp.carrera}</p>
                                                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${exp.tipo === 'docente' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
                                                        {exp.tipo}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{exp.fechaEnvio}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {exp.estado === 'aprobado' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                            <CheckCircle style={{fontSize: 14}} /> Aprobado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                                            <Clock style={{fontSize: 14}} /> Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <button onClick={() => setSelectedExpediente(exp)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                                                        <Visibility style={{fontSize: 16}} /> Ver Expediente
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </>
                    )}
                    {activeSection === 'nueva_inscripcion' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registro Manual de Postulante</h2>
                                    <p className="text-slate-500 text-sm">Carga de datos y documentos para personas que se presentan físicamente.</p>
                                </div>
                                <button onClick={() => setActiveSection('admision')} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <MisDatosModule forceEdit={true} initialStep={1} />
                        </div>
                    )}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Group />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Postulantes</p>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.length}</p>
                                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                                        <TrendingUp style={{fontSize: 12}} /> +12% este mes
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                            <Clock />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Pendientes</p>
                                    <p className="text-2xl font-black text-slate-800">{pendientes}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Requieren acción inmediata</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                            <CheckCircle />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Aprobados</p>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.filter(e => e.estado === 'aprobado').length}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Habilitados para pago</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                            <Assignment />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.filter(e => e.tipo === 'docente').length}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Postulaciones activas</p>
                                </div>
                                <div className="bg-[#800020] p-6 rounded-2xl border border-red-900 shadow-xl shadow-red-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-white/10 rounded-lg text-white">
                                            <TrendingUp />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-white/60 mb-1">Recaudación Proyectada</p>
                                    <p className="text-2xl font-black text-white">Gs. {(expedientes.filter(e => e.estado === 'aprobado').length * 1000000).toLocaleString()}</p>
                                    <p className="mt-4 text-[10px] text-white/40 font-medium">Basado en alumnos aprobados</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <TrendingUp className="text-slate-300" style={{fontSize: 32}} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">Gráfico de Crecimiento de Postulaciones</h3>
                                    <p className="text-sm text-slate-400 max-w-xs">Aquí se visualizará la tendencia de inscripciones diarias a medida que se conecte la base de datos.</p>
                                </div>
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Clock className="text-amber-500" /> Actividad Reciente
                                    </h3>
                                    <div className="space-y-6">
                                        {expedientes?.slice(0, 3).map((exp, i) => (
                                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{exp.nombre}</p>
                                                    <p className="text-xs text-slate-500">Envió expediente para {exp.carrera}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{exp.fechaEnvio}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'reportes' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Generador de Reportes Oficiales</h2>
                                    <p className="text-slate-500 text-sm">Exportación e impresión de listados de postulantes con formato institucional.</p>
                                </div>
                                <button 
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#800020] text-white rounded-xl font-bold hover:bg-[#5a0015] transition-all shadow-lg shadow-red-100"
                                >
                                    <Print /> Imprimir Listado
                                </button>
                            </div>

                            <div id="printable-report" className="p-8 bg-white print:p-0">
                                {/* Encabezado Institucional (Solo visible en impresión) */}
                                <div className="hidden print:flex flex-col items-center text-center border-b-2 border-black pb-6 mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-[#800020] rounded-lg flex items-center justify-center text-white text-3xl font-black">U</div>
                                        <div className="text-left">
                                            <h1 className="text-xl font-black uppercase leading-tight">Universidad Nacional de Misiones</h1>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Rectorado - Secretaría General</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-bold">REGISTRO OFICIAL DE POSTULANTES Y CONCURSANTES</h2>
                                        <p className="text-xs font-medium italic">En cumplimiento con las Normativas y Reglamentos de Admisión Institucionales</p>
                                        <p className="text-[10px] text-slate-500">Generado el: {new Date().toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Tabla de Datos */}
                                <div className="overflow-hidden border border-slate-200 rounded-xl print:border-black">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-slate-700">C.I. Nº</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Nombre y Apellido</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Carrera / Área</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Tipo</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Estado Adm.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {expedientes.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                                                    <td className="px-4 py-3 font-mono text-xs">{exp.cedula}</td>
                                                    <td className="px-4 py-3 font-bold text-slate-800 uppercase text-xs">{exp.nombre}</td>
                                                    <td className="px-4 py-3 text-xs">{exp.carrera}</td>
                                                    <td className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">{exp.tipo}</td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[10px] font-black uppercase ${exp.estado === 'aprobado' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {exp.estado === 'aprobado' ? '✓ VERIFICADO' : '◌ PENDIENTE'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pie de Reporte para Firma (Solo impresión) */}
                                <div className="hidden print:grid grid-cols-2 gap-20 mt-32 text-center">
                                    <div className="border-t border-black pt-2">
                                        <p className="text-xs font-bold uppercase">Secretaría Académica</p>
                                        <p className="text-[10px]">Sello y Firma</p>
                                    </div>
                                    <div className="border-t border-black pt-2">
                                        <p className="text-xs font-bold uppercase">Dirección General de Admisión</p>
                                        <p className="text-[10px]">Sello y Firma</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Revisión de Expediente */}
            {selectedExpediente && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Revisión de Expediente: {selectedExpediente.id}</h3>
                                <p className="text-sm text-slate-500">{selectedExpediente.nombre} - {selectedExpediente.carrera}</p>
                            </div>
                            <button onClick={() => setSelectedExpediente(null)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                                <X />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Description style={{fontSize: 20}} /> Documentos Adjuntos
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {selectedExpediente?.documentos?.map((doc) => (
                                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${doc.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                            {doc.estado === 'aprobado' ? <CheckCircle /> : <FileCheck />}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 mb-1">{doc.nombre}</p>
                                            {doc.observaciones && (
                                                <p className="text-[10px] text-amber-600 font-medium mb-1 bg-amber-50 px-2 py-0.5 rounded w-fit italic">
                                                    Nota: {doc.observaciones}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-3">
                                                <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs text-blue-600 hover:underline font-medium">Ver PDF</a>
                                                {doc.estado !== 'aprobado' && (
                                                    <div className="flex gap-2">
                                                        <button 
                                                            onClick={() => {
                                                                notificationService.send('Vision AI', 'Escaneando documento para verificar CI...', 'info');
                                                                setTimeout(() => notificationService.send('Vision AI', `CI Detectada: ${selectedExpediente.cedula} (Coincidencia 100%)`, 'success'), 2000);
                                                            }}
                                                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                                                        >
                                                            🤖 Smart Scan
                                                        </button>
                                                        <button 
                                                            onClick={() => handleValidarDocumento(selectedExpediente.cedula, doc.id)}
                                                            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors"
                                                        >
                                                            ✓ Validar
                                                        </button>
                                                    </div>
                                                )}
                                                {doc.estado === 'aprobado' && (
                                                    <span className="text-[10px] font-bold text-emerald-600 italic">Validado</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                <h5 className="text-xs font-black text-amber-700 uppercase tracking-wider mb-3">Observaciones Rápidas (Para el Alumno)</h5>
                                <div className="flex flex-wrap gap-2">
                                    {['Documento ilegible', 'Cédula vencida', 'Falta firma/sello', 'Formato incorrecto', 'Documento incompleto'].map(obs => (
                                        <button 
                                            key={obs}
                                            onClick={() => {
                                                // Asumimos que queremos aplicar la nota al primer documento no validado o seleccionado
                                                // Para hacerlo pro, podríamos dejar que seleccionen el doc, pero por ahora
                                                // lo aplicaremos al expediente general o al que estén viendo.
                                                if (selectedExpediente) {
                                                    // Buscamos el primer doc pendiente
                                                    const firstDoc = selectedExpediente.documentos?.find(d => d.estado !== 'aprobado');
                                                    if (firstDoc) {
                                                        handleSaveObservation(selectedExpediente.cedula, firstDoc.id, obs);
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-white border border-amber-200 text-[10px] font-bold text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                                        >
                                            + {obs}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 bg-white rounded-b-2xl flex justify-between items-center">
                            {selectedExpediente.estado === 'aprobado' ? (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                                    <CheckCircle /> Expediente Aprobado
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Revise todos los documentos antes de aprobar.</p>
                            )}
                            
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedExpediente(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Cerrar
                                </button>
                                {selectedExpediente.estado === 'pendiente' && (
                                    <button 
                                        onClick={() => handleAprobarExpediente(selectedExpediente.id)}
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                                    >
                                        <Check /> Aprobar Expediente
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AcademicDashboard;
