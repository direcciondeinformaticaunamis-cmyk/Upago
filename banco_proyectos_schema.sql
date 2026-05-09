-- Database Schema for Banco de Proyectos - MIUNAMIS

-- Projects Table
CREATE TABLE IF NOT EXISTS `banco_proyectos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(255) NOT NULL,
  `resumen` text NOT NULL,
  `tipo_proyecto` enum('investigacion', 'extension', 'tesis', 'integrador') NOT NULL,
  `estado` enum('borrador', 'en_revision', 'aprobado', 'rechazado', 'archivado') DEFAULT 'borrador',
  `sede` varchar(100) NOT NULL,
  `carrera` varchar(255) NOT NULL,
  `anio_academico` int(4) NOT NULL,
  `fecha_inicio` date DEFAULT NULL,
  `fecha_fin` date DEFAULT NULL,
  `presupuesto_estimado` decimal(15,2) DEFAULT 0.00,
  `moneda` varchar(10) DEFAULT 'PYG',
  `modalidad` varchar(50) DEFAULT 'presencial',
  `resolucion_nro` varchar(100) DEFAULT NULL,
  `archivo_resolucion_url` text DEFAULT NULL,
  `doi` varchar(100) DEFAULT NULL,
  `codigo_unico` varchar(50) DEFAULT NULL,
  `fecha_registro` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ultima_actualizacion` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Members (Relationship between projects and investigators/students)
CREATE TABLE IF NOT EXISTS `proyecto_miembros` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto_id` int(11) NOT NULL,
  `nombre_completo` varchar(200) NOT NULL,
  `cedula` varchar(20) DEFAULT NULL,
  `rol_en_proyecto` enum('director', 'co-director', 'investigador', 'estudiante', 'colaborador') NOT NULL,
  `correo` varchar(150) DEFAULT NULL,
  `telefono` varchar(50) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_proyecto_miembros` FOREIGN KEY (`proyecto_id`) REFERENCES `banco_proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Versions (For change control)
CREATE TABLE IF NOT EXISTS `proyecto_versiones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto_id` int(11) NOT NULL,
  `version` varchar(10) NOT NULL,
  `cambios` text NOT NULL,
  `archivo_url` text NOT NULL,
  `fecha_subida` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_proyecto_versiones` FOREIGN KEY (`proyecto_id`) REFERENCES `banco_proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Evaluations (Rubrics)
CREATE TABLE IF NOT EXISTS `proyecto_evaluaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto_id` int(11) NOT NULL,
  `evaluador_nombre` varchar(200) NOT NULL,
  `puntaje_total` int(11) DEFAULT 0,
  `comentarios` text DEFAULT NULL,
  `rubrica_json` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`rubrica_json`)),
  `estado_evaluacion` enum('pendiente', 'completada') DEFAULT 'pendiente',
  `fecha_evaluacion` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_proyecto_evaluaciones` FOREIGN KEY (`proyecto_id`) REFERENCES `banco_proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Project Comments/Observations
CREATE TABLE IF NOT EXISTS `proyecto_comentarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `proyecto_id` int(11) NOT NULL,
  `usuario_nombre` varchar(200) NOT NULL,
  `comentario` text NOT NULL,
  `es_privado` tinyint(1) DEFAULT 0, -- Solo para administradores
  `fecha_comentario` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_proyecto_comentarios` FOREIGN KEY (`proyecto_id`) REFERENCES `banco_proyectos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
