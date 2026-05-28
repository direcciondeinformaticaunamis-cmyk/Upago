-- Script SQL para la Base de Datos UNAMIS (miunamisbd)
-- Generado para despliegue en Hostinger y Sincronizado con api.php
-- Fecha: 2026-05-28

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------
-- 1. Tabla de Postulantes
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `postulantes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `cedula` varchar(20) NOT NULL,
  `ruc` varchar(20) DEFAULT NULL,
  `correo` varchar(150) NOT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  `fecha_nacimiento` date DEFAULT NULL,
  `lugar_nacimiento_ciudad` varchar(100) DEFAULT NULL,
  `lugar_nacimiento_depto` varchar(100) DEFAULT NULL,
  `nacionalidad` varchar(100) DEFAULT 'Paraguaya',
  `pais_origen` varchar(100) DEFAULT 'Paraguay',
  `genero` varchar(20) DEFAULT NULL,
  `estado_civil` varchar(50) DEFAULT NULL,
  `direccion` text DEFAULT NULL,
  `barrio` varchar(100) DEFAULT NULL,
  `carrera` varchar(255) DEFAULT NULL,
  `sede` varchar(100) DEFAULT 'Santa Rosa de Lima',
  `tipo_usuario` enum('postulante', 'concursante_docente', 'auxiliar_docente') DEFAULT 'postulante',
  `grupo_sanguineo` varchar(10) DEFAULT NULL,
  `alergico` varchar(255) DEFAULT NULL,
  `seguro_medico` varchar(100) DEFAULT NULL,
  `es_zurdo` tinyint(1) DEFAULT 0,
  `discapacidad` varchar(100) DEFAULT 'Ninguna',
  `discapacidad_detalle` text DEFAULT NULL,
  `necesita_adecuacion` tinyint(1) DEFAULT 0,
  `adecuacion_detalle` text DEFAULT NULL,
  `enfermedad_cronica` varchar(255) DEFAULT NULL,
  `colegio_nombre` varchar(255) DEFAULT NULL,
  `colegio_ciudad` varchar(100) DEFAULT NULL,
  `colegio_distrito` varchar(100) DEFAULT NULL,
  `colegio_depto` varchar(100) DEFAULT NULL,
  `colegio_tipo` varchar(50) DEFAULT NULL,
  `bachiller_tipo` varchar(100) DEFAULT NULL,
  `egreso_anio` int(4) DEFAULT NULL,
  `egreso_promedio` decimal(4,2) DEFAULT NULL,
  `trabaja` tinyint(1) DEFAULT 0,
  `empresa_nombre` varchar(255) DEFAULT NULL,
  `cargo` varchar(150) DEFAULT NULL,
  `horario_laboral` varchar(100) DEFAULT NULL,
  `foto_url` text DEFAULT NULL,
  `estado_revision` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `numero_expediente` varchar(50) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL,
  `catedra` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `cedula_unique` (`cedula`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Tabla de Expedientes (Documentos Digitales)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `expedientes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postulante_id` varchar(20) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `archivo_nombre` varchar(255) NOT NULL,
  `archivo_url` text NOT NULL,
  `estado` enum('pendiente', 'subido', 'validado', 'error') DEFAULT 'subido',
  `observaciones` text DEFAULT NULL,
  `asignatura` varchar(150) DEFAULT NULL,
  `fecha_carga` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_postulante` FOREIGN KEY (`postulante_id`) REFERENCES `postulantes` (`cedula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Tabla de Pagos
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `pagos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `postulante_cedula` varchar(20) NOT NULL,
  `concepto` varchar(100) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `comprobante_url` text DEFAULT NULL,
  `comprobante_nombre` varchar(255) DEFAULT NULL,
  `num_comprobante` varchar(50) DEFAULT NULL,
  `asignatura` varchar(255) DEFAULT NULL,
  `banco` varchar(100) DEFAULT NULL,
  `estado` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente',
  `observaciones` text DEFAULT NULL,
  `fecha_pago` date DEFAULT NULL,
  `cierre_nro` int DEFAULT NULL,
  `cierre_fecha` date DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_pago_postulante` FOREIGN KEY (`postulante_cedula`) REFERENCES `postulantes` (`cedula`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Tabla de Aranceles Configurados
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `aranceles` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `categoria` varchar(100) NOT NULL,
  `concepto` varchar(150) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `activo` tinyint(1) DEFAULT 1,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insertar aranceles base
INSERT INTO `aranceles` (`categoria`, `concepto`, `monto`) VALUES
('ACADÉMICOS', 'CERTIFICADO DE ESTUDIOS', 53000),
('ACADÉMICOS', 'DIPLOMA DE GRADO Y POSTGRADO', 107000),
('ACADÉMICOS', 'PROGRAMAS DE ESTUDIOS POR ASIGNATURA', 35000),
('ACADÉMICOS', 'REGISTRO DE DIPLOMA DE GRADO EN EL MEC', 100000),
('ACADÉMICOS', 'REGISTRO DE DIPLOMA DE POSTGRADO EN EL MEC', 150000),
('ACADÉMICOS', 'ACTIVIDADES ACADÉMICAS', 0),
('ACADÉMICOS', 'TRASLADOS ENTRE CARRERAS UNAMIS', 200000),
('ACADÉMICOS', 'TRASLADOS OTRAS UNIVERSIDADES A UNAMIS', 300000),
('ACADÉMICOS', 'CONVALIDACIONES DE ASIGNATURA', 150000),
('ACADÉMICOS', 'INSCRIPCIÓN DE TÍTULO OBTENIDO EN OTRA U EN UNAMIS', 300000),
('ACADÉMICOS', 'INSCRIPCIÓN A CONCURSO DOCENTE', 300000),
('ACADÉMICOS', 'EXAMEN DE ADMISIÓN - MEDICINA (SAN IGNACIO)', 1000000),
('SERVICIOS', 'AUTENTICACIÓN DE DOCUMENTOS', 40000),
('SERVICIOS', 'CONSTANCIAS', 30000),
('SERVICIOS', 'FOTOCOPIAS DE EXPEDIENTE POR HOJA', 1000)
ON DUPLICATE KEY UPDATE `concepto` = `concepto`;

-- --------------------------------------------------------
-- 5. Tabla de Transacciones Bancarias (Extracto)
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `transacciones_bancarias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `banco` varchar(100) NOT NULL,
  `referencia` varchar(100) NOT NULL,
  `monto` decimal(12,0) NOT NULL,
  `fecha_transaccion` date NOT NULL,
  `descripcion` text DEFAULT NULL,
  `estado` enum('pendiente', 'conciliado', 'discrepancy') DEFAULT 'pendiente',
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Tabla de Roles Institucionales
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `roles_institucionales` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `correo` varchar(150) NOT NULL,
  `rol` enum('admin', 'academico') NOT NULL,
  `nombre_referencia` varchar(100) DEFAULT NULL,
  `password_hash` varchar(255) DEFAULT NULL COMMENT 'Contraseña individual opcional. Si está vacío, usa ADMIN_PASS global.',
  PRIMARY KEY (`id`),
  UNIQUE KEY `correo_unique` (`correo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Tabla de Conciliaciones
-- --------------------------------------------------------
CREATE TABLE IF NOT EXISTS `conciliaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `pago_id` int(11) NOT NULL,
  `transaccion_bancaria_id` int(11) NOT NULL,
  `usuario_admin` varchar(100) DEFAULT NULL,
  `metodo` enum('automatico', 'manual') DEFAULT 'manual',
  `fecha_conciliacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`pago_id`) REFERENCES `pagos` (`id`) ON DELETE CASCADE,
  FOREIGN KEY (`transaccion_bancaria_id`) REFERENCES `transacciones_bancarias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
