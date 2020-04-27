console.log('Server-side code running');

const express = require('express');
const bodyParser = require('body-parser');

const app = express();

// serve files from the public directory
app.use(express.static('public'));
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json());

// start the express web server listening on 8080
app.listen(8080, () => {
  console.log('listening on 8080');
});

// serve the homepage
app.get('/', (req, res) => {
  console.log(req.url);
  res.sendFile(__dirname + '/clientInterface.html');
});

app.post('/commandSent', (req, res) => {
  HandleCommand(req.body.command);
  res.sendStatus(201);
});

app.post('/getLog', (req, res) => {
  res.json({log:[
    "yo",
    "oy"
    ]});
});

function HandleCommand(commandString){
  console.log(commandString);
}