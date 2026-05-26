import React, { useState } from 'react';
import { GraduationCap, Mail, Lock, User, ArrowRight, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { CATALOGO_UNAMIS } from '../constants/catalogoUnamis';
import { loginRequest } from '../services/MicrosoftAuthService';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';

interface AuthScreenProps {
    onLogin: (email: string, password: string) => void;
    onRegister: (data: any) => void;
    onMicrosoftAuth?: (email: string) => Promise<boolean>;
    error?: string;
    loading?: boolean;
}

const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin, onRegister, onMicrosoftAuth, error, loading }) => {
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        nombre: '',
        apellido: '',
        cedula: '',
        carrera: '',
        tipoUsuario: 'postulante'
    });
    const [acceptedTerms, setAcceptedTerms] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validación estricta: correos institucionales solo por SSO para REGISTRO
        if (!isLogin && formData.email.toLowerCase().endsWith('@unamis.edu.py')) {
            alert('Las cuentas institucionales (@unamis.edu.py) deben registrarse/ingresar usando "Acceder con Microsoft 365". Si usted es personal académico/administrativo y desea hacer login manual, vuelva a la pestaña de "Ingresar".');
            return;
        }

        if (isLogin) {
            onLogin(formData.email, formData.password);
        } else {
            onRegister(formData);
        }
    };

    const { instance, inProgress } = useMsal();

    const handleMicrosoftLogin = () => {
        if (inProgress !== InteractionStatus.None) return;
        instance.loginRedirect(loginRequest);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] flex items-center justify-center p-6 relative overflow-hidden font-sans">
            {/* Background decorative elements */}
            <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[70%] bg-[var(--primary)] opacity-[0.03] rounded-full blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-15%] left-[-5%] w-[40%] h-[50%] bg-[var(--primary-light)] opacity-[0.02] rounded-full blur-[100px]" />

            <div className="w-full max-w-[1100px] flex flex-col md:flex-row bg-white rounded-[var(--radius-2xl)] shadow-premium overflow-hidden relative z-10 border border-[var(--border-subtle)]">
                
                {/* Brand Sidebar */}
                <div className="md:w-[40%] bg-gradient-to-br from-[var(--primary)] to-[var(--primary-dark)] p-12 text-white flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
                    
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-white/10 backdrop-blur-xl rounded-2xl flex items-center justify-center mb-8 border border-white/20 shadow-xl">
                            <GraduationCap size={35} className="text-white" />
                        </div>
                        <h1 className="text-4xl font-black tracking-tight mb-2 uppercase">UNAMIS</h1>
                        <p className="text-white/60 text-lg font-medium leading-tight">Portal Digital de Admisión y Concursos</p>
                    </div>

                    <div className="relative z-10 space-y-6">
                        <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/10">
                            <div className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-emerald-400">
                                <CheckCircle size={22} />
                            </div>
                            <p className="text-sm font-bold">Proceso 2026 Activo</p>
                        </div>
                        
                        {/* Guía para Externos */}
                        <div className="bg-white/10 backdrop-blur-md p-6 rounded-[30px] border border-white/20 space-y-3">
                            <p className="text-xs font-black uppercase tracking-widest text-emerald-400">Guía de Acceso</p>
                            <p className="text-sm leading-relaxed text-white/90">
                                Si aún no posee cuenta institucional **(@unamis.edu.py)**, debe realizar el registro manual.
                            </p>
                            <p className="text-[11px] text-white/60 italic">
                                Válido para: Postulantes, Encargados de Cátedra y Auxiliares.
                            </p>
                        </div>

                        <p className="text-white/50 text-sm leading-relaxed px-2">
                            Sistema centralizado para la gestión de postulantes, concursantes y aranceles institucionales.
                        </p>
                    </div>

                    <div className="relative z-10">
                        <p className="text-white/40 text-[10px] font-black tracking-[0.2em] uppercase">Secretaría de Tecnologías - UNAMIS</p>
                    </div>
                </div>

                {/* Form Area */}
                <div className="flex-1 p-8 md:p-16 overflow-y-auto max-h-[90vh]">
                    <div className="max-w-[450px] mx-auto">
                        <div className="mb-10 text-center md:text-left">
                            <h2 className="text-3xl font-black text-slate-800 mb-2">{isLogin ? '¡Bienvenido!' : 'Crear Cuenta'}</h2>
                            <p className="text-slate-500 font-medium">
                                {isLogin ? 'Ingrese sus credenciales institucionales o manuales.' : 'Complete sus datos para iniciar su postulación.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 rounded-xl flex items-center gap-3 text-red-700 text-sm animate-shake">
                                <AlertCircle size={18} />
                                {error}
                            </div>
                        )}

                        {/* Microsoft Button */}
                        <button
                            type="button"
                            onClick={handleMicrosoftLogin}
                            className="w-full flex items-center justify-center gap-4 px-6 py-4 mb-8 bg-white border-2 border-slate-100 rounded-2xl font-bold text-slate-700 text-sm hover:border-[var(--primary)]/30 hover:bg-slate-50 transition-all duration-300 shadow-sm group"
                        >
                            <svg width="20" height="20" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
                                <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
                                <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
                                <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
                                <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
                            </svg>
                            <span className="group-hover:text-[var(--primary)] transition-colors">Acceder con Microsoft 365</span>
                        </button>

                        <div className="relative flex items-center gap-4 mb-10">
                            <div className="flex-1 h-px bg-slate-100" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">o cuenta manual</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                                <input
                                    type="email"
                                    placeholder="Correo electrónico"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="w-full pl-12 pr-4 py-4 bg-[var(--background)] border border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary-100)] focus:ring-4 focus:ring-[var(--primary-50)] transition-all outline-none text-[var(--text)] font-medium placeholder:text-[var(--text-light)]"
                                    required
                                />
                            </div>

                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[var(--primary)] transition-colors" size={18} />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Contraseña"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="w-full pl-12 pr-12 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary)]/20 transition-all outline-none text-slate-800 font-medium placeholder:text-slate-400 shadow-inner"
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
                                <div className="space-y-4 animate-in fade-in duration-500">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <input
                                            type="text"
                                            placeholder="Nombre"
                                            value={formData.nombre}
                                            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary)]/20 transition-all outline-none text-slate-800 font-medium"
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Apellido"
                                            value={formData.apellido}
                                            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary)]/20 transition-all outline-none text-slate-800 font-medium"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Cédula de Identidad (Sin puntos)"
                                        value={formData.cedula}
                                        onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
                                        className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary)]/20 transition-all outline-none text-slate-800 font-medium"
                                        required
                                    />
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <select
                                            value={formData.tipoUsuario}
                                            onChange={(e) => setFormData({ ...formData, tipoUsuario: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary)]/20 transition-all outline-none text-slate-600 text-sm font-bold"
                                            required
                                        >
                                            <option value="postulante">Postulante a Estudiante</option>
                                            <option value="concursante_docente">Postulante a Docente</option>
                                            <option value="auxiliar_docente">Postulante a Auxiliar</option>
                                        </select>
                                        <select
                                            value={formData.carrera}
                                            onChange={(e) => setFormData({ ...formData, carrera: e.target.value })}
                                            className="w-full px-5 py-4 bg-slate-50 border-2 border-transparent rounded-2xl focus:bg-white focus:border-[var(--primary)]/20 transition-all outline-none text-slate-600 text-sm font-bold"
                                            required
                                        >
                                            <option value="">Carrera / Área...</option>
                                            {Object.entries(CATALOGO_UNAMIS).map(([sede, carreras]) => (
                                                <optgroup key={sede} label={sede}>
                                                    {carreras.map(c => (
                                                        <option key={c} value={c}>{c}</option>
                                                    ))}
                                                </optgroup>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                        <input 
                                            type="checkbox" 
                                            id="terms"
                                            checked={acceptedTerms}
                                            onChange={(e) => setAcceptedTerms(e.target.checked)}
                                            className="mt-1 w-4 h-4 rounded border-slate-300 text-[var(--primary)] focus:ring-[var(--primary)]" 
                                        />
                                        <label htmlFor="terms" className="text-[10px] text-slate-500 leading-relaxed font-bold uppercase tracking-tight">
                                            Certifico la veracidad de los datos y acepto el <span className="font-black text-[var(--primary)]">
                                                {formData.carrera.includes('Medicina') ? 'Res. 162/2026' : 'Reglamento General'}
                                            </span> de la UNAMIS.
                                        </label>
                                    </div>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading || (!isLogin && !acceptedTerms)}
                                className="w-full py-5 bg-[var(--primary)] text-white rounded-2xl font-bold text-sm uppercase tracking-widest hover:bg-[var(--primary-dark)] shadow-xl shadow-[var(--primary-100)] transition-all flex items-center justify-center gap-3 disabled:opacity-50 hover:-translate-y-1 active:translate-y-0"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                ) : (
                                    <>
                                        {isLogin ? 'Ingresar al Portal' : 'Finalizar Registro'} <ArrowRight size={20} />
                                    </>
                                )}
                            </button>

                            <div className="text-center pt-6">
                                <button
                                    type="button"
                                    onClick={() => setIsLogin(!isLogin)}
                                    className="text-xs font-black text-slate-400 uppercase tracking-widest hover:text-[var(--primary)] transition-colors"
                                >
                                    {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthScreen;