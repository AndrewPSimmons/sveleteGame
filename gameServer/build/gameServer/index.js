"use strict";
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
const socket_1 = require("./src/socket");
const readline_1 = __importDefault(require("readline"));
const GameServer_1 = require("./src/GameServer");
const db_1 = __importDefault(require("./src/database/db"));
// import configureSocket from './src/socketIO.mjs';
//Create express app
GameServer_1.gameServer.expressApp.get('/createRoom', (req, res) => {
    const query = req.query;
    //1 Validate request data (username) 
    if (query.username === undefined) {
        res.status(500).json({
            status: "error",
            message: "Username is required"
        });
        return;
    }
    if (query.username.length < 3 || query.username.length > 20) {
        res.status(500).json({
            status: "error",
            message: "Username must be between 3 and 20 characters"
        });
        return;
    }
    const password = query.password === undefined ? "" : query.password;
    const username = query.username;
    const newRoom = GameServer_1.gameServer.createRoom(password);
    //2 Generate host member and ceate room
    const host = GameServer_1.gameServer.createMember(username, newRoom.roomCode, { isHost: true });
    newRoom.joinMember(host, password);
    res.status(200).json({
        status: "success",
        host: host,
        roomCode: newRoom.roomCode
    });
});
GameServer_1.gameServer.expressApp.get('/joinRoom', (req, res) => {
    const query = req.query;
    //1 Validate request data (username) 
    if (query.username === undefined) {
        res.status(500).json({
            status: "error",
            message: "Username is required"
        });
        return;
    }
    if (query.username.length < 3 || query.username.length > 20) {
        res.status(500).json({
            status: "error",
            message: "Username must be between 3 and 20 characters"
        });
        return;
    }
    if (query.roomCode === undefined) {
        res.status(500).json({
            status: "error",
            message: "Room code is required"
        });
        return;
    }
    const roomCode = query.roomCode;
    const username = query.username;
    const password = query.password === undefined ? "" : query.password;
    //2 Generate host member and ceate room
    const room = GameServer_1.gameServer.getRoom(roomCode);
    if (room === undefined) {
        res.status(500).json({
            status: "error",
            message: "Room not found"
        });
        return;
    }
    if (room.password !== password) {
        res.status(500).json({
            status: "error",
            message: "Incorrect password"
        });
        return;
    }
    //Make sure username doesnt already exist in room
    if (room.members.find(member => member.username.toLowerCase() === username.toLowerCase()) !== undefined) {
        res.status(500).json({
            status: "error",
            message: "Username already exists in room"
        });
        return;
    }
    const newMember = GameServer_1.gameServer.createMember(username, roomCode, { isSpectator: room.game.isTrue() });
    newMember.roomCode = roomCode;
    const joined = room.joinMember(newMember, password);
    if (!joined) {
        res.status(500).json({
            status: "error",
            message: "Error Joining Room"
        });
        GameServer_1.gameServer.destroyMember(newMember.id);
        return;
    }
    res.status(200).json({
        status: "success",
        member: newMember,
        roomCode: room.roomCode
    });
});
GameServer_1.gameServer.expressApp.get("/packs/official", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).json({
        status: "success",
        packs: yield GameServer_1.gameServer.getOfficialPacks()
    });
}));
//Start express app
// expressApp.listen(3000, () => {
//     console.log("Listening on port 3000")
// })
GameServer_1.gameServer.io.on("connection", (socket) => {
    socket = (0, socket_1.configureSocket)(GameServer_1.gameServer.io, socket);
});
GameServer_1.gameServer.server.listen(3000, () => {
    console.log("Listening on port 3000");
    takeCommand();
});
const rl = readline_1.default.createInterface({
    input: process.stdin,
    output: process.stdout
});
const takeCommand = () => {
    //Create a map that takes in a command and returns a function 
    const commands = new Map([
        ["exit", (command) => {
                process.exit();
            }],
        ["rooms", (command) => {
                console.log(GameServer_1.gameServer.rooms);
                takeCommand();
            }],
        ["members", (command) => {
                console.log(GameServer_1.gameServer.members);
                takeCommand();
            }],
        ["room", (command) => {
                const roomCode = command.split(" ")[1];
                const room = GameServer_1.gameServer.getRoom(roomCode);
                if (room === undefined) {
                    console.log("Room not found");
                }
                else {
                    console.log(room);
                }
                takeCommand();
            }],
        ["delRoom", (command) => {
                const roomCode = command.split(" ")[1];
                const room = GameServer_1.gameServer.getRoom(roomCode);
                if (room === undefined) {
                    console.log("Room not found");
                }
                else {
                    GameServer_1.gameServer.destroyRoom(roomCode);
                    console.log("Room deleted");
                }
                takeCommand();
            }],
        ["socketRooms", (command) => {
                console.log(GameServer_1.gameServer.io.sockets.adapter.rooms);
                takeCommand();
            }],
        ["probe", command => {
                const splitCommand = command.split(" ");
                const roomCode = splitCommand[1].toUpperCase();
                const room = GameServer_1.gameServer.getRoom(roomCode);
                if (room === undefined) {
                    console.log("Room not found");
                }
                else {
                    //Loop through split commands after roomCode and do a object key lookup 
                    if (!splitCommand[2]) {
                        console.log(room);
                    }
                    else {
                        let path = splitCommand[2].split(".");
                        let lastObject = null;
                        let currentObject = room;
                        for (let i = 0; i < path.length; i++) {
                            const key = path[i];
                            currentObject = currentObject[key];
                            if (currentObject === undefined) {
                                console.log(lastObject);
                                console.log("Invalid key, here is what was most recently found: ", key, " => ", lastObject);
                                break;
                            }
                            lastObject = currentObject;
                        }
                        console.log(currentObject);
                    }
                }
                takeCommand();
            }],
        ["updateRooms", command => {
                GameServer_1.gameServer.forceUpdateAllRooms();
                takeCommand();
            }],
        ["help", command => {
                console.log("Avalable commands: ");
                commands.forEach((value, key) => {
                    console.log(key);
                });
                takeCommand();
            }],
        ["dbc", (command) => __awaiter(void 0, void 0, void 0, function* () {
                const card = yield db_1.default.DrawBlackCard([1, 2], [], 1);
                console.log(card);
                console.log(JSON.stringify(card));
                takeCommand();
            })],
        ["dwc", (command) => __awaiter(void 0, void 0, void 0, function* () {
                const card = yield db_1.default.DrawWhiteCard([1, 2], [], 3);
                console.log(card);
                console.log(JSON.stringify(card));
                takeCommand();
            })],
        ["cbc", (command) => __awaiter(void 0, void 0, void 0, function* () {
                var _a;
                const splitCommand = command.split(" ");
                const roomCode = splitCommand[1].toUpperCase();
                const room = GameServer_1.gameServer.getRoom(roomCode);
                if (room === undefined) {
                    console.log("Room not found");
                    takeCommand();
                    return;
                }
                const game = room.getGame();
                if (game === null) {
                    console.log("Game not found");
                    takeCommand();
                    return;
                }
                //Change black card
                const forcePick = (_a = parseInt(splitCommand[2])) !== null && _a !== void 0 ? _a : null;
                const card = yield db_1.default.DrawBlackCard(game.packIds, game.usedBlackCards, game.gameRules.blackCardMaxPick, forcePick);
                game.usedBlackCards.push(card.id);
                game.blackCard = card;
                GameServer_1.gameServer.emitUpdateGameDataWithPlayer(roomCode);
                takeCommand();
            })
        ],
        ["getPack", (command) => __awaiter(void 0, void 0, void 0, function* () {
                const pack = yield db_1.default.GetPack(45);
                console.log(pack);
                takeCommand();
            })],
        ["egd", (command) => __awaiter(void 0, void 0, void 0, function* () {
                const splitCommand = command.split(" ");
                if (splitCommand.length < 2) {
                    console.log("Room code required");
                    takeCommand();
                    return;
                }
                const roomCode = splitCommand[1].toUpperCase();
                const room = GameServer_1.gameServer.getRoom(roomCode);
                if (room === undefined) {
                    console.log("Room not found");
                    takeCommand();
                    return;
                }
                const game = room.getGame();
                if (game === null) {
                    console.log("Game not found");
                    takeCommand();
                    return;
                }
                GameServer_1.gameServer.emitUpdateGameDataWithPlayer(roomCode);
                takeCommand();
            })]
    ]);
    rl.question("Enter command: ", (command) => {
        const toDo = commands.get(command.split(" ")[0]);
        if (toDo !== undefined) {
            try {
                toDo(command);
            }
            catch (error) {
                console.log(error.message);
                takeCommand();
            }
        }
        else {
            console.log("Invalid command");
            takeCommand();
        }
    });
};
