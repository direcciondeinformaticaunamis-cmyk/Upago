
import { fetchApi } from './ApiService';

export interface Arancel {
    id: number;
    categoria: string;
    concepto: string;
    monto: number;
    descripcion: string;
    activo: number;
}

export interface Payment {
    id: number;
    postulante_cedula: string;
    nombre?: string;
    apellido?: string;
    concepto: string;
    monto: number;
    comprobante_url?: string;
    comprobante_nombre?: string;
    estado: 'pendiente' | 'verificado' | 'rechazado';
    observaciones?: string;
    numero_boleta?: string;
    fecha_pago?: string;
    fecha_registro: string;
}

export interface FinanceStats {
    recaudacion_hoy: number;
    pendientes_conciliar: number;
    registrados_hoy: number;
    tendencia: { mes: string; total: number }[];
}

export interface ReconciliationItem {
    id: number;
    monto: number;
    fecha: string;
    detalle: string;
    banco: string;
    estado: 'pendiente' | 'conciliado' | 'discrepancia';
    match: {
        postulante: string;
        concepto: string;
        pago_id: number;
        puntaje: number;
    } | null;
}

export const FinanceService = {
    getAranceles: async (): Promise<Arancel[]> => {
        return fetchApi('aranceles');
    },

    saveArancel: async (arancel: Partial<Arancel>): Promise<any> => {
        return fetchApi('save_arancel', {
            method: 'POST',
            body: JSON.stringify(arancel)
        });
    },

    getFinanceStats: async (): Promise<FinanceStats> => {
        return fetchApi('stats_finance');
    },

    getReconciliationQueue: async (): Promise<ReconciliationItem[]> => {
        return fetchApi('reconciliation_queue');
    },

    reconcile: async (pago_id: number, transaccion_id: number): Promise<any> => {
        return fetchApi('reconcile', {
            method: 'POST',
            body: JSON.stringify({ pago_id, transaccion_id })
        });
    },
    
    botAutoReconcile: async (): Promise<{ status: string, conciliated_count: number }> => {
        return fetchApi('bot_auto_reconcile', {
            method: 'POST'
        });
    },

    getPagos: async (cedula: string = ''): Promise<Payment[]> => {
        return fetchApi(cedula ? `pagos=${cedula}` : 'pagos');
    },

    registerPayment: async (formData: FormData): Promise<any> => {
        return fetchApi('registrar_pago', {
            method: 'POST',
            body: formData,
            // Importante: No poner Content-Type cuando se usa FormData
            // fetchApi lo manejará si le pasamos FormData y no forzamos JSON
        });
    },

    updatePagoEstado: async (id: number, estado: string, observaciones: string = ''): Promise<any> => {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({ id, estado, observaciones })
        });
    },

    getPostulantes: async (): Promise<any[]> => {
        return fetchApi(''); // api.php sin parámetros devuelve todos los postulantes (línea 648 de api.php)
    }
};
