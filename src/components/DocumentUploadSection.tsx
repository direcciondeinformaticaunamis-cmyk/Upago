import React, { useState, useRef } from 'react';
import {
    FileText,
    Upload,
    Sparkles,
    ArrowRight,
    CheckCircle2,
    Clock,
    Plus,
    Download,
    User,
    ExternalLink,
    ShieldCheck,
    Lock,
    FileCheck,
    ArrowLeft,
    Eye as Visibility,
    Trash2 as Delete,
    ShieldCheck as VerifiedUser,
    LockIcon
} from 'lucide-react';
import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AppButton from './ui/AppButton';
import SectionTitle from './ui/SectionTitle';
import ProgressBar from './ui/ProgressBar';
import { generateVoucherHTML } from './VoucherTemplate';
import { securityService } from '../services/SecurityService';
import DocumentPreviewModal from './DocumentPreviewModal';

interface DocumentItem {
    id: string;
    label: string;
    description: string;
    status: 'pending' | 'uploaded' | 'verified' | 'rejected';
    fileNames: string[];
    downloadUrl?: string;
    isSigned?: boolean;
    phase: 1 | 2 | 3;
}

interface PostulanteData {
    nombre: string;
    apellido: string;
    cedula: string;
    correo: string;
    telefono: string;
    fechaNacimiento?: string;
    genero?: string;
    direccion?: string;
    carrera: string;
    sede: string;
    tipoUsuario?: 'postulante' | 'concursante_docente' | 'auxiliar_docente';
    numero_expediente?: string;
}

interface DocumentUploadSectionProps {
    postulanteData: PostulanteData;
    photo: string | null;
    onFinish?: () => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ postulanteData, photo, onFinish }) => {
    const [documents, setDocuments] = useState<DocumentItem[]>(() => {
        // --- CASO DOCENTE / CONCURSANTE (MEDICINA Y OTROS) ---
        if (postulanteData.tipoUsuario === 'concursante_docente' || postulanteData.tipoUsuario === 'auxiliar_docente') {
            return [
                { id: 'cv', label: 'a) Currículum vitae actualizado', description: 'Formato PDF, debidamente firmado y actualizado.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'solicitud_participacion', label: 'a.1) Nota de Solicitud de Participación en el Concurso', description: 'Nota formal firmada y dirigida a la Comisión de Selección/Evaluación.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'cedula', label: 'b) Fotocopia autenticada por Escribanía de la C.I.', description: 'Cédula de identidad civil vigente (ambos lados).', status: 'pending', fileNames: [], phase: 1 },
                { id: 'titulos', label: 'c) Fotocopia autenticada de Certificados y Títulos', description: 'Títulos de grado universitario y postgrado autenticados.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'cursos', label: 'd) Fotocopia simple de certificados de cursos/talleres', description: 'Vinculados a las funciones del cargo a concursar.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'declaracion_jurada', label: 'e) Declaración jurada de no hallarse en inhabilidades', description: 'Previstas en las leyes y reglamentos vigentes.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'antecedente_judicial', label: 'f) Certificado de antecedente judicial', description: 'Documento original o digital válido y vigente.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'antecedente_policial', label: 'g) Certificado de antecedente policial', description: 'Documento original o digital válido y vigente.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'comprobante_pago', label: 'h) Pago del arancel de inscripción', description: 'Correspondiente por asignatura. Se habilita tras validación académica.', status: 'pending', fileNames: [], phase: 2 }
            ];
        }

        // --- CASO POSTULANTE: MEDICINA ---
        if (postulanteData.carrera.includes('Medicina')) {
            return [
                { id: 'cedula', label: '1. Fotocopia de Cédula de Identidad', description: 'Copia nítida vigente.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'estudio', label: '2. Certificado de Estudios (Educación Media)', description: 'Legalizado por las instituciones encargadas.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'titulo', label: '3. Fotocopia del Título de Bachiller', description: 'Legalizado por las instituciones encargadas.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'antecedente_policial', label: '4. Certificado de Antecedente Policial', description: 'Original o digital válido.', status: 'pending', fileNames: [], phase: 1 },
                { id: 'comprobante_pago', label: '5. Comprobante de Pago (Arancel)', description: 'Habilitado tras validación académica.', status: 'pending', fileNames: [], phase: 2 }
            ];
        }

        // --- CASO POR DEFECTO: OTROS ESTUDIANTES ---
        return [
            { id: 'cedula', label: 'Fotocopia de Cédula de Identidad', description: 'O Pasaporte para extranjeros.', status: 'pending', fileNames: [], phase: 1 },
            { id: 'estudio', label: 'Certificado de Estudios de la Educación Media', description: 'Acorde a exigencias del MEC.', status: 'pending', fileNames: [], phase: 1 },
            { id: 'titulo', label: 'Fotocopia del Título de Bachiller', description: 'Acorde a exigencias del MEC.', status: 'pending', fileNames: [], phase: 1 },
            { id: 'antecedente_policial', label: 'Certificado de Antecedentes Policiales', description: 'Original debidamente firmado.', status: 'pending', fileNames: [], phase: 1 },
            { id: 'comprobante_pago', label: 'Comprobante de Ingreso por Pago de Arancel', description: 'Habilitado tras verificación de documentos.', status: 'pending', fileNames: [], phase: 2 }
        ] as DocumentItem[];
    });

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');

    // --- LOGICA DE MULTIASIGNATURAS PARA DOCENTES ---
    const [docAsignatura, setDocAsignatura] = useState<string>('General');
    const [docSubjects, setDocSubjects] = useState<string[]>([]);
    const [showAddSubjectInput, setShowAddSubjectInput] = useState<boolean>(false);
    const [newSubjectName, setNewSubjectName] = useState<string>('');

    useEffect(() => {
        const fetchSubjects = async () => {
            try {
                const response = await fetch(`api.php?pagos=${postulanteData.cedula}`);
                const data = await response.json();
                if (Array.isArray(data)) {
                    const subjects = Array.from(new Set(data.map((p: any) => p.asignatura).filter(Boolean))) as string[];
                    setDocSubjects(subjects);
                }
            } catch (err) {
                console.error("Error fetching subjects:", err);
            }
        };
        if (postulanteData.tipoUsuario === 'concursante_docente' || postulanteData.tipoUsuario === 'auxiliar_docente') {
            fetchSubjects();
        }
    }, [postulanteData.cedula, postulanteData.tipoUsuario]);

    useEffect(() => {
        const fetchDocumentStatuses = async () => {
            try {
                const response = await fetch(`api.php?docs=${postulanteData.cedula}`);
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setDocuments(prev => prev.map(doc => {
                        const isShared = ['cedula', 'titulos', 'antecedente_judicial', 'antecedente_policial'].includes(doc.id);
                        
                        const cloudDoc = data.find((d: any) => {
                            if (d.tipo_documento !== doc.id) return false;
                            if (postulanteData.tipoUsuario !== 'concursante_docente' && postulanteData.tipoUsuario !== 'auxiliar_docente') return true;
                            
                            if (isShared) {
                                return !d.asignatura || d.asignatura === '';
                            } else {
                                const targetSubject = docAsignatura === 'General' ? '' : docAsignatura;
                                return (d.asignatura || '') === targetSubject;
                            }
                        });

                        if (cloudDoc) {
                            return {
                                ...doc,
                                status: cloudDoc.estado === 'validado' ? 'verified' : 'uploaded',
                                fileNames: [cloudDoc.archivo_nombre],
                                downloadUrl: cloudDoc.archivo_url
                            };
                        }
                        return {
                            ...doc,
                            status: 'pending',
                            fileNames: [],
                            downloadUrl: undefined
                        };
                    }));
                }
            } catch (err) {
                console.error("Error fetching docs:", err);
            }
        };

        fetchDocumentStatuses();
    }, [postulanteData.cedula, docAsignatura, postulanteData.tipoUsuario]);

    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    const handleFileUpload = async (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setDocuments(prev => prev.map(doc =>
                doc.id === id ? { ...doc, status: 'uploaded', fileNames: [...doc.fileNames, file.name], isSigned: true } : doc
            ));

            securityService.log(`Carga de archivo: ${file.name} en ${id}`, 'Postulante');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('type', id);
            formData.append('postulante_id', postulanteData.cedula);
            
            const isShared = ['cedula', 'titulos', 'antecedente_judicial', 'antecedente_policial'].includes(id);
            const uploadSubject = isShared || docAsignatura === 'General' ? '' : docAsignatura;
            formData.append('asignatura', uploadSubject);

            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                console.log("Carga exitosa:", result);
                if (result.status === 'success' && result.path) {
                    setDocuments(prev => prev.map(doc =>
                        doc.id === id ? { ...doc, downloadUrl: result.path } : doc
                    ));
                }
            } catch (err) {
                console.error("Error cargando archivo:", err);
            }
        }
    };

    const triggerUpload = (id: string) => {
        fileInputRefs.current[id]?.click();
    };

    const [isFinished, setIsFinished] = useState(false);

    const handleFinalize = () => {
        if (onFinish) {
            onFinish();
        } else {
            setIsFinished(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const completedCount = documents.filter(doc => doc.status === 'uploaded' || doc.status === 'verified').length;
    const pendingDocuments = documents.filter(doc => doc.status !== 'uploaded' && doc.status !== 'verified');
    
    // Verificamos si la fase 1 está lista (aprobada por admin)
    const isPhase1Approved = documents.filter(doc => doc.phase === 1).every(doc => doc.status === 'verified');

    // ¿Están todos los de Fase 1 subidos (aunque no aprobados)?
    const isPhase1Uploaded = documents.filter(doc => doc.phase === 1).every(doc => doc.status === 'uploaded' || doc.status === 'verified');

    const isFullyComplete = pendingDocuments.length === 0;
    const progressPercent = (completedCount / documents.length) * 100;

    if (isFinished) {
        return (
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-8 md:p-16 text-center"
            >
                <div className="w-24 h-24 bg-emerald-50 rounded-[2rem] flex items-center justify-center text-[var(--success)] mx-auto mb-8 shadow-lg shadow-emerald-600/5 border border-emerald-100/50">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>

                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4 uppercase">
                    ¡Pre-inscripción <span className="text-[var(--primary)]">Exitosa</span>!
                </h2>

                <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mb-8 font-medium text-sm">
                    Su expediente digital ha sido procesado correctamente para la carrera de **{postulanteData.carrera}** en el Campus de **{postulanteData.sede}**.
                    Recibirá las notificaciones correspondientes en su correo institucional: <span className="text-slate-800 font-bold">{postulanteData.correo}</span>.
                </p>

                {!isFullyComplete && (
                    <div className="bg-amber-50/60 border border-amber-100 rounded-3xl p-6 mb-10 max-w-lg mx-auto text-left shadow-sm">
                        <div className="flex items-center gap-2 text-amber-700 font-black uppercase tracking-wider text-xs mb-3">
                            <Clock size={16} /> Documentos Pendientes de Presentación
                        </div>
                        <ul className="space-y-2">
                            {pendingDocuments.map(doc => (
                                <li key={doc.id} className="text-[11px] font-bold text-amber-800 flex items-center gap-2.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    {doc.label}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-[10px] font-bold text-amber-600/80 italic leading-relaxed">
                            * Nota: Para completar la matriculación formal definitiva de la Admisión 2026, deberá acercar los originales correspondientes ante la ventanilla del Campus Universitario.
                        </p>
                    </div>
                )}

                <div className="bg-slate-50 rounded-3xl border border-slate-100 p-8 mb-12 max-w-md mx-auto space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Postulante</span>
                        <span className="text-slate-800 font-black">{postulanteData.nombre} {postulanteData.apellido}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Código Único de Trámite</span>
                        <span className="text-[var(--primary)] font-mono font-black">{postulanteData.numero_expediente || 'UNAMIS-2026-REG-PENDIENTE'}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <AppButton size="lg" onClick={() => window.location.reload()}>
                        Finalizar y Salir
                    </AppButton>
                    <AppButton
                        variant="secondary"
                        size="lg"
                        icon={ExternalLink}
                        onClick={() => {
                            const regCode = postulanteData.numero_expediente || 'UNAMIS-2026-REG-PENDIENTE';
                            const html = generateVoucherHTML(postulanteData, documents, regCode, photo);
                            const win = window.open('', '_blank');
                            if (win) {
                                win.document.write(html);
                                win.document.close();
                            }
                        }}
                    >
                        Descargar Ficha / Comprobante
                    </AppButton>
                </div>
            </motion.div>
        );
    }

    return (
        <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-[2.5rem] border border-slate-100 shadow-premium p-6 md:p-12 relative overflow-hidden"
        >
            {/* Background elements */}
            <div className="absolute -right-24 -top-24 w-96 h-96 bg-[var(--primary-50)] rounded-full blur-3xl opacity-50 pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-slate-100 pb-8 relative z-10">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-1 uppercase">
                        Expediente Digital de Admisión
                    </h2>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em]">Paso 02: Carga de Requisitos y Certificados</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Progreso Global</p>
                        <p className="text-sm font-black text-[var(--primary)] tabular-nums">{completedCount} de {documents.length} Requisitos</p>
                    </div>
                    <div className="w-14 h-14 rounded-2xl bg-[var(--primary-50)] text-[var(--primary)] flex items-center justify-center font-black text-sm border border-[var(--primary-100)] shadow-sm">
                        {Math.round(progressPercent)}%
                    </div>
                </div>
            </div>

            <div className="relative z-10 space-y-10">
                <SectionTitle
                    title="Documentación Digitalizada"
                    subtitle="Adjunte los requisitos solicitados en formato PDF o Imagen nítida. El Certificado de Antecedentes Policiales debe estar firmado."
                    icon={FileCheck}
                />

                {(postulanteData.tipoUsuario === 'concursante_docente' || postulanteData.tipoUsuario === 'auxiliar_docente') && (
                    <div className="bg-purple-50/50 border border-purple-100 rounded-3xl p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
                        <div className="space-y-1">
                            <h4 className="text-purple-950 font-black tracking-tight text-sm uppercase">Carpeta Digital por Asignatura</h4>
                            <p className="text-purple-800 text-xs font-semibold leading-relaxed">
                                Seleccione la cátedra para subir requisitos específicos (CV, Nota de Concurso, Declaración). Documentos generales (Cédula, Títulos, Judicial/Policial) se comparten automáticamente.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 shrink-0">
                            {showAddSubjectInput ? (
                                <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-purple-200 shadow-inner">
                                    <input 
                                        type="text" 
                                        placeholder="Nombre de la asignatura"
                                        value={newSubjectName}
                                        onChange={(e) => setNewSubjectName(e.target.value)}
                                        className="bg-transparent border-0 outline-none text-xs font-bold text-slate-800 px-3 py-1.5 w-44"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => {
                                            if (newSubjectName.trim()) {
                                                const cleanName = newSubjectName.trim();
                                                if (!docSubjects.includes(cleanName)) {
                                                    setDocSubjects(prev => [...prev, cleanName]);
                                                }
                                                setDocAsignatura(cleanName);
                                                setNewSubjectName('');
                                                setShowAddSubjectInput(false);
                                            }
                                        }}
                                        className="bg-purple-700 text-white px-3 py-1.5 rounded-xl text-xs font-black hover:bg-purple-850 transition-all"
                                    >
                                        Crear
                                    </button>
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddSubjectInput(false)}
                                        className="text-xs font-bold text-slate-400 hover:text-slate-600 px-2"
                                    >
                                        ✕
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <select 
                                        value={docAsignatura}
                                        onChange={(e) => setDocAsignatura(e.target.value)}
                                        className="bg-white border border-purple-200 text-purple-900 rounded-2xl text-xs font-black uppercase tracking-wider px-4 py-3.5 outline-none focus:ring-2 focus:ring-purple-200 transition-all shadow-sm cursor-pointer"
                                    >
                                        <option value="General">🗂️ Carpeta General / Compartida</option>
                                        {docSubjects.map((sub, idx) => (
                                            <option key={idx} value={sub}>
                                                📚 Carpeta: {sub}
                                            </option>
                                        ))}
                                    </select>
                                    
                                    <button 
                                        type="button"
                                        onClick={() => setShowAddSubjectInput(true)}
                                        className="px-4 py-3.5 bg-purple-700 hover:bg-purple-800 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-md shadow-purple-200/50 flex items-center gap-1.5"
                                    >
                                        ➕ Nueva Carpeta
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                )}

                <div className="mb-10">
                    <ProgressBar progress={progressPercent} showText={false} />
                </div>

                <div className="grid grid-cols-1 gap-5">
                    <AnimatePresence>
                        {documents.map((doc, idx) => {
                            const isLocked = doc.phase > 1 && !isPhase1Approved;
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={doc.id}
                                    className={`
                                        group flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border transition-all duration-300 relative overflow-hidden
                                        ${doc.status === 'verified'
                                            ? 'bg-blue-50/10 border-blue-200/55'
                                            : doc.status === 'uploaded'
                                            ? 'bg-emerald-50/10 border-emerald-200/55'
                                            : 'bg-white border-slate-100 hover:border-[var(--primary)]/20 hover:shadow-premium-hover'}
                                        ${isLocked ? 'opacity-60 bg-slate-50/50' : ''}
                                    `}
                                >
                                    <div className={`
                                        w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:scale-105 border relative
                                        ${doc.status === 'verified' 
                                            ? 'bg-blue-50 text-blue-600 border-blue-100 shadow-sm' 
                                            : doc.status === 'uploaded'
                                            ? 'bg-emerald-50 text-[var(--success)] border-emerald-100 shadow-sm'
                                            : 'bg-slate-50 text-slate-400 border-slate-100'}
                                    `}>
                                        {doc.status === 'verified' ? (
                                            <VerifiedUser size={24} />
                                        ) : doc.status === 'uploaded' ? (
                                            <CheckCircle2 size={24} />
                                        ) : (
                                            <FileText size={24} />
                                        )}
                                    </div>

                                    <div className="flex-1 text-center md:text-left min-w-0">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-1">
                                            <h3 className="text-sm font-black text-slate-800 tracking-tight">{doc.label}</h3>
                                            {(postulanteData.tipoUsuario === 'concursante_docente' || postulanteData.tipoUsuario === 'auxiliar_docente') && (
                                                ['cedula', 'titulos', 'antecedente_judicial', 'antecedente_policial'].includes(doc.id) ? (
                                                    <span className="text-[8px] bg-sky-50 text-sky-700 border border-sky-100 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                                        🌐 Compartido
                                                    </span>
                                                ) : (
                                                    <span className="text-[8px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                                        📚 Carpeta: {docAsignatura}
                                                    </span>
                                                )
                                            )}
                                        </div>
                                        <div className="text-[11px] font-medium text-slate-500 leading-relaxed max-w-xl">
                                            {doc.status === 'uploaded' || doc.status === 'verified' ? (
                                                <div className="flex flex-col gap-1.5 mt-1">
                                                    {doc.fileNames.map((name, index) => (
                                                        <div key={index} className={`flex items-center gap-2 font-bold italic justify-center md:justify-start ${doc.status === 'verified' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                            {doc.status === 'verified' ? <VerifiedUser size={12} /> : <CheckCircle2 size={12} />} {name}
                                                            {doc.status === 'verified' && (
                                                                <span className="ml-1 text-[8px] bg-blue-100 px-2 py-0.5 rounded-md uppercase font-black tracking-widest text-blue-700">Verificado</span>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="font-medium text-slate-400">{doc.description}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex flex-wrap items-center justify-center gap-3 shrink-0 ml-auto w-full md:w-auto mt-4 md:mt-0">
                                        {isLocked ? (
                                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-xl text-slate-400 border border-slate-200 shadow-inner">
                                                <Lock size={14} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">Habilitado tras Validación</span>
                                            </div>
                                        ) : (
                                            <>
                                                {(doc.status === 'uploaded' || doc.status === 'verified') && (
                                                    <div className="flex items-center gap-1.5">
                                                        <button 
                                                            type="button"
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                if (doc.downloadUrl) {
                                                                    setPreviewUrl(doc.downloadUrl);
                                                                    setPreviewTitle(doc.label);
                                                                } else {
                                                                    alert("El archivo no está disponible en este momento. Intente de nuevo.");
                                                                }
                                                            }}
                                                            className="p-2.5 text-slate-400 hover:bg-slate-100 hover:text-slate-800 rounded-xl transition-all border border-slate-100 bg-white shadow-sm" 
                                                            title="Previsualizar Documento"
                                                        >
                                                            <Visibility size={18} />
                                                        </button>
                                                        {doc.status !== 'verified' && (
                                                            <button 
                                                                type="button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este documento de tu expediente?');
                                                                    if (confirmDelete) {
                                                                        setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'pending', fileNames: [], downloadUrl: undefined } : d));
                                                                        securityService.log(`Eliminación: ${doc.label}`, 'Postulante');
                                                                    }
                                                                }}
                                                                className="p-2.5 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all border border-slate-100 bg-white shadow-sm"
                                                                title="Eliminar Documento"
                                                            >
                                                                <Delete size={18} />
                                                            </button>
                                                        )}
                                                    </div>
                                                )}

                                                <AppButton
                                                    variant={doc.status === 'uploaded' || doc.status === 'verified' ? 'secondary' : 'primary'}
                                                    size="sm"
                                                    icon={doc.status === 'uploaded' || doc.status === 'verified' ? Plus : Upload}
                                                    onClick={() => triggerUpload(doc.id)}
                                                >
                                                    {doc.status === 'uploaded' || doc.status === 'verified' ? 'Reemplazar' : 'Subir'}
                                                </AppButton>
                                            </>
                                        )}
                                    </div>

                                    <input
                                        type="file"
                                        className="hidden"
                                        ref={el => fileInputRefs.current[doc.id] = el}
                                        onChange={(e) => handleFileUpload(doc.id, e)}
                                        accept="image/*,.pdf"
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>

                    {isPhase1Uploaded && !isPhase1Approved && (
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mt-8 bg-blue-50/50 border border-blue-100 rounded-3xl p-6 flex items-start gap-4 shadow-sm"
                        >
                            <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-md shadow-blue-600/10">
                                <Clock size={22} />
                            </div>
                            <div>
                                <h4 className="text-blue-950 font-black tracking-tight text-sm uppercase">Fase 01 en Proceso de Verificación Académica</h4>
                                <p className="text-blue-800 text-xs font-semibold leading-relaxed mt-1">
                                    Hemos recibido la documentación inicial del expediente digital. La Coordinación Académica se encuentra auditando los archivos. 
                                    Una vez aprobados (estado: <span className="font-bold text-blue-700 italic">Validado</span>), se habilitará la Fase 02 para que adjunte el **Comprobante de Pago del Arancel** correspondiente.
                                </p>
                            </div>
                        </motion.div>
                    )}
                </div>

                <div className="mt-16 p-10 bg-slate-50/50 rounded-[2rem] border border-slate-100 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-2xl bg-white shadow-premium flex items-center justify-center text-[var(--primary)] mb-6 border border-slate-100">
                        <ShieldCheck size={32} strokeWidth={1.5} />
                    </div>

                    <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2 uppercase">Declaración Jurada de Autenticidad</h3>
                    <p className="text-xs font-medium text-slate-500 max-w-lg leading-relaxed mb-10">
                        Al enviar la documentación digitalizada, declaro bajo juramento que toda la información y archivos adjuntados son copias fieles de sus originales vigentes.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                        <AppButton
                            onClick={handleFinalize}
                            variant={isFullyComplete ? 'primary' : 'secondary'}
                            size="lg"
                            className="sm:px-12"
                            icon={isFullyComplete ? ArrowRight : Clock}
                            iconPosition="right"
                        >
                            {isFullyComplete ? 'Finalizar Expediente' : 'Finalizar con Pendientes'}
                        </AppButton>
                    </div>
                </div>
            </div>

            <DocumentPreviewModal 
                isOpen={!!previewUrl} 
                onClose={() => setPreviewUrl(null)} 
                url={previewUrl || ''} 
                title={previewTitle} 
            />
        </motion.div>
    );
};

export default DocumentUploadSection;
