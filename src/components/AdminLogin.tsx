import React, { useState } from 'react';
import { ShieldCheck, Lock, Sparkles } from 'lucide-react';
import AppInput from './ui/AppInput';
import AppButton from './ui/AppButton';

interface AdminLoginProps {
    onLogin: (user: string, pass: string) => void;
    error?: string;
}

const AdminLogin: React.FC<AdminLoginProps> = ({ onLogin, error }) => {
    const [user, setUser] = useState('');
    const [pass, setPass] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onLogin(user, pass);
    };

    return (
        <div className="min-h-[60vh] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-[420px] p-10 md:p-14 rounded-[2.5rem] border border-slate-200 shadow-premium relative overflow-hidden group">
                {/* Decorative Elements */}
                <div className="absolute -top-24 -right-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors duration-1000" />
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-slate-100 rounded-full blur-3xl" />

                <div className="relative z-10">
                    <div className="flex flex-col items-center mb-10 text-center">
                        <div className="w-16 h-16 bg-primary-soft rounded-2xl flex items-center justify-center text-primary mb-6 shadow-sm border border-primary/5">
                            <Lock size={32} strokeWidth={1.5} />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
                            Acceso Institucional
                        </h2>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-2">Portal Administrativo UNAMIS</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        <AppInput
                            label="Nombre de Usuario"
                            type="text"
                            value={user}
                            onChange={(e) => setUser(e.target.value)}
                            placeholder="usuario@dominio.com"
                            required
                        />

                        <AppInput
                            label="Contraseña"
                            type="password"
                            value={pass}
                            onChange={(e) => setPass(e.target.value)}
                            placeholder="••••••••"
                            required
                        />

                        {error && (
                            <div className="p-4 bg-danger-soft border border-danger/10 rounded-2xl text-[10px] font-bold text-danger text-center uppercase tracking-wider animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <AppButton type="submit" fullWidth size="lg">
                            Ingresar al Sistema
                        </AppButton>
                    </form>

                    <div className="mt-12 text-center">
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            <ShieldCheck size={14} className="text-success" /> Conexión segura SSL
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLogin;
