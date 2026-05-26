-- Script de Reparación para MiUNAMIS
USE `u876493207_upagobd`;
-- Ejecute esto en phpMyAdmin si recibe el error "Column not found: observaciones"

ALTER TABLE `postulantes` ADD `estado_revision` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente' AFTER `foto_url`;
ALTER TABLE `postulantes` ADD `observaciones` text DEFAULT NULL AFTER `estado_revision`;

-- Ejecute esto si recibe un error 500 al registrar pagos
ALTER TABLE `pagos` ADD `num_comprobante` varchar(255) DEFAULT NULL AFTER `monto`;
ALTER TABLE `pagos` ADD `asignatura` varchar(255) DEFAULT NULL AFTER `comprobante_nombre`;
