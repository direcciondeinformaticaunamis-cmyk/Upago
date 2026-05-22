-- SCRIPT DE DATOS DE PRUEBA PARA MÓDULO DE FINANZAS UNAMIS

-- 1. Asegurar que existan estudiantes de prueba
INSERT INTO `postulantes` (nombre, apellido, cedula, correo, carrera, sede) VALUES 
('MIGUEL ANGEL', 'ORTIZ', '2024-001', 'm.ortiz@unamis.edu.py', 'Administración', 'Central'),
('ELENA', 'RODRIGUEZ', '2024-002', 'e.rodriguez@unamis.edu.py', 'Derecho', 'Central'),
('JUAN CARLOS', 'PEREZ', '2024-003', 'j.perez@unamis.edu.py', 'Sistemas', 'Filial')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- 2. Insertar Pagos Pendientes en el sistema (lo que los alumnos declaran)
INSERT INTO `pagos` (postulante_cedula, concepto, monto, num_comprobante, estado, fecha_pago) VALUES 
('2024-001', 'Cuota Abril', 600000, 'TXN-9823', 'pendiente', '2024-04-25'),
('2024-002', 'Matrícula', 1200000, 'DEP-4456', 'pendiente', '2024-04-25'),
('2024-003', 'Derecho Examen', 150000, '778899', 'pendiente', '2024-04-24');

-- 3. Insertar Transacciones Bancarias (lo que viene en el extracto del banco)
INSERT INTO `transacciones_bancarias` (banco, referencia, monto, fecha_transaccion, descripcion, estado) VALUES 
-- Match Perfecto (Monto + Referencia + Nombre) -> 100 pts
('BANCO NACIONAL', 'TXN-9823', 600000, '2024-04-25', 'TRANSFERENCIA RECIBIDA DE MIGUEL ORTIZ REF TXN-9823', 'pendiente'),

-- Match por Monto y Nombre (No referencia) -> 70 pts
('BANCO NACIONAL', '88223344', 1200000, '2024-04-25', 'DEPOSITO EFECTIVO ELENA RODRIGUEZ', 'pendiente'),

-- Discrepancia (Solo monto coincide, descripción genérica) -> 50 pts
('BANCO NACIONAL', '99001122', 150000, '2024-04-24', 'PAGO SERVICIOS VARIOS CAJERO #40', 'pendiente'),

-- Transacción sin relación en el sistema -> 0 pts
('BANCO NACIONAL', '55443322', 850000, '2024-04-23', 'COMISION MANTENIMIENTO CUENTA', 'pendiente');

-- NOTA: Una vez ejecutado este script, al entrar en "Conciliación Bancaria", 
-- verás cómo el algoritmo asigna los puntajes automáticamente.
