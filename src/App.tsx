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

    const handleLogin = (email: string, password: string) => {
        setLoading(true);
        setError(undefined);
        
        // MODO PRUEBA - Simular login
        setTimeout(() => {
            if (email === 'academico@unamis.edu.py') {
                setCurrentUser({
                    nombre: 'Coordinador',
                    apellido: 'Académico',
                    email: email,
                    cedula: '',
                    rol: 'academico'
                });
                setView('academic');
            } else if (email.endsWith('@unamis.edu.py') && email.includes('finanzas')) {
                setCurrentUser({
                    nombre: 'Usuario',
                    apellido: 'Finanzas',
                    email: email,
                    cedula: '',
                    rol: 'finance'
                });
                setView('admin');
            } else {
                // Estudiante o Docente
                const nombreFromEmail = email.split('@')[0];
                setCurrentUser({
                    nombre: nombreFromEmail.charAt(0).toUpperCase() + nombreFromEmail.slice(1),
                    apellido: '',
                    email: email,
                    cedula: '4.555.666',
                    rol: 'estudiante',
                    expediente_aprobado: true // Para poder probar los pagos. En un entorno real viene de la BD.
                });
                setView('student');
            }
            setLoading(false);
        }, 800);
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setView('auth');
    };

    if (view === 'auth') {
        return (
            <AuthScreen
                onLogin={handleLogin}
                onRegister={() => {}}
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