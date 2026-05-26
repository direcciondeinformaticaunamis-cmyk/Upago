-- Script SQL para la Base de Datos UNAMIS (miunamisbd)
-- Generado para despliegue en Hostinger

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Tabla de Postulantes (Datos Personales)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `postulantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `carrera` varchar(255) NOT NULL,
  `sede` varchar(100) DEFAULT 'Santa Rosa de Lima',
  `foto_url` text DEFAULT NULL,
  `estado_revision` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `numero_expediente` varchar(50) DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula_unique` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabla de Expedientes (Documentos Digitales)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `expedientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postulante_id` varchar(20) NOT NULL, -- Ahora referencia a la cédula por simplicidad en este portal
  `tipo_documento` varchar(100) NOT NULL, -- Ej: 'cedula', 'nacimiento', 'titulo', etc.
  `archivo_nombre` varchar(255) NOT NULL,
  `archivo_url` text NOT NULL,
  `estado` enum('pendiente', 'subido', 'validado', 'error') DEFAULT 'subido',
  `fecha_carga` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`postulante_id`) REFERENCES `postulantes`(`cedula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla de Usuarios Administrativos
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `admin_users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `username` varchar(50) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre_completo` varchar(150) NOT NULL,
  `rol` varchar(50) DEFAULT 'admin',
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username_unique` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar usuario admin inicial (Password: Diu2026**)
-- Nota: En producción usar password_hash real.
INSERT INTO `admin_users` (`username`, `password_hash`, `nombre_completo`, `rol`) 
VALUES ('LELLC', 'Diu2026**', 'Director Administrativo', 'super_admin')
ON DUPLICATE KEY UPDATE username=username;

-- --------------------------------------------------------
-- 4. Tabla de Pagos
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postulante_cedula` varchar(20) NOT NULL,
  `concepto` varchar(100) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `num_comprobante` varchar(255) DEFAULT NULL,
  `comprobante_url` text DEFAULT NULL,
  `comprobante_nombre` varchar(255) DEFAULT NULL,
  `asignatura` varchar(255) DEFAULT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `estado` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `cierre_nro` int DEFAULT NULL,
  `cierre_fecha` date DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`postulante_cedula`) REFERENCES `postulantes`(`cedula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Tabla de Aranceles
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `aranceles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` enum('licenciatura', 'postgrado') NOT NULL,
  `concepto` varchar(150) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar aranceles base
INSERT INTO `aranceles` (`categoria`, `concepto`, `monto`, `descripcion`) VALUES
('licenciatura', 'Matrícula Semestral', 750000, 'Matrícula para el semestre académico'),
('licenciatura', 'Cuota Mensual', 350000, 'Cuota mensual de cursado'),
('licenciatura', 'Examen Final', 150000, 'Arancel por examen final'),
('licenciatura', 'Certificado de Estudios', 100000, 'Expedición de certificado'),
('licenciatura', 'Carnet Universitario', 50000, 'Expedición de carnet'),
('licenciatura', 'Arancel de Graduación', 2500000, 'Arancel para acto de graduación'),
('postgrado', 'Matrícula Postgrado', 1200000, 'Matrícula para programas de postgrado'),
('postgrado', 'Cuota Postgrado', 800000, 'Cuota mensual postgrado');

-- --------------------------------------------------------
-- 6. Tabla de Usuarios (Estudiantes + Admin + Finance)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(150) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `rol` enum('estudiante', 'admin', 'finance') DEFAULT 'estudiante',
  `estado` enum('activo', 'inactivo', 'pendiente') DEFAULT 'pendiente',
  `email_verificado` tinyint(1) DEFAULT 0,
  `ultimo_acceso` timestamp NULL DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email_unique` (`email`),
  UNIQUE KEY `cedula_unique` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Tabla de Datos Académicos del Estudiante
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `datos_academicos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `carrera` varchar(255) DEFAULT NULL,
  `sede` varchar(100) DEFAULT 'Santa Rosa de Lima',
  `foto_url` text DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `genero` varchar(20) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `estado_datos` enum('incompleto', 'completo') DEFAULT 'incompleto',
  `fecha_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 8. Tabla de Documentos del Estudiante
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `documentos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `archivo_nombre` varchar(255) NOT NULL,
  `archivo_url` text NOT NULL,
  `estado` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `fecha_carga` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 9. Tabla de Pagos Examen Medicina
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `pagos_examen` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL,
  `concepto` varchar(150) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `comprobante_url` text DEFAULT NULL,
  `comprobante_nombre` varchar(255) DEFAULT NULL,
  `estado` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`usuario_id`) REFERENCES `usuarios`(`id`) ON DELETE CASCADE,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 10. Tabla de Conciliación Bancaria
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `conciliacion` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `referencia_banco` varchar(100) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `fecha_banco` date NOT NULL,
  `pago_id` int(11) DEFAULT NULL,
  `estado` enum('conciliado', 'diferencia', 'sin_match') DEFAULT 'sin_match',
  `fecha_conciliacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`pago_id`) REFERENCES `pagos_examen`(`id`) ON DELETE SET NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 11. Tabla de Conceptos de Pago (Examen Medicina)
-- --------------------------------------------------------

CREATE TABLE IF NOT EXISTS `conceptos_pago` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `monto` decimal(12,0) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar conceptos de pago Medicina
INSERT INTO `conceptos_pago` (`nombre`, `descripcion`, `monto`) VALUES
('Examen de Admisión - Medicina', 'Examen de admisión para la carrera de Medicina', 350000),
('Examen de Admissions - Primera Instancia', 'Primer examen de admisión', 350000),
('Examen de Admisión - Segunda Instancia', 'Segundo examen de admisión (recuperatorio)', 175000);

COMMIT;
