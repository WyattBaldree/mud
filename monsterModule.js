const mySqlModule = require('./mySqlModule');
const shortcutModule = require('./shortcutModule');

let monsterList = [];

var ioRef = null;
exports.start = function (io) {
    ioRef = io;
};

class Monster {
    constructor() {
        let active = false;
        mySqlModule.insert("monster_instances", "monster_instances_health, monster_instances_cooldown", this.maxHealth + "','" + this.maxCooldown, function (result) {
            this.id = result.insertId;
            monsterList.push(this);
            active = true;
        });
    }

    tick() {
        this.getCooldown(function (currentCooldown) {
            if(currentCooldown > 1) this.setCooldown(currentcooldown - 1);
        });
    }

    setHealth(newHealth, callback = null) {
        if (newHealth > this.maxHealth)
        mySqlModule.update(monster_instances, "monster_instances_health = " + newHealth, "id = " + this.id, function () {
            if (callback) callback();
        })
    }

    getHealth(callback) {
        mySqlModule.select("monster_instances_health", "monster_instances", "id = " + this.id, function (result) {
            callback(result[0].monster_instances_health);
        });
    }

    setCooldown(newCooldown, callback = null) {
        mySqlModule.update(monster_instances, "monster_instances_cooldown = " + newCooldown, "id = " + this.id, function () {
            if (callback) callback();
        })
    }

    getCooldown(callback) {
        mySqlModule.select("monster_instances_cooldown", "monster_instances", "id = " + this.id, function (result) {
            callback(result[0].monster_instances_cooldown);
        });
    }

    removeFromGame() {
        active = false;
        mySqlModule.delete("monster_instances", "id = " + this.id, function (result) {
            result.insertId;
        });
    }
}

class Goblin extends Monster {
    constructor() {
        this.maxHealth = 10;
        this.maxCooldown = 6;
        super();
    }
}