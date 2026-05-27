import React, { useState } from 'react';
import PersonalDataForm from './PersonalDataForm';
import DocumentUploadSection from './DocumentUploadSection';
import MedicinePrintForm from './MedicinePrintForm';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Clock from '@mui/icons-material/AccessTime';
import ErrorIcon from '@mui/icons-material/Error';
import Description from '@mui/icons-material/Description';
import Person from '@mui/icons-material/Person';
import School from '@mui/icons-material/School';
import ArrowRight from '@mui/icons-material/ArrowRight';
import Print from '@mui/icons-material/Print';
import { fetchApi } from '../services/ApiService';

interface MisDatosModuleProps {
    user?: { nombre: string; apellido: string; email: string; cedula: string; rol: string; expediente_aprobado?: boolean; estado_expediente?: 'pendiente' | 'aprobado' | 'rechazado'; };
    initialStep?: number;
    forceEdit?: boolean;
    isAcademic?: boolean;
    onGoToPayment?: (data: any) => void;
}

const MisDatosModule: React.FC<MisDatosModuleProps> = ({ user, initialStep = 1, forceEdit = false, isAcademic = false, onGoToPayment }) => {
    // Solo mostrar el resumen si el expediente está aprobado o si ya se envió (tiene carrera y teléfono cargado) y no estamos forzando edición.
    const hasSubmittedData = user?.expediente_aprobado || (user?.nombre && (user as any).carrera && (user as any).telefono);
    const [isSubmitted, setIsSubmitted] = useState(!forceEdit && hasSubmittedData);
    const estado = user?.expediente_aprobado ? 'aprobado' : 'pendiente'; 
    const [step, setStep] = useState(initialStep);
    const [formData, setFormData] = useState({
        nombre: user?.nombre || '',
        apellido: user?.apellido || '',
        cedula: user?.cedula || '',
        ruc: (user as any)?.ruc || '',
        correo: user?.email || (user as any)?.correo || '',
        telefono: (user as any)?.telefono || '',
        fechaNacimiento: (user as any)?.fecha_nacimiento || (user as any)?.fechaNacimiento || '',
        lugarNacimientoCiudad: (user as any)?.lugar_nacimiento_ciudad || (user as any)?.lugarNacimientoCiudad || '',
        lugarNacimientoDepto: (user as any)?.lugar_nacimiento_depto || (user as any)?.lugarNacimientoDepto || '',
        nacionalidad: (user as any)?.nacionalidad || 'Paraguaya',
        paisOrigen: (user as any)?.pais_origen || (user as any)?.paisOrigen || 'Paraguay',
        genero: (user as any)?.genero || '',
        estadoCivil: (user as any)?.estado_civil || (user as any)?.estadoCivil || 'Soltero',
        direccion: (user as any)?.direccion || '',
        barrio: (user as any)?.barrio || '',
        carrera: (user as any)?.carrera || '',
        sede: (user as any)?.sede || '',
        tipoUsuario: (user as any)?.tipo_usuario || (user as any)?.tipoUsuario || 'postulante' as 'postulante' | 'concursante_docente' | 'auxiliar_docente',
        numero_expediente: (user as any)?.numero_expediente || (user as any)?.numeroExpediente || '',
        
        // Salud
        grupoSanguineo: (user as any)?.grupo_sanguineo || (user as any)?.grupoSanguineo || '',
        alergico: (user as any)?.alergico || '',
        seguroMedico: (user as any)?.seguro_medico || (user as any)?.seguroMedico || 'Ninguno',
        esZurdo: (user as any)?.es_zurdo === 1 || (user as any)?.es_zurdo === true || (user as any)?.esZurdo === true || false,
        discapacidad: (user as any)?.discapacidad || 'Ninguna',
        discapacidadDetalle: (user as any)?.discapacidad_detalle || (user as any)?.discapacidadDetalle || '',
        necesitaAdecuacion: (user as any)?.necesita_adecuacion === 1 || (user as any)?.necesita_adecuacion === true || (user as any)?.necesitaAdecuacion === true || false,
        adecuacionDetalle: (user as any)?.adecuacion_detalle || (user as any)?.adecuacionDetalle || '',
        enfermedadCronica: (user as any)?.enfermedad_cronica || (user as any)?.enfermedadCronica || '',

        // Académico/Laboral
        colegioNombre: (user as any)?.colegio_nombre || (user as any)?.colegioNombre || '',
        colegioCiudad: (user as any)?.colegio_ciudad || (user as any)?.colegioCiudad || '',
        colegioDistrito: (user as any)?.colegio_distrito || (user as any)?.colegioDistrito || '',
        colegioDepto: (user as any)?.colegio_depto || (user as any)?.colegioDepto || '',
        colegioTipo: (user as any)?.colegio_tipo || (user as any)?.colegioTipo || 'Público',
        bachillerTipo: (user as any)?.bachiller_tipo || (user as any)?.bachillerTipo || 'Científico',
        bachillerDetalle: (user as any)?.bachiller_detalle || (user as any)?.bachillerDetalle || '',
        egresoAnio: (user as any)?.egreso_anio || (user as any)?.egresoAnio || new Date().getFullYear() - 1,
        egresoPromedio: (user as any)?.egreso_promedio || (user as any)?.egresoPromedio || 0,
        trabaja: (user as any)?.trabaja === 1 || (user as any)?.trabaja === true || (user as any)?.trabaja === true || false,
        empresaNombre: (user as any)?.empresa_nombre || (user as any)?.empresaNombre || '',
        cargo: (user as any)?.cargo || '',
        horarioLaboral: (user as any)?.horario_laboral || (user as any)?.horarioLaboral || '',
    });
    const [photo, setPhoto] = useState<string | null>(null);
    const [errors, setErrors] = useState<string[]>([]);
    const [showPrintForm, setShowPrintForm] = useState(false);

    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleChange = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => prev.filter(e => e !== field));
        if (submitError) setSubmitError(null);
    };

    const handleContinue = async () => {
        const required = ['nombre', 'apellido', 'cedula', 'correo', 'telefono', 'carrera', 'sede'];
        const missing = required.filter(field => !formData[field as keyof typeof formData]);
        
        if (missing.length > 0) {
            setErrors(missing);
            setSubmitError("Por favor, complete todos los campos obligatorios resaltados en rojo.");
            return;
        }
        
        setSubmitError(null);
        // Guardar datos en la base de datos antes de pasar al siguiente paso
        try {
            const result = await fetchApi('', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (result.status === 'success') {
                console.log("Datos personales guardados correctamente");
                // Obtener el número de expediente auto-generado
                try {
                    const profileData = await fetchApi(`perfil=${formData.cedula}`);
                    if (profileData && profileData.numero_expediente) {
                        setFormData(prev => ({ ...prev, numero_expediente: profileData.numero_expediente }));
                    }
                } catch (fetchErr) {
                    console.error("Error al obtener el número de expediente actualizado:", fetchErr);
                }
                setStep(2);
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else {
                setSubmitError("Error al guardar datos: " + result.message);
            }
        } catch (err) {
            console.error("Error saving personal data:", err);
            setSubmitError("Error de conexión al guardar los datos.");
        }
    };

    const handleSkipToPayment = async () => {
        const required = ['nombre', 'apellido', 'cedula', 'correo', 'telefono', 'carrera', 'sede'];
        const missing = required.filter(field => !formData[field as keyof typeof formData]);
        
        if (missing.length > 0) {
            setErrors(missing);
            setSubmitError("Por favor, complete todos los campos obligatorios resaltados en rojo.");
            return;
        }
        
        setSubmitError(null);
        try {
            const result = await fetchApi('', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            if (result.status === 'success') {
                if (onGoToPayment) onGoToPayment(formData);
            } else {
                setSubmitError("Error al guardar datos: " + result.message);
            }
        } catch (err) {
            console.error("Error saving personal data:", err);
            setSubmitError("Error de conexión al guardar los datos.");
        }
    };

    const handleFinish = () => {
        setIsSubmitted(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (isSubmitted) {
        return (
            <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 md:p-12 relative overflow-hidden max-w-4xl mx-auto">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-8">
                    <div>
                        <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Mi Expediente</h2>
                        <p className="text-slate-500">Resumen de sus datos personales y documentos digitales.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <button 
                            onClick={() => {
                                setIsSubmitted(false);
                                setStep(1);
                            }}
                            className="flex items-center gap-2 px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            ✏️ Editar Expediente
                        </button>

                        {/* Botón de Impresión para Medicina */}
                        {formData.carrera === 'Medicina' && (
                            <button 
                                onClick={() => setShowPrintForm(true)}
                                className="flex items-center gap-2 px-5 py-3 bg-[#002f6c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Print fontSize="small" /> Imprimir Formulario Oficial
                            </button>
                        )}
                        {onGoToPayment && (
                            <button 
                                onClick={() => onGoToPayment(formData)}
                                className="flex items-center gap-2 px-5 py-3 bg-[#002f6c] text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg hover:scale-105 active:scale-95 transition-all"
                            >
                                💳 Registrar Pago
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-8">
                    {estado === 'aprobado' ? (
                        <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-2xl flex items-center gap-4 border border-emerald-200">
                            <CheckCircle style={{fontSize: 32}} />
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Expediente Aprobado</h3>
                                <p className="text-sm font-medium opacity-90 mt-0.5">Ya puede proceder a pagar sus aranceles.</p>
                            </div>
                        </div>
                    ) : estado === 'pendiente' ? (
                        <div className="bg-amber-50 text-amber-700 px-6 py-4 rounded-2xl flex items-center gap-4 border border-amber-200">
                            <Clock style={{fontSize: 32}} />
                            <div>
                                <h3 className="font-bold text-lg leading-tight">A verificar</h3>
                                <p className="text-sm font-medium opacity-90 mt-0.5">Sus documentos están en revisión por Admisión.</p>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-red-50 text-red-700 px-6 py-4 rounded-2xl flex items-center gap-4 border border-red-200">
                            <ErrorIcon style={{fontSize: 32}} />
                            <div>
                                <h3 className="font-bold text-lg leading-tight">Expediente Rechazado</h3>
                                <p className="text-sm font-medium opacity-90 mt-0.5">Motivo: Documentos ilegibles. Favor reenviar.</p>
                            </div>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Datos Personales */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <Person className="text-slate-400" /> Datos Personales
                            </h4>
                            <button 
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setStep(1);
                                }}
                                className="text-xs font-black uppercase tracking-wider text-[var(--primary)] hover:text-[#001738] flex items-center gap-1 transition-colors"
                            >
                                ✏️ Editar
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Nombre Completo</p>
                                <p className="font-medium text-slate-800">{formData.nombre} {formData.apellido}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Cédula</p>
                                <p className="font-medium text-slate-800">{formData.cedula}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Correo Electrónico</p>
                                <p className="font-medium text-slate-800">{formData.correo}</p>
                            </div>
                        </div>
                    </div>

                    {/* Datos Académicos */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-100 pb-2 mb-4">
                            <h4 className="font-bold text-slate-800 flex items-center gap-2">
                                <School className="text-slate-400" /> Información Académica
                            </h4>
                            <button 
                                onClick={() => {
                                    setIsSubmitted(false);
                                    setStep(1);
                                }}
                                className="text-xs font-black uppercase tracking-wider text-[var(--primary)] hover:text-[#001738] flex items-center gap-1 transition-colors"
                            >
                                ✏️ Editar
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 gap-4">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Programa</p>
                                <p className="font-medium text-slate-800">{formData.carrera}</p>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Sede</p>
                                    <p className="font-medium text-slate-800">{formData.sede}</p>
                                </div>
                                <div className="flex-1">
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Perfil</p>
                                    <p className="font-medium text-slate-800 capitalize">{formData.tipoUsuario}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-10 bg-slate-50 p-6 rounded-2xl border border-slate-100 flex justify-between items-center">
                    <div className="flex items-center gap-3">
                        <Description className="text-slate-400" />
                        <div>
                            <p className="font-bold text-slate-700">Expediente Digitalizado</p>
                            <p className="text-xs text-slate-500">Sus documentos fueron recibidos correctamente.</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => {
                            setIsSubmitted(false);
                            setStep(2);
                        }}
                        className="px-5 py-2.5 bg-white border border-slate-200 text-slate-700 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 rounded-xl text-xs font-black uppercase tracking-wider hover:bg-slate-50 transition-all flex items-center gap-2 shadow-sm"
                    >
                        Ver Documentos
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {hasSubmittedData && (
                <div className="mb-6 bg-slate-100/80 border border-slate-200/60 p-4 rounded-2xl flex justify-between items-center max-w-4xl mx-auto shadow-sm">
                    <div className="flex items-center gap-2.5">
                        <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] animate-pulse" />
                        <p className="text-xs font-bold text-slate-700">Modo Edición: Modificando datos y requisitos.</p>
                    </div>
                    <button 
                        onClick={() => setIsSubmitted(true)}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-[var(--primary)] hover:border-[var(--primary)]/30 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-slate-50 transition-all shadow-sm"
                    >
                        ↩️ Cancelar y Volver
                    </button>
                </div>
            )}
            {submitError && (
                <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-2xl flex items-center gap-3 max-w-4xl mx-auto shadow-sm">
                    <ErrorIcon />
                    <p className="text-sm font-medium">{submitError}</p>
                </div>
            )}
            {step === 1 ? (
                <PersonalDataForm
                    formData={formData}
                    photo={photo}
                    setPhoto={setPhoto}
                    errors={errors}
                    onChange={handleChange}
                    onContinue={handleContinue}
                    isAcademic={isAcademic}
                    onSkipToPayment={onGoToPayment ? handleSkipToPayment : undefined}
                />
            ) : (
                <DocumentUploadSection
                    postulanteData={formData}
                    photo={photo}
                    onFinish={handleFinish}
                    onSkipToPayment={onGoToPayment ? () => onGoToPayment(formData) : undefined}
                />
            )}

            {showPrintForm && (
                <MedicinePrintForm 
                    data={formData} 
                    onClose={() => setShowPrintForm(false)} 
                />
            )}
        </div>
    );
};

export default MisDatosModule;
