import React, { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    CheckCircle2,
    Clock,
    User,
    ArrowLeft,
    Shield,
    AlertTriangle,
    Trash2,
    Wallet,
    Home,
    Users,
    Calendar,
    BarChart3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ExternalUserManager from './ExternalUserManager';
import DocumentPreviewModal from './DocumentPreviewModal';

interface PostulanteSubmission {
    id: string;
    nombre: string;
    apellido: string;
    cedula: string;
    carrera: string;
    fecha: string;
    estado_revision: 'pendiente' | 'verificado' | 'rechazado';
    foto?: string;
    correo: string;
    telefono: string;
    sede: string;
    tipo_usuario?: 'postulante' | 'concursante_docente';
}

interface AdminDashboardProps {
    onLogout: () => void;
    onViewDetail: (postulanteId: string) => void;
    onNavigatePagos?: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout, onViewDetail, onNavigatePagos }) => {
    const [view, setView] = useState<'main' | 'external'>('main');
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pendiente' | 'verificado'>('all');
    const [postulantes, setPostulantes] = useState<PostulanteSubmission[]>([
        { id: '001', nombre: 'Juan Carlos', apellido: 'Pérez González', cedula: '1.234.567', carrera: 'Lic. en Derecho', fecha: '2026-01-15', estado_revision: 'pendiente', correo: 'juan@email.com', telefono: '0991234567', sede: 'Santa Rosa' },
        { id: '002', nombre: 'María Elena', apellido: 'Rodríguez', cedula: '2.345.678', carrera: 'Lic. en Administración', fecha: '2026-01-14', estado_revision: 'verificado', correo: 'maria@email.com', telefono: '0992345678', sede: 'Santa Rosa' },
        { id: '003', nombre: 'Pedro Miguel', apellido: 'López', cedula: '3.456.789', carrera: 'Lic. en Ingeniería', fecha: '2026-01-13', estado_revision: 'pendiente', correo: 'pedro@email.com', telefono: '0993456789', sede: 'Encarnación' },
    ]);
    const [loading, setLoading] = useState(false);
    const [selectedPostulante, setSelectedPostulante] = useState<PostulanteSubmission | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');

    const filteredPostulantes = postulantes.filter(postulante => {
        const matchesSearch = `${postulante.nombre} ${postulante.apellido}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            postulante.cedula.includes(searchTerm);
        const matchesFilter = filter === 'all' || postulante.estado_revision === filter;
        return matchesSearch && matchesFilter;
    });

    const stats = {
        total: postulantes.length,
        pendientes: postulantes.filter(s => s.estado_revision === 'pendiente').length,
        verificados: postulantes.filter(s => s.estado_revision === 'verificado').length,
    };

    return (
        <div className="w-full">
            <AnimatePresence mode="wait">
                {view === 'main' ? (
                    <motion.div
                        key="main"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="space-y-8"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] rounded-[var(--radius-2xl)] p-10 mb-10 relative overflow-hidden shadow-premium">
                            <div className="absolute right-0 top-0 w-80 h-80 bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                            <div className="relative flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <button onClick={onLogout} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                                        <ArrowLeft size={24} />
                                    </button>
                                    <div>
                                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Panel Administrativo</h2>
                                        <p className="text-sm text-white/60 font-medium tracking-widest uppercase">Secretaría de Tecnologías • UNAMIS</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <button 
                                        onClick={() => setView('external')}
                                        className="px-6 py-3 bg-white/10 backdrop-blur-md text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/20 transition-all border border-white/10"
                                    >
                                        <Shield className="inline-block mr-2" size={16} /> Cuentas Externas
                                    </button>
                                    <button onClick={onNavigatePagos} className="px-6 py-3 bg-white text-[var(--primary)] rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-white/90 transition-all shadow-xl shadow-black/10">
                                        Gestión de Pagos
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-white p-6 rounded-2xl shadow-card">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                        <Users size={20} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">Total</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">{stats.total}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-card">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                        <Clock size={20} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">Pendientes</span>
                                </div>
                                <p className="text-3xl font-black text-amber-600">{stats.pendientes}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-card">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                        <CheckCircle2 size={20} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">Verificados</span>
                                </div>
                                <p className="text-3xl font-black text-emerald-600">{stats.verificados}</p>
                            </div>
                            <div className="bg-white p-6 rounded-2xl shadow-card">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                        <Calendar size={20} />
                                    </div>
                                    <span className="text-xs text-slate-400 font-medium">Período</span>
                                </div>
                                <p className="text-3xl font-black text-slate-800">2026</p>
                            </div>
                        </div>

                        {/* Search & Filter */}
                        <div className="bg-white rounded-[var(--radius-xl)] p-5 mb-8 shadow-card flex flex-col md:flex-row gap-6 items-center justify-between border border-[var(--border-subtle)]">
                            <div className="flex-1 max-w-lg relative group">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-light)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre, apellido o cédula..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-14 pr-6 py-4 bg-[var(--background)] rounded-2xl border-0 focus:ring-4 focus:ring-[var(--primary-50)] transition-all font-medium text-sm"
                                />
                            </div>
                            <div className="flex items-center gap-2 p-1.5 bg-[var(--background)] rounded-2xl">
                                {(['all', 'pendiente', 'verificado'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFilter(f)}
                                        className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.15em] transition-all ${
                                            filter === f 
                                                ? 'bg-white text-[var(--primary)] shadow-sm' 
                                                : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]'
                                        }`}
                                    >
                                        {f === 'all' ? 'Todos' : f}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Table */}
                        <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-slate-50">
                                    <tr>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Postulante</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Carrera</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Estado</th>
                                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-400 uppercase">Fecha</th>
                                        <th className="px-6 py-4 text-right text-xs font-bold text-slate-400 uppercase">Acción</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-50">
                                    {filteredPostulantes.map((postulante) => (
                                        <tr key={postulante.id} className="hover:bg-slate-50/50">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] text-white flex items-center justify-center font-bold text-sm">
                                                        {postulante.nombre?.[0]}{postulante.apellido?.[0]}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2">
                                                            <p className="font-semibold text-slate-800">{postulante.nombre} {postulante.apellido}</p>
                                                            {postulante.tipo_usuario === 'concursante_docente' ? (
                                                                <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[8px] font-black uppercase rounded border border-blue-100">Docente</span>
                                                            ) : (
                                                                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase rounded border border-emerald-100">Postulante</span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-slate-400">{postulante.cedula}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600">{postulante.carrera}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold ${
                                                    postulante.estado_revision === 'verificado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                                }`}>
                                                    {postulante.estado_revision}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-400">{postulante.fecha}</td>
                                            <td className="px-6 py-4 text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    {postulante.foto && (
                                                        <button
                                                            onClick={() => {
                                                                setPreviewUrl(postulante.foto!.startsWith('http') ? postulante.foto! : `${window.location.origin}/${postulante.foto}`);
                                                                setPreviewTitle(`Foto — ${postulante.nombre} ${postulante.apellido}`);
                                                            }}
                                                            title="Ver foto del postulante"
                                                            className="p-2 bg-blue-50 text-blue-500 rounded-lg hover:bg-blue-100 transition-colors"
                                                        >
                                                            <Eye size={16} />
                                                        </button>
                                                    )}
                                                    <button 
                                                        onClick={() => onViewDetail(postulante.id)}
                                                        className="px-4 py-2 bg-[var(--primary)] text-white rounded-lg text-xs font-bold hover:bg-[var(--primary-dark)]"
                                                    >
                                                        Ver
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                ) : (
                    <ExternalUserManager onBack={() => setView('main')} />
                )}
            </AnimatePresence>

            {/* Document Preview Modal — Ojito */}
            <DocumentPreviewModal
                isOpen={!!previewUrl}
                onClose={() => setPreviewUrl(null)}
                url={previewUrl || ''}
                title={previewTitle}
            />
        </div>
    );
};

export default AdminDashboard;