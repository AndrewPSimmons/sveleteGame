import randomstring from 'randomstring'
import { MemberData } from '../../types';

export class Member {

    username: string;
    roomCode: string;
    id: string;
    isPlayer: boolean = false;
    isSpectator: boolean = false;
    isHost: boolean = false;
    socketId: string | null = null;
    constructor(username: string, roomCode: string, extras: Partial<Member> = {}) {
        this.username = username;
        this.roomCode = roomCode;
        this.id = randomstring.generate(14);
        Object.assign(this, extras);
    }

    getMemberData(): MemberData {
        return {
            id: this.id,
            username: this.username,
            isHost: this.isHost,
            isSpectator: this.isSpectator,
            isPlayer: this.isPlayer,
        }
    }
}