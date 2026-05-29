import React, { useRef, useState } from 'react';
import { OcrUploadModal } from './OcrUploadModal';
import { parseCedula } from '../services/ocrParser';
import { fetchApi } from '../services/ApiService';
import {
    User,
    Mail,
    CreditCard,
    MapPin,
    GraduationCap,
    ArrowRight,
    UploadCloud,
    Camera,
    CheckCircle2,
    FileText,
    School,
    ChevronDown,
    Calendar,
    Activity,
    Heart,
    HeartPulse,
    Eye,
    Plus,
    X,
    BookOpen,
    Loader2,
    AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';
import AppInput from './ui/AppInput';
import AppButton from './ui/AppButton';
import SectionTitle from './ui/SectionTitle';
import AppDatePicker from './ui/AppDatePicker';
import { CATALOGO_UNAMIS, getCarrerasPorSede } from '../constants/catalogoUnamis';

const COMMON_CATEDRAS = [
    "Anatomía Descriptiva y Topográfica I",
    "Biología y Genética",
    "Histología I",
    "Embriología I",
    "Biofísica",
    "Antropología",
    "Comunicación Castellano-Guaraní",
    "Anatomía Humana",
    "Fisiología",
    "Histología y Embriología",
    "Farmacología",
    "Bioquímica",
    "Patología",
    "Microbiología e Inmunología",
    "Semiología Médica",
    "Pediatría",
    "Ginecología y Obstetricia",
    "Cirugía General",
    "Medicina Interna",
    "Salud Pública",
    "Introducción al Derecho",
    "Derecho Constitucional",
    "Álgebra y Geometría Analítica",
    "Cálculo Diferencial e Integral",
    "Física General",
    "Química General",
    "Programación Orientada a Objetos",
    "Estructura de Datos y Algoritmos",
    "Ingeniería de Software",
    "Didáctica Superior Universitaria",
    "Gerencia de Centrales Hidroeléctricas",
    "Tecnología de la Producción",
    "Tecnología de los Alimentos",
    "Psicología General",
    "Ciencias Políticas y de Gobierno",
    "Logística y Transporte"
];

interface FormData {
    nombre: string;
    apellido: string;
    cedula: string;
    ruc?: string;
    correo: string;
    telefono: string;
    fechaNacimiento: string;
    lugarNacimientoCiudad?: string;
    lugarNacimientoDepto?: string;
    nacionalidad?: string;
    paisOrigen?: string;
    genero: string;
    estadoCivil?: string;
    direccion: string;
    barrio?: string;
    carrera: string;
    sede: string;
    tipoUsuario: 'postulante' | 'concursante_docente' | 'auxiliar_docente';
    catedra?: string;

    // Datos de Salud
    grupoSanguineo?: string;
    alergico?: string;
    seguroMedico?: string;
    esZurdo?: boolean;
    discapacidad?: string;
    discapacidadDetalle?: string;
    necesitaAdecuacion?: boolean;
    adecuacionDetalle?: string;
    enfermedadCronica?: string;

    // Antecedentes Académicos/Laborales
    colegioNombre?: string;
    colegioCiudad?: string;
    colegioDistrito?: string;
    colegioDepto?: string;
    colegioTipo?: string;
    bachillerTipo?: string;
    bachillerDetalle?: string;
    egresoAnio?: number;
    egresoPromedio?: number;
    trabaja?: boolean;
    empresaNombre?: string;
    cargo?: string;
    horarioLaboral?: string;
}

interface PersonalDataFormProps {
    formData: FormData;
    photo: string | null;
    setPhoto: (photo: string | null) => void;
    errors: string[];
    onChange: (field: string, value: any) => void;
    onContinue: () => void;
    isLoading?: boolean;
    isAcademic?: boolean;
    onSkipToPayment?: () => void;
}

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js';
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ formData, photo, setPhoto, errors, onChange, onContinue, isLoading = false, isAcademic = false, onSkipToPayment }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
    const [customCatedra, setCustomCatedra] = useState('');
    const [rawFile, setRawFile] = useState<File | null>(null);

    // OCR scanning states for Cédula
    const [isOcrScanning, setIsOcrScanning] = useState(false);
    const [ocrProgress, setOcrProgress] = useState(0);
    const [ocrStatusText, setOcrStatusText] = useState('');
    const [ocrError, setOcrError] = useState<string | null>(null);
    const [ocrSuccessMsg, setOcrSuccessMsg] = useState<string | null>(null);

    // Dynamic library loader helper
    const loadScript = (src: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) {
                resolve();
                return;
            }
            const script = document.createElement('script');
            script.src = src;
            script.onload = () => resolve();
            script.onerror = (err) => reject(new Error(`Error loading script ${src}`));
            document.body.appendChild(script);
        });
    };

    const handleCedulaOcrScan = async () => {
        if (!rawFile && !photo) return;
        
        setIsOcrScanning(true);
        setOcrProgress(10);
        setOcrStatusText('Cargando motor de procesamiento...');
        setOcrError(null);
        setOcrSuccessMsg(null);

        try {
            let base64Image = '';

            // Convert rawFile or photo to base64
            if (rawFile && rawFile.type === 'application/pdf') {
                setOcrStatusText('Procesando PDF para escaneo inteligente...');
                setOcrProgress(25);
                if (!(window as any).pdfjsLib) {
                    await loadScript(PDFJS_CDN);
                }
                if ((window as any).pdfjsLib && !(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc) {
                    (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
                }
                const arrayBuffer = await rawFile.arrayBuffer();
                const loadingTask = (window as any).pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;
                const page1 = await pdf.getPage(1);
                const viewport = page1.getViewport({ scale: 2.0 });
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                if (context) {
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;
                    await page1.render({ canvasContext: context, viewport }).promise;
                    base64Image = canvas.toDataURL('image/jpeg', 0.9);
                }
            } else if (photo) {
                base64Image = photo;
            } else if (rawFile) {
                const reader = new FileReader();
                const base64Promise = new Promise<string>((resolve) => {
                    reader.onload = () => resolve(reader.result as string);
                    reader.readAsDataURL(rawFile);
                });
                base64Image = await base64Promise;
            }

            let parsed: any = null;
            let ocrEngineUsed = 'gemini';

            // Intentar Gemini OCR
            if (base64Image) {
                try {
                    setOcrStatusText('Enviando documento a IA Avanzada (Gemini)...');
                    setOcrProgress(60);
                    const response = await fetchApi('', {
                        method: 'POST',
                        body: JSON.stringify({
                            action: 'gemini_ocr',
                            image: base64Image,
                            doc_type: 'cedula'
                        })
                    });
                    if (response && response.status === 'success' && response.data) {
                        parsed = response.data;
                    }
                } catch (geminiErr) {
                    console.warn("Gemini Cédula OCR failed, falling back to local Tesseract:", geminiErr);
                }
            }

            // Fallback a Tesseract local si Gemini falló
            if (!parsed) {
                ocrEngineUsed = 'tesseract';
                setOcrStatusText('IA no disponible. Ejecutando motor local Tesseract...');
                setOcrProgress(40);
                let textToParse = '';

                if (rawFile && rawFile.type === 'application/pdf') {
                    if (!(window as any).pdfjsLib) {
                        await loadScript(PDFJS_CDN);
                    }
                    if ((window as any).pdfjsLib && !(window as any).pdfjsLib.GlobalWorkerOptions.workerSrc) {
                        (window as any).pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
                    }
                    const arrayBuffer = await rawFile.arrayBuffer();
                    const loadingTask = (window as any).pdfjsLib.getDocument({ data: arrayBuffer });
                    const pdf = await loadingTask.promise;
                    
                    let digitalText = '';
                    for (let i = 1; i <= pdf.numPages; i++) {
                        const page = await pdf.getPage(i);
                        const textContent = await page.getTextContent();
                        const pageText = textContent.items.map((item: any) => item.str).join(' ');
                        digitalText += pageText + '\n';
                    }

                    if (digitalText.trim().length >= 30) {
                        textToParse = digitalText;
                    } else {
                        const page1 = await pdf.getPage(1);
                        const viewport = page1.getViewport({ scale: 2.0 });
                        const canvas = document.createElement('canvas');
                        const context = canvas.getContext('2d');
                        if (context) {
                            canvas.height = viewport.height;
                            canvas.width = viewport.width;
                            await page1.render({ canvasContext: context, viewport }).promise;
                            
                            if (!(window as any).Tesseract) {
                                await loadScript(TESSERACT_CDN);
                            }
                            const worker = await (window as any).Tesseract.createWorker('spa');
                            const result = await worker.recognize(canvas);
                            await worker.terminate();
                            textToParse = result.data.text;
                        }
                    }
                } else {
                    if (!(window as any).Tesseract) {
                        await loadScript(TESSERACT_CDN);
                    }
                    const worker = await (window as any).Tesseract.createWorker('spa');
                    const source = photo || rawFile;
                    if (!source) throw new Error("No hay origen de imagen válido.");
                    const result = await worker.recognize(source);
                    await worker.terminate();
                    textToParse = result.data.text;
                }
                parsed = parseCedula(textToParse);
            }

            setOcrProgress(80);
            setOcrStatusText('Procesando datos extraídos...');
            console.log("Datos extraídos de la cédula:", parsed);
            
            let filledCount = 0;
            Object.entries(parsed).forEach(([key, value]) => {
                if (value !== undefined && value !== null && value !== '') {
                    onChange(key, value);
                    filledCount++;
                }
            });
            
            setOcrProgress(100);
            if (filledCount > 0) {
                const engineName = ocrEngineUsed === 'gemini' ? 'IA Avanzada (Gemini)' : 'Básico Local (Tesseract)';
                setOcrSuccessMsg(`¡Escaneo exitoso con ${engineName}! Se autocompletaron ${filledCount} campos.`);
            } else {
                setOcrError('No se pudieron extraer datos legibles. Verifique la calidad de la foto.');
            }
        } catch (err: any) {
            console.error("Cédula OCR failed:", err);
            setOcrError(err.message || 'Error durante la lectura del documento. Intente de nuevo.');
        } finally {
            setIsOcrScanning(false);
        }
    };


    const selectedCatedras = formData.catedra
        ? formData.catedra.split(',').map((s: string) => s.trim()).filter((s: string) => s !== '')
        : [];

    const handleToggleCatedra = (catedraName: string) => {
        let newList;
        if (selectedCatedras.includes(catedraName)) {
            newList = selectedCatedras.filter((x: string) => x !== catedraName);
        } else {
            newList = [...selectedCatedras, catedraName];
        }
        onChange('catedra', newList.join(', '));
    };

    const handleAddCustomCatedra = () => {
        const clean = customCatedra.trim();
        if (clean && !selectedCatedras.includes(clean)) {
            const newList = [...selectedCatedras, clean];
            onChange('catedra', newList.join(', '));
            setCustomCatedra('');
        }
    };

    const handleOcrSuccess = (ocrData: any) => {
        Object.entries(ocrData).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                onChange(key, value);
            }
        });
    };

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setRawFile(file);
            setOcrSuccessMsg(null);
            setOcrError(null);
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const availableCareers = formData.sede ? getCarrerasPorSede(formData.sede) : [];

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-6 md:p-12 relative overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-[var(--primary-50)] rounded-full blur-3xl opacity-50 pointer-events-none" />
            <div className="absolute -left-24 bottom-10 w-80 h-80 bg-slate-50 rounded-full blur-3xl opacity-60 pointer-events-none" />

            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*,application/pdf"
                className="hidden"
            />

            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 uppercase">
                        Formulario de Admisión 2026
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Paso 01: Ficha de Datos Personales y Académicos</p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                    {isAcademic && (
                        <button
                            type="button"
                            onClick={() => setIsOcrModalOpen(true)}
                            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md hover:scale-[1.02] active:scale-95"
                        >
                            📂 Cargar desde Formulario Escaneado (OCR)
                        </button>
                    )}
                    <div className="flex items-center gap-2.5 px-4 py-2 bg-[var(--primary-50)] rounded-2xl border border-[var(--primary-100)] text-[10px] font-black text-[var(--primary)] uppercase tracking-widest shadow-sm">
                        <CheckCircle2 size={14} className="text-[var(--primary)]" /> Portal Oficial UNAMIS
                    </div>
                </div>
            </div>

            <div className="space-y-16 relative z-10">
                {/* Section 1: Identidad */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="p-6 md:p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-slate-200/80 transition-all duration-300"
                >
                    <SectionTitle
                        title={formData.tipoUsuario === 'concursante_docente' ? "Identidad del Concursante" : "Identidad del Postulante"}
                        subtitle="Asegúrese de que sus datos coincidan exactamente con su cédula de identidad civil."
                        icon={User}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                        {/* Cédula de Identidad Upload and OCR Scan Card */}
                        <div className="md:col-span-2">
                            <motion.div
                                whileHover={isOcrScanning ? {} : { y: -2 }}
                                onClick={isOcrScanning ? undefined : handlePhotoClick}
                                className={`
                                    relative group overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-500
                                    ${photo ? 'border-[var(--primary)]/30 bg-[var(--primary-50)]/30' : 'border-slate-200 bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--primary-50)]/30'}
                                    ${isOcrScanning ? 'cursor-wait border-amber-300 bg-amber-50/10' : 'cursor-pointer'}
                                `}
                            >
                                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                                    {/* Thumbnail Preview or CreditCard Icon */}
                                    <div className={`
                                        w-32 h-20 rounded-2xl flex items-center justify-center transition-all duration-500 border shadow-md flex-shrink-0 relative overflow-hidden
                                        ${photo ? 'bg-white border-[var(--primary)]/10' : 'bg-slate-50 border-slate-100 text-slate-300 group-hover:text-[var(--primary)]'}
                                    `}>
                                        {photo ? (
                                            photo.startsWith('data:application/pdf') ? (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-red-50 text-red-550 p-2">
                                                    <FileText size={28} />
                                                    <span className="text-[9px] font-black uppercase mt-1">PDF</span>
                                                </div>
                                            ) : (
                                                <img src={photo} alt="Vista previa de la Cédula" className="w-full h-full object-cover rounded-xl" />
                                            )
                                        ) : (
                                            <CreditCard size={36} strokeWidth={1} />
                                        )}
                                    </div>

                                    {/* Text content & Status Loader */}
                                    <div className="flex-1 text-center md:text-left min-w-0">
                                        {isOcrScanning ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center gap-2.5 justify-center md:justify-start">
                                                    <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
                                                    <h4 className="text-sm font-black text-slate-800 tracking-tight uppercase">
                                                        Lector OCR Activo
                                                    </h4>
                                                </div>
                                                <p className="text-xs font-bold text-amber-600 animate-pulse">
                                                    {ocrStatusText}
                                                </p>
                                                {/* Progress bar */}
                                                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden max-w-sm mt-2 border border-slate-100">
                                                    <div 
                                                        className="bg-gradient-to-r from-amber-400 to-amber-650 h-full transition-all duration-300"
                                                        style={{ width: `${ocrProgress}%` }}
                                                    />
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <h4 className="text-base font-black text-slate-800 mb-1 tracking-tight">
                                                    {photo ? (photo.startsWith('data:application/pdf') ? 'Cédula (PDF) cargada' : 'Cédula cargada correctamente') : 'Cédula de Identidad Civil'}
                                                </h4>
                                                <p className="text-xs text-slate-500 mb-4 max-w-md font-medium leading-relaxed">
                                                    {photo 
                                                        ? 'Su documento está listo para ser analizado por el lector OCR para rellenar los datos automáticamente.' 
                                                        : 'Suba una foto o escaneo nítido (Imagen o PDF) de su cédula de identidad civil paraguaya para autocompletar el formulario.'}
                                                </p>
                                                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                                                    <AppButton
                                                        variant={photo ? 'secondary' : 'primary'}
                                                        size="sm"
                                                        icon={UploadCloud}
                                                        onClick={(e) => { e.stopPropagation(); handlePhotoClick(); }}
                                                    >
                                                        {photo ? 'Cambiar Documento' : 'Subir Cédula (PDF/Imagen)'}
                                                    </AppButton>
                                                    {(photo || rawFile) && (
                                                        <AppButton
                                                            variant="primary"
                                                            size="sm"
                                                            className="bg-amber-600 hover:bg-amber-700 text-white border-amber-600 shadow-md shadow-amber-600/10"
                                                            onClick={(e) => { e.stopPropagation(); handleCedulaOcrScan(); }}
                                                        >
                                                            ✨ Escanear Datos Personales (OCR)
                                                        </AppButton>
                                                    )}
                                                </div>
                                            </>
                                        )}
                                    </div>

                                    {/* Success checkmark or error alert */}
                                    {!isOcrScanning && (
                                        <div className="shrink-0 flex items-center justify-center">
                                            {ocrSuccessMsg && (
                                                <div className="flex items-center gap-2 text-[var(--success)] font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                                    <CheckCircle2 size={16} /> ¡Listo!
                                                </div>
                                            )}
                                            {ocrError && (
                                                <div className="flex items-center gap-2 text-red-600 font-black text-[10px] uppercase tracking-widest bg-red-50 px-4 py-2 rounded-xl border border-red-100" title={ocrError}>
                                                    <AlertTriangle size={16} /> Error en escaneo
                                                </div>
                                            )}
                                            {photo && !ocrSuccessMsg && !ocrError && (
                                                <div className="flex items-center gap-2 text-[var(--primary)] font-black text-[10px] uppercase tracking-widest bg-[var(--primary-50)] px-4 py-2 rounded-xl border border-[var(--primary-100)]">
                                                    Paso 1 de 2
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                            
                            {/* Detailed OCR Feedback Messages */}
                            {ocrSuccessMsg && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-4 py-2.5 rounded-2xl flex items-center gap-2"
                                >
                                    <CheckCircle2 size={14} className="text-[var(--success)]" /> {ocrSuccessMsg}
                                </motion.div>
                            )}
                            {ocrError && (
                                <motion.div 
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-3 text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-4 py-2.5 rounded-2xl flex items-center gap-2"
                                >
                                    <AlertTriangle size={14} className="text-red-500" /> {ocrError}
                                </motion.div>
                            )}
                        </div>

                        <AppInput
                            label="Nombres"
                            placeholder="Ej: Juan Antonio"
                            value={formData.nombre}
                            onChange={(e) => onChange('nombre', e.target.value)}
                            error={errors.includes('nombre') ? 'El nombre es obligatorio' : ''}
                        />

                        <AppInput
                            label="Apellidos"
                            placeholder="Ej: Pérez González"
                            value={formData.apellido}
                            onChange={(e) => onChange('apellido', e.target.value)}
                            error={errors.includes('apellido') ? 'El apellido es obligatorio' : ''}
                        />

                        <AppInput
                            label="Cédula de Identidad"
                            placeholder="Ej: 1.234.567"
                            icon={CreditCard}
                            value={formData.cedula}
                            onChange={(e) => onChange('cedula', e.target.value)}
                            error={errors.includes('cedula') ? 'La cédula es obligatoria' : ''}
                        />

                        <AppInput
                            label="RUC (Opcional)"
                            placeholder="Ej: 1234567-8"
                            icon={CreditCard}
                            value={formData.ruc}
                            onChange={(e) => onChange('ruc', e.target.value)}
                        />

                        <AppDatePicker
                            label="Fecha de Nacimiento"
                            value={formData.fechaNacimiento}
                            onChange={(val) => onChange('fechaNacimiento', val)}
                            error={errors.includes('fechaNacimiento') ? 'La fecha es obligatoria' : ''}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <AppInput
                                label="Ciudad de Nac."
                                placeholder="Ej: San Ignacio"
                                value={formData.lugarNacimientoCiudad}
                                onChange={(e) => onChange('lugarNacimientoCiudad', e.target.value)}
                            />
                            <AppInput
                                label="Depto de Nac."
                                placeholder="Ej: Misiones"
                                value={formData.lugarNacimientoDepto}
                                onChange={(e) => onChange('lugarNacimientoDepto', e.target.value)}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <AppInput
                                label="Nacionalidad"
                                value={formData.nacionalidad}
                                onChange={(e) => onChange('nacionalidad', e.target.value)}
                            />
                            <AppInput
                                label="País de Origen"
                                value={formData.paisOrigen}
                                onChange={(e) => onChange('paisOrigen', e.target.value)}
                            />
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Estado Civil
                            </label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {['Soltero', 'Casado', 'Divorciado', 'Otro'].map((ec) => (
                                    <motion.button
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={ec}
                                        type="button"
                                        onClick={() => onChange('estadoCivil', ec)}
                                        className={`
                                            px-2 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                            ${formData.estadoCivil === ec
                                                ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'}
                                        `}
                                    >
                                        {ec}
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Género
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Masculino', 'Femenino', 'Otro'].map((g) => (
                                    <motion.button
                                        whileHover={{ y: -1 }}
                                        whileTap={{ scale: 0.98 }}
                                        key={g}
                                        type="button"
                                        onClick={() => onChange('genero', g)}
                                        className={`
                                            px-4 py-3.5 rounded-xl text-xs font-bold border transition-all duration-300
                                            ${formData.genero === g
                                                ? 'bg-[var(--primary)] text-white border-[var(--primary)] shadow-md shadow-[var(--primary-100)]'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-[var(--primary)]/30 hover:text-[var(--primary)]'}
                                            ${errors.includes('genero') && !formData.genero ? 'border-danger bg-danger-soft/30' : ''}
                                        `}
                                    >
                                        {g}
                                    </motion.button>
                                ))}
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Section 2: Tipo de Registro */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="p-6 md:p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-slate-200/80 transition-all duration-300"
                >
                    <SectionTitle
                        title="Tipo de Registro"
                        subtitle="Seleccione su perfil de ingreso a la UNAMIS."
                        icon={GraduationCap}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                        <div className="flex flex-col gap-1.5 w-full md:col-span-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Perfil del Solicitante
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="button"
                                    onClick={() => {
                                        onChange('tipoUsuario', 'postulante');
                                        onChange('catedra', '');
                                    }}
                                    className={`px-6 py-5 rounded-2xl text-left transition-all duration-300 border-2 ${
                                        formData.tipoUsuario === 'postulante' || !formData.tipoUsuario
                                            ? 'bg-white border-[var(--primary)] shadow-premium text-slate-800'
                                            : 'bg-white/50 border-slate-100 text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tipoUsuario === 'postulante' || !formData.tipoUsuario ? 'bg-[var(--primary-50)] text-[var(--primary)]' : 'bg-slate-50 text-slate-300'}`}>
                                            <User size={22} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black tracking-tight">Postulante a Estudiante</span>
                                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider mt-0.5">Carreras de Grado</span>
                                        </div>
                                    </div>
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="button"
                                    onClick={() => onChange('tipoUsuario', 'concursante_docente')}
                                    className={`px-6 py-5 rounded-2xl text-left transition-all duration-300 border-2 ${
                                        formData.tipoUsuario === 'concursante_docente'
                                            ? 'bg-white border-[var(--primary)] shadow-premium text-slate-800'
                                            : 'bg-white/50 border-slate-100 text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tipoUsuario === 'concursante_docente' ? 'bg-[var(--primary-50)] text-[var(--primary)]' : 'bg-slate-50 text-slate-300'}`}>
                                            <School size={22} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black tracking-tight">Postulante a Docente</span>
                                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider mt-0.5">Encargado de Cátedra</span>
                                        </div>
                                    </div>
                                </motion.button>
                                <motion.button
                                    whileHover={{ y: -2 }}
                                    whileTap={{ scale: 0.99 }}
                                    type="button"
                                    onClick={() => onChange('tipoUsuario', 'auxiliar_docente')}
                                    className={`px-6 py-5 rounded-2xl text-left transition-all duration-300 border-2 ${
                                        formData.tipoUsuario === 'auxiliar_docente'
                                            ? 'bg-white border-[var(--primary)] shadow-premium text-slate-800'
                                            : 'bg-white/50 border-slate-100 text-slate-400'
                                    }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${formData.tipoUsuario === 'auxiliar_docente' ? 'bg-[var(--primary-50)] text-[var(--primary)]' : 'bg-slate-50 text-slate-300'}`}>
                                            <GraduationCap size={22} />
                                        </div>
                                        <div className="flex flex-col text-left">
                                            <span className="text-sm font-black tracking-tight">Postulante a Auxiliar</span>
                                            <span className="text-[9px] font-bold opacity-60 uppercase tracking-wider mt-0.5">Auxiliar de Enseñanza</span>
                                        </div>
                                    </div>
                                </motion.button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 w-full relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Sede / Campus
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.sede}
                                    onChange={(e) => {
                                        onChange('sede', e.target.value);
                                        onChange('carrera', ''); // Reset career when sede changes
                                    }}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[var(--primary)] transition-all appearance-none pr-12 focus:ring-4 focus:ring-[var(--primary)]/5"
                                >
                                    <option value="">Seleccionar sede...</option>
                                    {Object.keys(CATALOGO_UNAMIS).map(sede => (
                                        <option key={sede} value={sede}>{sede}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 w-full relative">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Carrera / Programa
                            </label>
                            <div className="relative">
                                <select
                                    value={formData.carrera}
                                    onChange={(e) => onChange('carrera', e.target.value)}
                                    className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[var(--primary)] transition-all appearance-none pr-12 disabled:opacity-50 focus:ring-4 focus:ring-[var(--primary)]/5"
                                    disabled={!formData.sede}
                                >
                                    <option value="">{formData.sede ? 'Seleccionar carrera...' : 'Primero seleccione una sede'}</option>
                                    {availableCareers.map(carrera => (
                                        <option key={carrera} value={carrera}>{carrera}</option>
                                    ))}
                                </select>
                                <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                            </div>
                        </div>
                        
                        {(formData.tipoUsuario === 'concursante_docente' || formData.tipoUsuario === 'auxiliar_docente') && (
                            <div className="col-span-1 md:col-span-2 flex flex-col gap-4">
                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                        Cátedras por las cuales concursa (Seleccione una o más)
                                    </label>
                                    
                                    {selectedCatedras.length > 0 ? (
                                        <div className="flex flex-wrap gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                                            {selectedCatedras.map((c) => (
                                                <span key={c} className="flex items-center gap-1.5 px-3 py-1.5 bg-[#002f6c] text-white text-xs font-bold rounded-lg shadow-sm transition-all">
                                                    {c}
                                                    <button type="button" onClick={() => handleToggleCatedra(c)} className="hover:bg-white/20 p-0.5 rounded-full transition-colors">
                                                        <X size={12} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="text-xs text-slate-400 font-medium italic p-3 bg-slate-50 border border-slate-100 rounded-xl">
                                            Ninguna cátedra seleccionada aún. Marque las opciones en la lista o agregue una personalizada abajo.
                                        </div>
                                    )}
                                </div>

                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                        Agregar Cátedra Personalizada (Otro)
                                    </label>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={customCatedra}
                                            onChange={(e) => setCustomCatedra(e.target.value)}
                                            placeholder="Escriba el nombre de otra cátedra..."
                                            className="flex-1 px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#002f6c] focus:ring-4 focus:ring-[#002f6c]/5 transition-all"
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddCustomCatedra();
                                                }
                                            }}
                                        />
                                        <button
                                            type="button"
                                            onClick={handleAddCustomCatedra}
                                            className="px-6 bg-slate-800 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm active:scale-95"
                                        >
                                            <Plus size={16} />
                                            Agregar
                                        </button>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                        Listado de Cátedras Disponibles
                                    </label>
                                    <div className="max-h-[220px] overflow-y-auto border border-slate-200 rounded-2xl p-4 bg-white grid grid-cols-1 sm:grid-cols-2 gap-2">
                                        {COMMON_CATEDRAS.map(c => {
                                            const isSelected = selectedCatedras.includes(c);
                                            return (
                                                <label
                                                    key={c}
                                                    className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${isSelected ? 'border-[#002f6c] bg-[#002f6c]/5 text-[#002f6c] shadow-sm' : 'border-slate-100 hover:border-slate-200 bg-white text-slate-650'}`}
                                                >
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={() => handleToggleCatedra(c)}
                                                        className="w-4 h-4 rounded text-[#002f6c] border-slate-350 focus:ring-[#002f6c]"
                                                    />
                                                    <span className="text-xs font-bold">{c}</span>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.section>

                {/* Section 3: Contacto */}
                <motion.section 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="p-6 md:p-8 bg-slate-50/50 rounded-3xl border border-slate-100 hover:border-slate-200/80 transition-all duration-300"
                >
                    <SectionTitle
                        title="Contacto y Ubicación"
                        subtitle="Utilizaremos estos medios para notificarle sobre el estado de su admisión académica."
                        icon={Mail}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                        <AppInput
                            type="email"
                            label="Correo Electrónico"
                            placeholder="ejemplo@correo.com"
                            value={formData.correo}
                            onChange={(e) => onChange('correo', e.target.value)}
                            error={errors.includes('correo') ? 'Ingrese un email válido' : ''}
                        />

                        <AppInput
                            type="tel"
                            label="Teléfono Móvil"
                            placeholder="Ej: 0981 123 456"
                            value={formData.telefono}
                            onChange={(e) => onChange('telefono', e.target.value)}
                            error={errors.includes('telefono') ? 'El teléfono es obligatorio' : ''}
                        />

                        <AppInput
                            label="Dirección de Domicilio"
                            placeholder="Calle, número de casa, referencias"
                            icon={MapPin}
                            value={formData.direccion}
                            onChange={(e) => onChange('direccion', e.target.value)}
                            error={errors.includes('direccion') ? 'La dirección es obligatoria' : ''}
                        />

                        <AppInput
                            label="Barrio"
                            placeholder="Ej: Centro"
                            value={formData.barrio}
                            onChange={(e) => onChange('barrio', e.target.value)}
                        />
                    </div>
                </motion.section>

                {/* Section: Salud (Only for Medicine/Postulantes) */}
                {formData.carrera && formData.carrera.includes('Medicina') && (
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 md:p-8 bg-emerald-50/10 rounded-3xl border border-emerald-100 hover:border-emerald-200/80 transition-all duration-300"
                    >
                        <SectionTitle
                            title="Datos de Salud"
                            subtitle="Ficha médica requerida por la Dirección de la Carrera de Medicina."
                            icon={Activity}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                            <div className="grid grid-cols-2 gap-4">
                                <AppInput
                                    label="Grupo Sanguíneo / RH"
                                    placeholder="Ej: O+"
                                    value={formData.grupoSanguineo}
                                    onChange={(e) => onChange('grupoSanguineo', e.target.value)}
                                />
                                <AppInput
                                    label="Alergias"
                                    placeholder="Ej: Penicilina o Ninguna"
                                    value={formData.alergico}
                                    onChange={(e) => onChange('alergico', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                    Seguro Médico
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Público', 'Privado', 'Ninguno'].map((sm) => (
                                        <motion.button
                                            whileHover={{ y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={sm}
                                            type="button"
                                            onClick={() => onChange('seguroMedico', sm)}
                                            className={`
                                                px-3 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                                ${formData.seguroMedico === sm
                                                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-100'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-300 hover:text-emerald-600'}
                                            `}
                                        >
                                            {sm}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                    ¿Presenta alguna Discapacidad?
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-5 gap-1.5">
                                    {['Ninguna', 'Visual', 'Motriz', 'Auditiva', 'Otras'].map((d) => (
                                        <motion.button
                                            whileTap={{ scale: 0.97 }}
                                            key={d}
                                            type="button"
                                            onClick={() => onChange('discapacidad', d)}
                                            className={`
                                                px-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all duration-300
                                                ${formData.discapacidad === d
                                                    ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-amber-300'}
                                            `}
                                        >
                                            {d}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <AppInput
                                label="Enfermedades Crónicas o Observaciones"
                                placeholder="Especifique patologías previas si aplica"
                                value={formData.enfermedadCronica}
                                onChange={(e) => onChange('enfermedadCronica', e.target.value)}
                            />
                        </div>
                    </motion.section>
                )}

                {/* Section: Antecedentes Académicos/Laborales (Only for Medicine/Postulantes) */}
                {formData.carrera && formData.carrera.includes('Medicina') && (
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 md:p-8 bg-blue-50/10 rounded-3xl border border-blue-100 hover:border-blue-200/80 transition-all duration-300"
                    >
                        <SectionTitle
                            title="Antecedentes Académicos y Laborales"
                            subtitle="Información de su colegio secundario y situación laboral actual."
                            icon={School}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                            <AppInput
                                label="Nombre de la Institución de Egreso"
                                placeholder="Ej: Colegio Nacional de la Capital"
                                value={formData.colegioNombre}
                                onChange={(e) => onChange('colegioNombre', e.target.value)}
                            />

                            <div className="grid grid-cols-2 gap-4">
                                <AppInput
                                    label="Ciudad del Colegio"
                                    value={formData.colegioCiudad}
                                    onChange={(e) => onChange('colegioCiudad', e.target.value)}
                                />
                                <AppInput
                                    label="Departamento"
                                    value={formData.colegioDepto}
                                    onChange={(e) => onChange('colegioDepto', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                    Tipo de Institución
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Público', 'Privado', 'Subvencionado'].map((tc) => (
                                        <motion.button
                                            whileHover={{ y: -1 }}
                                            whileTap={{ scale: 0.98 }}
                                            key={tc}
                                            type="button"
                                            onClick={() => onChange('colegioTipo', tc)}
                                            className={`
                                                px-3 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                                ${formData.colegioTipo === tc
                                                    ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                            `}
                                        >
                                            {tc}
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <AppInput
                                    label="Año de Egreso"
                                    type="number"
                                    value={formData.egresoAnio}
                                    onChange={(e) => onChange('egresoAnio', parseInt(e.target.value) || undefined)}
                                />
                                <AppInput
                                    label="Promedio Final de Calificación"
                                    type="number"
                                    step="0.01"
                                    value={formData.egresoPromedio}
                                    onChange={(e) => onChange('egresoPromedio', parseFloat(e.target.value) || undefined)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 w-full md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Situación Laboral Actual</label>
                                <div className="flex flex-col md:flex-row gap-6 items-center">
                                    <div className="flex items-center gap-4 shrink-0">
                                        <span className="text-xs font-bold text-slate-600">¿Trabaja actualmente?</span>
                                        <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                                            <button 
                                                type="button"
                                                onClick={() => onChange('trabaja', true)}
                                                className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${formData.trabaja ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-slate-400'}`}
                                            >Sí</button>
                                            <button 
                                                type="button"
                                                onClick={() => onChange('trabaja', false)}
                                                className={`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 ${!formData.trabaja ? 'bg-slate-200 text-slate-600 shadow-inner' : 'text-slate-400'}`}
                                            >No</button>
                                        </div>
                                    </div>
                                    
                                    {formData.trabaja && (
                                        <motion.div 
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
                                        >
                                            <AppInput
                                                label="Empresa / Institución"
                                                placeholder="Ej: Ministerio de Salud"
                                                value={formData.empresaNombre}
                                                onChange={(e) => onChange('empresaNombre', e.target.value)}
                                            />
                                            <AppInput
                                                label="Cargo y Horario de Trabajo"
                                                placeholder="Ej: Asistente - 07:00 a 13:00"
                                                value={formData.cargo}
                                                onChange={(e) => onChange('cargo', e.target.value)}
                                            />
                                        </motion.div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}
            </div>

            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 size={14} className="text-[var(--success)]" /> Verifique todos los campos obligatorios antes de avanzar
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                    {onSkipToPayment && (
                        <button
                            type="button"
                            onClick={onSkipToPayment}
                            disabled={isLoading}
                            className="w-full sm:w-auto px-6 py-3 bg-[#002f6c] text-white hover:bg-[#001d4a] rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                            {isLoading ? 'Guardando...' : '💳 Guardar e Ir a Caja (Saltar Docs)'}
                        </button>
                    )}
                    <AppButton
                        size="lg"
                        icon={ArrowRight}
                        iconPosition="right"
                        onClick={onContinue}
                        className="w-full sm:w-auto"
                        loading={isLoading}
                    >
                        {isLoading ? 'Guardando...' : 'Siguiente: Carga de Documentos'}
                    </AppButton>
                </div>
            </div>
            
            <OcrUploadModal
                isOpen={isOcrModalOpen}
                onClose={() => setIsOcrModalOpen(false)}
                onSuccess={handleOcrSuccess}
            />
        </motion.div>
    );
};

export default PersonalDataForm;
