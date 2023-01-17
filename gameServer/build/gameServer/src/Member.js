"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Member = void 0;
const randomstring_1 = __importDefault(require("randomstring"));
class Member {
    constructor(username, roomCode, extras = {}) {
        this.isPlayer = false;
        this.isSpectator = false;
        this.isHost = false;
        this.socketId = null;
        this.username = username;
        this.roomCode = roomCode;
        this.id = randomstring_1.default.generate(14);
        Object.assign(this, extras);
    }
    getMemberData() {
        return {
            id: this.id,
            username: this.username,
            isHost: this.isHost,
            isSpectator: this.isSpectator,
            isPlayer: this.isPlayer,
        };
    }
}
exports.Member = Member;
