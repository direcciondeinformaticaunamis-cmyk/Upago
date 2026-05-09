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
    studentData: any;
    documents: any[];
    registrationCode: string;
    photo: string | null;
}

const VoucherTemplate: React.FC<VoucherTemplateProps> = ({
    studentData,
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
            <div className="flex justify-between items-start border-b-2 border-slate-100 pb-8 mb-10 relative">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-primary mb-1 uppercase">UNAMIS</h1>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Universidad Nacional de Misiones</p>
                    <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-success-soft text-success rounded-lg text-[10px] font-black uppercase tracking-widest border border-success/10">
                        <ShieldCheck size={12} /> Comprobante Oficial de Registro
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1">Código de Trámite</p>
                    <p className="text-xl font-black text-primary tracking-tight">{registrationCode}</p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase italic">{today}</p>
                </div>
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
                        <p className="text-sm font-black text-slate-800 uppercase tabular-nums tracking-wide">{studentData.cedula}</p>
                    </div>
                </div>

                {/* Right Column: Data & Status */}
                <div className="md:col-span-2 space-y-8">
                    <div>
                        <h2 className="text-2xl font-black text-slate-900 tracking-tighter uppercase mb-2">
                            {studentData.nombre} {studentData.apellido}
                        </h2>
                        <div className="flex flex-wrap gap-4 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                            <span className="flex items-center gap-1.5"><Mail size={12} className="text-primary" /> {studentData.correo}</span>
                            <span className="flex items-center gap-1.5"><Phone size={12} className="text-primary" /> {studentData.telefono}</span>
                        </div>
                    </div>

                    <div className="p-6 bg-primary-soft/50 rounded-3xl border border-primary/10">
                        <p className="text-[9px] font-black text-primary uppercase tracking-[0.2em] mb-3">Carrera Destino</p>
                        <p className="text-base font-black text-slate-800 uppercase leading-snug">{studentData.carrera}</p>
                        <p className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2">{studentData.sede}</p>
                    </div>

                    <div className="space-y-4">
                        <p className="text-[10px] font-black text-slate-900 uppercase tracking-widest flex items-center gap-2">
                            <FileCheck size={14} /> Estatus del Expediente Digital
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                            {documents.map(doc => (
                                <div key={doc.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                    <span className="text-[11px] font-bold text-slate-600">{doc.label}</span>
                                    {doc.status === 'uploaded' ? (
                                        <span className="text-[9px] font-black text-success uppercase tracking-widest flex items-center gap-1">
                                            <CheckCircle2 size={10} /> Recibido
                                        </span>
                                    ) : (
                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1">
                                            <Clock size={10} /> Pendiente
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

            <div className="mt-8 text-center">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.5em]">UNAMIS • ADMISIÓN DIGITAL 2026</p>
            </div>
        </div>
    );
};

// Simple standalone version for printing
export const generateVoucherHTML = (studentData: any, documents: any[], registrationCode: string, photo: string | null) => {
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
        <div style="display: flex; justify-between; align-items: center; padding: 10px; border: 1px solid #f1f5f9; border-radius: 12px; margin-bottom: 8px;">
            <span style="font-size: 11px; font-weight: 700; color: #475569;">${doc.label}</span>
            <span style="font-size: 9px; font-weight: 900; color: ${doc.status === 'uploaded' ? '#10b981' : '#f59e0b'}; text-transform: uppercase; letter-spacing: 1px;">
                ${doc.status === 'uploaded' ? 'REPECIONADO' : 'PENDIENTE'}
            </span>
        </div>
    `).join('');

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <title>Comprobante UNAMIS - ${studentData.cedula}</title>
            <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap" rel="stylesheet">
            <style>
                body { font-family: 'Inter', sans-serif; background: #f8fafc; margin: 0; padding: 40px; }
                .voucher { background: white; max-width: 800px; margin: 0 auto; padding: 60px; border-radius: 40px; border: 4px solid rgba(153, 27, 27, 0.1); box-shadow: 0 20px 50px rgba(0,0,0,0.05); position: relative; }
                h1 { color: #991b1b; font-weight: 900; margin: 0; letter-spacing: -2px; }
                .primary-text { color: #991b1b; }
                .success-text { color: #10b981; }
                .info-box { background: #fee2e2; border-radius: 20px; padding: 25px; margin-top: 20px; border: 1px solid rgba(153, 27, 27, 0.05); }
                .photo-placeholder { width: 140px; height: 140px; background: #f1f5f9; border-radius: 24px; display: flex; align-items: center; justify-content: center; overflow: hidden; border: 2px solid #e2e8f0; }
                .grid { display: flex; gap: 40px; margin-top: 40px; }
                .left { flex: 0 0 160px; }
                .right { flex: 1; }
                @media print {
                    body { background: white; padding: 0; }
                    .voucher { box-shadow: none; border: 1px solid #eee; border-radius: 0; }
                    button { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="voucher">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #f1f5f9; padding-bottom: 30px; margin-bottom: 30px;">
                    <div>
                        <h1>UNAMIS</h1>
                        <p style="font-size: 10px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; margin: 5px 0 0 0;">Universidad Nacional de Misiones</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="font-size: 10px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px; margin: 0;">Código de Registro</p>
                        <p style="font-size: 24px; font-weight: 900; color: #991b1b; margin: 0;">${registrationCode}</p>
                        <p style="font-size: 9px; font-weight: 700; color: #94a3b8; margin: 5px 0 0 0; font-style: italic;">Generado: ${today}</p>
                    </div>
                </div>

                <div class="grid">
                    <div class="left">
                        <div class="photo-placeholder">
                            ${photo ? `<img src="${photo}" style="width: 100%; height: 100%; object-fit: cover;">` : `<div style="color: #cbd5e1; font-size: 60px;">👤</div>`}
                        </div>
                        <div style="margin-top: 20px; background: #f8fafc; padding: 15px; border-radius: 15px; border: 1px solid #f1f5f9; text-align: center;">
                            <p style="font-size: 8px; font-weight: 900; color: #94a3b8; text-transform: uppercase; margin: 0 0 5px 0;">Cédula de Identidad</p>
                            <p style="font-size: 14px; font-weight: 900; color: #1e293b; margin: 0;">${studentData.cedula}</p>
                        </div>
                    </div>
                    <div class="right">
                        <div>
                            <h2 style="font-size: 28px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase; letter-spacing: -1px;">${studentData.nombre} ${studentData.apellido}</h2>
                            <p style="font-size: 11px; font-weight: 700; color: #64748b; margin: 5px 0 0 0;">${studentData.correo} • ${studentData.telefono}</p>
                        </div>

                        <div class="info-box">
                            <p style="font-size: 8px; font-weight: 900; color: #991b1b; text-transform: uppercase; margin: 0 0 8px 0; letter-spacing: 1px;">Carrera a Cursar</p>
                            <p style="font-size: 16px; font-weight: 900; color: #1e293b; margin: 0; text-transform: uppercase; line-height: 1.2;">${studentData.carrera}</p>
                            <p style="font-size: 10px; font-weight: 700; color: #991b1b; margin: 8px 0 0 0; text-transform: uppercase;">${studentData.sede}</p>
                        </div>

                        <div style="margin-top: 30px;">
                            <p style="font-size: 10px; font-weight: 900; color: #1e293b; text-transform: uppercase; margin-bottom: 15px; letter-spacing: 1px;">Estatus de Expediente</p>
                            ${docListHtml}
                        </div>
                    </div>
                </div>

                <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-top: 50px; padding-top: 30px; border-top: 2px solid #f1f5f9;">
                    <div style="max-width: 60%; font-size: 10px; color: #94a3b8; font-style: italic; line-height: 1.6;">
                        <p>Este documento es un comprobante de INSCRIPCIÓN VIRTUAL. El postulante debe presentarse en la Sede con los documentos físicos originales para la validación definitiva de su matrícula según el cronograma oficial de la UNAMIS.</p>
                    </div>
                    <div style="text-align: right;">
                        <img src="https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=https://unamis.edu.py/verificar/${registrationCode}" style="width: 80px; height: 80px; margin-bottom: 5px;">
                        <p style="font-size: 8px; font-weight: 900; color: #cbd5e1; text-transform: uppercase; letter-spacing: 2px;">Validación QR</p>
                    </div>
                </div>
            </div>
            <div style="text-align: center; margin-top: 30px;">
                <button onclick="window.print()" style="background: #991b1b; color: white; border: none; padding: 15px 40px; border-radius: 20px; font-weight: 900; cursor: pointer; text-transform: uppercase; letter-spacing: 1px;">Imprimir / Guardar como PDF</button>
            </div>
        </body>
        </html>
    `;
};

export default VoucherTemplate;
