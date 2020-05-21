const mySqlModule = require('./mySqlModule');
const shortcutModule = require('./shortcutModule');

let monsterList = [];

var ioRef = null;
exports.start = function (io) {
    ioRef = io;

    new Goblin();
};

exports.getMonsterList = function () {
    return monsterList;
}

class Monster {
    constructor(maxHealth, maxCooldown) {

        this.maxHealth = maxHealth;
        this.maxCooldown = maxCooldown;

        this.monsterName = "unset";

        let newMonster = this;

        this.active = false;
        mySqlModule.insert("monster_instances", "monster_instances_health, monster_instances_cooldown", this.maxHealth + "','" + this.maxCooldown, function (result) {
            newMonster.id = result.insertId;
            monsterList.push(newMonster);
            newMonster.active = true;
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
    constructor() {
        super(10, 60);
        this.monsterName = "goblin";
    }
}