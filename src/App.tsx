import React, { useState } from 'react';
import {
    GraduationCap,
    Lock
} from 'lucide-react';
import AuthScreen from './components/AuthScreen';
import StudentDashboard from './components/StudentDashboard';
import AdminFinanceDashboard from './components/AdminFinanceDashboard';
import AcademicDashboard from './components/AcademicDashboard';

type AppView = 'auth' | 'student' | 'admin' | 'academic';

const App: React.FC = () => {
    const [view, setView] = useState<AppView>('auth');
    const [currentUser, setCurrentUser] = useState<{
        nombre: string;
        apellido: string;
        email: string;
        cedula: string;
        rol: 'estudiante' | 'docente' | 'admin' | 'finance' | 'academico';
        expediente_aprobado?: boolean;
    } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | undefined>();

    const handleLogin = async (email: string, password: string) => {
        setLoading(true);
        setError(undefined);
        
        try {
            // Caso especial para admin y académico si no están en la BD aún
            if (email === 'academico@unamis.edu.py' && password === 'admin123') {
                setCurrentUser({
                    nombre: 'Coordinador',
                    apellido: 'Académico',
                    email: email,
                    cedula: 'ADMIN-ACAD',
                    rol: 'academico'
                });
                setView('academic');
                setLoading(false);
                return;
            }

            if (email === 'finanzas@unamis.edu.py' && password === 'admin123') {
                setCurrentUser({
                    nombre: 'Admin',
                    apellido: 'Finanzas',
                    email: email,
                    cedula: 'ADMIN-FIN',
                    rol: 'finance'
                });
                setView('admin');
                setLoading(false);
                return;
            }

            // Para estudiantes, buscamos por perfil en la API
            // En un entorno real, aquí iría una validación de password real.
            // Por ahora consultamos el perfil por correo si existe.
            const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:8001' : ''}/api.php?perfil_by_email=${encodeURIComponent(email)}`);
            const data = await response.json();

            if (data && data.cedula) {
                setCurrentUser({
                    nombre: data.nombre,
                    apellido: data.apellido,
                    email: data.correo,
                    cedula: data.cedula,
                    rol: data.tipo_usuario === 'concursante_docente' ? 'docente' : 'estudiante',
                    expediente_aprobado: data.estado_revision === 'verificado'
                });
                setView('student');
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
            const response = await fetch(`${import.meta.env.DEV ? 'http://localhost:8001' : ''}/api.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
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
        setCurrentUser(null);
        setView('auth');
    };

    if (view === 'auth') {
        return (
            <AuthScreen
                onLogin={handleLogin}
                onRegister={handleRegister}
                error={error}
                loading={loading}
            />
        );
    }

    if (view === 'student' && currentUser) {
        return (
            <StudentDashboard
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

    return null;
};

export default App;