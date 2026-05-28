/**
 * Service to parse text from the UNAMIS Medicine Admission Form (Formulario de Admisión de Medicina 2026)
 * supports both digital PDF text extraction and scanned image OCR text.
 */

export interface ParsedFormData {
    nombre: string;
    apellido: string;
    cedula: string;
    ruc?: string;
    correo: string;
    telefono: string;
    fechaNacimiento: string;
    lugarNacimientoCiudad?: string;
    lugarNacimientoDepto?: string;
    nacionalidad?: string;
    paisOrigen?: string;
    genero: string;
    estadoCivil?: string;
    direccion: string;
    barrio?: string;
    carrera: string;
    sede: string;
    tipoUsuario: 'postulante' | 'concursante_docente' | 'auxiliar_docente';

    // Datos de Salud
    grupoSanguineo?: string;
    alergico?: string;
    seguroMedico?: string;
    esZurdo?: boolean;
    discapacidad?: string;
    discapacidadDetalle?: string;
    necesitaAdecuacion?: boolean;
    adecuacionDetalle?: string;
    enfermedadCronica?: string;

    // Antecedentes Académicos/Laborales
    colegioNombre?: string;
    colegioCiudad?: string;
    colegioDistrito?: string;
    colegioDepto?: string;
    colegioTipo?: string;
    bachillerTipo?: string;
    bachillerDetalle?: string;
    egresoAnio?: number;
    egresoPromedio?: number;
    trabaja?: boolean;
    empresaNombre?: string;
    cargo?: string;
    horarioLaboral?: string;
}

/**
 * Utility to clean extra whitespaces, linebreaks and normalize OCR text
 */
function cleanText(val: string | undefined | null): string {
    if (!val) return '';
    return val.replace(/\s+/g, ' ').trim();
}

/**
 * Checks if a specific checkbox or radio option is checked in the text near a keyword.
 * Looks for symbols like [x], [X], (x), (X), [✓], ☑, ☒, etc. near the target option text.
 */
function checkOptionStatus(text: string, optionKeyword: string, searchRadius: number = 30): boolean {
    const escapedKeyword = optionKeyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    
    // Pattern to look for checkmarks right before or after the keyword
    // Matches [x], [X], [v], [V], (x), (X), ☑, ☒, [✓], [✔], ✓, ✔, X, x, *
    const checkmarkPattern = /(?:\[[xXvV✓✔\s]*[xXvV✓✔][xXvV✓✔\s]*\]|\([xXvV✓✔\s]*[xXvV✓✔][xXvV✓✔\s]*\)|\b[xX]\b|☑|☒|✓|✔|●|■)/;
    
    // Find index of the option keyword in text
    const idx = text.toLowerCase().indexOf(optionKeyword.toLowerCase());
    if (idx === -1) return false;
    
    // Extract context surrounding the option word
    const start = Math.max(0, idx - searchRadius);
    const end = Math.min(text.length, idx + optionKeyword.length + searchRadius);
    const context = text.slice(start, end);
    
    // Check if checkmark pattern exists in the context around the keyword
    // (Focusing on checking within a few characters left/right)
    const relativeIdx = idx - start;
    const contextLeft = context.slice(Math.max(0, relativeIdx - 15), relativeIdx);
    const contextRight = context.slice(relativeIdx + optionKeyword.length, Math.min(context.length, relativeIdx + optionKeyword.length + 15));
    
    return checkmarkPattern.test(contextLeft) || checkmarkPattern.test(contextRight);
}

/**
 * Parse date components and return YYYY-MM-DD
 */
function normalizeDate(dayStr: string, monthStr: string, yearStr: string): string {
    let day = parseInt(dayStr.trim(), 10);
    let year = parseInt(yearStr.trim(), 10);
    let month = 0;

    const cleanMonth = monthStr.trim().toLowerCase();
    
    // Parse month name if it's Spanish text
    if (cleanMonth.startsWith('ene')) month = 1;
    else if (cleanMonth.startsWith('feb')) month = 2;
    else if (cleanMonth.startsWith('mar')) month = 3;
    else if (cleanMonth.startsWith('abr')) month = 4;
    else if (cleanMonth.startsWith('may')) month = 5;
    else if (cleanMonth.startsWith('jun')) month = 6;
    else if (cleanMonth.startsWith('jul')) month = 7;
    else if (cleanMonth.startsWith('ago')) month = 8;
    else if (cleanMonth.startsWith('sep')) month = 9;
    else if (cleanMonth.startsWith('oct')) month = 10;
    else if (cleanMonth.startsWith('nov')) month = 11;
    else if (cleanMonth.startsWith('dic')) month = 12;
    else {
        month = parseInt(cleanMonth, 10);
    }

    if (isNaN(day) || isNaN(month) || isNaN(year)) return '';

    // Handle 2-digit years
    if (year < 100) {
        year += year > 30 ? 1900 : 2000;
    }

    const mm = month < 10 ? `0${month}` : `${month}`;
    const dd = day < 10 ? `0${day}` : `${day}`;

    return `${year}-${mm}-${dd}`;
}

/**
 * Parses raw text and extracts the form data
 */
export function parseAdmissionForm(text: string): Partial<ParsedFormData> {
    const data: Partial<ParsedFormData> = {};
    
    // Helper to extract text between two anchors
    const extractBetween = (startAnchor: string, endAnchors: string[]): string => {
        const startIdx = text.toLowerCase().indexOf(startAnchor.toLowerCase());
        if (startIdx === -1) return '';
        
        const contentStart = startIdx + startAnchor.length;
        
        let nearestEndIdx = text.length;
        for (const endAnchor of endAnchors) {
            const endIdx = text.toLowerCase().indexOf(endAnchor.toLowerCase(), contentStart);
            if (endIdx !== -1 && endIdx < nearestEndIdx) {
                nearestEndIdx = endIdx;
            }
        }
        
        return cleanText(text.slice(contentStart, nearestEndIdx));
    };

    // 1. Unidad Académica
    data.sede = extractBetween('Sede:', ['Carrera:', '2. DATOS PERSONALES']) || 'San Ignacio Guazú';
    data.carrera = extractBetween('Carrera:', ['2. DATOS PERSONALES', 'Documento de Identidad']) || 'Medicina';

    // 2. Datos Personales
    data.cedula = extractBetween('Documento de Identidad N°:', ['RUC', 'Apellido/s:']).replace(/[^\d]/g, '');
    
    const rawRuc = extractBetween('RUC (*):', ['Apellido/s:', 'Nombre/s:']);
    if (rawRuc) data.ruc = rawRuc;

    data.apellido = extractBetween('Apellido/s:', ['Nombre/s:', 'Lugar de Nacimiento']);
    data.nombre = extractBetween('Nombre/s:', ['Lugar de Nacimiento', 'Fecha de Nacimiento']);
    
    data.lugarNacimientoCiudad = extractBetween('Lugar de Nacimiento (Ciudad):', ['Departamento:', 'Fecha de Nacimiento']);
    
    // We search for Departamento in the personal data section specifically
    const personalDataSection = text.slice(Math.max(0, text.indexOf('2. DATOS PERSONALES')), Math.max(0, text.indexOf('3. DATOS DE SALUD')));
    const deptMatch = personalDataSection.match(/Departamento:\s*([^\n:]+?)(?=\s*(?:Fecha de Nacimiento|Nacionalidad|$))/i);
    if (deptMatch) {
        data.lugarNacimientoDepto = cleanText(deptMatch[1]);
    }

    // Fecha de Nacimiento
    const dobRegex = /Fecha de Nacimiento:\s*(?:Día:\s*(\d+)\s*Mes:\s*([^\n\s:]+)\s*Año:\s*(\d+))/i;
    const dobMatch = text.match(dobRegex);
    if (dobMatch) {
        data.fechaNacimiento = normalizeDate(dobMatch[1], dobMatch[2], dobMatch[3]);
    } else {
        // Fallback: search for dd/mm/yyyy in the vicinity of "Fecha de Nacimiento"
        const dobIndex = text.indexOf('Fecha de Nacimiento:');
        if (dobIndex !== -1) {
            const context = text.slice(dobIndex, dobIndex + 100);
            const dateMatch = context.match(/(\d{1,2})[\/\s-](\d{1,2}|[a-zA-Záéíóú]+)[\/\s-](\d{2,4})/i);
            if (dateMatch) {
                data.fechaNacimiento = normalizeDate(dateMatch[1], dateMatch[2], dateMatch[3]);
            }
        }
    }

    data.nacionalidad = extractBetween('Nacionalidad:', ['País de Origen:', 'Sexo:']) || 'Paraguaya';
    data.paisOrigen = extractBetween('País de Origen:', ['Sexo:', 'Estado Civil:']) || 'Paraguay';

    // Genero/Sexo
    if (checkOptionStatus(text, 'M', 15)) {
        data.genero = 'M';
    } else if (checkOptionStatus(text, 'F', 15)) {
        data.genero = 'F';
    } else {
        // Fallback check: look at text value of "Sexo: [x] M" or "Sexo: M"
        const sexContext = extractBetween('Sexo:', ['Estado Civil:', 'Teléfono']);
        if (sexContext.toLowerCase().includes('masculino') || sexContext.startsWith('M') || sexContext.includes(' M ')) {
            data.genero = 'M';
        } else if (sexContext.toLowerCase().includes('femenino') || sexContext.startsWith('F') || sexContext.includes(' F ')) {
            data.genero = 'F';
        }
    }

    // Estado Civil
    if (checkOptionStatus(text, 'Soltero', 15)) data.estadoCivil = 'Soltero';
    else if (checkOptionStatus(text, 'Casado', 15)) data.estadoCivil = 'Casado';
    else if (checkOptionStatus(text, 'Divorciado', 15)) data.estadoCivil = 'Divorciado';
    else if (checkOptionStatus(text, 'Otro', 15)) data.estadoCivil = 'Otro';
    else {
        data.estadoCivil = 'Soltero';
    }

    data.telefono = extractBetween('Teléfono - Línea Baja y/o Celular:', ['E-mail:', 'Dirección Actual:']);
    data.correo = extractBetween('E-mail:', ['Dirección Actual:', 'Ciudad:']);

    // Dirección
    data.direccion = extractBetween('Dirección Actual:', ['N°:', 'Barrio:', 'Ciudad:']);
    data.barrio = extractBetween('Barrio:', ['Ciudad:', 'Departamento:']);
    
    // Colegio
    data.colegioNombre = extractBetween('Denominación del Colegio:', ['N°:', 'Ciudad:']);
    data.colegioCiudad = extractBetween('Ciudad:', ['Distrito:', 'Departamento:']);
    data.colegioDistrito = extractBetween('Distrito:', ['Departamento:', 'Tipo de Colegio:']);
    
    // We look for Departamento in the academic details section
    const academicSection = text.slice(Math.max(0, text.indexOf('4. ANTECEDENTES ACADÉMICOS')), Math.max(0, text.indexOf('5. DOCUMENTOS')));
    const acadDeptMatch = academicSection.match(/Departamento:\s*([^\n:]+?)(?=\s*(?:Tipo de Colegio|Bachiller|$))/i);
    if (acadDeptMatch) {
        data.colegioDepto = cleanText(acadDeptMatch[1]);
    }

    // Tipo de Colegio
    if (checkOptionStatus(text, 'Público', 15)) data.colegioTipo = 'Público';
    else if (checkOptionStatus(text, 'Privado Subvencionado', 15)) data.colegioTipo = 'Privado Subvencionado';
    else if (checkOptionStatus(text, 'Privado', 15)) data.colegioTipo = 'Privado';

    // Bachiller
    if (checkOptionStatus(text, 'Científico', 15)) {
        data.bachillerTipo = 'Científico';
        data.bachillerDetalle = extractBetween('Científico Especificar:', ['Técnico', 'Año de Egreso:']);
    } else if (checkOptionStatus(text, 'Técnico', 15)) {
        data.bachillerTipo = 'Técnico';
        data.bachillerDetalle = extractBetween('Técnico Especificar:', ['Año de Egreso:', 'Promedio']);
    }

    // Egreso
    const egresoMatch = text.match(/Año de Egreso:\s*(\d+)/i);
    if (egresoMatch) data.egresoAnio = parseInt(egresoMatch[1], 10);

    const promedioMatch = text.match(/Promedio de Egreso:\s*([\d\.,]+)/i);
    if (promedioMatch) {
        data.egresoPromedio = parseFloat(promedioMatch[1].replace(',', '.'));
    }

    // Trabaja
    if (checkOptionStatus(text, 'Trabaja: Si', 25) || checkOptionStatus(text, 'Si', 15)) {
        data.trabaja = true;
    } else if (checkOptionStatus(text, 'Trabaja: No', 25) || checkOptionStatus(text, 'No', 15)) {
        data.trabaja = false;
    }
    
    data.empresaNombre = extractBetween('Nombre de Empresa/Institución (*):', ['Cargo (*):']);
    data.cargo = extractBetween('Cargo (*):', ['Horario Laboral (*):']);
    data.horarioLaboral = extractBetween('Horario Laboral (*):', ['Inicio', '5. DOCUMENTOS']);

    // 3. Datos de Salud
    data.grupoSanguineo = extractBetween('Grupo Sanguíneo/RH (*):', ['Alérgico/a a (*):', '¿Tiene seguro']);
    data.alergico = extractBetween('Alérgico/a a (*):', ['¿Tiene seguro médico?']);

    // Seguro Médico
    if (checkOptionStatus(text, 'Público', 15)) data.seguroMedico = 'Público';
    else if (checkOptionStatus(text, 'Privado', 15)) data.seguroMedico = 'Privado';
    else if (checkOptionStatus(text, 'Ninguno', 15)) data.seguroMedico = 'Ninguno';

    // Es zurdo
    const zurdoContext = extractBetween('¿Es zurdo?', ['¿Tiene algún tipo de discapacidad?']);
    if (checkOptionStatus(zurdoContext, 'Si', 15) || checkOptionStatus(zurdoContext, 'Sí', 15)) {
        data.esZurdo = true;
    } else if (checkOptionStatus(zurdoContext, 'No', 15)) {
        data.esZurdo = false;
    }

    // Discapacidad
    if (checkOptionStatus(text, 'Visual', 15)) data.discapacidad = 'Visual';
    else if (checkOptionStatus(text, 'Motriz', 15)) data.discapacidad = 'Motriz';
    else if (checkOptionStatus(text, 'Auditiva', 15)) data.discapacidad = 'Auditiva';
    else if (checkOptionStatus(text, 'Otras', 15)) data.discapacidad = 'Otras';
    else data.discapacidad = 'Ninguna';

    data.discapacidadDetalle = extractBetween('Especificar la discapacidad a la que se refiere:', ['¿Necesita adecuación?']);

    // Necesita adecuación
    const adecuacionContext = extractBetween('¿Necesita adecuación?', ['Enfermedad Crónica']);
    if (checkOptionStatus(adecuacionContext, 'Si', 15) || checkOptionStatus(adecuacionContext, 'Sí', 15)) {
        data.necesitaAdecuacion = true;
        data.adecuacionDetalle = extractBetween('¿Necesita adecuación? Si No Especificar:', ['Enfermedad Crónica']);
    } else {
        data.necesitaAdecuacion = false;
    }

    // Enfermedad crónica
    const enfermedadContext = extractBetween('Enfermedad Crónica', ['4. ANTECEDENTES ACADÉMICOS']);
    if (checkOptionStatus(enfermedadContext, 'Si', 15) || checkOptionStatus(enfermedadContext, 'Sí', 15)) {
        data.enfermedadCronica = extractBetween('Enfermedad Crónica Si No Especificar:', ['4. ANTECEDENTES ACADÉMICOS']);
    }

    // Default fields
    data.tipoUsuario = 'postulante';

    return data;
}

/**
 * Parses raw OCR text from a Paraguayan Cédula de Identidad (ID Card)
 * supporting both front-side text parsing and back-side MRZ (Machine Readable Zone) parsing.
 */
export function parseCedula(text: string): Partial<ParsedFormData> {
    const data: Partial<ParsedFormData> = {};
    
    // Clean text for front-side fallback parsing
    const cleanTextVal = text.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ');
    console.log("Parsing Cédula OCR text (Front fallback context):", cleanTextVal);

    // --- MRZ (Machine Readable Zone) Parsing ---
    const rawLines = text.split(/\r?\n/);
    let mrzLine1 = '';
    let mrzLine2 = '';
    let mrzLine3 = '';
    
    let line1Idx = -1;
    let line2Idx = -1;
    
    const cleanedLines = rawLines.map(line => {
        let cleaned = line.toUpperCase().trim();
        // Replace typical OCR errors for '<'
        cleaned = cleaned.replace(/[\(\)\[\]\{\}\\\/\«\»\‹\›\*\+]/g, '<');
        // Remove spaces (MRZ has no spaces)
        cleaned = cleaned.replace(/\s+/g, '');
        // Standardize multiple '<'
        cleaned = cleaned.replace(/<+<+/g, '<<');
        return cleaned;
    });

    // 1. Search for Line 1 (starts with IDPRY / INPRY / IPPRY / I.PRY or close OCR approximations)
    for (let i = 0; i < cleanedLines.length; i++) {
        const line = cleanedLines[i];
        const match = line.match(/[I1|][A-Z0-9]PR[YV]/);
        if (match && match.index !== undefined) {
            const startIdx = match.index;
            const candidate = line.slice(startIdx);
            if (candidate.length >= 22) { // Allow slightly shorter if OCR truncated trailing <<
                mrzLine1 = candidate.slice(0, 30);
                line1Idx = i;
                break;
            }
        }
    }

    // 2. Search for Line 2 (contains DOB, Expiry, Nationality, etc.)
    // Standard format: YYMMDD[CheckDigit][M/F]YYMMDD[CheckDigit]PRY...
    for (let i = 0; i < cleanedLines.length; i++) {
        if (i === line1Idx) continue;
        const line = cleanedLines[i];
        // Match DOB (6 digits) + check (1 digit/char) + M/F/Check (1 char) + Expiry (6 digits) + check (1 digit/char) + PRY (3 chars)
        const match = line.match(/\d{6}[A-Z0-9][MF<]\d{6}[A-Z0-9][A-Z0-9]{3}/);
        if (match && match.index !== undefined) {
            const startIdx = match.index;
            const candidate = line.slice(startIdx);
            if (candidate.length >= 22) {
                mrzLine2 = candidate.slice(0, 30);
                line2Idx = i;
                break;
            }
        }
    }

    // 3. Search for Line 3 (Name line containing '<<')
    // Check lines close to Line 2 first
    if (line2Idx !== -1) {
        const nextIndices = [line2Idx + 1, line2Idx + 2, line2Idx - 1].filter(
            idx => idx >= 0 && idx < cleanedLines.length && idx !== line1Idx && idx !== line2Idx
        );
        for (const idx of nextIndices) {
            const line = cleanedLines[idx];
            if (line.includes('<<') && line.length >= 15) {
                mrzLine3 = line.slice(0, 30);
                break;
            }
        }
    }

    // Fallback search for Line 3 anywhere in the text
    if (!mrzLine3) {
        for (let i = 0; i < cleanedLines.length; i++) {
            if (i === line1Idx || i === line2Idx) continue;
            const line = cleanedLines[i];
            if (line.includes('<<') && line.length >= 15) {
                mrzLine3 = line.slice(0, 30);
                break;
            }
        }
    }

    // If we have MRZ lines, parse them!
    const mrzData: Partial<ParsedFormData> = {};
    
    if (mrzLine1) {
        console.log("Found MRZ Line 1:", mrzLine1);
        // Positions 5-13 (0-based) represents the Document Number field (9 chars)
        const docNumField = mrzLine1.slice(5, 14).replace(/</g, '');
        // Positions 15-29 represent the Optional Data field (15 chars)
        const optionalField = mrzLine1.slice(15, 30).replace(/</g, '');
        
        // Pick the field containing the Cédula (typically 6-8 digits)
        const optionalDigits = optionalField.replace(/[^\d]/g, '');
        const docNumDigits = docNumField.replace(/[^\d]/g, '');
        
        if (optionalDigits.length >= 6 && optionalDigits.length <= 8) {
            mrzData.cedula = optionalDigits;
        } else if (docNumDigits.length >= 6 && docNumDigits.length <= 8) {
            mrzData.cedula = docNumDigits;
        }
    }

    if (mrzLine2) {
        console.log("Found MRZ Line 2:", mrzLine2);
        // DOB: first 6 chars (YYMMDD)
        const dobStr = mrzLine2.slice(0, 6);
        if (/^\d{6}$/.test(dobStr)) {
            const yy = dobStr.slice(0, 2);
            const mm = dobStr.slice(2, 4);
            const dd = dobStr.slice(4, 6);
            
            const yyInt = parseInt(yy, 10);
            const currentYearLastTwo = new Date().getFullYear() % 100;
            const fullYear = yyInt > currentYearLastTwo ? 1900 + yyInt : 2000 + yyInt;
            
            // Format as YYYY-MM-DD
            mrzData.fechaNacimiento = `${fullYear}-${mm}-${dd}`;
        }
        
        // Sex: at position 7
        const sexChar = mrzLine2.charAt(7);
        if (sexChar === 'M') {
            mrzData.genero = 'M';
        } else if (sexChar === 'F') {
            mrzData.genero = 'F';
        }
        
        // Nationality: positions 15-17
        const natStr = mrzLine2.slice(15, 18);
        if (natStr === 'PRY') {
            mrzData.nacionalidad = 'Paraguaya';
            mrzData.paisOrigen = 'Paraguay';
        }
    }

    if (mrzLine3) {
        console.log("Found MRZ Line 3:", mrzLine3);
        const parts = mrzLine3.split('<<');
        const surnamesPart = parts[0] || '';
        const givenNamesPart = parts[1] || '';
        
        const surnames = surnamesPart.replace(/</g, ' ').replace(/\s+/g, ' ').trim();
        const givenNames = givenNamesPart.replace(/</g, ' ').replace(/\s+/g, ' ').trim();
        
        const toTitleCase = (str: string): string => {
            return str.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
        };
        
        if (surnames) {
            mrzData.apellido = toTitleCase(surnames);
        }
        if (givenNames) {
            mrzData.nombre = toTitleCase(givenNames);
        }
    }

    console.log("Extracted MRZ Data:", mrzData);

    // --- Front Side / Standard Regex Parser Fallback ---
    // 1. Cédula Number Fallback
    const cedulaRegexes = [
        /(?:N[°ºo]|NUMERO|DOCUMENTO|REGISTRO)[:\s]*(\d[\d\.\s-]{5,9}\d)/i,
        /(\b\d{1,3}(?:\.\d{3}){2}\b)/,
        /(\b\d{6,8}\b)/
    ];

    let frontCedula = '';
    for (const regex of cedulaRegexes) {
        const match = cleanTextVal.match(regex);
        if (match) {
            const val = match[1].replace(/[^\d]/g, '');
            if (val.length >= 6 && val.length <= 8) {
                frontCedula = val;
                break;
            }
        }
    }

    // 2. Apellidos Fallback
    let frontApellido = '';
    const surnameMatch = cleanTextVal.match(/APELLIDO[S]?\s*(?:\/\s*SURNAME[S]?)?\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)/i);
    if (surnameMatch) {
        frontApellido = surnameMatch[1].trim();
    }

    // 3. Nombres Fallback
    let frontNombre = '';
    const nameMatch = cleanTextVal.match(/NOMBRE[S]?\s*(?:\/\s*GIVEN\s*NAME[S]?)?\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ]+(?:\s+[A-ZÁÉÍÓÚÑa-záéíóúñ]+)*)/i);
    if (nameMatch) {
        frontNombre = nameMatch[1].trim();
    }

    // 4. Nacionalidad Fallback
    let frontNacionalidad = '';
    let frontPaisOrigen = '';
    const nationalityMatch = cleanTextVal.match(/NACIONALIDAD\s*(?:\/\s*NATIONALITY)?\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ]+)/i);
    if (nationalityMatch) {
        const nac = nationalityMatch[1].trim().toLowerCase();
        if (nac.includes('paraguay')) {
            frontNacionalidad = 'Paraguaya';
            frontPaisOrigen = 'Paraguay';
        } else {
            frontNacionalidad = nac.charAt(0).toUpperCase() + nac.slice(1);
        }
    }

    // 5. Sexo Fallback
    let frontGenero = '';
    const sexoMatch = cleanTextVal.match(/SEXO\s*(?:\/\s*SEX)?\s*[:\-]?\s*([M|F|Masculino|Femenino])/i);
    if (sexoMatch) {
        const val = sexoMatch[1].trim().toUpperCase();
        if (val.startsWith('M')) frontGenero = 'M';
        else if (val.startsWith('F')) frontGenero = 'F';
    } else {
        const sexoIndex = cleanTextVal.toLowerCase().indexOf('sexo');
        if (sexoIndex !== -1) {
            const context = cleanTextVal.slice(sexoIndex, sexoIndex + 40);
            if (/\b(MASCULINO|M)\b/i.test(context)) {
                frontGenero = 'M';
            } else if (/\b(FEMENINO|F)\b/i.test(context)) {
                frontGenero = 'F';
            }
        }
    }

    // 6. Estado Civil Fallback
    let frontEstadoCivil = '';
    const civilMatch = cleanTextVal.match(/ESTADO\s*CIVIL\s*(?:\/\s*MARITAL\s*STATUS)?\s*[:\-]?\s*([A-ZÁÉÍÓÚÑa-záéíóúñ\/]+)/i);
    if (civilMatch) {
        const val = civilMatch[1].trim().toUpperCase();
        if (val.startsWith('SOLT')) frontEstadoCivil = 'Soltero';
        else if (val.startsWith('CAS')) frontEstadoCivil = 'Casado';
        else if (val.startsWith('DIV')) frontEstadoCivil = 'Divorciado';
        else if (val.startsWith('VIU')) frontEstadoCivil = 'Otro';
    }

    // 7. Fecha de Nacimiento Fallback
    let frontFechaNacimiento = '';
    const dobMatch = cleanTextVal.match(/FECHA\s*DE\s*NACIMIENTO\s*(?:\/\s*DATE\s*OF\s*BIRTH)?\s*[:\-]?\s*([\d\/\.\s-a-zA-Záéíóú]+)/i);
    if (dobMatch) {
        const rawDate = dobMatch[1].trim();
        const dmy = rawDate.match(/(\d{1,2})[\/\s\.-](\d{1,2}|[a-zA-Záéíóú]+)[\/\s\.-](\d{2,4})/i);
        if (dmy) {
            frontFechaNacimiento = normalizeDate(dmy[1], dmy[2], dmy[3]);
        }
    }

    if (!frontFechaNacimiento) {
        const allDates = cleanTextVal.matchAll(/(\d{1,2})[\/\s\.-](\d{1,2}|[a-zA-Z]{3,10})[\/\s\.-](\d{4})/gi);
        for (const m of allDates) {
            const normalized = normalizeDate(m[1], m[2], m[3]);
            if (normalized) {
                frontFechaNacimiento = normalized;
                break;
            }
        }
    }

    // --- Merge Results (MRZ takes priority, front side serves as fallback) ---
    data.cedula = mrzData.cedula || frontCedula;
    data.apellido = mrzData.apellido || frontApellido;
    data.nombre = mrzData.nombre || frontNombre;
    data.fechaNacimiento = mrzData.fechaNacimiento || frontFechaNacimiento;
    data.genero = mrzData.genero || frontGenero;
    data.nacionalidad = mrzData.nacionalidad || frontNacionalidad;
    data.paisOrigen = mrzData.paisOrigen || frontPaisOrigen;
    data.estadoCivil = mrzData.estadoCivil || frontEstadoCivil;

    console.log("Parsed final Cédula result:", data);
    return data;
}

