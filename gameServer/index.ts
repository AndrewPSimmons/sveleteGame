import { configureSocket, initializeSocketIO } from './src/socket';
import * as express from "express";
import { Room } from './src/Room';
import { GameServer } from './src/GameServer';
import * as http from 'http';
import readline from 'readline';
import { Member } from './src/Member';
import * as cors from 'cors';
import { gameServer } from './src/GameServer';
// import configureSocket from './src/socketIO.mjs';

//Create express app


gameServer.expressApp.get('/createRoom', (req: express.Request, res: express.Response) => {
    const query: any = req.query
    //1 Validate request data (username) 
    if (query.username === undefined) {
        res.status(500).json({
            status: "error",
            message: "Username is required"
        })
        return
    }
    if (query.username.length < 3 || query.username.length > 20) {
        res.status(500).json({
            status: "error",
            message: "Username must be between 3 and 20 characters"
        })
        return
    }
    const password = query.password === undefined ? "" : query.password
    const username = query.username

    const newRoom = gameServer.createRoom(password)

    //2 Generate host member and ceate room
    const host = gameServer.createMember(username, newRoom.roomCode, { isHost: true })
    newRoom.joinMember(host, password)

    res.status(200).json({
        status: "success",
        host: host,
        roomCode: newRoom.roomCode
    })
})

gameServer.expressApp.get('/joinRoom', (req: express.Request, res: express.Response) => {
    const query: any = req.query
    //1 Validate request data (username) 
    if (query.username === undefined) {
        res.status(500).json({
            status: "error",
            message: "Username is required"
        })
        return
    }
    if (query.username.length < 3 || query.username.length > 20) {
        res.status(500).json({
            status: "error",
            message: "Username must be between 3 and 20 characters"
        })
        return
    }
    if (query.roomCode === undefined) {
        res.status(500).json({
            status: "error",
            message: "Room code is required"
        })
        return
    }
    const roomCode = query.roomCode
    const username = query.username as string
    const password = query.password === undefined ? "" : query.password

    //2 Generate host member and ceate room

    const room = gameServer.getRoom(roomCode)
    if (room === undefined) {
        res.status(500).json({
            status: "error",
            message: "Room not found"
        })
        return
    }
    if (room.password !== password) {
        res.status(500).json({
            status: "error",
            message: "Incorrect password"
        })
        return
    }
    //Make sure username doesnt already exist in room
    if (room.members.find(member => member.username.toLowerCase() === username.toLowerCase()) !== undefined) {
        res.status(500).json({
            status: "error",
            message: "Username already exists in room"
        })
        return
    }


    const newMember = gameServer.createMember(username, roomCode, { isSpectator: room.game.isTrue()})
    newMember.roomCode = roomCode
    const joined = room.joinMember(newMember, password)
    if (!joined) {
        res.status(500).json({
            status: "error",
            message: "Error Joining Room"
        })
        gameServer.destroyMember(newMember.id)
        return
    }

    res.status(200).json({
        status: "success",
        member: newMember,
        roomCode: room.roomCode
    })
})


//Start express app
// expressApp.listen(3000, () => {
//     console.log("Listening on port 3000")
// })

gameServer.io.on("connection", (socket) => {
    socket = configureSocket(gameServer.io, socket)
})


gameServer.server.listen(3000, () => {
    console.log("Listening on port 3000")
    takeCommand()
})



const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});


const takeCommand = () => {
    //Create a map that takes in a command and returns a function 
    const commands = new Map<string, (command: string) => void>(
        [
            ["exit", (command) => {
                process.exit()
            }],
            ["rooms", (command) => {
                console.log(gameServer.rooms)
                takeCommand()
            }],
            ["members", (command) => {
                console.log(gameServer.members)
                takeCommand()
            }],
            ["room", (command) => {
                const roomCode = command.split(" ")[1]
                const room = gameServer.getRoom(roomCode)
                if (room === undefined) {
                    console.log("Room not found")
                }
                else {
                    console.log(room)
                }
                takeCommand()
            }],
            ["delRoom", (command) => {
                const roomCode = command.split(" ")[1]
                const room = gameServer.getRoom(roomCode)
                if (room === undefined) {
                    console.log("Room not found")
                }
                else {
                    gameServer.destroyRoom(roomCode)
                    console.log("Room deleted")
                }
                takeCommand()
            }],
            ["socketRooms", (command) => {
                console.log(gameServer.io.sockets.adapter.rooms)
                takeCommand()
            }],
            ["probe", command => {
                const splitCommand = command.split(" ")
                const roomCode = splitCommand[1].toUpperCase()
                const room = gameServer.getRoom(roomCode)
                if (room === undefined) {
                    console.log("Room not found")
                }
                else {
                    //Loop through split commands after roomCode and do a object key lookup 
                    let path = splitCommand[2].split(".")
                    let lastObject: any = null
                    let currentObject: any = room
                    for (let i = 0; i < path.length; i++) {
                        const key = path[i]
                        currentObject = currentObject[key as keyof typeof currentObject]
                        if (currentObject === undefined) {
                            console.log(lastObject);
                            console.log("Invalid key, here is what was most recently found: ", key, " => ", lastObject)
                            break
                        }
                        lastObject = currentObject
                    }
                    console.log(currentObject);
                }
                takeCommand()
            }],
            ["updateRooms", command => {
                gameServer.forceUpdateAllRooms()
                takeCommand()

            }],
            ["help", command => {
                console.log("Avalable commands: ")
                commands.forEach((value, key) => {
                    console.log(key)
                })
                takeCommand()
            }]
        ]
    )
    rl.question("Enter command: ", (command) => {
        const toDo = commands.get(command.split(" ")[0])
        if (toDo !== undefined) {
            try {
                toDo(command)
            }
            catch (error) {
                console.log((error as any).message)
                takeCommand()
            }

        }
        else {
            console.log("Invalid command")
            takeCommand()
        }
    })
}

