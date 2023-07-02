"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Room = void 0;
const types_1 = require("../../types");
const Game_1 = require("./Game");
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
            length: 2,
            charset: 'alphabet',
            capitalization: 'uppercase'
        });
        this.password = password;
        this.game = new Game_1.Game(this.roomCode, []);
    }
    handleMemberLeave(member) {
        if (this.game.isTrue()) {
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
            console.log("Setting new host");
        }
    }
    initGame() {
        const players = this.members.filter(member => !member.isSpectator).map(member => new Player_1.Player(member));
    }
    createPlayers() {
        const players = this.members.filter(member => !member.isSpectator).map(member => new Player_1.Player(member));
        return players;
    }
    startGame() {
        //Select players from members where isPlayer is true
        const players = this.createPlayers();
        this.game.start(players);
    }
    endGame() {
        this.game.end();
        this.game = new Game_1.Game(this.roomCode, this.game.packIds);
        this.game.state = types_1.GameState.setup;
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
    }
    joinMember(member, password) {
        if (password !== this.password)
            return false;
        this.members.push(member);
        return true;
    }
    kickMember(memberId) {
        const member = this.getMember(memberId);
        if (!member)
            return;
        if (!member.socketId)
            return;
        if (member.isHost)
            return;
        GameServer_1.gameServer.emitMemberKicked(member.socketId);
        this.handleMemberLeave(member);
        GameServer_1.gameServer.emitUpdateRoomData(this.roomCode);
    }
    becomeSpectator(memberId) {
        const member = this.getMember(memberId);
        if (!member || !member.socketId)
            return;
        if (member.isSpectator)
            return;
        //Veriy that there is room for a spectator
        if (this.members.filter(member => member.isSpectator).length >= this.roomSettings.maxMembers - this.members.filter(member => !member.isSpectator).length) {
            GameServer_1.gameServer.emitError(member.socketId, "There is no room for a spectator", []);
            return;
        }
        ;
        member.isSpectator = true;
        member.isPlayer = false;
        if (this.game.isTrue()) {
            this.game.handleBecomeSpectator(memberId);
            GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            GameServer_1.gameServer.emitPlayerHand(this.roomCode, memberId);
        }
        GameServer_1.gameServer.emitUpdateRoomData(this.roomCode);
    }
    becomePlayer(memberId) {
        const member = this.getMember(memberId);
        if (!member)
            return;
        if (!member.isSpectator)
            return;
        if (this.members.filter(member => !member.isSpectator).length >= this.roomSettings.maxPlayers) {
            //Alert that there is no room for a player
            return;
        }
        ;
        member.isSpectator = false;
        member.isPlayer = true;
        if (this.game.isTrue()) {
            const newPlayer = new Player_1.Player(member);
            this.game.queuePlayerJoin(newPlayer);
            GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            GameServer_1.gameServer.emitPlayerHand(this.roomCode, memberId);
        }
        GameServer_1.gameServer.emitUpdateRoomData(this.roomCode);
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
