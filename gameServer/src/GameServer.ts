import { Member } from "./Member";
import { Player } from "./Player";
import { Room } from "./Room";
import * as express from "express";
import * as cors from 'cors';
import * as http from 'http';
import randomstring from 'randomstring';
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ErrorActions, InterServerEvents, ServerToClientEvents, SocketData } from "../../types";
import { initializeSocketIO } from "./socket";
export class GameServer {
    rooms = new Map<string, Room>();
    members = new Map<string, Member>();
    // socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
    expressApp = express.default()
    server = http.createServer(this.expressApp)
    //Make io extend Socket type 
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(this.server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });
    constructor() {
        this.expressApp.use(cors.default(
            { origin: 'http://localhost:5173' }
        ))
    }


    //Takes in the host member and password and creates a room, returns the room code

    //Processes
    handleAbandonedMember(member: Member): void {
        console.log("in handleAbandonedMember");
        this.rooms.get(member.roomCode)?.handleMemberLeave(member);
        this.emitUpdateRoom(member.roomCode);
        this.destroyMember(member.id);
    }
    hostLeftRoom(member: Member){

    }

    //Emits
    forceUpdateAllRooms(): void {
        this.rooms.forEach((room) => {
            this.emitUpdateRoom(room.roomCode)
        })
    }
    emitError(socketId: string, message: string, actions: ErrorActions[]){
        this.io.to(socketId).emit("error", {message, actions})
    }
    emitUpdateRoom(roomCode: string): void {
        const room = this.rooms.get(roomCode)
        if (room === undefined) {
            return
        }
        const game = room.getGame()
        if (game === undefined) {
            return
        }
        this.io.to(roomCode).emit("roomData", room.getRoomData())
    }
    emitUpdateGameData(roomCode: string): void {
        const room = this.rooms.get(roomCode)
        if (room === undefined) {
            return
        }
        const game = room.getGame()
        if (game === null) {
            return
        }

        this.io.to(roomCode).emit("gameData", game.getGameData())
    }
    emitMemberKicked(socketId: string): void {
        this.io.to(socketId).emit("memberKicked")
    }
    //Room Functions
    createRoom(password: string): Room {
        const newRoom = new Room(password)
        this.rooms.set(newRoom.roomCode, newRoom)
        return newRoom
    }

    destroyRoom(roomCode: string): void {
        //Go through users map and remove all users that are in the room
        this.rooms.get(roomCode)?.shutDown();

        this.rooms.delete(roomCode)

    }
    joinRoom(roomCode: string, member: Member, password: string): void {

    }

    getRoom(roomCode: string): Room | undefined {
        return this.rooms.get(roomCode)
    }

    //Member functions
    createMember(username: string, roomCode: string, extras: Partial<Member> = {}): Member {
        const member: Member = new Member(username, roomCode, extras)
        this.members.set(member.id, member)
        return member
    }
    destroyMember(id: string): void {
        this.members.delete(id)
    }
    getMember(id: string): Member | undefined {
        return this.members.get(id)
    }
    assignMemberSocket(id: string, socketId: string): void {

    }

    //Player functions



}

export const gameServer = new GameServer()