import React, { useRef, useState } from 'react';
import { OcrUploadModal } from './OcrUploadModal';
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
    Eye
} from 'lucide-react';
import { motion } from 'framer-motion';
import AppInput from './ui/AppInput';
import AppButton from './ui/AppButton';
import SectionTitle from './ui/SectionTitle';
import AppDatePicker from './ui/AppDatePicker';
import { CATALOGO_UNAMIS, getCarrerasPorSede } from '../constants/catalogoUnamis';

const COMMON_CATEDRAS = [
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

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ formData, photo, setPhoto, errors, onChange, onContinue, isLoading = false, isAcademic = false, onSkipToPayment }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isOcrModalOpen, setIsOcrModalOpen] = useState(false);
    const [isOtroSelected, setIsOtroSelected] = useState(false);

    React.useEffect(() => {
        if (formData.catedra && !COMMON_CATEDRAS.includes(formData.catedra)) {
            setIsOtroSelected(true);
        } else if (!formData.catedra) {
            setIsOtroSelected(false);
        }
    }, [formData.catedra]);

    const handleCatedraSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'Otro') {
            setIsOtroSelected(true);
            onChange('catedra', '');
        } else {
            setIsOtroSelected(false);
            onChange('catedra', val);
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
                accept="image/*"
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
                        {/* Photo Upload Card */}
                        <div className="md:col-span-2">
                            <motion.div
                                whileHover={{ y: -2 }}
                                onClick={handlePhotoClick}
                                className={`
                                    relative group cursor-pointer overflow-hidden rounded-[2rem] border-2 border-dashed transition-all duration-500
                                    ${photo ? 'border-[var(--primary)]/30 bg-[var(--primary-50)]' : 'border-slate-200 bg-white hover:border-[var(--primary)]/40 hover:bg-[var(--primary-50)]/50'}
                                `}
                            >
                                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className={`
                                        w-24 h-32 rounded-2xl flex items-center justify-center transition-all duration-500 border shadow-md flex-shrink-0 relative overflow-hidden
                                        ${photo ? 'bg-white border-[var(--primary)]/10' : 'bg-slate-50 border-slate-100 text-slate-300 group-hover:text-[var(--primary)]'}
                                    `}>
                                        {photo ? (
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <Camera size={32} strokeWidth={1} />
                                        )}
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-base font-black text-slate-800 mb-1 tracking-tight">
                                            {photo ? 'Fotografía cargada correctamente' : 'Fotografía Digital Oficial'}
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-4 max-w-sm font-medium leading-relaxed">
                                            Suba una foto tipo carnet (de frente, fondo claro y buena iluminación) para su identificación académica oficial.
                                        </p>
                                        <AppButton
                                            variant={photo ? 'secondary' : 'primary'}
                                            size="sm"
                                            icon={UploadCloud}
                                            onClick={(e) => { e.stopPropagation(); handlePhotoClick(); }}
                                        >
                                            {photo ? 'Cambiar Imagen' : 'Subir Foto'}
                                        </AppButton>
                                    </div>

                                    {photo && (
                                        <div className="hidden md:flex items-center gap-2 text-[var(--success)] font-black text-[10px] uppercase tracking-widest bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                                            <CheckCircle2 size={16} /> Listo
                                        </div>
                                    )}
                                </div>
                            </motion.div>
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
                                        setIsOtroSelected(false);
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
                            <>
                                <div className="flex flex-col gap-1.5 w-full relative">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                        Cátedra por la cual concursa
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={isOtroSelected ? 'Otro' : (formData.catedra || '')}
                                            onChange={handleCatedraSelectChange}
                                            className={`w-full px-5 py-4 bg-white border ${errors.includes('catedra') ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[var(--primary)]'} rounded-xl text-sm font-bold text-slate-800 outline-none transition-all appearance-none pr-12 focus:ring-4 focus:ring-[var(--primary)]/5`}
                                        >
                                            <option value="">Seleccionar cátedra...</option>
                                            {COMMON_CATEDRAS.map(c => (
                                                <option key={c} value={c}>{c}</option>
                                            ))}
                                            <option value="Otro">Otro (Especificar)</option>
                                        </select>
                                        <ChevronDown size={18} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                    </div>
                                </div>

                                {isOtroSelected && (
                                    <div className="flex flex-col gap-1.5 w-full relative">
                                        <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                            Escriba la Cátedra Específica
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.catedra || ''}
                                            onChange={(e) => onChange('catedra', e.target.value)}
                                            placeholder="Nombre de la cátedra específica"
                                            className={`w-full px-5 py-4 bg-white border ${errors.includes('catedra') ? 'border-red-500 focus:border-red-500' : 'border-slate-200 focus:border-[var(--primary)]'} rounded-xl text-sm font-bold text-slate-800 outline-none transition-all focus:ring-4 focus:ring-[var(--primary)]/5`}
                                        />
                                    </div>
                                )}
                            </>
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
