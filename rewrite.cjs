const fs = require('fs');
let content = fs.readFileSync('src/components/PersonalDataForm.tsx', 'utf8');

// 1. Add fields to FormData
const interfaceIndex = content.indexOf('    colegioNombre?: string;');
const newFields = `    // Docente: Antecedentes Académicos
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

    colegioNombre?: string;`;
content = content.replace('    colegioNombre?: string;', newFields);

// 2. Add isDocente boolean
content = content.replace(
    'const selectedCatedras = formData.catedra',
    `const isDocente = formData.tipoUsuario === 'concursante_docente' || formData.tipoUsuario === 'auxiliar_docente';\n\n    const selectedCatedras = formData.catedra`
);

// 3. Move Contacto y Ubicación
const s3Start = content.indexOf('{/* Section 3: Contacto */}');
if (s3Start > -1) {
    let s3End = content.indexOf('</motion.section>', s3Start) + '</motion.section>'.length;
    let s3Block = content.substring(s3Start, s3End);
    
    // Remove it from original place
    content = content.substring(0, s3Start) + content.substring(s3End);
    
    // Insert after Section 1 (before Section 2)
    const s2Start = content.indexOf('{/* Section 2: Tipo de Registro */}');
    content = content.substring(0, s2Start) + s3Block + '\n\n                ' + content.substring(s2Start);
}

// 4. Update Datos de Salud condition
const saludConditionTarget = `{formData.carrera && formData.carrera.includes('Medicina') && (\\n                    <motion.section \\n                        initial={{ opacity: 0, y: 10 }}\\n                        animate={{ opacity: 1, y: 0 }}\\n                        className="p-6 md:p-8 bg-emerald-50/10`;
const currentSaludStr = `{formData.carrera && formData.carrera.includes('Medicina') && (\n                    <motion.section \n                        initial={{ opacity: 0, y: 10 }}\n                        animate={{ opacity: 1, y: 0 }}\n                        className="p-6 md:p-8 bg-emerald-50/10`;

content = content.replace(currentSaludStr, currentSaludStr.replace('&& (', '&& !isDocente && ('));


// 5. Update Antecedentes section
const antecedentesStart = content.indexOf(`{/* Section: Antecedentes Académicos/Laborales (Only for Medicine/Postulantes) */}`);
const antecedentesEnd = content.indexOf(`</motion.section>`, antecedentesStart) + `</motion.section>`.length + 1;
// we also need to capture the closing parenthesis after motion.section! Wait, there is a `)}` after the motion section!
const fullAntecedentesEnd = content.indexOf(`)}`, antecedentesEnd) + 2;

const newAntecedentesBlock = `                {/* Section: Antecedentes Académicos/Laborales */}
                {(isDocente || (formData.carrera && formData.carrera.includes('Medicina'))) && (
                    <motion.section 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 md:p-8 bg-blue-50/10 rounded-3xl border border-blue-100 hover:border-blue-200/80 transition-all duration-300"
                    >
                        <SectionTitle
                            title="Antecedentes Académicos y Laborales"
                            subtitle={isDocente ? "Información de títulos y experiencia profesional." : "Información de su colegio secundario y situación laboral actual."}
                            icon={School}
                        />

                        {isDocente ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                                {/* Formación Académica */}
                                <div className="md:col-span-2 border-b border-blue-100 pb-2 mb-2">
                                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Formación Académica</h4>
                                </div>
                                
                                <AppInput
                                    label="Título de grado (carrera, universidad, año)"
                                    placeholder="Ej: Lic. en Enfermería - UNAMIS - 2018"
                                    value={formData.tituloGrado || ''}
                                    onChange={(e) => onChange('tituloGrado', e.target.value)}
                                />
                                <AppInput
                                    label="Título de posgrado (si corresponde)"
                                    placeholder="Especialización, maestría, doctorado"
                                    value={formData.tituloPosgrado || ''}
                                    onChange={(e) => onChange('tituloPosgrado', e.target.value)}
                                />
                                <AppInput
                                    label="Formación complementaria"
                                    placeholder="Cursos, diplomados, certificaciones"
                                    value={formData.formacionComplementaria || ''}
                                    onChange={(e) => onChange('formacionComplementaria', e.target.value)}
                                />
                                <AppInput
                                    label="Área de especialización"
                                    placeholder="Ej: Pediatría, Salud Pública..."
                                    value={formData.areaEspecializacion || ''}
                                    onChange={(e) => onChange('areaEspecializacion', e.target.value)}
                                />

                                {/* Experiencia Docente */}
                                <div className="md:col-span-2 border-b border-blue-100 pb-2 mb-2 mt-4">
                                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Experiencia Docente</h4>
                                </div>

                                <AppInput
                                    label="Instituciones en las que ha trabajado"
                                    placeholder="Ej: UNAMIS, UCA, etc."
                                    value={formData.expDocenteInstituciones || ''}
                                    onChange={(e) => onChange('expDocenteInstituciones', e.target.value)}
                                />
                                <AppInput
                                    label="Asignaturas dictadas"
                                    placeholder="Ej: Anatomía, Fisiología..."
                                    value={formData.expDocenteAsignaturas || ''}
                                    onChange={(e) => onChange('expDocenteAsignaturas', e.target.value)}
                                />
                                <AppInput
                                    label="Nivel educativo"
                                    placeholder="Universitario, terciario, etc."
                                    value={formData.expDocenteNivel || ''}
                                    onChange={(e) => onChange('expDocenteNivel', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <AppInput
                                        label="Años de exp. docente"
                                        placeholder="Ej: 5"
                                        type="number"
                                        value={formData.expDocenteAnios || ''}
                                        onChange={(e) => onChange('expDocenteAnios', e.target.value)}
                                    />
                                    <AppInput
                                        label="Exp. en la cátedra"
                                        placeholder="Sí/No - Detalle"
                                        value={formData.expDocenteCatedra || ''}
                                        onChange={(e) => onChange('expDocenteCatedra', e.target.value)}
                                    />
                                </div>

                                {/* Experiencia Profesional */}
                                <div className="md:col-span-2 border-b border-blue-100 pb-2 mb-2 mt-4">
                                    <h4 className="text-sm font-bold text-blue-900 uppercase tracking-widest">Experiencia Profesional (No docente)</h4>
                                </div>

                                <AppInput
                                    label="Área de desempeño"
                                    placeholder="Ej: Clínica Médica"
                                    value={formData.expProfArea || ''}
                                    onChange={(e) => onChange('expProfArea', e.target.value)}
                                />
                                <AppInput
                                    label="Instituciones o empresas"
                                    placeholder="Ej: Hospital Regional"
                                    value={formData.expProfInstituciones || ''}
                                    onChange={(e) => onChange('expProfInstituciones', e.target.value)}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <AppInput
                                        label="Cargo desempeñado"
                                        placeholder="Ej: Médico de Guardia"
                                        value={formData.expProfCargo || ''}
                                        onChange={(e) => onChange('expProfCargo', e.target.value)}
                                    />
                                    <AppInput
                                        label="Años de exp."
                                        placeholder="Ej: 3"
                                        type="number"
                                        value={formData.expProfAnios || ''}
                                        onChange={(e) => onChange('expProfAnios', e.target.value)}
                                    />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8 mt-6">
                                <AppInput
                                    label="Nombre de la Institución de Egreso"
                                    placeholder="Ej: Colegio Nacional de la Capital"
                                    value={formData.colegioNombre}
                                    onChange={(e) => onChange('colegioNombre', e.target.value)}
                                />

                                <div className="grid grid-cols-2 gap-4">
                                    <AppInput
                                        label="Ciudad del Colegio"
                                        value={formData.colegioCiudad}
                                        onChange={(e) => onChange('colegioCiudad', e.target.value)}
                                    />
                                    <AppInput
                                        label="Departamento"
                                        value={formData.colegioDepto}
                                        onChange={(e) => onChange('colegioDepto', e.target.value)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 w-full">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.1em] ml-1">
                                        Tipo de Institución
                                    </label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['Público', 'Privado', 'Subvencionado'].map((tc) => (
                                            <motion.button
                                                whileHover={{ y: -1 }}
                                                whileTap={{ scale: 0.98 }}
                                                key={tc}
                                                type="button"
                                                onClick={() => onChange('colegioTipo', tc)}
                                                className={\`
                                                    px-3 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300
                                                    \${formData.colegioTipo === tc
                                                        ? 'bg-slate-800 text-white border-slate-800 shadow-sm'
                                                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}
                                                \`}
                                            >
                                                {tc}
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <AppInput
                                        label="Año de Egreso"
                                        type="number"
                                        value={formData.egresoAnio}
                                        onChange={(e) => onChange('egresoAnio', parseInt(e.target.value) || undefined)}
                                    />
                                    <AppInput
                                        label="Promedio Final de Calificación"
                                        type="number"
                                        step="0.01"
                                        value={formData.egresoPromedio}
                                        onChange={(e) => onChange('egresoPromedio', parseFloat(e.target.value) || undefined)}
                                    />
                                </div>

                                <div className="flex flex-col gap-1.5 w-full md:col-span-2 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Situación Laboral Actual</label>
                                    <div className="flex flex-col md:flex-row gap-6 items-center">
                                        <div className="flex items-center gap-4 shrink-0">
                                            <span className="text-xs font-bold text-slate-600">¿Trabaja actualmente?</span>
                                            <div className="flex bg-white rounded-xl p-1 border border-slate-200 shadow-sm">
                                                <button 
                                                    type="button"
                                                    onClick={() => onChange('trabaja', true)}
                                                    className={\`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 \${formData.trabaja ? 'bg-[var(--primary)] text-white shadow-sm' : 'text-slate-400'}\`}
                                                >Sí</button>
                                                <button 
                                                    type="button"
                                                    onClick={() => onChange('trabaja', false)}
                                                    className={\`px-5 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all duration-300 \${!formData.trabaja ? 'bg-slate-200 text-slate-600 shadow-inner' : 'text-slate-400'}\`}
                                                >No</button>
                                            </div>
                                        </div>
                                        
                                        {formData.trabaja && (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -10 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4 w-full"
                                            >
                                                <AppInput
                                                    label="Empresa / Institución"
                                                    placeholder="Ej: Ministerio de Salud"
                                                    value={formData.empresaNombre}
                                                    onChange={(e) => onChange('empresaNombre', e.target.value)}
                                                />
                                                <AppInput
                                                    label="Cargo y Horario de Trabajo"
                                                    placeholder="Ej: Asistente - 07:00 a 13:00"
                                                    value={formData.cargo}
                                                    onChange={(e) => onChange('cargo', e.target.value)}
                                                />
                                            </motion.div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )}
                    </motion.section>
                )}`;

const oldAntecedentesStr = content.substring(antecedentesStart, fullAntecedentesEnd);
content = content.replace(oldAntecedentesStr, newAntecedentesBlock);

fs.writeFileSync('src/components/PersonalDataForm.tsx', content, 'utf8');
console.log('Modifications done successfully!');
