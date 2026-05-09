
export interface AuditEntry {
    id: string;
    action: string;
    user: string;
    timestamp: Date;
    ip: string;
    hash?: string;
}

class SecurityService {
    private auditLog: AuditEntry[] = [
        {
            id: 'AUD-001',
            action: 'Acceso al Sistema',
            user: 'admin@unamis.edu.py',
            timestamp: new Date(Date.now() - 3600000),
            ip: '192.168.1.45'
        }
    ];

    log(action: string, user: string) {
        const entry: AuditEntry = {
            id: `AUD-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
            action,
            user,
            timestamp: new Date(),
            ip: '181.123.' + Math.floor(Math.random() * 255) + '.' + Math.floor(Math.random() * 255)
        };
        this.auditLog = [entry, ...this.auditLog];
        console.log(`%c [AUDITORÍA] ${action} por ${user} `, 'background: #000; color: #0f0; font-weight: bold;');
    }

    getAuditLog() {
        return this.auditLog;
    }

    generateDigitalSignature(data: string) {
        // Simular una firma criptográfica RSA-256
        const prefix = "UNAMIS-SIG-";
        const randomHash = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        return prefix + randomHash.toUpperCase();
    }

    encryptDocument(fileId: string) {
        // Simulación de encriptación AES-256
        console.log(`Documento ${fileId} encriptado exitosamente.`);
        return true;
    }
}

export const securityService = new SecurityService();
