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
import { extractJson } from './services/ApiService';

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
            const adminResponse = await fetch(`${baseUrl}/api.php?_cb=${Date.now()}`, {
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

            // Si falla el login admin, probamos como postulante con contraseña
            const response = await fetch(`${baseUrl}/api.php?_cb=${Date.now()}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'student_login', email, password })
            });
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonErr) {
                try {
                    data = JSON.parse(extractJson(text));
                } catch (e) {
                    console.error("Invalid JSON during student login:", text.substring(0, 150));
                    setError("Error en respuesta del servidor.");
                    setLoading(false);
                    return;
                }
            }

            if (data && data.status === 'success' && data.user) {
                if (data.token) {
                    localStorage.setItem('upago_token', data.token);
                }
                const userData = data.user;
                const isSuperAdmin = userData.correo === 'informatica@unamis.edu.py';
                setCurrentUser({
                    nombre: userData.nombre,
                    apellido: userData.apellido,
                    email: userData.correo || userData.email,
                    cedula: userData.cedula,
                    rol: isSuperAdmin ? 'superadmin' : (userData.tipo_usuario === 'admin' ? 'admin' : (userData.tipo_usuario === 'academico' ? 'academico' : (userData.tipo_usuario === 'concursante_docente' ? 'concursante_docente' : (userData.tipo_usuario === 'auxiliar_docente' ? 'auxiliar_docente' : 'postulante')))),
                    expediente_aprobado: userData.estado_revision === 'verificado',
                    ...userData // Incluimos carrera, sede, etc.
                } as any);
                
                if (isSuperAdmin) setView('superadmin');
                else if (userData.tipo_usuario === 'admin') setView('admin');
                else if (userData.tipo_usuario === 'academico') setView('academic');
                else setView('postulante');
            } else {
                setError(data?.message || 'Usuario no encontrado o credenciales inválidas.');
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
            const response = await fetch(`${baseUrl}/api.php?_cb=${Date.now()}`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('upago_token')}`
                },
                body: JSON.stringify(data)
            });

            const text = await response.text();
            let result;
            try {
                result = JSON.parse(text);
            } catch (jsonErr) {
                try {
                    result = JSON.parse(extractJson(text));
                } catch (e) {
                    console.error('Error parsing registration JSON:', text.substring(0, 300));
                    setError('Error de servidor: Respuesta de registro inválida.');
                    return;
                }
            }
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
            const response = await fetch(`${baseUrl}/api.php?perfil_by_email=${encodeURIComponent(email)}&_cb=${Date.now()}`);
            const text = await response.text();
            let data;
            try {
                data = JSON.parse(text);
            } catch (jsonErr) {
                data = JSON.parse(extractJson(text));
            }

            if (data && data.cedula) {
                if (data.token) {
                    localStorage.setItem('upago_token', data.token);
                }
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