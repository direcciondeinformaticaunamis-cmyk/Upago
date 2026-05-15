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
import AppButton from './ui/AppButton';
import SectionTitle from './ui/SectionTitle';
import ProgressBar from './ui/ProgressBar';
import { generateVoucherHTML } from './VoucherTemplate';
import { securityService } from '../services/SecurityService';

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
    tipoUsuario?: 'postulante' | 'concursante_docente';
}

interface DocumentUploadSectionProps {
    postulanteData: PostulanteData;
    photo: string | null;
    onFinish?: () => void;
}

const DocumentUploadSection: React.FC<DocumentUploadSectionProps> = ({ postulanteData, photo, onFinish }) => {
    const [documents, setDocuments] = useState<DocumentItem[]>(() => {
        // --- CASO DOCENTE / CONCURSANTE (MEDICINA Y OTROS) ---
        if (postulanteData.tipoUsuario === 'concursante_docente') {
            return [
                { id: 'cv', label: 'a) Currículum vitae actualizado', description: 'Formato PDF, debidamente firmado y actualizado.', status: 'pending', fileNames: [], phase: 1 },
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
            { id: 'titulo', label: 'Fotocopia del Título de Bachiller', description: 'Acorde a exigencias del MEC.', status: 'pending', fileNames: [], phase: 1 }
        ] as DocumentItem[];
    });

    useEffect(() => {
        const fetchDocumentStatuses = async () => {
            try {
                const response = await fetch(`api.php?docs=${postulanteData.cedula}`);
                const data = await response.json();
                
                if (Array.isArray(data)) {
                    setDocuments(prev => prev.map(doc => {
                        const cloudDoc = data.find(d => d.tipo_documento === doc.id);
                        if (cloudDoc) {
                            return {
                                ...doc,
                                status: cloudDoc.estado === 'validado' ? 'verified' : 'uploaded',
                                fileNames: [cloudDoc.archivo_nombre]
                            };
                        }
                        return doc;
                    }));
                }
            } catch (err) {
                console.error("Error fetching docs:", err);
            }
        };

        fetchDocumentStatuses();
    }, [postulanteData.cedula]);

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

            try {
                const response = await fetch('api.php', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();
                console.log("Carga exitosa:", result);
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
    
    // Para Medicina, verificamos si la fase 1 está lista (aprobada por admin)
    const isPhase1Approved = studentData.carrera === 'Medicina' 
        ? documents.filter(doc => doc.phase === 1).every(doc => doc.status === 'verified')
        : true;

    // ¿Están todos los de Fase 1 subidos (aunque no aprobados)?
    const isPhase1Uploaded = documents.filter(doc => doc.phase === 1).every(doc => doc.status === 'uploaded' || doc.status === 'verified');

    const isFullyComplete = pendingDocuments.length === 0;
    const progressPercent = (completedCount / documents.length) * 100;

    if (isFinished) {
        return (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-12 text-center animate-in fade-in zoom-in duration-700">
                <div className="w-24 h-24 bg-success-soft rounded-3xl flex items-center justify-center text-success mx-auto mb-8 shadow-xl shadow-success/10 border border-success/10">
                    <CheckCircle2 size={48} strokeWidth={2.5} />
                </div>

                <h2 className="text-4xl font-black text-slate-900 tracking-tighter mb-4">
                    ¡Pre-inscripción <span className="text-primary">Exitosa</span>!
                </h2>

                <p className="text-slate-500 max-w-lg mx-auto leading-relaxed mb-6 font-medium">
                    Su expediente digital ha sido procesado y enviado a la **Sede Santa Rosa**.
                    Recibirá un comprobante detallado en su correo **{postulanteData.correo}**.
                </p>

                {!isFullyComplete && (
                    <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 mb-8 max-w-lg mx-auto text-left">
                        <div className="flex items-center gap-2 text-amber-700 font-black uppercase tracking-tighter text-sm mb-3">
                            <Clock size={16} /> Documentos Pendientes
                        </div>
                        <ul className="space-y-2">
                            {pendingDocuments.map(doc => (
                                <li key={doc.id} className="text-[11px] font-bold text-amber-600 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                                    {doc.label}
                                </li>
                            ))}
                        </ul>
                        <p className="mt-4 text-[10px] font-medium text-amber-500 italic">
                            * Deberá presentar estos documentos físicamente en secretaría para completar su matriculación.
                        </p>
                    </div>
                )}

                <div className="bg-slate-50/80 rounded-3xl border border-slate-200 p-8 mb-12 max-w-md mx-auto space-y-4">
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Postulante</span>
                        <span className="text-slate-800">{postulanteData.nombre} {postulanteData.apellido}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-slate-400">
                        <span>Código de Trámite</span>
                        <span className="text-primary font-black">UNAMIS-2026-REG{Math.floor(Math.random() * 9000) + 1000}</span>
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
                            const regCode = `UNAMIS-2026-REG${Math.floor(Math.random() * 9000) + 1000}`;
                            const html = generateVoucherHTML(postulanteData, documents, regCode, photo);
                            const win = window.open('', '_blank');
                            if (win) {
                                win.document.write(html);
                                win.document.close();
                            }
                        }}
                    >
                        Descargar Comprobante
                    </AppButton>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-8 md:p-12 relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                        Paso 02
                    </h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Expediente Académico Digital</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="text-right hidden sm:block">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Completado</p>
                        <p className="text-sm font-black text-primary tabular-nums">{completedCount} de {documents.length}</p>
                    </div>
                    <div className="w-12 h-12 rounded-xl bg-primary-soft text-primary flex items-center justify-center font-black text-sm">
                        {Math.round(progressPercent)}%
                    </div>
                </div>
            </div>

            <SectionTitle
                title="Carga de Documentos"
                subtitle="Adjunte los requisitos en formato PDF o Imagen nítida. Los formularios deben estar debidamente firmados."
                icon={FileCheck}
            />

            <div className="mb-10">
                <ProgressBar progress={progressPercent} showText={false} />
            </div>

            <div className="grid grid-cols-1 gap-4">
                {documents.map((doc) => (
                    <div
                        key={doc.id}
                        className={`
                            group flex flex-col md:flex-row items-center gap-6 p-6 rounded-3xl border transition-all duration-300
                            ${doc.status === 'uploaded'
                                ? 'bg-success-soft/30 border-success/20'
                                : 'bg-white border-slate-100 hover:border-primary/20 hover:shadow-lg hover:shadow-slate-200/50'}
                        `}
                    >
                        <div className={`
                            w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-transform duration-500 group-hover:scale-110
                            ${doc.status === 'uploaded' ? 'bg-success text-white shadow-lg shadow-success/20' : 'bg-slate-50 text-slate-400 border border-slate-100'}
                        `}>
                            {doc.status === 'uploaded' ? <CheckCircle2 size={24} /> : <FileText size={24} />}
                        </div>

                        <div className="flex-1 text-center md:text-left min-w-0">
                            <h3 className="text-sm font-bold text-slate-800 mb-1 truncate">{doc.label}</h3>
                            <div className="text-[11px] font-medium text-slate-500 leading-tight space-y-1">
                                {doc.status === 'uploaded' || doc.status === 'verified' ? (
                                    <div className="flex flex-col gap-1.5">
                                        {doc.fileNames.map((name, index) => (
                                            <div key={index} className={`flex items-center gap-2 font-bold italic ${doc.status === 'verified' ? 'text-blue-600' : 'text-emerald-600'}`}>
                                                {doc.status === 'verified' ? <VerifiedUser size={12} /> : <CheckCircle2 size={12} />} {name}
                                                {doc.status === 'verified' && <span className="ml-1 text-[8px] bg-blue-100 px-1.5 py-0.5 rounded uppercase tracking-tighter">Verificado</span>}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p>{doc.description}</p>
                                )}
                            </div>
                        </div>

                        {/* Estado Bloqueado para Medicina */}
                        {studentData.carrera === 'Medicina' && doc.phase > 1 && !isPhase1Approved && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-2xl text-slate-400 border border-slate-200">
                                <Lock size={14} />
                                <span className="text-[10px] font-black uppercase tracking-tighter">Bloqueado</span>
                            </div>
                        )}

                        {/* Actions & Security */}
                        <div className="flex items-center gap-3 ml-auto">
                            {doc.status === 'uploaded' && (
                                <>
                                    <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100">
                                        <Lock size={12} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">AES-256</span>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button className="p-2 text-slate-400 hover:bg-slate-100 rounded-full transition-all" title="Ver archivo">
                                            <Visibility size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const confirmDelete = window.confirm('¿Estás seguro de que deseas eliminar este documento?');
                                                if (confirmDelete) {
                                                    setDocuments(prev => prev.map(d => d.id === doc.id ? { ...d, status: 'pending', fileNames: [] } : d));
                                                    securityService.log(`Eliminación: ${doc.label}`, 'Postulante');
                                                }
                                            }}
                                            className="p-2 text-slate-400 hover:bg-red-50 hover:text-red-500 rounded-full transition-all"
                                        >
                                            <Delete size={18} />
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="flex items-center gap-2 mt-4 md:mt-0">
                            {doc.status === 'pending' && doc.downloadUrl && (
                                <AppButton
                                    variant="ghost"
                                    size="sm"
                                    icon={Download}
                                    onClick={(e) => { e.stopPropagation(); window.open(doc.downloadUrl, '_blank'); }}
                                    title="Descargar Plantilla"
                                />
                            )}
                            <AppButton
                                variant={doc.status === 'uploaded' || doc.status === 'verified' ? 'secondary' : 'primary'}
                                size="sm"
                                icon={doc.status === 'uploaded' || doc.status === 'verified' ? Plus : Upload}
                                onClick={() => triggerUpload(doc.id)}
                                disabled={postulanteData.carrera === 'Medicina' && doc.phase > 1 && !isPhase1Approved}
                            >
                                {doc.status === 'uploaded' || doc.status === 'verified' ? 'Adjuntar Otro' : 'Adjuntar'}
                            </AppButton>
                        </div>

                        <input
                            type="file"
                            className="hidden"
                            ref={el => fileInputRefs.current[doc.id] = el}
                            onChange={(e) => handleFileUpload(doc.id, e)}
                            accept="image/*,.pdf"
                        />
                    </div>
                ))}
                {postulanteData.carrera === 'Medicina' && isPhase1Uploaded && !isPhase1Approved && (
                    <div className="mt-8 bg-blue-50 border border-blue-200 rounded-3xl p-6 flex items-start gap-4 animate-pulse">
                        <div className="w-10 h-10 bg-blue-500 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/20">
                            <Clock size={20} />
                        </div>
                        <div>
                            <h4 className="text-blue-900 font-black tracking-tighter text-sm uppercase">Expediente en Revisión Académica</h4>
                            <p className="text-blue-700 text-xs font-medium leading-relaxed mt-1">
                                Los 4 documentos iniciales han sido recibidos. El Área Académica está validando su información. 
                                Una vez aprobados, se habilitará el botón de **Pago de Arancel** para continuar con su inscripción.
                            </p>
                        </div>
                    </div>
                )}
            </div>

            <div className="mt-16 p-10 bg-slate-50/50 rounded-[2rem] border border-slate-200/60 text-center flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-white shadow-premium flex items-center justify-center text-primary mb-6 border border-slate-100">
                    <ShieldCheck size={32} strokeWidth={1.5} />
                </div>

                <h3 className="text-lg font-black text-slate-800 tracking-tight mb-2">Declaración de Autenticidad</h3>
                <p className="text-xs font-medium text-slate-500 max-w-md leading-relaxed mb-10">
                    Al finalizar el proceso, usted garantiza que toda la documentación digitalizada es fidedigna a los documentos originales vigentes.
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
                        {isFullyComplete ? 'Finalizar Trámite' : 'Finalizar con Pendientes'}
                    </AppButton>
                </div>
            </div>
        </div>
    );
};

export default DocumentUploadSection;
