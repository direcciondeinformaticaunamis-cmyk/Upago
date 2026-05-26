import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Plus, 
    Edit2, 
    Save, 
    X, 
    Settings2, 
    Tag, 
    DollarSign, 
    FileText, 
    AlertCircle,
    CheckCircle2,
    XCircle,
    ChevronDown,
} from 'lucide-react';
import { fetchApi } from '../../services/ApiService';

interface Arancel {
    id: number;
    categoria: string;
    concepto: string;
    monto: number;
    descripcion: string;
    activo: number;
}

const ArancelesConfig: React.FC = () => {
    const [aranceles, setAranceles] = useState<Arancel[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<Arancel>>({
        categoria: 'ACADÉMICOS',
        concepto: '',
        monto: 0,
        descripcion: '',
        activo: 1
    });

    const fetchAranceles = async () => {
        setLoading(true);
        try {
            const data = await fetchApi('aranceles=1');
            if (Array.isArray(data)) {
                setAranceles(data);
            }
        } catch (err) {
            setError('Error al cargar los aranceles');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAranceles();
    }, []);

    const handleEdit = (arancel: Arancel) => {
        setEditingId(arancel.id);
        setFormData(arancel);
        setIsAdding(false);
    };

    const handleCancel = () => {
        setEditingId(null);
        setIsAdding(false);
        setFormData({
            categoria: 'ACADÉMICOS',
            concepto: '',
            monto: 0,
            descripcion: '',
            activo: 1
        });
    };

    const handleSave = async () => {
        if (!formData.categoria || !formData.concepto || formData.monto === undefined) {
            setError('Por favor complete todos los campos obligatorios');
            return;
        }

        try {
            const result = await fetchApi('save_arancel=1', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            if (result.status === 'success') {
                setSuccess(editingId ? 'Arancel actualizado' : 'Nuevo arancel agregado');
                handleCancel();
                fetchAranceles();
                setTimeout(() => setSuccess(null), 3000);
            } else {
                setError(result.message || 'Error al guardar');
            }
        } catch (err) {
            setError('Error de conexión al servidor');
        }
    };

    const toggleStatus = async (arancel: Arancel) => {
        try {
            const updated = { ...arancel, activo: arancel.activo === 1 ? 0 : 1 };
            const result = await fetchApi('save_arancel=1', {
                method: 'POST',
                body: JSON.stringify(updated)
            });
            if (result.status === 'success') {
                fetchAranceles();
            }
        } catch (err) {
            setError('Error al cambiar el estado');
        }
    };

    const categories = ['ACADÉMICOS', 'SERVICIOS', 'LICENCIATURA', 'POSTGRADO', 'OTROS'];

    if (loading && aranceles.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-slate-500 font-medium">Cargando configuración de aranceles...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase mb-2">Configuración de Aranceles</h2>
                    <p className="text-slate-500 font-medium">Gestiona los conceptos, montos y categorías del sistema de pagos.</p>
                </div>
                <button 
                    onClick={() => setIsAdding(true)}
                    className="flex items-center justify-center gap-2 px-6 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                >
                    <Plus size={18} /> Agregar Arancel
                </button>
            </div>

            {/* Notifications */}
            <AnimatePresence>
                {error && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-red-50 border border-red-100 p-4 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold"
                    >
                        <AlertCircle size={20} /> {error}
                        <button onClick={() => setError(null)} className="ml-auto"><X size={18} /></button>
                    </motion.div>
                )}
                {success && (
                    <motion.div 
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="bg-green-50 border border-green-100 p-4 rounded-2xl flex items-center gap-3 text-green-600 text-sm font-bold"
                    >
                        <CheckCircle2 size={20} /> {success}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Form Section */}
            <AnimatePresence>
                {(isAdding || editingId) && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-8 shadow-xl shadow-slate-200/50"
                    >
                        <div className="flex items-center justify-between mb-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center text-primary">
                                    <Settings2 size={24} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">
                                    {editingId ? 'Editar Arancel' : 'Nuevo Arancel'}
                                </h3>
                            </div>
                            <button onClick={handleCancel} className="p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <X size={24} className="text-slate-400" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Categoría</label>
                                    <div className="relative">
                                        <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <select 
                                            value={formData.categoria}
                                            onChange={(e) => setFormData({...formData, categoria: e.target.value})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all appearance-none outline-none"
                                        >
                                            {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                                        </select>
                                        <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Concepto / Nombre</label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="text"
                                            value={formData.concepto}
                                            onChange={(e) => setFormData({...formData, concepto: e.target.value})}
                                            placeholder="Ej: Certificado de Estudios"
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all outline-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Monto (Gs.)</label>
                                    <div className="relative">
                                        <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input 
                                            type="number"
                                            value={formData.monto}
                                            onChange={(e) => setFormData({...formData, monto: parseInt(e.target.value) || 0})}
                                            className="w-full pl-12 pr-4 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all outline-none"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 px-1">Descripción (Opcional)</label>
                                    <textarea 
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
                                        placeholder="Detalles adicionales del arancel..."
                                        rows={2}
                                        className="w-full px-6 py-4 bg-slate-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-2xl text-sm font-bold text-slate-900 transition-all outline-none resize-none"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-4 mt-8 pt-8 border-t border-slate-100">
                            <button 
                                onClick={handleCancel}
                                className="px-8 py-4 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSave}
                                className="flex items-center gap-2 px-10 py-4 bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-[1.02] transition-all active:scale-95"
                            >
                                <Save size={18} /> {editingId ? 'Actualizar Arancel' : 'Guardar Arancel'}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* List Table */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50">
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Categoría</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Concepto</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">Monto</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-center">Estado</th>
                                <th className="px-8 py-6 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {aranceles.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-medium">
                                        No hay aranceles configurados.
                                    </td>
                                </tr>
                            ) : (
                                aranceles.map((arancel) => (
                                    <tr key={arancel.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <td className="px-8 py-5">
                                            <span className="inline-flex px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-[10px] font-black uppercase tracking-wider">
                                                {arancel.categoria}
                                            </span>
                                        </td>
                                        <td className="px-8 py-5">
                                            <div className="font-bold text-slate-900 text-sm">{arancel.concepto}</div>
                                            {arancel.descripcion && <div className="text-[11px] text-slate-400 font-medium mt-0.5">{arancel.descripcion}</div>}
                                        </td>
                                        <td className="px-8 py-5 font-black text-slate-900 text-sm">
                                            {new Intl.NumberFormat('es-PY', { style: 'currency', currency: 'PYG', maximumFractionDigits: 0 }).format(arancel.monto)}
                                        </td>
                                        <td className="px-8 py-5 text-center">
                                            <button 
                                                onClick={() => toggleStatus(arancel)}
                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all ${
                                                    arancel.activo === 1 
                                                        ? 'bg-green-100 text-green-700 border border-green-200' 
                                                        : 'bg-slate-100 text-slate-400 border border-slate-200'
                                                }`}
                                            >
                                                {arancel.activo === 1 ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-8 py-5 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <button 
                                                    onClick={() => handleEdit(arancel)}
                                                    className="p-2 text-slate-400 hover:text-primary hover:bg-slate-100 rounded-xl transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Hint Box */}
            <div className="bg-slate-50 border-2 border-slate-100 rounded-[2rem] p-6 flex items-start gap-4">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shrink-0 mt-1">
                    <AlertCircle size={20} />
                </div>
                <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider mb-1">Nota importante</h4>
                    <p className="text-[13px] text-slate-600 font-medium leading-relaxed">
                        Los cambios realizados en los aranceles se reflejarán instantáneamente para todos los postulantes al momento de registrar un nuevo pago. 
                        Se recomienda marcar como "Inactivo" en lugar de eliminar aranceles antiguos para mantener la integridad histórica de los reportes.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ArancelesConfig;
