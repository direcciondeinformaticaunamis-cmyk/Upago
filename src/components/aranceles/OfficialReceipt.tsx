import React, { useRef } from 'react';
import { 
    Download, Printer, Mail, ShieldCheck, QrCode, 
    Send, ChevronRight, FileText, CheckCircle2, 
    ArrowLeft, History, Info
} from 'lucide-react';
import { motion } from 'framer-motion';

interface ReceiptItem {
    codigo: string;
    concepto: string;
    cantidad: number;
    unitario: number;
    total: number;
}

interface ReceiptProps {
    receiptNumber?: string;
    fecha?: string;
    pagador?: string;
    cedula?: string;
    items?: ReceiptItem[];
    totalLetras?: string;
    onClose?: () => void;
}

const OfficialReceipt: React.FC<ReceiptProps> = ({
    receiptNumber = '0003847',
    fecha = '24 de Mayo, 2024',
    pagador = 'Lic. Carlos Roberto Benítez Silva',
    cedula = '1.234.567',
    items = [
        { codigo: '1.02.04.01', concepto: 'Matrícula Anual Grado', cantidad: 1, unitario: 750000, total: 750000 },
        { codigo: '1.02.04.05', concepto: 'Aranceles de Laboratorio', cantidad: 1, unitario: 150000, total: 150000 },
        { codigo: '1.09.02.10', concepto: 'Expedición de Carnet Universitario', cantidad: 1, unitario: 50000, total: 50000 },
    ],
    totalLetras = 'Novecientos cincuenta mil guaraníes exactos.',
    onClose
}) => {
    const total = items.reduce((acc, item) => acc + item.total, 0);
    const formatGs = (n: number) => new Intl.NumberFormat('es-PY').format(n);

    const handlePrint = () => {
        window.print();
    };

    return (
        <>
            <style>
                {`
                @media print {
                    body * {
                        visibility: hidden;
                    }
                    .print-container, .print-container * {
                        visibility: visible;
                    }
                    .print-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        color: black;
                    }
                    /* Ocultamos el scroll para impresión */
                    ::-webkit-scrollbar {
                        display: none;
                    }
                }
                `}
            </style>

            <div className="w-full max-w-5xl mx-auto space-y-8 pb-12 print:hidden">
                {/* Top Header */}
                <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
                    <span className="text-xl font-black text-[#001738] tracking-tight">UNAMIS Financial</span>
                    <div className="flex items-center gap-6">
                        <div className="flex gap-4 text-slate-400">
                            <button className="hover:text-slate-600 transition-colors"><Printer size={18} /></button>
                            <button className="hover:text-slate-600 transition-colors"><Download size={18} /></button>
                            <button className="hover:text-slate-600 transition-colors"><Send size={18} /></button>
                        </div>
                        <div className="w-px h-6 bg-slate-200"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-bold text-[#001738]">Dr. Alejandro Mendez</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-widest">Oficial Financiero</p>
                            </div>
                            <div className="w-10 h-10 rounded-full overflow-hidden bg-slate-200 border border-slate-300">
                                <img src="https://ui-avatars.com/api/?name=Alejandro+Mendez&background=002f6c&color=fff" alt="User" className="w-full h-full object-cover" />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Title and Main Actions */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-[28px] font-bold text-[#001738] tracking-tight mb-1">Gestión de Facturas</h1>
                        <p className="text-sm text-slate-500 font-medium">Visualizando comprobante digital oficial para registros institucionales.</p>
                    </div>
                    <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                            <Mail size={16} /> Enviar por Correo
                        </button>
                        <button className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-md text-sm font-bold text-slate-600 hover:bg-slate-50 shadow-sm transition-all">
                            <Download size={16} /> Descargar PDF
                        </button>
                        <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-[#001738] text-white rounded-md text-sm font-bold shadow-md hover:bg-[#002f6c] transition-all">
                            <Printer size={16} /> Imprimir
                        </button>
                    </div>
                </header>

                {/* The Digital Invoice Mockup */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white shadow-sm border border-slate-100 rounded-2xl overflow-hidden"
                >
                    {/* Header of Receipt */}
                    <div className="p-10 flex flex-col md:flex-row justify-between items-start gap-8">
                        <div className="flex gap-6 items-center">
                            <div className="w-20 h-20 rounded-lg overflow-hidden bg-slate-100 flex items-center justify-center border border-slate-200">
                                <img src="https://ui-avatars.com/api/?name=U&background=64748b&color=fff&size=80" alt="UNAMIS Logo" className="w-full h-full object-cover opacity-80" />
                            </div>
                            <div>
                                <h2 className="text-xl font-black text-[#001738] tracking-tight mb-1">UNIVERSIDAD NACIONAL<br/>DE MISIONES</h2>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Estatuto de la UNAMIS</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="bg-[#f8fafc] px-6 py-3 rounded-lg border border-slate-100 mb-4 inline-block">
                                <span className="text-[#001738] font-bold text-sm tracking-[0.2em] uppercase">Comprobante de Ingreso</span>
                            </div>
                            <p className="text-sm font-bold text-[#001738] mb-1">RUC: 80131029-6</p>
                            <p className="text-[10px] text-slate-500">Encarnación - Misiones, Paraguay</p>
                        </div>
                    </div>

                    <div className="px-10">
                        <div className="w-full h-px bg-slate-100 mb-8"></div>
                    </div>

                    {/* Info Grid */}
                    <div className="px-10 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12 mb-8">
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">De (Pagador):</p>
                            <p className="text-base font-bold text-[#001738]">{pagador}</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Comprobante N°:</p>
                            <p className="text-base font-bold text-red-600 tracking-wider">{receiptNumber}</p>
                        </div>
                        <div className="md:col-span-2">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Concepto de Pago:</p>
                            <p className="text-sm text-slate-700">Pago de Matrícula y Aranceles Administrativos - Facultad de Ciencias Económicas (Periodo 2024)</p>
                        </div>
                        <div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-1">Fecha de Emisión:</p>
                            <p className="text-sm text-slate-700">{fecha}</p>
                        </div>
                    </div>

                    <div className="px-10">
                        <div className="w-full h-px bg-slate-100 mb-8"></div>
                    </div>

                    {/* Table */}
                    <div className="px-10 mb-8">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-[#f8fafc] border-y border-slate-100">
                                    <th className="py-3 px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Código</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest">Concepto</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-center">Cant.</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">Valor Unit.</th>
                                    <th className="py-3 px-4 text-[9px] font-bold text-slate-500 uppercase tracking-widest text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {items.map((item, i) => (
                                    <tr key={i}>
                                        <td className="py-4 px-4 text-xs font-mono text-slate-500">{item.codigo}</td>
                                        <td className="py-4 px-4 text-xs font-bold text-[#001738]">{item.concepto}</td>
                                        <td className="py-4 px-4 text-xs text-slate-600 text-center">{item.cantidad.toString().padStart(2, '0')}</td>
                                        <td className="py-4 px-4 text-xs text-slate-600 text-right">Gs. {formatGs(item.unitario)}</td>
                                        <td className="py-4 px-4 text-sm font-bold text-[#001738] text-right">{formatGs(item.total)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Totals */}
                    <div className="px-10 pb-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
                        <div className="flex-1 max-w-lg w-full">
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mb-2">Total en Letras:</p>
                            <div className="bg-[#f8fafc] p-4 rounded-md border border-slate-100">
                                <p className="text-xs italic text-slate-600">{totalLetras} -------------------------------------------------------------------------------------</p>
                            </div>
                        </div>
                        <div className="bg-[#002f6c] text-white p-6 rounded-lg shadow-lg min-w-[240px]">
                            <p className="text-[9px] font-bold text-white/60 uppercase tracking-widest mb-1 text-right">Total Gs.</p>
                            <p className="text-3xl font-black text-right">{formatGs(total)}</p>
                        </div>
                    </div>

                    {/* Signatures */}
                    <div className="px-10 pb-12 grid grid-cols-2 gap-12 relative">
                        <div className="text-center pt-16">
                            <div className="w-full h-px bg-slate-300 mb-3"></div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Firma del Interesado</p>
                        </div>
                        <div className="text-center pt-16 relative">
                            <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
                                {/* Large faint stamp effect */}
                                <div className="w-40 h-40 border-4 border-slate-900 rounded-full flex items-center justify-center transform -rotate-12">
                                    <span className="font-bold text-slate-900 text-xl tracking-widest uppercase">Pagado</span>
                                </div>
                            </div>
                            <div className="w-full h-px bg-slate-300 mb-3"></div>
                            <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Perceptor</p>
                            <p className="text-[8px] text-slate-400 mt-1">Dpto. de Tesorería - UNAMIS</p>
                            <img src="https://upload.wikimedia.org/wikipedia/commons/f/f6/Firma_falsa_ejemplo.png" alt="Signature" className="absolute bottom-6 left-1/2 -translate-x-1/2 w-32 h-16 object-contain opacity-50 mix-blend-multiply" />
                        </div>
                    </div>
                </motion.div>

                {/* Info Cards Row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <History size={16} className="text-[#001738]" />
                            <h4 className="text-sm font-bold text-[#001738]">Historial de Pagos</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-4">Último pago registrado hace 15 días.</p>
                        <div className="space-y-2">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">#0003842</span>
                                <span className="font-bold text-[#001738]">Gs. 420.000</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500">#0003812</span>
                                <span className="font-bold text-[#001738]">Gs. 85.000</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-100 flex flex-col items-center">
                        <div className="flex items-center gap-3 mb-4 w-full">
                            <ShieldCheck size={16} className="text-[#001738]" />
                            <h4 className="text-sm font-bold text-[#001738]">Verificación Digital</h4>
                        </div>
                        <div className="w-full flex-1 bg-[#535254] rounded-md p-4 flex flex-col items-center justify-center relative overflow-hidden">
                            <div className="w-24 h-24 border-2 border-white/20 p-2 border-dashed">
                                <QrCode size={80} className="text-white/80" />
                            </div>
                            <p className="text-[7px] text-center text-white/60 uppercase mt-4 max-w-[150px]">
                                Escanee para validar la autenticidad de este comprobante en el portal oficial.
                            </p>
                        </div>
                    </div>

                    <div className="bg-[#f8fafc] p-6 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <FileText size={16} className="text-[#001738]" />
                            <h4 className="text-sm font-bold text-[#001738]">Notas Internas</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 mb-6 leading-relaxed">
                            El comprobante fue emitido automáticamente tras la confirmación de transferencia bancaria vía Banco Regional.
                        </p>
                        <div className="flex items-center gap-2 text-emerald-600">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-bold uppercase tracking-widest">CONCILIADO</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Print Only Invoice Format (Mirrors Image 2 perfectly) */}
            <div className="hidden print:block print-container bg-white" style={{ fontFamily: "Arial, sans-serif", fontSize: "12px", width: "210mm" }}>
                <div className="w-full mx-auto p-4 border border-black min-h-[140mm]">
                    {/* Header */}
                    <div className="flex border-b border-black">
                        <div className="w-[60%] p-2 text-center border-r border-black flex flex-col justify-center">
                            <h1 className="font-bold text-[15px] mb-1">UNIVERSIDAD NACIONAL DE MISIONES</h1>
                            <h2 className="font-bold text-[13px] mb-1">ESTATUTO DE LA UNAMIS</h2>
                            <p className="text-[10px] mb-2">Aprobado por la Asamblea Universitaria de fecha 15-04-2024</p>
                            <p className="text-[10px] font-bold mb-1">Misiones - Paraguay</p>
                            <p className="text-[9px]">Correo electrónico: rectorado@unamis.edu.py</p>
                        </div>
                        <div className="w-[40%] p-2 text-center flex flex-col justify-center items-center">
                            <h2 className="font-bold text-[14px] mb-1">COMPROBANTE DE INGRESO</h2>
                            <p className="font-bold text-[12px] mb-2">RUC: 80131029 - 6</p>
                            <p className="text-[9px] mb-0">Resolución D.G.T.P. N.°: 70</p>
                            <p className="text-[9px] mb-3">Serie: "UNAMIS"</p>
                            <div className="text-2xl font-normal flex items-center gap-2">
                                <span>N°</span> 
                                <span className="font-mono tracking-widest">{receiptNumber}</span>
                            </div>
                        </div>
                    </div>

                    {/* Middle Section 1 */}
                    <div className="border-b border-black flex">
                        <div className="w-1/2 p-1 text-center border-r border-black font-bold text-[11px]">DE:</div>
                        <div className="w-1/2 p-1 text-center font-bold text-[11px]">DE:</div>
                    </div>
                    
                    <div className="border-b border-black flex">
                        <div className="w-full p-1 flex">
                            <span className="w-48 text-[11px] uppercase">Nombre o Razón Social:</span>
                            <span className="flex-1 font-bold text-[11px]">{pagador}</span>
                        </div>
                    </div>
                    <div className="border-b border-black flex">
                        <div className="w-full p-1 flex">
                            <span className="w-48 text-[11px] uppercase">RUC/CI:</span>
                            <span className="flex-1 text-[11px]">{cedula}</span>
                        </div>
                    </div>
                    <div className="border-b border-black flex">
                        <div className="w-2/3 p-1 flex border-r border-black">
                            <span className="w-32 text-[11px] uppercase">Dirección:</span>
                            <span className="flex-1 text-[11px]"></span>
                        </div>
                        <div className="w-1/3 p-1 flex">
                            <span className="w-24 text-[11px] uppercase">Teléfono:</span>
                            <span className="flex-1 text-[11px]"></span>
                        </div>
                    </div>
                    <div className="border-b border-black flex">
                        <div className="w-full p-1 flex">
                            <span className="w-48 text-[11px] uppercase">Dependencia:</span>
                            <span className="flex-1 text-[11px]"></span>
                        </div>
                    </div>

                    {/* Main Table */}
                    <div className="border-b border-black flex mt-2">
                        <div className="w-1/3 border-r border-black">
                            <div className="border-b border-black text-center font-bold p-1 text-[11px]">CODIGO</div>
                            <div className="flex">
                                <div className="w-1/2 text-[9px] text-center border-r border-black p-1">PRESUPUESTARIO</div>
                                <div className="w-1/2 text-[9px] text-center p-1">CONTABLE</div>
                            </div>
                        </div>
                        <div className="w-[35%] border-r border-black flex items-center justify-center font-bold text-[11px]">
                            CONCEPTO
                        </div>
                        <div className="w-[8%] border-r border-black text-center text-[9px] flex items-center justify-center">
                            CANTIDAD
                        </div>
                        <div className="flex-1">
                            <div className="border-b border-black text-center text-[11px] font-bold p-1">VALOR</div>
                            <div className="flex">
                                <div className="w-1/2 text-[9px] text-center border-r border-black p-1">UNITARIO</div>
                                <div className="w-1/2 text-[9px] text-center p-1">TOTAL</div>
                            </div>
                        </div>
                    </div>

                    {/* Table rows */}
                    <div className="flex border-b border-black min-h-[120px]">
                        <div className="w-1/3 border-r border-black flex">
                            <div className="w-1/2 border-r border-black p-1 text-[10px] font-mono whitespace-pre-wrap">
                                {items.map(item => item.codigo).join('\n')}
                            </div>
                            <div className="w-1/2 p-1"></div>
                        </div>
                        <div className="w-[35%] border-r border-black p-1 text-[10px] whitespace-pre-wrap">
                            {items.map(item => item.concepto).join('\n')}
                        </div>
                        <div className="w-[8%] border-r border-black p-1 text-[10px] text-center whitespace-pre-wrap">
                            {items.map(item => item.cantidad).join('\n')}
                        </div>
                        <div className="flex-1 flex">
                            <div className="w-1/2 border-r border-black p-1 text-[10px] text-right whitespace-pre-wrap">
                                {items.map(item => formatGs(item.unitario)).join('\n')}
                            </div>
                            <div className="w-1/2 p-1 text-[10px] text-right whitespace-pre-wrap">
                                {items.map(item => formatGs(item.total)).join('\n')}
                            </div>
                        </div>
                    </div>

                    {/* Footer of Table */}
                    <div className="flex border-b border-black">
                        <div className="w-[76.3%] border-r border-black p-1 font-bold text-[11px]">TOTAL</div>
                        <div className="flex-1 p-1 text-right font-bold text-[11px]">{formatGs(total)}</div>
                    </div>
                    <div className="flex border-b border-black">
                        <div className="w-[76.3%] border-r border-black p-1 flex">
                            <span className="font-bold mr-2 uppercase text-[11px]">Guaraníes:</span>
                            <span className="text-[10px] italic leading-tight">{totalLetras}</span>
                        </div>
                        <div className="flex-1 p-1 flex items-end">
                            <span className="font-bold mr-2 text-[11px]">Gs.</span>
                            <span className="flex-1 text-right font-bold"></span>
                        </div>
                    </div>

                    {/* Additional Payment Info */}
                    <div className="border border-black mt-2 rounded-md overflow-hidden">
                        <div className="border-b border-black p-1 flex text-[10px]">
                            <div className="w-1/2">PAGADO EN CHEQUE N°</div>
                            <div className="w-1/2">C/ Banco</div>
                        </div>
                        <div className="border-b border-black p-1 flex text-[10px]">
                            <div className="w-1/2">TRANSFERENCIA BANCARIA N°</div>
                            <div className="w-1/2">C/ Banco</div>
                        </div>
                        <div className="p-1 min-h-[30px] text-[10px]">
                            OBSERVACIÓN
                        </div>
                    </div>

                    <div className="mt-12 flex justify-end pr-10">
                        <div className="w-48 text-center border-t border-black pt-1 text-[11px]">
                            PERCEPTOR
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default OfficialReceipt;
