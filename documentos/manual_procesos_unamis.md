# Manual de Procesos Integrados: Plataforma UNAMIS
**Caso de Uso Práctico:** Inscripción y Pago de Arancel - Examen de Admisión Carrera de Medicina.

Este documento sirve como guía oficial para entender la interconexión entre los tres principales portales de la Universidad Nacional de Misiones (UNAMIS). El flujo garantiza seguridad, validación y transparencia en la inscripción de los estudiantes.

---

## 1. El Portal del Estudiante (Fase de Carga de Expediente)
**Actor Principal:** Estudiante Aspirante

Todo el proceso inicia cuando el aspirante a la Carrera de Medicina ingresa a la plataforma. Antes de poder realizar ningún pago, la universidad requiere que su expediente digital esté completo.

![Portal del Estudiante](file:///C:/Users/Usuario/.gemini/antigravity/brain/ef0f31ac-d72a-44ea-81b5-f76e268e8ef0/estudiante_portal_1778240420792.png)

### Paso a paso:
1. **Registro Inicial:** El estudiante se registra y accede al menú **Mis Datos**.
2. **Carga de Datos Personales:** Completa su número de cédula, correo, teléfono y selecciona la carrera (Medicina).
3. **Expediente Digital:** El sistema le solicita subir los documentos reglamentarios:
   - Cédula de Identidad autenticada.
   - Certificado de Nacimiento.
   - Título de Bachiller.
   - Certificado de Estudio.
4. **Finalizar:** Al confirmar la carga, el sistema bloquea temporalmente las opciones de pago. El estudiante recibe una alerta amarilla: *"A verificar - Sus documentos están en revisión"*.

---

## 2. El Portal Académico (Fase de Verificación y Aprobación)
**Actor Principal:** Coordinador / Equipo de Admisión

Una vez que el estudiante carga su expediente, la información es enrutada automáticamente hacia el equipo académico. Ellos son el filtro de calidad y autenticidad.

![Dashboard Académico](file:///C:/Users/Usuario/.gemini/antigravity/brain/ef0f31ac-d72a-44ea-81b5-f76e268e8ef0/coordinador_academico_1778240434471.png)

### Paso a paso:
1. **Revisión de la Cola:** El Coordinador ingresa a su sección de **Gestión de Admisión**.
2. **Auditoría Documental:** Selecciona el expediente del estudiante (estado *Pendiente*). El sistema le muestra en pantalla dividida los documentos cargados vs. los datos personales registrados.
3. **Toma de Decisión:**
   - **Aprobación:** Si los documentos son legibles y auténticos, el coordinador hace clic en "Aprobar Expediente".
   - **Rechazo:** Si falta autenticación o está borroso, se rechaza y el estudiante debe volver a subirlo.
4. **Desbloqueo:** Al ser *Aprobado*, el sistema automáticamente notifica al estudiante y **habilita su módulo de Pagos** en su portal.

---

## 3. El Portal Estudiantil (Fase de Pago)
**Actor Principal:** Estudiante Aspirante

Con el expediente con un check verde de "Aprobado", el estudiante tiene vía libre para completar su inscripción.

1. **Selección de Concepto:** Ingresa a la pestaña de **Pagos**.
2. **Subir Comprobante:** Selecciona el concepto de *"Examen Admisión - Medicina (350.000 PYG)"* y sube el PDF/Foto de la transferencia bancaria o depósito que realizó.
3. **Generación de Estado:** El pago queda como *"Pendiente de Verificación"* a la espera de que Tesorería valide que el dinero ingresó a la cuenta del banco.

---

## 4. El Portal Administrativo Financiero (Fase de Conciliación)
**Actor Principal:** Tesorería / Finanzas

La etapa final cierra el círculo. El equipo financiero se asegura de que el dinero esté realmente en el banco de la universidad y emite la factura legal.

![Dashboard Financiero](file:///C:/Users/Usuario/.gemini/antigravity/brain/ef0f31ac-d72a-44ea-81b5-f76e268e8ef0/admin_financiero_1778240450877.png)

### Paso a paso:
1. **Actividades Recientes:** El administrador visualiza en su panel principal que el estudiante subió un comprobante. Verá una etiqueta especial **"Exp. OK"**, lo que le indica a Finanzas que el estudiante *ya está aprobado académicamente*.
2. **Conciliación Bancaria:** Ingresa al módulo de **Conciliación**, revisa el extracto de Ueno Bank / Itaú y comprueba que los 350.000 PYG coinciden con el comprobante subido.
3. **Emisión y Cierre:**
   - Aprueba el pago ("Verificado").
   - El sistema genera el **Recibo/Factura Oficial**.
   - El estudiante ahora puede descargar su recibo oficial desde su propio portal, cerrando exitosamente su inscripción al Examen de Admisión de Medicina.
