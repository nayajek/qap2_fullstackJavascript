const http = require('http');
const router = require('./routes');

const port = 3000;

const server = http.createServer((req, res) => {
    router.emit('route', req, res);
});

server.listen(port, () => {
    console.log(`Server is listening on port ${port}`);
});
