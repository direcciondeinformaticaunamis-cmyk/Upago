/**
 * Catálogo Oficial de Sedes y Carreras — UNAMIS
 * Universidad Nacional de Misiones
 *
 * FUENTE ÚNICA DE VERDAD: Todos los módulos del sistema deben importar
 * desde este archivo. No duplicar ni editar localmente.
 */

export const CATALOGO_UNAMIS: Record<string, string[]> = {
    "Sede Ayolas": [
        "Lic. en Logística y Transporte",
        "Lic. en Ciencias Básicas y sus Tecnologías"
    ],
    "Sede San Ignacio Guazú": [
        "Medicina",
        "Lic. en Ciencias Políticas y de Gobierno",
        "Lic. en Psicología General",
        "Lic. en Gerencia de Centrales Hidroeléctricas"
    ],
    "Sede San Juan Bautista": [
        "Esp. en Didáctica Superior Universitaria",
        "Lic. en Negocio Internacional",
        "Ingeniería Civil"
    ],
    "Sede Santa María de Fe": [
        "Lic. en Tecnología de la Producción",
        "Lic. en Tecnología de los Alimentos"
    ],
    "Sede Santa Rosa de Lima": [
        "Lic. en Ciencias Matemáticas",
        "Arquitectura",
        "Lic. en Enseñanza de Lengua y Literatura Castellana"
    ],
    "Sede Santiago": [
        "Ingeniería Agroindustrial"
    ],
    "Sede Villa Florida": [
        "Ingeniería Informática"
    ],
    "Sede Yabebyry": [
        "Lic. en Ciencias de la Educación"
    ]
};

/** Lista plana de todas las carreras (para selectores sin filtro de sede) */
export const TODAS_LAS_CARRERAS: string[] = Object.values(CATALOGO_UNAMIS).flat();

/** Lista de todas las sedes */
export const TODAS_LAS_SEDES: string[] = Object.keys(CATALOGO_UNAMIS);

/** Obtiene las carreras disponibles para una sede dada */
export const getCarrerasPorSede = (sede: string): string[] =>
    CATALOGO_UNAMIS[sede] ?? [];
