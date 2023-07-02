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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const models_1 = require("./models");
class DatabaseClass {
    constructor() {
        const dbURI = "mongodb+srv://andrewDBMaster:7242acSimmons@cluster0.edqxy.mongodb.net/cah";
        (0, mongoose_1.connect)(dbURI);
        const db = mongoose_1.connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {
            console.log("DATABASE CONNECTED");
        });
        this.db = db;
    }
    //Pack Function
    //=============
    GetPacks(match = {}, cols = "name pack_id card_count official white_card_count black_card_count") {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("about to do query for packs: ", match, " ", cols);
            const packs = yield models_1.Pack.find(match, cols, (err, doc) => {
                if (err) {
                    console.error(err);
                }
                return doc;
            }).clone();
            return packs;
        });
    }
    GetPack(packID) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = {
                pack_id: packID
            };
            const pack = yield models_1.Pack.findOne(match, (err, doc) => {
                if (err) {
                    console.error(err);
                }
                //return doc
            });
            return pack;
        });
    }
    //Black Card FUncions
    DrawBlackCard(packIDArray, usedBCards, pickMax, blackCardPick = null) {
        return __awaiter(this, void 0, void 0, function* () {
            const match = {
                pack: { $in: packIDArray },
                id: { $nin: usedBCards }
            };
            if (pickMax) {
                match.pick = { $lte: pickMax };
            }
            if (blackCardPick && blackCardPick > 3) {
                blackCardPick = 3;
            }
            if (blackCardPick) {
                match.pick = blackCardPick;
            }
            const blackCard = yield models_1.Bcard.aggregate([
                {
                    $match: match
                }, {
                    $sample: { size: 1 }
                }
            ], (err, doc) => {
                if (err) {
                    console.error(err);
                }
                return doc;
            });
            return blackCard[0];
        });
    }
    //White Card Function
    DrawWhiteCard(packIDArray, usedWCards, count) {
        return __awaiter(this, void 0, void 0, function* () {
            const whiteCard = yield models_1.Wcard.aggregate([
                {
                    $match: {
                        pack: { $in: packIDArray },
                        id: { $nin: usedWCards }
                    }
                }, {
                    $sample: { size: count }
                }
            ], (err, doc) => {
                if (err) {
                    console.error(err);
                }
                return doc;
            });
            return whiteCard;
        });
    }
}
const DB = new DatabaseClass;
exports.default = DB;
