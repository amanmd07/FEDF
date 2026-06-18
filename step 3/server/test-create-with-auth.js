const http = require('http');

function login(cb) {
    const data = JSON.stringify({ username: 'reception1', password: 'MediFlowSecure2026!' });
    const opts = { hostname: 'localhost', port: 4000, path: '/api/auth/login', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length } };
    const req = http.request(opts, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => cb(null, JSON.parse(body).token));
    });
    req.on('error', cb);
    req.write(data); req.end();
}

function createPatient(token) {
    const data = JSON.stringify({ name: 'Auto Patient', age: 29, gender: 'Female' });
    const opts = { hostname: 'localhost', port: 4000, path: '/api/patients', method: 'POST', headers: { 'Content-Type': 'application/json', 'Content-Length': data.length, Authorization: 'Bearer ' + token } };
    const req = http.request(opts, res => {
        let body = '';
        res.on('data', c => body += c);
        res.on('end', () => { console.log('STATUS', res.statusCode); console.log('BODY', body); });
    });
    req.on('error', console.error);
    req.write(data); req.end();
}

login((err, token) => { if (err) return console.error(err); createPatient(token); });
