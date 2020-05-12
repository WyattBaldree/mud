const gameloop = require('node-gameloop');
const shortcutModule = require('./shortcutModule');

var ioRef = null;
exports.start = function(io) {
	ioRef = io;
};

// start the loop at 30 fps (1000/30ms per frame) and grab its id
let frameCount = 0;
const id = gameloop.setGameLoop(function(delta) {
	    // `delta` is the delta time from the last frame
	    //console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
}, 1000 / 30);


exports.drip = function(){
	shortcutModule.messageInRoom(1, "<color:blue><sub>*drip*");
	console.log("drip");
	setTimeout(exports.drip, 6000);
}