import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, User, CreditCard, Phone, MapPin, Calendar, 
    Upload, FileText, CheckCircle2, Send, AlertCircle, 
    ArrowLeft, Printer, Banknote, Clock, DollarSign,
    School, ChevronDown, Settings2, Download, Home, MailCheck
} from 'lucide-react';
import { FinanceService } from '../../services/FinanceService';
import { CATALOGO_UNAMIS, TODAS_LAS_CARRERAS } from '../../constants/catalogoUnamis';
import Tesseract from 'tesseract.js';

interface Arancel {
    id: number;
    categoria: string;
    concepto: string;
    monto: number;
    descripcion: string;
}



interface Props {
    postulanteName?: string;
    postulanteCedula?: string;
    postulanteCarrera?: string;
    postulanteSede?: string;
    onSuccess: () => void;
    onBack?: () => void;
    mode?: 'postulante' | 'admin';
    isDocente?: boolean;
}

const PaymentRegistrationForm: React.FC<Props> = ({ 
    postulanteName = '', 
    postulanteCedula = '', 
    postulanteCarrera = '',
    postulanteSede = '',
    onSuccess, 
    onBack,
    mode = 'postulante',
    isDocente = false
}) => {
    const [concepto, setConcepto] = useState('matricula');
    const [selectedSede, setSelectedSede] = useState(postulanteSede || 'Sede San Ignacio Guazú');
    const [isCustomSede, setIsCustomSede] = useState(false);
    const [customSede, setCustomSede] = useState('');
    const [isCustomCarrera, setIsCustomCarrera] = useState(false);
    const [customCarrera, setCustomCarrera] = useState('');
    const [selectedCohorte, setSelectedCohorte] = useState('Primer Semestre - 2024');
    const [isCustomCohorte, setIsCustomCohorte] = useState(false);
    const [customCohorte, setCustomCohorte] = useState('');
    const [form, setForm] = useState({
        nombre: postulanteName, 
        cedula: postulanteCedula, 
        telefono: '',
        direccion: '', 
        carrera: postulanteCarrera || (CATALOGO_UNAMIS[postulanteSede || 'Sede San Ignacio Guazú']?.[0] || 'Medicina'), 
        titular: '',
        numComprobante: '', 
        fechaPago: new Date().toISOString().slice(0, 16), 
        monto: '',
        asignatura: ''
    });
    const [searchId, setSearchId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [errors, setErrors] = useState<string[]>([]);
    const [dynamicAranceles, setDynamicAranceles] = useState<Arancel[]>([]);
    const [loadingAranceles, setLoadingAranceles] = useState(true);

    React.useEffect(() => {
        const fetchAranceles = async () => {
            try {
                const data = await FinanceService.getAranceles();
                if (Array.isArray(data)) {
                    setDynamicAranceles(data);
                    if (data.length > 0) {
                        setConcepto(data[0].id.toString());
                        setForm(f => ({ ...f, monto: data[0].monto.toString() }));
                    }
                }
            } catch (err) {
                console.error("Error fetching aranceles:", err);
            } finally {
                setLoadingAranceles(false);
            }
        };
        fetchAranceles();
    }, []);

    const set = (k: string, v: string) => setForm(p => ({ ...p, [k]: v }));

    const handleOcrScan = async (selectedFile: File) => {
        setIsScanning(true);
        try {
            const result = await Tesseract.recognize(selectedFile, 'spa');
            const text = result.data.text.toUpperCase();
            
            // Monto regex (soporta ₲, Gs., GS, comas o puntos)
            const montoMatch = text.match(/(?:GS\.?|GUARANIES|MONTO|₲)?\s*([1-9]\d{0,2}(?:[.,]\d{3})+)/);
            if (montoMatch && montoMatch[1]) {
                const cleanedMonto = montoMatch[1].replace(/[^0-9]/g, '');
                if (cleanedMonto) set('monto', cleanedMonto);
            } else {
                // Fallback for amounts without dots but after 'GS' or '₲'
                const fallbackMatch = text.match(/(?:GS\.?|₲)\s*(\d{4,10})/);
                if (fallbackMatch && fallbackMatch[1]) {
                    set('monto', fallbackMatch[1]);
                }
            }
            
            // Comprobante regex (muy flexible por el ruido del OCR)
            const compMatch = text.match(/(?:COMPROBANTE|NRO|N°|Nº|NUMERO|REF|TRANSACCION|DOCUMENTO|RECIBO)[^\d]{0,20}?(\d{6,15})/);
            if (compMatch && compMatch[1]) {
                set('numComprobante', compMatch[1]);
            }

            // Fecha y Hora regex (soporta multiples formatos)
            const months: {[key: string]: string} = {
                'JAN': '01', 'FEB': '02', 'MAR': '03', 'APR': '04', 'MAY': '05', 'JUN': '06',
                'JUL': '07', 'AUG': '08', 'SEP': '09', 'OCT': '10', 'NOV': '11', 'DEC': '12',
                'ENE': '01', 'ABR': '04', 'AGO': '08', 'DIC': '12'
            };

            let fechaEncontrada = false;
            
            // 1. Formato YYYY-MM-DD HH:MM:SS (BNF)
            const bnfMatch = text.match(/(\d{4})[\/\-](\d{2})[\/\-](\d{2})\s+(\d{2}:\d{2})/);
            if (bnfMatch) {
                set('fechaPago', `${bnfMatch[1]}-${bnfMatch[2]}-${bnfMatch[3]}T${bnfMatch[4]}`);
                fechaEncontrada = true;
            }

            // 2. Formato DD/MM/YYYY HH:MM (Ueno)
            if (!fechaEncontrada) {
                const slashMatch = text.match(/(\d{2})[\/\-](\d{2}|[A-Z]{3,4})[\/\-](\d{2,4})[^\d]*(\d{2}:\d{2})/);
                if (slashMatch) {
                    let d = slashMatch[1];
                    let m = slashMatch[2];
                    let y = slashMatch[3];
                    if (y.length === 2) y = "20" + y;
                    if (isNaN(Number(m))) {
                        const mStr = m.substring(0,3);
                        m = months[mStr] || '01';
                    }
                    set('fechaPago', `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T${slashMatch[4]}`);
                    fechaEncontrada = true;
                }
            }

            // 3. Formato texto "20 MAY 2026 a las 10:53" (Itaú, Continental, Eko)
            if (!fechaEncontrada) {
                const textDateMatch = text.match(/(\d{1,2})\s*[\/\-]?\s*([A-Z]{3,10})\s*[\/\-]?\s*(\d{4})[^\d]*(\d{2}:\d{2})?/);
                if (textDateMatch) {
                    let d = textDateMatch[1];
                    let mStr = textDateMatch[2].substring(0,3);
                    let m = months[mStr] || '01';
                    let y = textDateMatch[3];
                    let time = textDateMatch[4] || "00:00"; // Fallback to 00:00 if no time
                    set('fechaPago', `${y}-${m.padStart(2,'0')}-${d.padStart(2,'0')}T${time}`);
                    fechaEncontrada = true;
                }
            }

        } catch (error) {
            console.error("OCR Error:", error);
        } finally {
            setIsScanning(false);
        }
    };

    const validate = () => {
        const e: string[] = [];
        if (!form.nombre.trim()) e.push('nombre');
        if (!form.cedula.trim()) e.push('cedula');
        if (!form.numComprobante.trim()) e.push('numComprobante');
        if (!form.fechaPago) e.push('fechaPago');
        if (!form.monto.trim()) e.push('monto');
        if (mode === 'postulante' && !file) e.push('file');
        
        const selectedConceptObj = dynamicAranceles.find(a => a.id.toString() === concepto);
        const isTeacherConcurso = isDocente || selectedConceptObj?.concepto?.toUpperCase().includes('CONCURSO') || selectedConceptObj?.concepto?.toUpperCase().includes('DOCENTE');
        if (isTeacherConcurso && !form.asignatura.trim()) {
            e.push('asignatura');
        }
        
        setErrors(e);
        return e.length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setSubmitting(true);
        setErrors([]);
        
        try {
            const actualSede = isCustomSede ? customSede : selectedSede;
            const actualCarrera = isCustomCarrera ? customCarrera : form.carrera;
            const actualCohorte = isCustomCohorte ? customCohorte : selectedCohorte;

            const formData = new FormData();
            formData.append('postulante_cedula', form.cedula);
            formData.append('concepto', dynamicAranceles.find(a => a.id.toString() === concepto)?.concepto || 'Pago General');
            formData.append('monto', form.monto);
            formData.append('num_comprobante', form.numComprobante);
            if (file) {
                formData.append('comprobante', file);
            }
            if (form.asignatura) {
                formData.append('asignatura', form.asignatura);
            }
            if (mode === 'admin') {
                formData.append('estado', 'verificado');
            }
            
            // Adjuntar observaciones con los detalles especificos
            formData.append('observaciones', `Sede: ${actualSede} | Carrera: ${actualCarrera} | Cohorte: ${actualCohorte}`);
            
            await FinanceService.registerPayment(formData);
            setSuccess(true);
        } catch (err: any) {
            console.error("Error submitting payment:", err);
            setErrors(['api_error']);
            alert("Error del servidor: " + (err.message || JSON.stringify(err)));
        } finally {
            setSubmitting(false);
        }
    };

    const inp = (field: string, extra?: string) =>
        `w-full bg-slate-50 border-0 rounded-2xl focus:ring-2 focus:ring-primary text-sm p-4 outline-none transition-all ${errors.includes(field) ? 'ring-2 ring-red-400 bg-red-50' : ''} ${extra || ''}`;

    if (success) return (
        <div className="w-full max-w-7xl mx-auto min-h-screen bg-[#f8fafc] flex flex-col pt-6 pb-12 px-4 md:px-8">
            {/* Minimal Header */}
            <header className="flex justify-between items-center mb-16">
                <h1 className="text-[#001738] text-xl font-black tracking-tight">UNAMIS</h1>
                <div className="flex gap-4">
                    <button className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                        <span className="font-bold">?</span>
                    </button>
                    <button className="w-10 h-10 rounded-full bg-slate-200/50 flex items-center justify-center text-slate-600 hover:bg-slate-200 transition-colors">
                        <User size={18} />
                    </button>
                </div>
            </header>

            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                className="flex-1 flex flex-col items-center max-w-4xl mx-auto w-full"
            >
                {/* Success Icon & Title */}
                <motion.div
                    initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', delay: 0.2 }}
                    className="w-20 h-20 bg-[#002f6c] rounded-2xl flex items-center justify-center text-white shadow-xl shadow-[#002f6c]/20 mb-8"
                >
                    <CheckCircle2 size={40} strokeWidth={2} />
                </motion.div>
                
                <h2 className="text-4xl md:text-5xl font-black text-[#001738] tracking-tight uppercase mb-4 text-center">
                    ¡Registro de Pago Exitoso!
                </h2>
                <p className="text-slate-500 max-w-xl text-center leading-relaxed font-medium mb-12">
                    Su transacción ha sido procesada correctamente por el sistema administrativo central de la Universidad.
                </p>

                {/* Receipt Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 md:p-10 w-full mb-10">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-6 mb-8">
                        <h3 className="font-bold text-[#001738] text-lg">Resumen del Trámite</h3>
                        <span className="px-4 py-1.5 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-md">
                            Oficial
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-10 gap-x-8 mb-10">
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">N° de Comprobante</p>
                            <p className="text-xl font-bold text-[#001738]">#UN-{Math.floor(Math.random()*90000+10000)}-2024</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Fecha y Hora</p>
                            <p className="text-xl font-bold text-[#001738]">{new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })} — {new Date().toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Postulante</p>
                            <p className="text-xl font-bold text-[#001738] uppercase truncate">{form.nombre || 'No especificado'}</p>
                            <p className="text-sm text-slate-500 font-medium mt-1">DNI: {form.cedula ? form.cedula.replace(/(\d{3})(\d{3})(\d{3})/, '$1.$2.$3') : 'XX.XXX.XXX'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Concepto</p>
                            <p className="text-xl font-bold text-[#001738] truncate">{dynamicAranceles.find(a => a.id.toString() === concepto)?.concepto || 'Pago General'}</p>
                            <p className="text-sm text-slate-500 font-medium mt-1">{form.carrera || 'Facultad General'}</p>
                        </div>
                    </div>

                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-6 flex items-start gap-4">
                        <div className="text-[#002f6c] mt-0.5"><MailCheck size={24} /></div>
                        <div>
                            <h4 className="font-bold text-[#001738] mb-1">Notificación Enviada</h4>
                            <p className="text-sm text-slate-600 leading-relaxed">
                                Se ha enviado una confirmación con el detalle de su trámite a su correo institucional <span className="font-bold text-[#001738] underline decoration-slate-300 underline-offset-2">(@unamis.edu.py)</span>. Por favor, verifique su bandeja de entrada o spam.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center mb-20">
                    <button className="px-8 py-4 bg-[#002f6c] text-white rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#001738] transition-colors shadow-lg shadow-[#002f6c]/20">
                        <Download size={20} /> Descargar Comprobante Digital
                    </button>
                    <button 
                        onClick={() => { setSuccess(false); setFile(null); setErrors([]); onSuccess?.(); }}
                        className="px-8 py-4 bg-white border border-slate-200 text-[#001738] rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-slate-50 transition-colors shadow-sm"
                    >
                        <Home size={20} /> Volver al Inicio
                    </button>
                </div>

                {/* Footer */}
                <div className="mt-auto text-center opacity-60">
                    <div className="w-12 h-16 mx-auto mb-4 bg-slate-300" style={{ clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)' }}></div>
                    <p className="text-[10px] font-black tracking-[0.2em] text-slate-500">
                        SISTEMA DE GESTIÓN ADMINISTRATIVA • UNIVERSIDAD NACIONAL DE MISIONES (UNAMIS) • PARAGUAY
                    </p>
                </div>
            </motion.div>
        </div>
    );

    // We will use a unified design based on the provided mockup
    return (
        <div className="w-full max-w-7xl mx-auto space-y-8 pb-12">
            {/* Main Header */}
            <div className="flex items-center justify-between border-b border-slate-200 pb-6 mb-8">
                <div className="flex items-center gap-4">
                    <span className="text-xl font-black text-slate-900 tracking-tighter">UNAMIS</span>
                    <span className="w-px h-6 bg-slate-200"></span>
                    <span className="text-sm font-bold text-primary border-b-2 border-primary pb-1">Sede Central</span>
                </div>
                <div className="flex items-center gap-6 text-slate-400">
                    <button className="hover:text-slate-600 transition-colors"><AlertCircle size={20} /></button>
                    <button className="hover:text-slate-600 transition-colors"><Settings2 size={20} /></button>
                    <div className="w-8 h-8 bg-slate-200 rounded-full overflow-hidden border border-slate-300">
                        {/* Avatar placeholder */}
                        <div className="w-full h-full bg-slate-300 flex items-center justify-center text-white"><User size={16} /></div>
                    </div>
                </div>
            </div>

            {/* Title Area */}
            <header className="mb-10">
                <h1 className="text-4xl font-black text-[#001738] tracking-tight mb-3">Registro de Pago</h1>
                <p className="text-sm text-slate-500 font-medium max-w-2xl leading-relaxed">
                    Complete la información del comprobante para la validación administrativa. Asegúrese de que todos los datos coincidan con el documento físico.
                </p>
            </header>

            <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-8 items-start">
                {/* Left Column - Form Sections */}
                <div className="flex-1 space-y-6 w-full">
                    
                    {/* Section 1: Información Académica */}
                    <section className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <School size={20} className="text-[#001738]" />
                            <h3 className="text-base font-bold text-[#001738]">Información Académica</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Sede Institucional</label>
                                <div className="relative">
                                    {isCustomSede ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={customSede}
                                                onChange={(e) => setCustomSede(e.target.value)}
                                                placeholder="Escribir sede manualmente..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomSede(false);
                                                    setIsCustomCarrera(false);
                                                    setSelectedSede('Sede Central - Asunción');
                                                }}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-black transition-all"
                                            >
                                                Lista
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <select 
                                                value={selectedSede}
                                                onChange={(e) => {
                                                    const newSede = e.target.value;
                                                    if (newSede === 'CUSTOM_SEDE') {
                                                        setIsCustomSede(true);
                                                        setIsCustomCarrera(true);
                                                        setCustomSede('');
                                                        setCustomCarrera('');
                                                    } else {
                                                        setSelectedSede(newSede);
                                                        const careers = CATALOGO_UNAMIS[newSede] || [];
                                                        if (careers.length > 0) {
                                                            set('carrera', careers[0]);
                                                        }
                                                    }
                                                }}
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none appearance-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                            >
                                                {Object.keys(CATALOGO_UNAMIS).map(s => (
                                                    <option key={s} value={s}>{s}</option>
                                                ))}
                                                <option value="CUSTOM_SEDE">✍️ Escribir otra sede...</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Carrera</label>
                                <div className="relative">
                                    {isCustomCarrera ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={customCarrera}
                                                onChange={(e) => setCustomCarrera(e.target.value)}
                                                placeholder="Escribir carrera manualmente..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                            />
                                            {!isCustomSede && (
                                                <button 
                                                    type="button"
                                                    onClick={() => setIsCustomCarrera(false)}
                                                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-black transition-all"
                                                >
                                                    Lista
                                                </button>
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <select 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none appearance-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                                value={form.carrera}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'CUSTOM_CARRERA') {
                                                        setIsCustomCarrera(true);
                                                        setCustomCarrera('');
                                                    } else {
                                                        set('carrera', val);
                                                    }
                                                }}
                                            >
                                                {(CATALOGO_UNAMIS[selectedSede] || []).map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                                <option value="CUSTOM_CARRERA">✍️ Escribir otra carrera...</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </>
                                    )}
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Curso o Cohorte</label>
                                <div className="relative">
                                    {isCustomCohorte ? (
                                        <div className="flex gap-2">
                                            <input 
                                                type="text"
                                                value={customCohorte}
                                                onChange={(e) => setCustomCohorte(e.target.value)}
                                                placeholder="Ej: Primer Semestre - 2026..."
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-bold text-slate-800 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                            />
                                            <button 
                                                type="button"
                                                onClick={() => {
                                                    setIsCustomCohorte(false);
                                                    setSelectedCohorte('Primer Semestre - 2024');
                                                }}
                                                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-xl text-xs font-black transition-all"
                                            >
                                                Lista
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <select 
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none appearance-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all cursor-pointer"
                                                value={selectedCohorte}
                                                onChange={(e) => {
                                                    const val = e.target.value;
                                                    if (val === 'CUSTOM_COHORTE') {
                                                        setIsCustomCohorte(true);
                                                        setCustomCohorte('');
                                                    } else {
                                                        setSelectedCohorte(val);
                                                    }
                                                }}
                                            >
                                                <option value="Primer Semestre - 2024">Primer Semestre - 2024</option>
                                                <option value="Segundo Semestre - 2024">Segundo Semestre - 2024</option>
                                                <option value="Primer Semestre - 2025">Primer Semestre - 2025</option>
                                                <option value="Segundo Semestre - 2025">Segundo Semestre - 2025</option>
                                                <option value="Primer Semestre - 2026">Primer Semestre - 2026</option>
                                                <option value="Segundo Semestre - 2026">Segundo Semestre - 2026</option>
                                                <option value="CUSTOM_COHORTE">✍️ Escribir otro curso o cohorte...</option>
                                            </select>
                                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Section 2: Datos del Postulante */}
                    <section className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <User size={20} className="text-[#001738]" />
                            <h3 className="text-base font-bold text-[#001738]">Datos del Postulante</h3>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {mode === 'admin' && (
                                <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-200 mb-2">
                                    <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Buscar Postulante por Cédula</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                            <input 
                                                type="text" 
                                                placeholder="Ej: 4567890"
                                                value={searchId}
                                                onChange={(e) => setSearchId(e.target.value)}
                                                className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-primary"
                                            />
                                        </div>
                                        <button 
                                            type="button"
                                            onClick={async () => {
                                                if (!searchId.trim()) return;
                                                try {
                                                    const list = await FinanceService.getPostulantes();
                                                    const found = list.find((p: any) => p.cedula === searchId.trim());
                                                    if (found) {
                                                        setForm(f => ({
                                                            ...f,
                                                            nombre: `${found.nombre} ${found.apellido}`,
                                                            cedula: found.cedula,
                                                            carrera: found.carrera || f.carrera
                                                        }));
                                                        if (found.sede) {
                                                            setSelectedSede(found.sede);
                                                        }
                                                        alert(`Postulante encontrado: ${found.nombre} ${found.apellido}`);
                                                    } else {
                                                        alert("No se encontró ningún postulante con esa cédula.");
                                                    }
                                                } catch (err) {
                                                    console.error(err);
                                                    alert("Error al buscar postulante.");
                                                }
                                            }}
                                            className="px-4 py-2 bg-slate-800 text-white text-xs font-bold rounded-lg hover:bg-slate-900 transition-colors"
                                        >
                                            Buscar
                                        </button>
                                    </div>
                                </div>
                            )}
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Nombre y Apellido Completo</label>
                                <input 
                                    type="text" 
                                    placeholder="Ingresar nombre completo"
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.includes('nombre') ? 'border-red-300 bg-red-50' : ''}`}
                                    value={form.nombre}
                                    onChange={(e) => set('nombre', e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Dirección del Postulante</label>
                                <input 
                                    type="text" 
                                    placeholder="Calle, N° de casa, Ciudad"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                    value={form.direccion}
                                    onChange={(e) => set('direccion', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">N° de Cédula o RUC</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: 1234567 o 80012345-6"
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.includes('cedula') ? 'border-red-300 bg-red-50' : ''}`}
                                    value={form.cedula}
                                    onChange={(e) => set('cedula', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">N° de Teléfono</label>
                                <input 
                                    type="text" 
                                    placeholder="Ej: 0981 123456"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                    value={form.telefono}
                                    onChange={(e) => set('telefono', e.target.value)}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Section 3: Detalles del Pago */}
                    <section className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <Banknote size={20} className="text-[#001738]" />
                            <h3 className="text-base font-bold text-[#001738]">Detalles del Pago</h3>
                        </div>
                        
                        <div className="mb-6">
                            <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-3">Concepto de Pago</label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {dynamicAranceles.slice(0, 4).map(a => {
                                    // Map common names to generic icons for visual appeal
                                    let Icon = FileText;
                                    const lower = a.concepto.toLowerCase();
                                    if (lower.includes('matricula')) Icon = User;
                                    else if (lower.includes('cuota')) Icon = Calendar;
                                    else if (lower.includes('certificado') || lower.includes('diploma')) Icon = CheckCircle2;
                                    else if (lower.includes('constancia')) Icon = FileText;

                                    return (
                                        <button 
                                            key={a.id} 
                                            type="button" 
                                            onClick={() => {
                                                setConcepto(a.id.toString());
                                                set('monto', a.monto > 0 ? a.monto.toString() : '');
                                            }} 
                                            className={`p-4 rounded-xl border flex flex-col items-center text-center gap-2 transition-all ${
                                                concepto === a.id.toString() 
                                                ? 'border-[#001738] text-[#001738] shadow-sm bg-slate-50 font-bold' 
                                                : 'border-slate-100 text-slate-500 hover:border-slate-300'
                                            }`}
                                        >
                                            <Icon size={20} strokeWidth={1.5} className="mb-1 text-slate-400" />
                                            <span className="text-[11px] font-medium leading-tight">{a.concepto}</span>
                                        </button>
                                    );
                                })}
                            </div>
                            {dynamicAranceles.length > 4 && (
                                <div className="mt-4">
                                    <select 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl text-[12px] font-medium p-3.5 outline-none text-slate-700"
                                        value={dynamicAranceles.some(a => a.id.toString() === concepto) && dynamicAranceles.findIndex(a => a.id.toString() === concepto) >= 4 ? concepto : ""}
                                        onChange={(e) => {
                                            const id = e.target.value;
                                            if (id) {
                                                setConcepto(id);
                                                const arancel = dynamicAranceles.find(a => a.id.toString() === id);
                                                if (arancel) set('monto', arancel.monto.toString());
                                            }
                                        }}
                                    >
                                        <option value="">O seleccionar otro arancel...</option>
                                        {dynamicAranceles.slice(4).map(a => (
                                            <option key={a.id} value={a.id}>{a.concepto} (Gs. {new Intl.NumberFormat('es-PY').format(a.monto)})</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Nombre y Apellido del Titular de la Cuenta Bancaria</label>
                                <input 
                                    type="text" 
                                    placeholder="Titular desde donde se realizó el pago"
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all"
                                    value={form.titular}
                                    onChange={(e) => set('titular', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Número de Comprobante</label>
                                <input 
                                    type="text" 
                                    placeholder="N° de boleta o transferencia"
                                    className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.includes('numComprobante') ? 'border-red-300 bg-red-50' : ''}`}
                                    value={form.numComprobante}
                                    onChange={(e) => set('numComprobante', e.target.value)}
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Fecha y Hora de Pago</label>
                                <div className="relative">
                                    <input 
                                        type="datetime-local" 
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.includes('fechaPago') ? 'border-red-300 bg-red-50' : ''}`}
                                        value={form.fechaPago}
                                        onChange={(e) => set('fechaPago', e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Monto a Pagar (Gs.)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        placeholder="Ej: 300.000"
                                        readOnly={dynamicAranceles.find(a => a.id.toString() === concepto)?.monto !== 0}
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-lg font-black text-[#001738] outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.includes('monto') ? 'border-red-300 bg-red-50' : ''} ${dynamicAranceles.find(a => a.id.toString() === concepto)?.monto === 0 ? 'bg-amber-50 ring-1 ring-amber-200' : 'bg-slate-100 opacity-80 cursor-not-allowed'}`}
                                        value={form.monto}
                                        onChange={(e) => set('monto', e.target.value.replace(/[^0-9]/g, ''))}
                                    />
                                    {dynamicAranceles.find(a => a.id.toString() === concepto)?.monto === 0 && (
                                        <p className="text-[9px] text-amber-600 font-bold mt-1 uppercase tracking-tighter">* Este arancel tiene costo variable. Ingrese el monto según presupuesto.</p>
                                    )}
                                </div>
                            </div>

                            {/* Campo Asignatura para Concurso Docente */}
                            {(isDocente || dynamicAranceles.find(a => a.id.toString() === concepto)?.concepto?.toUpperCase().includes('CONCURSO') || dynamicAranceles.find(a => a.id.toString() === concepto)?.concepto?.toUpperCase().includes('DOCENTE')) && (
                                <div className="md:col-span-2">
                                    <label className="block text-[10px] font-black text-purple-700 bg-purple-50 px-2 py-1 rounded w-fit uppercase tracking-widest mb-2">Asignatura a Concursar <span className="text-red-500">*</span></label>
                                    <input 
                                        type="text" 
                                        placeholder="Ingrese el nombre exacto de la asignatura a concursar"
                                        className={`w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all ${errors.includes('asignatura') ? 'border-red-300 bg-red-50 ring-2 ring-red-400' : ''}`}
                                        value={form.asignatura}
                                        onChange={(e) => set('asignatura', e.target.value)}
                                    />
                                    <p className="text-[10px] text-slate-400 mt-1 font-medium italic">
                                        * Si está concursando en más de una asignatura, registre un pago independiente para cada una.
                                    </p>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Section 4: Documentación */}
                    <section className="bg-white p-8 rounded-[1.5rem] border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-3 mb-8">
                            <FileText size={20} className="text-[#001738]" />
                            <h3 className="text-base font-bold text-[#001738]">Documentación</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Comprobante de Pago</label>
                                <label className={`flex flex-col items-center justify-center p-6 border border-dashed rounded-2xl cursor-pointer transition-all ${errors.includes('file') ? 'border-red-300 bg-red-50' : 'border-slate-300 hover:border-primary/30 hover:bg-slate-50'}`}>
                                    <input type="file" className="hidden" onChange={e => {
                                        const f = e.target.files?.[0];
                                        if (f) {
                                            setFile(f);
                                            handleOcrScan(f);
                                        }
                                    }} />
                                    {isScanning ? (
                                        <div className="flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 border-4 border-[#0052cc] border-t-transparent rounded-full animate-spin"></div>
                                            <span className="text-[11px] font-bold text-[#0052cc] animate-pulse">🤖 IA Analizando imagen...</span>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="w-10 h-10 bg-[#e6f0ff] rounded-full flex items-center justify-center text-[#0052cc] mb-3">
                                                <Upload size={18} />
                                            </div>
                                            <span className="text-[11px] font-bold text-slate-700">Adjuntar y Escanear (OCR)</span>
                                            <span className="text-[9px] text-slate-400 mt-1">Imagen o PDF (Bien legible)</span>
                                            {file && <span className="text-[10px] font-bold text-emerald-500 mt-2 truncate w-full text-center px-2">{file.name}</span>}
                                        </>
                                    )}
                                </label>
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-2">Otros / Memorandum (Opcional)</label>
                                <label className="flex flex-col items-center justify-center p-6 border border-dashed border-slate-300 rounded-2xl cursor-pointer hover:border-primary/30 hover:bg-slate-50 transition-all">
                                    <input type="file" className="hidden" />
                                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500 mb-3">
                                        <Upload size={18} />
                                    </div>
                                    <span className="text-[11px] font-bold text-slate-700">Subir archivo adicional</span>
                                    <span className="text-[9px] text-slate-400 mt-1">Formatos PDF, JPG</span>
                                </label>
                            </div>
                        </div>

                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <label className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Nota de Solicitud para Constancias/Certificados</label>
                                <span className="text-[8px] font-black bg-[#e6f0ff] text-[#0052cc] px-2 py-1 rounded uppercase">Requerido para trámites</span>
                            </div>
                            <textarea 
                                rows={3}
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-medium text-slate-700 outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10 transition-all resize-none mb-4"
                                placeholder="Detalles precisos para la constancia: Antigüedad, salario, promedio, etc."
                            ></textarea>
                            
                            <label className="flex items-center justify-center gap-2 w-full p-4 border border-dashed border-slate-300 rounded-xl cursor-pointer hover:bg-slate-50 transition-all text-sm font-bold text-slate-600">
                                <FileText size={16} className="text-slate-400" />
                                Adjuntar Nota Firmada (Si aplica)
                                <input type="file" className="hidden" />
                            </label>
                        </div>
                    </section>
                </div>

                {/* Right Column - Sticky Summary */}
                <div className="w-full lg:w-[320px] shrink-0 sticky top-8">
                    <div className="bg-[#001738] rounded-[1.5rem] p-6 text-white shadow-xl shadow-[#001738]/20 mb-4">
                        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/50 mb-1">Resumen del Trámite</p>
                        <h4 className="text-xl font-bold mb-6">Registro Administrativo</h4>
                        
                        <div className="space-y-4 mb-8">
                            <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
                                <span className="text-white/70">Tipo de arancel</span>
                                <span className="font-medium text-right max-w-[140px] truncate" title={dynamicAranceles.find(a => a.id.toString() === concepto)?.concepto || 'Seleccionar...'}>
                                    {dynamicAranceles.find(a => a.id.toString() === concepto)?.concepto || 'Seleccionar...'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center text-xs border-b border-white/10 pb-3">
                                <span className="text-white/70">Tasa de gestión</span>
                                <span className="font-medium">Exento</span>
                            </div>
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-white/70">Estado</span>
                                <span className="px-2 py-0.5 bg-white/10 rounded text-[10px] font-medium">Borrador</span>
                            </div>
                        </div>

                        <button 
                            type="submit" 
                            disabled={submitting}
                            className="w-full bg-[#c6dbf0] text-[#001738] font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-white transition-all disabled:opacity-70"
                        >
                            {submitting ? <Clock size={16} className="animate-spin" /> : null}
                            Registrar Pago
                            {!submitting && <Send size={16} className="ml-1" />}
                        </button>
                        
                        <p className="text-[10px] text-white/50 text-center mt-4 leading-relaxed font-medium">
                            Los datos serán validados por el departamento administrativo en 24-48 horas hábiles.
                        </p>
                    </div>

                    <div className="bg-slate-50 border border-slate-200 rounded-[1.5rem] p-5 flex items-start gap-3">
                        <div className="mt-0.5 text-slate-400"><AlertCircle size={16} /></div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">
                            Su información está protegida bajo las normativas de privacidad institucional. Los documentos adjuntos deben ser originales escaneados.
                        </p>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default PaymentRegistrationForm;
