import React, { useState } from 'react';
import { Person as User, Dashboard, Payments, AccountBalanceWallet, Assessment, Help, Logout, Search, Notifications, Settings, Add, TrendingUp, Schedule, Group, PersonAdd, FileDownload, Print, History, Mail, MoreVert, Visibility, Logout as LogoutIcon, CheckCircle, Warning, Description, Edit, UploadFile, AssignmentInd, Assignment } from '@mui/icons-material';
import MisDatosModule from './MisDatosModule';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '../services/NotificationService';

interface AcademicDashboardProps {
    user: { nombre: string; apellido: string; email: string; cedula: string; rol: string };
    onLogout: () => void;
}

interface Expediente {
    id: string;
    nombre: string;
    cedula: string;
    carrera: string;
    tipo: 'estudiante' | 'docente';
    fechaEnvio: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    documentos: {
        id: string;
        nombre: string;
        url: string;
        estado: 'pendiente' | 'aprobado';
    }[];
}

const AcademicDashboard: React.FC<AcademicDashboardProps> = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState<'admision' | 'dashboard' | 'nueva_inscripcion'>('admision');
    const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);

    const [expedientes, setExpedientes] = useState<Expediente[]>([
        {
            id: 'EXP-001',
            nombre: 'Juan Pérez',
            cedula: '4.555.666',
            carrera: 'Lic. en Administración de Empresas',
            tipo: 'estudiante',
            fechaEnvio: '2024-05-08',
            estado: 'pendiente',
            documentos: [
                { id: 'd1', nombre: 'Cédula de Identidad', url: '#', estado: 'pendiente' },
                { id: 'd2', nombre: 'Certificado de Nacimiento', url: '#', estado: 'pendiente' },
                { id: 'd3', nombre: 'Título de Bachiller', url: '#', estado: 'pendiente' },
            ]
        },
        {
            id: 'EXP-002',
            nombre: 'María Gómez',
            cedula: '3.444.555',
            carrera: 'Lic. en Enfermería',
            tipo: 'estudiante',
            fechaEnvio: '2024-05-07',
            estado: 'aprobado',
            documentos: [
                { id: 'd4', nombre: 'Cédula de Identidad', url: '#', estado: 'aprobado' },
                { id: 'd5', nombre: 'Certificado de Nacimiento', url: '#', estado: 'aprobado' },
                { id: 'd6', nombre: 'Título de Bachiller', url: '#', estado: 'aprobado' },
            ]
        },
        {
            id: 'EXP-003',
            nombre: 'Dr. Carlos Ruiz',
            cedula: '2.111.222',
            carrera: 'Docente - Medicina',
            tipo: 'docente',
            fechaEnvio: '2024-05-08',
            estado: 'pendiente',
            documentos: [
                { id: 'd7', nombre: 'Cédula de Identidad', url: '#', estado: 'pendiente' },
                { id: 'd8', nombre: 'Título de Grado', url: '#', estado: 'pendiente' },
                { id: 'd9', nombre: 'Currículum Vitae', url: '#', estado: 'pendiente' },
            ]
        }
    ]);

    const handleAprobarExpediente = (id: string) => {
        setExpedientes(prev => prev.map(exp => 
            exp.id === id ? { 
                ...exp, 
                estado: 'aprobado', 
                documentos: exp.documentos.map(d => ({ ...d, estado: 'aprobado' })) 
            } : exp
        ));
        
        const exp = expedientes.find(e => e.id === id);
        if (exp) {
            notificationService.send(
                'Expediente Aprobado', 
                `El expediente de ${exp.nombre} ha sido validado correctamente. Se ha notificado al estudiante para proceder al pago.`,
                'success'
            );
        }
        
        setSelectedExpediente(null);
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
                                <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                                    <div className="relative w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize: 18}} />
                                        <input type="text" placeholder="Buscar por CI o nombre..." className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" />
                                    </div>
                                    <button className="flex items-center gap-2 px-3 py-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                                        <FilterList style={{fontSize: 18}} /> Filtrar
                                    </button>
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
                                        {expedientes.map((exp) => (
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
                                    <p className="text-sm font-medium text-slate-500 mb-1">Concurso Docente</p>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.filter(e => e.tipo === 'docente').length}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Postulaciones activas</p>
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
                                        {expedientes.slice(0, 3).map((exp, i) => (
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
                                {selectedExpediente.documentos.map((doc) => (
                                    <div key={doc.id} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                        <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                                            <FileCheck />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm font-bold text-slate-800 mb-1">{doc.nombre}</p>
                                            <a href={doc.url} className="text-xs text-blue-600 hover:underline font-medium">Ver documento PDF</a>
                                        </div>
                                    </div>
                                ))}
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
