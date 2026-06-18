const http = require('http');
const data = JSON.stringify({ name: 'Test Patient', age: 30, gender: 'Male' });

const options = {
    hostname: 'localhost',
    port: 4000,
    path: '/api/patients',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, res => {
    let body = '';
    res.on('data', chunk => body += chunk);
    res.on('end', () => { console.log('STATUS', res.statusCode); console.log('BODY', body); });
});
req.on('error', err => console.error(err));
req.write(data);
req.end();
