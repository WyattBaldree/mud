console.log('Server-side code running');
const express = require('express');
const app = express();
const http = require("http").createServer(app);
var io = require('socket.io')(http);


// serve files from the public directory
app.use(express.static('public'));

io.on('connection', (socket) => {
	socket.username = "unset";

	socket.emit('client connected');
	console.log('a user connected');

	socket.on('disconnect', () => {
		console.log('user disconnected');
		io.emit('chat message', socket.username + " has disconnected");
	});

	socket.on('command', handleCommand);

	socket.on('usernameEntered', usernameEntered);
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

function handleCommand(command){
  
  let commandArray = command.split(";");

  let availableCommandArray = ["say"]

  switch(commandArray[0].trim().toLowerCase()){
  	case "say":
  		io.emit('chat message', this.username + ": " + commandArray[1]);
  		break;
  	case "help":
  		this.emit('chat message', "the available commands are: " + availableCommandArray);
  		break;
  	default:
  		this.emit('chat message', "invalid command try 'help'");
  		break;	
  }
}

function usernameEntered(username){
  this.username = username;
  if(this.username){
  	io.emit('chat message', this.username + " has connected");
  }
  
}