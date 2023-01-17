import { Socket, Server } from 'socket.io';
import { createServer, Server as httpServer } from 'http';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, UserData, ErrorActions, RoomSettings } from '../../../types';
import { gameServer } from '../GameServer';

export function initializeSocketIO(server: httpServer): Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData> {
    const io = new Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"]
        }
    });

    return io;
}

export function configureSocket(io: Server<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>, socket: Socket<ClientToServerEvents, ServerToClientEvents, InterServerEvents, SocketData>) {
    const userData: UserData = socket.handshake.query as unknown as UserData

    const member = gameServer.getMember(userData.id)
    if(member){
        member.socketId = socket.id
    }

    socket.on("disconnect", () => {
        console.log("Disconnected ", socket.id)
        const member = gameServer.getMember(userData.id)
        if (member === undefined) {
            return
        }

        member.socketId = null

        setTimeout(() => {
            if (member.socketId === null) {
                gameServer.handleAbandonedMember(member)
            }
            console.log("Socket Reconnected");

        }, 3000)
    })
    socket.on("sendingMessage", (message) => {
        console.log(message)

        socket.emit("newMessgeSent", message)

        //Emit to all sockets in same room as this socket
        socket.to(userData.roomCode).emit("newMessgeSent", message)
    })
    socket.on("joiningRoom", (data) => {
        const room = gameServer.getRoom(data.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when joining room", [ErrorActions.redirectToHome, ErrorActions.clearUserData])
            return
        }
        const member = room.getMember(data.id)
        if (member === undefined) {
            gameServer.emitError(socket.id, "Member not found when joining room", [ErrorActions.redirectToJoin, ErrorActions.clearUserData])
            return
        }

        socket.join(data.roomCode)
        gameServer.emitUpdateRoom(data.roomCode)
        //TODO: The member should already be in the gameServer.rooms object[roomCode].members
        //Validate that the userID is in the room and then add to the socket room

    })


    socket.on("submittingWhiteCards", (data) => {
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when submitting white cards", [])
            return
        }
        
        const member = room.getMember(userData.id)
        if (member === undefined) {
            gameServer.emitError(socket.id, "Member not found when submitting white cards", [])
            // socket.emit("memberNotFound", userData.roomCode)
            return
        }
        const game = room.getGame()
        if(game === null){
            gameServer.emitError(socket.id, "Game not found when submitting white cards", [])
            return
        }
        game.submitCard(member.id, data)
    })

    socket.on("updatingRoomSettings", (roomSettings: Partial<RoomSettings>) => {
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when updating room settings", [])
            return
        }
        room.updateRoomSettings(roomSettings)
        gameServer.emitUpdateRoom(userData.roomCode)
    })

    socket.on("updatingRoomSettingSingle", (roomSetting: keyof RoomSettings, value: any) => {
        console.log("Trying to update room setting with key vlue pair", roomSetting, value);
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when updating room settings single", [])
            return
        }
        const partial = {
            [roomSetting]: value
        }
        console.log(partial);
        room.updateRoomSettings(partial as Partial<RoomSettings>)
        gameServer.emitUpdateRoom(userData.roomCode)
    })

    
    return socket
}