
import { fetchApi, API_BASE_URL } from './ApiService';

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
    num_comprobante?: string;
    fecha_pago?: string;
    fecha_registro: string;
    asignatura?: string;
    cierre_nro?: number | null;
    cierre_fecha?: string | null;
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
        comprobante_url?: string;
        puntaje: number;
    } | null;
}

export interface ReconciliationInput {
    banco: string;
    referencia: string;
    monto: number;
    fecha_transaccion: string;
    descripcion: string;
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

    importDemoTransactions: async (): Promise<any> => {
        return fetchApi('import_demo_transactions', {
            method: 'POST'
        });
    },

    importBankTransactions: async (transactions: ReconciliationInput[]): Promise<{ status: string, inserted: number, duplicates: number }> => {
        return fetchApi('import_bank_transactions', {
            method: 'POST',
            body: JSON.stringify({ action: 'import_bank_transactions', transactions })
        });
    },

    deleteBankTransaction: async (id: number): Promise<any> => {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({ action: 'delete_bank_transaction', id })
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
            body: JSON.stringify({ action: 'update_pago_estado', id, estado, observaciones })
        });
    },

    getPostulantes: async (): Promise<any[]> => {
        return fetchApi('all_postulantes=true');
    },

    getCierrePreview: async (): Promise<Payment[]> => {
        return fetchApi('get_cierre_preview');
    },

    getMaxCierreCorrelativo: async (): Promise<{ max_cierre: number }> => {
        return fetchApi('get_cierre_max_correlativo');
    },

    getCierresHistoricos: async (): Promise<any[]> => {
        return fetchApi('get_cierres_historicos');
    },

    realizarCierre: async (fechaCierre: string, nroCierre: number, pagosIds: number[]): Promise<{ status: string, message: string }> => {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'realizar_cierre',
                fecha_cierre: fechaCierre,
                nro_cierre: nroCierre,
                pagos_ids: pagosIds
            })
        });
    },

    getDownloadCierreUrl: (nroCierre: number, fechaCierre: string): string => {
        const token = localStorage.getItem('upago_token') || '';
        return `${API_BASE_URL}/api.php?descargar_cierre_excel=1&cierre_nro=${nroCierre}&cierre_fecha=${fechaCierre}&token=${encodeURIComponent(token)}`;
    }
};

