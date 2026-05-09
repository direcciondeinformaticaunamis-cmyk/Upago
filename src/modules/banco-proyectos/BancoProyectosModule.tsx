import React, { useState, useEffect } from 'react';
import {
    LayoutDashboard,
    PlusCircle,
    Search,
    FileText,
    BarChart3,
    Settings,
    ChevronRight,
    BrainCircuit,
    Layers,
    MessageSquare,
    CheckCircle2,
    Award
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Components
import StatsDashboard from './components/StatsDashboard';
import RegistrationForm from './components/RegistrationForm';
import AdvancedSearch from './components/AdvancedSearch';
import ProjectDetail from './components/ProjectDetail';
import ProjectEvaluation from './components/ProjectEvaluation';

const EvaluationsPlaceholder = () => <div className="p-8 text-center py-20">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
        <Award size={40} />
    </div>
    <h3 className="text-sm font-black text-slate-900 uppercase tracking-[0.2em]">Módulo de Evaluaciones</h3>
    <p className="text-xs text-slate-400 mt-2 font-medium">Las rúbricas digitales estarán disponibles próximamente.</p>
</div>;

const BancoProyectosModule: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'registration' | 'search' | 'evaluations'>('dashboard');
    const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

    const tabs = [
        { id: 'dashboard', label: 'Estadísticas', icon: LayoutDashboard },
        { id: 'registration', label: 'Nuevo Proyecto', icon: PlusCircle },
        { id: 'search', label: 'Buscador', icon: Search },
        { id: 'evaluations', label: 'Evaluaciones', icon: CheckCircle2 },
    ];

    return (
        <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-200/50 overflow-hidden min-h-[80vh] flex flex-col">
            {/* Header / Sub-navigation */}
            <div className="px-8 pt-8 pb-4 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                        <BrainCircuit className="text-primary" size={28} />
                        Banco de Proyectos
                    </h2>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Gestión Científica y Académica</p>
                </div>

                <nav className="flex items-center p-1 bg-slate-200/50 rounded-2xl">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => {
                                setActiveTab(tab.id as any);
                                setSelectedProjectId(null);
                            }}
                            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all duration-300 ${activeTab === tab.id && !selectedProjectId
                                ? 'bg-white text-primary shadow-sm'
                                : 'text-slate-500 hover:text-slate-800'
                                }`}
                        >
                            <tab.icon size={16} />
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        {selectedProjectId ? (
                            <ProjectDetail id={selectedProjectId} onBack={() => setSelectedProjectId(null)} />
                        ) : (
                            <>
                                {activeTab === 'dashboard' && <StatsDashboard />}
                                {activeTab === 'registration' && <RegistrationForm />}
                                {activeTab === 'search' && <AdvancedSearch onViewDetail={setSelectedProjectId} />}
                                {activeTab === 'evaluations' && <ProjectEvaluation />}
                            </>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer Status */}
            <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    <span className="flex items-center gap-1.5"><Layers size={12} /> Sync: Online</span>
                    <span className="flex items-center gap-1.5"><MessageSquare size={12} /> 0 Comentarios Pendientes</span>
                </div>
                <div className="text-[10px] font-bold text-primary active:scale-95 transition-transform cursor-pointer">
                    MANUAL DE USUARIO
                </div>
            </div>
        </div>
    );
};

export default BancoProyectosModule;
