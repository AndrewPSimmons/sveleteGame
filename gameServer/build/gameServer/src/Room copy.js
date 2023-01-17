"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const types_1 = require("../../types");
const Game_copy_1 = require("./Game copy");
const Player_1 = require("./Player");
const randomstring_1 = __importDefault(require("randomstring"));
const GameServer_1 = require("./GameServer");
class Room {
    constructor(password) {
        this.roomCode = "";
        this.members = [];
        this.password = "";
        this.roomSettings = {
            maxPlayers: 10,
            maxMembers: 10,
            spectatorChatRule: "all",
            publicLobby: false
        };
        this.roomCode = randomstring_1.default.generate({
            length: 6,
            charset: 'alphabet',
            capitalization: 'uppercase'
        });
        this.password = password;
        this.game = new Game_copy_1.GameCopy([], types_1.GameStatus.setup, this.roomCode);
    }
    handleMemberLeave(member) {
        if (this.game) {
            this.game.handlePlayerLeave(member.id);
        }
        //Remove member from members array
        this.members = this.members.filter(m => m.id !== member.id);
        //If there are no members left, destroy the room
        if (this.members.length === 0) {
            GameServer_1.gameServer.destroyRoom(this.roomCode);
            return;
        }
        //If the host left, make the 0th index the new host
        if (member.isHost) {
            this.members[0].isHost = true;
        }
    }
    initGame() {
        const players = this.members.filter(member => !member.isSpectator).map(member => new Player_1.Player(member));
    }
    startGame() {
    }
    joinMember(member, password) {
        if (password !== this.password)
            return false;
        this.members.push(member);
        return true;
    }
    getMember(id) {
        return this.members.find(member => member.id === id);
    }
    shutDown() {
        if (this.game.isTrue()) {
            this.game.shutDown();
        }
        //I don't think I need to do anything else here, horray for garbage collection
    }
    updateRoomSettings(settings) {
        Object.assign(this.roomSettings, settings);
    }
    updateGameRules(settings) {
        Object.assign(this.game.gameRules, settings);
    }
    //Room Data
    getRoomData() {
        return {
            roomCode: this.roomCode,
            members: this.members.map(member => {
                return member.getMemberData();
            }),
            roomSettings: this.roomSettings
        };
    }
    getGame() {
        return this.game;
    }
}
exports.Room = Room;
