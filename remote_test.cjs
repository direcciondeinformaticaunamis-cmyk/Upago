const https = require('https');

const loginData = JSON.stringify({
    action: 'admin_login',
    username: 'admin@unamis.edu.py',
    password: '17080602Diu26$'
});

const options = {
    hostname: 'upago.unamis.edu.py',
    port: 443,
    path: '/api.php',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': loginData.length
    }
};

const req = https.request(options, (res) => {
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        try {
            const response = JSON.parse(data);
            if (response.token) {
                console.log('Login successful, got token.');
                importDemo(response.token);
            } else {
                console.log('Login failed:', response);
            }
        } catch (e) {
            console.log('Error parsing JSON:', data);
        }
    });
});

req.on('error', (e) => {
    console.error(e);
});

req.write(loginData);
req.end();

function importDemo(token) {
    const opts = {
        hostname: 'upago.unamis.edu.py',
        port: 443,
        path: '/api.php?import_demo_transactions=1&token=' + encodeURIComponent(token),
        method: 'GET'
    };

    const req2 = https.request(opts, (res) => {
        let d = '';
        res.on('data', (chunk) => { d += chunk; });
        res.on('end', () => {
            console.log('Import response:', d);
            runBot(token);
        });
    });
    req2.end();
}

function runBot(token) {
    const opts = {
        hostname: 'upago.unamis.edu.py',
        port: 443,
        path: '/api.php?bot_auto_reconcile=1&token=' + encodeURIComponent(token),
        method: 'GET'
    };

    const req3 = https.request(opts, (res) => {
        let d = '';
        res.on('data', (chunk) => { d += chunk; });
        res.on('end', () => {
            console.log('Bot response:', d);
            checkQueue(token);
        });
    });
    req3.end();
}

function checkQueue(token) {
    const opts = {
        hostname: 'upago.unamis.edu.py',
        port: 443,
        path: '/api.php?reconciliation_queue=1&token=' + encodeURIComponent(token),
        method: 'GET'
    };

    const req4 = https.request(opts, (res) => {
        let d = '';
        res.on('data', (chunk) => { d += chunk; });
        res.on('end', () => {
            console.log('Reconciliation Queue Size:', JSON.parse(d).length);
        });
    });
    req4.end();
}
