
export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: NotificationType;
    timestamp: Date;
    read: boolean;
}

class NotificationService {
    private listeners: ((notifications: Notification[]) => void)[] = [];
    private notifications: Notification[] = [
        {
            id: '1',
            title: 'Bienvenido al Sistema',
            message: 'Tu cuenta ha sido activada correctamente en el portal UNAMIS.',
            type: 'success',
            timestamp: new Date(),
            read: false
        }
    ];

    subscribe(listener: (notifications: Notification[]) => void) {
        this.listeners.push(listener);
        listener(this.notifications);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(l => l(this.notifications));
    }

    send(title: string, message: string, type: NotificationType = 'info') {
        const newNotification: Notification = {
            id: Math.random().toString(36).substr(2, 9),
            title,
            message,
            type,
            timestamp: new Date(),
            read: false
        };
        this.notifications = [newNotification, ...this.notifications];
        this.notify();
        
        // Simular envío de WhatsApp/Email en consola
        console.log(`%c [NOTIFICACIÓN ENVIADA] To: Estudiante | Type: ${type} `, 'background: #002f6c; color: #fff; font-weight: bold;');
        console.log(`Título: ${title}`);
        console.log(`Mensaje: ${message}`);
    }

    markAsRead(id: string) {
        this.notifications = this.notifications.map(n => 
            n.id === id ? { ...n, read: true } : n
        );
        this.notify();
    }

    clearAll() {
        this.notifications = [];
        this.notify();
    }
}

export const notificationService = new NotificationService();
