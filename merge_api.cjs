const fs = require('fs');

const publicApi = fs.readFileSync('public/api.php', 'utf8');
let rootApi = fs.readFileSync('api.php', 'utf8');

if (rootApi.includes('stats_finance')) {
    console.log('Finance endpoints already exist.');
    process.exit(0);
}

// Extract from 'import_demo_transactions' to the end of 'reconciliation_queue' block
const startMarker = "if (isset($_GET['import_demo_transactions'])) {";
const endMarker = "if (isset($_GET['reconciliation_queue'])) {";

const startIndex = publicApi.indexOf(startMarker);
if (startIndex === -1) {
    console.log('Start marker not found');
    process.exit(1);
}

const tempEndIndex = publicApi.indexOf(endMarker, startIndex);
let endIndex = publicApi.indexOf('exit;', tempEndIndex);
endIndex = publicApi.indexOf('}', endIndex) + 1; // get the closing brace of reconciliation_queue

if (endIndex === 0) {
    console.log('End marker not found');
    process.exit(1);
}

const financeCode = publicApi.substring(startIndex, endIndex);

// Find where to inject in root api.php. Let's append before the final generic error or end of file
const injectMarker = "if (isset($_GET['stats'])) {"; // Or just at the end before PHP closing tag if there is one
const injectionPoint = rootApi.lastIndexOf("if (isset($_GET["); 

// Safest way is just to append to the end of the GET block or before the end of the file.
// Let's inject it before the last switch or at the end.
rootApi = rootApi + "\n\n// --- FINANCE ENDPOINTS INJECTED ---\n" + financeCode + "\n\n";

fs.writeFileSync('api.php', rootApi);
console.log('Finance endpoints injected successfully.');
