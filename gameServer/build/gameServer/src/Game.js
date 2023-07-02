"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Game = void 0;
const types_1 = require("../../types");
const GameServer_1 = require("./GameServer");
const db_1 = __importDefault(require("./database/db"));
/*
======================================================================================================
Left off where start game buttom wasn't updating on the front end ui but the backend data seems to be working
======================================================================================================
*/
class Game {
    constructor(roomCode, packIds) {
        this.roundNumber = 0;
        this.players = [];
        this.packs = [];
        this.packIds = [];
        this.judge = null;
        this.submittedCards = [];
        this.submitedCardsIdToPlayerIdMap = new Map();
        this.state = types_1.GameState.setup;
        this.blackCard = null;
        this.usedBlackCards = [];
        this.usedWhiteCards = [];
        this.latestRoundWin = null;
        this.wins = [];
        this.playerQueueToJoin = [];
        this.roomCode = roomCode;
        this.packIds = packIds;
        this.gameRules = {
            handCount: 10,
            blackCardMaxPick: 1,
            winningScore: 10,
            blankCardUses: 1
        };
    }
    //Game loop
    //================================================================================================
    gameOver() {
        return __awaiter(this, void 0, void 0, function* () {
            // Anything that happens when the game is over, or if it's ended prematurely
        });
    }
    end() {
        return __awaiter(this, void 0, void 0, function* () {
            // For when the game ends prematurely, not sure if we still want to call gameOver() or not...
            // this.state = GameState.gameOver
            // We might set state to gameOver, or not. 
            this.state = types_1.GameState.setup;
            GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            this.gameOver();
        });
    }
    start(players) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Start of start");
            this.state = types_1.GameState.starting;
            this.players = players;
            //Draw player hands
            // await this.drawPlayerHand(this.players);
            //Set judge to last player in players array
            this.judge = this.players[this.players.length - 1];
            //Go to preRound
            console.log("End of start");
            yield this.preRound();
        });
    }
    preRound() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("Start of preRound");
            this.state = types_1.GameState.preRound;
            this.roundNumber += 1;
            //Clear Selected Cards for everyone in room
            GameServer_1.gameServer.emitClearSelectedCards(this.roomCode);
            //Add any players in playerQueueToJoin to players array
            this.players = [...this.players, ...this.playerQueueToJoin];
            this.playerQueueToJoin = [];
            // ...
            //Shift judge to next player
            //Select new black card
            yield this.selectBlackCard();
            //Set all players isSubmitted to false
            this.players.forEach(player => {
                console.log("Setting player.isSubmitted to false for ", player);
                player.isSubmitted = false;
            });
            this.shiftJudge();
            this.submittedCards = [];
            this.submitedCardsIdToPlayerIdMap.clear();
            //Find the best way to distribute cards to players. Should it be a method in the player class? or should it be a method in the game class?
            yield this.drawPlayerHand(this.players);
            GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            this.submitPhase();
            //gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
            console.log("End of preRound");
        });
    }
    submitPhase() {
        console.log("Start of submitPhase");
        this.state = types_1.GameState.submitPhase;
        // ...
        //Prompt players to submit cards
        //Run same function when a player submits a card, if all players have submitted, run this.judgePhase()
        //Note this function shuffles the submitted cards order every time a card is submitted
        //Set judge to isSubmitted to true
        if (this.judge) {
            this.judge.isSubmitted = true;
        }
        //this.judgePhase();
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        console.log("End of submitPhase");
        // Wait for all players to submit cards, then inside the submitCard function, check if all players have submitted, if so, run this.judgePhase()
    }
    judgePhase() {
        console.log("In Judge Phase");
        this.state = types_1.GameState.judgePhase;
        // ...
        //Prompt judge to select a winner
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        // this.postRound();
    }
    postRound() {
        this.state = types_1.GameState.postRound;
        // ...
        //Add winning hand to player wins array
        //Display winner of round
        //Add members where isSpectator is false and isPlayer is false to players array, set isPlayer to true
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
            this.preRound();
        }), 5000);
    }
    //================================================================================================
    //================================================================================================
    //Game functions
    drawPlayerHand(players) {
        return __awaiter(this, void 0, void 0, function* () {
            const cardsNeeded = players.map(player => {
                return this.gameRules.handCount - player.hand.length;
            }).reduce((acc, curr) => acc + curr, 0);
            console.log("drawPlayerHand cardsNeeded: ", cardsNeeded);
            const cards = yield db_1.default.DrawWhiteCard(this.packIds, this.usedWhiteCards, cardsNeeded);
            this.usedWhiteCards = [...this.usedWhiteCards, ...cards.map(card => card.id)];
            let cardIndex = 0;
            players.forEach(player => {
                const cardsNeededForPlayer = this.gameRules.handCount - player.hand.length;
                const cardsForPlayer = cards.slice(cardIndex, cardIndex + cardsNeededForPlayer);
                player.hand = [...player.hand, ...cardsForPlayer];
                cardIndex += cardsNeededForPlayer;
                GameServer_1.gameServer.emitPlayerHand(player.member.roomCode, player.member.id);
            });
        });
    }
    shiftJudge() {
        console.log("In shiftJudge, players: ", this.players);
        //Find index of judge, then set judge to next player in players array. If judge is last player in array, set judge to first player in array
        const judgeIndex = this.players.findIndex(player => { var _a; return player.member.id === ((_a = this.judge) === null || _a === void 0 ? void 0 : _a.member.id); });
        if (judgeIndex === -1) {
            console.error("Judge not found in players array");
            return;
        }
        if (judgeIndex === this.players.length - 1) {
            this.judge = this.players[0];
        }
        else {
            this.judge = this.players[judgeIndex + 1];
        }
        //Set judge.isSbmitted to true
        if (this.judge) {
            this.judge.isSubmitted = true;
            if (this.judge.member.socketId) {
                GameServer_1.gameServer.emitClearSelectedCards(this.judge.member.socketId);
            }
        }
    }
    selectBlackCard() {
        return __awaiter(this, void 0, void 0, function* () {
            const newCard = yield db_1.default.DrawBlackCard(this.packIds, this.usedBlackCards, this.gameRules.blackCardMaxPick);
            this.usedBlackCards.push(newCard.id);
            this.blackCard = newCard;
        });
    }
    checkTableForAllSubmitted() {
        console.log("Probing for allSubmitted");
        console.log("Players before probing: ", this.players);
        const allSubmitted = this.players.every((player) => player.isSubmitted);
        console.log("All submitted: ", allSubmitted);
        if (allSubmitted) {
            this.judgePhase();
        }
    }
    submitCards(playerId, cards) {
        this.submittedCards.push(cards);
        this.submittedCards = this.shuffle(this.submittedCards);
        cards.forEach(card => {
            this.submitedCardsIdToPlayerIdMap.set(card.id, playerId);
        });
        //Set isSubmitted to true for player
        const player = this.players.find(player => player.member.id === playerId);
        if (player) {
            player.isSubmitted = true;
        }
        //Remove the card from player's hand
        cards.forEach(card => {
            if (player) {
                player.hand = player.hand.filter(handCard => handCard.id !== card.id);
            }
        });
        GameServer_1.gameServer.emitPlayerHand(this.roomCode, playerId);
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        //Find all players where isSubmitted is false, if there are none, run this.judgePhase()
        this.checkTableForAllSubmitted();
    }
    selectWinner(cards) {
        console.log("Winner is selected, cards: ", cards);
        //Look up player id for each card
        const playerId = cards.map(card => this.submitedCardsIdToPlayerIdMap.get(card.id))[0];
        //Add the win to the player
        if (this.blackCard === null) {
            console.error("Black card is null");
            return;
        }
        if (playerId === undefined) {
            console.error("Player id is undefined");
            return;
        }
        const player = this.players.find(player => player.member.id === playerId);
        const roundWin = {
            playerId: playerId,
            whiteCards: cards,
            blackCard: this.blackCard,
            roundNumber: this.roundNumber
        };
        console.log("Last round win before setting latestRoundWin: ", this.latestRoundWin);
        this.latestRoundWin = roundWin;
        this.wins.push(roundWin);
        console.log("Last round win after setting latestRoundWin: ", this.latestRoundWin);
        if (player) {
            player.wins.push(roundWin);
        }
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
        GameServer_1.gameServer.emitRoundWin(this.roomCode, roundWin);
        this.postRound();
    }
    shutDown() {
        console.log("Shutting Down Game because room says so");
    }
    handleBecomeSpectator(id) {
        //When a player becomes spectator, remove them from players array
        //And set isSpectator to true
        //And set isPlayer to false
        //And set isSubmitted to false
        //If player is judge, set judge to next player
        //If the player has cards submitted, return them to their hand
        //Flush the player's hand
        //Flush the player's wins
        var _a, _b;
        const player = this.players.find(player => player.member.id === id);
        // If player is judge, set judge to next player
        if (player && ((_a = this.judge) === null || _a === void 0 ? void 0 : _a.member.id) === id) {
            this.shiftJudge();
        }
        //Flush
        if (player) {
            player.hand = [];
            player.wins = [];
        }
        //Set isSpectator to true
        if (player) {
            player.member.isSpectator = true;
            player.member.isPlayer = false;
            player.isSubmitted = false;
        }
        GameServer_1.gameServer.emitPlayerHand(this.roomCode, id);
        //If player has cards submitted, then remove them from the table
        const playerCards = this.submittedCards.find(cards => this.submitedCardsIdToPlayerIdMap.get(cards[0].id) === id);
        if (playerCards) {
            //Remove from submittedCards array
            this.submittedCards = this.submittedCards.filter(cards => cards !== playerCards);
        }
        //If player is judge, set judge to next player
        if (player && ((_b = this.judge) === null || _b === void 0 ? void 0 : _b.member.id) === id) {
            this.shiftJudge();
        }
        //If the new current judge has cards submitted, return them to their hand
        //So remove from submittedCards array
        //And remove from submitedCardsIdToPlayerIdMap
        //And set isSubmitted to false
        //And add to player's hand
        if (this.judge) {
            const judgeCards = this.submittedCards.find(cards => { var _a; return this.submitedCardsIdToPlayerIdMap.get(cards[0].id) === ((_a = this.judge) === null || _a === void 0 ? void 0 : _a.member.id); });
            if (judgeCards) {
                //Remove from submittedCards array
                this.submittedCards = this.submittedCards.filter(cards => cards !== judgeCards);
                //Remove from submitedCardsIdToPlayerIdMap
                judgeCards.forEach(card => {
                    this.submitedCardsIdToPlayerIdMap.delete(card.id);
                });
                //Make sure judge.isSubmitted is true, because when we test for allSubmitted, we check if all players are submitted, and if judge.isSubmitted is false, it will never be true
                this.judge.isSubmitted = true;
                //If gamestate is just submit return the cards, if it's judge phase get the judge.hand new cards
                if (this.state === types_1.GameState.submitPhase) {
                    this.judge.hand = [...this.judge.hand, ...judgeCards];
                }
                else if (this.state === types_1.GameState.judgePhase) {
                    this.drawPlayerHand([this.judge]);
                }
                GameServer_1.gameServer.emitPlayerHand(this.roomCode, this.judge.member.id);
            }
        }
        // Remove player from players array
        this.players = this.players.filter(player => player.member.id !== id);
        //Emit data
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
    }
    handlePlayerLeave(id) {
        var _a;
        const player = structuredClone(this.players.find(player => player.member.id === id));
        // If player is judge, set judge to next player
        if (player && ((_a = this.judge) === null || _a === void 0 ? void 0 : _a.member.id) === id) {
            this.shiftJudge();
        }
        //If the new current judge has cards submitted, return them to their hand
        //If gamestate is just submit return the cards, if it's judge phase get the judge.hand new cards
        if (this.judge) {
            const judgeCards = this.submittedCards.find(cards => { var _a; return this.submitedCardsIdToPlayerIdMap.get(cards[0].id) === ((_a = this.judge) === null || _a === void 0 ? void 0 : _a.member.id); });
            if (judgeCards) {
                //Remove from submittedCards array
                this.submittedCards = this.submittedCards.filter(cards => cards !== judgeCards);
                if (this.state === types_1.GameState.submitPhase) {
                    this.judge.hand = [...this.judge.hand, ...judgeCards];
                }
                else if (this.state === types_1.GameState.judgePhase) {
                    this.drawPlayerHand([this.judge]);
                }
            }
        }
        // Remove player from players array
        this.players = this.players.filter(player => player.member.id !== id);
        //If only 1 player left, end game
        if (this.players.length === 1) {
            this.end();
        }
        GameServer_1.gameServer.emitUpdateGameDataWithPlayer(this.roomCode);
    }
    shuffle(array) {
        let currentIndex = array.length, randomIndex;
        // While there remain elements to shuffle.
        while (currentIndex != 0) {
            // Pick a remaining element.
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            // And swap it with the current element.
            [array[currentIndex], array[randomIndex]] = [
                array[randomIndex], array[currentIndex]
            ];
        }
        return array;
    }
    //Data functions
    //================================================================================================
    addPack(pack_id) {
        this.packIds.push(pack_id);
    }
    removePack(pack_id) {
        this.packIds = this.packIds.filter(id => id !== pack_id);
    }
    updateGameRules(settings) {
        Object.assign(this.gameRules, settings);
    }
    getGameData() {
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
        };
    }
    getGameDataWithPlayer(playerId) {
        const player = this.players.find(player => player.member.id === playerId);
        return Object.assign(Object.assign({}, this.getGameData()), { player: player !== null && player !== void 0 ? player : null });
    }
    getPlayer(playerId) {
        return this.players.find(player => player.member.id === playerId);
    }
    isTrue() {
        if (this.state === types_1.GameState.setup) {
            return false;
        }
        return true;
    }
    //Left off here, we need a way to add players mid game. In preroud add players in playerQueueToJoin to players array, that way they will get cards and hopefully it works
    queuePlayerJoin(player) {
        //Create Player
        //Add to playerQueueToJoin
        this.playerQueueToJoin.push(player);
    }
}
exports.Game = Game;
//When do we emit new game state?
