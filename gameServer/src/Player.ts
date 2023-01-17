import { BlackCard, RoundWin, WhiteCard } from "../../types";
import { Member } from "./Member";

export class Player extends Member {
    hand: WhiteCard[] = [];
    wins: RoundWin[] = [];

    isSubmitted: boolean = false;
    constructor(member: Member, extras: Partial<Player> = {}) {
        super(member.username, member.roomCode, extras);
        Object.assign(this, extras);
    }
    // ...
}