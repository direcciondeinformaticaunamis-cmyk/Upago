import React, { useState } from 'react';
import {
    ClipboardList,
    Users,
    Calendar,
    MapPin,
    GraduationCap,
    DollarSign,
    PlayCircle,
    Save,
    ArrowRight,
    ArrowLeft,
    Plus,
    X,
    Paperclip,
    Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CATALOGO_UNAMIS, TODAS_LAS_SEDES, TODAS_LAS_CARRERAS, getCarrerasPorSede } from '../../../constants/catalogoUnamis';

const TIPOS = [
    { id: 'investigacion', label: 'Investigación' },
    { id: 'extension', label: 'Extensión Universitaria' },
    { id: 'tesis', label: 'Tesis / Trabajo de Grado' },
    { id: 'integrador', label: 'Proyecto Integrador' }
];

const RegistrationForm = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        titulo: '',
        resumen: '',
        tipo_proyecto: 'investigacion',
        sede: TODAS_LAS_SEDES[0],
        carrera: TODAS_LAS_CARRERAS[0],
        anio_academico: new Date().getFullYear(),
        presupuesto_estimado: 0,
        moneda: 'PYG',
        modalidad: 'presencial',
        resolucion_nro: '',
        archivo_resolucion: null as File | null,
        miembros: [{ nombre: '', rol: 'director', correo: '' }]
    });

    const handleChange = (field: string, value: any) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const addMember = () => {
        setFormData(prev => ({
            ...prev,
            miembros: [...prev.miembros, { nombre: '', rol: 'investigador', correo: '' }]
        }));
    };

    const removeMember = (index: number) => {
        setFormData(prev => ({
            ...prev,
            miembros: prev.miembros.filter((_, i) => i !== index)
        }));
    };

    const updateMember = (index: number, field: string, value: string) => {
        const newMiembros = [...formData.miembros];
        newMiembros[index] = { ...newMiembros[index], [field]: value };
        setFormData(prev => ({ ...prev, miembros: newMiembros }));
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('api-banco.php?action=save_project', {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
                },
                body: JSON.stringify(formData)
            });
            const result = await response.json();
            if (result.status === 'success') {
                const projectId = result.id;

                // Upload Resolution File if present
                if (formData.archivo_resolucion) {
                    const fileData = new FormData();
                    fileData.append('file', formData.archivo_resolucion);
                    await fetch(`api-banco.php?action=upload_file&id=${projectId}&type=resolucion&nro=${formData.resolucion_nro}`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
                        },
                        body: fileData
                    });
                }

                alert('Proyecto registrado con éxito!');
                window.location.reload();
            }
        } catch (error) {
            console.error('Error saving project:', error);
        }
    };

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-10">
                {[1, 2, 3].map(s => (
                    <div key={s} className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-400'
                            }`}>
                            {s}
                        </div>
                        <div className={`h-1 w-12 rounded-full ${step > s ? 'bg-primary' : 'bg-slate-100'}`} />
                    </div>
                ))}
            </div>

            {step === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Título del Proyecto</label>
                        <input
                            type="text"
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-slate-700"
                            placeholder="Ej. Impacto de la IA en la educación primaria..."
                            value={formData.titulo}
                            onChange={(e) => handleChange('titulo', e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Resumen / Abstract</label>
                        <textarea
                            className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium text-slate-600 min-h-[150px]"
                            placeholder="Describa brevemente el objetivo y alcance..."
                            value={formData.resumen}
                            onChange={(e) => handleChange('resumen', e.target.value)}
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Proyecto</label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={formData.tipo_proyecto}
                                onChange={(e) => handleChange('tipo_proyecto', e.target.value)}
                            >
                                {TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Año Académico</label>
                            <input
                                type="number"
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={formData.anio_academico}
                                onChange={(e) => handleChange('anio_academico', e.target.value)}
                            />
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Sede</label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={formData.sede}
                                onChange={(e) => handleChange('sede', e.target.value)}
                            >
                                {TODAS_LAS_SEDES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Carrera</label>
                            <select
                                className="w-full px-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                value={formData.carrera}
                                onChange={(e) => handleChange('carrera', e.target.value)}
                            >
                                {Object.entries(CATALOGO_UNAMIS).map(([sede, carreras]) => (
                                    <optgroup key={sede} label={sede}>
                                        {carreras.map(c => <option key={c} value={c}>{c}</option>)}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Modalidad</label>
                            <div className="flex gap-4">
                                {['presencial', 'virtual', 'hibrido'].map(m => (
                                    <button
                                        key={m}
                                        onClick={() => handleChange('modalidad', m)}
                                        className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${formData.modalidad === m ? 'bg-primary text-white border-primary' : 'bg-white text-slate-400 border-slate-200'
                                            }`}
                                    >
                                        {m}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Presupuesto (Estimado)</label>
                            <div className="relative">
                                <DollarSign size={16} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="number"
                                    className="w-full pl-12 pr-6 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                    value={formData.presupuesto_estimado}
                                    onChange={(e) => handleChange('presupuesto_estimado', e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-primary/5 rounded-[2.5rem] border border-primary/10">
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Resolución de Decanato/Rectorado</label>
                            <input
                                type="text"
                                className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl outline-none font-bold text-slate-700"
                                placeholder="N° Resolución (Ej. 042/2026)"
                                value={formData.resolucion_nro}
                                onChange={(e) => handleChange('resolucion_nro', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-primary uppercase tracking-widest mb-2">Adjuntar Documento</label>
                            <div className="relative">
                                <input
                                    type="file"
                                    className="hidden"
                                    id="file-resolucion"
                                    onChange={(e) => handleChange('archivo_resolucion', e.target.files?.[0])}
                                />
                                <label
                                    htmlFor="file-resolucion"
                                    className="flex items-center gap-3 w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl cursor-pointer hover:border-primary transition-all font-bold text-slate-700"
                                >
                                    <Paperclip size={18} className="text-primary" />
                                    <span className="truncate flex-1">
                                        {formData.archivo_resolucion ? formData.archivo_resolucion.name : 'Seleccionar PDF/Imagen'}
                                    </span>
                                    {formData.archivo_resolucion && <Check size={18} className="text-emerald-500" />}
                                </label>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}

            {step === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                    <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Integrantes del Equipo</label>
                        <button onClick={addMember} className="flex items-center gap-2 text-[10px] font-black text-primary hover:opacity-70 transition-opacity">
                            <Plus size={14} /> AGREGAR MIEMBRO
                        </button>
                    </div>
                    <div className="space-y-4">
                        {formData.miembros.map((mbr, idx) => (
                            <div key={idx} className="flex gap-4 items-end bg-slate-50 p-6 rounded-[2rem] border border-slate-100 relative group">
                                <div className="flex-1 space-y-4">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent border-b border-slate-200 py-2 outline-none font-bold text-slate-700 focus:border-primary px-2"
                                        placeholder="Nombre Completo"
                                        value={mbr.nombre}
                                        onChange={(e) => updateMember(idx, 'nombre', e.target.value)}
                                    />
                                    <div className="flex gap-4 text-[10px] font-black uppercase">
                                        <select
                                            className="bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                                            value={mbr.rol}
                                            onChange={(e) => updateMember(idx, 'rol', e.target.value)}
                                        >
                                            <option value="director">Director</option>
                                            <option value="co-director">Co-Director</option>
                                            <option value="investigador">Investigador</option>
                                            <option value="postulante">Postulante</option>
                                        </select>
                                        <input
                                            type="email"
                                            className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 outline-none"
                                            placeholder="@correo.com"
                                            value={mbr.correo}
                                            onChange={(e) => updateMember(idx, 'correo', e.target.value)}
                                        />
                                    </div>
                                </div>
                                {idx > 0 && (
                                    <button onClick={() => removeMember(idx)} className="text-slate-300 hover:text-red-500 transition-colors mb-2">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>
            )}

            <div className="mt-12 flex items-center justify-between border-t border-slate-100 pt-8">
                {step > 1 ? (
                    <button onClick={() => setStep(step - 1)} className="flex items-center gap-2 px-8 py-4 bg-slate-100 text-slate-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-colors">
                        <ArrowLeft size={16} /> Anterior
                    </button>
                ) : <div />}

                {step < 3 ? (
                    <button onClick={() => setStep(step + 1)} className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-primary/20 transition-all active:scale-95">
                        Continuar <ArrowRight size={16} />
                    </button>
                ) : (
                    <button onClick={handleSubmit} className="flex items-center gap-2 px-10 py-4 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:shadow-lg hover:shadow-emerald-500/20 transition-all active:scale-95">
                        <Save size={16} /> Registrar Proyecto
                    </button>
                )}
            </div>
        </div>
    );
};

export default RegistrationForm;
