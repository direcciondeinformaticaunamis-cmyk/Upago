import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
    Search, Bell, Settings2, User, Calendar, 
    ChevronDown, Download, FileSpreadsheet, RefreshCw
} from 'lucide-react';
import { FinanceService, Payment, FinanceStats } from '../../services/FinanceService';

const FinancialReports: React.FC = () => {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [stats, setStats] = useState<FinanceStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [paymentsData, statsData] = await Promise.all([
                FinanceService.getPagos(),
                FinanceService.getFinanceStats()
            ]);
            setPayments(paymentsData);
            setStats(statsData);
        } catch (error) {
            console.error('Error loading financial data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(amount);
    };

    const handleExportPDF = () => {
        const verifiedPayments = (payments || []).filter(p => p.estado === 'verificado');
        const total = verifiedPayments.reduce((sum, p) => sum + p.monto, 0);
        
        const fechaReporte = new Date().toLocaleDateString('es-PY');
        
        const printWindow = window.open('', '_blank');
        if (!printWindow) return;

        const html = `
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Reporte de Ingresos - UNAMIS</title>
                <style>
                    body { font-family: 'Arial', sans-serif; padding: 40px; color: #333; }
                    .header { text-align: center; border-bottom: 3px solid #001738; padding-bottom: 20px; margin-bottom: 30px; }
                    .logo-text { font-size: 24px; font-weight: bold; color: #001738; text-transform: uppercase; }
                    .sub-text { font-size: 14px; color: #666; margin-top: 5px; }
                    .report-title { font-size: 18px; font-weight: bold; margin: 20px 0; text-align: center; text-transform: uppercase; }
                    .meta-info { margin-bottom: 30px; font-size: 14px; }
                    table { w-full; width: 100%; border-collapse: collapse; margin-bottom: 30px; font-size: 12px; }
                    th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
                    th { background-color: #f8fafc; font-weight: bold; color: #001738; text-transform: uppercase; font-size: 11px; }
                    .amount { text-align: right; font-family: monospace; font-size: 13px; font-weight: bold; }
                    .total-row { background-color: #001738; color: white; font-weight: bold; }
                    .total-row td { border-color: #001738; }
                    .footer { margin-top: 80px; text-align: center; font-size: 12px; }
                    .signature-line { width: 250px; border-top: 1px solid #000; margin: 0 auto 10px auto; }
                    @media print {
                        @page { margin: 1.5cm; }
                        body { padding: 0; -webkit-print-color-adjust: exact; }
                    }
                </style>
            </head>
            <body>
                <div class="header">
                    <div class="logo-text">Universidad Nacional de Misiones</div>
                    <div class="sub-text">Departamento de Administración y Finanzas</div>
                    <div class="sub-text">Sistema de Gestión UPAGO</div>
                </div>
                
                <div class="report-title">Reporte Diario de Ingresos Verificados</div>
                
                <div class="meta-info">
                    <strong>Fecha del Reporte:</strong> ${fechaReporte}<br>
                    <strong>Generado para:</strong> UNAMIS Docs (Mesa de Entrada)
                </div>

                <table>
                    <thead>
                        <tr>
                            <th>ID Transacción</th>
                            <th>Fecha de Pago</th>
                            <th>Postulante</th>
                            <th>Concepto</th>
                            <th style="text-align: right;">Monto (Gs.)</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${verifiedPayments.map(p => `
                            <tr>
                                <td>#${p.id.toString().padStart(6, '0')}</td>
                                <td>${p.fecha_pago}</td>
                                <td>
                                    <strong>${p.nombre || 'N/A'}</strong><br>
                                    <span style="color: #666; font-size: 10px;">CI: ${p.postulante_cedula || 'N/A'}</span>
                                </td>
                                <td>${p.concepto}</td>
                                <td class="amount">${p.monto.toLocaleString('es-PY')}</td>
                            </tr>
                        `).join('')}
                        <tr class="total-row">
                            <td colspan="4" style="text-align: right; padding-right: 20px;">TOTAL RECAUDADO:</td>
                            <td class="amount">${total.toLocaleString('es-PY')} Gs.</td>
                        </tr>
                    </tbody>
                </table>

                <div class="footer">
                    <div class="signature-line"></div>
                    <strong>Firma y Sello del Responsable</strong><br>
                    <span style="color: #666;">Caja Central - UNAMIS</span>
                </div>
                
                <script>
                    window.onload = function() { window.print(); }
                </script>
            </body>
            </html>
        `;

        printWindow.document.open();
        printWindow.document.write(html);
        printWindow.document.close();
    };

    return (
        <div className="w-full max-w-7xl mx-auto pb-12">
            {/* Top Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-10">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-[#001738] tracking-tighter">UPAGO</span>
                    <span className="w-px h-6 bg-slate-200"></span>
                    <span className="text-sm font-bold text-blue-600 border-b-2 border-blue-600 pb-1">Gestión Financiera</span>
                </div>
                <div className="flex items-center gap-6 text-slate-400">
                    <button onClick={loadData} className="hover:text-slate-600 transition-colors"><RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} /></button>
                    <button className="hover:text-slate-600 transition-colors"><Bell size={20} /></button>
                    <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-white"><User size={16} /></div>
                    </div>
                </div>
            </div>

            {/* Title Area */}
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 mb-8">
                <div>
                    <h1 className="text-[22px] font-bold text-[#001738] mb-1">
                        Reporte de Ingresos Real
                    </h1>
                    <p className="text-[14px] text-slate-600 font-medium">
                        Resumen Contable de Aranceles - Gestión {new Date().getFullYear()}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={handleExportPDF}
                        className="flex items-center gap-2 px-5 py-2.5 bg-[#001738] text-white rounded-md text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm"
                    >
                        <Download size={16} /> Exportar PDF
                    </button>
                    <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-md text-sm font-bold hover:bg-slate-50 transition-colors shadow-sm">
                        <FileSpreadsheet size={16} /> Exportar Excel
                    </button>
                </div>
            </div>

            {/* Dashboard Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Conceptos de Pago */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col items-center">
                    <h3 className="text-xs font-bold text-[#001738] uppercase tracking-widest w-full text-left mb-6">Estado de Recaudación</h3>
                    
                    <div className="relative w-48 h-48 mb-6">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="15" className="stroke-slate-100" />
                            <circle cx="50" cy="50" r="40" fill="transparent" strokeWidth="15" className="stroke-[#002f6c]" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * 0.75)} />
                        </svg>
                        
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-2xl font-black text-[#001738]">{stats ? '75%' : '0%'}</span>
                            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Eficiencia</span>
                        </div>
                    </div>

                    <div className="w-full space-y-3">
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-[#002f6c]"></div>
                                <span className="text-slate-600 font-medium">Recaudado Hoy</span>
                            </div>
                            <span className="font-bold text-[#001738]">{stats ? formatCurrency(stats.recaudacion_hoy) : '0'}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-400"></div>
                                <span className="text-slate-600 font-medium">Pendientes</span>
                            </div>
                            <span className="font-bold text-[#001738]">{stats ? stats.pendientes_conciliar : '0'}</span>
                        </div>
                    </div>
                </div>

                {/* Tendencia */}
                <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 flex flex-col">
                    <h3 className="text-xs font-bold text-[#001738] uppercase tracking-widest mb-8">Tendencia Mensual</h3>
                    
                    <div className="space-y-6 flex-1">
                        {stats?.tendencia?.map((item, idx) => (
                            <div key={idx}>
                                <div className="flex justify-between items-end mb-2">
                                    <span className="text-xs text-slate-600 font-medium">{item.mes}</span>
                                    <span className="text-xs font-bold text-[#001738]">{formatCurrency(item.total)}</span>
                                </div>
                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-[#001738] rounded-full" style={{ width: `${Math.min(100, (item.total / 10000000) * 100)}%` }}></div>
                                </div>
                            </div>
                        ))}
                        {(!stats || stats.tendencia.length === 0) && (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs italic">
                                No hay datos de tendencia suficientes.
                            </div>
                        )}
                    </div>
                </div>

                {/* Resumen */}
                <div className="bg-[#002f6c] rounded-xl shadow-sm p-6 flex flex-col text-white">
                    <h3 className="text-xs font-bold uppercase tracking-widest mb-6 opacity-90">Resumen Operativo</h3>
                    
                    <div className="space-y-4 flex-1">
                        <div className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold">Postulantes Registrados Hoy</p>
                                <p className="text-[10px] text-white/60 mt-0.5">Ingresos al sistema</p>
                            </div>
                            <span className="text-xl font-black">{stats?.registrados_hoy || 0}</span>
                        </div>
                        
                        <div className="p-4 border border-white/10 rounded-lg bg-white/5 flex justify-between items-center">
                            <div>
                                <p className="text-sm font-bold">Pagos por Verificar</p>
                                <p className="text-[10px] text-white/60 mt-0.5">Cola de administración</p>
                            </div>
                            <span className="text-xl font-black">{stats?.pendientes_conciliar || 0}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="bg-white px-6 py-5 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <h3 className="font-bold text-[#001738] text-sm uppercase tracking-widest">Detalle Real de Pagos</h3>
                    <div className="relative w-full sm:w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                        <input 
                            type="text" 
                            placeholder="Buscar en pagos..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-md text-xs font-medium outline-none focus:ring-2 focus:ring-blue-500/20 transition-all text-slate-700"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-[#f8fafc] border-b border-slate-100">
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Fecha</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Postulante / Cédula</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Concepto</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto</th>
                                <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {payments?.map((p) => (
                                <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-5 text-sm font-medium text-[#001738]">{new Date(p.fecha_registro).toLocaleDateString()}</td>
                                    <td className="px-6 py-5">
                                        <p className="text-sm font-bold text-[#001738]">{p.nombre} {p.apellido}</p>
                                        <p className="text-[10px] text-slate-400">{p.postulante_cedula}</p>
                                    </td>
                                    <td className="px-6 py-5 text-sm text-slate-600">{p.concepto}</td>
                                    <td className="px-6 py-5 text-sm font-bold text-[#001738] font-mono">{formatCurrency(p.monto)}</td>
                                    <td className="px-6 py-5">
                                        <span className={`px-3 py-1 rounded text-[9px] font-black uppercase tracking-widest ${
                                            p.estado === 'verificado' 
                                            ? 'bg-emerald-100 text-emerald-700' 
                                            : p.estado === 'rechazado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                                        }`}>
                                            {p.estado}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payments.length === 0 && !isLoading && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 font-medium italic">
                                        No hay pagos registrados en la base de datos.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="bg-[#f8fafc] px-6 py-4 border-t border-slate-100 flex justify-center">
                    <button onClick={loadData} className="text-[10px] font-black text-[#001738] uppercase tracking-widest hover:underline flex items-center gap-2">
                        <RefreshCw size={12} /> Refrescar Datos
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FinancialReports;
