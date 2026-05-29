const fs = require('fs');
let content = fs.readFileSync('src/components/PersonalDataForm.tsx', 'utf8');

// 1. Add fields to FormData
const newFields = `
    // Docente: Antecedentes Académicos
    tituloGrado?: string;
    tituloPosgrado?: string;
    formacionComplementaria?: string;
    areaEspecializacion?: string;

    // Docente: Experiencia Docente
    expDocenteInstituciones?: string;
    expDocenteAsignaturas?: string;
    expDocenteNivel?: string;
    expDocenteAnios?: string;
    expDocenteCatedra?: string;

    // Docente: Experiencia Profesional (no docente)
    expProfArea?: string;
    expProfInstituciones?: string;
    expProfCargo?: string;
    expProfAnios?: string;
`;
content = content.replace('    colegioNombre?: string;', newFields + '\n    colegioNombre?: string;');

// 2. Add isDocente boolean
content = content.replace(
    'const selectedCatedras = formData.catedra',
    'const isDocente = formData.tipoUsuario === \\'concursante_docente\\' || formData.tipoUsuario === \\'auxiliar_docente\\';\n\n    const selectedCatedras = formData.catedra'
);

// 3. Move Contacto y Ubicación
const contactoRegex = /\\s*\\{\\/\\* Section 3: Contacto \\*\\/\\}[\\s\\S]*?<\\/motion\\.section>/;
const contactoMatch = content.match(contactoRegex);
if (contactoMatch) {
    const contactoStr = contactoMatch[0];
    content = content.replace(contactoStr, '');
    
    // Insert after Datos Personales
    const datosPersonalesEndRegex = /<\\/motion\\.section>\\s*\\{\\/\\* Section 2: Tipo de Registro \\*\\/\\}/;
    content = content.replace(datosPersonalesEndRegex, `</motion.section>\n\n` + contactoStr.trim() + `\n\n                {/* Section 2: Tipo de Registro */}`);
    
    // Fix Section numbering in the text
    content = content.replace('{/* Section 3: Contacto */}', '{/* Section: Contacto */}');
}

// 4. Update Datos de Salud condition
content = content.replace(
    /{formData\.carrera && formData\.carrera\.includes\('Medicina'\) && \(\s*<motion\.section[\s\S]*?<SectionTitle[\s\S]*?title="Datos de Salud"/,
    (match) => match.replace('&& (', '&& !isDocente && (')
);

fs.writeFileSync('src/components/PersonalDataForm.tsx', content, 'utf8');
console.log('Modifications done part 1.');
