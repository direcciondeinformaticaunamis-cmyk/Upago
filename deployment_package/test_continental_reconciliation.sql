-- DATOS DE PRUEBA BASADOS EN EXTRACTO BANCO CONTINENTAL
-- Para probar la conciliación automática

-- 1. Asegurar que existan pagos registrados por alumnos que coincidan con el extracto
INSERT INTO `postulantes` (nombre, apellido, cedula, correo, carrera, sede) VALUES 
('MIGUEL', 'FAMIPY', '5323447', 'm.famipy@email.com', 'Derecho', 'Central'),
('JUAN', 'COMAPY', '1234567', 'j.comapy@email.com', 'Administración', 'Central')
ON DUPLICATE KEY UPDATE nombre=nombre;

-- 2. Pagos que los alumnos declararon (Paso 1 del Bot)
INSERT INTO `pagos` (postulante_cedula, concepto, monto, num_comprobante, estado, fecha_pago) VALUES 
('5323447', 'Matrícula 2026', 350000, '260331829', 'pendiente', '2026-03-31'),
('1234567', 'Cuota Didáctica', 350000, '532344742509', 'pendiente', '2026-04-10')
ON DUPLICATE KEY UPDATE monto=monto;

-- 3. Movimientos del Banco (Lo que se importa del extracto)
INSERT INTO `transacciones_bancarias` (banco, referencia, monto, fecha_transaccion, descripcion, estado) VALUES 
('BANCO CONTINENTAL', '56 772047 95-SJB-SYS', 350000, '2026-03-31', 'TRF.INTRBN.SPI-FAMIPYPAARES260331829', 'pendiente'),
('BANCO CONTINENTAL', '56 67913836 25-CM-WEB', 350000, '2026-04-10', 'cuota didáctica | 532344742509', 'pendiente')
ON DUPLICATE KEY UPDATE monto=monto;
