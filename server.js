console.log('Server-side code running');
const express = require('express');
const app = express();
const http = require("http").createServer(app);
var io = require('socket.io')(http);

const commandHandlerModule = require('./commandHandlerModule');
const promptHandlerModule = require('./promptHandlerModule');
const mySqlModule = require('./mySqlModule');
commandHandlerModule.mySqlModule = mySqlModule;
promptHandlerModule.mySqlModule = mySqlModule;

// serve files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
	console.log('a user connected');

	socket.username = "unset";
	socket.emit('client connected');
	//socket.emit('prompt request', "username", "Enter username: ");

	socket.on('disconnect', disconnect);
	socket.on('command', handleCommand);
	socket.on('prompt reply', handlePromptReply);
});

// start the express web server listening on 3000
http.listen(3000, (req, res) => {
  console.log('listening on 3000');
})

// serve the homepage
app.get('/', (req, res) => {
  console.log(req.url);
  res.sendFile(__dirname + '/clientInterface.html');
});

function disconnect(){
	console.log('user disconnected');
	io.emit('chat message', this.username + " has disconnected");
}

function handleCommand(command){
	commandHandlerModule.handleCommand(io, this, command);
}

function handlePromptReply(promptType, promptReply){
	promptHandlerModule.handlePromptReply(io, this, promptType, promptReply);
}

