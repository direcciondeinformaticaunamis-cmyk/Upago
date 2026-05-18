import React, { useState } from 'react';
import {
    GraduationCap,
    Lock
} from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import PostulanteDashboard from './components/PostulanteDashboard';
import AdminFinanceDashboard from './components/AdminFinanceDashboard';
import AcademicDashboard from './components/AcademicDashboard';
import SuperAdminDashboard from './components/SuperAdminDashboard';
import { useMsal } from '@azure/msal-react';
import { InteractionStatus } from '@azure/msal-browser';
import { useEffect } from 'react';

type AppView = 'auth' | 'postulante' | 'admin' | 'academic' | 'superadmin';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('auth');
    const [currentUser, setCurrentUser] = useState<{
        nombre: string;
        apellido: string;
        email: string;
        cedula: string;
        rol: 'postulante' | 'docente' | 'concursante_docente' | 'admin' | 'finance' | 'academico' | 'superadmin';
        expediente_aprobado?: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();
    const { instance, accounts, inProgress } = useMsal();

    // Manejar el resultado de Microsoft Redirect
    useEffect(() => {
        const checkMSALResponse = async () => {
            if (inProgress === InteractionStatus.None && accounts.length > 0) {
                const account = accounts[0];
                const email = account.username;
                
                // Intentamos loguear con el correo de Microsoft
                const exists = await handleMicrosoftAuth(email);
                
                if (!exists) {
                    // Si no existe, no hacemos nada aquí, 
                    // el usuario verá el formulario de AuthScreen con los datos que podemos precargar
                    // Nota: En flujo redirect, el estado se pierde. 
                    // Podríamos guardar en sessionStorage si es necesario precargar el registro.
                    console.log("Usuario de Microsoft no registrado en DB local:", email);
                    setError("Cuenta institucional verificada. Por favor, completa tu registro.");
                }
            }
        };
        checkMSALResponse();
    }, [accounts, inProgress]);

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        setError(undefined);
        
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            // Intentar Login Administrativo primero
            const adminResponse = await fetch(`${baseUrl}/api.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    action: 'admin_login',
                    username: email,
                    password: password
                })
            });

            if (adminResponse.ok) {
                const adminData = await adminResponse.json();
                if (adminData.token) {
                    localStorage.setItem('upago_token', adminData.token);
                }
                setCurrentUser({
                    ...adminData.user,
                    cedula: adminData.user.rol === 'admin' ? 'ADMIN-FIN' : 'ADMIN-ACAD'
                });
                setView(adminData.user.rol === 'admin' ? 'admin' : 'academic');
                setLoading(false);
                return;
            }

            // Si falla el login admin, probamos como postulante
            const response = await fetch(`${baseUrl}/api.php?perfil_by_email=${encodeURIComponent(email)}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
                }
            });
            const data = await response.json();

            if (data && data.cedula) {
                const isSuperAdmin = data.correo === 'informatica@unamis.edu.py';
                setCurrentUser({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    email: data.correo,
                    cedula: data.cedula,
                    rol: isSuperAdmin ? 'superadmin' : (data.tipo_usuario === 'admin' ? 'admin' : (data.tipo_usuario === 'academico' ? 'academico' : (data.tipo_usuario === 'concursante_docente' ? 'concursante_docente' : (data.tipo_usuario === 'auxiliar_docente' ? 'auxiliar_docente' : 'postulante')))),
                    expediente_aprobado: data.estado_revision === 'verificado',
                    ...data // Incluimos carrera, sede, etc.
                } as any);
                
                if (isSuperAdmin) setView('superadmin');
                else if (data.tipo_usuario === 'admin') setView('admin');
                else if (data.tipo_usuario === 'academico') setView('academic');
                else setView('postulante');
            } else {
                setError('Usuario no encontrado o credenciales inválidas.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Error de conexión con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleRegister = async (data: any) => {
        setLoading(true);
        setError(undefined);
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            const response = await fetch(`${baseUrl}/api.php`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
                },
                body: JSON.stringify(data)
            });

            const contentType = response.headers.get('content-type');
            if (!contentType || !contentType.includes('application/json')) {
                const text = await response.text();
                console.error('Respuesta no-JSON del servidor:', text.substring(0, 300));
                setError('Error de servidor: api.php no está disponible. Verifique el deployment.');
                return;
            }

            const result = await response.json();
            if (result.status === 'success') {
                // Después de registrar, logueamos automáticamente
                handleLogin(data.correo || data.email, data.password);
            } else {
                setError(result.message || 'Error al registrar usuario.');
            }
        } catch (err) {
            console.error('Registration error:', err);
            setError('Error al conectar con el servidor.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('upago_token');
        setCurrentUser(null);
        setView('auth');
    };

    const handleMicrosoftAuth = async (email: string) => {
        setLoading(true);
        setError(undefined);
        try {
            const baseUrl = import.meta.env.DEV ? 'http://localhost:8001' : window.location.origin;
            const response = await fetch(`${baseUrl}/api.php?perfil_by_email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data && data.cedula) {
                // El usuario ya existe, lo logueamos directamente
                const isSuperAdmin = data.correo === 'informatica@unamis.edu.py';
                setCurrentUser({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    email: data.correo,
                    cedula: data.cedula,
                    rol: isSuperAdmin ? 'superadmin' : (data.tipo_usuario === 'admin' ? 'admin' : (data.tipo_usuario === 'academico' ? 'academico' : (data.tipo_usuario === 'concursante_docente' ? 'concursante_docente' : (data.tipo_usuario === 'auxiliar_docente' ? 'auxiliar_docente' : 'postulante')))),
                    expediente_aprobado: data.estado_revision === 'verificado',
                    ...data
                } as any);

                if (isSuperAdmin) setView('superadmin');
                else if (data.tipo_usuario === 'admin') setView('admin');
                else if (data.tipo_usuario === 'academico') setView('academic');
                else setView('postulante');
                return true; // Existe
            }
            return false; // No existe, debe completar registro
        } catch (err) {
            console.error('SSO error:', err);
            setError('Error al verificar cuenta institucional.');
            return false;
        } finally {
            setLoading(false);
        }
    };

    if (view === 'auth') {
        return (
            <AuthScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                onMicrosoftAuth={handleMicrosoftAuth}
                error={error}
                loading={loading}
            />
        );
    }

    if (view === 'postulante' && currentUser) {
        return (
            <PostulanteDashboard
                user={currentUser}
                onLogout={handleLogout}
            />
        );
    }

    if (view === 'admin' && currentUser) {
        return (
            <AdminFinanceDashboard
                user={currentUser}
                onLogout={handleLogout}
            />
        );
    }

    if (view === 'academic' && currentUser) {
        return (
            <AcademicDashboard
                user={currentUser}
                onLogout={handleLogout}
            />
        );
    }

    if (view === 'superadmin' && currentUser) {
        return (
            <SuperAdminDashboard
                user={currentUser}
                onLogout={handleLogout}
            />
        );
    }

    return null;
};

export default App;