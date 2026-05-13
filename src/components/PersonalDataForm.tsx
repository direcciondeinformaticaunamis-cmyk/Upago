import React, { useRef, useState } from 'react';
import {
    User,
    Mail,
    CreditCard,
    MapPin,
    GraduationCap,
    ArrowRight,
    UploadCloud,
    Calendar,
    Camera,
    CheckCircle2,
    Building2,
    FileText,
    Upload,
    X,
    Download,
    School
} from 'lucide-react';
import AppInput from './ui/AppInput';
import AppButton from './ui/AppButton';
import SectionTitle from './ui/SectionTitle';
import AppDatePicker from './ui/AppDatePicker';
import { CATALOGO_UNAMIS, getCarrerasPorSede } from '../constants/catalogoUnamis';

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
    tipoUsuario: 'postulante' | 'concursante_docente';

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
}

interface UploadedFile {
    id: string;
    file: File;
    preview: string;
}

interface DocumentItem {
    id: string;
    label: string;
    required: boolean;
    description: string;
    templateUrl?: string;
}

const PersonalDataForm: React.FC<PersonalDataFormProps> = ({ formData, photo, setPhoto, errors, onChange, onContinue, isLoading = false }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploadedDocs, setUploadedDocs] = useState<UploadedFile[]>([]);

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => setPhoto(reader.result as string);
            reader.readAsDataURL(file);
        }
    };

    const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>, docId: string) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setUploadedDocs(prev => {
                    const existing = prev.filter(d => d.id !== docId);
                    return [...existing, { id: docId, file, preview: reader.result as string }];
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const removeDoc = (docId: string) => {
        setUploadedDocs(prev => prev.filter(d => d.id !== docId));
    };

    const postulanteDocs: DocumentItem[] = [
        { id: 'cedula', label: 'Cédula de Identidad', required: true, description: 'Copia de ambos lados.' },
        { id: 'nacimiento', label: 'Certificado de Nacimiento', required: true, description: 'Original o copia autenticada.' },
        { id: 'titulo', label: 'Título/ Certificado', required: true, description: 'Copia del título de educación media.' },
        { id: 'foto', label: 'Foto Tipo Carnet', required: true, description: 'Formato digital nítido.' },
    ];

    const teacherDocs: DocumentItem[] = [
        { id: 'cedula', label: 'Cédula de Identidad', required: true, description: 'Copia autenticada.' },
        { id: 'titulo', label: 'Título de Grado', required: true, description: 'Copia autenticada.' },
        { id: 'posgrado', label: 'Título de Posgrado', required: false, description: 'Opcional, si aplica.' },
        { id: 'cv', label: 'Currículum Vitae', required: true, description: 'Formato libre, actualizado.' },
    ];

    const lenguaSantaRosaDocs: DocumentItem[] = [
        { id: 'cedula', label: 'Cédula de Identidad (Ambos Lados)', required: true, description: 'Copia autenticada por escribanía pública.' },
        { id: 'nacimiento', label: 'Certificado de Nacimiento Original', required: true, description: 'O copia de Identidad Electrónica válida.' },
        { id: 'titulo', label: 'Título de Profesorado o Equivalente', required: true, description: 'Copia autenticada por escribanía pública.' },
        { id: 'estudio', label: 'Certificado de Estudio Original (del profesorado o equivalente)', required: true, description: 'O copia autenticada por escribanía pública.' },
        { id: 'foto', label: 'Foto tipo carnet (2 unidades)', required: true, description: 'Formato digital nítido de alta resolución.' },
        { id: 'convalidacion', label: 'Solicitud de Convalidación', required: true, description: 'Descargar, llenar, firmar y luego adjuntar.', templateUrl: '/plantillas/solicitud_convalidacion.docx' },
        { id: 'matriculacion', label: 'Solicitud de Matriculación', required: true, description: 'Descargar, llenar, firmar y luego adjuntar.', templateUrl: '/plantillas/solicitud_matriculacion.docx' },
    ];

    const isLenguaSantaRosa = formData.carrera === 'Lic. en Enseñanza de Lengua y Literatura Castellana' && formData.sede === 'Sede Santa Rosa de Lima';

    let docs = formData.tipoUsuario === 'concursante_docente' ? teacherDocs : postulanteDocs;
    if (formData.tipoUsuario === 'postulante' && isLenguaSantaRosa) {
        docs = lenguaSantaRosaDocs;
    }

    const availableCareers = formData.sede ? getCarrerasPorSede(formData.sede) : [];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-premium p-8 md:p-12 relative overflow-hidden">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handlePhotoChange}
                accept="image/*"
                className="hidden"
            />

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tighter mb-2">
                        Paso 01
                    </h2>
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em]">Identificación y Registro</p>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 rounded-xl border border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <CheckCircle2 size={12} className="text-slate-400" /> Formulario Oficial UNAMIS
                </div>
            </div>

            <div className="space-y-16">
                {/* Section 1: Identidad */}
                <section>
                    <SectionTitle
                        title={formData.tipoUsuario === 'concursante_docente' ? "Identidad del Concursante" : "Identidad del Postulante"}
                        subtitle="Asegúrese de que sus datos coincidan exactamente con su cédula de identidad."
                        icon={User}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                        {/* Photo Upload Card */}
                        <div className="md:col-span-2">
                            <div
                                onClick={handlePhotoClick}
                                className={`
                                    relative group cursor-pointer overflow-hidden rounded-3xl border-2 border-dashed transition-all duration-500
                                    ${photo ? 'border-primary/20 bg-primary-soft' : 'border-slate-200 bg-slate-50/50 hover:border-primary/40 hover:bg-primary-soft/50'}
                                `}
                            >
                                <div className="p-8 flex flex-col md:flex-row items-center gap-8">
                                    <div className={`
                                        w-24 h-32 rounded-2xl flex items-center justify-center transition-all duration-500 border shadow-sm flex-shrink-0
                                        ${photo ? 'bg-white border-primary/10' : 'bg-white border-slate-100 text-slate-300 group-hover:text-primary'}
                                    `}>
                                        {photo ? (
                                            <img src={photo} alt="Preview" className="w-full h-full object-cover rounded-xl" />
                                        ) : (
                                            <Camera size={32} strokeWidth={1} />
                                        )}
                                    </div>

                                    <div className="flex-1 text-center md:text-left">
                                        <h4 className="text-base font-bold text-slate-800 mb-1">
                                            {photo ? 'Fotografía cargada correctamente' : 'Cargar Fotografía Oficial'}
                                        </h4>
                                        <p className="text-xs text-slate-500 mb-6 max-w-sm">
                                            La imagen debe ser de frente, con fondo claro y buena iluminación para el carnet institucional.
                                        </p>
                                        <AppButton
                                            variant={photo ? 'secondary' : 'primary'}
                                            size="sm"
                                            icon={UploadCloud}
                                            onClick={(e) => { e.stopPropagation(); handlePhotoClick(); }}
                                        >
                                            {photo ? 'Cambiar Imagen' : 'Seleccionar Archivo'}
                                        </AppButton>
                                    </div>

                                    {photo && (
                                        <div className="hidden md:flex items-center gap-2 text-success font-black text-[10px] uppercase tracking-widest">
                                            <CheckCircle2 size={16} /> Verificado
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <AppInput
                            label="Nombres"
                            placeholder="Ej: Juan Antonio"
                            value={formData.nombre}
                            onChange={(e) => onChange('nombre', e.target.value)}
                            error={errors.includes('nombre') ? 'Nombre requerido' : ''}
                        />

                        <AppInput
                            label="Apellidos"
                            placeholder="Ej: Pérez González"
                            value={formData.apellido}
                            onChange={(e) => onChange('apellido', e.target.value)}
                            error={errors.includes('apellido') ? 'Apellido requerido' : ''}
                        />

                        <AppInput
                            label="Cédula de Identidad"
                            placeholder="Ej: 1.234.567"
                            icon={CreditCard}
                            value={formData.cedula}
                            onChange={(e) => onChange('cedula', e.target.value)}
                            error={errors.includes('cedula') ? 'Documento requerido' : ''}
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
                            error={errors.includes('fechaNacimiento') ? 'Seleccione fecha' : ''}
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
                                    <button
                                        key={ec}
                                        type="button"
                                        onClick={() => onChange('estadoCivil', ec)}
                                        className={`
                                            px-2 py-2.5 rounded-lg text-[10px] font-black uppercase tracking-widest border transition-all
                                            ${formData.estadoCivil === ec
                                                ? 'bg-slate-800 text-white border-slate-800'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                        `}
                                    >
                                        {ec}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Género
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['Masculino', 'Femenino', 'Otro'].map((g) => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => onChange('genero', g)}
                                        className={`
                                            px-4 py-3.5 rounded-xl text-xs font-bold border transition-all duration-300
                                            ${formData.genero === g
                                                ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                                                : 'bg-white text-slate-500 border-slate-200 hover:border-primary/30'}
                                            ${errors.includes('genero') && !formData.genero ? 'border-danger bg-danger-soft/30' : ''}
                                        `}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* Section 2: Datos Académicos */}
                <section>
                    <SectionTitle
                        title="Tipo de Registro"
                        subtitle="Seleccione su perfil de ingreso a la UNAMIS."
                        icon={GraduationCap}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-10">
                        <div className="flex flex-col gap-1.5 w-full md:col-span-3">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Perfil del Solicitante
                            </label>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                <button
                                    type="button"
                                    onClick={() => onChange('tipoUsuario', 'postulante')}
                                    className={`px-6 py-4 rounded-xl text-left transition-all duration-300 border-2 ${
                                        formData.tipoUsuario === 'postulante' || !formData.tipoUsuario
                                            ? 'bg-primary/5 border-primary shadow-md'
                                            : 'bg-white border-slate-100 text-slate-400 grayscale'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-black text-slate-800">Soy Postulante</span>
                                        <span className="text-[10px] font-bold opacity-60 uppercase">Para ingreso a carreras</span>
                                    </div>
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onChange('tipoUsuario', 'concursante_docente')}
                                    className={`px-6 py-4 rounded-xl text-left transition-all duration-300 border-2 ${
                                        formData.tipoUsuario === 'concursante_docente'
                                            ? 'bg-primary/5 border-primary shadow-md'
                                            : 'bg-white border-slate-100 text-slate-400 grayscale'
                                    }`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <span className="text-sm font-black text-slate-800">Soy Concursante</span>
                                        <span className="text-[10px] font-bold opacity-60 uppercase leading-tight">Docentes Encargados de Cátedras y Auxiliares</span>
                                    </div>
                                </button>
                            </div>
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Sede / Campus
                            </label>
                            <select
                                value={formData.sede}
                                onChange={(e) => {
                                    onChange('sede', e.target.value);
                                    onChange('carrera', ''); // Reset career when sede changes
                                }}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-primary transition-colors appearance-none"
                            >
                                <option value="">Seleccionar sede...</option>
                                {Object.keys(CATALOGO_UNAMIS).map(sede => (
                                    <option key={sede} value={sede}>{sede}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex flex-col gap-1.5 w-full">
                            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                Carrera / Programa
                            </label>
                            <select
                                value={formData.carrera}
                                onChange={(e) => onChange('carrera', e.target.value)}
                                className="w-full px-5 py-4 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-primary transition-colors appearance-none"
                                disabled={!formData.sede && availableCareers.length > 50} // Optional UX enhancement
                            >
                                <option value="">{formData.sede ? 'Seleccionar carrera...' : 'Primero seleccione una sede'}</option>
                                {availableCareers.map(carrera => (
                                    <option key={carrera} value={carrera}>{carrera}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section 2: Contacto */}
                <section>
                    <SectionTitle
                        title="Contacto y Ubicación"
                        subtitle="Utilizaremos estos medios para notificarle sobre el estado de su admisión."
                        icon={Mail}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                        <AppInput
                            type="email"
                            label="Correo Electrónico"
                            placeholder="ejemplo@correo.com"
                            value={formData.correo}
                            onChange={(e) => onChange('correo', e.target.value)}
                            error={errors.includes('correo') ? 'Email inválido' : ''}
                        />

                        <AppInput
                            type="tel"
                            label="Teléfono Móvil"
                            placeholder="09xx xxx xxx"
                            value={formData.telefono}
                            onChange={(e) => onChange('telefono', e.target.value)}
                            error={errors.includes('telefono') ? 'Teléfono requerido' : ''}
                        />

                        <AppInput
                            label="Dirección Actual"
                            placeholder="Ciudad y número de casa"
                            icon={MapPin}
                            value={formData.direccion}
                            onChange={(e) => onChange('direccion', e.target.value)}
                            error={errors.includes('direccion') ? 'Dirección requerida' : ''}
                        />

                        <AppInput
                            label="Barrio"
                            placeholder="Ej: Centro"
                            value={formData.barrio}
                            onChange={(e) => onChange('barrio', e.target.value)}
                        />
                    </div>
                </section>

                {/* Section: Salud (Only for Medicine/Postulantes) */}
                {formData.carrera === 'Medicina' && (
                    <section>
                        <SectionTitle
                            title="Datos de Salud"
                            subtitle="Información vital para la ficha médica institucional."
                            icon={FileText}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            <div className="grid grid-cols-2 gap-4">
                                <AppInput
                                    label="Grupo Sanguíneo/RH"
                                    placeholder="Ej: O+"
                                    value={formData.grupoSanguineo}
                                    onChange={(e) => onChange('grupoSanguineo', e.target.value)}
                                />
                                <AppInput
                                    label="Alergias"
                                    placeholder="Ninguna"
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
                                        <button
                                            key={sm}
                                            type="button"
                                            onClick={() => onChange('seguroMedico', sm)}
                                            className={`
                                                px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                                ${formData.seguroMedico === sm
                                                    ? 'bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-200'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-emerald-200'}
                                            `}
                                        >
                                            {sm}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5 w-full">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                    ¿Alguna Discapacidad?
                                </label>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                    {['Ninguna', 'Visual', 'Motriz', 'Auditiva', 'Otras'].map((d) => (
                                        <button
                                            key={d}
                                            type="button"
                                            onClick={() => onChange('discapacidad', d)}
                                            className={`
                                                px-2 py-2.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all
                                                ${formData.discapacidad === d
                                                    ? 'bg-amber-500 text-white border-amber-500'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-amber-200'}
                                            `}
                                        >
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <AppInput
                                label="Enfermedad Crónica / Otros detalles"
                                placeholder="Especifique si aplica..."
                                value={formData.enfermedadCronica}
                                onChange={(e) => onChange('enfermedadCronica', e.target.value)}
                            />
                        </div>
                    </section>
                )}

                {/* Section: Antecedentes Académicos/Laborales (Only for Medicine/Postulantes) */}
                {formData.carrera === 'Medicina' && (
                    <section>
                        <SectionTitle
                            title="Antecedentes Académicos y Laborales"
                            subtitle="Información sobre su formación previa y situación laboral actual."
                            icon={School}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-10">
                            <AppInput
                                label="Nombre del Colegio / Institución"
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
                                    Tipo de Colegio
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {['Público', 'Privado', 'Subvencionado'].map((tc) => (
                                        <button
                                            key={tc}
                                            type="button"
                                            onClick={() => onChange('colegioTipo', tc)}
                                            className={`
                                                px-3 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all
                                                ${formData.colegioTipo === tc
                                                    ? 'bg-slate-800 text-white border-slate-800'
                                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                            `}
                                        >
                                            {tc}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <AppInput
                                    label="Año de Egreso"
                                    type="number"
                                    value={formData.egresoAnio}
                                    onChange={(e) => onChange('egresoAnio', e.target.value)}
                                />
                                <AppInput
                                    label="Promedio Final"
                                    type="number"
                                    step="0.01"
                                    value={formData.egresoPromedio}
                                    onChange={(e) => onChange('egresoPromedio', e.target.value)}
                                />
                            </div>

                            <div className="flex flex-col gap-1.5 w-full md:col-span-2 p-6 bg-slate-50 rounded-3xl border border-slate-100">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Situación Laboral</label>
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex items-center gap-4">
                                        <span className="text-xs font-bold text-slate-600">¿Trabaja actualmente?</span>
                                        <div className="flex bg-white rounded-lg p-1 border border-slate-200">
                                            <button 
                                                onClick={() => onChange('trabaja', true)}
                                                className={`px-4 py-1 rounded text-[10px] font-bold uppercase transition-all ${formData.trabaja ? 'bg-primary text-white' : 'text-slate-400'}`}
                                            >Sí</button>
                                            <button 
                                                onClick={() => onChange('trabaja', false)}
                                                className={`px-4 py-1 rounded text-[10px] font-bold uppercase transition-all ${!formData.trabaja ? 'bg-slate-200 text-slate-600' : 'text-slate-400'}`}
                                            >No</button>
                                        </div>
                                    </div>
                                    
                                    {formData.trabaja && (
                                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <AppInput
                                                label="Empresa / Institución"
                                                placeholder="Nombre de la empresa"
                                                value={formData.empresaNombre}
                                                onChange={(e) => onChange('empresaNombre', e.target.value)}
                                            />
                                            <AppInput
                                                label="Cargo y Horario"
                                                placeholder="Ej: Analista - 08:00 a 17:00"
                                                value={formData.cargo}
                                                onChange={(e) => onChange('cargo', e.target.value)}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </section>
                )}
            </div>

            {/* Section 3: Documentos */}
            <section className="mt-16">
                <SectionTitle
                    title={formData.tipoUsuario === 'concursante_docente' ? 'Documentos del Concursante' : 'Documentos del Postulante'}
                    subtitle="Cargue los documentos requeridos en formato digital."
                    icon={FileText}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {docs.map((doc) => {
                        const uploaded = uploadedDocs.find(d => d.id === doc.id);
                        return (
                            <div
                                key={doc.id}
                                className={`relative p-6 rounded-3xl border-2 border-dashed transition-all ${
                                    uploaded 
                                        ? 'border-success/30 bg-success-soft/20' 
                                        : 'border-slate-200 bg-slate-50/50 hover:border-primary/30'
                                }`}
                            >
                                <input
                                    type="file"
                                    accept="image/*,.pdf"
                                    onChange={(e) => handleDocUpload(e, doc.id)}
                                    className="absolute inset-0 opacity-0 cursor-pointer"
                                />
                                <div className="flex items-start gap-4">
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                                        uploaded ? 'bg-success text-white' : 'bg-slate-200 text-slate-500'
                                    }`}>
                                        {uploaded ? <CheckCircle2 size={24} /> : <Upload size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-slate-800">{doc.label}</p>
                                        <p className="text-xs text-slate-500 mt-1">
                                            {doc.description || (doc.required ? 'Requerido' : 'Opcional')}
                                        </p>
                                        {doc.templateUrl && !uploaded && (
                                            <a 
                                                href={doc.templateUrl} 
                                                download
                                                className="inline-flex items-center gap-1 mt-2 text-xs font-bold text-[#800020] hover:text-[#5a0015] transition-colors"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                <Download size={14} /> Descargar Plantilla
                                            </a>
                                        )}
                                        {uploaded && (
                                            <div className="mt-2 flex items-center gap-2">
                                                <img 
                                                    src={uploaded.preview} 
                                                    alt={doc.label}
                                                    className="w-16 h-16 object-cover rounded-lg border border-slate-200" 
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); removeDoc(doc.id); }}
                                                    className="text-danger text-xs font-bold"
                                                >
                                                    <X size={14} /> Eliminar
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            <div className="mt-16 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <CheckCircle2 size={14} className="text-success" /> Complete todos los datos y documentos
                </div>
                <AppButton
                    size="lg"
                    icon={ArrowRight}
                    iconPosition="right"
                    onClick={onContinue}
                    className="w-full sm:w-auto"
                    loading={isLoading}
                >
                    {isLoading ? 'Guardando...' : 'Finalizar Registro'}
                </AppButton>
            </div>
        </div>
    );
};

export default PersonalDataForm;
