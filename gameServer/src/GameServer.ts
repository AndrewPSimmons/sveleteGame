import { Member } from "./Member";
import { Player } from "./Player";
import { Room } from "./Room";
import * as express from "express";
import * as cors from 'cors';
import * as http from 'http';
import randomstring from 'randomstring';
import { Server, Socket } from "socket.io";
import { ClientToServerEvents, ErrorActions, GameData, InterServerEvents, PackData, RoundWin, ServerToClientEvents, SocketData } from "../../types";
import { initializeSocketIO } from "./socket";
import DB from "./database/db";
import {socket_domain} from "../../globalConsts"

export class GameServer {
    rooms = new Map<string, Room>();
    members = new Map<string, Member>();
    // socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>
    expressApp = express.default()
    server = http.createServer(this.expressApp)
    //Make io extend Socket type 
    io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(this.server, {
        cors: {
            origin: [`http://${socket_domain}`, `https://${socket_domain}`],
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
        this.emitUpdateRoomData(member.roomCode);
        this.destroyMember(member.id);
    }
    hostLeftRoom(member: Member){

    }

    //Emits
    forceUpdateAllRooms(): void {
        this.rooms.forEach((room) => {
            this.emitUpdateRoomData(room.roomCode)
        })
    }
    emitError(socketId: string, message: string, actions: ErrorActions[]){
        this.io.to(socketId).emit("error", {message, actions})
    }
    emitUpdateRoomData(roomCode: string): void {
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
    emitUpdateGameDataKeyVal(roomCode: string, key: keyof GameData, val: any): void {
        const room = this.rooms.get(roomCode)
        if (room === undefined) {
            return
        }
        const game = room.getGame()
        if (game === null) {
            return
        }
        this.io.to(roomCode).emit("gameDataKeyVal", key, val)
    }
    emitUpdateGameDataWithPlayer(roomCode: string): void {
        const room = this.rooms.get(roomCode)
        if (room === undefined) {
            return
        }
        const game = room.getGame()
        if (game === null) {
            room.members.forEach((member) => {
                if (member.socketId === null) {
                    console.error("Member socketId is null, in emitUpdateGameDataWithPlayer at room.members.forEach")
                    return 
                }
                this.emitError(member.socketId, "Game not found when updating game data", [])
            })
            return
        }

        room.members.forEach((member) => {
            if (member.socketId === null) {
                console.error("Member socketId is null, in emitUpdateGameDataWithPlayer at room.members.forEach")
                return 
            }
            // console.log("emitting to socketId: ", member.socketId, "Data: ", game.getGameDataWithPlayer(member.id))
            this.io.to(member.socketId).emit("gameData", game.getGameDataWithPlayer(member.id))
        })

    }
    emitPlayerHand(roomCode: string, playerId: string): void {
        const room = this.rooms.get(roomCode)
        if (room === undefined) {
            return
        }
        const game = room.getGame()
        if (game === null) {
            return
        }
        const player = game.players.find((player) => player.member.id === playerId)
        if (player === undefined) {
            return
        }
        if(player.member.socketId === null){
            console.error("Player socketId is null, in emitPlayerHand")
            return
        }
        this.io.to(player.member.socketId).emit("updatePlayerHand", player.hand)
    }
    emitRoundWin(roomCode:string, roundWin: RoundWin){
        const room = this.rooms.get(roomCode)
        if (room === undefined) {
            return
        }
        const game = room.getGame()
        if (game === null) {
            return
        }
        
        this.io.to(roomCode).emit("roundWinner", roundWin)
    }
    
    emitClearSelectedCards(roomCodeOrSocketId: string): void {
        this.io.to(roomCodeOrSocketId).emit("clearSelectedCards")
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


    //Pack Functions
    async getOfficialPacks(): Promise<PackData[]> {
        const packs = await DB.GetPacks({isOfficial: true})
        return packs as PackData[]
    }

}

export const gameServer = new GameServer()