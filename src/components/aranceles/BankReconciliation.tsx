import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Calendar, 
    ChevronDown, 
    Activity, 
    CheckCircle2, 
    Eye, 
    ChevronLeft, 
    ChevronRight, 
    TrendingUp, 
    AlertTriangle, 
    RefreshCw, 
    Bot, 
    Send, 
    X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinanceService, ReconciliationItem } from '../../services/FinanceService';
import DocumentPreviewModal from '../DocumentPreviewModal';

const BankReconciliation: React.FC = () => {
    const [systemRecords, setSystemRecords] = useState<ReconciliationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');
    const [messageInput, setMessageInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'bot', text: '¡Hola! Soy tu asistente de Inteligencia Artificial para conciliación. Estoy listo para ayudarte a cuadrar las cuentas.' }
    ]);
    const [stats, setStats] = useState({
        recaudacion_hoy: 0,
        pendientes_conciliar: 0,
        registrados_hoy: 0
    });

    const loadRecords = async () => {
        setIsLoading(true);
        try {
            const [data, statsData] = await Promise.all([
                FinanceService.getReconciliationQueue(),
                FinanceService.getFinanceStats()
            ]);
            setSystemRecords(data);
            setStats(statsData);
            
            const pendingCount = data.filter(r => r.estado === 'pendiente' && r.match).length;
            if (pendingCount > 0 && chatMessages.length === 1) {
                setChatMessages(prev => [...prev, { 
                    role: 'bot', 
                    text: `He detectado ${pendingCount} transacciones que coinciden con pagos en el sistema. ¿Quieres que las conciliemos automáticamente?` 
                }]);
                setIsBotOpen(true);
            }
        } catch (error) {
            console.error('Error loading records:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRecords();
    }, []);

    const handleImport = async () => {
        setIsImporting(true);
        try {
            await FinanceService.importDemoTransactions();
            await loadRecords();
            setChatMessages(prev => [...prev, { 
                role: 'bot', 
                text: 'Se han importado registros del estado bancario (Demo). Ahora puedes ver los matches detectados por la IA.' 
            }]);
        } catch (err) {
            console.error("Error importing demo data:", err);
        } finally {
            setIsImporting(false);
        }
    };

    const handleApproveAll = async () => {
        try {
            const result = await FinanceService.botAutoReconcile();
            await loadRecords();
            setChatMessages(prev => [...prev, { 
                role: 'bot', 
                text: `¡Hecho! El Bot IA ha procesado los registros. Se han conciliado automáticamente ${result.conciliated_count} pagos con alta confianza.` 
            }]);
        } catch (e) {
            console.error('Error in bot auto-reconciliation:', e);
            setChatMessages(prev => [...prev, { role: 'bot', text: 'Lo siento, ocurrió un error al intentar conciliar automáticamente.' }]);
        }
    };

    const handleSingleReconcile = async (pago_id: number, transaccion_id: number) => {
        try {
            await FinanceService.reconcile(pago_id, transaccion_id);
            await loadRecords();
        } catch (e) {
            alert('Error al conciliar el registro.');
        }
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!messageInput.trim()) return;
        
        setChatMessages(prev => [...prev, { role: 'user', text: messageInput }]);
        const userMsg = messageInput.toLowerCase();
        setMessageInput('');

        setTimeout(() => {
            let botReply = 'Entendido. Estoy a tu disposición.';
            if (userMsg.includes('si') || userMsg.includes('aprobar') || userMsg.includes('conciliar')) {
                handleApproveAll();
                return;
            } else if (userMsg.includes('discrepancia')) {
                botReply = 'He detectado transacciones sin match claro. ¿Deseas revisarlas manualmente?';
            }
            setChatMessages(prev => [...prev, { role: 'bot', text: botReply }]);
        }, 1000);
    };

    return (
        <div className="w-full max-w-7xl mx-auto pb-12 pt-4">
            {/* Title Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div className="max-w-2xl">
                    <h1 className="text-3xl md:text-[32px] font-black text-[#001738] tracking-tight mb-3">
                        Conciliación de Cuentas
                    </h1>
                    <p className="text-[14px] text-slate-600 font-medium leading-relaxed">
                        Cruce de información entre los registros administrativos institucionales y los estados bancarios externos para asegurar la integridad financiera.
                    </p>
                </div>
                <button 
                    onClick={handleImport}
                    disabled={isImporting}
                    className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#002f6c] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#002f6c]/20 hover:bg-[#001738] transition-all shrink-0 whitespace-nowrap disabled:opacity-70"
                >
                    {isImporting ? <RefreshCw className="animate-spin" size={18} /> : <FileText size={18} />}
                    {isImporting ? 'Procesando...' : 'Importar Estado Bancario'}
                </button>
            </div>

            {/* Filters Area */}
            <div className="bg-[#f8fafc] border border-slate-100 rounded-[1.5rem] p-6 mb-8 flex flex-wrap items-end gap-6">
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Rango de Fecha</label>
                    <div className="relative">
                        <input 
                            type="text" 
                            readOnly
                            value="Hoy, 08 de Mayo 2026"
                            className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 outline-none cursor-pointer"
                        />
                        <Calendar className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Sede</label>
                    <div className="relative">
                        <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer">
                            <option>Sede Central</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
                <div className="flex-1 min-w-[200px]">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Carrera / Facultad</label>
                    <div className="relative">
                        <select className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-700 outline-none appearance-none cursor-pointer">
                            <option>Todas las Facultades</option>
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                    </div>
                </div>
                <div className="min-w-[150px] pb-3">
                    <button className="text-[11px] font-black text-[#002f6c] uppercase tracking-widest hover:underline">
                        Limpiar Filtros
                    </button>
                </div>
            </div>

            {/* Main Table Card */}
            <div className="bg-white rounded-[1.5rem] shadow-sm border border-slate-100 overflow-hidden mb-8">
                {/* Table Header */}
                <div className="bg-[#f8fafc] px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity size={20} className="text-[#002f6c]" />
                        <h3 className="font-bold text-[#001738] text-base">Registros Pendientes de Verificación</h3>
                    </div>
                    <span className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {systemRecords.length} Registros Encontrados
                    </span>
                </div>

                {/* Table Content */}
                <div className="overflow-x-auto">
                    {isLoading ? (
                        <div className="p-20 flex flex-col items-center justify-center gap-4">
                            <RefreshCw className="animate-spin text-[#002f6c]" size={32} />
                            <p className="text-slate-500 font-medium">Cargando registros...</p>
                        </div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Fecha</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Postulante / Detalle</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Banco</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ref. Pago</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Monto</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Estado</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {systemRecords.map((row) => (
                                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.match ? 'bg-emerald-50/30' : ''}`}>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-nowrap">{row.fecha}</td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-sm font-bold text-[#001738]">{row.match ? row.match.postulante : 'No identificado'}</p>
                                                    <p className="text-[11px] text-slate-400 mt-0.5">{row.detalle}</p>
                                                </div>
                                                {row.match && (
                                                    <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle2 size={10} /> IA Match ({row.match.puntaje}%)
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-sm font-medium text-slate-600 whitespace-nowrap">{row.banco}</td>
                                        <td className="px-6 py-5">
                                            <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-sm font-medium text-slate-600">
                                                <FileText size={14} className="text-slate-400" />
                                                {row.match ? `PAGO-${row.match.pago_id}` : 'SIN REF'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right font-bold text-[#001738] text-[15px] whitespace-nowrap">
                                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(row.monto)}
                                        </td>
                                        <td className="px-6 py-5 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${row.estado === 'pendiente' ? 'bg-[#a37c58]' : row.estado === 'conciliado' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${row.estado === 'pendiente' ? 'text-[#a37c58]' : row.estado === 'conciliado' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {row.estado}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => {
                                                        if (row.match && row.match.comprobante_url) {
                                                            setPreviewUrl(row.match.comprobante_url);
                                                            setPreviewTitle(`Comprobante - ${row.match.postulante}`);
                                                        } else {
                                                            alert('Esta transacción no tiene comprobante adjunto o aún no ha sido vinculada con un pago.');
                                                        }
                                                    }}
                                                    disabled={!row.match?.comprobante_url}
                                                    className={`${row.match?.comprobante_url ? 'text-[#002f6c] hover:text-[#001738] hover:scale-110' : 'text-slate-300 cursor-not-allowed'} transition-all`}
                                                    title={row.match?.comprobante_url ? 'Ver Comprobante Cargado' : 'Sin comprobante disponible'}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => row.match && handleSingleReconcile(row.match.pago_id, row.id)}
                                                    disabled={row.estado !== 'pendiente' || !row.match}
                                                    className={`${row.estado === 'pendiente' && row.match ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 cursor-not-allowed'} transition-colors`}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {systemRecords.length === 0 && !isLoading && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-12 text-center text-slate-400 font-medium">
                                            No hay registros pendientes de conciliación.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Table Footer / Pagination */}
                <div className="bg-[#f8fafc] px-6 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <p className="text-[11px] font-bold text-slate-500">Mostrando 1-{systemRecords.length} de {systemRecords.length} registros</p>
                    <div className="flex items-center gap-2">
                        <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50">
                            <ChevronLeft size={16} />
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-[#001738] text-white rounded-md text-xs font-bold shadow-md">
                            1
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center bg-white border border-slate-200 rounded-md text-slate-400 hover:bg-slate-50">
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Recaudado */}
                <div className="bg-[#001738] text-white p-6 rounded-[1.5rem] shadow-xl shadow-[#001738]/10 flex flex-col justify-between min-h-[160px]">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-white/60 mb-2">Recaudación Hoy</p>
                        <h3 className="text-4xl font-black tracking-tight">
                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(stats.recaudacion_hoy)}
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-6 text-white/80 text-[11px] font-medium">
                        <TrendingUp size={14} className="text-emerald-400" /> 
                        <span>Datos actualizados en tiempo real</span>
                    </div>
                </div>

                {/* Pendientes de Conciliar */}
                <div className="bg-white border border-slate-100 p-6 rounded-[1.5rem] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-[#a31e32]"></div>
                    <div className="pl-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Pendientes de Conciliar</p>
                        <h3 className="text-4xl font-black text-[#001738] tracking-tight">
                            {stats.pendientes_conciliar} Registros
                        </h3>
                    </div>
                    <div className="flex items-center gap-2 mt-6 text-[#a31e32] text-[11px] font-black pl-3">
                        <AlertTriangle size={14} /> 
                        <span>Requiere atención administrativa</span>
                    </div>
                </div>

                {/* Estado Bancario */}
                <div className="bg-white border border-slate-100 p-6 rounded-[1.5rem] shadow-sm relative overflow-hidden flex flex-col justify-between min-h-[160px]">
                    <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-emerald-500"></div>
                    <div className="pl-3">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Sincronización</p>
                        <h3 className="text-4xl font-black text-[#001738] tracking-tight">Activa</h3>
                    </div>
                    <div className="flex items-center gap-2 mt-6 text-emerald-600 text-[11px] font-black pl-3">
                        <RefreshCw size={14} /> 
                        <span>Conectado a API Central</span>
                    </div>
                </div>
            </div>

            {/* AI Assistant Mini Bot */}
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
                <AnimatePresence>
                    {isBotOpen && (
                        <motion.div 
                            initial={{ opacity: 0, y: 20, scale: 0.9 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 20, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                            className="bg-white w-[350px] rounded-2xl shadow-2xl border border-slate-100 mb-4 overflow-hidden flex flex-col"
                            style={{ height: '450px' }}
                        >
                            {/* Bot Header */}
                            <div className="bg-gradient-to-r from-[#001738] to-[#002f6c] p-4 flex items-center justify-between text-white">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                                        <Bot size={18} className="text-white" />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-sm">Concilia-Bot IA</h4>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                            <span className="text-[10px] font-medium text-white/80">En línea</span>
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => setIsBotOpen(false)} className="text-white/70 hover:text-white transition-colors">
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Chat Messages */}
                            <div className="flex-1 p-4 overflow-y-auto bg-slate-50 space-y-4">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                        <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                                            msg.role === 'user' 
                                            ? 'bg-[#002f6c] text-white rounded-tr-sm' 
                                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'
                                        }`}>
                                            {msg.text}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Input Area */}
                            <div className="p-3 bg-white border-t border-slate-100">
                                <form onSubmit={handleSendMessage} className="relative flex items-center">
                                    <input 
                                        type="text" 
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Pregunta sobre los registros..." 
                                        className="w-full bg-slate-100 border-transparent focus:bg-white focus:border-[#002f6c] focus:ring-2 focus:ring-[#002f6c]/20 rounded-full pl-4 pr-12 py-2.5 text-sm outline-none transition-all"
                                    />
                                    <button 
                                        type="submit"
                                        disabled={!messageInput.trim()}
                                        className="absolute right-1.5 w-8 h-8 flex items-center justify-center bg-[#002f6c] text-white rounded-full hover:bg-[#001738] disabled:opacity-50 disabled:bg-slate-300 transition-colors"
                                    >
                                        <Send size={14} className="ml-0.5" />
                                    </button>
                                </form>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Floating Action Button */}
                <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsBotOpen(!isBotOpen)}
                    className="w-14 h-14 bg-[#a31e32] text-white rounded-full flex items-center justify-center shadow-[0_8px_30px_rgb(128,0,32,0.4)] hover:bg-[#7a1424] transition-colors relative"
                >
                    <Bot size={24} />
                </motion.button>
            </div>
            <DocumentPreviewModal 
                isOpen={!!previewUrl} 
                onClose={() => setPreviewUrl(null)} 
                url={previewUrl || ''} 
                title={previewTitle} 
            />
        </div>
    );
};

export default BankReconciliation;
