import React, { useState, useEffect } from 'react';
import {
    Wallet,
    Clock,
    CheckCircle2,
    XCircle,
    Search,
    Filter,
    ArrowRight,
    Download,
    Eye,
    Trash2,
    Plus,
    AlertTriangle,
    X,
    DollarSign,
    TrendingUp,
    FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import AppButton from './ui/AppButton';
import AppInput from './ui/AppInput';
import DocumentPreviewModal from './DocumentPreviewModal';
import { fetchApi } from '../services/ApiService';
import { FinanceService } from '../services/FinanceService';

interface Pago {
    id: number;
    postulante_cedula: string;
    nombre?: string;
    apellido?: string;
    concepto: string;
    monto: number;
    comprobante_url?: string;
    estado: 'pendiente' | 'verificado' | 'rechazado';
    observaciones?: string;
    fecha_pago?: string;
    fecha_registro: string;
    tipo_usuario?: string;
}

interface Stats {
    total: number;
    pendientes: number;
    verificados: number;
    rechazados: number;
    total_recaudado: number;
}

interface PaymentsDashboardProps {
    onLogout: () => void;
}

const PaymentsDashboard: React.FC<PaymentsDashboardProps> = ({ onLogout }) => {
    const [pagos, setPagos] = useState<Pago[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState<'all' | 'pendiente' | 'verificado' | 'rechazado'>('all');
    const [selectedPago, setSelectedPago] = useState<Pago | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState('');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [pagosData, statsData] = await Promise.all([
                FinanceService.getPagos(),
                fetchApi('stats=1')
            ]);
            
            if (Array.isArray(pagosData)) setPagos(pagosData);
            if (statsData.total !== undefined) setStats(statsData);
        } catch (err) {
            console.error("Error cargando datos:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id: number, estado: string, observaciones: string = '') => {
        setIsSaving(true);
        try {
            const data = await fetchApi('', {
                method: 'POST',
                body: JSON.stringify({ id, estado, observaciones })
            });
            if (data.status === 'success') {
                loadData();
                setSelectedPago(null);
            }
        } catch (err) {
            console.error("Error:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeletePago = async (id: number) => {
        if (!confirm('¿Eliminar este pago?')) return;
        try {
            const formData = new FormData();
            formData.append('delete_pago', '1');
            formData.append('id', id.toString());

            await fetchApi('', {
                method: 'POST',
                body: formData
            });
            loadData();
        } catch (err) {
            console.error("Error:", err);
        }
    };

    const filteredPagos = pagos.filter(pago => {
        const matchesSearch = 
            `${pago.nombre || ''} ${pago.apellido || ''}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
            pago.postulante_cedula.includes(searchTerm) ||
            pago.concepto.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filter === 'all' || pago.estado === filter;
        return matchesSearch && matchesFilter;
    });

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY').format(amount);
    };

    return (
        <div className="w-full">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-12">
                <div className="flex items-center gap-6">
                    <button onClick={onLogout} className="w-12 h-12 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors">
                        <ArrowRight size={18} className="rotate-180" />
                    </button>
                    <div>
                        <h2 className="text-3xl font-black text-slate-900 tracking-tighter uppercase">
                            Gestión de Pagos
                        </h2>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Sede Santa Rosa &bull; Tesorería</p>
                    </div>
                </div>

                <div className="flex items-center gap-4 p-3 bg-white rounded-3xl border border-slate-200 shadow-sm border-l-4 border-l-success">
                    <div className="text-right">
                        <p className="text-sm font-black text-slate-800 tabular-nums uppercase tracking-tight">Tesorería UNAMIS</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mt-1">Panel Financiero</p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-success text-white flex items-center justify-center font-black text-sm shadow-lg shadow-success/20">
                        $
                    </div>
                </div>
            </header>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <div className="p-8 bg-white rounded-[2rem] border border-slate-100 shadow-premium">
                    <div className="flex justify-between items-start mb-4">
                        <Wallet size={24} className="text-slate-900" strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Total</span>
                    </div>
                    <p className="text-4xl font-black tracking-tighter text-slate-900 mb-1">{stats?.total || 0}</p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Registros</p>
                </div>

                <div className="p-8 bg-amber-50/50 rounded-[2rem] border border-amber-100/50">
                    <div className="flex justify-between items-start mb-4">
                        <Clock size={24} className="text-amber-600" strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Pendientes</span>
                    </div>
                    <p className="text-4xl font-black tracking-tighter text-amber-600 mb-1">{stats?.pendientes || 0}</p>
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-[0.2em]">Por Verificar</p>
                </div>

                <div className="p-8 bg-success-soft/30 rounded-[2rem] border border-success/10">
                    <div className="flex justify-between items-start mb-4">
                        <CheckCircle2 size={24} className="text-success" strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-success/40">Verificados</span>
                    </div>
                    <p className="text-4xl font-black tracking-tighter text-success mb-1">{stats?.verificados || 0}</p>
                    <p className="text-[10px] font-bold text-success/60 uppercase tracking-[0.2em]">Aprobados</p>
                </div>

                <div className="p-8 bg-primary-soft rounded-[2rem] border border-primary/10">
                    <div className="flex justify-between items-start mb-4">
                        <TrendingUp size={24} className="text-primary" strokeWidth={2.5} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary/30">Recaudación</span>
                    </div>
                    <p className="text-3xl font-black tracking-tighter text-primary mb-1">
                        {formatCurrency(stats?.total_recaudado || 0)}
                    </p>
                    <p className="text-[10px] font-bold text-primary/60 uppercase tracking-[0.2em]">PYG Total</p>
                </div>
            </div>

            {/* Main Table */}
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="flex-1 max-w-lg">
                        <AppInput
                            placeholder="Buscar por nombre, cédula o concepto..."
                            icon={Search}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="flex items-center gap-1.5 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                        {(['all', 'pendiente', 'verificado', 'rechazado'] as const).map((f) => (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                    filter === f ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-500 hover:bg-slate-100'
                                }`}
                            >
                                {f === 'all' ? 'Todos' : f}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="overflow-x-auto">
                    {loading ? (
                        <div className="p-32 text-center">
                            <div className="w-12 h-12 border-4 border-slate-100 border-t-primary rounded-full animate-spin mx-auto mb-6"></div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Cargando movimientos...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50/50">
                                <tr>
                                    <th className="pl-12 pr-6 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Fecha</th>
                                    <th className="px-6 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Postulante</th>
                                    <th className="px-6 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Concepto</th>
                                    <th className="px-6 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Monto</th>
                                    <th className="px-6 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Estado</th>
                                    <th className="pl-6 pr-12 py-8 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPagos.map((pago) => (
                                    <tr key={pago.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="pl-12 pr-6 py-7">
                                            <div className="text-xs font-bold text-slate-500">
                                                <div>{new Date(pago.fecha_registro).toLocaleDateString('es-ES')}</div>
                                                <div className="text-[10px] text-slate-300">{new Date(pago.fecha_registro).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7">
                                            <div>
                                                <p className="text-sm font-black text-slate-800 uppercase tracking-tight">
                                                    {pago.nombre} {pago.apellido}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                                        {pago.postulante_cedula}
                                                    </span>
                                                    {pago.tipo_usuario && (
                                                         <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                                                             pago.tipo_usuario?.includes('concursante_docente') && pago.tipo_usuario?.includes('auxiliar_docente')
                                                                 ? 'bg-indigo-100 text-indigo-700'
                                                                 : pago.tipo_usuario?.includes('concursante_docente') 
                                                                     ? 'bg-purple-100 text-purple-700' 
                                                                     : (pago.tipo_usuario?.includes('auxiliar_docente') ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-blue-100 text-blue-700')
                                                         }`}>
                                                             {pago.tipo_usuario?.includes('concursante_docente') && pago.tipo_usuario?.includes('auxiliar_docente')
                                                                 ? 'Docente y Auxiliar'
                                                                 : pago.tipo_usuario?.includes('concursante_docente') ? 'Docente Encargado' : (pago.tipo_usuario?.includes('auxiliar_docente') ? 'Auxiliar' : 'Postulante')}
                                                         </span>
                                                     )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-7">
                                            <span className="text-sm font-bold text-slate-700">{pago.concepto}</span>
                                        </td>
                                        <td className="px-6 py-7">
                                            <span className="text-lg font-black text-primary tabular-nums tracking-tighter">
                                                {formatCurrency(pago.monto)}
                                            </span>
                                            <span className="text-[10px] font-bold text-slate-400 ml-1">PYG</span>
                                        </td>
                                        <td className="px-6 py-7">
                                            <span className={`
                                                inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest
                                                ${pago.estado === 'verificado'
                                                    ? 'bg-success-soft text-success border border-success/10'
                                                    : pago.estado === 'rechazado'
                                                        ? 'bg-danger-soft text-danger border border-danger/10'
                                                        : 'bg-amber-50 text-amber-600 border border-amber-100'}
                                            `}>
                                                <div className={`w-1.5 h-1.5 rounded-full ${
                                                    pago.estado === 'verificado' ? 'bg-success' : 
                                                    pago.estado === 'rechazado' ? 'bg-danger' : 'bg-amber-500 animate-pulse'
                                                }`} />
                                                {pago.estado}
                                            </span>
                                        </td>
                                        <td className="pl-6 pr-12 py-7 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <AppButton
                                                    variant="ghost"
                                                    size="sm"
                                                    icon={Eye}
                                                    onClick={() => {
                                                        if (pago.comprobante_url) {
                                                            const url = pago.comprobante_url.startsWith('http')
                                                                ? pago.comprobante_url
                                                                : `${window.location.origin}/${pago.comprobante_url}`;
                                                            setPreviewUrl(url);
                                                            setPreviewTitle(`Comprobante — ${pago.nombre || pago.postulante_cedula} — ${pago.concepto}`);
                                                        } else {
                                                            setSelectedPago(pago);
                                                        }
                                                    }}
                                                />
                                                {pago.comprobante_url && (
                                                    <button
                                                        onClick={() => {
                                                            const url = pago.comprobante_url!.startsWith('http')
                                                                ? pago.comprobante_url!
                                                                : `${window.location.origin}/${pago.comprobante_url}`;
                                                            setPreviewUrl(url);
                                                            setPreviewTitle(`Comprobante — ${pago.nombre || pago.postulante_cedula}`);
                                                        }}
                                                        title="Ver comprobante"
                                                        className="w-10 h-10 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-100 transition-colors"
                                                    >
                                                        <Eye size={16} />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDeletePago(pago.id)}
                                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-danger/10 hover:text-danger transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}

                    {!loading && filteredPagos.length === 0 && (
                        <div className="p-32 text-center">
                            <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mb-8 border border-slate-100">
                                <DollarSign size={40} />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 tracking-tighter mb-2 uppercase">Sin Movimientos</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">No hay registros en el período seleccionado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detail Modal */}
            <AnimatePresence>
                {selectedPago && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedPago(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                                        Detalle de Pago
                                    </h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                        #{selectedPago.id} &bull; {selectedPago.postulante_cedula}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setSelectedPago(null)}
                                    className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-slate-100 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Postulante</p>
                                        <p className="text-lg font-black text-slate-800">{selectedPago.nombre} {selectedPago.apellido}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Monto</p>
                                        <p className="text-2xl font-black text-primary">
                                            {formatCurrency(selectedPago.monto)} <span className="text-xs">PYG</span>
                                        </p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Concepto</p>
                                        <p className="text-sm font-bold text-slate-700">{selectedPago.concepto}</p>
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 rounded-2xl">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Dictamen</p>
                                    <div className="flex gap-2 mb-4">
                                        {(['pendiente', 'verificado', 'rechazado'] as const).map((s) => (
                                            <button
                                                key={s}
                                                onClick={() => setSelectedPago({ ...selectedPago, estado: s })}
                                                className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                                    selectedPago.estado === s 
                                                        ? s === 'verificado' ? 'bg-success text-white' 
                                                        : s === 'rechazado' ? 'bg-danger text-white' 
                                                        : 'bg-primary text-white'
                                                        : 'bg-white text-slate-400 border border-slate-100'
                                                }`}
                                            >
                                                {s}
                                            </button>
                                        ))}
                                    </div>

                                    <textarea
                                        value={selectedPago.observaciones || ''}
                                        onChange={(e) => setSelectedPago({ ...selectedPago, observaciones: e.target.value })}
                                        className="w-full h-24 p-4 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 outline-none focus:border-primary resize-none"
                                        placeholder="Observaciones..."
                                    />

                                    <AppButton
                                        fullWidth
                                        onClick={() => handleUpdateStatus(selectedPago.id, selectedPago.estado, selectedPago.observaciones)}
                                        disabled={isSaving}
                                        loading={isSaving}
                                        className="mt-4"
                                    >
                                        Guardar Dictamen
                                    </AppButton>
                                </div>
                            </div>
                        </motion.div>
                    </div>
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

export default PaymentsDashboard;