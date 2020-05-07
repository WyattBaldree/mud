const gameloop = require('node-gameloop');
const shortcutModule = require('./shortcutModule');

// start the loop at 30 fps (1000/30ms per frame) and grab its id
let frameCount = 0;
const id = gameloop.setGameLoop(function(delta) {
	    // `delta` is the delta time from the last frame
	    //console.log('Hi there! (frame=%s, delta=%s)', frameCount++, delta);
}, 1000 / 30);


exports.drip = function(io){
	shortcutModule.messageInRoom(io, 0, "<color:blue><sub>*drip*");
	setTimeout(exports.drip, 6000, io);
}
