import { GameRules, GameStatus, RoomData, RoomSettings } from "../../types";
import { Game } from "./Game";
import { Member } from "./Member";
import { Player } from "./Player";
import randomstring from 'randomstring'
import { gameServer } from "./GameServer";

export class Room {
    roomCode: string = "";
    members: Member[] = [];
    game: Game;
    password: string = "";
    roomSettings: RoomSettings = {
        maxPlayers: 10,
        maxMembers: 10,
        spectatorChatRule: "all",
        publicLobby: false
    }
    constructor(password: string) {
        this.roomCode = randomstring.generate({
            length: 6,
            charset: 'alphabet',
            capitalization: 'uppercase'
        });
        this.password = password;
        this.game = new Game(this.roomCode)
    }

    handleMemberLeave(member: Member) {
        if (this.game.isTrue()) {
            this.game.handlePlayerLeave(member.id);
        }
        //Remove member from members array
        this.members = this.members.filter(m => m.id !== member.id);

        //If there are no members left, destroy the room
        if (this.members.length === 0) {
            gameServer.destroyRoom(this.roomCode);
            return
        }

        //If the host left, make the 0th index the new host
        if (member.isHost) {
            this.members[0].isHost = true;
        }
    }
    initGame() {
        const players = this.members.filter(member => !member.isSpectator).map(member => new Player(member));
    }
    startGame() {

    }

    joinMember(member: Member, password: string): boolean {
        if (password !== this.password) return false;
        this.members.push(member);
        return true;
    }
    kickMember(id: string) {
        const member = this.getMember(id);
        if (!member) return;
        if(member.isHost) return;
        this.handleMemberLeave(member);
        gameServer.emitMemberKicked(id);
        gameServer.emitUpdateRoom(this.roomCode);
    }

    getMember(id: string): Member | undefined {
        return this.members.find(member => member.id === id);
    }

    shutDown() {
        if (this.game.isTrue()) {
            this.game.shutDown();
        }
        //I don't think I need to do anything else here, horray for garbage collection
    }

    updateRoomSettings(settings: Partial<RoomSettings>) {
        Object.assign(this.roomSettings, settings)
    }
    updateGameRules(settings: Partial<GameRules>) {
        Object.assign(this.game.gameRules, settings)
    }
    //Room Data
    getRoomData(): RoomData {
        return {
            roomCode: this.roomCode,
            members: this.members.map(member => {
                return member.getMemberData()
            }),
            roomSettings: this.roomSettings
        }
    }

    getGame(): Game | null {
        return this.game;
    }
}
