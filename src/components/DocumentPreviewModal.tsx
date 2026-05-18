import React from 'react';
import { X, Download, ExternalLink, Printer } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DocumentPreviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    url: string;
    title: string;
}

const DocumentPreviewModal: React.FC<DocumentPreviewModalProps> = ({
    isOpen,
    onClose,
    url,
    title
}) => {
    // Prevent rendering or crashes if modal is closed or URL is invalid
    const isUrlValid = url && typeof url === 'string';
    const cleanUrl = isUrlValid ? url.split('?')[0] : '';
    const isPDF = cleanUrl.toLowerCase().endsWith('.pdf');

    // Build robust absolute URL
    let absoluteUrl = '';
    if (isUrlValid) {
        if (url.startsWith('http') || url.startsWith('data:')) {
            absoluteUrl = url;
        } else {
            const cleanPath = url.startsWith('/') ? url.slice(1) : url;
            absoluteUrl = `${window.location.origin}/${cleanPath}`;
        }

        // Force HTTPS in production if page is HTTPS to avoid Mixed Content block
        if (window.location.protocol === 'https:' && absoluteUrl.startsWith('http:')) {
            absoluteUrl = absoluteUrl.replace('http:', 'https:');
        }
    }

    const handlePrint = () => {
        if (!absoluteUrl) return;
        const win = window.open(absoluteUrl, '_blank');
        if (win) {
            win.focus();
            win.print();
        }
    };

    return (
        <AnimatePresence>
            {isOpen && isUrlValid && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop con Blur */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
                    />

                    {/* Modal Container */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="relative bg-white rounded-[2rem] w-full max-w-5xl h-[85vh] flex flex-col shadow-2xl overflow-hidden border border-slate-100"
                    >
                        {/* Header */}
                        <div className="px-8 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 shrink-0">
                            <div>
                                <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em] mb-1 block">Visualizador de Documentos</span>
                                <h3 className="text-sm font-black text-slate-800 tracking-tight truncate max-w-md">{title}</h3>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={handlePrint}
                                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all hover:scale-105"
                                    title="Imprimir"
                                >
                                    <Printer size={18} />
                                </button>
                                <a
                                    href={absoluteUrl}
                                    download
                                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all hover:scale-105"
                                    title="Descargar"
                                >
                                    <Download size={18} />
                                </a>
                                <a
                                    href={absoluteUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="p-2.5 text-slate-500 hover:text-slate-800 bg-white border border-slate-200/60 rounded-xl hover:bg-slate-50 transition-all hover:scale-105"
                                    title="Abrir en pestaña nueva"
                                >
                                    <ExternalLink size={18} />
                                </a>
                                <div className="w-px h-6 bg-slate-200/60 mx-1"></div>
                                <button
                                    onClick={onClose}
                                    className="p-2.5 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
                                    title="Cerrar"
                                >
                                    <X size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Content Area */}
                        <div className="flex-1 bg-slate-100 p-6 flex items-center justify-center overflow-auto">
                            {isPDF ? (
                                <iframe
                                    src={`${absoluteUrl}#toolbar=0`}
                                    className="w-full h-full rounded-2xl border border-slate-200 shadow-inner bg-white"
                                    title={title}
                                />
                            ) : (
                                <div className="max-w-full max-h-full flex items-center justify-center p-4">
                                    <img
                                        src={absoluteUrl}
                                        alt={title}
                                        className="max-w-full max-h-[70vh] object-contain rounded-2xl shadow-lg border border-white"
                                    />
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DocumentPreviewModal;
