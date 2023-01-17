"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorActions = exports.GameStatus = void 0;
var GameStatus;
(function (GameStatus) {
    GameStatus["setup"] = "setup";
    GameStatus["preRound"] = "preRound";
    GameStatus["submitPhase"] = "submitPhase";
    GameStatus["judgePhase"] = "judgingPhase";
    GameStatus["postRound"] = "postRound";
    GameStatus["gameOver"] = "gameOver";
})(GameStatus = exports.GameStatus || (exports.GameStatus = {}));
var ErrorActions;
(function (ErrorActions) {
    ErrorActions["redirectToJoin"] = "redirectToJoin";
    ErrorActions["redirectToHome"] = "redirectToHome";
    ErrorActions["clearUserData"] = "clearUserData";
    ErrorActions["none"] = "none";
})(ErrorActions = exports.ErrorActions || (exports.ErrorActions = {}));
