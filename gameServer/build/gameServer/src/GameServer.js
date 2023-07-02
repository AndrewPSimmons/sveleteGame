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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameServer = exports.GameServer = void 0;
const Member_1 = require("./Member");
const Room_1 = require("./Room");
const express = __importStar(require("express"));
const cors = __importStar(require("cors"));
const http = __importStar(require("http"));
const socket_io_1 = require("socket.io");
const db_1 = __importDefault(require("./database/db"));
const globalConsts_1 = require("../../globalConsts");
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
                origin: [`https://${globalConsts_1.socket_domain}`, `http://${globalConsts_1.socket_domain}`, `https://${globalConsts_1.api_domain}`, `http://${globalConsts_1.api_domain}`, 'http://localhost:5174', 'http://localhost:3000'] //methods: ["GET", "POST"]
            }
        });
        this.expressApp.use(cors.default({ origin: ['http://localhost:5174', `https://${globalConsts_1.socket_domain}`, `http://${globalConsts_1.socket_domain}`, `https://${globalConsts_1.api_domain}`, `http://${globalConsts_1.api_domain}`] }));
    }
    //Takes in the host member and password and creates a room, returns the room code
    //Processes
    handleAbandonedMember(member) {
        var _a;
        console.log("in handleAbandonedMember");
        (_a = this.rooms.get(member.roomCode)) === null || _a === void 0 ? void 0 : _a.handleMemberLeave(member);
        this.emitUpdateRoomData(member.roomCode);
        this.destroyMember(member.id);
    }
    hostLeftRoom(member) {
    }
    //Emits
    forceUpdateAllRooms() {
        this.rooms.forEach((room) => {
            this.emitUpdateRoomData(room.roomCode);
        });
    }
    emitError(socketId, message, actions) {
        this.io.to(socketId).emit("error", { message, actions });
    }
    emitUpdateRoomData(roomCode) {
        const room = this.rooms.get(roomCode);
        if (room === undefined) {
            return;
        }
        const game = room.getGame();
        if (game === undefined) {
            return;
        }
        this.io.to(roomCode).emit("roomData", room.getRoomData());
    }
    // emitUpdateGameData(roomCode: string): void {
    //     const room = this.rooms.get(roomCode)
    //     if (room === undefined) {
    //         return
    //     }
    //     const game = room.getGame()
    //     if (game === null) {
    //         return
    //     }
    //     this.io.to(roomCode).emit("gameData", game.getGameData())
    // }
    // emitUpdatePlayerHand(roomCode: string, playerId: string): void {
    //     const room = this.rooms.get(roomCode)
    //     if (room === undefined) {
    //         return
    //     }
    //     const game = room.getGame()
    //     if (game === null) {
    //         return
    //     }
    //     const player = game.players.find((player) => player.id === playerId)
    //     if (player === undefined) {
    //         return
    //     }
    //     if(player.socketId !== undefined){
    //         return
    //     }
    //     this.io.to(player.socketId).emit("updatePlayerHand", player.hand)
    // }
    // Working on getting player data to emit with game data, maybe need it as one object. Or we post to the two stores on client side
    // The two stores being gameData and playerHand
    // Left off here======^^^^^^^^
    emitUpdateGameDataKeyVal(roomCode, key, val) {
        const room = this.rooms.get(roomCode);
        if (room === undefined) {
            return;
        }
        const game = room.getGame();
        if (game === null) {
            return;
        }
        this.io.to(roomCode).emit("gameDataKeyVal", key, val);
    }
    emitUpdateGameDataWithPlayer(roomCode) {
        const room = this.rooms.get(roomCode);
        if (room === undefined) {
            return;
        }
        const game = room.getGame();
        if (game === null) {
            room.members.forEach((member) => {
                if (member.socketId === null) {
                    console.error("Member socketId is null, in emitUpdateGameDataWithPlayer at room.members.forEach");
                    return;
                }
                this.emitError(member.socketId, "Game not found when updating game data", []);
            });
            return;
        }
        room.members.forEach((member) => {
            if (member.socketId === null) {
                console.error("Member socketId is null, in emitUpdateGameDataWithPlayer at room.members.forEach");
                return;
            }
            // console.log("emitting to socketId: ", member.socketId, "Data: ", game.getGameDataWithPlayer(member.id))
            this.io.to(member.socketId).emit("gameData", game.getGameDataWithPlayer(member.id));
        });
    }
    emitPlayerHand(roomCode, playerId) {
        const room = this.rooms.get(roomCode);
        if (room === undefined) {
            return;
        }
        const game = room.getGame();
        if (game === null) {
            return;
        }
        const player = game.players.find((player) => player.member.id === playerId);
        if (player === undefined) {
            return;
        }
        if (player.member.socketId === null) {
            console.error("Player socketId is null, in emitPlayerHand");
            return;
        }
        this.io.to(player.member.socketId).emit("updatePlayerHand", player.hand);
    }
    emitRoundWin(roomCode, roundWin) {
        const room = this.rooms.get(roomCode);
        if (room === undefined) {
            return;
        }
        const game = room.getGame();
        if (game === null) {
            return;
        }
        this.io.to(roomCode).emit("roundWinner", roundWin);
    }
    emitClearSelectedCards(roomCodeOrSocketId) {
        this.io.to(roomCodeOrSocketId).emit("clearSelectedCards");
    }
    emitMemberKicked(socketId) {
        this.io.to(socketId).emit("memberKicked");
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
    //Pack Functions
    getOfficialPacks() {
        return __awaiter(this, void 0, void 0, function* () {
            const packs = yield db_1.default.GetPacks({ isOfficial: true });
            return packs;
        });
    }
}
exports.GameServer = GameServer;
exports.gameServer = new GameServer();
