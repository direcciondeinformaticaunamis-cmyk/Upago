const fs = require('fs');
let content = fs.readFileSync('api.php', 'utf8');

// 1. Add to $cols_mig
const newCols = `        "titulo_grado" => "varchar(255) DEFAULT NULL",
        "titulo_posgrado" => "varchar(255) DEFAULT NULL",
        "formacion_complementaria" => "varchar(255) DEFAULT NULL",
        "area_especializacion" => "varchar(255) DEFAULT NULL",
        "exp_docente_instituciones" => "text DEFAULT NULL",
        "exp_docente_asignaturas" => "text DEFAULT NULL",
        "exp_docente_nivel" => "varchar(100) DEFAULT NULL",
        "exp_docente_anios" => "varchar(50) DEFAULT NULL",
        "exp_docente_catedra" => "varchar(255) DEFAULT NULL",
        "exp_prof_area" => "varchar(255) DEFAULT NULL",
        "exp_prof_instituciones" => "text DEFAULT NULL",
        "exp_prof_cargo" => "varchar(255) DEFAULT NULL",
        "exp_prof_anios" => "varchar(50) DEFAULT NULL",
`;

if (!content.includes('"titulo_grado"')) {
    content = content.replace(
        '"colegio_nombre" => "varchar(255) DEFAULT NULL",',
        newCols + '        "colegio_nombre" => "varchar(255) DEFAULT NULL",'
    );
}

// 2. Add to $fields list (we have to do it exactly where the array is)
const fieldsArrayRegex = /\\$fields\\s*=\\s*\\[([^\\]]+)\\];/;
const match = content.match(fieldsArrayRegex);

if (match && !match[0].includes('titulo_grado')) {
    const newFieldsString = `'titulo_grado', 'titulo_posgrado', 'formacion_complementaria', 'area_especializacion', 'exp_docente_instituciones', 'exp_docente_asignaturas', 'exp_docente_nivel', 'exp_docente_anios', 'exp_docente_catedra', 'exp_prof_area', 'exp_prof_instituciones', 'exp_prof_cargo', 'exp_prof_anios', `;
    const updatedArray = match[0].replace("'colegio_nombre'", newFieldsString + "'colegio_nombre'");
    content = content.replace(match[0], updatedArray);
}

// Also need to add to the first create table just in case, though cols_mig handles it via ALTER TABLE
const createTableTarget = /`colegio_nombre` varchar\\(255\\) DEFAULT NULL,/;
if (content.match(createTableTarget) && !content.includes('`titulo_grado`')) {
    const newCreateCols = `      \`titulo_grado\` varchar(255) DEFAULT NULL,
      \`titulo_posgrado\` varchar(255) DEFAULT NULL,
      \`formacion_complementaria\` varchar(255) DEFAULT NULL,
      \`area_especializacion\` varchar(255) DEFAULT NULL,
      \`exp_docente_instituciones\` text DEFAULT NULL,
      \`exp_docente_asignaturas\` text DEFAULT NULL,
      \`exp_docente_nivel\` varchar(100) DEFAULT NULL,
      \`exp_docente_anios\` varchar(50) DEFAULT NULL,
      \`exp_docente_catedra\` varchar(255) DEFAULT NULL,
      \`exp_prof_area\` varchar(255) DEFAULT NULL,
      \`exp_prof_instituciones\` text DEFAULT NULL,
      \`exp_prof_cargo\` varchar(255) DEFAULT NULL,
      \`exp_prof_anios\` varchar(50) DEFAULT NULL,
`;
    content = content.replace(createTableTarget, newCreateCols + '      `colegio_nombre` varchar(255) DEFAULT NULL,');
}

fs.writeFileSync('api.php', content, 'utf8');
console.log('Backend api.php updated');
