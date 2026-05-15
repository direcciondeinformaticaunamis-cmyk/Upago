import React from 'react';
import {
    CheckCircle2,
    Clock,
    User,
    Mail,
    Phone,
    MapPin,
    GraduationCap,
    Calendar,
    ShieldCheck,
    FileCheck
} from 'lucide-react';

interface VoucherTemplateProps {
    postulanteData: any;
    documents: any[];
    registrationCode: string;
    photo: string | null;
}

const VoucherTemplate: React.FC<VoucherTemplateProps> = ({
    postulanteData,
    documents,
    registrationCode,
    photo
}) => {
    const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const pendingDocs = documents.filter(doc => doc.status !== 'uploaded');

    return (
        <div id="voucher-to-print" className="bg-white p-12 max-w-[800px] mx-auto border-4 border-primary/20 rounded-[3rem] relative overflow-hidden font-sans text-slate-800">
            {/* Background Watermark */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none">
                <GraduationCap size={400} />
            </div>

            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-6 relative">
                <div className="flex items-start gap-4">
                    <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-primary/20">
                        U
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-slate-900 mb-1 uppercase">RECTORADO</h1>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Universidad Nacional de Misiones</p>
                        <div className="mt-2 text-[9px] font-bold text-slate-500 italic">
                            San Juan Bautista — Misiones — Paraguay
                        </div>
                    </div>
                </div>
                <div className="text-right">
                    <div className="px-3 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-black uppercase tracking-widest mb-3">
                        Resolución Nº 162/2026
                    </div>
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Registro Digital</p>
                    <p className="text-xl font-black text-primary tracking-tight">{registrationCode}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">08 / Mayo / 2026</p>
                </div>
            </div>

            <div className="mb-8 text-center bg-slate-50 py-3 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest">
                    "POR LA CUAL SE ESTABLECEN LOS REQUISITOS PARA EL EXAMEN DE ADMISIÓN"
                </p>
            </div>

            {/* Body */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative">
                {/* Left Column: Photo & Identification */}
                <div className="md:col-span-1 space-y-6">
                    <div className="w-full aspect-square bg-slate-50 rounded-3xl border-2 border-slate-100 p-2 overflow-hidden shadow-sm">
                        {photo ? (
                            <img src={photo} className="w-full h-full object-cover rounded-2xl" alt="Postulante" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-slate-200">
                                <User size={64} strokeWidth={1} />
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Identificación</p>
                        <p className="text-sm font-black text-slate-800 uppercase tabular-nums tracking-wide">{postulanteData.cedula}</p>
                    </div>
                </div>

                {/* Right Column: Data & Status */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                            {postulanteData.nombre} {postulanteData.apellido}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-primary" /> {postulanteData.correo}</span>
                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-primary" /> {postulanteData.telefono}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-primary-soft/50 rounded-3xl border border-primary/10">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">Carrera Destino</p>
                        <p className="text-base font-black text-slate-800 uppercase leading-snug">{postulanteData.carrera}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">{postulanteData.sede}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <FileCheck size={14} /> Estatus del Expediente Digital
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                    <span className="text-[10px] font-bold text-slate-600 max-w-[70%]">{doc.label}</span>
                                    {doc.status === 'verified' ? (
                                        <span className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1">
                                            <ShieldCheck size={10} /> VALIDADO
                                        </span>
                                    ) : doc.status === 'uploaded' ? (
                                        <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle2 size={10} /> RECIBIDO
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} /> PENDIENTE
                                        </span>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-10 border-t-2 border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                <div className="text-[10px] font-medium text-slate-400 leading-relaxed italic">
                    <p>Este comprobante certifica la pre-inscripción digital del postulante. La matriculación definitiva está sujeta a la verificación física de los documentos originales en ventanilla académica según el calendario establecido.</p>
                </div>
                <div className="flex flex-col items-center md:items-end justify-center">
                    <div className="p-2 bg-white border-2 border-slate-100 rounded-2xl shadow-sm mb-2">
                        <img 
                            src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://unamis.edu.py/verificar/${registrationCode}`} 
                            alt="QR de Verificación" 
                            className="w-16 h-16"
                        />
                    </div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.3em]">Validación QR Institucional</p>
                </div>
            </div>

            {/* Signatures Area */}
            <div className="mt-16 grid grid-cols-2 gap-20">
                <div className="text-center">
                    <div className="border-t border-slate-300 pt-4">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">SECRETARIO GENERAL</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">UNAMIS • Rectorado</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-slate-300 pt-4">
                        <p className="text-[10px] font-black text-slate-800 uppercase tracking-widest mb-1">RECTOR</p>
                        <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tighter">UNAMIS • Rectorado</p>
                    </div>
                </div>
            </div>

            <div className="mt-12 text-center">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.4em]">DOCUMENTO VINCULADO A RESOLUCIÓN Nº 162/2026</p>
            </div>
        </div>
    );
};

// Simple standalone version for printing
export const generateVoucherHTML = (postulanteData: any, documents: any[], registrationCode: string, photo: string | null) => {
    // In a real app we might use a library, but for a clean "Crimson" look 1:1, 
    // we can use a string-based template that mirrors the component if needed, 
    // or just use window.print on the component if it's mounted.
    // However, to make it work from a button in a portal, we can create a temporary window.

    const today = new Date().toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });

    const docListHtml = documents.map(doc => `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border: 1px solid #f1f5f9; border-radius: 10px; margin-bottom: 6px;">
            <span style="font-size: 10px; font-weight: 700; color: #475569; max-width: 70%;">${doc.label}</span>
            <span style="font-size: 8px; font-weight: 900; color: ${doc.status === 'verified' ? '#991b1b' : doc.status === 'uploaded' ? '#10b981' : '#f59e0b'}; text-transform: uppercase; letter-spacing: 1px;">
                ${doc.status === 'verified' ? 'VALIDADO' : doc.status === 'uploaded' ? 'RECIBIDO' : 'PENDIENTE'}
            </span>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Resolución 162/2026 - ${postulanteData.cedula}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; background: #fff; margin: 0; padding: 20px; }
                .voucher { background: white; max-width: 800px; margin: 0 auto; padding: 40px; border: 1px solid #eee; position: relative; }
                .header { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 20px; }
                .logo-area { display: flex; align-items: center; gap: 15px; }
                .logo-u { width: 50px; height: 50px; background: #991b1b; color: white; display: flex; align-items: center; justify-content: center; font-weight: 900; font-size: 24px; border-radius: 12px; }
                h1 { font-size: 24px; font-weight: 900; margin: 0; letter-spacing: -1px; color: #1e293b; }
                .res-box { background: #1e293b; color: white; padding: 5px 12px; border-radius: 6px; font-size: 10px; font-weight: 900; display: inline-block; margin-bottom: 10px; }
                .main-grid { display: flex; gap: 30px; margin-top: 20px; }
                .left-col { flex: 0 0 140px; }
                .right-col { flex: 1; }
                .photo-box { width: 140px; height: 140px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 20px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
                .info-banner { background: #f8fafc; padding: 15px; border-radius: 15px; margin-top: 15px; border: 1px solid #f1f5f9; }
                .phase-box { background: #fee2e2; padding: 20px; border-radius: 20px; margin-bottom: 20px; }
                .signatures { display: flex; justify-content: space-between; margin-top: 60px; gap: 60px; }
                .sig-box { flex: 1; text-align: center; border-top: 1px solid #cbd5e1; pt: 15px; }
                @media print {
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="voucher">
                <div class="header">
                    <div class="logo-area">
                        <div class="logo-u">U</div>
                        <div>
                            <h1>RECTORADO</h1>
                            <p style="font-size: 10px; color: #64748b; font-weight: 700; margin: 2px 0 0 0; text-transform: uppercase;">Universidad Nacional de Misiones</p>
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="res-box">Resolución Nº 162/2026</div>
                        <p style="font-size: 18px; font-weight: 900; color: #991b1b; margin: 0;">${registrationCode}</p>
                        <p style="font-size: 9px; color: #94a3b8; margin: 5px 0 0 0;">Fecha Emisión: ${today}</p>
                    </div>
                </div>

                <div style="text-align: center; background: #f8fafc; padding: 10px; border-radius: 10px; margin-bottom: 20px; border: 1px solid #f1f5f9;">
                    <p style="font-size: 9px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                        REQUISITOS PARA EL EXAMEN DE ADMISIÓN - CARRERA DE MEDICINA
                    </p>
                </div>

                <div class="main-grid">
                    <div class="left-col">
                        <div class="photo-box">
                            ${photo ? `<img src="${photo}" style="width:100%; height:100%; object-fit:cover;">` : `<span style="font-size:40px;">👤</span>`}
                        </div>
                        <div class="info-banner">
                            <p style="font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0 0 4px 0;">Cédula Identidad</p>
                            <p style="font-size: 14px; font-weight: 900; color: #1e293b; margin: 0;">${postulanteData.cedula}</p>
                        </div>
                    </div>
                    <div class="right-col">
                        <h2 style="font-size: 22px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase;">${postulanteData.nombre} ${postulanteData.apellido}</h2>
                        <p style="font-size: 10px; color: #64748b; font-weight: 700; margin: 4px 0 20px 0;">${postulanteData.correo} • ${postulanteData.telefono}</p>
                        
                        <div class="phase-box">
                            <p style="font-size: 8px; font-weight: 900; color: #991b1b; text-transform: uppercase; margin: 0 0 5px 0;">Programa Académico</p>
                            <p style="font-size: 16px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase;">${postulanteData.carrera}</p>
                            <p style="font-size: 10px; color: #991b1b; font-weight: 700; margin: 5px 0 0 0; text-transform: uppercase;">${postulanteData.sede}</p>
                        </div>

                        <div style="font-size: 10px; font-weight: 900; color: #1e293b; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;">Estatus del Expediente Digital</div>
                        ${docListHtml}
                    </div>
                </div>

                <div class="signatures">
                    <div class="sig-box">
                        <p style="font-size: 10px; font-weight: 900; color: #1e293b; margin-top: 15px; text-transform: uppercase;">Secretario General</p>
                        <p style="font-size: 8px; color: #94a3b8; font-weight: 700;">UNAMIS • Rectorado</p>
                    </div>
                    <div class="sig-box">
                        <p style="font-size: 10px; font-weight: 900; color: #1e293b; margin-top: 15px; text-transform: uppercase;">Rector</p>
                        <p style="font-size: 8px; color: #94a3b8; font-weight: 700;">UNAMIS • Rectorado</p>
                    </div>
                </div>

                <div style="margin-top: 40px; display: flex; justify-content: space-between; align-items: flex-end; border-top: 1px solid #f1f5f9; pt: 20px;">
                    <div style="max-width: 60%; font-size: 9px; color: #94a3b8; font-style: italic; line-height: 1.5;">
                        Este documento certifica la recepción digital de los documentos según Resol. 162/2026. La validez legal definitiva se obtiene con la verificación física y firma de las autoridades.
                    </div>
                    <div style="text-align: right;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://unamis.edu.py/verificar/${registrationCode}" style="width: 60px; height: 60px;">
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 20px;" class="no-print">
                <button onclick="window.print()" style="background: #991b1b; color: white; border: none; padding: 12px 30px; border-radius: 12px; font-weight: 900; cursor: pointer; text-transform: uppercase; font-size: 12px;">Imprimir / Guardar PDF</button>
            </div>
        </body>
        </html>
    `;
};

export default VoucherTemplate;
