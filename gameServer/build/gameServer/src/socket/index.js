"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureSocket = exports.initializeSocketIO = void 0;
const socket_io_1 = require("socket.io");
const types_1 = require("../../../types");
const GameServer_1 = require("../GameServer");
function initializeSocketIO(server) {
    const io = new socket_io_1.Server(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });
    return io;
}
exports.initializeSocketIO = initializeSocketIO;
function configureSocket(io, socket) {
    const userData = socket.handshake.query;
    const member = GameServer_1.gameServer.getMember(userData.id);
    if (member) {
        member.socketId = socket.id;
    }
    socket.on("disconnect", () => {
        console.log("Disconnected ", socket.id);
        const member = GameServer_1.gameServer.getMember(userData.id);
        if (member === undefined) {
            return;
        }
        member.socketId = null;
        setTimeout(() => {
            if (member.socketId === null) {
                GameServer_1.gameServer.handleAbandonedMember(member);
            }
            console.log("Socket Reconnected");
        }, 3000);
    });
    socket.on("sendingMessage", (message) => {
        console.log(message);
        socket.emit("newMessgeSent", message);
        //Emit to all sockets in same room as this socket
        socket.to(userData.roomCode).emit("newMessgeSent", message);
    });
    socket.on("joiningRoom", (data) => {
        const room = GameServer_1.gameServer.getRoom(data.roomCode);
        if (room === undefined) {
            GameServer_1.gameServer.emitError(socket.id, "Room not found when joining room", [types_1.ErrorActions.redirectToHome, types_1.ErrorActions.clearUserData]);
            return;
        }
        const member = room.getMember(data.id);
        if (member === undefined) {
            GameServer_1.gameServer.emitError(socket.id, "Member not found when joining room", [types_1.ErrorActions.redirectToJoin, types_1.ErrorActions.clearUserData]);
            return;
        }
        socket.join(data.roomCode);
        GameServer_1.gameServer.emitUpdateRoom(data.roomCode);
        //TODO: The member should already be in the gameServer.rooms object[roomCode].members
        //Validate that the userID is in the room and then add to the socket room
    });
    socket.on("submittingWhiteCards", (data) => {
        const room = GameServer_1.gameServer.getRoom(userData.roomCode);
        if (room === undefined) {
            GameServer_1.gameServer.emitError(socket.id, "Room not found when submitting white cards", []);
            return;
        }
        const member = room.getMember(userData.id);
        if (member === undefined) {
            GameServer_1.gameServer.emitError(socket.id, "Member not found when submitting white cards", []);
            // socket.emit("memberNotFound", userData.roomCode)
            return;
        }
        const game = room.getGame();
        if (game === null) {
            GameServer_1.gameServer.emitError(socket.id, "Game not found when submitting white cards", []);
            return;
        }
        game.submitCard(member.id, data);
    });
    socket.on("updatingRoomSettings", (roomSettings) => {
        const room = GameServer_1.gameServer.getRoom(userData.roomCode);
        if (room === undefined) {
            GameServer_1.gameServer.emitError(socket.id, "Room not found when updating room settings", []);
            return;
        }
        room.updateRoomSettings(roomSettings);
        GameServer_1.gameServer.emitUpdateRoom(userData.roomCode);
    });
    socket.on("updatingRoomSettingSingle", (roomSetting, value) => {
        console.log("Trying to update room setting with key vlue pair", roomSetting, value);
        const room = GameServer_1.gameServer.getRoom(userData.roomCode);
        if (room === undefined) {
            GameServer_1.gameServer.emitError(socket.id, "Room not found when updating room settings single", []);
            return;
        }
        const partial = {
            [roomSetting]: value
        };
        console.log(partial);
        room.updateRoomSettings(partial);
        GameServer_1.gameServer.emitUpdateRoom(userData.roomCode);
    });
    return socket;
}
exports.configureSocket = configureSocket;
