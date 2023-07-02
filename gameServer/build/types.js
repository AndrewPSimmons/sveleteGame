"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardTypes = exports.ErrorActions = exports.GameState = void 0;
var GameState;
(function (GameState) {
    GameState["setup"] = "setup";
    GameState["starting"] = "starting";
    GameState["preRound"] = "preRound";
    GameState["submitPhase"] = "submitPhase";
    GameState["judgePhase"] = "judgingPhase";
    GameState["postRound"] = "postRound";
    GameState["gameOver"] = "gameOver";
})(GameState = exports.GameState || (exports.GameState = {}));
var ErrorActions;
(function (ErrorActions) {
    ErrorActions["redirectToJoin"] = "redirectToJoin";
    ErrorActions["redirectToHome"] = "redirectToHome";
    ErrorActions["clearUserData"] = "clearUserData";
    ErrorActions["none"] = "none";
})(ErrorActions = exports.ErrorActions || (exports.ErrorActions = {}));
var CardTypes;
(function (CardTypes) {
    CardTypes["white"] = "white";
    CardTypes["black"] = "black";
})(CardTypes = exports.CardTypes || (exports.CardTypes = {}));
