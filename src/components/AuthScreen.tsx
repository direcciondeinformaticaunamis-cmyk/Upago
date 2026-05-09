import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import AppButton from './ui/AppButton';
import AppInput from './ui/AppInput';

interface AuthScreenProps {
    onLogin: (email: string, password: string) => void;
    onRegister: () => void;
    error?: string;
    loading?: boolean;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, error, loading }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        cedula: ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(formData.email, formData.password);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-[#800020] to-slate-900 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
                        <GraduationCap size={40} className="text-white" />
                    </div>
                    <h1 className="text-3xl font-black text-white tracking-tight">UNAMIS</h1>
                    <p className="text-white/60 text-sm mt-2">Universidad Nacional de Misiones</p>
                </div>

                {/* Auth Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8">
                    <div className="flex items-center justify-center gap-4 mb-8">
                        <button
                            onClick={() => setIsLogin(true)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                isLogin ? 'bg-[#800020] text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            Ingresar
                        </button>
                        <button
                            onClick={() => setIsLogin(false)}
                            className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all ${
                                !isLogin ? 'bg-[#800020] text-white' : 'bg-slate-100 text-slate-500'
                            }`}
                        >
                            Registrarse
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-600 text-sm">
                            <AlertCircle size={18} />
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="email"
                                placeholder="Email"
                                value={formData.email}
                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                className="w-full pl-12 pr-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-[#800020]/20"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Contraseña"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                className="w-full pl-12 pr-12 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-[#800020]/20"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        {!isLogin && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <input
                                        type="text"
                                        placeholder="Nombre"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                                        className="px-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-[#800020]/20"
                                        required
                                    />
                                    <input
                                        type="text"
                                        placeholder="Apellido"
                                        value={formData.apellido}
                                        onChange={(e) => setFormData({...formData, apellido: e.target.value})}
                                        className="px-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-[#800020]/20"
                                        required
                                    />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Cédula de Identidad"
                                    value={formData.cedula}
                                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                                    className="w-full px-4 py-4 bg-slate-50 border-0 rounded-xl focus:ring-2 focus:ring-[#800020]/20"
                                    required
                                />
                            </>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-[#800020] text-white rounded-xl font-bold hover:bg-[#5a0015] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                <>
                                    {isLogin ? 'Ingresar' : 'Crear Cuenta'} <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>

                    {!isLogin && (
                        <div className="mt-6 p-4 bg-emerald-50 rounded-xl">
                            <div className="flex items-start gap-3">
                                <CheckCircle size={18} className="text-emerald-600 flex-shrink-0 mt-0.5" />
                                <div className="text-xs text-emerald-700">
                                    <p className="font-bold mb-1">Al registrarte podrás:</p>
                                    <ul className="space-y-1 list-disc list-inside">
                                        <li>Cargar tus datos como Postulante o Concursante</li>
                                        <li>Subir documentos para el concurso o admisión</li>
                                        <li>Registrar pagos de aranceles y exámenes</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <p className="text-white/40 text-xs">
                        © 2026 UNAMIS - Universidad Nacional de Misiones
                    </p>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;