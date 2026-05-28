import React, { useState, useEffect } from 'react';
import { 
    Search, 
    UserPlus, 
    Mail, 
    ShieldCheck, 
    ArrowRight, 
    X, 
    Loader2, 
    CheckCircle2,
    ArrowLeft,
    Shield,
    Users,
    Info,
    Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ExternalUser {
    id: string;
    nombre: string;
    apellido: string;
    cedula: string;
    correo_actual: string;
    tipo: 'postulante' | 'concursante_docente' | 'auxiliar_docente';
    fecha_registro: string;
    estado: 'activo' | 'migrado';
}

interface ExternalUserManagerProps {
    onBack: () => void;
}

const ExternalUserManager: React.FC<ExternalUserManagerProps> = ({ onBack }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUser, setSelectedUser] = useState<ExternalUser | null>(null);
    const [institutionalEmail, setInstitutionalEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    // Datos simulados
    const [users, setUsers] = useState<ExternalUser[]>([]);

    useEffect(() => {
        loadExternalUsers();
    }, []);

    const loadExternalUsers = async () => {
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            // Por practicidad, obtenemos todos y filtramos los que NO son institucionales
            // Un endpoint dedicado sería mejor, pero reusamos lógica o traemos de api.php
            // Simularemos la carga mientras no tengamos un GET exclusivo de externos,
            // pero lo dejamos preparado para la API.
            const response = await fetch(`${baseUrl}/api.php?get_external_users=true&_cb=${Date.now()}`);
            if (response.ok) {
                const data = await response.json();
                if (data && Array.isArray(data)) {
                    setUsers(data);
                }
            } else {
                // Fallback temporal si no existe el endpoint aún
                setUsers([
                    { id: '1', nombre: 'Carlos', apellido: 'Ramírez', cedula: '4.555.222', correo_actual: 'carlos.ext@gmail.com', tipo: 'postulante', fecha_registro: '2026-02-10', estado: 'activo' },
                    { id: '2', nombre: 'Ana', apellido: 'Martínez', cedula: '3.888.111', correo_actual: 'ana.docente@yahoo.es', tipo: 'concursante_docente', fecha_registro: '2026-03-01', estado: 'activo' }
                ]);
            }
        } catch (error) {
            console.error('Error loading users', error);
        }
    };

    const filteredUsers = users.filter(u => 
        (u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.apellido.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.cedula.includes(searchTerm)) &&
        u.estado === 'activo'
    );

    const handleMigrate = async () => {
        if (!institutionalEmail.endsWith('@unamis.edu.py')) {
            alert('El correo debe ser institucional (@unamis.edu.py)');
            return;
        }

        if (!selectedUser) return;

        setLoading(true);
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            const response = await fetch(`${baseUrl}/api.php?_cb=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'migrate_user',
                    cedula: selectedUser.cedula,
                    nuevo_correo: institutionalEmail,
                    admin_user: 'informatica@unamis.edu.py' // Aquí idealmente va el usuario de sesión real
                })
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                setUsers(prev => prev.map(u => 
                    u.id === selectedUser.id ? { ...u, estado: 'migrado', correo_actual: institutionalEmail } : u
                ));
                setSuccess(true);
                setTimeout(() => {
                    setSuccess(false);
                    setSelectedUser(null);
                    setInstitutionalEmail('');
                }, 2000);
            } else {
                alert(result.message || 'Error al migrar la cuenta.');
            }
        } catch (error) {
            alert('Error de conexión con el servidor al intentar migrar la cuenta.');
        } finally {
            setLoading(false);
        }
    };

    const [deleteLoading, setDeleteLoading] = useState(false);

    const handleDelete = async () => {
        if (!selectedUser) return;
        
        if (!window.confirm(`¿Está completamente seguro de eliminar permanentemente al usuario ${selectedUser.nombre} ${selectedUser.apellido} (CI: ${selectedUser.cedula})?\nEsta acción no se puede deshacer y borrará toda la información vinculada a su expediente.`)) {
            return;
        }

        setDeleteLoading(true);
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            const response = await fetch(`${baseUrl}/api.php?_cb=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete_external_user',
                    cedula: selectedUser.cedula,
                    admin_user: 'superadmin'
                })
            });
            const result = await response.json();
            
            if (result.status === 'success') {
                alert('Usuario eliminado permanentemente.');
                setUsers(prev => prev.filter(u => u.id !== selectedUser.id));
                setSelectedUser(null);
            } else {
                alert(result.message || 'Error al eliminar el usuario.');
            }
        } catch (error) {
            alert('Error de conexión con el servidor.');
        } finally {
            setDeleteLoading(false);
        }
    };

    return (
        <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary-dark)] rounded-[var(--radius-2xl)] p-10 relative overflow-hidden shadow-premium">
                <div className="absolute right-0 top-0 w-80 h-80 bg-white opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2 blur-2xl"></div>
                <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={onBack} className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/20 transition-all border border-white/10 shadow-lg">
                            <ArrowLeft size={24} />
                        </button>
                        <div>
                            <h2 className="text-3xl font-black text-white tracking-tighter uppercase">Gestión de Cuentas Externas</h2>
                            <p className="text-sm text-white/60 font-medium tracking-widest uppercase">Promoción a Cuentas Institucionales Microsoft 365</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: List & Search */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-[var(--radius-xl)] p-6 shadow-card border border-[var(--border-subtle)]">
                        <div className="relative group mb-6">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-light)] group-focus-within:text-[var(--primary)] transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por CI o Nombre..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-14 pr-6 py-4 bg-[var(--background)] rounded-2xl border-0 focus:ring-4 focus:ring-[var(--primary-50)] transition-all font-medium text-sm"
                            />
                        </div>

                        <div className="space-y-3">
                            {filteredUsers.map((user) => (
                                <motion.div 
                                    key={user.id}
                                    layout
                                    className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between group ${
                                        selectedUser?.id === user.id 
                                            ? 'border-[var(--primary)] bg-[var(--primary-50)]' 
                                            : 'border-slate-100 hover:border-slate-200 bg-slate-50/30'
                                    }`}
                                    onClick={() => setSelectedUser(user)}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shadow-lg ${
                                            (user.tipo === 'concursante_docente' || user.tipo === 'auxiliar_docente') ? 'bg-purple-600' : 'bg-[var(--primary)]'
                                        }`}>
                                            {user.nombre[0]}{user.apellido[0]}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800">{user.nombre} {user.apellido}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                                                <span>CI: {user.cedula}</span>
                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                <span className={(user.tipo === 'concursante_docente' || user.tipo === 'auxiliar_docente') ? 'text-purple-600' : 'text-[var(--primary)]'}>
                                                     {user.tipo === 'concursante_docente' ? 'Docente Encargado' : (user.tipo === 'auxiliar_docente' ? 'Auxiliar de Enseñanza' : 'Postulante')}
                                                 </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right hidden sm:block">
                                            <p className="text-xs text-slate-500 font-medium">{user.correo_actual}</p>
                                            <p className="text-[10px] text-slate-400 tracking-tighter">Registrado el {user.fecha_registro}</p>
                                        </div>
                                        <ArrowRight className={`text-slate-300 group-hover:text-[var(--primary)] transition-colors ${selectedUser?.id === user.id ? 'translate-x-1 text-[var(--primary)]' : ''}`} size={20} />
                                    </div>
                                </motion.div>
                            ))}

                            {filteredUsers.length === 0 && (
                                <div className="py-12 text-center space-y-3">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                                        <Users size={32} />
                                    </div>
                                    <p className="text-slate-400 font-medium text-sm">No se encontraron usuarios externos pendientes de migración.</p>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Column: Migration Tool */}
                <div className="lg:col-span-1">
                    <AnimatePresence mode="wait">
                        {selectedUser ? (
                            <motion.div 
                                key="tool"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="bg-white rounded-[var(--radius-xl)] p-8 shadow-premium border border-[var(--border-subtle)] sticky top-8"
                            >
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-xl font-black text-slate-800 tracking-tighter uppercase">Promover Usuario</h3>
                                    <button onClick={() => setSelectedUser(null)} className="text-slate-400 hover:text-slate-600 transition-colors">
                                        <X size={20} />
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-[var(--primary-50)] rounded-2xl border border-[var(--primary-100)] flex gap-3">
                                        <Info className="text-[var(--primary)] shrink-0" size={20} />
                                        <p className="text-xs text-[var(--primary-dark)] font-medium leading-relaxed">
                                            Al migrar a cuenta institucional, el usuario podrá ingresar vía **Microsoft SSO**. Toda su información anterior (pagos, documentos) se mantendrá vinculada.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Usuario Seleccionado</label>
                                            <div className="px-5 py-4 bg-slate-50 rounded-2xl font-bold text-slate-700 text-sm border border-slate-100">
                                                {selectedUser.nombre} {selectedUser.apellido}
                                            </div>
                                        </div>

                                        <div className="relative group">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-2 block">Nuevo Correo Institucional</label>
                                            <div className="relative">
                                                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    placeholder="usuario@unamis.edu.py"
                                                    value={institutionalEmail}
                                                    onChange={(e) => setInstitutionalEmail(e.target.value)}
                                                    className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:bg-white focus:border-[var(--primary-100)] transition-all font-bold text-sm outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={handleMigrate}
                                        disabled={loading || !institutionalEmail}
                                        className="w-full py-5 bg-[var(--primary)] text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary-100)] hover:-translate-y-1 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                                    >
                                        {loading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : success ? (
                                            <CheckCircle2 size={20} />
                                        ) : (
                                            <>Vincular y Promover <ShieldCheck size={20} /></>
                                        )}
                                    </button>

                                    <div className="relative flex py-2 items-center">
                                        <div className="flex-grow border-t border-slate-100"></div>
                                        <span className="flex-shrink mx-4 text-[10px] font-black text-slate-300 uppercase tracking-widest">Otras Acciones</span>
                                        <div className="flex-grow border-t border-slate-100"></div>
                                    </div>

                                    <button 
                                        onClick={handleDelete}
                                        disabled={deleteLoading || loading}
                                        className="w-full py-4 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] transition-all disabled:opacity-50 flex items-center justify-center gap-3 border border-red-200"
                                    >
                                        {deleteLoading ? (
                                            <Loader2 className="animate-spin" size={20} />
                                        ) : (
                                            <>Eliminar Usuario Permanentemente <Trash2 size={18} /></>
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="placeholder"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[var(--radius-xl)] p-12 text-center space-y-4"
                            >
                                <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-sm text-slate-300">
                                    <Shield size={40} />
                                </div>
                                <div className="space-y-2">
                                    <h4 className="font-bold text-slate-400">Seleccione un usuario</h4>
                                    <p className="text-xs text-slate-400 leading-relaxed max-w-[200px] mx-auto font-medium">
                                        Haga clic en un usuario externo de la lista para iniciar el proceso de migración institucional.
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default ExternalUserManager;
