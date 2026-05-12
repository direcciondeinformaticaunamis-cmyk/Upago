
import { fetchApi } from './ApiService';

export interface Expediente {
    id: string;
    nombre: string;
    cedula: string;
    carrera: string;
    tipo: 'estudiante' | 'docente';
    sede?: string;
    fechaEnvio: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    documentos: {
        id: string;
        nombre: string;
        url: string;
        estado: 'pendiente' | 'aprobado';
        observaciones?: string;
    }[];
}

export const AcademicService = {
    async getExpedientes(): Promise<Expediente[]> {
        const data = await fetchApi(); // General list of postulantes
        if (!Array.isArray(data)) return [];
        
        return data.map((p: any) => ({
            id: `EXP-${p.cedula.slice(-3)}`,
            nombre: `${p.nombre} ${p.apellido}`,
            cedula: p.cedula,
            carrera: p.carrera || 'No especificada',
            sede: p.sede || 'Santa Rosa de Lima',
            tipo: p.tipo_usuario === 'concursante_docente' ? 'docente' : 'estudiante',
            fechaEnvio: p.fecha_registro ? p.fecha_registro.split(' ')[0] : '2024-05-08',
            estado: p.expediente_aprobado ? 'aprobado' : 'pendiente',
            documentos: [] // Docs will be loaded on demand or handled separately
        }));
    },

    async getDocsForPostulante(cedula: string) {
        return fetchApi(`docs=${cedula}`);
    },

    async approveExpediente(cedula: string) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'approve_expediente',
                cedula: cedula
            })
        });
    },
    async validateDocument(cedula: string, docId: string) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'validate_doc',
                cedula: cedula,
                doc_id: docId
            })
        });
    },

    async saveDocumentObservation(cedula: string, docId: string, observation: string) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'save_doc_observation',
                cedula: cedula,
                doc_id: docId,
                observacion: observation
            })
        });
    }
};
