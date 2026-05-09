import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, Database, BarChart3, Info, LogOut, Settings2 } from 'lucide-react';
import StudentPaymentDashboard from './StudentPaymentDashboard';
import PaymentRegistrationForm from './PaymentRegistrationForm';
import OfficialReceipt from './OfficialReceipt';
import AdminFinanceDashboard from './AdminFinanceDashboard';


import BankReconciliation from './BankReconciliation';
import FinancialReports from './FinancialReports';
import ArancelesConfig from './ArancelesConfig';

type ArancelesView = 
    | 'student-dashboard' 
    | 'student-form' 
    | 'student-receipt' 
    | 'admin-dashboard' 
    | 'admin-register' 
    | 'admin-reconcile' 
    | 'admin-reports' 
    | 'admin-receipt'
    | 'admin-config';

interface Props {
    mode: 'student' | 'admin';
    studentData?: {
        nombre: string;
        cedula: string;
        carrera: string;
    };
}

const ArancelesModule: React.FC<Props> = ({ mode, studentData }) => {
    const [currentView, setCurrentView] = useState<ArancelesView>(
        mode === 'student' ? 'student-dashboard' : 'admin-dashboard'
    );

    const handleNavigate = (view: ArancelesView) => {
        setCurrentView(view);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    if (mode === 'admin') {
        return (
            <div className="flex min-h-screen bg-slate-50/50 -m-6 md:-m-10">
                {/* Sidebar Administrativa */}
                <aside className="w-80 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-50">
                    <div className="p-8 border-b border-slate-100 mb-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
                                <Database size={20} />
                            </div>
                            <div>
                                <h1 className="text-sm font-black text-slate-900 tracking-tighter uppercase leading-none mb-1">Gestión de Aranceles</h1>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Administración Central</p>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-4 space-y-2">
                        {[
                            { id: 'admin-dashboard', label: 'Dashboard', icon: LayoutDashboard },
                            { id: 'admin-register', label: 'Registro de Pago', icon: Wallet },
                            { id: 'admin-reconcile', label: 'Conciliación', icon: Database },
                            { id: 'admin-reports', label: 'Reportes', icon: BarChart3 },
                            { id: 'admin-receipt', label: 'Facturas', icon: Wallet },
                            { id: 'admin-config', label: 'Configuración', icon: Settings2 },
                        ].map((item) => (
                            <button
                                key={item.id}
                                onClick={() => handleNavigate(item.id as ArancelesView)}
                                className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                                    currentView === item.id 
                                        ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                                        : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
                                }`}
                            >
                                <item.icon size={18} strokeWidth={currentView === item.id ? 2.5 : 2} />
                                {item.label}
                            </button>
                        ))}
                    </nav>

                    <div className="p-8 space-y-4 border-t border-slate-100 mt-auto">
                        <button className="w-full flex items-center gap-4 px-6 py-3 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-primary transition-colors">
                            <Info size={18} /> Ayuda
                        </button>
                        <button className="w-full flex items-center gap-4 px-6 py-3 text-xs font-black text-danger uppercase tracking-widest hover:bg-danger-soft rounded-2xl transition-all">
                            <LogOut size={18} /> Cerrar Sesión
                        </button>
                    </div>
                </aside>

                {/* Main Content Area */}
                <main className="flex-1 ml-80 p-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            {currentView === 'admin-dashboard' && <AdminFinanceDashboard />}
                            {currentView === 'admin-register' && (
                                <PaymentRegistrationForm mode="admin" onSuccess={() => handleNavigate('admin-dashboard')} onBack={() => handleNavigate('admin-dashboard')} />
                            )}
                            {currentView === 'admin-reconcile' && (
                                <BankReconciliation />
                            )}
                            {currentView === 'admin-reports' && (
                                <FinancialReports />
                            )}
                            {currentView === 'admin-receipt' && (
                                <OfficialReceipt onClose={() => handleNavigate('admin-dashboard')} />
                            )}
                            {currentView === 'admin-config' && (
                                <ArancelesConfig />
                            )}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        );
    }


    return (
        <div className="w-full">
            {currentView === 'student-dashboard' && (
                <StudentPaymentDashboard 
                    studentName={studentData?.nombre}
                    carrera={studentData?.carrera}
                    onNavigateUpload={() => handleNavigate('student-form')}
                />
            )}

            {currentView === 'student-form' && (
                <PaymentRegistrationForm 
                    studentName={studentData?.nombre}
                    studentCedula={studentData?.cedula}
                    onSuccess={() => handleNavigate('student-dashboard')}
                />
            )}

            {currentView === 'student-receipt' && (
                <OfficialReceipt 
                    onClose={() => handleNavigate('student-dashboard')}
                />
            )}
        </div>
    );
};

export default ArancelesModule;
