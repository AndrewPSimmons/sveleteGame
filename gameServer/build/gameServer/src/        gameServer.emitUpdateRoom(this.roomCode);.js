"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameServer = exports.GameServer = void 0;
const Member_1 = require("./Member");
const Room_1 = require("./Room");
const express = __importStar(require("express"));
const cors = __importStar(require("cors"));
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
class GameServer {
    constructor() {
        this.rooms = new Map();
        this.members = new Map();
        // socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
        this.expressApp = express.default();
        this.server = http.createServer(this.expressApp);
        //Make io extend Socket type 
        this.io = new socket_io_1.Server(this.server, {
            cors: {
                origin: "http://localhost:5173",
                methods: ["GET", "POST"]
            }
        });
        this.expressApp.use(cors.default({ origin: 'http://localhost:5173' }));
    }
    //Takes in the host member and password and creates a room, returns the room code
    //Processes
    handleAbandonedMember(member) {
        var _a;
        console.log("in handleAbandonedMember");
        (_a = this.rooms.get(member.roomCode)) === null || _a === void 0 ? void 0 : _a.handleMemberLeave(member);
        this.destroyMember(member.id);
    }
    hostLeftRoom(member) {
    }
    //Emits
    forceUpdateAllRooms() {
        this.rooms.forEach((room) => {
            this.emitUpdateRoom(room.roomCode);
        });
    }
    emitUpdateRoom(roomCode) {
        const room = this.rooms.get(roomCode);
        if (room === undefined) {
            return;
        }
        this.io.to(roomCode).emit("roomData", room.getRoomData());
    }
    //Room Functions
    createRoom(password) {
        const newRoom = new Room_1.Room(password);
        this.rooms.set(newRoom.roomCode, newRoom);
        return newRoom;
    }
    destroyRoom(roomCode) {
        var _a;
        //Go through users map and remove all users that are in the room
        (_a = this.rooms.get(roomCode)) === null || _a === void 0 ? void 0 : _a.shutDown();
        this.rooms.delete(roomCode);
    }
    joinRoom(roomCode, member, password) {
    }
    getRoom(roomCode) {
        return this.rooms.get(roomCode);
    }
    //Member functions
    createMember(username, roomCode, extras = {}) {
        const member = new Member_1.Member(username, roomCode, extras);
        this.members.set(member.id, member);
        return member;
    }
    destroyMember(id) {
        this.members.delete(id);
    }
    getMember(id) {
        return this.members.get(id);
    }
    assignMemberSocket(id, socketId) {
    }
    //Player functions
    genPlayer(member, extras = {}) {
        const player = Object.assign(Object.assign(Object.assign({}, member), { hand: [], wins: [] }), extras);
        return player;
    }
}
exports.GameServer = GameServer;
exports.gameServer = new GameServer();
