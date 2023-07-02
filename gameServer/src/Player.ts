import { BlackCard, RoundWin, WhiteCard } from "../../types";
import { Member } from "./Member";

export class Player{
    hand: WhiteCard[] = [];
    wins: RoundWin[] = [];
    isSubmitted: boolean = false;
    member: Member;
    constructor(member: Member, extras: Partial<Player> = {}) {
        this.member = member;
        Object.assign(this, extras);
    }
    // ...
}