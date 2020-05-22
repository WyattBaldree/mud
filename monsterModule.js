const mySqlModule = require('./mySqlModule');
const shortcutModule = require('./shortcutModule');

let monsterList = [];

var ioRef = null;
exports.start = function (io) {
    ioRef = io;

    new Goblin(1);
};

exports.getMonsterList = function () {
    return monsterList;
}

class Monster {
    constructor(maxHealth, maxCooldown, startingRoom) {
        this.maxHealth = maxHealth;
        this.maxCooldown = maxCooldown;
        this.monsterName = "unset";
        this.room = startingRoom;
        let self = this;

        this.active = false;
        
        mySqlModule.insert("monster_instances", "monster_instances_health, monster_instances_cooldown, monster_instances_currentRoom", this.maxHealth + "','" + this.maxCooldown + "','" + this.room, function (result) {
          self.id = result.insertId;
          self.setRoom(self.room, function(){
            monsterList.push(self);
            self.active = true;
          })   
        });
    }

    tick() {
        if(!this.active) return;
        let self = this;
        self.getCooldown(function (currentCooldown) {
            if (currentCooldown > 1) {
                self.setCooldown(currentCooldown - 1);
            }
            else {
                self.setCooldown(self.maxCooldown, function () {
                    self.getHealth(function (health) {
                        shortcutModule.messageToAll("Name: " + self.monsterName + "<br>Health: " + health);
                    });
                });
            }
        });
    }

    setHealth(newHealth, callback = null) {
        if (newHealth > this.maxHealth)
        mySqlModule.update("monster_instances", "monster_instances_health = " + newHealth, "id = " + this.id, function () {
            if (callback) callback();
        })
    }

    getHealth(callback) {
        mySqlModule.select("monster_instances_health", "monster_instances", "id = " + this.id, function (result) {
            callback(result[0].monster_instances_health);
        });
    }
    
    getRoom(callback) {
        mySqlModule.select("monster_instances_room", "monster_instances", "id = " + this.id, function (result) {
          callback(result[0].monster_instances_room);
        });
    }
    
    setRoom(newRoom, callback = null){
      let self = this;
      mySqlModule.update("monster_instances", "monster_instances_currentRoom =" + newRoom, "id = " + this.id, function (result) {
        mySqlModule.select("rooms_monsterList", "rooms", "id ='" + newRoom + "'", function(selectResult){
          let allMonsters = selectResult[0].rooms_monsterList;
            if(allMonsters == ""){
              allMonsters += "" + self.id;
            }else{
              allMonsters += "," + self.id;
            }
          mySqlModule.update("rooms", "rooms_monsterList = '" + allMonsters + "'",  "id ='" + self.room + "'", function (roomResult) {
            if (callback) callback();
          }); 
        });   
      });
    }
    
    setCooldown(newCooldown, callback = null) {
        mySqlModule.update("monster_instances", "monster_instances_cooldown = " + newCooldown, "id = " + this.id, function () {
            if (callback) callback();
        })
    }

    getCooldown(callback) {
        mySqlModule.select("monster_instances_cooldown", "monster_instances", "id = " + this.id, function (result) {
            callback(result[0].monster_instances_cooldown);
        });
    }

    removeFromGame() {
        this.active = false;
        mySqlModule.delete("monster_instances", "id = " + this.id, function (result) {
            result.insertId;
        });
    }
}

class Goblin extends Monster {
    constructor(startingRoom) {
        super(10, 60, startingRoom);
        this.monsterName = "goblin";
    }
}