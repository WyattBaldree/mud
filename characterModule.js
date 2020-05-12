const mySqlModule = require('./mySqlModule');
const shortcutModule = require('./shortcutModule');

var ioRef = null;
exports.start = function (io) {
    ioRef = io;
};

exports.getAllCharactersInRoom = function (room, callback) {
    //return a list of all players in the room provided
    mySqlModule.select("rooms_playerList", "rooms", "id = '" + room + "'", function (result) {
        let playerList = result[0].rooms_playerList.split(",");
        callback(playerList);
    });
}

exports.getAllCharacterIdsInRoom = function (room, callback) {
    //return a list of all players in the room provided
    mySqlModule.select("rooms_playerList", "rooms", "id = '" + room + "'", function (result) {
        let playerList = result[0].rooms_playerList.split(",");
        callback(playerList);
    });
}

exports.getAllCharacterIdsInRoomOnline = function (room, callback) {
    exports.getAllCharacterIdsInRoom(room, function (playerList) {
        let connectedPlayerList = [];
        let connectedSockets = shortcutModule.getAllConnectedSockets();
        for (let player of playerList) {
            //if player or id is in socket list push to connectedPlayerList
            //loop through connectedPlayer playerlist
            for (let i = 0; i < connectedSockets.length; i++) {

                if (connectedSockets[i].currentCharacter == player) {
                    connectedPlayerList.push(player);

                }
            }
        }
        console.log("playerlist" + connectedPlayerList);
        callback(connectedPlayerList);
    })
}

exports.getCharacterFromSocket = function (socket, callback) {
    //socket.currentCharacter is called at character load in promptHandlerModule
    mySqlModule.select("*", "characters", "id = '" + socket.currentCharacter + "'", function (result) {
        if (result.length >= 0) {
            callback(result[0]);
        } else {
            callback(null);
        }
    })
}

exports.getSocketFromCharacter = function (characterId, callback) {
    let sockets = shortcutModule.getAllConnectedSockets();
    console.log(sockets.length);
    for (let s of sockets) {
        if (s.currentCharacter == characterId) {
            callback(s);
            return;
        }
    }
}

exports.move = function (socket, toRoom, enterMessage, arriveMessage, leaveMessage) {
    mySqlModule.select("a.*", "characters a, rooms b", "b.id = a.characters_currentRoom", function (result) {
        let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
        let fN = currentCharacterResult.characters_firstName;
        let lN = currentCharacterResult.characters_lastName;
        let currentRoom = currentCharacterResult.characters_currentRoom;


        exports.moveCharacter(socket, toRoom, function () {
            shortcutModule.crossRoomsMessages(socket, fN, lN, currentRoom, toRoom, enterMessage, arriveMessage, leaveMessage);
        });
    });
}

exports.moveDirection = function (socket, direction, enterMessage, arriveMessage, leaveMessage) {

    mySqlModule.select("a.*, b.rooms_north, b.rooms_east, b.rooms_south, b.rooms_west",
        "characters a, rooms b",
        "b.id = a.characters_currentRoom",
        function (result) {
            let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
            let fN = currentCharacterResult.characters_firstName;
            let lN = currentCharacterResult.characters_lastName;
            let currentRoom = currentCharacterResult.characters_currentRoom;
            switch (direction) {
                case 0:
                    if (currentCharacterResult.rooms_north != -1) {
                        exports.move(socket, currentCharacterResult.rooms_north, enterMessage, arriveMessage + "south.", leaveMessage + "north.");
                        return;
                    } else {
                        shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
                    }
                    break;
                case 1:
                    if (currentCharacterResult.rooms_east != -1) {
                        exports.move(socket, currentCharacterResult.rooms_east, enterMessage, arriveMessage + "west.", leaveMessage + "east.");
                        return;
                    } else {
                        shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
                    }
                    break;
                case 2:
                    if (currentCharacterResult.rooms_south != -1) {
                        exports.move(socket, currentCharacterResult.rooms_south, enterMessage, arriveMessage + "north.", leaveMessage + "south.");
                        return;
                    } else {
                        shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
                    }
                    break;
                case 3:
                    if (currentCharacterResult.rooms_west != -1) {
                        exports.move(socket, currentCharacterResult.rooms_west, enterMessage, " enters the area from the east.", leaveMessage + "west.");
                        return;
                    } else {
                        shortcutModule.messageToClient(socket, "<color:red>I'm unable to move in that direction.")
                    }
                    break;
            }

        });
}

exports.moveCharacter = function (socket, toRoom, callback) {
    mySqlModule.select("a.id, a.characters_currentRoom, b.rooms_playerList, b.rooms_description",
        "characters a, rooms b", "b.id = a.characters_currentRoom",
        function (result) {
            let currentCharacterResult = result.find(element => element.id == socket.currentCharacter);
            let playerArray = currentCharacterResult.rooms_playerList.split(',');
            playerArray.splice(playerArray.indexOf(socket.currentCharacter), 1, socket.currentCharacter);
            let oldRoomPlayerList = "";
            for (let playerId of playerArray) {
                if (playerId != "" && playerId != socket.currentCharacter) {
                    oldRoomPlayerList = oldRoomPlayerList + playerId + ","
                }
            }
            mySqlModule.update("rooms", "rooms_playerList = '" + oldRoomPlayerList + "'", "id = '" + currentCharacterResult.characters_currentRoom + "'", function () {
                mySqlModule.select(
                    "rooms_playerList, rooms_description",
                    "rooms",
                    "id = " + toRoom,
                    function (toRoomResult) {
                        let newRoomPlayerList = toRoomResult[0].rooms_playerList + socket.currentCharacter + ",";

                        mySqlModule.update("rooms", "rooms_playerList = '" + newRoomPlayerList + "'", "id = '" + toRoom + "'", function () {
                            mySqlModule.update("characters", "characters_currentRoom = '" + toRoom + "'", "id = '" + socket.currentCharacter + "'", function () {
                                // Do something efter the move has completed.
                                callback();
                            });
                        });
                    });
            });
        });
}

exports.getMyCharacter = function (socket, callback) {
    mySqlModule.select("*", "characters", "id = '" + socket.currentCharacter + "'", function (result) {
        callback(result[0]);
    });
}