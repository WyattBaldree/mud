console.log('Server-side code running');
const express = require('express');
const app = express();
const http = require("http").createServer(app);
var io = require('socket.io')(http);

const mySqlModule = require('./mySqlModule');
const commandHandlerModule = require('./commandHandlerModule');
commandHandlerModule.start(io);
const promptHandlerModule = require('./promptHandlerModule');
promptHandlerModule.start(io);
const shortcutModule = require('./shortcutModule');
shortcutModule.start(io);
const loopModule = require('./loopModule');
loopModule.start(io);
// serve files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.username = "unset";
	socket.emit('client connected');

	socket.on('disconnect', disconnect);
});

// start the express web server listening on 3000
http.listen(3000, (req, res) => {
  console.log('listening on 3000');
})

// serve the homepage
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/clientInterface.html');
});

loopModule.drip();

function disconnect(){
	console.log('user disconnected');
	shortcutModule.messageToAll(this.username + " has disconnected");
}
