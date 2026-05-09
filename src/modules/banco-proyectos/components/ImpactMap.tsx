import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, Info } from 'lucide-react';

const ImpactMap = () => {
    // Definimos las coordenadas (simuladas) para las sedes de UNAMIS
    const SEDES = [
        { id: 'sr', name: 'Santa Rosa de Lima', x: '180', y: '220', total: 45, color: 'bg-primary' },
        { id: 'enc', name: 'Encarnación', x: '210', y: '320', total: 32, color: 'bg-indigo-500' },
        { id: 'pos', name: 'Posadas', x: '240', y: '330', total: 18, color: 'bg-emerald-500' },
        { id: 'asu', name: 'Asunción', x: '120', y: '180', total: 24, color: 'bg-amber-500' }
    ];

    return (
        <div className="relative w-full h-[400px] bg-slate-900 rounded-[3rem] p-10 overflow-hidden group shadow-2xl shadow-slate-200">
            {/* Background Texture */}
            <div className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />

            <div className="relative z-10 flex flex-col md:flex-row h-full gap-10">
                <div className="flex-1">
                    <h3 className="text-[11px] font-black text-white/50 uppercase tracking-[0.2em] mb-4">Mapa de Impacto Académico</h3>
                    <h2 className="text-3xl font-black text-white mb-6 leading-tight">Presencia Científica<br /><span className="text-primary">Regional</span></h2>

                    <div className="space-y-4 max-w-xs">
                        {SEDES.map(s => (
                            <div key={s.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all group">
                                <div className="flex items-center gap-3">
                                    <div className={`w-2 h-2 rounded-full ${s.color}`} />
                                    <span className="text-xs font-bold text-white/80">{s.name}</span>
                                </div>
                                <span className="text-xs font-black text-white">{s.total} <span className="text-[10px] opacity-40">PROY</span></span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex-1 relative flex items-center justify-center">
                    {/* Simulated Map SVG */}
                    <svg viewBox="0 0 400 400" className="w-full h-full max-w-[350px] text-white/10">
                        <path
                            d="M100,150 L150,120 L200,100 L250,120 L300,150 L320,200 L300,250 L250,300 L200,320 L150,300 L100,250 L80,200 Z"
                            fill="currentColor"
                            className="drop-shadow-[0_0_50px_rgba(255,255,255,0.05)]"
                        />
                        {/* Connecting Lines */}
                        <line x1="180" y1="220" x2="210" y2="320" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
                        <line x1="180" y1="220" x2="120" y2="180" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />

                        {/* Pips */}
                        {SEDES.map(s => (
                            <g key={s.id} className="cursor-pointer">
                                <circle
                                    cx={s.x} cy={s.y} r="8"
                                    className={`${s.color.replace('bg-', 'fill-')} opacity-20 group-hover:opacity-40 transition-all`}
                                />
                                <circle
                                    cx={s.x} cy={s.y} r="4"
                                    className={`${s.color.replace('bg-', 'fill-')} shadow-lg`}
                                />
                            </g>
                        ))}
                    </svg>

                    <div className="absolute bottom-4 right-4 p-4 bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 border-white/5 flex items-center gap-3 text-white/60">
                        <MapPin size={16} className="text-primary" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Lat: -26.98 / Long: -54.78</span>
                    </div>
                </div>
            </div>

            <div className="absolute top-8 right-8 text-white/10 group-hover:text-primary/20 transition-colors">
                <Info size={40} />
            </div>
        </div>
    );
};

export default ImpactMap;
