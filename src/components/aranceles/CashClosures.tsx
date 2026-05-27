import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Hash, Receipt, Download, FileSpreadsheet, 
    CheckCircle, AlertTriangle, RefreshCw, Send, HelpCircle, 
    Bot, X, ShieldAlert, Sparkles, ChevronDown, ChevronUp, 
    Check, Play, FileText, Landmark, User, DollarSign
} from 'lucide-react';
import { FinanceService, Payment } from '../../services/FinanceService';

interface HistoricCierre {
    cierre_nro: number;
    cierre_fecha: string;
    transacciones: number;
    total: number;
}

export const CashClosures: React.FC = () => {
    // Estado de pestañas principales: 'nuevo' | 'historial'
    const [activeTab, setActiveTab] = useState<'nuevo' | 'historial'>('nuevo');
    
    // Estados para Nuevo Cierre
    const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
    const [selectedPaymentIds, setSelectedPaymentIds] = useState<number[]>([]);
    const [fechaCierre, setFechaCierre] = useState<string>(new Date().toISOString().split('T')[0]);
    const [nroCierre, setNroCierre] = useState<number>(62); // Sugerido por defecto, se actualizará desde la API
    const [loadingPending, setLoadingPending] = useState<boolean>(false);
    const [processingCierre, setProcessingCierre] = useState<boolean>(false);
    
    // Estados para Historial
    const [historicCierres, setHistoricCierres] = useState<HistoricCierre[]>([]);
    const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
    
    // Estados del Cierre-Bot IA
    const [botOpen, setBotOpen] = useState<boolean>(false);
    const [messages, setMessages] = useState<{ sender: 'bot' | 'user'; text: string; timestamp: Date }[]>([
        { 
            sender: 'bot', 
            text: '¡Hola! Soy **Cierre-Bot IA**, tu asistente financiero. Estoy aquí para guiarte en el cierre de caja, ayudarte a auditar las transacciones y verificar que tu planilla Excel de Resumen de Ingresos se genere de forma perfecta y sin inconsistencias. ¿En qué puedo ayudarte hoy?',
            timestamp: new Date() 
        }
    ]);
    const [userInput, setUserInput] = useState<string>('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const [highlightAudit, setHighlightAudit] = useState<boolean>(false);

    // Cargar datos iniciales
    useEffect(() => {
        loadPendingPayments();
        loadNextCorrelativo();
        loadHistory();
    }, []);

    // Scroll al final del chat al recibir mensajes
    useEffect(() => {
        if (chatEndRef.current) {
            chatEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, botOpen]);

    const loadPendingPayments = async () => {
        setLoadingPending(true);
        try {
            const data = await FinanceService.getCierrePreview();
            setPendingPayments(data || []);
            // Por defecto seleccionar todos (hasta un máximo de 35 para cuidar el diseño)
            const ids = (data || []).slice(0, 35).map(p => p.id);
            setSelectedPaymentIds(ids);
        } catch (error) {
            console.error('Error cargando pagos pendientes:', error);
        } finally {
            setLoadingPending(false);
        }
    };

    const loadNextCorrelativo = async () => {
        try {
            const res = await FinanceService.getMaxCierreCorrelativo();
            if (res && res.max_cierre) {
                setNroCierre(res.max_cierre + 1);
            }
        } catch (error) {
            console.error('Error sugiriendo correlativo:', error);
        }
    };

    const loadHistory = async () => {
        setLoadingHistory(true);
        try {
            const data = await FinanceService.getCierresHistoricos();
            setHistoricCierres(data || []);
        } catch (error) {
            console.error('Error cargando historial de cierres:', error);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSelectAll = () => {
        // Selecciona todos, pero alerta si pasa de 35
        const ids = pendingPayments.map(p => p.id);
        setSelectedPaymentIds(ids);
        
        if (ids.length > 35) {
            addBotMessage('bot', `⚠️ He notado que has seleccionado **${ids.length}** transacciones. Recuerda que el Excel tiene un diseño visual óptimo para un máximo de **35** registros por cierre debido a las firmas en el pie de página. Si procesas todos juntos, el diseño podría verse alterado. Te recomiendo realizar cierres parciales de hasta 35 ítems.`);
            setBotOpen(true);
        }
    };

    const handleDeselectAll = () => {
        setSelectedPaymentIds([]);
    };

    const handleToggleSelect = (id: number) => {
        if (selectedPaymentIds.includes(id)) {
            setSelectedPaymentIds(selectedPaymentIds.filter(item => item !== id));
        } else {
            const nextSelected = [...selectedPaymentIds, id];
            setSelectedPaymentIds(nextSelected);
            if (nextSelected.length === 36) {
                addBotMessage('bot', `⚠️ Has seleccionado **36** transacciones. Superar el límite de **35** filas preformateadas en la Hoja 1 puede truncar el reporte de firmas. Te sugiero mantener el cierre en 35 transacciones o menos.`);
                setBotOpen(true);
            }
        }
    };

    const formatGs = (n: number) => {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(n);
    };

    // Cálculos de totales de los seleccionados
    const selectedPayments = pendingPayments.filter(p => selectedPaymentIds.includes(p.id));
    const totalEfectivo = selectedPayments
        .filter(p => (p as any).metodo_pago === 'efectivo')
        .reduce((sum, p) => sum + Number(p.monto), 0);
    const totalTransferencia = selectedPayments
        .filter(p => (p as any).metodo_pago !== 'efectivo')
        .reduce((sum, p) => sum + Number(p.monto), 0);
    const totalGeneral = totalEfectivo + totalTransferencia;

    // Procesar el cierre
    const handleProcesarCierre = async () => {
        if (selectedPaymentIds.length === 0) return;
        
        setProcessingCierre(true);
        try {
            const response = await FinanceService.realizarCierre(fechaCierre, nroCierre, selectedPaymentIds);
            if (response.status === 'success') {
                // Agregar mensaje de éxito en el bot
                addBotMessage('bot', `🎉 **¡Cierre N° ${nroCierre} procesado con éxito!** Se han marcado ${selectedPaymentIds.length} transacciones. Se ha iniciado la descarga del reporte Excel oficial. Las firmas y códigos presupuestarios se conservaron intactos.`);
                setBotOpen(true);

                // Forzar descarga del excel
                const downloadUrl = FinanceService.getDownloadCierreUrl(nroCierre, fechaCierre);
                window.location.href = downloadUrl;

                // Limpiar y recargar
                setSelectedPaymentIds([]);
                await Promise.all([
                    loadPendingPayments(),
                    loadNextCorrelativo(),
                    loadHistory()
                ]);
            } else {
                alert(`Error al procesar el cierre: ${response.message}`);
            }
        } catch (error: any) {
            console.error('Error en realizar cierre:', error);
            alert(`Error de servidor: ${error.message || error}`);
        } finally {
            setProcessingCierre(false);
        }
    };

    const addBotMessage = (sender: 'bot' | 'user', text: string) => {
        setMessages(prev => [...prev, { sender, text, timestamp: new Date() }]);
    };

    const handleSendMessage = (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        if (!userInput.trim()) return;

        const question = userInput.trim();
        addBotMessage('user', question);
        setUserInput('');

        // Simular respuesta inteligente basada en palabras clave
        setTimeout(() => {
            const norm = question.toLowerCase();
            let reply = '';

            if (norm.includes('cómo') || norm.includes('como') || norm.includes('paso') || norm.includes('proceso')) {
                reply = `Para realizar un cierre de caja correcto, sigue estos pasos:
1. **Selecciona los cobros** verificados del día en la tabla.
2. **Confirma la fecha y el número de cierre** sugeridos en el panel de control.
3. Presiona el botón de **Auditar Cierre** para que revise si hay inconsistencias.
4. Si todo está correcto, haz clic en **Procesar Cierre y Descargar Excel**. El sistema marcará los pagos como cerrados e iniciará la descarga directa del archivo Excel oficial.`;
            } else if (norm.includes('límite') || norm.includes('limite') || norm.includes('35') || norm.includes('cant') || norm.includes('máximo')) {
                reply = `El diseño visual del Excel original (` + '`RESUMEN DE INGRESOS`'.replace('`','') + `) contempla exactamente **35 filas de transacciones** (filas 7 a 41 de la Hoja 1).
Si seleccionas más de 35 transacciones, el backend solo podrá escribir las primeras 35 para no empujar la sección de firmas inferiores, lo que causaría descuadres.
**Recomendación:** Si tienes 50 cobros, realiza dos cierres separados (por ejemplo, el Cierre N° 62 con 25 ítems y el Cierre N° 63 con los otros 25).`;
            } else if (norm.includes('hoja 2') || norm.includes('presupuesto') || norm.includes('código') || norm.includes('codigo') || norm.includes('contable')) {
                reply = `En la Hoja 2 ("Presupuesto"), el sistema agrupa automáticamente los aranceles recaudados de acuerdo con la clasificación presupuestaria institucional.
Por ejemplo:
- Los **Certificados de Estudios** se asignan al código \`514020112000\` (Fila 22).
- Las **Convalidaciones de Asignaturas** se asignan al código \`514020106000\` (Fila 16).
El backend realiza este mapeo dinámico comparando las palabras clave del arancel cobrado e inyecta la suma en efectivo o transferencia en las columnas correspondientes del Excel de forma 100% automatizada.`;
            } else if (norm.includes('descuadre') || norm.includes('diferencia') || norm.includes('arqueo') || norm.includes('error')) {
                reply = `Si detectas un descuadre entre los montos recaudados y el extracto bancario, te sugiero:
1. Usar el botón de **Auditar Cierre** para corroborar el estado de cada cobro.
2. Verificar si hay pagos verificados en efectivo que aún no has depositado.
3. Comprobar que no existan cobros duplicados en la tabla de cobros pendientes.
Recuerda que solo se muestran cobros en estado **Verificado**. Si algún pago sigue pendiente de conciliar, no aparecerá aquí hasta que sea aprobado.`;
            } else if (norm.includes('auditar') || norm.includes('auditoria') || norm.includes('revisar')) {
                // Ejecutar la función de auditoría directamente
                ejecutarAuditoria();
                return;
            } else {
                reply = `Entendido. Como asistente virtual del módulo de Finanzas, te recuerdo que al procesar el cierre, todas las transacciones seleccionadas quedarán vinculadas inmutablemente al correlativo **N° ${nroCierre}** con fecha **${fechaCierre}**.
Puedes descargar el Excel de cierres anteriores en cualquier momento desde la pestaña de **Historial de Cierres**. Si tienes alguna duda con respecto a la planilla contable, puedes preguntarme sobre "límites de filas" o "código presupuestario".`;
            }

            addBotMessage('bot', reply);
        }, 800);
    };

    const ejecutarAuditoria = () => {
        setHighlightAudit(true);
        setTimeout(() => setHighlightAudit(false), 2000);

        if (selectedPaymentIds.length === 0) {
            addBotMessage('bot', `🔍 **Auditoría de Cierre:**
❌ **Error:** No has seleccionado ninguna transacción en la tabla. Por favor, marca las transacciones que deseas incluir en este cierre para que pueda auditarlas.`);
            return;
        }

        const cantidad = selectedPaymentIds.length;
        const total = totalGeneral;
        const totalEf = totalEfectivo;
        const totalTr = totalTransferencia;

        let advertencias = [];
        if (cantidad > 35) {
            advertencias.push(`⚠️ **Límite de filas superado:** Has seleccionado ${cantidad} transacciones. La plantilla Excel original solo cuenta con 35 espacios para evitar desplazar las firmas de autorización. Se recomienda reducir la selección a 35 o menos.`);
        }

        // Analizar si hay montos inusualmente altos o nulos
        const montosNulos = selectedPayments.filter(p => Number(p.monto) <= 0);
        if (montosNulos.length > 0) {
            advertencias.push(`⚠️ **Montos sospechosos:** Hay ${montosNulos.length} transacciones con monto de Gs. 0 o negativo.`);
        }

        const desglosePresupuestario = new Set(selectedPayments.map(p => p.concepto));

        const advText = advertencias.length > 0 
            ? `\n\n**Advertencias encontradas:**\n` + advertencias.join('\n')
            : `\n\n✨ **Resultado:** No se detectaron inconsistencias en la selección. El reporte cumple con las normas visuales e institucionales.`;

        const auditoriaReply = `🔍 **Auditoría del Cierre N° ${nroCierre} (${fechaCierre}):**
- **Transacciones seleccionadas:** ${cantidad} (límite de 35)
- **Recaudación en Ventanilla (Efectivo):** ${formatGs(totalEf)}
- **Recaudación en Bancos (Transferencias):** ${formatGs(totalTr)}
- **Total Acumulado:** **${formatGs(total)}**
- **Aranceles distintos:** ${desglosePresupuestario.size} conceptos identificados.${advText}

*¿Deseas procesar el cierre ahora? Puedes hacer clic en 'Procesar Cierre y Descargar Excel'.*`;

        addBotMessage('bot', auditoriaReply);
    };

    const handleDescargarHistorico = (cierreNro: number, cierreFecha: string) => {
        const downloadUrl = FinanceService.getDownloadCierreUrl(cierreNro, cierreFecha);
        window.location.href = downloadUrl;
    };

    return (
        <div className="w-full space-y-8 min-h-screen pb-16 relative">
            {/* Header del Módulo */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-extrabold text-[#002f6c] leading-tight tracking-tight flex items-center gap-3">
                        <FileSpreadsheet className="text-[#002f6c]" size={36} />
                        Cierres de Caja e Ingresos
                    </h1>
                    <p className="text-slate-500 font-medium text-sm mt-1">
                        Genera automáticamente planillas Excel oficiales con códigos presupuestarios y firmas.
                    </p>
                </div>
                
                {/* Botón flotante para abrir Asistente Virtual */}
                <button 
                    onClick={() => setBotOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#002f6c] to-[#001c40] text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:shadow-lg transition-all shadow-md"
                >
                    <Bot size={18} /> Asistente Cierre-Bot
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                </button>
            </div>

            {/* Pestañas de Navegación */}
            <div className="flex border-b border-slate-200">
                <button 
                    onClick={() => setActiveTab('nuevo')}
                    className={`px-8 py-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'nuevo' 
                            ? 'border-[#002f6c] text-[#002f6c]' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <Receipt size={16} /> Nuevo Cierre
                </button>
                <button 
                    onClick={() => {
                        setActiveTab('historial');
                        loadHistory();
                    }}
                    className={`px-8 py-4 font-bold text-xs uppercase tracking-widest border-b-2 transition-all flex items-center gap-2 ${
                        activeTab === 'historial' 
                            ? 'border-[#002f6c] text-[#002f6c]' 
                            : 'border-transparent text-slate-400 hover:text-slate-600'
                    }`}
                >
                    <Download size={16} /> Historial de Cierres
                </button>
            </div>

            {/* Contenido de Pestañas */}
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                
                {/* LADO IZQUIERDO: FORMULARIO Y RESUMEN (Para Nuevo Cierre) */}
                {activeTab === 'nuevo' && (
                    <div className="xl:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm space-y-6">
                            <h3 className="text-sm font-bold text-[#002f6c] uppercase tracking-wider border-b pb-3 flex items-center gap-2">
                                <Hash size={18} className="text-[#002f6c]" />
                                Parámetros del Cierre
                            </h3>

                            {/* Inputs de Cierre */}
                            <div className="space-y-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Fecha del Cierre</label>
                                    <div className="relative">
                                        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="date"
                                            value={fechaCierre}
                                            onChange={(e) => setFechaCierre(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-colors"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Número de Cierre Correlativo</label>
                                    <div className="relative">
                                        <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input 
                                            type="number"
                                            value={nroCierre}
                                            onChange={(e) => setNroCierre(Number(e.target.value))}
                                            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-colors"
                                            placeholder="Nro. Cierre"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Resumen de Totales Dinámicos */}
                            <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-100 space-y-4">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Totales Seleccionados</h4>
                                
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Transacciones:</span>
                                        <span className={`font-bold ${selectedPaymentIds.length > 35 ? 'text-amber-600' : 'text-slate-800'}`}>
                                            {selectedPaymentIds.length} / 35
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Ventanilla (Efectivo):</span>
                                        <span className="font-bold text-slate-800">{formatGs(totalEfectivo)}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-slate-500 font-medium">Bancos (Transf.):</span>
                                        <span className="font-bold text-slate-800">{formatGs(totalTransferencia)}</span>
                                    </div>
                                    <div className="border-t border-slate-200 my-2 pt-2 flex justify-between items-center text-sm">
                                        <span className="text-[#002f6c] font-black uppercase tracking-wider">Monto Total:</span>
                                        <span className="font-extrabold text-[#002f6c]">{formatGs(totalGeneral)}</span>
                                    </div>
                                </div>

                                {/* Warning de límite de 35 */}
                                {selectedPaymentIds.length > 35 && (
                                    <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-700 font-semibold leading-relaxed border border-amber-200 flex gap-2">
                                        <AlertTriangle size={18} className="shrink-0 text-amber-600" />
                                        <span>
                                            Has superado las 35 transacciones. El reporte Excel se truncará en las firmas inferiores de la primera hoja. Se aconseja dividir el cierre.
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Botones de Acción */}
                            <div className="space-y-3">
                                <button
                                    onClick={ejecutarAuditoria}
                                    className="w-full py-3 bg-white border border-[#002f6c] text-[#002f6c] hover:bg-slate-50 rounded-xl font-bold text-xs uppercase tracking-widest transition-colors flex items-center justify-center gap-2"
                                >
                                    <Sparkles size={16} /> Auditar Selección
                                </button>
                                <button 
                                    onClick={handleProcesarCierre}
                                    disabled={selectedPaymentIds.length === 0 || processingCierre}
                                    className="w-full py-3.5 bg-gradient-to-r from-[#002f6c] to-[#001d4a] text-white hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl font-extrabold text-xs uppercase tracking-widest transition-all shadow-md shadow-[#002f6c]/10 flex items-center justify-center gap-2"
                                >
                                    {processingCierre ? (
                                        <>
                                            <RefreshCw className="animate-spin" size={16} />
                                            Procesando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle size={16} />
                                            Procesar e Imprimir Excel
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* TAB CENTRAL/DERECHO: TABLA DE COBROS PENDIENTES */}
                {activeTab === 'nuevo' && (
                    <div className="xl:col-span-3">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="text-base font-bold text-[#002f6c]">Transacciones Pendientes de Cierre</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Pagos verificados contablemente que no forman parte de ningún resumen de ingresos.</p>
                                </div>
                                
                                <div className="flex gap-2">
                                    <button 
                                        onClick={handleSelectAll}
                                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-wider transition-colors"
                                    >
                                        Seleccionar Todos
                                    </button>
                                    <button 
                                        onClick={handleDeselectAll}
                                        className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-wider transition-colors"
                                    >
                                        Deseleccionar
                                    </button>
                                    <button 
                                        onClick={loadPendingPayments}
                                        className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"
                                    >
                                        <RefreshCw size={14} className={loadingPending ? "animate-spin" : ""} />
                                    </button>
                                </div>
                            </div>

                            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80 sticky top-0 z-10">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-6 py-4 w-12 text-center">Sel</th>
                                            <th className="px-6 py-4">Postulante / CI</th>
                                            <th className="px-6 py-4">Concepto / Arancel</th>
                                            <th className="px-6 py-4">Monto</th>
                                            <th className="px-6 py-4">Método</th>
                                            <th className="px-6 py-4">Fecha Pago</th>
                                            <th className="px-6 py-4">Comprobante</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {pendingPayments.map((p) => {
                                            const isSelected = selectedPaymentIds.includes(p.id);
                                            const esEf = (p as any).metodo_pago === 'efectivo';
                                            return (
                                                <tr 
                                                    key={p.id} 
                                                    onClick={() => handleToggleSelect(p.id)}
                                                    className={`hover:bg-slate-50/80 transition-colors cursor-pointer ${
                                                        isSelected ? 'bg-[#d5e3ff]/10' : ''
                                                    }`}
                                                >
                                                    <td className="px-6 py-4 text-center" onClick={(e) => e.stopPropagation()}>
                                                        <input 
                                                            type="checkbox"
                                                            checked={isSelected}
                                                            onChange={() => handleToggleSelect(p.id)}
                                                            className="rounded border-slate-300 text-[#002f6c] focus:ring-[#002f6c] w-4 h-4"
                                                        />
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center font-bold text-[#002f6c] text-xs">
                                                                {p.nombre?.[0]}{p.apellido?.[0]}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-slate-800 uppercase leading-tight">{p.nombre} {p.apellido}</p>
                                                                <p className="text-[10px] text-slate-400 leading-none mt-1">{p.postulante_cedula}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-semibold text-slate-600 max-w-xs truncate uppercase">
                                                        {p.concepto}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs font-bold text-slate-800">
                                                        {formatGs(p.monto)}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs">
                                                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                                            esEf ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                                                        }`}>
                                                            {esEf ? 'Ventanilla' : 'Banco / Transf'}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-500 font-medium">
                                                        {p.fecha_pago ? new Date(p.fecha_pago).toLocaleDateString('es-PY') : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-xs text-slate-400 font-semibold font-mono">
                                                        {p.num_comprobante || '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                        {pendingPayments.length === 0 && !loadingPending && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-slate-400 italic">
                                                    No hay transacciones verificadas pendientes de cierre.
                                                </td>
                                            </tr>
                                        )}
                                        {loadingPending && (
                                            <tr>
                                                <td colSpan={7} className="px-6 py-16 text-center text-slate-400">
                                                    <RefreshCw size={24} className="animate-spin mx-auto text-slate-300 mb-2" />
                                                    <span>Cargando transacciones...</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* PESTAÑA: HISTORIAL DE CIERRES ANTERIORES */}
                {activeTab === 'historial' && (
                    <div className="col-span-4">
                        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-bold text-[#002f6c]">Histórico de Resúmenes de Ingresos</h3>
                                    <p className="text-xs text-slate-400 mt-0.5">Listado de cierres financieros cerrados y sus archivos oficiales.</p>
                                </div>
                                <button 
                                    onClick={loadHistory}
                                    className="p-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 transition-colors"
                                >
                                    <RefreshCw size={14} className={loadingHistory ? "animate-spin" : ""} />
                                </button>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50/80">
                                        <tr className="text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-100">
                                            <th className="px-8 py-4">Nro. de Cierre</th>
                                            <th className="px-8 py-4">Fecha de Cierre</th>
                                            <th className="px-8 py-4">Cantidad Cobros</th>
                                            <th className="px-8 py-4">Recaudado Total</th>
                                            <th className="px-8 py-4">Formato / Archivo</th>
                                            <th className="px-8 py-4 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {historicCierres.map((c) => (
                                            <tr key={c.cierre_nro} className="hover:bg-slate-50/50 transition-colors">
                                                <td className="px-8 py-5 text-sm font-black text-[#002f6c]">
                                                    CIERRE N° {c.cierre_nro}
                                                </td>
                                                <td className="px-8 py-5 text-xs text-slate-600 font-bold">
                                                    {new Date(c.cierre_fecha).toLocaleDateString('es-PY')}
                                                </td>
                                                <td className="px-8 py-5 text-xs text-slate-500 font-semibold">
                                                    {c.transacciones} pagos registrados
                                                </td>
                                                <td className="px-8 py-5 text-sm font-extrabold text-slate-800">
                                                    {formatGs(c.total)}
                                                </td>
                                                <td className="px-8 py-5">
                                                    <span className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100 w-fit">
                                                        <FileSpreadsheet size={14} /> Excel Autogenerado
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    <button 
                                                        onClick={() => handleDescargarHistorico(c.cierre_nro, c.cierre_fecha)}
                                                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-[10px] font-black uppercase tracking-wider rounded-lg flex items-center gap-1.5 shadow-sm transition-all ml-auto"
                                                    >
                                                        <Download size={14} /> Descargar
                                                    </button>
                                                </td>
                                            </tr>
                                        ))}
                                        {historicCierres.length === 0 && !loadingHistory && (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-16 text-center text-slate-400 italic">
                                                    No se registran cierres de caja históricos en el sistema.
                                                </td>
                                            </tr>
                                        )}
                                        {loadingHistory && (
                                            <tr>
                                                <td colSpan={6} className="px-8 py-16 text-center text-slate-400">
                                                    <RefreshCw size={24} className="animate-spin mx-auto text-slate-300 mb-2" />
                                                    <span>Buscando historial contable...</span>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ASISTENTE VIRTUAL: CIERRE-BOT IA */}
            <AnimatePresence>
                {botOpen && (
                    <motion.div 
                        initial={{ opacity: 0, y: 100, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 100, scale: 0.95 }}
                        className="fixed bottom-6 right-6 w-96 h-[500px] bg-white rounded-3xl border border-slate-200/80 shadow-2xl flex flex-col overflow-hidden z-50 shadow-slate-300"
                    >
                        {/* Cabecera del Bot */}
                        <div className="p-4 bg-gradient-to-r from-[#002f6c] to-[#001738] text-white flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                                    <Bot size={20} className="text-[#002f6c]" />
                                </div>
                                <div>
                                    <h4 className="text-xs font-black uppercase tracking-widest flex items-center gap-1.5">
                                        Cierre-Bot IA
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                                    </h4>
                                    <p className="text-[9px] text-white/60 font-semibold">Auditoría Financiera Digital</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setBotOpen(false)}
                                className="p-2 hover:bg-white/10 rounded-xl text-white/70 hover:text-white transition-colors"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* Contenedor de Mensajes */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                            {messages.map((m, idx) => (
                                <div 
                                    key={idx} 
                                    className={`flex gap-3 max-w-[85%] ${m.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
                                >
                                    {m.sender === 'bot' && (
                                        <div className="w-7 h-7 rounded-lg bg-slate-100 border flex items-center justify-center shrink-0">
                                            <Bot size={14} className="text-[#002f6c]" />
                                        </div>
                                    )}
                                    <div className={`p-3 rounded-2xl text-xs leading-relaxed ${
                                        m.sender === 'user'
                                            ? 'bg-[#002f6c] text-white rounded-tr-none'
                                            : 'bg-white text-slate-700 border rounded-tl-none font-medium'
                                    }`}>
                                        {/* Renderizado básico para negritas en Markdown */}
                                        {m.text.split('\n').map((line, lIdx) => {
                                            // Parseo simple de negritas **texto**
                                            const parts = line.split('**');
                                            return (
                                                <p key={lIdx} className={lIdx > 0 ? "mt-1.5" : ""}>
                                                    {parts.map((part, pIdx) => {
                                                        if (pIdx % 2 === 1) {
                                                            return <strong key={pIdx} className="font-extrabold">{part}</strong>;
                                                        }
                                                        return part;
                                                    })}
                                                </p>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Preguntas Frecuentes Sugeridas */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex flex-wrap gap-1.5 shrink-0">
                            <button 
                                onClick={() => {
                                    setUserInput('¿Existe un límite de transacciones por Excel?');
                                    setTimeout(() => handleSendMessage(), 100);
                                }}
                                className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-500 rounded-lg transition-colors"
                            >
                                ¿Límite de filas?
                            </button>
                            <button 
                                onClick={() => {
                                    setUserInput('¿Cómo se calcula la Hoja 2 del Excel?');
                                    setTimeout(() => handleSendMessage(), 100);
                                }}
                                className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-500 rounded-lg transition-colors"
                            >
                                ¿Hoja 2 Códigos?
                            </button>
                            <button 
                                onClick={() => {
                                    setUserInput('¿Cómo realizo el cierre paso a paso?');
                                    setTimeout(() => handleSendMessage(), 100);
                                }}
                                className="text-[9px] font-black uppercase tracking-wider px-2.5 py-1 bg-white hover:bg-slate-100 border text-slate-500 rounded-lg transition-colors"
                            >
                                Paso a paso
                            </button>
                        </div>

                        {/* Input del Chat */}
                        <form 
                            onSubmit={handleSendMessage}
                            className="p-3 border-t bg-white flex gap-2 shrink-0 items-center"
                        >
                            <input 
                                type="text"
                                placeholder="Hazme una pregunta sobre el cierre..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-xs outline-none focus:border-[#002f6c] transition-colors"
                            />
                            <button 
                                type="submit"
                                className="p-2.5 bg-[#002f6c] text-white rounded-xl hover:bg-[#001738] transition-colors"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
