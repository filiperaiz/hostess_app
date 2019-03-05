const http = require('http');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const socketio = require('socket.io');

const app = express();
const httpServer = http.Server(app);
const io = socketio(httpServer);

const ip = require('ip');
const address = ip.address();
const httpPort = 3030;


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

httpServer.listen(httpPort, () => {
	console.log(`> HTTP Server is running on: ${address}:${httpPort}`);
});
