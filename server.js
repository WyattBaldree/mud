console.log('Server-side code running');

const bodyParser = require('body-parser');
const express = require('express');
const app = express();
const http = require("http").createServer(app);
var io = require('socket.io')(http);


// serve files from the public directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

io.on('connection', (socket) => {
  console.log('a user connected');
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });

  socket.on('command', handleCommand);
});

// start the express web server listening on 8080
http.listen(3000, (req, res) => {
  console.log('listening on 3000');
})

// serve the homepage
app.get('/', (req, res) => {
  console.log(req.url);
  res.sendFile(__dirname + '/clientInterface.html');
});

function handleCommand(command){
  io.emit('chat message', command);
}