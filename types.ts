import { Member } from "./gameServer/src/Member";
import type { Player } from "./gameServer/src/Player";
export interface WhiteCard {
    _id: string;
    text: string;
    id: number;
    pack: number;
}

export interface CustomWhiteCard extends WhiteCard {
    oldText: string;
    isCustom: true;
}

export interface BlackCard {
    _id: string;
    text: string;
    pick: number;
    pack: number;
    id: number;
}

export interface Pack{
    _id: string;
    name: string;
    white: WhiteCard[];
    black: BlackCard[];
    official: boolean;
    pack_id: number;
    card_count: number;
    white_card_count: number;
    black_card_count: number;
}

export interface PackData{
    _id: string;
    name: string;
    official: boolean;
    pack_id: number;
    card_count: number;
    white_card_count: number;
    black_card_count: number;
}

export interface UserData {
    username: string;
    id: string;
    roomCode: string;
    isHost: boolean;
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


export interface MemberData  {
    username: string;
    id: string;
    isHost: boolean;
    isSpectator: boolean;
    isPlayer: boolean;
}
export interface GameData {
    roomCode: string,
    packIds: number[],
    blackCard: BlackCard | null,
    state: GameState;
    gameRules: GameRules;
    submittedCards: WhiteCard[][];
    judge: Player | null;
    latestRoundWin: RoundWin | null;
    wins: RoundWin[];
    playerQueueToJoin: Player[];
}

export type PlayerData = typeof Player.prototype;
 
export interface GameDataWithPlayer extends GameData {
    player: Player | null;
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

export interface Error {
    message: string;
    actions: ErrorActions[]
}

export enum GameState {
    setup = "setup",
    starting = "starting",
    preRound = "preRound",
    submitPhase = "submitPhase",
    judgePhase = "judgingPhase",
    postRound = "postRound",
    gameOver = "gameOver"
}

export enum ErrorActions {
    redirectToJoin = "redirectToJoin",
    redirectToHome = "redirectToHome",
    clearUserData = "clearUserData",
    none = "none"
}

export enum CardTypes {
    white = "white",
    black = "black"
}

//Socket Types

export interface ServerToClientEvents {
    error: (error: Error) => void;
    noArg: () => void;
    // basicEmit: (a: number, b: string, c: Buffer) => void;
    withAck: (d: string, callback: (e: number) => void) => void;
    roomNotFound: (roomCode: string) => void;
    memberNotFound: (memberId: string) => void;
    memberData: (memberData: MemberData) => void;
    basePacksSent: (packs: PackData[]) => void;


    newMessgeSent: (message: ChatMessage) => void;
    newMemberJoined: (member: UserData) => void;
    memberKicked: () => void;
    roomData: (roomData: RoomData) => void;
    gameData: (gameData: GameData) => void;
    gameDataKeyVal: (key: keyof GameData, value: any) => void;
    gameDataWithPlayer: (gameData: GameDataWithPlayer) => void;
    updatePlayerHand: (hand: WhiteCard[]) => void;
    roundWinner: (roundWin: RoundWin) => void;

    clearSelectedCards: () => void;
}

export interface ClientToServerEvents {
    connect: (data: UserData) => void;
    hello: () => void;
    joiningRoom: (userData: UserData) => void;
    kickingMember: (memberId: string) => void;

    becomingSpectator: () => void;
    becomingPlayer: () => void;

    requestingBasePacks: () => void;
    addingPack: (pack_id: number) => void;
    removingPack: (pack_id: number) => void;

    sendingMessage: (message: ChatMessage) => void;
    submittingWhiteCards: (data: WhiteCard[]) => void;

    selectingWinningCards: (data: WhiteCard[]) => void;

    updatingRoomSettings: (roomSettings: RoomSettings) => void;
    updatingRoomSettingSingle: (setting: keyof RoomSettings, value: any) => void;
    updatingGameRules: (gameRules: GameRules) => void;
    updatingGameRuleSingle: (setting: string, value: any) => void;
    startingGame: () => void;
    endingGame: () => void;
}

export interface InterServerEvents {
    ping: () => void;

}

export interface SocketData {
    userData: UserData;
}
