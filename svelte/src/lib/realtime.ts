import ioClient, { Socket } from 'socket.io-client'
import { gameData, roomData, chatLog, playerHand, userData as userDataStore, selectedCards } from '../stores'
import type { ServerToClientEvents, ClientToServerEvents, UserData } from "../../../types"
const api_endpoint = 'http://localhost:3000'

export const socketInit = (userData: UserData) => {
    const io: Socket<ServerToClientEvents, ClientToServerEvents> = ioClient(api_endpoint, {
        query: {...userData}
    })

    io.on("connect", () => {
        console.log("connected")
    })
    io.on("roomData", (data)=> {
        console.log("New Room Data: ", data);
        roomData.update((rData) => {
            return {...rData, ...data}
        })
        // Find the user in the room and update their data in userDataStore
        console.log("in roomData", data)
    })

    io.on("gameDataKeyVal", (key, val)=> {
        console.log("New Game Data: key val: ", key, val);
        gameData.update((gData) => {
            return {...gData, ...{[key]: val}}
        });
    })

    io.on("gameData", (data)=> {
        console.log("New Game Data: ", data);
        gameData.update((gData) => {
            return {...gData, ...data}
        })
    })

    io.on("updatePlayerHand", (data)=> {
        console.log("updatePlayerHand", data);
        playerHand.set(data)
        gameData.update((gData) => {
            return {...gData}
        })
    })

    io.on("newMessgeSent", (data)=> {
        chatLog.update((log ) => {
            return [data, ...log ].slice(0, 50)
        })
    })

    
    io.on("memberData", (data)=> {

    })
    io.on("memberKicked", () => {
        console.log("THis user has been kicked");
        alert("You have been kicked from the room")
        location.href = "/"
    })

    io.on("clearSelectedCards", () => {
        selectedCards.set([])
    })

    return io

}

