import React, { useState, useEffect } from 'react';
import {
    CheckCircle2,
    Clock,
    AlertCircle,
    ChevronRight,
    Star,
    Save,
    FileText,
    ArrowLeft
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CRITERIOS = [
    { id: 'originalidad', label: 'Originalidad e Innovación', weight: 0.3 },
    { id: 'metodologia', label: 'Rigor Metodológico', weight: 0.3 },
    { id: 'impacto', label: 'Impacto Social/Académico', weight: 0.2 },
    { id: 'factibilidad', label: 'Factibilidad y Recursos', weight: 0.2 },
];

const ProjectEvaluation = () => {
    const [pendingProjects, setPendingProjects] = useState<any[]>([]);
    const [selectedProject, setSelectedProject] = useState<any>(null);
    const [scores, setScores] = useState<Record<string, number>>({});
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('api-banco.php?action=get_projects')
            .then(res => res.json())
            .then(data => {
                // Filter for projects in 'en_revision' or 'borrador' for demo
                setPendingProjects(data);
                setLoading(false);
            });
    }, []);

    const handleScore = (cid: string, val: number) => {
        setScores(prev => ({ ...prev, [cid]: val }));
    };

    const totalScore = CRITERIOS.reduce((acc, c) => {
        return acc + (scores[c.id] || 0) * 10; // Scale to 0-100
    }, 0) / CRITERIOS.length;

    const submitEvaluation = () => {
        fetch('api-banco.php?action=save_evaluation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                proyecto_id: selectedProject.id,
                puntaje: totalScore,
                observaciones: comment
            })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    alert(`Evaluación enviada con éxito. Puntaje final: ${totalScore.toFixed(1)}/10. El estado del proyecto ha sido actualizado.`);
                    setSelectedProject(null);
                    setComment('');
                    setScores({});
                    // Reload projects
                    setLoading(true);
                    fetch('api-banco.php?action=get_projects')
                        .then(r => r.json())
                        .then(d => { setPendingProjects(d); setLoading(false); });
                }
            });
    };

    if (selectedProject) {
        return (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="p-8 space-y-8 max-w-4xl mx-auto">
                <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest hover:text-primary">
                    <ArrowLeft size={16} /> Volver
                </button>

                <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm">
                    <h2 className="text-2xl font-black text-slate-900 mb-2">{selectedProject.titulo}</h2>
                    <p className="text-[10px] font-bold text-slate-400 mb-10 uppercase tracking-wider">Rúbrica de Evaluación Académica</p>

                    <div className="space-y-8">
                        {CRITERIOS.map(c => (
                            <div key={c.id} className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <label className="text-xs font-black text-slate-700 uppercase tracking-widest">{c.label}</label>
                                    <span className="text-xs font-bold text-primary">{scores[c.id] || 0}/10</span>
                                </div>
                                <div className="flex gap-2">
                                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(v => (
                                        <button
                                            key={v}
                                            onClick={() => handleScore(c.id, v)}
                                            className={`flex-1 h-10 rounded-xl font-bold text-xs transition-all ${scores[c.id] >= v ? 'bg-primary text-white' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                                                }`}
                                        >
                                            {v}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        <div className="pt-8 space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Observaciones Generales</label>
                            <textarea
                                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-medium text-slate-600 min-h-[120px]"
                                placeholder="Añada comentarios específicos para el equipo de investigación..."
                                value={comment}
                                onChange={(e) => setComment(e.target.value)}
                            />
                        </div>

                        <div className="pt-8 border-t border-slate-50 flex items-center justify-between">
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Puntaje Final</p>
                                <p className="text-3xl font-black text-primary">{totalScore.toFixed(1)} <span className="text-lg opacity-40">/ 10</span></p>
                            </div>
                            <button onClick={submitEvaluation} className="flex items-center gap-3 px-10 py-5 bg-emerald-500 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
                                <Save size={18} /> Finalizar Evaluación
                            </button>
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    }

    return (
        <div className="p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AnimatePresence>
                    {pendingProjects.map((p, idx) => (
                        <motion.div
                            key={p.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.05 }}
                            onClick={() => setSelectedProject(p)}
                            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] hover:shadow-xl hover:shadow-slate-200 transition-all cursor-pointer group flex items-center justify-between"
                        >
                            <div className="space-y-2 flex-1 pr-6">
                                <div className="flex items-center gap-3">
                                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Pendiente de Evaluación</span>
                                </div>
                                <h3 className="text-sm font-black text-slate-800 leading-tight group-hover:text-primary transition-colors">{p.titulo}</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{p.sede} • {p.tipo_proyecto}</p>
                            </div>
                            <button className="w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm">
                                <Star size={20} />
                            </button>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {pendingProjects.length === 0 && !loading && (
                <div className="py-20 text-center">
                    <CheckCircle2 size={48} className="mx-auto text-emerald-100 mb-4" />
                    <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No hay proyectos pendientes de evaluación</p>
                </div>
            )}
        </div>
    );
};

export default ProjectEvaluation;
