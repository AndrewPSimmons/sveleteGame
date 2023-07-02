import type { GameData, GameDataWithPlayer } from "./types";
import { GameState } from "./types";
export function defaultGameData(): GameDataWithPlayer {
    return {
        state: GameState.setup,
        gameRules: {
            handCount: 10,
            blackCardMaxPick: 3,
            winningScore: 8,
            blankCardUses: 5
        },
        packIds: [],
        blackCard: null,
        roomCode: "",
        player: null
    }
}


/* 
roomCode: string,
    packIds: number[],
    blackCard: BlackCard | null,
    state: GameState;
    gameRules: GameRules;
    */