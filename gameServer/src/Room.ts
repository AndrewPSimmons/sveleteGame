import { GameRules, GameState, RoomData, RoomSettings } from "../../types";
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
            length: 2,
            charset: 'alphabet',
            capitalization: 'uppercase'
        });
        this.password = password;
        this.game = new Game(this.roomCode, [])
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
            console.log("Setting new host");
        }
    }
    initGame() {
        const players = this.members.filter(member => !member.isSpectator).map(member => new Player(member));
    }

    createPlayers(){
        const players = this.members.filter(member => !member.isSpectator).map(member => new Player(member));
        return players;
    }
    startGame() {
        //Select players from members where isPlayer is true
        const players = this.createPlayers()
        this.game.start(players)
    }
    endGame(){
        this.game.end();
        this.game = new Game(this.roomCode, this.game.packIds)
        this.game.state = GameState.setup;

        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
    }

    joinMember(member: Member, password: string): boolean {
        if (password !== this.password) return false;
        this.members.push(member);
        return true;
    }
    kickMember(memberId: string) {
        const member = this.getMember(memberId);
        if (!member) return;
        if(!member.socketId) return;
        if(member.isHost) return;
        gameServer.emitMemberKicked(member.socketId);
        this.handleMemberLeave(member);
        gameServer.emitUpdateRoomData(this.roomCode);
    }

    becomeSpectator(memberId: string) {
        const member = this.getMember(memberId);
        if (!member || !member.socketId) return; 
        if (member.isSpectator) return;
        //Veriy that there is room for a spectator
        if (this.members.filter(member => member.isSpectator).length >= this.roomSettings.maxMembers - this.members.filter(member => !member.isSpectator).length) {
            gameServer.emitError(member.socketId, "There is no room for a spectator", []);
            return;
        };

        
        member.isSpectator = true;
        member.isPlayer = false;
        if(this.game.isTrue()){
            this.game.handleBecomeSpectator(memberId);
            gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            gameServer.emitPlayerHand(this.roomCode, memberId);
        }
        gameServer.emitUpdateRoomData(this.roomCode);

    }
    becomePlayer(memberId: string) {
        const member = this.getMember(memberId);
        if (!member) return;
        if (!member.isSpectator) return;
        if (this.members.filter(member => !member.isSpectator).length >= this.roomSettings.maxPlayers) {
            //Alert that there is no room for a player
            return;
        };
        member.isSpectator = false;
        member.isPlayer = true;
        if(this.game.isTrue()){
            const newPlayer = new Player(member);
            this.game.queuePlayerJoin(newPlayer);

            gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            gameServer.emitPlayerHand(this.roomCode, memberId);
        }
        gameServer.emitUpdateRoomData(this.roomCode);
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
