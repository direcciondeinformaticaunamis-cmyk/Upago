const fs = require('fs');
const archiver = require('archiver');
const path = require('path');

const output = fs.createWriteStream(path.join(__dirname, 'deployment_package.zip'));
const archive = archiver('zip', {
  zlib: { level: 9 } // Mejor compresión
});

output.on('close', function() {
  console.log(archive.pointer() + ' total bytes');
  console.log('Archiver has been finalized and the output file descriptor has closed.');
});

archive.on('error', function(err) {
  throw err;
});

archive.pipe(output);

// Agregar toda la carpeta dist pero sus contenidos en la raíz del ZIP
archive.directory('dist/', false);

// Agregar los archivos clave en la raíz del ZIP
archive.file('public/api.php', { name: 'api.php' });
archive.file('config.php', { name: 'config.php' });
archive.file('security.php', { name: 'security.php' });
archive.file('.htaccess', { name: '.htaccess' });
archive.file('api-banco.php', { name: 'api-banco.php' });

archive.finalize();
