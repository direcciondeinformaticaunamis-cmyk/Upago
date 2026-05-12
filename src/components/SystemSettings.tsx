import React, { useState, useEffect } from 'react';
import { Shield, Mail, UserCheck, Trash2, Plus, Search, Info } from 'lucide-react';
import { FinanceService } from '../services/FinanceService';

interface InstitutionalRole {
    id: number;
    correo: string;
    rol: 'admin' | 'academico';
    nombre_referencia: string;
}

const SystemSettings: React.FC = () => {
    const [roles, setRoles] = useState<InstitutionalRole[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [newEmail, setNewEmail] = useState('');
    const [newRole, setNewRole] = useState<'admin' | 'academico'>('academico');
    const [newName, setNewName] = useState('');
    const [search, setSearch] = useState('');

    const loadRoles = async () => {
        setIsLoading(true);
        try {
            const response = await fetch('api.php?get_institutional_roles=true');
            const data = await response.json();
            setRoles(data);
        } catch (error) {
            console.error('Error loading roles:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadRoles();
    }, []);

    const handleAddRole = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newEmail) return;

        try {
            const response = await fetch('api.php?save_institutional_role=true', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo: newEmail, rol: newRole, nombre_referencia: newName })
            });
            const result = await response.json();
            if (result.status === 'success') {
                loadRoles();
                setNewEmail('');
                setNewName('');
            } else {
                alert(result.message);
            }
        } catch (error) {
            alert('Error al guardar el rol');
        }
    };

    const handleDeleteRole = async (id: number) => {
        if (!confirm('¿Seguro que deseas eliminar este permiso administrativo?')) return;
        try {
            await fetch(`api.php?delete_institutional_role=${id}`, { method: 'POST' });
            loadRoles();
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const filteredRoles = roles.filter(r => 
        r.correo.toLowerCase().includes(search.toLowerCase()) || 
        r.nombre_referencia?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-start gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[#800020] tracking-tight mb-2">Configuración de Personal</h1>
                    <p className="text-slate-500 text-sm font-medium">Asignación manual de roles para cuentas institucionales de la UNAMIS.</p>
                </div>
                <div className="bg-[#800020]/5 px-4 py-2 rounded-xl border border-[#800020]/10 flex items-center gap-3">
                    <Shield className="text-[#800020]" size={20} />
                    <span className="text-[11px] font-black text-[#800020] uppercase tracking-widest">Control de Acceso Seguro</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario de Asignación */}
                <div className="lg:col-span-1 bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 h-fit">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-[#800020] rounded-xl flex items-center justify-center text-white">
                            <Plus size={20} />
                        </div>
                        <h2 className="text-lg font-bold text-slate-800">Asignar Nuevo Rol</h2>
                    </div>

                    <form onSubmit={handleAddRole} className="space-y-5">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Correo Institucional</label>
                            <input 
                                type="email" 
                                required
                                value={newEmail}
                                onChange={(e) => setNewEmail(e.target.value)}
                                placeholder="ejemplo@unamis.edu.py"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:bg-white focus:border-[#800020] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Nombre / Referencia</label>
                            <input 
                                type="text" 
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="Nombre del funcionario o oficina"
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:bg-white focus:border-[#800020] outline-none transition-all"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Rol a Asignar</label>
                            <select 
                                value={newRole}
                                onChange={(e) => setNewRole(e.target.value as any)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-xl p-3 text-sm focus:bg-white focus:border-[#800020] outline-none appearance-none transition-all"
                            >
                                <option value="academico">Coordinador Académico</option>
                                <option value="admin">Finanzas / Administrador</option>
                            </select>
                        </div>
                        <button type="submit" className="w-full py-4 bg-[#800020] text-white rounded-xl font-bold text-sm shadow-lg shadow-[#800020]/20 hover:bg-[#5a0015] transition-all">
                            Confirmar Asignación
                        </button>
                    </form>

                    <div className="mt-8 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                        <Info className="text-amber-600 shrink-0" size={18} />
                        <p className="text-[11px] text-amber-800 leading-relaxed font-medium">
                            Los usuarios asignados aquí podrán ingresar con su cuenta institucional mediante Microsoft SSO o usando la contraseña maestra administrativa.
                        </p>
                    </div>
                </div>

                {/* Lista de Roles */}
                <div className="lg:col-span-2 space-y-4">
                    <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
                        <Search className="text-slate-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Buscar por correo o nombre..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="flex-1 bg-transparent border-none outline-none text-sm font-medium"
                        />
                    </div>

                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50">
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Usuario Institucional</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Rol Asignado</th>
                                    <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {isLoading ? (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic">Cargando roles...</td>
                                    </tr>
                                ) : filteredRoles.length > 0 ? (
                                    filteredRoles.map((r) => (
                                        <tr key={r.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-8 py-5">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${r.rol === 'admin' ? 'bg-[#800020] text-white' : 'bg-blue-600 text-white'}`}>
                                                        <Mail size={18} />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-bold text-slate-800">{r.nombre_referencia || 'Sin nombre'}</p>
                                                        <p className="text-[10px] text-slate-400 font-mono">{r.correo}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 text-center">
                                                <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1.5 rounded-full ${r.rol === 'admin' ? 'bg-red-50 text-[#800020] border border-red-100' : 'bg-blue-50 text-blue-600 border border-blue-100'}`}>
                                                    {r.rol === 'admin' ? 'ADMIN / FINANZAS' : 'COORDINADOR ACADÉMICO'}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                <button 
                                                    onClick={() => handleDeleteRole(r.id)}
                                                    className="p-2 text-slate-300 hover:text-red-600 transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="px-8 py-20 text-center text-slate-400 italic">No hay roles manuales registrados.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SystemSettings;
