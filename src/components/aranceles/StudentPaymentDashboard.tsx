import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Wallet, Clock, Calendar, CheckCircle2, XCircle, Download,
    Eye, Plus, AlertTriangle, FileText, TrendingUp, Shield,
    Info, User, School, X, Upload, ChevronRight, Bell, LogOut, RefreshCw
} from 'lucide-react';
import { FinanceService, Payment } from '../../services/FinanceService';
import { API_BASE_URL } from '../../services/ApiService';
import DocumentPreviewModal from '../DocumentPreviewModal';

interface Props {
    studentName?: string;
    studentCedula?: string;
    carrera?: string;
    onNavigateUpload?: () => void;
    onLogout?: () => void;
}

const StudentPaymentDashboard: React.FC<Props> = ({
    studentName = 'Estudiante',
    studentCedula,
    carrera = 'Carrera no especificada',
    onNavigateUpload,
    onLogout
}) => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [selected, setSelected] = useState<Payment | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const loadPayments = async () => {
        if (!studentCedula) return;
        setIsLoading(true);
        try {
            const data = await FinanceService.getPagos();
            // Filtrar por la cédula del estudiante logueado
            const studentPayments = data.filter(p => p.postulante_cedula === studentCedula);
            setPayments(studentPayments);
        } catch (error) {
            console.error('Error loading student payments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadPayments();
    }, [studentCedula]);

    const totalPaid = payments.filter(p => p.estado === 'verificado').reduce((s, p) => s + p.monto, 0);
    const pendingCount = payments.filter(p => p.estado === 'pendiente').length;
    const rejectedCount = payments.filter(p => p.estado === 'rechazado').length;

    const formatGs = (n: number) => new Intl.NumberFormat('es-PY').format(n) + ' Gs.';

    const estadoBadge = (estado: Payment['estado']) => {
        if (estado === 'verificado') return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">
                <CheckCircle2 size={10} fill="currentColor" /> Verificado
            </span>
        );
        if (estado === 'pendiente') return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-[10px] font-black uppercase tracking-wider">
                <Clock size={10} /> Pendiente
            </span>
        );
        return (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-[10px] font-black uppercase tracking-wider">
                <XCircle size={10} /> Rechazado
            </span>
        );
    };

    return (
        <div className="w-full space-y-8">
            {/* Header */}
            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-8 bg-[#002f6c] rounded-full" />
                        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Mis Pagos</h2>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pl-3">
                        <span className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                            <User size={14} className="text-[#002f6c]" /> {studentName}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="flex items-center gap-2 text-slate-500 text-sm">
                            <School size={14} className="text-[#002f6c]" /> {carrera}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-slate-300" />
                        <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">CI: {studentCedula}</span>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowUploadModal(true)}
                        className="flex items-center gap-2 px-5 py-3 bg-[#002f6c] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#002f6c]/25 hover:bg-[#001d4a] active:scale-95 transition-all"
                    >
                        <Plus size={18} /> Subir Comprobante
                    </button>
                    <button onClick={loadPayments} className="p-3 bg-slate-100 text-slate-500 rounded-2xl hover:bg-slate-200 transition-all">
                        <RefreshCw size={18} className={isLoading ? 'animate-spin' : ''} />
                    </button>
                </div>
            </section>

            {/* Summary Bento */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:bg-[#002f6c] transition-all duration-300 cursor-default">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-red-50 rounded-xl group-hover:bg-white/15 transition-colors">
                            <Wallet size={20} className="text-[#002f6c] group-hover:text-white transition-colors" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white/60 transition-colors">Total Pagado</span>
                    </div>
                    <p className="text-2xl font-black text-slate-900 group-hover:text-white transition-colors tracking-tighter">{formatGs(totalPaid)}</p>
                    <p className="text-xs text-slate-400 mt-1 group-hover:text-white/70 transition-colors">Gestión Institucional</p>
                </div>

                <div className="bg-white p-6 rounded-3xl border-l-4 border-l-amber-400 border border-slate-100 shadow-sm">
                    <div className="flex justify-between items-start mb-4">
                        <div className="p-2 bg-amber-50 rounded-xl">
                            <Clock size={20} className="text-amber-500" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-300">Pendientes</span>
                    </div>
                    <p className="text-3xl font-black text-slate-900 tracking-tighter">{pendingCount}</p>
                    <p className="text-xs text-amber-500 font-bold mt-1">En proceso de verificación</p>
                </div>

                <div className="bg-[#002f6c] p-6 rounded-3xl shadow-lg relative overflow-hidden">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <Shield size={80} className="text-white" />
                    </div>
                    <div className="flex justify-between items-start mb-4 relative">
                        <div className="p-2 bg-white/15 rounded-xl">
                            <Shield size={20} className="text-white" />
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">Estado Académico</span>
                    </div>
                    <p className="text-xl font-black text-white tracking-tighter relative">Habilitado</p>
                    <p className="text-xs text-white/70 mt-1 relative">Sin deudas vencidas</p>
                </div>
            </section>

            {/* Warnings */}
            {rejectedCount > 0 && (
                <div className="flex items-start gap-4 p-5 bg-red-50 border border-red-100 rounded-2xl">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-500 shadow-sm flex-shrink-0">
                        <AlertTriangle size={20} />
                    </div>
                    <div>
                        <p className="font-black text-red-700 text-sm">Tienes {rejectedCount} pago(s) rechazado(s)</p>
                        <p className="text-xs text-red-500 mt-1 font-medium">Revisa los detalles y vuelve a subir el comprobante correcto.</p>
                    </div>
                </div>
            )}

            {/* Payment History */}
            <section>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-black text-slate-900 uppercase tracking-tighter">Historial de Pagos</h3>
                </div>

                <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="animate-spin text-[#002f6c]" size={32} />
                            <p className="text-slate-500 font-medium">Cargando tus pagos...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="pl-8 pr-4 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Fecha</th>
                                    <th className="px-4 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em]">Concepto</th>
                                    <th className="px-4 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Monto</th>
                                    <th className="px-4 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-center">Estado</th>
                                    <th className="pl-4 pr-8 py-5 text-[10px] font-black text-slate-300 uppercase tracking-[0.3em] text-right">Acción</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {payments.map((p) => (
                                    <motion.tr
                                        key={p.id}
                                        whileHover={{ backgroundColor: 'rgb(248 250 252)' }}
                                        className="group cursor-pointer transition-colors"
                                        onClick={() => setSelected(p)}
                                    >
                                        <td className="pl-8 pr-4 py-5 text-sm font-medium text-slate-600">{new Date(p.fecha_registro).toLocaleDateString()}</td>
                                        <td className="px-4 py-5">
                                            <p className="text-sm font-black text-[#002f6c]">{p.concepto}</p>
                                            <p className="text-[10px] text-slate-400 font-medium">{p.nombre} {p.apellido}</p>
                                        </td>
                                        <td className="px-4 py-5 text-right">
                                            <span className="text-sm font-black text-slate-900 font-mono tracking-tighter">{new Intl.NumberFormat('es-PY').format(p.monto)}</span>
                                        </td>
                                        <td className="px-4 py-5 text-center">{estadoBadge(p.estado)}</td>
                                        <td className="pl-4 pr-8 py-5 text-right">
                                            <button className="text-[#002f6c] p-2 rounded-xl hover:bg-red-50 transition-colors">
                                                <Eye size={18} />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-20 text-center text-slate-400 italic">No tienes pagos registrados aún.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </section>

            {/* Payment Detail Modal */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setSelected(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-md rounded-3xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 tracking-tighter">Detalle de Pago</h3>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">ID-{selected.id}</p>
                                </div>
                                <button onClick={() => setSelected(null)} className="w-10 h-10 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors">
                                    <X size={18} />
                                </button>
                            </div>
                            <div className="p-6 space-y-5">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Fecha</p>
                                        <p className="text-sm font-black text-slate-800">{new Date(selected.fecha_registro).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Estado</p>
                                        {estadoBadge(selected.estado)}
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Concepto</p>
                                        <p className="text-sm font-black text-slate-800">{selected.concepto}</p>
                                    </div>
                                    <div className="col-span-2">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Monto</p>
                                        <p className="text-3xl font-black text-[#002f6c] tracking-tighter">{formatGs(selected.monto)}</p>
                                    </div>
                                </div>
                                {selected.comprobante_url && (
                                    <div className="mt-4">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-2">Comprobante adjunto</p>
                                        <div 
                                            onClick={() => {
                                                setPreviewUrl(selected.comprobante_url || null);
                                                setPreviewTitle(selected.concepto);
                                            }}
                                            className="relative group cursor-pointer overflow-hidden rounded-xl border border-slate-100 shadow-sm max-h-48 bg-slate-50 flex items-center justify-center"
                                        >
                                            <img 
                                                src={selected.comprobante_url.startsWith('http') ? selected.comprobante_url : `${API_BASE_URL}/${selected.comprobante_url}`} 
                                                alt="Comprobante" 
                                                className="w-full max-h-48 object-contain"
                                            />
                                            <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold gap-2">
                                                <Eye size={16} /> Ver en pantalla completa
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Upload Reminder Modal */}
            <AnimatePresence>
                {showUploadModal && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            onClick={() => setShowUploadModal(false)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-sm rounded-3xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="p-8 text-center">
                                <div className="w-16 h-16 bg-red-50 rounded-3xl flex items-center justify-center mx-auto mb-6 text-[#002f6c]">
                                    <Upload size={32} />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 tracking-tighter mb-2">Registrar Pago</h3>
                                <p className="text-sm text-slate-500 mb-8 leading-relaxed">¿Deseas subir un nuevo comprobante de pago para su verificación?</p>
                                <button
                                    onClick={() => { setShowUploadModal(false); onNavigateUpload?.(); }}
                                    className="w-full p-4 bg-[#002f6c] text-white rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[#001d4a] transition-colors"
                                >
                                    Ir al Formulario <ChevronRight size={18} />
                                </button>
                                <button onClick={() => setShowUploadModal(false)} className="w-full p-3 mt-3 text-slate-400 text-sm font-bold hover:text-slate-600 transition-colors">
                                    Cancelar
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            <DocumentPreviewModal 
                isOpen={!!previewUrl} 
                onClose={() => setPreviewUrl(null)} 
                url={previewUrl || ''} 
                title={previewTitle} 
            />
        </div>
    );
};

export default StudentPaymentDashboard;
