import {BlackCard, CustomWhiteCard, GameData, GameDataWithPlayer, GameRules, GameState, Pack, RoundWin, WhiteCard} from '../../types'
import { Player } from './Player';
import { gameServer } from './GameServer';
import DB from './database/db';


/* 
======================================================================================================
Left off where start game buttom wasn't updating on the front end ui but the backend data seems to be working
======================================================================================================
*/


export class Game {
    roundNumber: number = 0;
    roomCode: string;
    players: Player[] = [];
    packs: Pack[] = [];
    packIds: number[] = [];
    judge: Player | null = null;
    gameRules: GameRules;
    submittedCards: WhiteCard[][] = [];
    submitedCardsIdToPlayerIdMap: Map<number, string> = new Map();
    state: GameState = GameState.setup;
    blackCard: BlackCard | null = null
    usedBlackCards: number[] = [];
    usedWhiteCards: number[] = [];
    latestRoundWin: RoundWin | null = null;
    wins: RoundWin[] = [];
    playerQueueToJoin: Player[] = [];

    constructor(roomCode: string, packIds: number[]) {
        this.roomCode = roomCode;
        this.packIds = packIds;
        this.gameRules = {
            handCount: 10,
            blackCardMaxPick: 1,
            winningScore: 10,
            blankCardUses: 1
        }
    }

    //Game loop
    //================================================================================================

    async gameOver(){
        // Anything that happens when the game is over, or if it's ended prematurely
    }
    async end(){
        // For when the game ends prematurely, not sure if we still want to call gameOver() or not...
        // this.state = GameState.gameOver
        // We might set state to gameOver, or not. 
        this.state = GameState.setup;

        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        this.gameOver();
    }
    async start(players: Player[]){
        console.log("Start of start");
        this.state = GameState.starting;
        this.players = players;

        //Draw player hands
        // await this.drawPlayerHand(this.players);

        //Set judge to last player in players array
        this.judge = this.players[this.players.length - 1];

        //Go to preRound
        await this.preRound();
    }
    async preRound(){
        console.log("Start of preRound");
        this.state = GameState.preRound;
        this.roundNumber += 1;

        //Clear Selected Cards for everyone in room
        gameServer.emitClearSelectedCards(this.roomCode);
        //Add any players in playerQueueToJoin to players array
        this.players = [...this.players, ...this.playerQueueToJoin];
        this.playerQueueToJoin = [];
        // ...
        //Shift judge to next player
        //Select new black card
        await this.selectBlackCard()

        //Set all players isSubmitted to false
        this.players.forEach(player => {
            player.isSubmitted = false;
        })

        this.shiftJudge();

        this.submittedCards = [];
        this.submitedCardsIdToPlayerIdMap.clear();

        //Find the best way to distribute cards to players. Should it be a method in the player class? or should it be a method in the game class?
        
        await this.drawPlayerHand(this.players);
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        this.submitPhase();
        //gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
    }
    submitPhase(){
        console.log("Start of submitPhase");
        this.state = GameState.submitPhase;
        // ...
        //Prompt players to submit cards
        //Run same function when a player submits a card, if all players have submitted, run this.judgePhase()
        //Note this function shuffles the submitted cards order every time a card is submitted

        //Set judge to isSubmitted to true
        if(this.judge){
            this.judge.isSubmitted = true;
        }
        //this.judgePhase();
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);

        // Wait for all players to submit cards, then inside the submitCard function, check if all players have submitted, if so, run this.judgePhase()
    }
    judgePhase(){
        console.log("In Judge Phase");
        this.state = GameState.judgePhase;
        // ...
        //Prompt judge to select a winner
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        // this.postRound();
    }
    postRound(){
        this.state = GameState.postRound;
        // ...
        //Add winning hand to player wins array
        //Display winner of round
        //Add members where isSpectator is false and isPlayer is false to players array, set isPlayer to true
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);

        //Look for a winner
        const winner = this.players.find(player => player.wins.length >= this.gameRules.winningScore);
        if(winner){
            setTimeout(async () => {
                this.gameWon(winner);
            }, 5000);
        }else{
        setTimeout(async () => {
            this.preRound();
        }, 5000);
    }
    }
    //================================================================================================
    //================================================================================================

    //Game functions

    async drawPlayerHand(players: Player[]){
        const cardsNeeded = players.map(player => {
            return this.gameRules.handCount - player.hand.length;
        }).reduce((acc, curr)=>acc+curr, 0);
        // console.log("drawPlayerHand cardsNeeded: ", cardsNeeded)

        const cards = await DB.DrawWhiteCard(this.packIds, this.usedWhiteCards, cardsNeeded);
        this.usedWhiteCards = [...this.usedWhiteCards, ...cards.map(card => card.id)];

        let cardIndex = 0
        players.forEach(player => {
            const cardsNeededForPlayer = this.gameRules.handCount - player.hand.length;
            const cardsForPlayer = cards.slice(cardIndex, cardIndex + cardsNeededForPlayer);
            player.hand = [...player.hand, ...cardsForPlayer];
            cardIndex += cardsNeededForPlayer;
            gameServer.emitPlayerHand(player.member.roomCode, player.member.id);
        })

    }
    shiftJudge(){
        //Find index of judge, then set judge to next player in players array. If judge is last player in array, set judge to first player in array
        const judgeIndex = this.players.findIndex(player => player.member.id === this.judge?.member.id);
        if(judgeIndex === -1){
            console.error("Judge not found in players array");
            return;
        }
        if(judgeIndex === this.players.length - 1){
            this.judge = this.players[0];
        }else{
            this.judge = this.players[judgeIndex + 1];
        }

        //Set judge.isSbmitted to true
        if(this.judge){
            this.judge.isSubmitted = true;
            if(this.judge.member.socketId){
                gameServer.emitClearSelectedCards(this.judge.member.socketId)
            }
        }
    }
    async selectBlackCard(){
        const newCard = await DB.DrawBlackCard(this.packIds, this.usedBlackCards, this.gameRules.blackCardMaxPick);
        this.usedBlackCards.push(newCard.id);
        this.blackCard = newCard;
    }
    
    checkTableForAllSubmitted(){
        const allSubmitted = this.players.every((player: any) => player.isSubmitted);
        if(allSubmitted){
            this.judgePhase();
        }
    }
    submitCards(playerId: string, cards: WhiteCard[]|CustomWhiteCard[]){
        
        this.submittedCards.push(cards);
        this.submittedCards = this.shuffle(this.submittedCards);

        cards.forEach(card => {
            this.submitedCardsIdToPlayerIdMap.set(card.id, playerId);
        })
        //Set isSubmitted to true for player
        const player = this.players.find(player => player.member.id === playerId);
        if(player){
            player.isSubmitted = true;
        }
        //Remove the card from player's hand
        cards.forEach((card: WhiteCard|CustomWhiteCard) => {
            if(player){
                player.hand = player.hand.filter(handCard => handCard.id !== card.id);
                const isCardCustom = card.hasOwnProperty("isCustom") && (card as CustomWhiteCard).isCustom;
                if(isCardCustom){
                    player.numberUsedBlackCards += 1;
                }
            }
        })

        gameServer.emitPlayerHand(this.roomCode, playerId);
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        //Find all players where isSubmitted is false, if there are none, run this.judgePhase()
        this.checkTableForAllSubmitted()
    }
    

    selectRoundWinner(cards: WhiteCard[]){
        //Look up player id for each card
        const playerId = cards.map(card => this.submitedCardsIdToPlayerIdMap.get(card.id))[0];


        //Add the win to the player
        if(this.blackCard === null){
            console.error("Black card is null");
            return
        }
        if(playerId === undefined){
            console.error("Player id is undefined");
            return;
        }
        const player = this.players.find(player => player.member.id === playerId);

        const roundWin: RoundWin = {
            playerId: playerId,
            whiteCards: cards,
            blackCard: this.blackCard,
            roundNumber: this.roundNumber
        }
        this.latestRoundWin = roundWin;
        this.wins.push(roundWin);
        if(player){
            player.wins.push(roundWin);
        }
        
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        gameServer.emitRoundWin(this.roomCode, roundWin);
        this.postRound()

    }

    gameWon(winner: Player){
        //Do Something to end the game
        console.log("Winner found: ", winner);
        this.state = GameState.gameOver;
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        gameServer.emitGameWon(this.roomCode, winner);
    }
    shutDown(){
        console.log("Shutting Down Game because room says so");
    }

    handleBecomeSpectator(id: string){
        //When a player becomes spectator, remove them from players array
        //And set isSpectator to true
        //And set isPlayer to false
        //And set isSubmitted to false
        //If player is judge, set judge to next player
        //If the player has cards submitted, return them to their hand
        //Flush the player's hand
        //Flush the player's wins

        const player = this.players.find(player => player.member.id === id);
        // If player is judge, set judge to next player
        if(player && this.judge?.member.id === id){
            this.shiftJudge();
        }

        //Flush
        if(player){
            player.hand = [];
            player.wins = [];
        }

        //Set isSpectator to true
        if(player){
            player.member.isSpectator = true;
            player.member.isPlayer = false;
            player.isSubmitted = false;
        }
        gameServer.emitPlayerHand(this.roomCode, id);

        //If player has cards submitted, then remove them from the table
        const playerCards = this.submittedCards.find(cards => this.submitedCardsIdToPlayerIdMap.get(cards[0].id) === id);
        if(playerCards){
            //Remove from submittedCards array
            this.submittedCards = this.submittedCards.filter(cards => cards !== playerCards);
        }

        //If player is judge, set judge to next player
        if(player && this.judge?.member.id === id){
            this.shiftJudge();
        }

        //If the new current judge has cards submitted, return them to their hand
        //So remove from submittedCards array
        //And remove from submitedCardsIdToPlayerIdMap
        //And set isSubmitted to false
        //And add to player's hand
        if(this.judge){
            const judgeCards = this.submittedCards.find(cards => this.submitedCardsIdToPlayerIdMap.get(cards[0].id) === this.judge?.member.id);
            if(judgeCards){
                //Remove from submittedCards array
                this.submittedCards = this.submittedCards.filter(cards => cards !== judgeCards);

                //Remove from submitedCardsIdToPlayerIdMap
                judgeCards.forEach(card => {
                    this.submitedCardsIdToPlayerIdMap.delete(card.id);
                })


                //Make sure judge.isSubmitted is true, because when we test for allSubmitted, we check if all players are submitted, and if judge.isSubmitted is false, it will never be true
                this.judge.isSubmitted = true;

                //If gamestate is just submit return the cards, if it's judge phase get the judge.hand new cards
                if(this.state === GameState.submitPhase){
                    this.judge.hand = [...this.judge.hand, ...judgeCards];
                }else if(this.state === GameState.judgePhase){
                    this.drawPlayerHand([this.judge]);
                }

                gameServer.emitPlayerHand(this.roomCode, this.judge.member.id);
            }


        }
        // Remove player from players array
        this.players = this.players.filter(player => player.member.id !== id);

        //Emit data
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
    }
    handlePlayerLeave(id: string){
        const player = structuredClone(this.players.find(player => player.member.id === id));
        // If player is judge, set judge to next player
        if(player && this.judge?.member.id === id){
            this.shiftJudge();
        }

        //If the new current judge has cards submitted, return them to their hand
        //If gamestate is just submit return the cards, if it's judge phase get the judge.hand new cards
        if(this.judge){
            const judgeCards = this.submittedCards.find(cards => this.submitedCardsIdToPlayerIdMap.get(cards[0].id) === this.judge?.member.id);
            if(judgeCards){
                //Remove from submittedCards array
                this.submittedCards = this.submittedCards.filter(cards => cards !== judgeCards);
                if(this.state === GameState.submitPhase){
                    this.judge.hand = [...this.judge.hand, ...judgeCards];
                }else if(this.state === GameState.judgePhase){
                    this.drawPlayerHand([this.judge]);
                }
            }
        }
        // Remove player from players array
        this.players = this.players.filter(player => player.member.id !== id);


        //If only 1 player left, end game
        if(this.players.length === 1){
            this.end();
        }
        gameServer.emitUpdateGameDataWithPlayer(this.roomCode);


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

    addPack(pack_id: number){
        this.packIds.push(pack_id);
    }
    removePack(pack_id: number){
        this.packIds = this.packIds.filter(id => id !== pack_id);
    }
    updateGameRules(settings: Partial<GameRules>) {
        Object.assign(this.gameRules, settings)
    }
    getGameData(): GameData{
        return {
            roomCode: this.roomCode,
            packIds: this.packIds,
            blackCard: this.blackCard,
            state: this.state,
            gameRules: this.gameRules,
            submittedCards: this.submittedCards,
            judge: this.judge,
            latestRoundWin: this.latestRoundWin,
            wins: this.wins,
            playerQueueToJoin: this.playerQueueToJoin
        }
    }
    getGameDataWithPlayer(playerId: string): GameDataWithPlayer{
        const player = this.players.find(player => player.member.id === playerId);

        return {
            ...this.getGameData(),
            player: player ?? null
        }

    }

    getPlayer(playerId: string): Player | undefined{
        return this.players.find(player => player.member.id === playerId);
    }
    isTrue(): boolean{
        if(this.state === GameState.setup){
            return false;
        }
        return true;
    }
    
    //Left off here, we need a way to add players mid game. In preroud add players in playerQueueToJoin to players array, that way they will get cards and hopefully it works
    queuePlayerJoin(player: Player){
        //Create Player
        //Add to playerQueueToJoin
        this.playerQueueToJoin.push(player);
    }



}


//When do we emit new game state?