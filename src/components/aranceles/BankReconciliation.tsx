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
    X,
    Link,
    Upload,
    Search,
    Sparkles,
    Check,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FinanceService, ReconciliationItem } from '../../services/FinanceService';
import DocumentPreviewModal from '../DocumentPreviewModal';

// Dynamic script loader for pdfjs-dist
const loadPdfJs = () => {
    return new Promise<any>((resolve, reject) => {
        if ((window as any).pdfjsLib) {
            resolve((window as any).pdfjsLib);
            return;
        }
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
        script.onload = () => {
            const pdfjsLib = (window as any).pdfjsLib;
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
            resolve(pdfjsLib);
        };
        script.onerror = (err) => reject(err);
        document.body.appendChild(script);
    });
};

const parsePdfFile = async (file: File): Promise<string> => {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';
    
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        
        const items = textContent.items as any[];
        const rows: { [key: number]: any[] } = {};
        
        items.forEach((item) => {
            const y = Math.round(item.transform[5]); // y coordinate
            let foundY = Object.keys(rows).find(ry => Math.abs(Number(ry) - y) <= 3);
            if (foundY !== undefined) {
                rows[Number(foundY)].push(item);
            } else {
                rows[y] = [item];
            }
        });
        
        const sortedYKeys = Object.keys(rows).map(Number).sort((a, b) => b - a);
        
        sortedYKeys.forEach((y) => {
            const rowItems = rows[y];
            rowItems.sort((a, b) => a.transform[4] - b.transform[4]);
            
            let line = '';
            for (let j = 0; j < rowItems.length; j++) {
                if (j > 0) {
                    const prev = rowItems[j-1];
                    const curr = rowItems[j];
                    const dist = curr.transform[4] - (prev.transform[4] + prev.width);
                    if (dist > 15) {
                        line += '   ';
                    } else {
                        line += ' ';
                    }
                }
                line += rowItems[j].str;
            }
            fullText += line + '\n';
        });
    }
    return fullText;
};

const parseContinentalText = (text: string): { transactions: any[], startDate: Date | null, endDate: Date | null } => {
    const dateRangeMatch = text.match(/Desde\s+el\s+(\d{2})\/(\d{2})\/(\d{4})\s+hasta\s+el\s+(\d{2})\/(\d{2})\/(\d{4})/i);
    let startDate: Date | null = null;
    let endDate: Date | null = null;
    if (dateRangeMatch) {
        startDate = new Date(parseInt(dateRangeMatch[3]), parseInt(dateRangeMatch[2]) - 1, parseInt(dateRangeMatch[1]));
        endDate = new Date(parseInt(dateRangeMatch[6]), parseInt(dateRangeMatch[5]) - 1, parseInt(dateRangeMatch[4]));
    }

    const lines = text.split('\n');
    const transactions: any[] = [];

    lines.forEach((line) => {
        const trimmed = line.trim();
        const startMatch = trimmed.match(/^(\d{1,2})\s+(\d{2}:\d{2}:\d{2})\s+(.*)$/);
        if (!startMatch) return;
        
        const day = parseInt(startMatch[1]);
        const time = startMatch[2];
        const rest = startMatch[3].trim();
        
        const movMatch = rest.match(/^(\d+\s+\d+\s+[\w\d\-]+)\s+(.*)$/);
        if (!movMatch) return;
        
        const movement = movMatch[1].trim();
        const restAfterMov = movMatch[2].trim();
        
        const endMatch = restAfterMov.match(/^(.*)\s+([\d.]+)\s+([\d.]+)\s*$/);
        if (!endMatch) return;
        
        const description = endMatch[1].trim();
        const amountStr = endMatch[2].replace(/\./g, '');
        const amount = parseInt(amountStr);
        
        const isDebit = /cheque|debito|debe|egreso|retiro|comision|iva|gastos|pago ch/i.test(description);
        if (isDebit) return;
        
        let fecha_transaccion = '';
        if (startDate) {
            const startYear = startDate.getFullYear();
            const startMonth = startDate.getMonth();
            
            let transDate = new Date(startYear, startMonth, day);
            
            if (day > 25 && startDate.getDate() < 5) {
                transDate = new Date(startYear, startMonth - 1, day);
            } else if (day < 5 && startDate.getDate() > 25) {
                transDate = new Date(startYear, startMonth + 1, day);
            } else {
                transDate = new Date(startYear, startMonth, day);
            }
            
            const yyyy = transDate.getFullYear();
            const mm = String(transDate.getMonth() + 1).padStart(2, '0');
            const dd = String(transDate.getDate()).padStart(2, '0');
            fecha_transaccion = `${yyyy}-${mm}-${dd}`;
        } else {
            const today = new Date();
            fecha_transaccion = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        }
        
        transactions.push({
            banco: 'BANCO CONTINENTAL',
            referencia: movement,
            monto: amount,
            fecha_transaccion,
            descripcion: description
        });
    });

    return { transactions, startDate, endDate };
};

const BankReconciliation: React.FC = () => {
    const [systemRecords, setSystemRecords] = useState<ReconciliationItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isImporting, setIsImporting] = useState(false);
    const [isBotOpen, setIsBotOpen] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');
    const [activeTab, setActiveTab] = useState<'pendientes' | 'historial'>('pendientes');
    const [messageInput, setMessageInput] = useState('');
    const [chatMessages, setChatMessages] = useState([
        { role: 'bot', text: '¡Hola! Soy tu asistente de Inteligencia Artificial para conciliación. Estoy listo para ayudarte a cuadrar las cuentas.' }
    ]);
    const [stats, setStats] = useState({
        recaudacion_hoy: 0,
        pendientes_conciliar: 0,
        registrados_hoy: 0
    });

    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [selectedTx, setSelectedTx] = useState<ReconciliationItem | null>(null);
    const [importedTxQueue, setImportedTxQueue] = useState<any[]>([]);
    const [rawTextToParse, setRawTextToParse] = useState('');
    const [isParsing, setIsParsing] = useState(false);
    const [allPendingPayments, setAllPendingPayments] = useState<any[]>([]);
    const [searchPaymentQuery, setSearchPaymentQuery] = useState('');
    const [filterExactAmount, setFilterExactAmount] = useState(true);
    const [selectedPaymentForTx, setSelectedPaymentForTx] = useState<any | null>(null);
    const [isSubmittingImport, setIsSubmittingImport] = useState(false);
    const [activeImportTab, setActiveImportTab] = useState<'pdf' | 'text'>('pdf');


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

    const handleImportDemo = async () => {
        setIsImporting(true);
        try {
            await FinanceService.importDemoTransactions();
            await loadRecords();
            setIsImportModalOpen(false);
            setChatMessages(prev => [...prev, { 
                role: 'bot', 
                text: 'Se han importado registros del estado bancario (Demo). Ahora puedes ver los matches detectados por la IA.' 
            }]);
            alert("Datos de demostración cargados correctamente.");
        } catch (err) {
            console.error("Error importing demo data:", err);
            alert("Error al cargar los datos demo.");
        } finally {
            setIsImporting(false);
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        try {
            const extractedText = await parsePdfFile(file);
            const parsed = parseContinentalText(extractedText);
            setImportedTxQueue(parsed.transactions);
            
            if (parsed.transactions.length === 0) {
                alert("No se encontraron transacciones válidas en el PDF de Banco Continental.");
            }
        } catch (err) {
            console.error("Error parsing PDF file:", err);
            alert("Error al procesar el archivo PDF. Intente copiar y pegar el texto del PDF directamente en la caja de texto.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleTextParse = () => {
        if (!rawTextToParse.trim()) {
            alert("Por favor, pegue el texto copiado de la conciliación.");
            return;
        }

        setIsParsing(true);
        try {
            const parsed = parseContinentalText(rawTextToParse);
            setImportedTxQueue(parsed.transactions);
            
            if (parsed.transactions.length === 0) {
                alert("No se encontraron transacciones válidas. Verifique el formato del texto.");
            }
        } catch (err) {
            console.error("Error parsing text:", err);
            alert("Ocurrió un error al procesar el texto.");
        } finally {
            setIsParsing(false);
        }
    };

    const handleConfirmImport = async () => {
        if (importedTxQueue.length === 0) return;
        setIsSubmittingImport(true);
        try {
            const result = await FinanceService.importBankTransactions(importedTxQueue);
            await loadRecords();
            setIsImportModalOpen(false);
            setImportedTxQueue([]);
            setRawTextToParse('');
            alert(`Importación completada: ${result.inserted} registros nuevos insertados. ${result.duplicates} duplicados omitidos.`);
            setChatMessages(prev => [...prev, { 
                role: 'bot', 
                text: `Hecho. Se importaron ${result.inserted} transacciones nuevas de Banco Continental y se detectaron ${result.duplicates} duplicados.` 
            }]);
        } catch (err) {
            console.error("Error importing transactions:", err);
            alert("Error al importar las transacciones bancarias.");
        } finally {
            setIsSubmittingImport(false);
        }
    };

    const handleOpenManualReconcile = async (tx: ReconciliationItem) => {
        setSelectedTx(tx);
        setSelectedPaymentForTx(null);
        setSearchPaymentQuery('');
        setFilterExactAmount(true);
        setIsManualModalOpen(true);
        
        try {
            const payments = await FinanceService.getPagos();
            const pending = payments.filter(p => p.estado === 'pendiente');
            setAllPendingPayments(pending);
        } catch (err) {
            console.error("Error loading pending payments:", err);
        }
    };

    const handleConfirmManualLink = async () => {
        if (!selectedTx || !selectedPaymentForTx) return;
        try {
            await FinanceService.reconcile(selectedPaymentForTx.id, selectedTx.id);
            await loadRecords();
            setIsManualModalOpen(false);
            setSelectedTx(null);
            setSelectedPaymentForTx(null);
            alert("Vinculación manual completada con éxito. El pago ha sido verificado y conciliado.");
        } catch (err) {
            console.error("Error reconciling manually:", err);
            alert("Ocurrió un error al vincular el pago.");
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

    const handleDeleteTransaction = async (row: ReconciliationItem) => {
        const confirmMsg = row.estado === 'conciliado'
            ? `¿Estás seguro de que deseas deshacer esta conciliación? El pago asociado volverá a quedar en estado pendiente.`
            : `¿Estás seguro de que deseas eliminar permanentemente este pago de "${row.postulante_nombre || 'Postulante'}"?`;
            
        if (window.confirm(confirmMsg)) {
            try {
                if (row.estado === 'conciliado' && row.transaccion_id) {
                    await FinanceService.deleteBankTransaction(row.transaccion_id);
                } else {
                    await FinanceService.deletePago(row.id);
                }
                await loadRecords();
            } catch (e) {
                console.error("Error deleting record:", e);
                alert('Error al procesar la eliminación.');
            }
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
                    onClick={() => setIsImportModalOpen(true)}
                    className="flex items-center justify-center gap-3 px-6 py-3.5 bg-[#002f6c] text-white rounded-xl text-sm font-bold shadow-lg shadow-[#002f6c]/20 hover:bg-[#001738] transition-all shrink-0 whitespace-nowrap"
                >
                    <FileText size={18} />
                    Importar Estado Bancario
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
                {/* Tabs */}
                <div className="flex border-b border-slate-100">
                    <button 
                        className={`flex-1 py-4 text-[13px] font-black uppercase tracking-widest text-center transition-colors ${activeTab === 'pendientes' ? 'border-b-2 border-[#002f6c] text-[#002f6c]' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('pendientes')}
                    >
                        Pendientes
                    </button>
                    <button 
                        className={`flex-1 py-4 text-[13px] font-black uppercase tracking-widest text-center transition-colors ${activeTab === 'historial' ? 'border-b-2 border-emerald-500 text-emerald-600' : 'text-slate-400 hover:text-slate-600'}`}
                        onClick={() => setActiveTab('historial')}
                    >
                        Historial (Conciliados / Verificados)
                    </button>
                </div>

                {/* Table Header */}
                <div className="bg-[#f8fafc] px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Activity size={20} className="text-[#002f6c]" />
                        <h3 className="font-bold text-[#001738] text-base">{activeTab === 'pendientes' ? 'Registros Pendientes' : 'Historial de Registros'}</h3>
                    </div>
                    <span className="bg-slate-200 text-slate-600 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest">
                        {systemRecords.filter(r => activeTab === 'pendientes' ? r.estado === 'pendiente' : (r.estado === 'conciliado' || r.estado === 'verificado')).length} Registros Encontrados
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
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Fecha</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Expediente N°</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Postulante / Detalle</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Banco</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Ref. Pago</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-right">Monto</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap">Estado</th>
                                    <th className="px-3 py-3 text-[9px] font-black text-slate-400 uppercase tracking-widest whitespace-nowrap text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {systemRecords.filter(r => activeTab === 'pendientes' ? r.estado === 'pendiente' : (r.estado === 'conciliado' || r.estado === 'verificado')).map((row: any) => (
                                    <tr key={row.id} className={`hover:bg-slate-50 transition-colors ${row.match ? 'bg-emerald-50/30' : ''}`}>
                                        <td className="px-3 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">{row.fecha}</td>
                                        <td className="px-3 py-4 text-xs font-bold text-[#001738] whitespace-nowrap">{row.numero_expediente || row.match?.numero_expediente || 'PENDIENTE'}</td>
                                        <td className="px-3 py-4">
                                            <div className="flex items-center gap-2">
                                                <div>
                                                    <p className="text-xs font-bold text-[#001738]">{row.postulante_nombre || (row.match ? row.match.postulante : 'No identificado')}</p>
                                                    <p className="text-[10px] text-slate-400 mt-0.5">{row.detalle}</p>
                                                </div>
                                                {row.match && (
                                                    <div className="bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1">
                                                        <CheckCircle2 size={10} /> IA Match ({row.match.score || row.match.puntaje || 0}%)
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-xs font-medium text-slate-600 whitespace-nowrap">{row.banco}</td>
                                        <td className="px-3 py-4">
                                            <div className="inline-flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-xs font-medium text-slate-600">
                                                <FileText size={14} className="text-slate-400" />
                                                {row.is_pago ? `PAGO-${row.id}` : (row.match ? `PAGO-${row.match.pago_id}` : 'SIN REF')}
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-right font-bold text-[#001738] text-[14px] whitespace-nowrap">
                                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(row.monto)}
                                        </td>
                                        <td className="px-3 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <div className={`w-2 h-2 rounded-full ${row.estado === 'pendiente' ? 'bg-[#a37c58]' : row.estado === 'conciliado' ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                                                <span className={`text-[9px] font-black uppercase tracking-widest ${row.estado === 'pendiente' ? 'text-[#a37c58]' : row.estado === 'conciliado' ? 'text-emerald-600' : 'text-red-600'}`}>
                                                    {row.estado}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-3 py-4 text-center whitespace-nowrap">
                                            <div className="flex items-center justify-center gap-3">
                                                <button 
                                                    onClick={() => {
                                                        const receiptUrl = row.comprobante_url || row.match?.comprobante_url;
                                                        if (receiptUrl) {
                                                            setPreviewUrl(receiptUrl);
                                                            setPreviewTitle(`Comprobante - ${row.postulante_nombre || row.match?.postulante || 'Pago'}`);
                                                        } else {
                                                            alert('Esta transacción no tiene comprobante adjunto.');
                                                        }
                                                    }}
                                                    disabled={!(row.comprobante_url || row.match?.comprobante_url)}
                                                    className={`${(row.comprobante_url || row.match?.comprobante_url) ? 'text-[#002f6c] hover:text-[#001738] hover:scale-110' : 'text-slate-300 cursor-not-allowed'} transition-all`}
                                                    title={(row.comprobante_url || row.match?.comprobante_url) ? 'Ver Comprobante Cargado' : 'Sin comprobante disponible'}
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if (row.match) {
                                                            handleSingleReconcile(row.match.pago_id, row.id);
                                                        } else if ((row as any).is_pago) {
                                                            if (window.confirm('¿Desea aprobar y verificar este pago manualmente sin extracto bancario?')) {
                                                                FinanceService.updatePagoEstado(row.id, 'verificado', 'Aprobado manualmente').then(() => loadRecords());
                                                            }
                                                        }
                                                    }}
                                                    disabled={row.estado !== 'pendiente'}
                                                    className={`${row.estado === 'pendiente' ? 'text-emerald-500 hover:text-emerald-600' : 'text-slate-300 cursor-not-allowed'} transition-colors`}
                                                    title={row.match ? "Conciliar Automáticamente" : "Verificar/Aprobar Manualmente"}
                                                >
                                                    <CheckCircle2 size={18} />
                                                </button>
                                                {row.estado === 'pendiente' && (
                                                    <button 
                                                        onClick={() => handleOpenManualReconcile(row)}
                                                        className="text-[#002f6c] hover:text-[#001738] hover:scale-110 transition-all"
                                                        title="Vincular Pago Manualmente"
                                                    >
                                                        <Link size={18} />
                                                    </button>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteTransaction(row)}
                                                    className="text-red-500 hover:text-red-700 hover:scale-110 transition-all"
                                                    title="Eliminar Transacción / Carga"
                                                >
                                                    <Trash2 size={18} />
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

            {/* Modal de Importación */}
            <AnimatePresence>
                {isImportModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                if (!isSubmittingImport) {
                                    setIsImportModalOpen(false);
                                    setImportedTxQueue([]);
                                    setRawTextToParse('');
                                }
                            }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="relative bg-white rounded-[2rem] w-full max-w-4xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                        >
                            {/* Header */}
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div>
                                    <span className="text-[10px] font-black text-[#002f6c] uppercase tracking-[0.2em] mb-1 block">Administración Financiera</span>
                                    <h3 className="text-lg font-black text-[#001738] tracking-tight">Importar Estado Bancario</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportedTxQueue([]);
                                        setRawTextToParse('');
                                    }}
                                    disabled={isSubmittingImport}
                                    className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    title="Cerrar"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="flex-1 p-8 overflow-y-auto space-y-6">
                                {/* Top Explanation */}
                                <div className="bg-[#f8fafc] border border-slate-100 rounded-2xl p-5 flex items-start gap-4">
                                    <Sparkles className="text-[#a31e32] shrink-0 mt-0.5" size={20} />
                                    <div>
                                        <h4 className="font-bold text-sm text-[#001738] mb-1">Carga Inteligente de Extractos</h4>
                                        <p className="text-xs text-slate-600 leading-relaxed">
                                            Sube el extracto digital de <strong>Banco Continental</strong> en formato PDF. El parser extraerá las transacciones del rango de fechas, omitirá de forma inteligente los débitos/egresos y reconstruirá las fechas completas. También puedes pegar el texto copiado del PDF o usar datos de demostración para pruebas.
                                        </p>
                                    </div>
                                </div>

                                {/* Tabs Selector */}
                                <div className="flex border-b border-slate-100">
                                    <button
                                        onClick={() => setActiveImportTab('pdf')}
                                        className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                                            activeImportTab === 'pdf'
                                                ? 'border-[#002f6c] text-[#002f6c]'
                                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        Subir PDF Oficial
                                    </button>
                                    <button
                                        onClick={() => setActiveImportTab('text')}
                                        className={`px-6 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all ${
                                            activeImportTab === 'text'
                                                ? 'border-[#002f6c] text-[#002f6c]'
                                                : 'border-transparent text-slate-400 hover:text-slate-600'
                                        }`}
                                    >
                                        Pegar Texto del PDF
                                    </button>
                                    <div className="flex-1 flex justify-end items-center">
                                        <button
                                            type="button"
                                            onClick={handleImportDemo}
                                            disabled={isImporting || isSubmittingImport}
                                            className="px-4 py-1.5 bg-[#a31e32]/10 text-[#a31e32] hover:bg-[#a31e32]/20 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-1.5"
                                        >
                                            {isImporting ? <RefreshCw className="animate-spin" size={12} /> : <Bot size={12} />}
                                            Cargar Demo
                                        </button>
                                    </div>
                                </div>

                                {/* Tab Body */}
                                <div>
                                    {activeImportTab === 'pdf' ? (
                                        <div className="space-y-4">
                                            <div className="border-2 border-dashed border-slate-200 hover:border-[#002f6c] rounded-2xl p-8 transition-colors bg-slate-50/50 flex flex-col items-center justify-center text-center group cursor-pointer relative">
                                                <input
                                                    type="file"
                                                    accept=".pdf"
                                                    onChange={handleFileChange}
                                                    disabled={isParsing || isSubmittingImport}
                                                    className="absolute inset-0 opacity-0 cursor-pointer disabled:cursor-not-allowed"
                                                />
                                                <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-slate-400 group-hover:text-[#002f6c] border border-slate-100 transition-colors mb-4">
                                                    <Upload size={22} />
                                                </div>
                                                {isParsing ? (
                                                    <div className="flex flex-col items-center gap-2">
                                                        <RefreshCw className="animate-spin text-[#002f6c]" size={20} />
                                                        <p className="text-sm font-bold text-[#001738]">Analizando documento PDF...</p>
                                                        <p className="text-xs text-slate-500">Agrupando texto por coordenadas e infiriendo fechas...</p>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <p className="text-sm font-bold text-[#001738] mb-1">Arrastra tu extracto PDF aquí</p>
                                                        <p className="text-xs text-slate-500">O haz clic para explorar tus archivos locales (solo archivos .pdf)</p>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Texto Copiado del PDF</label>
                                                <textarea
                                                    rows={6}
                                                    value={rawTextToParse}
                                                    onChange={(e) => setRawTextToParse(e.target.value)}
                                                    placeholder="Pegue aquí el texto completo del extracto (Ctrl+A y Ctrl+C en el PDF de Banco Continental)..."
                                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs font-mono text-slate-700 focus:bg-white focus:border-[#002f6c] outline-none transition-all resize-none"
                                                />
                                            </div>
                                            <div className="flex justify-end">
                                                <button
                                                    type="button"
                                                    onClick={handleTextParse}
                                                    disabled={isParsing || !rawTextToParse.trim()}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-[#002f6c] hover:bg-[#001738] text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                                                >
                                                    {isParsing && <RefreshCw className="animate-spin" size={14} />}
                                                    Procesar Texto
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Import Preview List */}
                                {importedTxQueue.length > 0 && (
                                    <div className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm">
                                        <div className="bg-[#f8fafc] px-6 py-4 border-b border-slate-100 flex items-center justify-between">
                                            <h4 className="text-xs font-black text-[#001738] uppercase tracking-wider flex items-center gap-2">
                                                <CheckCircle2 className="text-emerald-500" size={16} />
                                                Movimientos Detectados ({importedTxQueue.length})
                                            </h4>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-[#a37c58]">Previsualización</span>
                                        </div>
                                        <div className="max-h-[220px] overflow-y-auto">
                                            <table className="w-full text-left border-collapse text-xs">
                                                <thead>
                                                    <tr className="bg-slate-50 border-b border-slate-100 sticky top-0">
                                                        <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Fecha</th>
                                                        <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Referencia</th>
                                                        <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest text-[9px]">Descripción</th>
                                                        <th className="px-5 py-3 font-bold text-slate-500 uppercase tracking-widest text-[9px] text-right">Monto</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {importedTxQueue.map((tx, idx) => (
                                                        <tr key={idx} className="hover:bg-slate-50/50">
                                                            <td className="px-5 py-3 text-slate-600 font-medium whitespace-nowrap">{tx.fecha_transaccion}</td>
                                                            <td className="px-5 py-3 text-slate-600 font-mono">{tx.referencia}</td>
                                                            <td className="px-5 py-3 text-slate-700 font-medium truncate max-w-[200px]" title={tx.descripcion}>{tx.descripcion}</td>
                                                            <td className="px-5 py-3 text-right font-bold text-slate-900 whitespace-nowrap">
                                                                {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(tx.monto)}
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Footer Actions */}
                            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                                <button
                                    onClick={() => {
                                        setIsImportModalOpen(false);
                                        setImportedTxQueue([]);
                                        setRawTextToParse('');
                                    }}
                                    disabled={isSubmittingImport}
                                    className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={handleConfirmImport}
                                    disabled={importedTxQueue.length === 0 || isSubmittingImport}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#002f6c] hover:bg-[#001738] text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-[#002f6c]/10 disabled:opacity-50 disabled:shadow-none"
                                >
                                    {isSubmittingImport ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={14} />
                                            Importando...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={14} />
                                            Confirmar e Importar ({importedTxQueue.length})
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Modal de Vinculación Manual */}
            <AnimatePresence>
                {isManualModalOpen && selectedTx && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => {
                                setIsManualModalOpen(false);
                                setSelectedTx(null);
                                setSelectedPaymentForTx(null);
                            }}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                        />

                        {/* Modal Container */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="relative bg-white rounded-[2rem] w-full max-w-6xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                        >
                            {/* Header */}
                            <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                                <div>
                                    <span className="text-[10px] font-black text-[#a31e32] uppercase tracking-[0.2em] mb-1 block">Módulo de Conciliación</span>
                                    <h3 className="text-lg font-black text-[#001738] tracking-tight">Cruce y Vinculación Manual de Transacciones</h3>
                                </div>
                                <button
                                    onClick={() => {
                                        setIsManualModalOpen(false);
                                        setSelectedTx(null);
                                        setSelectedPaymentForTx(null);
                                    }}
                                    className="p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    title="Cerrar"
                                >
                                    <X size={18} />
                                </button>
                            </div>

                            {/* Side by Side Body */}
                            <div className="flex-1 flex flex-col md:flex-row overflow-hidden divide-y md:divide-y-0 md:divide-x divide-slate-100">
                                {/* Left Side: Bank Movement Details */}
                                <div className="w-full md:w-5/12 p-8 overflow-y-auto bg-slate-50/50 flex flex-col justify-between">
                                    <div className="space-y-6">
                                        <div className="flex items-center gap-2.5">
                                            <span className="bg-slate-200 text-slate-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                Estado Bancario
                                            </span>
                                            <span className="bg-[#a37c58]/10 text-[#a37c58] px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider">
                                                {selectedTx.estado}
                                            </span>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-1">Monto de la Transacción</label>
                                                <h3 className="text-3xl font-black text-[#001738] tracking-tight">
                                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(selectedTx.monto)}
                                                </h3>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4 pt-2">
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Banco</label>
                                                    <p className="text-xs font-bold text-slate-800">{selectedTx.banco}</p>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Fecha Valor</label>
                                                    <p className="text-xs font-bold text-slate-800">{selectedTx.fecha}</p>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Referencia Bancaria</label>
                                                <p className="text-xs font-mono font-bold text-slate-800 bg-white border border-slate-200/60 rounded-lg px-2.5 py-1.5 inline-block">
                                                    {selectedTx.detalle.match(/Ref:\s*([\w\d\-]+)/)?.[1] || 'Sin Referencia Explícita'}
                                                </p>
                                            </div>

                                            <div>
                                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block mb-0.5">Descripción de Movimiento</label>
                                                <p className="text-xs text-slate-700 bg-white border border-slate-200/60 rounded-xl p-3 leading-relaxed">
                                                    {selectedTx.detalle}
                                                </p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Prompt */}
                                    <div className="mt-8 border-t border-slate-200/60 pt-6">
                                        <div className="bg-[#002f6c]/5 border border-[#002f6c]/10 rounded-xl p-4 flex gap-3">
                                            <Bot className="text-[#002f6c] shrink-0 mt-0.5" size={16} />
                                            <p className="text-[11px] text-slate-600 leading-normal">
                                                Para conciliar esta transacción, selecciona el pago correspondiente cargado por el alumno en la columna derecha. Si posee comprobante adjunto, puedes verificarlo visualmente.
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Right Side: Search and List Payments */}
                                <div className="w-full md:w-7/12 p-8 flex flex-col overflow-hidden">
                                    {/* Controls & Search */}
                                    <div className="space-y-4 mb-6 shrink-0">
                                        <div className="relative">
                                            <input
                                                type="text"
                                                value={searchPaymentQuery}
                                                onChange={(e) => setSearchPaymentQuery(e.target.value)}
                                                placeholder="Buscar pago por Alumno, CI, Concepto o Comprobante..."
                                                className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#002f6c] focus:ring-2 focus:ring-[#002f6c]/10 rounded-xl pl-10 pr-4 py-3 text-sm outline-none transition-all"
                                            />
                                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            {searchPaymentQuery && (
                                                <button
                                                    onClick={() => setSearchPaymentQuery('')}
                                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                                >
                                                    <X size={14} />
                                                </button>
                                            )}
                                        </div>

                                        {/* Toggle matching amount */}
                                        <div className="flex items-center justify-between">
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                                <input
                                                    type="checkbox"
                                                    checked={filterExactAmount}
                                                    onChange={(e) => setFilterExactAmount(e.target.checked)}
                                                    className="rounded border-slate-300 text-[#002f6c] focus:ring-[#002f6c] w-4 h-4"
                                                />
                                                <span className="text-xs font-bold text-slate-600">
                                                    Solo pagos con el mismo monto exacto (<strong>{new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(selectedTx.monto)}</strong>)
                                                </span>
                                            </label>
                                        </div>
                                    </div>

                                    {/* Payments List */}
                                    <div className="flex-1 overflow-y-auto space-y-3 pr-1">
                                        {allPendingPayments.length === 0 ? (
                                            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
                                                <RefreshCw className="animate-spin text-slate-300" size={24} />
                                                <p className="text-xs font-medium">Cargando pagos del sistema...</p>
                                            </div>
                                        ) : (() => {
                                            const filtered = allPendingPayments.filter(payment => {
                                                if (filterExactAmount && payment.monto !== selectedTx.monto) {
                                                    return false;
                                                }
                                                if (searchPaymentQuery.trim()) {
                                                    const q = searchPaymentQuery.toLowerCase();
                                                    const nameMatch = payment.nombre?.toLowerCase().includes(q) || payment.apellido?.toLowerCase().includes(q);
                                                    const ciMatch = payment.postulante_cedula?.toLowerCase().includes(q);
                                                    const numMatch = payment.num_comprobante?.toLowerCase().includes(q) || payment.numero_boleta?.toLowerCase().includes(q);
                                                    const conceptMatch = payment.concepto?.toLowerCase().includes(q);
                                                    return nameMatch || ciMatch || numMatch || conceptMatch;
                                                }
                                                return true;
                                            });

                                            if (filtered.length === 0) {
                                                return (
                                                    <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-2xl text-slate-400">
                                                        <AlertTriangle className="mx-auto mb-2 text-slate-300" size={24} />
                                                        <p className="text-xs font-medium">No se encontraron pagos pendientes que cumplan los filtros.</p>
                                                    </div>
                                                );
                                            }

                                            return filtered.map((payment) => {
                                                const isSelected = selectedPaymentForTx?.id === payment.id;
                                                return (
                                                    <div
                                                        key={payment.id}
                                                        onClick={() => setSelectedPaymentForTx(payment)}
                                                        className={`border rounded-2xl p-4 transition-all cursor-pointer flex items-center justify-between gap-4 ${
                                                            isSelected
                                                                ? 'border-[#002f6c] bg-[#002f6c]/5 shadow-sm'
                                                                : 'border-slate-100 bg-white hover:border-slate-300 hover:shadow-sm'
                                                        }`}
                                                    >
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-xs font-black text-slate-800">
                                                                    {payment.nombre ? `${payment.nombre} ${payment.apellido}` : `C.I. ${payment.postulante_cedula}`}
                                                                </span>
                                                                {payment.postulante_cedula && payment.nombre && (
                                                                    <span className="text-[10px] text-slate-400 font-mono">({payment.postulante_cedula})</span>
                                                                )}
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-500 font-medium">
                                                                <span>Ref: <strong className="text-slate-700 font-mono">{payment.num_comprobante || payment.numero_boleta || 'N/A'}</strong></span>
                                                                <span>•</span>
                                                                <span>Fecha Registro: {payment.fecha_registro.split(' ')[0]}</span>
                                                            </div>
                                                            <div className="text-[11px] text-slate-600 bg-slate-100 rounded px-2 py-0.5 inline-block font-bold">
                                                                {payment.concepto}
                                                            </div>
                                                        </div>

                                                        <div className="flex items-center gap-3 shrink-0">
                                                            <div className="text-right">
                                                                <p className="text-sm font-black text-slate-800">
                                                                    {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG' }).format(payment.monto)}
                                                                </p>
                                                                {payment.comprobante_url && (
                                                                    <button
                                                                        type="button"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            setPreviewUrl(payment.comprobante_url);
                                                                            setPreviewTitle(`Comprobante Alumno: ${payment.nombre || payment.postulante_cedula}`);
                                                                        }}
                                                                        className="text-[#002f6c] hover:underline text-[10px] font-black uppercase tracking-wider flex items-center gap-1 mt-1 justify-end"
                                                                    >
                                                                        <Eye size={10} />
                                                                        Ver Comprobante
                                                                    </button>
                                                                )}
                                                            </div>
                                                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${
                                                                isSelected
                                                                    ? 'border-[#002f6c] bg-[#002f6c] text-white'
                                                                    : 'border-slate-200 bg-slate-50'
                                                            }`}>
                                                                {isSelected && <Check size={12} />}
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            });
                                        })()}
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="px-8 py-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between shrink-0">
                                <div>
                                    {selectedPaymentForTx ? (
                                        <p className="text-xs text-slate-600 font-medium">
                                            Seleccionado: <strong className="text-slate-800">{selectedPaymentForTx.nombre || selectedPaymentForTx.postulante_cedula}</strong>
                                        </p>
                                    ) : (
                                        <p className="text-xs text-slate-400 italic">
                                            Ningún pago seleccionado en la lista
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => {
                                            setIsManualModalOpen(false);
                                            setSelectedTx(null);
                                            setSelectedPaymentForTx(null);
                                        }}
                                        className="px-5 py-2.5 text-xs font-bold text-slate-500 hover:text-slate-700 transition-colors"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        onClick={handleConfirmManualLink}
                                        disabled={!selectedPaymentForTx}
                                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-emerald-600/10 disabled:opacity-50 disabled:shadow-none"
                                    >
                                        <Link size={14} />
                                        Confirmar Vinculación
                                    </button>
                                </div>
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

export default BankReconciliation;
