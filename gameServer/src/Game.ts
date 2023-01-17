import {GameData, GameRules, GameStatus, Pack, WhiteCard} from '../../types'
import { Player } from './Player';
import { gameServer } from './GameServer';
export class Game {
    roomCode: string;
    players: Player[] = [];
    packs: Pack[] = [];
    gameRules: GameRules;
    submittedCards: WhiteCard[][] = [];
    submitedCardsIdToPlayerIdMap: Map<number, string> = new Map();
    state: GameStatus = GameStatus.setup;

    constructor(roomCode: string) {
        this.roomCode = roomCode;
        this.gameRules = {
            handCount: 10,
            blackCardMaxPick: 1,
            winningScore: 10,
            blankCardUses: 1
        }
    }

    //Game loop
    //================================================================================================

    start(players: Player[]){
        this.state = GameStatus.setup;
        this.players = players;

        // ...
        //Query database for cards
        //Store the 
        this.preRound();
    }
    preRound(){
        this.state = GameStatus.preRound;
        // ...
        //Shift judge to next player
        //Select new black card

        //Set all players isSubmitted to false
        this.players.forEach(player => {
            player.isSubmitted = false;
        })

        this.submittedCards = [];
        this.submitedCardsIdToPlayerIdMap.clear();

        //Find the best way to distribute cards to players. Should it be a method in the player class? or should it be a method in the game class?
        this.submitPhase();
    }
    submitPhase(){
        this.state = GameStatus.submitPhase;
        // ...
        //Prompt players to submit cards
        //Run same function when a player submits a card, if all players have submitted, run this.judgePhase()
        //Note this function shuffles the submitted cards order every time a card is submitted

        //this.judgePhase();
        gameServer.emitUpdateGameData(this.roomCode);
    }
    judgePhase(){
        this.state = GameStatus.judgePhase;
        // ...
        //Prompt judge to select a winner
        this.postRound();
    }
    postRound(){
        this.state = GameStatus.postRound;
        // ...
        //Add winning hand to player wins array
        //Display winner of round
        //Add members where isSpectator is false and isPlayer is false to players array, set isPlayer to true
        this.preRound();
    }
    //================================================================================================
    //================================================================================================

    //Game functions
    shiftJudge(){
        // ...
    }
    selectBlackCard(){
        // ...
    }
    
    submitCard(playerId: string, cards: WhiteCard[]){
        this.submittedCards.push(cards);
        this.shuffle(this.submittedCards);

        cards.forEach(card => {
            this.submitedCardsIdToPlayerIdMap.set(card.id, playerId);
        })
        //Set isSubmitted to true for player
        const player = this.players.find(player => player.id === playerId);
        if(player){
            player.isSubmitted = true;
        }
        //Find all players where isSubmitted is false, if there are none, run this.judgePhase()
        const allSubmitted = this.players.every(player => player.isSubmitted);
        if(allSubmitted){
            this.judgePhase();
        }
    }
    
    selectWinner(cards: WhiteCard[]){
        //Look up player id for each card
        const playerIds = cards.map(card => this.submitedCardsIdToPlayerIdMap.get(card.id));

    }

    shutDown(){
        console.log("Shutting Down Game because room says so");
    }
    handlePlayerLeave(id: string){
        console.log("In game this player just left: ", gameServer.getMember(id));
    }


    shuffle(array: any[]) {
        let currentIndex = array.length,  randomIndex;
      
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
      
          // Pick a remaining element.
          randomIndex = Math.floor(Math.random() * currentIndex);
          currentIndex--;
      
          // And swap it with the current element.
          [array[currentIndex], array[randomIndex]] = [
            array[randomIndex], array[currentIndex]];
        }
      
        return array;
      }
    //Data functions
    //================================================================================================
    getGameData(): GameData{
        return {
            state: this.state,
        }
    }
    isTrue(): boolean{
        if(this.state === GameStatus.setup){
            return false;
        }
        return true;
    }
    
}


//When do we emit new game state?