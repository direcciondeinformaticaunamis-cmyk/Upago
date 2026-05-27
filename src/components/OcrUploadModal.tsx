import React, { useState, useRef, useEffect } from 'react';
import { 
    X, 
    UploadCloud, 
    FileText, 
    Check, 
    Loader2, 
    AlertTriangle, 
    RefreshCw, 
    User, 
    Heart, 
    BookOpen,
    Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseAdmissionForm } from '../services/ocrParser';
import AppButton from './ui/AppButton';
import AppInput from './ui/AppInput';

// Declare global types for CDN script objects
declare global {
    interface Window {
        pdfjsLib: any;
        Tesseract: any;
    }
}

interface OcrUploadModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: (data: any) => void;
}

const TESSERACT_CDN = 'https://cdn.jsdelivr.net/npm/tesseract.js@5.1.0/dist/tesseract.min.js';
const PDFJS_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
const PDFJS_WORKER_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export const OcrUploadModal: React.FC<OcrUploadModalProps> = ({ isOpen, onClose, onSuccess }) => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isPdf, setIsPdf] = useState(false);
    const [pdfPages, setPdfPages] = useState<string[]>([]); // Data URLs for rendering PDF page previews
    const [currentPdfPage, setCurrentPdfPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    
    // Status states
    const [statusText, setStatusText] = useState('');
    const [progress, setProgress] = useState(0);
    const [ocrState, setOcrState] = useState<'idle' | 'loading_libs' | 'processing_pdf' | 'running_ocr' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Parsed results for review
    const [parsedData, setParsedData] = useState<any>(null);
    
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dragRef = useRef<HTMLDivElement>(null);

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

    // Load External Scripts (Tesseract & PDFJS)
    const initLibraries = async (): Promise<boolean> => {
        try {
            setOcrState('loading_libs');
            setStatusText('Cargando motor de procesamiento de documentos...');
            setProgress(15);
            
            // Load PDFJS
            if (!window.pdfjsLib) {
                await loadScript(PDFJS_CDN);
            }
            if (window.pdfjsLib && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
                window.pdfjsLib.GlobalWorkerOptions.workerSrc = PDFJS_WORKER_CDN;
            }

            setProgress(40);
            setStatusText('Iniciando motor OCR (Reconocimiento Óptico)...');
            
            // Load Tesseract.js
            if (!window.Tesseract) {
                await loadScript(TESSERACT_CDN);
            }
            
            setProgress(60);
            return true;
        } catch (err: any) {
            console.error("Library initialization failed", err);
            setOcrState('error');
            setErrorMessage('No se pudieron cargar las librerías necesarias. Verifique su conexión de internet.');
            return false;
        }
    };

    // Drag and drop handlers
    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragRef.current) {
            dragRef.current.classList.add('border-[var(--primary)]', 'bg-[var(--primary-50)]/30');
        }
    };

    const handleDragLeave = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragRef.current) {
            dragRef.current.classList.remove('border-[var(--primary)]', 'bg-[var(--primary-50)]/30');
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (dragRef.current) {
            dragRef.current.classList.remove('border-[var(--primary)]', 'bg-[var(--primary-50)]/30');
        }
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processSelectedFile(droppedFile);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processSelectedFile(selectedFile);
        }
    };

    const processSelectedFile = (selectedFile: File) => {
        const isPdfType = selectedFile.type === 'application/pdf' || selectedFile.name.endsWith('.pdf');
        const isImageType = selectedFile.type.startsWith('image/') || /\.(jpe?g|png)$/i.test(selectedFile.name);
        
        if (!isPdfType && !isImageType) {
            alert('Formato de archivo no soportado. Suba un archivo PDF o una Imagen (JPG, PNG).');
            return;
        }

        setFile(selectedFile);
        setIsPdf(isPdfType);
        setOcrState('idle');
        setParsedData(null);
        setPdfPages([]);
        setProgress(0);
        
        const url = URL.createObjectURL(selectedFile);
        setPreviewUrl(url);
    };

    // Main scanning dispatcher
    const handleScan = async () => {
        if (!file) return;

        const libsLoaded = await initLibraries();
        if (!libsLoaded) return;

        setProgress(70);
        try {
            if (isPdf) {
                await processPdfFile(file);
            } else {
                await processImageFile(file);
            }
        } catch (err: any) {
            console.error("Scanning failed", err);
            setOcrState('error');
            setErrorMessage(err.message || 'Error desconocido durante la lectura del documento.');
        }
    };

    // Helper: Runs Tesseract on an image or canvas
    const runOcrOnSource = async (source: any): Promise<string> => {
        setStatusText('Ejecutando OCR para lectura de texto. Por favor espere...');
        setOcrState('running_ocr');
        
        const worker = await window.Tesseract.createWorker('spa');
        
        // Progress hook for Tesseract
        // Note: Tesseract worker has logger options in modern versions
        
        const result = await worker.recognize(source);
        await worker.terminate();
        return result.data.text;
    };

    // 1. Process PDF file
    const processPdfFile = async (pdfFile: File) => {
        setOcrState('processing_pdf');
        setStatusText('Analizando estructura del documento PDF...');
        
        const arrayBuffer = await pdfFile.arrayBuffer();
        const loadingTask = window.pdfjsLib.getDocument({ data: arrayBuffer });
        const pdf = await loadingTask.promise;
        
        setTotalPages(pdf.numPages);
        
        // Step A: Attempt direct digital text extraction
        let extractedText = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map((item: any) => item.str).join(' ');
            extractedText += pageText + '\n';
        }
        
        console.log("Directly Extracted Text Length:", extractedText.trim().length);
        
        // Step B: Generate PDF page image previews using HTML5 canvas
        const pagesDataUrls: string[] = [];
        setStatusText('Generando vistas previas del PDF...');
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                await page.render({ canvasContext: context, viewport }).promise;
                pagesDataUrls.push(canvas.toDataURL('image/png'));
            }
        }
        setPdfPages(pagesDataUrls);

        // Step C: Fallback to OCR if digital text is empty/insufficient (Scanned PDF)
        if (extractedText.trim().length < 150) {
            console.log("Scanned PDF detected. Running OCR on pages...");
            setStatusText('El PDF parece estar escaneado. Renderizando y procesando OCR en página 1...');
            
            // For now, process page 1
            const page1 = await pdf.getPage(1);
            const viewport = page1.getViewport({ scale: 2.0 }); // High resolution for better OCR accuracy
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (context) {
                canvas.height = viewport.height;
                canvas.width = viewport.width;
                setStatusText('Renderizando PDF escaneado a imagen de alta resolución...');
                await page1.render({ canvasContext: context, viewport }).promise;
                
                extractedText = await runOcrOnSource(canvas);
            }
        }

        // Step D: Parse and display values
        setProgress(95);
        setStatusText('Estructurando información detectada...');
        const parsed = parseAdmissionForm(extractedText);
        
        // Log extracted text for debugging
        console.log("Final Extracted Text:\n", extractedText);
        
        setParsedData(parsed);
        setProgress(100);
        setOcrState('success');
    };

    // 2. Process Image file (JPG/PNG)
    const processImageFile = async (imgFile: File) => {
        setOcrState('running_ocr');
        setStatusText('Leyendo imagen con motor OCR...');
        
        // Read file as base64 to display preview
        const reader = new FileReader();
        const base64Promise = new Promise<string>((resolve) => {
            reader.onload = () => resolve(reader.result as string);
            reader.readAsDataURL(imgFile);
        });
        const base64 = await base64Promise;
        setPreviewUrl(base64);
        
        const extractedText = await runOcrOnSource(imgFile);
        
        setProgress(95);
        setStatusText('Estructurando información detectada...');
        const parsed = parseAdmissionForm(extractedText);
        
        // Log extracted text for debugging
        console.log("Final Extracted Text:\n", extractedText);
        
        setParsedData(parsed);
        setProgress(100);
        setOcrState('success');
    };

    // Field change handler inside the verification form
    const handleFieldChange = (field: string, value: any) => {
        setParsedData((prev: any) => ({
            ...prev,
            [field]: value
        }));
    };

    // Close and reset modal state
    const handleClose = () => {
        setFile(null);
        setPreviewUrl(null);
        setPdfPages([]);
        setParsedData(null);
        setOcrState('idle');
        setProgress(0);
        onClose();
    };

    // Inject data and complete the process
    const handleImport = () => {
        if (parsedData) {
            onSuccess(parsedData);
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
            {/* Backdrop */}
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={handleClose}
                className="fixed inset-0 bg-slate-900/60 backdrop-blur-md"
            />

            {/* Modal Body */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
                className="relative bg-white/95 backdrop-blur-xl w-full max-w-7xl h-[90vh] rounded-[2.5rem] shadow-2xl border border-slate-100 flex flex-col overflow-hidden z-10 font-sans"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-8 py-5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)] text-white flex items-center justify-center shadow-md">
                            <FileText size={20} />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">
                                Importar Formulario Digital o Escaneado (OCR)
                            </h3>
                            <p className="text-xs text-slate-500 font-medium">
                                Procesa archivos PDF o Imágenes del Formulario de Admisión Medicina 2026 en segundos.
                            </p>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleClose}
                        className="p-2 text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Content body */}
                <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                    
                    {/* Left Panel: Preview & Upload */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col border-r border-slate-100 bg-slate-50/30 overflow-y-auto">
                        {!file ? (
                            // Dropzone
                            <div 
                                ref={dragRef}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                                className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-[2rem] p-8 text-center cursor-pointer bg-white/50 hover:bg-white hover:border-[var(--primary)]/50 transition-all duration-300 shadow-sm"
                            >
                                <input 
                                    type="file" 
                                    ref={fileInputRef} 
                                    onChange={handleFileChange}
                                    accept="application/pdf,image/png,image/jpeg"
                                    className="hidden" 
                                />
                                <div className="w-20 h-20 rounded-3xl bg-[var(--primary-50)] text-[var(--primary)] flex items-center justify-center mb-6 shadow-inner animate-pulse">
                                    <UploadCloud size={36} />
                                </div>
                                <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2">
                                    Arrastre su formulario aquí
                                </h4>
                                <p className="text-sm text-slate-500 max-w-sm mb-6 leading-relaxed font-medium">
                                    Formatos aceptados: <strong className="text-slate-700">PDF</strong> (digital o escaneado), <strong className="text-slate-700">JPG</strong> o <strong className="text-slate-700">PNG</strong>.
                                </p>
                                <span className="px-5 py-3 bg-[var(--primary)] text-white text-xs font-black uppercase tracking-widest rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">
                                    Seleccionar Archivo
                                </span>
                            </div>
                        ) : (
                            // Document Preview and Scan Trigger
                            <div className="flex-1 flex flex-col h-full gap-4">
                                <div className="flex items-center justify-between bg-white border border-slate-100 p-3 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-[var(--primary-50)] text-[var(--primary)] rounded-lg">
                                            <FileText size={20} />
                                        </div>
                                        <div className="max-w-[200px] md:max-w-xs">
                                            <p className="text-xs font-black text-slate-700 truncate">{file.name}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => {
                                            setFile(null);
                                            setPreviewUrl(null);
                                            setPdfPages([]);
                                            setParsedData(null);
                                            setOcrState('idle');
                                        }}
                                        className="text-[10px] font-black uppercase text-red-500 hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                                    >
                                        Quitar
                                    </button>
                                </div>

                                {/* Preview Wrapper */}
                                <div className="flex-1 min-h-[300px] border border-slate-100 rounded-[2rem] bg-slate-800 flex items-center justify-center overflow-hidden shadow-inner relative">
                                    {isPdf && pdfPages.length > 0 ? (
                                        // Rendered PDF Page Preview
                                        <div className="relative w-full h-full flex flex-col justify-between">
                                            <div className="flex-1 flex items-center justify-center p-4 overflow-auto">
                                                <img 
                                                    src={pdfPages[currentPdfPage - 1]} 
                                                    alt={`Page ${currentPdfPage}`} 
                                                    className="max-w-full max-h-full object-contain rounded shadow-lg"
                                                />
                                            </div>
                                            {/* PDF Pagination bar */}
                                            {totalPages > 1 && (
                                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-slate-900/80 backdrop-blur border border-slate-700 px-4 py-1.5 rounded-full flex items-center gap-4 text-white text-xs font-bold shadow-md">
                                                    <button 
                                                        disabled={currentPdfPage === 1}
                                                        onClick={() => setCurrentPdfPage(prev => Math.max(1, prev - 1))}
                                                        className="hover:text-[var(--primary-200)] disabled:opacity-40"
                                                    >
                                                        Anterior
                                                    </button>
                                                    <span>{currentPdfPage} / {totalPages}</span>
                                                    <button 
                                                        disabled={currentPdfPage === totalPages}
                                                        onClick={() => setCurrentPdfPage(prev => Math.min(totalPages, prev + 1))}
                                                        className="hover:text-[var(--primary-200)] disabled:opacity-40"
                                                    >
                                                        Siguiente
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    ) : !isPdf && previewUrl ? (
                                        // Image Preview
                                        <div className="p-4 flex items-center justify-center w-full h-full">
                                            <img 
                                                src={previewUrl} 
                                                alt="Uploaded Form Preview" 
                                                className="max-w-full max-h-full object-contain rounded shadow-lg"
                                            />
                                        </div>
                                    ) : (
                                        // Loading preview/generic state
                                        <div className="text-center p-6 text-slate-400">
                                            <div className="w-10 h-10 border-2 border-slate-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                            <p className="text-xs font-medium">Preparando previsualización del archivo...</p>
                                        </div>
                                    )}
                                </div>

                                {/* Trigger Action */}
                                {ocrState === 'idle' && (
                                    <button 
                                        onClick={handleScan}
                                        className="w-full flex items-center justify-center gap-2 py-4 bg-[var(--primary)] hover:bg-[#002f6c] text-white text-sm font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-primary/25 hover:shadow-primary/35 transition-all duration-300"
                                    >
                                        ✨ Analizar y Extraer Datos (OCR)
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Panel: Processing Loader / Verification Form */}
                    <div className="w-full md:w-1/2 p-6 flex flex-col bg-white overflow-y-auto">
                        <AnimatePresence mode="wait">
                            {/* 1. Loader / Processing State */}
                            {(ocrState === 'loading_libs' || ocrState === 'processing_pdf' || ocrState === 'running_ocr') && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center p-8"
                                >
                                    <div className="relative mb-6">
                                        <div className="w-20 h-20 border-4 border-slate-100 rounded-full" />
                                        <Loader2 className="absolute top-0 left-0 w-20 h-20 text-[var(--primary)] animate-spin" strokeWidth={2} />
                                        <div className="absolute inset-0 flex items-center justify-center text-[var(--primary)] font-black text-xs">
                                            {progress}%
                                        </div>
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2 uppercase">
                                        Procesando documento
                                    </h4>
                                    <p className="text-sm text-slate-500 font-bold max-w-sm mb-6 leading-relaxed">
                                        {statusText}
                                    </p>
                                    {/* Progress bar container */}
                                    <div className="w-full max-w-xs bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                                        <motion.div 
                                            className="bg-[var(--primary)] h-full"
                                            animate={{ width: `${progress}%` }}
                                            transition={{ ease: 'easeInOut' }}
                                        />
                                    </div>
                                </motion.div>
                            )}

                            {/* 2. Idle State */}
                            {ocrState === 'idle' && !parsedData && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400"
                                >
                                    <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100 mb-4 text-slate-300">
                                        <Eye size={28} />
                                    </div>
                                    <h5 className="font-black text-slate-700 uppercase text-xs tracking-wider mb-1">
                                        Panel de Revisión de Datos
                                    </h5>
                                    <p className="text-xs text-slate-400 max-w-xs font-medium leading-relaxed">
                                        Los datos detectados mediante inteligencia artificial y OCR aparecerán aquí tras pulsar en "Analizar y Extraer Datos".
                                    </p>
                                </motion.div>
                            )}

                            {/* 3. Error State */}
                            {ocrState === 'error' && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex-1 flex flex-col items-center justify-center text-center p-8"
                                >
                                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4 border border-red-100">
                                        <AlertTriangle size={32} />
                                    </div>
                                    <h4 className="text-lg font-black text-slate-800 tracking-tight mb-2">
                                        Fallo al Procesar Formulario
                                    </h4>
                                    <p className="text-sm text-red-500 max-w-sm mb-6 leading-relaxed font-bold">
                                        {errorMessage}
                                    </p>
                                    <button 
                                        onClick={() => setOcrState('idle')}
                                        className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                                    >
                                        <RefreshCw size={14} /> Volver a Intentar
                                    </button>
                                </motion.div>
                            )}

                            {/* 4. Success / Review Panels */}
                            {ocrState === 'success' && parsedData && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 15 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex-1 flex flex-col h-full justify-between"
                                >
                                    {/* Scrollable Fields */}
                                    <div className="space-y-8 pr-1 pb-4 flex-1">
                                        <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center">
                                                <Check size={16} />
                                            </div>
                                            <div>
                                                <h5 className="text-xs font-black text-emerald-800 uppercase tracking-wide">
                                                    Escaneo Completado
                                                </h5>
                                                <p className="text-[10px] font-bold text-emerald-600">
                                                    Revise y complete la información extraída a continuación antes de integrarla al expediente.
                                                </p>
                                            </div>
                                        </div>

                                        {/* Block 1: Identidad */}
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-colors">
                                            <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-2">
                                                <User size={14} className="text-slate-400" /> Identidad del Postulante
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <AppInput
                                                    label="Nombres"
                                                    value={parsedData.nombre || ''}
                                                    onChange={(e) => handleFieldChange('nombre', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Apellidos"
                                                    value={parsedData.apellido || ''}
                                                    onChange={(e) => handleFieldChange('apellido', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Cédula N°"
                                                    value={parsedData.cedula || ''}
                                                    onChange={(e) => handleFieldChange('cedula', e.target.value)}
                                                />
                                                <AppInput
                                                    label="RUC"
                                                    value={parsedData.ruc || ''}
                                                    onChange={(e) => handleFieldChange('ruc', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Fecha Nacimiento (AAAA-MM-DD)"
                                                    value={parsedData.fechaNacimiento || ''}
                                                    onChange={(e) => handleFieldChange('fechaNacimiento', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Nacionalidad"
                                                    value={parsedData.nacionalidad || ''}
                                                    onChange={(e) => handleFieldChange('nacionalidad', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Ciudad de Nacimiento"
                                                    value={parsedData.lugarNacimientoCiudad || ''}
                                                    onChange={(e) => handleFieldChange('lugarNacimientoCiudad', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Dpto. de Nacimiento"
                                                    value={parsedData.lugarNacimientoDepto || ''}
                                                    onChange={(e) => handleFieldChange('lugarNacimientoDepto', e.target.value)}
                                                />
                                                <div className="col-span-2">
                                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Género</label>
                                                    <div className="flex gap-4">
                                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="modal_genero"
                                                                checked={parsedData.genero === 'M'}
                                                                onChange={() => handleFieldChange('genero', 'M')}
                                                                className="accent-[var(--primary)]"
                                                            />
                                                            Masculino
                                                        </label>
                                                        <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 cursor-pointer">
                                                            <input
                                                                type="radio"
                                                                name="modal_genero"
                                                                checked={parsedData.genero === 'F'}
                                                                onChange={() => handleFieldChange('genero', 'F')}
                                                                className="accent-[var(--primary)]"
                                                            />
                                                            Femenino
                                                        </label>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Block 2: Ubicación y Contacto */}
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-colors">
                                            <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-2">
                                                <User size={14} className="text-slate-400" /> Ubicación & Contacto
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <AppInput
                                                    label="Teléfono"
                                                    value={parsedData.telefono || ''}
                                                    onChange={(e) => handleFieldChange('telefono', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Correo Electrónico"
                                                    value={parsedData.correo || ''}
                                                    onChange={(e) => handleFieldChange('correo', e.target.value)}
                                                />
                                                <div className="col-span-2">
                                                    <AppInput
                                                        label="Dirección Actual"
                                                        value={parsedData.direccion || ''}
                                                        onChange={(e) => handleFieldChange('direccion', e.target.value)}
                                                    />
                                                </div>
                                                <AppInput
                                                    label="Barrio"
                                                    value={parsedData.barrio || ''}
                                                    onChange={(e) => handleFieldChange('barrio', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Sede Académica"
                                                    value={parsedData.sede || ''}
                                                    onChange={(e) => handleFieldChange('sede', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Block 3: Antecedentes Académicos */}
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-colors">
                                            <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-2">
                                                <BookOpen size={14} className="text-slate-400" /> Antecedentes Académicos
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="col-span-2">
                                                    <AppInput
                                                        label="Denominación del Colegio"
                                                        value={parsedData.colegioNombre || ''}
                                                        onChange={(e) => handleFieldChange('colegioNombre', e.target.value)}
                                                    />
                                                </div>
                                                <AppInput
                                                    label="Colegio Ciudad"
                                                    value={parsedData.colegioCiudad || ''}
                                                    onChange={(e) => handleFieldChange('colegioCiudad', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Colegio Distrito"
                                                    value={parsedData.colegioDistrito || ''}
                                                    onChange={(e) => handleFieldChange('colegioDistrito', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Colegio Dpto."
                                                    value={parsedData.colegioDepto || ''}
                                                    onChange={(e) => handleFieldChange('colegioDepto', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Tipo de Colegio"
                                                    value={parsedData.colegioTipo || ''}
                                                    onChange={(e) => handleFieldChange('colegioTipo', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Año Egreso"
                                                    value={parsedData.egresoAnio || ''}
                                                    onChange={(e) => handleFieldChange('egresoAnio', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Promedio de Egreso"
                                                    value={parsedData.egresoPromedio || ''}
                                                    onChange={(e) => handleFieldChange('egresoPromedio', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        {/* Block 4: Salud */}
                                        <div className="bg-slate-50/50 border border-slate-100 rounded-2xl p-5 hover:border-slate-200 transition-colors">
                                            <h4 className="text-xs font-black text-slate-800 tracking-wider uppercase mb-4 flex items-center gap-2">
                                                <Heart size={14} className="text-slate-400" /> Ficha de Salud
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <AppInput
                                                    label="Grupo Sanguíneo/RH"
                                                    value={parsedData.grupoSanguineo || ''}
                                                    onChange={(e) => handleFieldChange('grupoSanguineo', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Alérgico a"
                                                    value={parsedData.alergico || ''}
                                                    onChange={(e) => handleFieldChange('alergico', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Seguro Médico"
                                                    value={parsedData.seguroMedico || ''}
                                                    onChange={(e) => handleFieldChange('seguroMedico', e.target.value)}
                                                />
                                                <div className="col-span-2">
                                                    <AppInput
                                                        label="Enfermedad Crónica (Especificar)"
                                                        value={parsedData.enfermedadCronica || ''}
                                                        onChange={(e) => handleFieldChange('enfermedadCronica', e.target.value)}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Action Bar */}
                                    <div className="border-t border-slate-100 pt-4 flex gap-4 bg-white z-10">
                                        <button 
                                            onClick={() => {
                                                setParsedData(null);
                                                setOcrState('idle');
                                            }}
                                            className="flex-1 py-3.5 border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-wider rounded-xl transition-all"
                                        >
                                            Volver a Escanear
                                        </button>
                                        <button 
                                            onClick={handleImport}
                                            className="flex-1 py-3.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/10 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} /> Importar al Formulario
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                </div>
            </motion.div>
        </div>
    );
};
