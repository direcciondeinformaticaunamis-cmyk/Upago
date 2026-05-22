
import { fetchApi, API_BASE_URL } from './ApiService';

export interface Expediente {
    id: string;
    nombre: string;
    nombre_real?: string;
    apellido_real?: string;
    cedula: string;
    carrera: string;
    tipo: 'postulante' | 'docente';
    tipo_usuario?: string;
    sede?: string;
    numero_expediente?: string;
    fechaEnvio: string;
    estado: 'pendiente' | 'aprobado' | 'rechazado';
    totalDocs?: number;
    documentos: {
        id: string;
        nombre: string;
        url: string;
        estado: 'pendiente' | 'aprobado';
        observaciones?: string;
        asignatura?: string;
    }[];
}

/**
 * Normaliza la URL de un documento para que sea accesible desde el navegador.
 * El backend guarda rutas relativas como "uploads/cedulas/archivo.pdf"
 * que deben convertirse a URLs absolutas.
 */
function resolveDocUrl(url: string): string {
    if (!url) return '';
    // Si ya es una URL absoluta (http/https), la devolvemos tal cual
    if (url.startsWith('http')) return url;
    // Eliminamos cualquier barra inicial duplicada
    const clean = url.replace(/^\/+/, '');
    return `${API_BASE_URL}/${clean}`;
}

export const AcademicService = {
    async getExpedientes(): Promise<Expediente[]> {
        // Usamos el endpoint dedicado que devuelve TODOS los postulantes con su estado
        const data = await fetchApi('all_postulantes');
        if (!Array.isArray(data)) return [];
        
        return data.map((p: any) => ({
            id: p.cedula,          // Usamos cédula como ID único real
            nombre: `${p.nombre} ${p.apellido}`,
            nombre_real: p.nombre,
            apellido_real: p.apellido,
            cedula: p.cedula,
            carrera: p.carrera || 'No especificada',
            sede: p.sede || 'Santa Rosa de Lima',
            numero_expediente: p.numero_expediente || '',
            tipo: p.tipo_usuario === 'concursante_docente' || p.tipo_usuario === 'auxiliar_docente'
                ? 'docente'
                : 'postulante',
            tipo_usuario: p.tipo_usuario,
            fechaEnvio: p.fecha_registro
                ? p.fecha_registro.split(' ')[0]
                : '—',
            // estado_revision viene directo de la BD: 'pendiente' | 'verificado' | 'rechazado'
            estado: p.estado_revision === 'verificado'
                ? 'aprobado'
                : (p.estado_revision === 'rechazado' ? 'rechazado' : 'pendiente'),
            totalDocs: parseInt(p.total_docs) || 0,
            documentos: [] // Se cargan bajo demanda al abrir el expediente
        }));
    },

    async getDocsForPostulante(cedula: string): Promise<Expediente['documentos']> {
        const raw = await fetchApi(`docs=${cedula}`);
        if (!Array.isArray(raw)) return [];
        
        const labelsMap: Record<string, string> = {
            cv: 'a) Currículum vitae actualizado',
            solicitud_participacion: 'a.1) Nota de Solicitud de Participación en el Concurso',
            cedula: 'b) Fotocopia autenticada por Escribanía de la C.I.',
            titulos: 'c) Fotocopia autenticada de Certificados y Títulos',
            cursos: 'd) Fotocopia simple de certificados de cursos/talleres',
            declaracion_jurada: 'e) Declaración jurada de no hallarse en inhabilidades',
            antecedente_judicial: 'f) Certificado de antecedente judicial',
            antecedente_policial: 'g) Certificado de antecedente policial',
            comprobante_pago: 'h) Pago del arancel de inscripción',
            estudio: 'Certificado de Estudios (Educación Media)',
            titulo: 'Fotocopia del Título de Bachiller',
            nacimiento: 'Certificado de Nacimiento',
            foto: 'Fotografía',
            otro: 'Documento Adjunto'
        };

        return raw.map((d: any) => ({
            id: d.tipo_documento,
            nombre: labelsMap[d.tipo_documento] || d.tipo_documento || 'Documento',
            // Resolvemos la URL para que sea accesible desde el navegador
            url: resolveDocUrl(d.archivo_url),
            estado: d.estado === 'validado' ? 'aprobado' : 'pendiente',
            observaciones: d.observaciones || undefined,
            asignatura: d.asignatura || undefined
        }));
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

    async validateDocument(cedula: string, docId: string, asignatura?: string) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'validate_doc',
                cedula: cedula,
                doc_id: docId,
                asignatura: asignatura
            })
        });
    },

    async saveDocumentObservation(cedula: string, docId: string, observation: string, asignatura?: string) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'save_doc_observation',
                cedula: cedula,
                doc_id: docId,
                observacion: observation,
                asignatura: asignatura
            })
        });
    },

    async markDocInCv(cedula: string, docId: string, cvUrl: string) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'mark_doc_in_cv',
                cedula: cedula,
                doc_id: docId,
                cv_url: cvUrl
            })
        });
    },

    async deleteExpediente(cedula: string, adminUser: string = 'academico') {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'delete_external_user',
                cedula: cedula,
                admin_user: adminUser
            })
        });
    },

    async updatePostulante(
        cedulaActual: string,
        data: {
            nombre: string;
            apellido: string;
            cedula: string;
            carrera: string;
            sede: string;
            tipo_usuario: string;
        },
        adminUser: string = 'academico'
    ) {
        return fetchApi('', {
            method: 'POST',
            body: JSON.stringify({
                action: 'update_external_user',
                cedula_actual: cedulaActual,
                nombre: data.nombre,
                apellido: data.apellido,
                cedula: data.cedula,
                carrera: data.carrera,
                sede: data.sede,
                tipo_usuario: data.tipo_usuario,
                admin_user: adminUser
            })
        });
    }
};
