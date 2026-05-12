import React, { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    FileText,
    Calendar,
    User,
    MapPin,
    ChevronRight,
    ExternalLink,
    Tag
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AdvancedSearch = ({ onViewDetail }: { onViewDetail: (id: number) => void }) => {
    const [projects, setProjects] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filters, setFilters] = useState({
        tipo: 'all',
        sede: 'all',
        anio: 'all'
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await fetch('api-banco.php?action=get_projects', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
                }
            });
            const data = await res.json();
            setProjects(data);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesSearch = p.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.resumen.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTipo = filters.tipo === 'all' || p.tipo_proyecto === filters.tipo;
        const matchesSede = filters.sede === 'all' || p.sede === filters.sede;

        return matchesSearch && matchesTipo && matchesSede;
    });

    return (
        <div className="p-8 space-y-8">
            {/* Search Header */}
            <div className="bg-slate-50 border border-slate-100 p-8 rounded-[3rem] space-y-6">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar por título, resumen o palabras clave..."
                        className="w-full pl-16 pr-8 py-5 bg-white border border-slate-200 rounded-3xl outline-none focus:ring-4 focus:ring-primary/10 transition-all font-bold text-slate-700"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                        <Filter size={14} className="text-slate-400" />
                        <select
                            className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-600"
                            value={filters.tipo}
                            onChange={(e) => setFilters(prev => ({ ...prev, tipo: e.target.value }))}
                        >
                            <option value="all">TODOS LOS TIPOS</option>
                            <option value="investigacion">Investigación</option>
                            <option value="extension">Extensión</option>
                            <option value="tesis">Tesis</option>
                        </select>
                    </div>

                    <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl">
                        <MapPin size={14} className="text-slate-400" />
                        <select
                            className="bg-transparent text-[11px] font-black uppercase outline-none text-slate-600"
                            value={filters.sede}
                            onChange={(e) => setFilters(prev => ({ ...prev, sede: e.target.value }))}
                        >
                            <option value="all">TODAS LAS SEDES</option>
                            <option value="Santa Rosa de Lima">Santa Rosa</option>
                            <option value="Encarnación">Encarnación</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence>
                    {filteredProjects.map((project, idx) => (
                        <motion.div
                            key={project.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: idx * 0.05 }}
                            className="group bg-white border border-slate-100 p-6 rounded-[2.5rem] hover:shadow-2xl hover:shadow-slate-200 transition-all flex flex-col relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:scale-110 transition-transform duration-500" />

                            <div className="flex items-start justify-between mb-4 relative">
                                <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${project.tipo_proyecto === 'investigacion' ? 'bg-indigo-50 text-indigo-600' : 'bg-emerald-50 text-emerald-600'
                                    }`}>
                                    {project.tipo_proyecto}
                                </span>
                                <span className="text-[10px] font-bold text-slate-400">{project.anio_academico}</span>
                            </div>

                            <h3 className="text-base font-black text-slate-900 leading-tight mb-3 group-hover:text-primary transition-colors line-clamp-2">
                                {project.titulo}
                            </h3>

                            <p className="text-xs text-slate-500 line-clamp-3 mb-6 flex-1 font-medium leading-relaxed">
                                {project.resumen}
                            </p>

                            <div className="flex items-center justify-between pt-6 border-t border-slate-50 relative mt-auto">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                                        <User size={14} />
                                    </div>
                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ver Detalles</span>
                                </div>
                                <button
                                    onClick={() => onViewDetail(project.id)}
                                    className="w-10 h-10 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all shadow-sm"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {filteredProjects.length === 0 && !loading && (
                    <div className="col-span-full py-20 text-center space-y-4">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300">
                            <Search size={32} />
                        </div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No se encontraron proyectos</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdvancedSearch;
