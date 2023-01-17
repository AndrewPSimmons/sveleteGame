import { Member } from "./gameServer/src/Member";

export interface WhiteCard {
    text: string;
    id: number;
    pack: number;
    packName: string;
}

export interface BlackCard {
    text: string;
    id: number;
    pack: number;
    packName: string;
    pick: number;
}

export interface UserData {
    username: string;
    id: string;
    roomCode: string;
    isHost: boolean;
}

export interface Pack{
    name: string;
    id: number;
}

// export interface Player extends Member{
//     hand: WhiteCard[];
//     wins: {
//         blackCard: BlackCard;
//         whiteCards: WhiteCard[];

//     }[]
// }

export interface ChatMessage {
    text: string;
    username: string;
    memberId: string;
    timestamp: number;
}

export interface Table {

}

export interface GameRules {
    handCount: number;
    blackCardMaxPick: number;
    winningScore: number;
    blankCardUses: number;
}

export interface RoomSettings {
    maxPlayers: number;
    maxMembers: number;
    spectatorChatRule: "all" | "gameOnly" | "lobbyOnly" | "none";
    publicLobby: boolean;
}
export enum GameStatus {
    setup = "setup",
    preRound = "preRound",
    submitPhase = "submitPhase",
    judgePhase = "judgingPhase",
    postRound = "postRound",
    gameOver = "gameOver"
}

export interface MemberData  {
    username: string;
    id: string;
    isHost: boolean;
    isSpectator: boolean;
    isPlayer: boolean;
}
export interface GameData {
    state: GameStatus;
}
export interface RoomData {
    roomCode: string;
    members: MemberData[];
    roomSettings: RoomSettings;
}

export interface RoundWin{
    playerId: string;
    whiteCards: WhiteCard[];
    blackCard: BlackCard;
    roundNumber: number;
}
export enum ErrorActions {
    redirectToJoin = "redirectToJoin",
    redirectToHome = "redirectToHome",
    clearUserData = "clearUserData",
    none = "none"
}
export interface Error {
    message: string;
    actions: ErrorActions[]
}



//Socket Types

export interface ServerToClientEvents {
    error: (error: Error) => void;
    noArg: () => void;
    basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    roomNotFound: (roomCode: string) => void;
    memberNotFound: (memberId: string) => void;
    newMessgeSent: (message: ChatMessage) => void;
    newMemberJoined: (member: UserData) => void;
    memberKicked: () => void;
    roomData: (roomData: RoomData) => void;
    gameData: (gameData: GameData) => void;
}

export interface ClientToServerEvents {
    connect: (data: UserData) => void;
    hello: () => void;
    joiningRoom: (userData: UserData) => void;
    kickingMember: (memberId: string) => void;
    sendingMessage: (message: ChatMessage) => void;
    submittingWhiteCards: (data: WhiteCard[]) => void;
    updatingRoomSettings: (roomSettings: RoomSettings) => void;
    updatingRoomSettingSingle: (setting: keyof RoomSettings, value: any) => void;
    updatingGameRuleSingle: (setting: string, value: any) => void;
    startingGame: () => void;
}

export interface InterServerEvents {
    ping: () => void;

}

export interface SocketData {
    userData: UserData;
}
