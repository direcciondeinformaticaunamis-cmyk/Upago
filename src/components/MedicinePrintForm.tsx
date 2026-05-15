import React from 'react';
import { User, CreditCard, Mail, Phone, MapPin, School, HeartPulse, FileText, CheckCircle2 } from 'lucide-react';

interface MedicinePrintFormProps {
    data: any;
    onClose: () => void;
}

const MedicinePrintForm: React.FC<MedicinePrintFormProps> = ({ data, onClose }) => {
    const today = new Date();
    const day = today.getDate().toString().padStart(2, '0');
    const month = (today.getMonth() + 1).toString().padStart(2, '0');
    const year = today.getFullYear();

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 overflow-y-auto print:static print:p-0 print:bg-white">
            <div className="bg-white w-full max-w-4xl min-h-[1100px] shadow-2xl rounded-[2rem] p-10 print:shadow-none print:rounded-none relative">
                
                {/* Print Controls */}
                <div className="absolute top-6 right-6 flex gap-4 print:hidden">
                    <button 
                        onClick={() => window.print()}
                        className="px-6 py-3 bg-primary text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                    >
                        <FileText size={16} /> Imprimir Formulario
                    </button>
                    <button 
                        onClick={onClose}
                        className="px-6 py-3 bg-white border border-slate-200 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                    >
                        Cerrar
                    </button>
                </div>

                {/* Header (Matches the image 100%) */}
                <div className="flex items-center justify-between border-b-2 border-primary/20 pb-6 mb-6">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-[8px] text-center p-2 border-2 border-slate-200">
                        ESCUDO<br/>UNAMIS
                    </div>
                    <div className="text-center flex-1 px-4">
                        <h1 className="text-xl font-black text-[#a31e32] uppercase tracking-tight">Universidad Nacional de Misiones</h1>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-[0.15em] mt-1">Carrera de Medicina</p>
                        <p className="text-[8px] font-bold text-slate-400 mt-0.5">San Ignacio Guazú, Misiones - Paraguay</p>
                        <p className="text-[8px] font-bold text-primary mt-0.5 underline">Web: www.unamis.edu.py Correo: medicina@unamis.edu.py</p>
                    </div>
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 font-bold text-[8px] text-center p-2 border-2 border-slate-200">
                        LOGO<br/>MEDICINA
                    </div>
                </div>

                {/* Title Bar */}
                <div className="bg-[#a31e32] text-white text-center py-2.5 rounded-lg mb-6">
                    <h2 className="text-xs font-black uppercase tracking-[0.2em]">Formulario de Inscripción para la Evaluación de Admisión</h2>
                </div>

                {/* Info Bar */}
                <div className="grid grid-cols-4 gap-2 mb-8 text-[10px] font-bold uppercase tracking-wider">
                    <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">Lugar: <span className="text-slate-900 ml-1">{data.sede || 'San Ignacio Guazú'}</span></div>
                    <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">Día: <span className="text-slate-900 ml-1">{day}</span></div>
                    <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">Mes: <span className="text-slate-900 ml-1">{month}</span></div>
                    <div className="border border-slate-300 p-2 rounded-lg bg-slate-50">Año: <span className="text-slate-900 ml-1">{year}</span></div>
                </div>

                <div className="space-y-6">
                    {/* Section 1 */}
                    <section>
                        <h3 className="bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded mb-4">1. Identificación de la Unidad Académica</h3>
                        <div className="grid grid-cols-2 gap-4 text-[10px] font-bold">
                            <div className="flex gap-2"><span className="text-slate-400">Sede:</span> <span className="text-slate-900">{data.sede || 'San Ignacio Guazú'}</span></div>
                            <div className="flex gap-2"><span className="text-slate-400">Carrera:</span> <span className="text-slate-900">{data.carrera || 'Medicina'}</span></div>
                        </div>
                    </section>

                    {/* Section 2 */}
                    <section>
                        <h3 className="bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded mb-4">2. Datos Personales del Estudiante</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] font-bold border border-slate-200 p-4 rounded-xl">
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">C.I. N°:</span> <span className="text-slate-900">{data.cedula}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">RUC:</span> <span className="text-slate-900">{data.ruc || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Apellidos:</span> <span className="text-slate-900 uppercase">{data.apellido}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Nombres:</span> <span className="text-slate-900 uppercase">{data.nombre}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Ciudad Nac.:</span> <span className="text-slate-900">{data.lugarNacimientoCiudad || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Depto. Nac.:</span> <span className="text-slate-900">{data.lugarNacimientoDepto || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">Fecha Nac.:</span> <span className="text-slate-900">{data.fechaNacimiento || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Nacionalidad:</span> <span className="text-slate-900">{data.nacionalidad || 'Paraguaya'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">País de Origen:</span> <span className="text-slate-900">{data.paisOrigen || 'Paraguay'}</span></div>
                            
                            <div className="col-span-2 flex items-center gap-6 py-1 border-b border-slate-100">
                                <span className="text-slate-400">Sexo:</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 border border-slate-400 flex items-center justify-center ${data.genero === 'Masculino' ? 'bg-primary' : ''}`}></div>
                                    <span>M</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-4 h-4 border border-slate-400 flex items-center justify-center ${data.genero === 'Femenino' ? 'bg-primary' : ''}`}></div>
                                    <span>F</span>
                                </div>
                                
                                <span className="text-slate-400 ml-4">Estado Civil:</span>
                                <span className="text-slate-900 italic underline">{data.estadoCivil}</span>
                            </div>

                            <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">Teléfono:</span> <span className="text-slate-900">{data.telefono}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">E-mail:</span> <span className="text-slate-900 font-normal">{data.correo}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">Dirección:</span> <span className="text-slate-900">{data.direccion}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Barrio:</span> <span className="text-slate-900">{data.barrio || 'N/A'}</span></div>
                        </div>
                    </section>

                    {/* Section 3 */}
                    <section>
                        <h3 className="bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded mb-4">3. Datos de Salud</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] font-bold border border-slate-200 p-4 rounded-xl">
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Grupo Sanguíneo/RH:</span> <span className="text-slate-900">{data.grupoSanguineo || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Alérgico a:</span> <span className="text-slate-900">{data.alergico || 'No especifica'}</span></div>
                            
                            <div className="col-span-2 flex items-center gap-6 py-1 border-b border-slate-100">
                                <span className="text-slate-400">Seguro Médico:</span>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 border border-slate-400 ${data.seguroMedico === 'Público' ? 'bg-primary' : ''}`}></div>
                                    <span className="text-[9px]">Público</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 border border-slate-400 ${data.seguroMedico === 'Privado' ? 'bg-primary' : ''}`}></div>
                                    <span className="text-[9px]">Privado</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-3 h-3 border border-slate-400 ${data.seguroMedico === 'Ninguno' ? 'bg-primary' : ''}`}></div>
                                    <span className="text-[9px]">Ninguno</span>
                                </div>
                            </div>

                            <div className="col-span-2 flex gap-4">
                                <div className="flex gap-2"><span className="text-slate-400">Discapacidad:</span> <span className="text-slate-900">{data.discapacidad}</span></div>
                                <div className="flex gap-2"><span className="text-slate-400">Crónica:</span> <span className="text-slate-900">{data.enfermedadCronica || 'Ninguna'}</span></div>
                            </div>
                        </div>
                    </section>

                    {/* Section 4 */}
                    <section>
                        <h3 className="bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded mb-4">4. Antecedentes Académicos Laborales</h3>
                        <div className="grid grid-cols-2 gap-x-6 gap-y-3 text-[10px] font-bold border border-slate-200 p-4 rounded-xl">
                            <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">Colegio:</span> <span className="text-slate-900">{data.colegioNombre || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Ciudad:</span> <span className="text-slate-900">{data.colegioCiudad || 'N/A'}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Año Egreso:</span> <span className="text-slate-900">{data.egresoAnio}</span></div>
                            
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Tipo Colegio:</span> <span className="text-slate-900">{data.colegioTipo}</span></div>
                            <div className="flex gap-2 border-b border-slate-100 pb-1"><span className="text-slate-400">Promedio:</span> <span className="text-slate-900">{data.egresoPromedio}</span></div>
                            
                            {data.trabaja && (
                                <>
                                    <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">Empresa:</span> <span className="text-slate-900">{data.empresaNombre}</span></div>
                                    <div className="flex gap-2 border-b border-slate-100 pb-1 col-span-2"><span className="text-slate-400">Cargo/Horario:</span> <span className="text-slate-900 font-normal">{data.cargo}</span></div>
                                </>
                            )}
                        </div>
                    </section>

                    {/* Section 5 */}
                    <section>
                        <h3 className="bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded mb-4">5. Documentos Presentados</h3>
                        <div className="space-y-2 text-[9px] font-bold px-4">
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-1">
                                <div className="w-4 h-4 border border-slate-400"></div>
                                <span>a- Certificado de Estudio de Bachiller</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-1">
                                <div className="w-4 h-4 border border-slate-400"></div>
                                <span>b- Fotocopia del Título de Bachiller</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-1">
                                <div className="w-4 h-4 border border-slate-400"></div>
                                <span>c- Fotocopia de Documento de Identidad</span>
                            </div>
                            <div className="flex items-center gap-4 border-b border-slate-100 pb-1">
                                <div className="w-4 h-4 border border-slate-400"></div>
                                <span>d- Certificado de Antecedente Policial</span>
                            </div>
                        </div>
                    </section>

                    {/* Section 6 */}
                    <section>
                        <h3 className="bg-slate-200 text-slate-800 text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded mb-4">De Uso Exclusivo de la Institución</h3>
                        <div className="grid grid-cols-3 gap-4 text-[9px] font-bold border border-slate-200 p-4 rounded-xl">
                            <div className="space-y-4">
                                <p>Recibido por:</p>
                                <div className="border-b border-slate-300 h-6"></div>
                            </div>
                            <div className="space-y-4">
                                <p>Firma:</p>
                                <div className="border-b border-slate-300 h-6"></div>
                            </div>
                            <div className="space-y-4">
                                <p>Fecha:</p>
                                <div className="border-b border-slate-300 h-6"></div>
                            </div>
                            <div className="space-y-4">
                                <p>Verificado por:</p>
                                <div className="border-b border-slate-300 h-6"></div>
                            </div>
                            <div className="space-y-4">
                                <p>Firma:</p>
                                <div className="border-b border-slate-300 h-6"></div>
                            </div>
                            <div className="space-y-4">
                                <p>Fecha:</p>
                                <div className="border-b border-slate-300 h-6"></div>
                            </div>
                        </div>
                    </section>

                    {/* Footer Section */}
                    <div className="mt-12 border-t-2 border-slate-100 pt-8 grid grid-cols-2 gap-20">
                        <div className="text-center">
                            <div className="h-20 border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Firma del Interesado</p>
                        </div>
                        <div className="text-center">
                            <div className="h-20 border-b border-slate-400 mb-2"></div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Firma y Sello - Admisión</p>
                        </div>
                    </div>

                    <div className="mt-8 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-[7px] font-bold text-slate-500 leading-relaxed text-justify">
                            Esta solicitud no es válida sin la firma del interesado y la persona autorizada por la institución. Los datos aquí consignados tendrán carácter de Declaración Jurada, por lo que, si hay indicios de falsedad de datos, los antecedentes serán remitidos al Ministerio Público para su investigación, según lo contemplado en el Código Penal Paraguayo en sus artículos 187, 243 y 262 respectivamente.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MedicinePrintForm;
