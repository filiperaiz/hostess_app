const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

const app = express();
const httpServer = http.Server(app);
const io = socketio(httpServer);

const ip = require('ip');
const config = {};
config.ip = ip.address();
config.port = 3030;

app.use(express.static(path.join(__dirname, '/assets/')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (request, response) => {
	response.sendFile(path.join(__dirname, '/index.html'));
});

app.post('/', (request, response) => {
	response.setHeader('Content-Type', 'application/json');
	response.send({
		message: 'Message received!'
	});
	io.emit('emitMessage', request.body);
	console.log('\n' + JSON.stringify(request.body));
});

httpServer.listen(config.port, () => {
	console.log(`> HTTP Server is running on: ${config.ip}:${config.port}`);
});
