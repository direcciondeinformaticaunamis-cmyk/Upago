
import React, { useEffect, useState } from 'react';
import { Bell, X, CheckCircle, AlertCircle, Info, AlertTriangle, Trash2 } from 'lucide-react';
import { notificationService, Notification } from '../services/NotificationService';
import { motion, AnimatePresence } from 'framer-motion';

const NotificationCenter: React.FC = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        return notificationService.subscribe(setNotifications);
    }, []);

    const unreadCount = notifications.filter(n => !n.read).length;

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'success': return <CheckCircle className="text-emerald-500" size={18} />;
            case 'error': return <AlertCircle className="text-red-500" size={18} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={18} />;
            default: return <Info className="text-blue-500" size={18} />;
        }
    };

    return (
        <div className="relative">
            <button 
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-all"
            >
                <Bell size={22} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                        {unreadCount}
                    </span>
                )}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div 
                            className="fixed inset-0 z-40" 
                            onClick={() => setIsOpen(false)}
                        ></div>
                        <motion.div 
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-3 w-80 md:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Bell size={16} /> Notificaciones
                                </h3>
                                <button 
                                    onClick={() => notificationService.clearAll()}
                                    className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-colors"
                                    title="Limpiar todas"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="max-h-[400px] overflow-y-auto">
                                {notifications.length === 0 ? (
                                    <div className="p-8 text-center">
                                        <Bell size={32} className="mx-auto text-slate-200 mb-2" />
                                        <p className="text-sm text-slate-400">No tienes notificaciones nuevas</p>
                                    </div>
                                ) : (
                                    <div className="divide-y divide-slate-50">
                                        {notifications.map((n) => (
                                            <div 
                                                key={n.id} 
                                                className={`p-4 hover:bg-slate-50 transition-colors cursor-pointer relative ${!n.read ? 'bg-blue-50/30' : ''}`}
                                                onClick={() => notificationService.markAsRead(n.id)}
                                            >
                                                {!n.read && (
                                                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500"></div>
                                                )}
                                                <div className="flex gap-3">
                                                    <div className="mt-0.5">
                                                        {getTypeIcon(n.type)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex justify-between items-start mb-1">
                                                            <h4 className={`text-sm font-bold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>
                                                                {n.title}
                                                            </h4>
                                                            <span className="text-[10px] text-slate-400">
                                                                {new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 leading-relaxed">
                                                            {n.message}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {notifications.length > 0 && (
                                <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
                                    <button className="text-[10px] font-bold text-blue-600 uppercase tracking-widest hover:underline">
                                        Ver historial completo
                                    </button>
                                </div>
                            )}
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default NotificationCenter;
