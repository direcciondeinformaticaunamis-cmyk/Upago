import React, { useState } from 'react';
import Delete from '@mui/icons-material/Delete';
import User from '@mui/icons-material/Person';
import Dashboard from '@mui/icons-material/Dashboard';
import Payments from '@mui/icons-material/Payments';
import AccountBalanceWallet from '@mui/icons-material/AccountBalanceWallet';
import Assessment from '@mui/icons-material/Assessment';
import Help from '@mui/icons-material/Help';
import Logout from '@mui/icons-material/Logout';
import Search from '@mui/icons-material/Search';
import Notifications from '@mui/icons-material/Notifications';
import Settings from '@mui/icons-material/Settings';
import Add from '@mui/icons-material/Add';
import TrendingUp from '@mui/icons-material/TrendingUp';
import Schedule from '@mui/icons-material/Schedule';
import Group from '@mui/icons-material/Group';
import PersonAdd from '@mui/icons-material/PersonAdd';
import FileDownload from '@mui/icons-material/FileDownload';
import Print from '@mui/icons-material/Print';
import History from '@mui/icons-material/History';
import Mail from '@mui/icons-material/Mail';
import MoreVert from '@mui/icons-material/MoreVert';
import Visibility from '@mui/icons-material/Visibility';
import LogoutIcon from '@mui/icons-material/Logout';
import CheckCircle from '@mui/icons-material/CheckCircle';
import Warning from '@mui/icons-material/Warning';
import Description from '@mui/icons-material/Description';
import Edit from '@mui/icons-material/Edit';
import UploadFile from '@mui/icons-material/UploadFile';
import AssignmentInd from '@mui/icons-material/AssignmentInd';
import Assignment from '@mui/icons-material/Assignment';
import FileCheck from '@mui/icons-material/FactCheck';
import Clock from '@mui/icons-material/AccessTime';
import FilterList from '@mui/icons-material/FilterList';
import X from '@mui/icons-material/Close';
import Check from '@mui/icons-material/Check';
import MisDatosModule from './MisDatosModule';
import NotificationCenter from './NotificationCenter';
import { notificationService } from '../services/NotificationService';
import { AcademicService, Expediente } from '../services/AcademicService';
import DocumentPreviewModal from './DocumentPreviewModal';
import PaymentRegistrationForm from './aranceles/PaymentRegistrationForm';
import { fetchApi } from '../services/ApiService';
import { CATALOGO_UNAMIS, TODAS_LAS_SEDES } from '../constants/catalogoUnamis';


interface AcademicDashboardProps {
    user: { nombre: string; apellido: string; email: string; cedula: string; rol: string };
    onLogout: () => void;
}

const AcademicDashboard: React.FC<AcademicDashboardProps> = ({ user, onLogout }) => {
    const [activeSection, setActiveSection] = useState<'admision' | 'dashboard' | 'nueva_inscripcion' | 'reportes' | 'registro_pago' | 'historial_pagos'>('admision');
    const [selectedExpediente, setSelectedExpediente] = useState<Expediente | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewTitle, setPreviewTitle] = useState<string>('');
    const [expedientes, setExpedientes] = useState<Expediente[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    // Estados para Historial de Pagos
    const [payments, setPayments] = useState<any[]>([]);
    const [isPaymentsLoading, setIsPaymentsLoading] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any | null>(null);
    const [paymentSearch, setPaymentSearch] = useState('');
    const [paymentStatusFilter, setPaymentStatusFilter] = useState('todos');
    const [paymentEditForm, setPaymentEditForm] = useState({
        concepto: '',
        monto: 0,
        num_comprobante: '',
        asignatura: '',
        estado: 'pendiente',
        observaciones: ''
    });

    const loadPayments = async () => {
        setIsPaymentsLoading(true);
        try {
            const data = await fetchApi('pagos=true');
            if (Array.isArray(data)) {
                setPayments(data);
            }
        } catch (err: any) {
            console.error("Error loading payments:", err);
            notificationService.send('Error', 'No se pudo cargar el historial de pagos.', 'error');
        } finally {
            setIsPaymentsLoading(false);
        }
    };

    React.useEffect(() => {
        if (activeSection === 'historial_pagos') {
            loadPayments();
        }
    }, [activeSection]);

    const handleOpenEditPayment = (payment: any) => {
        setEditingPayment(payment);
        setPaymentEditForm({
            concepto: payment.concepto || '',
            monto: Number(payment.monto) || 0,
            num_comprobante: payment.num_comprobante || '',
            asignatura: payment.asignatura || '',
            estado: payment.estado || 'pendiente',
            observaciones: payment.observaciones || ''
        });
    };

    const handleSavePaymentEdit = async () => {
        if (!editingPayment) return;
        notificationService.send('Guardando...', 'Actualizando registro de pago...', 'info');
        try {
            const response = await fetchApi('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'update_pago',
                    id: editingPayment.id,
                    ...paymentEditForm
                })
            });
            if (response.status === 'success') {
                notificationService.send('Éxito', 'Pago actualizado con éxito.', 'success');
                setEditingPayment(null);
                loadPayments();
            } else {
                throw new Error(response.message || 'Error al actualizar el pago.');
            }
        } catch (err: any) {
            console.error("Error saving payment edit:", err);
            notificationService.send('Error', err.message || 'No se pudo guardar la edición.', 'error');
        }
    };

    const handleDeletePayment = async (pagoId: number) => {
        if (!window.confirm("¿Está seguro de que desea eliminar permanentemente este pago?\nEsta acción es irreversible y deshará cualquier conciliación asociada.")) {
            return;
        }
        notificationService.send('Eliminando...', 'Eliminando registro de pago...', 'info');
        try {
            const response = await fetchApi('', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'delete_pago',
                    id: pagoId
                })
            });
            if (response.status === 'success') {
                notificationService.send('Éxito', 'Pago eliminado con éxito.', 'success');
                loadPayments();
            } else {
                throw new Error(response.message || 'Error al eliminar el pago.');
            }
        } catch (err: any) {
            console.error("Error deleting payment:", err);
            notificationService.send('Error', err.message || 'No se pudo eliminar el pago.', 'error');
        }
    };

    const [ventanillaPayment, setVentanillaPayment] = useState<{
        cedula: string;
        nombre: string;
        carrera: string;
        asignatura?: string;
        concepto: string;
    } | null>(null);
    const [prefilledPaymentData, setPrefilledPaymentData] = useState<any>(null);

    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingExpediente, setEditingExpediente] = useState<Expediente | null>(null);
    const [editForm, setEditForm] = useState({
        nombre: '',
        apellido: '',
        cedula: '',
        carrera: '',
        sede: '',
        tipo_usuario: 'postulante',
        catedra: ''
    });

    const handleDirectUpload = async (cedula: string, docId: string, asignatura: string | undefined, event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        notificationService.send('Cargando...', 'Subiendo archivo físico desde ventanilla...', 'info');

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', docId);
        formData.append('postulante_id', cedula);
        formData.append('admin_upload', '1');
        if (asignatura) {
            formData.append('asignatura', asignatura);
        }

        try {
            const result = await fetchApi('', {
                method: 'POST',
                body: formData
            });
            if (result.status === 'success') {
                notificationService.send('Carga Exitosa', `Se cargó '${docId}' correctamente.`, 'success');
                // Automatically validate the uploaded document immediately since it's uploaded by the administrator at ventanilla!
                await AcademicService.validateDocument(cedula, docId, asignatura);
                
                // Refresh documents in the modal
                const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
                setSelectedExpediente(prev => prev ? { ...prev, documentos: updatedDocs } : null);
                loadExpedientes();
            } else {
                notificationService.send('Error', result.message || 'No se pudo subir el archivo.', 'error');
            }
        } catch (err) {
            console.error('Error uploading:', err);
            notificationService.send('Error', 'Error de red al intentar subir el archivo.', 'error');
        } finally {
            if (event.target) {
                event.target.value = '';
            }
        }
    };

    const handleUploadVentanillaPayment = async (
        cedula: string, 
        concepto: string, 
        monto: number, 
        numComprobante: string, 
        file: File | null, 
        asignatura?: string
    ) => {
        notificationService.send('Procesando...', 'Registrando pago en caja/ventanilla...', 'info');
        
        try {
            // 1. Prepare FormData to register the payment
            const formData = new FormData();
            formData.append('postulante_cedula', cedula);
            formData.append('concepto', concepto);
            formData.append('monto', monto.toString());
            formData.append('num_comprobante', numComprobante);
            formData.append('estado', 'verificado'); // Verified immediately
            if (file) {
                formData.append('comprobante', file);
            }
            if (asignatura) {
                formData.append('asignatura', asignatura);
            }

            // 2. Call register payment
            const payResJson = await fetchApi('registrar_pago=1', {
                method: 'POST',
                body: formData
            });

            if (payResJson.status !== 'success') {
                throw new Error(payResJson.message || 'Error al registrar el pago en caja.');
            }

            // 3. Now upload the document to expedientes under the type 'comprobante_pago'
            if (file) {
                const docFormData = new FormData();
                docFormData.append('file', file);
                docFormData.append('type', 'comprobante_pago');
                docFormData.append('postulante_id', cedula);
                if (asignatura) {
                    docFormData.append('asignatura', asignatura);
                }

                const docResJson = await fetchApi('', {
                    method: 'POST',
                    body: docFormData
                });
                if (docResJson.status !== 'success') {
                    console.warn("El pago se registró, pero no se pudo subir el archivo digital al expediente:", docResJson.message);
                }
            } else {
                // If there's no physical file uploaded, insert a virtual placeholder document in expedientes so it validates
                const dummyFormData = new FormData();
                const virtualFile = new File(["Pago en efectivo en ventanilla académica."], "comprobante_efectivo.txt", { type: "text/plain" });
                dummyFormData.append('file', virtualFile);
                dummyFormData.append('type', 'comprobante_pago');
                dummyFormData.append('postulante_id', cedula);
                if (asignatura) {
                    dummyFormData.append('asignatura', asignatura);
                }

                await fetchApi('', {
                    method: 'POST',
                    body: dummyFormData
                });
            }

            // 4. Automatically validate the document in the checklist
            await AcademicService.validateDocument(cedula, 'comprobante_pago', asignatura);

            notificationService.send('Pago Registrado', 'El pago físico en ventanilla y el comprobante han sido validados exitosamente.', 'success');
            
            // 5. Close dialog and refresh data
            setVentanillaPayment(null);
            const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
            setSelectedExpediente(prev => prev ? { ...prev, documentos: updatedDocs } : null);
            loadExpedientes();

        } catch (err: any) {
            console.error('Error registering ventanilla payment:', err);
            notificationService.send('Error', err.message || 'No se pudo registrar el pago.', 'error');
        }
    };
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCarrera, setFilterCarrera] = useState('');
    const [filterSede, setFilterSede] = useState('');

    React.useEffect(() => {
        loadExpedientes();
    }, []);

    React.useEffect(() => {
        if (selectedExpediente && selectedExpediente.cedula) {
            const loadDocs = async () => {
                try {
                    const docs = await AcademicService.getDocsForPostulante(selectedExpediente.cedula);
                    setSelectedExpediente(prev => prev ? { ...prev, documentos: docs } : null);
                } catch (error) {
                    console.error('Error loading documents for expediente:', error);
                }
            };
            loadDocs();
        }
    }, [selectedExpediente?.cedula]);

    const loadExpedientes = async () => {
        setIsLoading(true);
        try {
            const data = await AcademicService.getExpedientes();
            setExpedientes(data);
        } catch (error) {
            console.error('Error loading expedientes:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAprobarExpediente = async (cedula: string) => {
        try {
            await AcademicService.approveExpediente(cedula);
            notificationService.send(
                'Expediente Aprobado', 
                `El expediente ha sido validado completamente. El postulante ya puede realizar el pago.`,
                'success'
            );
            loadExpedientes();
            setSelectedExpediente(null);
        } catch (error) {
            console.error('Error approving expediente:', error);
        }
    };

    const handleDeleteExpediente = async (cedula: string, nombre: string) => {
        if (!window.confirm(`¿Está seguro de que desea eliminar permanentemente el expediente de "${nombre}"?\nEsta acción es irreversible y eliminará todos sus datos, documentos y pagos.`)) {
            return;
        }
        
        try {
            setIsLoading(true);
            await AcademicService.deleteExpediente(cedula, user.email);
            notificationService.send(
                'Expediente Eliminado',
                `El expediente de ${nombre} ha sido eliminado correctamente.`,
                'success'
            );
            if (selectedExpediente?.cedula === cedula) {
                setSelectedExpediente(null);
            }
            await loadExpedientes();
        } catch (error: any) {
            console.error('Error deleting expediente:', error);
            notificationService.send(
                'Error al Eliminar',
                error.message || 'No se pudo eliminar el expediente.',
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleOpenEditModal = (exp: Expediente) => {
        setEditingExpediente(exp);
        setEditForm({
            nombre: exp.nombre_real || exp.nombre.split(' ')[0] || '',
            apellido: exp.apellido_real || exp.nombre.split(' ').slice(1).join(' ') || '',
            cedula: exp.cedula || '',
            carrera: exp.carrera || '',
            sede: exp.sede || '',
            tipo_usuario: exp.tipo_usuario || (exp.tipo === 'docente' ? 'concursante_docente' : 'postulante'),
            catedra: exp.catedra || ''
        });
        setIsEditModalOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!editForm.nombre.trim() || !editForm.apellido.trim() || !editForm.cedula.trim() || !editForm.carrera.trim() || !editForm.sede.trim()) {
            notificationService.send(
                'Campos requeridos',
                'Por favor, complete todos los campos del formulario.',
                'warning'
            );
            return;
        }

        try {
            setIsLoading(true);
            const response = await AcademicService.updatePostulante(
                editingExpediente!.cedula,
                {
                    nombre: editForm.nombre,
                    apellido: editForm.apellido,
                    cedula: editForm.cedula,
                    carrera: editForm.carrera,
                    sede: editForm.sede,
                    tipo_usuario: editForm.tipo_usuario,
                    catedra: editForm.catedra
                },
                user.email
            );
            
            if (response.status === 'success' || response.success) {
                notificationService.send(
                    'Postulante Actualizado',
                    'Los datos del postulante han sido modificados correctamente.',
                    'success'
                );
                setIsEditModalOpen(false);
                setEditingExpediente(null);
                await loadExpedientes();
            } else {
                throw new Error(response.message || 'Error al actualizar postulante');
            }
        } catch (error: any) {
            console.error('Error actualizando postulante:', error);
            notificationService.send(
                'Error al Guardar',
                error.message || 'No se pudo actualizar la información del postulante.',
                'error'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const handleValidarDocumento = async (cedula: string, docId: string, asignatura?: string) => {
        try {
            await AcademicService.validateDocument(cedula, docId, asignatura);
            notificationService.send('Documento Validado', `Se ha marcado como válido.`, 'success');
            // Refresh documents in the modal
            const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
            if (selectedExpediente) {
                setSelectedExpediente({ ...selectedExpediente, documentos: updatedDocs });
            }
        } catch (error) {
            console.error('Error validating document:', error);
        }
    };

    const handleSaveObservation = async (cedula: string, docId: string, obs: string, asignatura?: string) => {
        try {
            await AcademicService.saveDocumentObservation(cedula, docId, obs, asignatura);
            notificationService.send('Observación Guardada', `Se notificó: ${obs}`, 'info');
            // Refresh
            const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
            if (selectedExpediente) {
                setSelectedExpediente({ ...selectedExpediente, documentos: updatedDocs });
            }
        } catch (error) {
            console.error('Error saving observation:', error);
        }
    };

    const handleDeleteDocument = async (cedula: string, docId: string, asignatura?: string) => {
        if (!window.confirm("¿Está seguro de que desea eliminar permanentemente este documento cargado? Esta acción no se puede deshacer.")) {
            return;
        }
        try {
            await AcademicService.deleteDocument(cedula, docId, asignatura);
            notificationService.send('Carga Eliminada', `Se eliminó el documento correctamente.`, 'success');
            // Refresh documents in the modal
            const updatedDocs = await AcademicService.getDocsForPostulante(cedula);
            if (selectedExpediente) {
                setSelectedExpediente({ ...selectedExpediente, documentos: updatedDocs });
            }
            loadExpedientes(); // Update dashboard counts/lists
        } catch (error) {
            console.error('Error deleting document:', error);
            notificationService.send('Error', 'No se pudo eliminar el documento.', 'error');
        }
    };

    const pendientes = expedientes.filter(e => e.estado === 'pendiente').length;

    const filteredExpedientes = expedientes?.filter(e => 
        (e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || e.cedula.includes(searchTerm)) &&
        (filterCarrera === '' || e.carrera.includes(filterCarrera)) &&
        (filterSede === '' || e.sede?.includes(filterSede))
    ) || [];

    return (
        <div className="flex h-screen overflow-hidden bg-[#f7f9fb]">
            {/* SideNavBar */}
            <aside className="hidden md:flex flex-col h-screen w-64 fixed left-0 top-0 bg-[#0f172a] p-6 space-y-4 z-40">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center">
                            <span className="text-white font-bold text-sm">U</span>
                        </div>
                        <span className="text-lg font-black text-white tracking-tight">UNAMIS</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-slate-800 rounded-xl shadow-sm border border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-emerald-600 flex items-center justify-center">
                            <User className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-bold text-emerald-400">Portal Académico</p>
                            <p className="text-[10px] text-slate-400">{user.nombre} {user.apellido}</p>
                        </div>
                    </div>
                </div>
                <nav className="flex-1 space-y-1">
                    <button onClick={() => setActiveSection('dashboard')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'dashboard' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Dashboard style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Dashboard</span>
                    </button>
                    <button onClick={() => setActiveSection('admision')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'admision' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <FileCheck style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Gestión de Admisión</span>
                    </button>
                    <button onClick={() => setActiveSection('nueva_inscripcion')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'nueva_inscripcion' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <PersonAdd style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Nueva Inscripción</span>
                    </button>
                    <button onClick={() => setActiveSection('registro_pago')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'registro_pago' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Payments style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Registrar Pago Manual</span>
                    </button>
                    <button onClick={() => setActiveSection('historial_pagos')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'historial_pagos' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <History style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Historial de Pagos</span>
                    </button>
                    <button onClick={() => setActiveSection('reportes')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-md transition-all duration-200 hover:translate-x-1 ${activeSection === 'reportes' ? 'bg-slate-800 shadow-sm text-emerald-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                        <Assessment style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Reportes e Impresión</span>
                    </button>
                </nav>
                <div className="pt-4 border-t border-slate-800">
                    <button onClick={onLogout} className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-400/10 rounded-md transition-colors">
                        <LogoutIcon style={{fontSize: 20}} />
                        <span className="text-sm font-medium">Cerrar Sesión</span>
                    </button>
                </div>
            </aside>

            {/* Main Canvas */}
            <main className="flex-1 md:ml-64 h-screen overflow-y-auto bg-[#f7f9fb]">
                <header className="bg-white border-b border-slate-200 flex justify-between items-center w-full px-6 md:px-12 py-4">
                    <div className="flex items-center gap-8">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Gestión Académica</h1>
                    </div>
                </header>

                <div className="px-6 md:px-12 py-8 max-w-7xl mx-auto space-y-8">
                    {activeSection === 'admision' && (
                        <>
                            <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
                                <div>
                                    <h2 className="text-3xl font-black text-slate-800 tracking-tight mb-2">Revisión de Expedientes</h2>
                                    <p className="text-slate-500">Verifique los documentos digitales para habilitar el pago de aranceles.</p>
                                </div>
                                <div className="flex flex-wrap items-center gap-3">
                                    <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-blue-200">
                                        <Group style={{ fontSize: 18 }} />
                                        <span>Total: <strong>{filteredExpedientes.length}</strong> {filteredExpedientes.length !== expedientes.length && `(filtrados de ${expedientes.length})`}</span>
                                    </div>
                                    <div className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 border border-emerald-200">
                                        <Clock /> {pendientes} Pendientes de Revisión
                                    </div>
                                </div>
                            </section>

                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-200 flex flex-wrap gap-4 items-center bg-slate-50">
                                    <div className="relative flex-1 min-w-[200px]">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" style={{fontSize: 18}} />
                                        <input 
                                            type="text" 
                                            placeholder="Buscar por CI o nombre..." 
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-emerald-500" 
                                        />
                                    </div>
                                    <select 
                                        value={filterCarrera}
                                        onChange={(e) => setFilterCarrera(e.target.value)}
                                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Todas las Carreras</option>
                                        <option value="Medicina">Medicina</option>
                                        <option value="Derecho">Derecho</option>
                                        <option value="Ingeniería">Ingeniería</option>
                                    </select>
                                    <select 
                                        value={filterSede}
                                        onChange={(e) => setFilterSede(e.target.value)}
                                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white text-slate-600 outline-none focus:border-emerald-500"
                                    >
                                        <option value="">Todas las Sedes</option>
                                        <option value="Santa Rosa">Santa Rosa</option>
                                        <option value="San Ignacio">San Ignacio</option>
                                        <option value="Ayolas">Ayolas</option>
                                    </select>
                                </div>
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-slate-50 border-b border-slate-200">
                                            <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center w-12">#</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Postulante / CI</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Programa / Tipo</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Fecha Envío</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">Estado</th>
                                            <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredExpedientes.map((exp, index) => (
                                            <tr key={exp.id} className="hover:bg-slate-50 transition-colors">
                                                <td className="px-4 py-4 text-sm font-mono text-slate-400 text-center font-bold">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm font-bold text-slate-800">{exp.nombre}</p>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-slate-500 font-mono">CI: {exp.cedula}</span>
                                                        {exp.numero_expediente && (
                                                            <span className="text-[10px] bg-slate-100 text-slate-600 font-mono font-bold px-1.5 py-0.5 rounded">
                                                                {exp.numero_expediente}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <p className="text-sm text-slate-800">{exp.carrera}</p>
                                                    {exp.catedra && (
                                                        <p className="text-xs text-purple-700 font-bold mt-0.5">
                                                            📚 Cátedra: {exp.catedra}
                                                        </p>
                                                    )}
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                                            exp.tipo_usuario === 'concursante_docente' 
                                                                ? 'bg-purple-100 text-purple-700' 
                                                                : (exp.tipo_usuario === 'auxiliar_docente' ? 'bg-fuchsia-100 text-fuchsia-700' : 'bg-blue-100 text-blue-700')
                                                        }`}>
                                                            {exp.tipo_usuario === 'concursante_docente' ? 'Docente Encargado' : (exp.tipo_usuario === 'auxiliar_docente' ? 'Docente Auxiliar' : 'Postulante a Examen de Admisión')}
                                                        </span>
                                                        {(exp.totalDocs ?? 0) > 0 ? (
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
                                                                📎 {exp.totalDocs} doc{exp.totalDocs !== 1 ? 's' : ''}
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-50 text-red-500">
                                                                Sin cargas
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">{exp.fechaEnvio}</td>
                                                <td className="px-6 py-4 text-center">
                                                    {exp.estado === 'aprobado' ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                                                            <CheckCircle style={{fontSize: 14}} /> Aprobado
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                                                            <Clock style={{fontSize: 14}} /> Pendiente
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <button onClick={() => setSelectedExpediente(exp)} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors">
                                                            <Visibility style={{fontSize: 16}} /> Ver Expediente
                                                        </button>
                                                        <button 
                                                            onClick={() => handleOpenEditModal(exp)} 
                                                            className="inline-flex items-center justify-center p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                                                            title="Editar Datos"
                                                        >
                                                            <Edit style={{fontSize: 18}} />
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteExpediente(exp.cedula, exp.nombre)} 
                                                            className="inline-flex items-center justify-center p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                                            title="Eliminar Expediente"
                                                        >
                                                            <Delete style={{fontSize: 18}} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    </table>
                                 {isLoading && (
                                     <div className="py-20 text-center">
                                         <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                                         <p className="text-slate-400 text-sm">Cargando expedientes...</p>
                                     </div>
                                 )}
                                 {!isLoading && expedientes.length === 0 && (
                                     <div className="py-20 text-center">
                                         <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                             <Description style={{fontSize: 32, color: '#cbd5e1'}} />
                                         </div>
                                         <p className="text-slate-500 font-medium">No hay expedientes registrados aún.</p>
                                         <p className="text-slate-400 text-sm mt-1">Los postulantes aparecerán aquí una vez que completen su registro.</p>
                                     </div>
                                 )}
                             </div>
                        </>
                    )}
                    {activeSection === 'nueva_inscripcion' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registro Manual de Postulante</h2>
                                    <p className="text-slate-500 text-sm">Carga de datos y documentos para personas que se presentan físicamente.</p>
                                </div>
                                <button onClick={() => setActiveSection('admision')} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <MisDatosModule 
                                forceEdit={true} 
                                initialStep={1} 
                                isAcademic={true} 
                                onGoToPayment={(data) => {
                                    setPrefilledPaymentData(data);
                                    setActiveSection('registro_pago');
                                }}
                            />
                        </div>
                    )}
                    {activeSection === 'dashboard' && (
                        <div className="space-y-8 animate-in fade-in duration-500">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                                            <Group />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Total Postulantes</p>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.length}</p>
                                    <div className="mt-4 flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-0.5 rounded">
                                        <TrendingUp style={{fontSize: 12}} /> +12% este mes
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-amber-50 rounded-lg text-amber-600">
                                            <Clock />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Pendientes</p>
                                    <p className="text-2xl font-black text-slate-800">{pendientes}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Requieren acción inmediata</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                                            <CheckCircle />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-slate-500 mb-1">Aprobados</p>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.filter(e => e.estado === 'aprobado').length}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Habilitados para pago</p>
                                </div>
                                <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                                            <Assignment />
                                        </div>
                                    </div>
                                    <p className="text-2xl font-black text-slate-800">{expedientes.filter(e => e.tipo === 'docente').length}</p>
                                    <p className="mt-4 text-[10px] text-slate-400 font-medium">Postulaciones activas</p>
                                </div>
                                <div className="bg-[#002f6c] p-6 rounded-2xl border border-blue-900 shadow-xl shadow-blue-100">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="p-2 bg-white/10 rounded-lg text-white">
                                            <TrendingUp />
                                        </div>
                                    </div>
                                    <p className="text-sm font-medium text-white/60 mb-1">Recaudación Proyectada</p>
                                    <p className="text-2xl font-black text-white">Gs. {(expedientes.filter(e => e.estado === 'aprobado').length * 1000000).toLocaleString()}</p>
                                    <p className="mt-4 text-[10px] text-white/40 font-medium">Basado en alumnos aprobados</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                <div className="lg:col-span-2 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm h-80 flex flex-col items-center justify-center text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                        <TrendingUp className="text-slate-300" style={{fontSize: 32}} />
                                    </div>
                                    <h3 className="font-bold text-slate-800 mb-2">Gráfico de Crecimiento de Postulaciones</h3>
                                    <p className="text-sm text-slate-400 max-w-xs">Aquí se visualizará la tendencia de inscripciones diarias a medida que se conecte la base de datos.</p>
                                </div>
                                <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
                                    <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                        <Clock className="text-amber-500" /> Actividad Reciente
                                    </h3>
                                    <div className="space-y-6">
                                        {expedientes?.slice(0, 3).map((exp, i) => (
                                            <div key={i} className="flex items-start gap-4 pb-4 border-b border-slate-50 last:border-0">
                                                <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
                                                <div>
                                                    <p className="text-sm font-bold text-slate-800">{exp.nombre}</p>
                                                    <p className="text-xs text-slate-500">Envió expediente para {exp.carrera}</p>
                                                    <p className="text-[10px] text-slate-400 mt-1">{exp.fechaEnvio}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'reportes' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
                            <div className="flex justify-between items-start border-b border-slate-100 pb-6">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Generador de Reportes Oficiales</h2>
                                    <p className="text-slate-500 text-sm">Exportación e impresión de listados de postulantes con formato institucional.</p>
                                </div>
                                <button 
                                    onClick={() => window.print()}
                                    className="flex items-center gap-2 px-6 py-3 bg-[#002f6c] text-white rounded-xl font-bold hover:bg-[#001738] transition-all shadow-lg shadow-blue-100"
                                >
                                    <Print /> Imprimir Listado
                                </button>
                            </div>

                            <div id="printable-report" className="p-8 bg-white print:p-0">
                                {/* Encabezado Institucional (Solo visible en impresión) */}
                                <div className="hidden print:flex flex-col items-center text-center border-b-2 border-black pb-6 mb-8">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-16 h-16 bg-[#002f6c] rounded-lg flex items-center justify-center text-white text-3xl font-black">U</div>
                                        <div className="text-left">
                                            <h1 className="text-xl font-black uppercase leading-tight">Universidad Nacional de Misiones</h1>
                                            <p className="text-xs font-bold uppercase tracking-widest text-slate-600">Rectorado - Secretaría General</p>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <h2 className="text-lg font-bold">REGISTRO OFICIAL DE POSTULANTES Y CONCURSANTES</h2>
                                        <p className="text-xs font-medium italic">En cumplimiento con las Normativas y Reglamentos de Admisión Institucionales</p>
                                        <p className="text-[10px] text-slate-500">Generado el: {new Date().toLocaleString()}</p>
                                    </div>
                                </div>

                                {/* Tabla de Datos */}
                                <div className="overflow-hidden border border-slate-200 rounded-xl print:border-black">
                                    <table className="w-full text-sm text-left border-collapse">
                                        <thead className="bg-slate-50 border-b border-slate-200 print:bg-slate-100">
                                            <tr>
                                                <th className="px-4 py-3 font-bold text-slate-700">Expediente Nº</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">C.I. Nº</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Nombre y Apellido</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Carrera / Área</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Tipo</th>
                                                <th className="px-4 py-3 font-bold text-slate-700">Estado Adm.</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-100">
                                            {expedientes.map((exp) => (
                                                <tr key={exp.id} className="hover:bg-slate-50 print:hover:bg-transparent">
                                                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{exp.numero_expediente || 'PENDIENTE'}</td>
                                                    <td className="px-4 py-3 font-mono text-xs">{exp.cedula}</td>
                                                    <td className="px-4 py-3 font-bold text-slate-800 uppercase text-xs">{exp.nombre}</td>
                                                    <td className="px-4 py-3 text-xs">
                                                         {exp.carrera}
                                                         {exp.catedra && (
                                                             <div className="text-[10px] text-purple-600 font-bold mt-0.5">
                                                                 Cátedra: {exp.catedra}
                                                             </div>
                                                         )}
                                                     </td>
                                                     <td className="px-4 py-3 text-[10px] font-bold uppercase text-slate-500">
                                                          {exp.tipo_usuario === 'concursante_docente' ? 'Docente Encargado' : (exp.tipo_usuario === 'auxiliar_docente' ? 'Docente Auxiliar' : 'Postulante a Examen de Admisión')}
                                                     </td>
                                                    <td className="px-4 py-3">
                                                        <span className={`text-[10px] font-black uppercase ${exp.estado === 'aprobado' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                                            {exp.estado === 'aprobado' ? '✓ VERIFICADO' : '◌ PENDIENTE'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                {/* Pie de Reporte para Firma (Solo impresión) */}
                                <div className="hidden print:grid grid-cols-2 gap-20 mt-32 text-center">
                                    <div className="border-t border-black pt-2">
                                        <p className="text-xs font-bold uppercase">Secretaría Académica</p>
                                        <p className="text-[10px]">Sello y Firma</p>
                                    </div>
                                    <div className="border-t border-black pt-2">
                                        <p className="text-xs font-bold uppercase">Dirección General de Admisión</p>
                                        <p className="text-[10px]">Sello y Firma</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {activeSection === 'registro_pago' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                            <div className="mb-8 flex items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">Registrar Pago Manual (Académico)</h2>
                                    <p className="text-slate-500 text-sm">Registro manual de comprobantes y derecho a examen de admisión para postulantes de Medicina y otras carreras.</p>
                                </div>
                                <button onClick={() => setActiveSection('admision')} className="px-4 py-2 text-sm font-bold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                                    Cancelar
                                </button>
                            </div>
                            <PaymentRegistrationForm 
                                mode="admin" 
                                postulanteName={prefilledPaymentData ? `${prefilledPaymentData.nombre || ''} ${prefilledPaymentData.apellido || ''}`.trim() : undefined}
                                postulanteCedula={prefilledPaymentData?.cedula}
                                postulanteCarrera={prefilledPaymentData?.carrera}
                                postulanteSede={prefilledPaymentData?.sede}
                                onSuccess={() => {
                                    setActiveSection('admision');
                                    setPrefilledPaymentData(null);
                                }} 
                                onBack={() => {
                                    setActiveSection('admision');
                                    setPrefilledPaymentData(null);
                                }} 
                            />
                        </div>
                    )}
                    {activeSection === 'historial_pagos' && (
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 animate-in slide-in-from-bottom-4 duration-500">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                    <div>
                                        <h2 className="text-2xl font-black text-slate-800 tracking-tight">Historial de Carga de Pagos</h2>
                                        <p className="text-slate-500 text-sm">Visualice y gestione los pagos registrados manualmente o recibidos por ventanilla académica.</p>
                                    </div>
                                    <button 
                                        onClick={loadPayments}
                                        className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-1.5 shadow-sm"
                                    >
                                        Actualizar Lista
                                    </button>
                                </div>

                                {/* Tarjetas de Resumen */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                                    <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl shadow-sm">
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Transacciones</p>
                                        <p className="text-3xl font-black text-slate-800 mt-2">{payments.length}</p>
                                    </div>
                                    <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl shadow-sm">
                                        <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">Pagos Verificados</p>
                                        <p className="text-3xl font-black text-emerald-700 mt-2">{payments.filter(p => p.estado === 'verificado').length}</p>
                                    </div>
                                    <div className="bg-amber-50/50 border border-amber-100 p-5 rounded-2xl shadow-sm">
                                        <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">Pendientes / Rechazados</p>
                                        <p className="text-3xl font-black text-amber-700 mt-2">{payments.filter(p => p.estado !== 'verificado').length}</p>
                                    </div>
                                </div>

                                {/* Barra de búsqueda y filtrado */}
                                <div className="flex flex-col md:flex-row gap-4 mb-6">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            value={paymentSearch}
                                            onChange={(e) => setPaymentSearch(e.target.value)}
                                            placeholder="Buscar por postulante, CI o comprobante..."
                                            className="w-full pl-11 pr-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 outline-none focus:bg-white focus:border-[#002f6c] transition-all"
                                        />
                                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    </div>
                                    <select
                                        value={paymentStatusFilter}
                                        onChange={(e) => setPaymentStatusFilter(e.target.value)}
                                        className="px-5 py-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-[#002f6c] transition-all cursor-pointer min-w-[180px]"
                                    >
                                        <option value="todos">Todos los Estados</option>
                                        <option value="pendiente">Pendientes</option>
                                        <option value="verificado">Verificados</option>
                                        <option value="rechazado">Rechazados</option>
                                    </select>
                                </div>

                                {/* Listado Tabla */}
                                {isPaymentsLoading ? (
                                    <div className="text-center py-12">
                                        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-solid border-[#002f6c] border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
                                        <p className="mt-4 text-sm font-bold text-slate-500">Cargando transacciones de pago...</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white shadow-sm">
                                        <table className="w-full border-collapse text-left text-sm">
                                            <thead className="bg-slate-50 text-slate-650 border-b border-slate-200">
                                                <tr>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Postulante</th>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Concepto</th>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Monto</th>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Comprobante</th>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Fecha</th>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider">Estado</th>
                                                    <th className="px-6 py-4 font-bold text-xs uppercase tracking-wider text-right">Acciones</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-slate-100">
                                                {payments.filter((p: any) => {
                                                    const matchesSearch = 
                                                        (p.nombre || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
                                                        (p.apellido || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
                                                        (p.postulante_cedula || '').toLowerCase().includes(paymentSearch.toLowerCase()) ||
                                                        (p.num_comprobante || '').toLowerCase().includes(paymentSearch.toLowerCase());
                                                    const matchesStatus = 
                                                        paymentStatusFilter === 'todos' || 
                                                        p.estado === paymentStatusFilter;
                                                    return matchesSearch && matchesStatus;
                                                }).map((payment: any) => (
                                                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-slate-850">{payment.nombre} {payment.apellido}</p>
                                                            <p className="text-xs text-slate-450 font-bold">CI: {payment.postulante_cedula}</p>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-slate-700">{payment.concepto}</p>
                                                            {payment.asignatura && (
                                                                <p className="text-xs text-slate-450 italic mt-0.5 font-semibold">Cátedra(s): {payment.asignatura}</p>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className="font-black text-slate-900">Gs. {Number(payment.monto).toLocaleString('es-PY')}</span>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <p className="font-bold text-slate-700">{payment.num_comprobante || 'S/N'}</p>
                                                            {payment.comprobante_url ? (
                                                                <a 
                                                                    href={payment.comprobante_url.startsWith('http') ? payment.comprobante_url : `/${payment.comprobante_url}`} 
                                                                    target="_blank" 
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs text-blue-600 hover:text-blue-800 hover:underline font-bold flex items-center gap-1 mt-0.5"
                                                                >
                                                                    Ver Archivo
                                                                </a>
                                                            ) : (
                                                                <span className="text-[10px] text-slate-400 font-semibold italic">Sin comprobante digital</span>
                                                            )}
                                                        </td>
                                                        <td className="px-6 py-4 text-slate-500 font-semibold">
                                                            {payment.fecha_pago || payment.fecha_registro?.split(' ')[0] || '-'}
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                                                                payment.estado === 'verificado' 
                                                                    ? 'bg-emerald-50 text-emerald-700' 
                                                                    : payment.estado === 'rechazado' 
                                                                        ? 'bg-rose-50 text-rose-700' 
                                                                        : 'bg-amber-50 text-amber-700'
                                                            }`}>
                                                                {payment.estado}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-right">
                                                            <div className="flex justify-end gap-1">
                                                                <button
                                                                    onClick={() => handleOpenEditPayment(payment)}
                                                                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                                    title="Editar Pago"
                                                                >
                                                                    <Edit style={{fontSize: 18}} />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeletePayment(payment.id)}
                                                                    className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                                    title="Eliminar Pago"
                                                                >
                                                                    <Delete style={{fontSize: 18}} />
                                                                </button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                                {payments.length === 0 && (
                                                    <tr>
                                                        <td colSpan={7} className="px-6 py-10 text-center text-slate-400 font-bold italic">
                                                            No se encontraron cargas de pago registradas.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            {/* Modal de Revisión de Expediente */}
            {selectedExpediente && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Revisión de Expediente: {selectedExpediente.numero_expediente || selectedExpediente.id}</h3>
                                <p className="text-sm text-slate-500">{selectedExpediente.nombre} - {selectedExpediente.carrera}</p>
                            </div>
                            <button onClick={() => setSelectedExpediente(null)} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                                <X />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                            <h4 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
                                <Description style={{fontSize: 20}} /> Documentos del Expediente
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(() => {
                                    const exp = selectedExpediente;
                                    if (!exp) return null;
                                    
                                    const getRequiredDocs = () => {
                                        if (exp.tipo === 'docente') {
                                            return [
                                                { id: 'cv', nombre: 'a) Currículum vitae actualizado' },
                                                { id: 'solicitud_participacion', nombre: 'a.1) Nota de Solicitud de Participación en el Concurso' },
                                                { id: 'cedula', nombre: 'b) Fotocopia autenticada por Escribanía de la C.I.' },
                                                { id: 'titulos', nombre: 'c) Fotocopia autenticada de Certificados y Títulos' },
                                                { id: 'cursos', nombre: 'd) Fotocopia simple de certificados de cursos/talleres' },
                                                { id: 'declaracion_jurada', nombre: 'e) Declaración jurada de no hallarse en inhabilidades' },
                                                { id: 'antecedente_judicial', nombre: 'f) Certificado de antecedente judicial' },
                                                { id: 'antecedente_policial', nombre: 'g) Certificado de antecedente policial' },
                                                { id: 'comprobante_pago', nombre: 'h) Pago del arancel de inscripción' }
                                            ];
                                        } else if (exp.carrera?.includes('Medicina')) {
                                            return [
                                                { id: 'cedula', nombre: '1. Fotocopia de Cédula de Identidad' },
                                                { id: 'estudio', nombre: '2. Certificado de Estudios (Educación Media)' },
                                                { id: 'titulo', nombre: '3. Fotocopia del Título de Bachiller' },
                                                { id: 'antecedente_policial', nombre: '4. Certificado de Antecedente Policial' },
                                                { id: 'comprobante_pago', nombre: '5. Comprobante de Pago (Arancel)' }
                                            ];
                                        } else {
                                            return [
                                                { id: 'cedula', nombre: 'Fotocopia de Cédula de Identidad' },
                                                { id: 'estudio', nombre: 'Certificado de Estudios de la Educación Media' },
                                                { id: 'titulo', nombre: 'Fotocopia del Título de Bachiller' },
                                                { id: 'antecedente_policial', nombre: 'Certificado de Antecedentes Policiales' },
                                                { id: 'comprobante_pago', nombre: 'Comprobante de Ingreso por Pago de Arancel' }
                                            ];
                                        }
                                    };

                                    const required = getRequiredDocs();
                                    const cvDoc = exp.documentos?.find(d => d.id === 'cv');
                                    const cvUrl = cvDoc?.url || '';

                                    const flatDocs: any[] = [];
                                    required.forEach((req) => {
                                        const actualDocs = exp.documentos?.filter(d => d.id === req.id) || [];
                                        if (actualDocs.length === 0) {
                                            flatDocs.push({ req, actual: undefined });
                                        }
                                        actualDocs.forEach(d => { flatDocs.push({ req, actual: d }); });
                                    }); return flatDocs.map(({ req, actual }) => {
                                        const uniqueKey = actual ? `${req.id}-${actual.asignatura || 'general'}` : req.id;
                                        return (
                                            <div key={uniqueKey} className="bg-white p-4 rounded-xl border border-slate-200 flex items-start gap-4 shadow-sm hover:shadow-md transition-shadow">
                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${actual && actual.estado === 'aprobado' ? 'bg-emerald-50 text-emerald-600' : actual ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'}`}>
                                                    {actual && actual.estado === 'aprobado' ? <CheckCircle /> : <FileCheck />}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-slate-800 mb-1 flex flex-wrap items-center gap-2">
                                                        {req.nombre}
                                                        {actual && actual.asignatura && (
                                                            <span className="text-[8px] bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded font-black uppercase tracking-wider">
                                                                📚 Carpeta: {actual.asignatura}
                                                            </span>
                                                        )}
                                                    </p>
                                                    {actual && actual.observaciones && (
                                                        <p className="text-[10px] text-amber-600 font-medium mb-1 bg-amber-50 px-2 py-0.5 rounded w-fit italic">
                                                            Nota: {actual.observaciones}
                                                        </p>
                                                    )}
                                                    {!actual && (
                                                        <p className="text-[10px] text-red-500 font-semibold mb-1 bg-red-50 px-2 py-0.5 rounded w-fit italic">
                                                            No cargado / Pendiente
                                                        </p>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-3 mt-1">
                                                        {actual ? (
                                                            <>
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        setPreviewUrl(actual.url);
                                                                        setPreviewTitle(req.nombre);
                                                                    }}
                                                                    className="text-xs text-blue-600 hover:underline font-medium focus:outline-none"
                                                                >
                                                                    Ver archivo
                                                                </button>
                                                                {actual.estado !== 'aprobado' && (
                                                                    <div className="flex gap-2">
                                                                        <button 
                                                                            onClick={() => {
                                                                                notificationService.send('Vision AI', 'Escaneando documento para verificar CI...', 'info');
                                                                                setTimeout(() => notificationService.send('Vision AI', `CI Detectada: ${exp.cedula} (Coincidencia 100%)`, 'success'), 2000);
                                                                            }}
                                                                            className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded hover:bg-blue-100 transition-colors"
                                                                        >
                                                                            🤖 Smart Scan
                                                                        </button>
                                                                        <button 
                                                                            onClick={() => handleValidarDocumento(exp.cedula, req.id, actual.asignatura)}
                                                                            className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded hover:bg-emerald-100 transition-colors"
                                                                        >
                                                                            ✓ Validar
                                                                        </button>
                                                                    </div>
                                                                )}
                                                                {actual.estado === 'aprobado' && (
                                                                    <span className="text-[10px] font-bold text-emerald-600 italic">Validado</span>
                                                                )}
                                                                
                                                                {/* Reemplazar button */}
                                                                <label className="text-[10px] font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1">
                                                                    <UploadFile style={{ fontSize: 12 }} />
                                                                    Reemplazar
                                                                    <input 
                                                                        type="file" 
                                                                        className="hidden" 
                                                                        onChange={(e) => handleDirectUpload(exp.cedula, req.id, actual.asignatura, e)} 
                                                                    />
                                                                </label>
                                                                
                                                                {/* Eliminar button */}
                                                                <button 
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        handleDeleteDocument(exp.cedula, req.id, actual.asignatura);
                                                                    }}
                                                                    className="text-[10px] font-bold text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 px-2 py-0.5 rounded transition-colors flex items-center gap-1 cursor-pointer"
                                                                >
                                                                    <Delete style={{ fontSize: 12 }} />
                                                                    Eliminar
                                                                </button>
                                                            </>
                                                        ) : (
                                                            <>
                                                                {req.id === 'comprobante_pago' ? (
                                                                    <button 
                                                                        onClick={() => {
                                                                            setVentanillaPayment({
                                                                                cedula: exp.cedula,
                                                                                nombre: exp.nombre,
                                                                                carrera: exp.carrera,
                                                                                asignatura: undefined,
                                                                                concepto: exp.carrera?.includes('Medicina') ? 'Examen de Admisión - Medicina (San Ignacio)' : 'Inscripción General'
                                                                            });
                                                                        }}
                                                                        className="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1 shadow-sm mt-1"
                                                                    >
                                                                        <UploadFile style={{ fontSize: 14 }} />
                                                                        <span>Registrar Pago Ventanilla</span>
                                                                    </button>
                                                                ) : (
                                                                    <label className="text-[10px] font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded transition-colors cursor-pointer flex items-center gap-1 mt-1">
                                                                        <UploadFile style={{ fontSize: 14 }} />
                                                                        <span>Subir escaneado (Ventanilla)</span>
                                                                        <input 
                                                                            type="file" 
                                                                            className="hidden" 
                                                                            onChange={(e) => handleDirectUpload(exp.cedula, req.id, undefined, e)} 
                                                                        />
                                                                    </label>
                                                                )}
                                                                
                                                                {exp.tipo === 'docente' && req.id !== 'cv' && (
                                                                    <button 
                                                                        onClick={async () => {
                                                                            if (!cvUrl) {
                                                                                alert("Debe cargarse primero el Currículum Vitae para poder marcar otros criterios como incluidos en él.");
                                                                                return;
                                                                            }
                                                                            try {
                                                                                await AcademicService.markDocInCv(exp.cedula, req.id, cvUrl, actual?.asignatura);
                                                                                notificationService.send('Criterio Aprobado', `Se marcó '${req.nombre}' como incluido en Currículum.`, 'success');
                                                                                const updatedDocs = await AcademicService.getDocsForPostulante(exp.cedula);
                                                                                setSelectedExpediente(prev => prev ? { ...prev, documentos: updatedDocs } : null);
                                                                            } catch (error) {
                                                                                console.error('Error marking as included in CV:', error);
                                                                            }
                                                                        }}
                                                                        className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded hover:bg-purple-100 transition-colors shadow-sm border border-purple-200 mt-1"
                                                                    >
                                                                        🗂 Incluido en CV
                                                                    </button>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            <div className="mt-8 p-5 bg-amber-50 rounded-2xl border border-amber-100">
                                <h5 className="text-xs font-black text-amber-700 uppercase tracking-wider mb-3">Observaciones Rápidas (Para el Alumno)</h5>
                                <div className="flex flex-wrap gap-2">
                                    {['Documento ilegible', 'Cédula vencida', 'Falta firma/sello', 'Formato incorrecto', 'Documento incompleto'].map(obs => (
                                        <button 
                                            key={obs}
                                            onClick={() => {
                                                // Asumimos que queremos aplicar la nota al primer documento no validado o seleccionado
                                                // Para hacerlo pro, podríamos dejar que seleccionen el doc, pero por ahora
                                                // lo aplicaremos al expediente general o al que estén viendo.
                                                if (selectedExpediente) {
                                                    // Buscamos el primer doc pendiente
                                                    const firstDoc = selectedExpediente.documentos?.find(d => d.estado !== 'aprobado');
                                                    if (firstDoc) {
                                                        handleSaveObservation(selectedExpediente.cedula, firstDoc.id, obs, firstDoc.asignatura);
                                                    }
                                                }
                                            }}
                                            className="px-3 py-1.5 bg-white border border-amber-200 text-[10px] font-bold text-amber-700 rounded-lg hover:bg-amber-100 transition-colors"
                                        >
                                            + {obs}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-200 bg-white rounded-b-2xl flex justify-between items-center">
                            {selectedExpediente.estado === 'aprobado' ? (
                                <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-lg">
                                    <CheckCircle /> Expediente Aprobado
                                </div>
                            ) : (
                                <p className="text-sm text-slate-500 italic">Revise todos los documentos antes de aprobar.</p>
                            )}
                            
                            <div className="flex gap-3">
                                <button onClick={() => setSelectedExpediente(null)} className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Cerrar
                                </button>
                                {selectedExpediente.estado === 'pendiente' && (
                                    <button 
                                        onClick={() => handleAprobarExpediente(selectedExpediente.cedula)}
                                        className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                                    >
                                        <Check /> Aprobar Expediente
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <DocumentPreviewModal 
                isOpen={!!previewUrl} 
                onClose={() => setPreviewUrl(null)} 
                url={previewUrl || ''} 
                title={previewTitle} 
            />

            {/* Modal de Edición de Pago */}
            {editingPayment && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-200">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-black text-slate-800">Editar Registro de Pago</h3>
                                <p className="text-xs text-slate-500 mt-0.5">Modifique los datos cargados para el postulante CI: {editingPayment.postulante_cedula}</p>
                            </div>
                            <button 
                                onClick={() => setEditingPayment(null)}
                                className="p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 rounded-full transition-colors"
                            >
                                <X style={{fontSize: 20}} />
                            </button>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Concepto de Pago</label>
                                <input
                                    type="text"
                                    value={paymentEditForm.concepto}
                                    onChange={(e) => setPaymentEditForm({...paymentEditForm, concepto: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-all"
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto (Gs.)</label>
                                    <input
                                        type="number"
                                        value={paymentEditForm.monto}
                                        onChange={(e) => setPaymentEditForm({...paymentEditForm, monto: Number(e.target.value)})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-all"
                                    />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">N° Comprobante</label>
                                    <input
                                        type="text"
                                        value={paymentEditForm.num_comprobante}
                                        onChange={(e) => setPaymentEditForm({...paymentEditForm, num_comprobante: e.target.value})}
                                        className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-all"
                                    />
                                </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Cátedra(s) / Asignatura(s) (Separadas por comas)</label>
                                <input
                                    type="text"
                                    value={paymentEditForm.asignatura}
                                    onChange={(e) => setPaymentEditForm({...paymentEditForm, asignatura: e.target.value})}
                                    placeholder="Ej: Anatomía Humana, Fisiología"
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-all"
                                />
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Estado del Pago</label>
                                <select
                                    value={paymentEditForm.estado}
                                    onChange={(e) => setPaymentEditForm({...paymentEditForm, estado: e.target.value})}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 outline-none focus:border-[#002f6c] transition-all cursor-pointer"
                                >
                                    <option value="pendiente">Pendiente</option>
                                    <option value="verificado">Verificado</option>
                                    <option value="rechazado">Rechazado</option>
                                </select>
                            </div>

                            <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Observaciones</label>
                                <textarea
                                    value={paymentEditForm.observaciones}
                                    onChange={(e) => setPaymentEditForm({...paymentEditForm, observaciones: e.target.value})}
                                    rows={3}
                                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 outline-none focus:border-[#002f6c] transition-all resize-none"
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                            <button
                                onClick={() => setEditingPayment(null)}
                                className="px-5 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSavePaymentEdit}
                                className="px-5 py-2.5 bg-[#002f6c] hover:bg-[#001738] text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-md"
                            >
                                Guardar Cambios
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de Pago en Ventanilla */}
            {ventanillaPayment && (
                <VentanillaPaymentModal 
                    data={ventanillaPayment} 
                    onClose={() => setVentanillaPayment(null)} 
                    onSubmit={handleUploadVentanillaPayment} 
                />
            )}

            {/* Modal de Edición de Datos de Postulante */}
            {isEditModalOpen && editingExpediente && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] flex flex-col shadow-2xl animate-fade-in">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold text-slate-800">Editar Datos de Postulante</h3>
                                <p className="text-sm text-slate-500">Modificar información del expediente del postulante</p>
                            </div>
                            <button onClick={() => { setIsEditModalOpen(false); setEditingExpediente(null); }} className="p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600 rounded-full transition-colors">
                                <X />
                            </button>
                        </div>
                        
                        <div className="p-6 overflow-y-auto flex-1 bg-slate-50 space-y-4">
                            <div className="grid grid-cols-1 gap-4">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Nombre</label>
                                    <input 
                                        type="text" 
                                        value={editForm.nombre}
                                        onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                                        placeholder="Nombre del postulante"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Apellido</label>
                                    <input 
                                        type="text" 
                                        value={editForm.apellido}
                                        onChange={(e) => setEditForm({ ...editForm, apellido: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                                        placeholder="Apellido del postulante"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cédula de Identidad (CI)</label>
                                    <input 
                                        type="text" 
                                        value={editForm.cedula}
                                        onChange={(e) => setEditForm({ ...editForm, cedula: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm font-mono"
                                        placeholder="Número de cédula de identidad"
                                    />
                                    {editForm.cedula !== editingExpediente.cedula && (
                                        <p className="text-[11px] text-amber-600 font-medium mt-1">
                                            ⚠️ Cambiar la cédula actualizará los expedientes, pagos y usuarios relacionados.
                                        </p>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Carrera / Programa</label>
                                    <select 
                                        value={editForm.carrera}
                                        onChange={(e) => setEditForm({ ...editForm, carrera: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                                    >
                                        <option value="">Seleccione carrera</option>
                                        {Object.entries(CATALOGO_UNAMIS).map(([sede, carreras]) => (
                                            <optgroup key={sede} label={sede}>
                                                {carreras.map(c => (
                                                    <option key={c} value={c}>{c}</option>
                                                ))}
                                            </optgroup>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Sede</label>
                                    <select 
                                        value={editForm.sede}
                                        onChange={(e) => setEditForm({ ...editForm, sede: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                                    >
                                        <option value="">Seleccione sede</option>
                                        {TODAS_LAS_SEDES.map(s => (
                                            <option key={s} value={s}>{s}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Tipo de Usuario</label>
                                    <select 
                                        value={editForm.tipo_usuario}
                                        onChange={(e) => {
                                            const val = e.target.value;
                                            setEditForm(prev => ({
                                                ...prev,
                                                tipo_usuario: val,
                                                catedra: val === 'postulante' ? '' : prev.catedra
                                            }));
                                        }}
                                        className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                                    >
                                        <option value="postulante">Postulante a Examen de Admisión</option>
                                        <option value="concursante_docente">Docente Encargado</option>
                                        <option value="auxiliar_docente">Docente Auxiliar</option>
                                    </select>
                                </div>
                                {(editForm.tipo_usuario === 'concursante_docente' || editForm.tipo_usuario === 'auxiliar_docente') && (
                                     <div>
                                         <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1">Cátedra de Concurso</label>
                                         <input 
                                             type="text"
                                             value={editForm.catedra || ''}
                                             onChange={(e) => setEditForm({ ...editForm, catedra: e.target.value })}
                                             className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-emerald-500 bg-white shadow-sm"
                                             placeholder="Nombre de la cátedra"
                                         />
                                     </div>
                                 )}
                            </div>
                        </div>
                        
                        <div className="p-6 border-t border-slate-200 bg-slate-50 flex justify-end items-center gap-3">
                            <button 
                                onClick={() => { setIsEditModalOpen(false); setEditingExpediente(null); }} 
                                className="px-6 py-2.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                            >
                                Cancelar
                            </button>
                            <button 
                                onClick={handleSaveEdit}
                                className="px-6 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                        Guardando...
                                    </>
                                ) : (
                                    'Guardar Cambios'
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface VentanillaPaymentModalProps {
    data: {
        cedula: string;
        nombre: string;
        carrera: string;
        asignatura?: string;
        concepto: string;
    };
    onClose: () => void;
    onSubmit: (cedula: string, concepto: string, monto: number, numComprobante: string, file: File | null, asignatura?: string) => Promise<void>;
}

const VentanillaPaymentModal: React.FC<VentanillaPaymentModalProps> = ({ data, onClose, onSubmit }) => {
    const [concepto, setConcepto] = React.useState(data.concepto);
    const [monto, setMonto] = React.useState(data.carrera?.includes('Medicina') ? 1000000 : 350000);
    const [numComprobante, setNumComprobante] = React.useState('');
    const [file, setFile] = React.useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [error, setError] = React.useState('');

    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!numComprobante.trim()) {
            setError('Por favor ingrese el número de comprobante o referencia de caja.');
            return;
        }
        setError('');
        setIsSubmitting(true);
        try {
            await onSubmit(data.cedula, concepto, monto, numComprobante, file, data.asignatura);
        } catch (err) {
            setError('Error al registrar el pago. Intente nuevamente.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in duration-300">
            <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl flex flex-col overflow-hidden max-h-[90vh]">
                <div className="p-6 bg-[#002f6c] text-white flex justify-between items-center">
                    <div>
                        <h3 className="text-lg font-black tracking-tight flex items-center gap-2 uppercase">
                            🏦 Pago Manual Ventanilla
                        </h3>
                        <p className="text-white/70 text-xs mt-0.5">Registro oficial de cobranza en caja física / banco</p>
                    </div>
                    <button type="button" onClick={onClose} className="p-1.5 hover:bg-white/10 text-white/80 hover:text-white rounded-full transition-colors">
                        <X />
                    </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="p-6 overflow-y-auto space-y-5 flex-1 text-slate-700">
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs space-y-2">
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Postulante:</span>
                            <span className="font-bold text-slate-800 uppercase">{data.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">CI:</span>
                            <span className="font-mono font-bold text-slate-800">{data.cedula}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">Programa:</span>
                            <span className="font-bold text-slate-800">{data.carrera}</span>
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl font-bold">
                            ⚠️ {error}
                        </div>
                    )}

                    <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Concepto de Arancel</label>
                        <select 
                            value={concepto}
                            onChange={(e) => {
                                const val = e.target.value;
                                setConcepto(val);
                                if (val.includes('Medicina')) {
                                    setMonto(1000000);
                                } else {
                                    setMonto(350000);
                                }
                            }}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002f6c] transition-shadow"
                        >
                            <option value="Examen de Admisión - Medicina (San Ignacio)">Examen de Admisión - Medicina (San Ignacio) - Gs. 1.000.000</option>
                            <option value="Inscripción General - Grado">Inscripción General - Grado - Gs. 350.000</option>
                            <option value="Derecho a Matrícula Anual">Derecho a Matrícula Anual - Gs. 500.000</option>
                            <option value="Pago Extraordinario / Otro">Pago Extraordinario / Otro</option>
                        </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Monto Recaudado (Gs.)</label>
                        <input 
                            type="number"
                            value={monto}
                            onChange={(e) => setMonto(parseInt(e.target.value) || 0)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002f6c] transition-shadow"
                            placeholder="Monto en guaraníes"
                            required
                        />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Nº Boleta / Comprobante de Caja</label>
                        <input 
                            type="text"
                            value={numComprobante}
                            onChange={(e) => setNumComprobante(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#002f6c] transition-shadow"
                            placeholder="Ej. T-100245 o Caja-02"
                            required
                        />
                    </div>

                    <div className="space-y-1.5 text-left">
                        <label className="block text-[10px] font-black text-slate-500 uppercase tracking-widest">Foto/Escaneado del Comprobante (Opcional)</label>
                        <label className="flex flex-col items-center justify-center p-5 border border-dashed rounded-2xl cursor-pointer transition-all border-slate-300 hover:border-[#002f6c]/30 hover:bg-slate-50">
                            <input 
                                type="file" 
                                className="hidden" 
                                onChange={(e) => setFile(e.target.files?.[0] || null)} 
                            />
                            <span className="text-xs font-bold text-slate-600">Adjuntar archivo digital</span>
                            <span className="text-[10px] text-slate-400 mt-0.5">Imagen o PDF del recibo físico</span>
                            {file && (
                                <span className="text-xs font-bold text-emerald-600 mt-2 truncate w-full text-center px-4">
                                    📎 {file.name}
                                </span>
                            )}
                        </label>
                    </div>

                    <div className="flex gap-3 pt-4 border-t border-slate-100">
                        <button 
                            type="button" 
                            onClick={onClose} 
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-slate-600 transition-colors text-sm"
                        >
                            Cancelar
                        </button>
                        <button 
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-[#002f6c] hover:bg-[#001738] text-white rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-100 text-sm disabled:opacity-50"
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>✓ Registrar y Validar</>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AcademicDashboard;
