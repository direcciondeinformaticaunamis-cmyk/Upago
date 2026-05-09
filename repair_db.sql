-- Script de Reparación para MiUNAMIS
USE `u876493207_miunamisbd`;
-- Ejecute esto en phpMyAdmin si recibe el error "Column not found: observaciones"

ALTER TABLE `postulantes` ADD `estado_revision` enum('pendiente', 'verificado', 'rechazado') DEFAULT 'pendiente' AFTER `foto_url`;
ALTER TABLE `postulantes` ADD `observaciones` text DEFAULT NULL AFTER `estado_revision`;
