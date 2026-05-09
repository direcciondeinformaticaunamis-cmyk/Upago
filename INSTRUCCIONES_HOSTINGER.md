# Instrucciones de Despliegue en Hostinger - MiUNAMIS

Para subir el portal a tu servidor de Hostinger, sigue estos pasos:

1. **Carpeta de subida**: Sube el contenido de la carpeta `dist` (no la carpeta en sí, sino los archivos que contiene: `index.html`, `manifest.webmanifest` y la carpeta `assets`) a tu directorio raíz (`public_html`).
2. **Base de Datos**: Importa el archivo `database_schema.sql` en tu base de datos MySQL de Hostinger.
3. **Configuración API**: Asegúrate de que el archivo `api.php` esté en el mismo directorio que el `index.html` si las llamadas son relativas. Si tienes una URL de API diferente, actualiza las constantes en el código fuente y vuelve a ejecutar `npm run build`.
4. **PWA**: El sistema está configurado para ejecutarse como una PWA. Una vez subido, limpia el caché de tu navegador para ver la nueva versión.

¡El portal está listo para producción con el diseño "Crimson Edition"! 💎
