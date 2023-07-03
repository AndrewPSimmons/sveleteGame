"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(member, extras = {}) {
        this.hand = [];
        this.wins = [];
        this.isSubmitted = false;
        this.numberUsedBlackCards = 0;
        this.member = member;
        Object.assign(this, extras);
    }
}
exports.Player = Player;
