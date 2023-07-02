import { model, Schema, Model, Document, connect, connection, Types, Error, ObjectId } from 'mongoose';
import { BlackCard, WhiteCard } from '../../../types';
import models, { Pack, Bcard, Wcard } from './models';

class DatabaseClass {
    db: typeof connection
    constructor() {
        const dbURI = "mongodb+srv://andrewDBMaster:7242acSimmons@cluster0.edqxy.mongodb.net/cah"
        connect(dbURI)
        const db = connection;
        db.on('error', console.error.bind(console, 'connection error:'));
        db.once('open', () => {
            console.log("DATABASE CONNECTED")
        });
        this.db = db
    }
    //Pack Function
    //=============
    

    async GetPacks(match: any = {}, cols: string = "name pack_id card_count official white_card_count black_card_count") {
        console.log("about to do query for packs: ", match, " ", cols);
        const packs = await Pack.find(match, cols, (err: any, doc: any) => {
            if (err) { console.error(err) }
            return doc
        }).clone()
        return packs
    }
    async GetPack(packID: number) {
        const match: any = {
            pack_id: packID
        }
        const pack = await Pack.findOne(match, (err: any, doc: any) => {
            if (err) { console.error(err) }
            //return doc
        })
        return pack
    }
    //Black Card FUncions
    async DrawBlackCard(packIDArray: number[], usedBCards: number[], pickMax: number, blackCardPick: number|null = null) {
        const match: any = {
            pack: { $in: packIDArray },
            id: { $nin: usedBCards }
        }
        if (pickMax) {
            match.pick = { $lte: pickMax }
        }
        if(blackCardPick && blackCardPick > 3){
            blackCardPick = 3
        }
        if (blackCardPick) {
            match.pick = blackCardPick
        }
        const blackCard: BlackCard[] = await Bcard.aggregate([
            {
                $match: match
            }, {
                $sample: { size: 1 }
            }
        ], (err: any, doc: any) => {
            if (err) { 
                console.error(err)
            }
            return doc
        })
        return blackCard[0]
    }
    //White Card Function
    async DrawWhiteCard(packIDArray: number[], usedWCards: number[], count: number) : Promise<WhiteCard[]> {
        const whiteCard = await Wcard.aggregate([
            {
                $match: {
                    pack: { $in: packIDArray },
                    id: { $nin: usedWCards }
                }
            }, {
                $sample: { size: count}
            }
        ], (err: any, doc: any) => {
            if (err) { console.error(err) }
            return doc
        })
        return whiteCard
    }
}
const DB = new DatabaseClass
export default DB