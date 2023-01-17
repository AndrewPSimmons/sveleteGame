"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
const Member_1 = require("./Member");
class Player extends Member_1.Member {
    constructor(member, extras = {}) {
        super(member.username, member.roomCode, extras);
        this.hand = [];
        this.wins = [];
        this.isSubmitted = false;
        Object.assign(this, extras);
    }
}
exports.Player = Player;
