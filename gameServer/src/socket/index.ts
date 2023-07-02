import { Socket, Server } from 'socket.io';
import { createServer, Server as httpServer } from 'http';
import { ServerToClientEvents, ClientToServerEvents, InterServerEvents, SocketData, UserData, ErrorActions, RoomSettings, GameRules, GameData } from '../../../types';
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
    // Update player socketid if player exists
    

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
        gameServer.emitUpdateRoomData(data.roomCode)

        console.log("Player joining room, about to emit gameData");
        gameServer.emitUpdateGameDataWithPlayer(data.roomCode)
        room.members.forEach(member => {
            gameServer.emitPlayerHand(data.roomCode, member.id)
        })
        //TODO: The member should already be in the gameServer.rooms object[roomCode].members
        //Validate that the userID is in the room and then add to the socket room

    })


    socket.on("kickingMember", (memberId)=>{
        if(!userData.isHost){
            gameServer.emitError(socket.id, "User is not host when kicking member", [])
            return
        }
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when kicking member", [])
            return
        }
        const member = room.getMember(memberId)
        if (member === undefined) {
            gameServer.emitError(socket.id, "Member not found when kicking member", [])
            return
        }
        room.kickMember(memberId)
    })


    socket.on("becomingSpectator", ()=> {
        console.log("Changing to spectator");
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when becoming spectator", [])
            return
        }
        const member = room.getMember(userData.id)
        if (member === undefined) {
            gameServer.emitError(socket.id, "Member not found when becoming spectator", [])
            return
        }
        room.becomeSpectator(member.id)
    })

    socket.on("becomingPlayer", ()=> {
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when becoming player", [])
            return
        }
        const member = room.getMember(userData.id)
        if (member === undefined) {
            gameServer.emitError(socket.id, "Member not found when becoming player", [])
            return
        }
        room.becomePlayer(member.id)

    })

    socket.on("requestingBasePacks", () => {
        
    })

    socket.on("addingPack", (pack_id) => {
        console.log("In adding pack", pack_id);
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when adding pack", [])
            return
        }
        room.game.addPack(pack_id)

        // gameServer.emitUpdateGameDataKeyVal(userData.roomCode, "packIds" as keyof GameData, room.game.packIds)
        gameServer.emitUpdateGameDataWithPlayer(userData.roomCode)
    })

    socket.on("removingPack", (pack_id) => {
        console.log("In removing pack", pack_id);

        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when removing pack", [])
            return
        }
        room.game.removePack(pack_id)
        // gameServer.emitUpdateGameDataKeyVal(userData.roomCode, "packIds" as keyof GameData, room.game.packIds)
        gameServer.emitUpdateGameDataWithPlayer(userData.roomCode)
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
        game.submitCards(member.id, data)
    })

    socket.on("selectingWinningCards", (data) => {
        console.log("Selecting winning cards", data);
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when selecting winning cards", [])
            return
        }
        const game = room.getGame()
        if(game === null){
            gameServer.emitError(socket.id, "Game not found when selecting winning cards", [])
            return
        }
        game.selectWinner(data)
    })

    socket.on("updatingRoomSettings", (roomSettings: Partial<RoomSettings>) => {
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when updating room settings", [])
            return
        }
        room.updateRoomSettings(roomSettings)
        gameServer.emitUpdateRoomData(userData.roomCode)
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
        gameServer.emitUpdateRoomData(userData.roomCode)
    })

    socket.on("updatingGameRules", (gameRules: Partial<GameRules>) => {
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when updating game rules", [])
            return
        }
        room.game.updateGameRules(gameRules)

    })

    socket.on("startingGame", ()=> {
        console.log("Starting ag==");
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when starting game", [])
            return
        }
        room.startGame()
    })

    socket.on("endingGame", ()=> {
        console.log("Ending game")
        const room = gameServer.getRoom(userData.roomCode)
        if (room === undefined) {
            gameServer.emitError(socket.id, "Room not found when ending game", [])
            return
        }
        room.endGame()
    })

    
    return socket
}