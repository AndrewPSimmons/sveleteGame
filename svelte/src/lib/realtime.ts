import ioClient, { Socket } from 'socket.io-client'
import { gameData, roomData, chatLog } from '../stores'
import type { ServerToClientEvents, ClientToServerEvents, UserData } from "../../../types"
const endpoint = 'http://localhost:3000'

export const socketInit = (userData: UserData) => {
    const io: Socket<ServerToClientEvents, ClientToServerEvents> = ioClient(endpoint, {
        query: {...userData}
    })

    io.on("connect", () => {
        console.log("connected")
    })
    io.on("roomData", (data)=> {
        roomData.update((gameData) => {
            return {...gameData, ...data}
        })

        console.log("in roomData", data)
    })
    io.on("newMessgeSent", (data)=> {
        chatLog.update((log ) => {
            return [data, ...log ].slice(0, 50)
        })
    })
    return io
}

