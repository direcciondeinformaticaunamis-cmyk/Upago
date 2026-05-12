import React from 'react';
import {
    ArrowLeft,
    Calendar,
    Users,
    FileText,
    Share2,
    Download,
    Clock,
    ShieldCheck,
    ExternalLink,
    Quote,
    Hash,
    Layers,
    Copy,
    Check,
    MessageCircle,
    Send,
    FileCheck
} from 'lucide-react';
import { motion } from 'framer-motion';

interface Member {
    id: number;
    nombre_completo: string;
    rol_en_proyecto: string;
    correo?: string;
}

interface Version {
    id: number;
    version: string;
    cambios: string;
    fecha_subida: string;
    archivo_url: string;
}

interface ProjectDetailProps {
    id: number;
    onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ id, onBack }) => {
    const [project, setProject] = React.useState<any>(null);
    const [loading, setLoading] = React.useState(true);
    const [copied, setCopied] = React.useState<string | null>(null);
    const [newComment, setNewComment] = React.useState('');
    const [comments, setComments] = React.useState<any[]>([]);

    React.useEffect(() => {
        fetch(`api-banco.php?action=get_project_detail&id=${id}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
            }
        })
            .then(res => res.json())
            .then(data => {
                setProject(data);
                setComments(data.comentarios || []);
                setLoading(false);
            })
            .catch(err => console.error(err));
    }, [id]);

    const handleAddComment = () => {
        if (!newComment.trim()) return;

        fetch('api-banco.php?action=add_comment', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
            },
            body: JSON.stringify({
                proyecto_id: id,
                comentario: newComment
            })
        })
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    setComments(prev => [{
                        id: Date.now(),
                        usuario: 'Usuario Actual',
                        comentario: newComment,
                        fecha: 'Ahora mismo'
                    }, ...prev]);
                    setNewComment('');
                }
            });
    };

    const copyToClipboard = (text: string, type: string) => {
        navigator.clipboard.writeText(text);
        setCopied(type);
        setTimeout(() => setCopied(null), 2000);
    };

    if (loading) return <div className="p-20 text-center font-bold text-slate-400">Cargando detalles...</div>;
    if (!project) return <div className="p-20 text-center font-bold text-red-400">Proyecto no encontrado.</div>;

    return (
        <div className="p-8 space-y-8 max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button onClick={onBack} className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-primary transition-colors">
                    <ArrowLeft size={16} /> Volver al listado
                </button>
                <div className="flex items-center gap-3">
                    <button className="p-3 bg-slate-50 rounded-xl text-slate-400 hover:bg-primary-soft hover:text-primary transition-all">
                        <Share2 size={18} />
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
                        <Download size={16} /> Exportar Ficha
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32" />

                        <div className="flex items-center gap-4 mb-6 relative">
                            <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                {project.tipo_proyecto}
                            </span>
                            <span className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${project.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                {project.estado}
                            </span>
                        </div>

                        <h1 className="text-3xl font-black text-slate-900 leading-tight mb-6 relative">
                            {project.titulo}
                        </h1>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10 relative">
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Código Único</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Hash size={12} /> {project.codigo_unico}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Año</p>
                                <p className="text-xs font-bold text-slate-700 flex items-center gap-2"><Calendar size={12} /> {project.anio_academico}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sede</p>
                                <p className="text-xs font-bold text-slate-700">{project.sede}</p>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">DOI</p>
                                <p className="text-xs font-bold text-primary flex items-center gap-2">
                                    {project.doi || 'Pendiente'} {project.doi && <ExternalLink size={10} />}
                                </p>
                            </div>
                        </div>

                        {project.archivo_resolucion_url && (
                            <div className="mb-10 p-6 bg-primary/5 rounded-[2.5rem] border border-primary/10 flex items-center justify-between group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-primary shadow-sm group-hover:bg-primary group-hover:text-white transition-all">
                                        <FileCheck size={24} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Resolución Oficial</p>
                                        <p className="text-xs font-bold text-slate-700 mt-0.5">N° {project.resolucion_nro || 'S/N'}</p>
                                    </div>
                                </div>
                                <a
                                    href={project.archivo_resolucion_url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-6 py-3 bg-white hover:bg-primary hover:text-white rounded-xl text-[9px] font-black uppercase tracking-widest border border-slate-100 shadow-sm transition-all"
                                >
                                    Ver Documento
                                </a>
                            </div>
                        )}

                        <div className="space-y-4 relative">
                            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <FileText size={16} className="text-primary" /> Resumen del Proyecto
                            </h3>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed text-justify bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                                {project.resumen}
                            </p>
                        </div>
                    </div>

                    {/* Citations Card */}
                    <div className="bg-slate-900 text-white p-10 rounded-[3rem] shadow-xl relative overflow-hidden group">
                        <Quote className="absolute top-8 right-8 text-white/5" size={100} />

                        <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-8">Citas Académicas</h3>

                        <div className="space-y-8">
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-primary">Formato APA (7ma Ed.)</span>
                                    <button
                                        onClick={() => copyToClipboard(project.cita_apa, 'apa')}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        {copied === 'apa' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 text-xs font-medium italic leading-relaxed">
                                    {project.cita_apa}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Formato BibTeX</span>
                                    <button
                                        onClick={() => copyToClipboard(project.cita_bibtex, 'bibtex')}
                                        className="text-white/40 hover:text-white transition-colors"
                                    >
                                        {copied === 'bibtex' ? <Check size={16} className="text-emerald-400" /> : <Copy size={16} />}
                                    </button>
                                </div>
                                <pre className="p-4 bg-slate-800 rounded-2xl border border-white/5 text-[10px] font-mono text-slate-300 overflow-x-auto">
                                    {project.cita_bibtex}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Comments Section */}
                    <div className="bg-white border border-slate-100 p-10 rounded-[3rem] shadow-sm space-y-8">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                            <MessageCircle size={16} className="text-primary" /> Observaciones y Comentarios
                        </h3>

                        <div className="space-y-6">
                            {comments.map(c => (
                                <div key={c.id} className="bg-slate-50 p-6 rounded-[2rem] border border-slate-100/50">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Posteado por Usuario</span>
                                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(c.fecha).toLocaleString()}</span>
                                    </div>
                                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{c.comentario}</p>
                                </div>
                            ))}
                        </div>

                        <div className="relative">
                            <textarea
                                className="w-full p-6 bg-slate-50 border border-slate-200 rounded-[2rem] outline-none font-medium text-slate-600 min-h-[100px] focus:ring-4 focus:ring-primary/5 transition-all"
                                placeholder="Escribir una observación..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                            />
                            <button
                                onClick={handleAddComment}
                                className="absolute bottom-4 right-4 w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    {/* Members List */}
                    <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Users size={16} className="text-primary" /> Equipo del Proyecto
                        </h3>
                        <div className="space-y-6">
                            {(project.miembros || []).map((mbr: Member) => (
                                <div key={mbr.id} className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400 font-black text-[10px]">
                                        {mbr.nombre_completo.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <p className="text-[11px] font-black text-slate-800 leading-tight">{mbr.nombre_completo}</p>
                                        <p className="text-[9px] font-bold text-primary uppercase tracking-widest mt-0.5">{mbr.rol_en_proyecto}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Version history */}
                    <div className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm">
                        <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                            <Layers size={16} className="text-indigo-500" /> Control de Cambios
                        </h3>
                        <div className="space-y-6">
                            {(project.versiones && project.versiones.length > 0) ? project.versiones.map((v: Version) => (
                                <div key={v.id} className="relative pl-6 border-l-2 border-slate-100 pb-1 last:pb-0">
                                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-primary" />
                                    <p className="text-[10px] font-black text-slate-800 mb-1 flex items-center justify-between">
                                        Versión {v.version}
                                        <span className="text-slate-400 opacity-60 font-bold">{new Date(v.fecha_subida).toLocaleDateString()}</span>
                                    </p>
                                    <p className="text-[10px] font-medium text-slate-500 line-clamp-2">{v.cambios}</p>
                                </div>
                            )) : (
                                <div className="text-center py-6">
                                    <Clock className="mx-auto text-slate-200 mb-2" size={24} />
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sin historial de cambios</p>
                                </div>
                            )}
                        </div>
                        <button className="w-full mt-6 py-3 border border-slate-100 rounded-xl text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] hover:bg-slate-50 transition-all">
                            Nueva Versión
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProjectDetail;
