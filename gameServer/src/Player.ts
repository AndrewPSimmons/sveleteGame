import { BlackCard, RoundWin, WhiteCard } from "../../types";
import { Member } from "./Member";

export class Player{
    hand: WhiteCard[] = [];
    wins: RoundWin[] = [];
    isSubmitted: boolean = false;
    numberUsedBlackCards: number = 0;
    member: Member;
    constructor(member: Member, extras: Partial<Player> = {}) {
        this.member = member;
        Object.assign(this, extras);
    }
    // ...
}