// import { model, Schema, Model, Document, connect, connection, Types, Error, ObjectId } from 'mongoose';
// import { BlackCard } from '../../../types';
// import models, { Pack, Bcard, Wcard } from './models';

// class DatabaseClass {
//     db: typeof connection
//     constructor() {
//         const dbURI = "mongodb+srv://andrewDBMaster:7242acSimmons@cluster0.edqxy.mongodb.net/cah"
//         connect(dbURI)
//         const db = connection;
//         db.on('error', console.error.bind(console, 'connection error:'));
//         db.once('open', () => {
//             console.log("DATABASE CONNECTED")
//         });
//         this.db = db
//     }
//     //Pack Function
//     //=============
//     async PackGetMetaInfo() {
//         let filter = {}
//         //"name pack_id card_count official white_card_count black_card_count"
//         const packs = await Pack.find(filter, 'name pack_id card_count official white_card_count black_card_count', (err: Error, doc: any) => {
//             if (err) { console.error(err) }
//             return doc
//         }).clone()
//         return packs
//     }
//     //Black Card FUncions
//     async BCardDraw(packIDArray: number[], usedBCards: number[], onlyPickOne: boolean) {
//         const match: any = {
//             pack: { $in: packIDArray },
//             id: { $nin: usedBCards }
//         }
//         if (onlyPickOne) {
//             match.pick = 1
//         }
//         const blackCard: BlackCard[] = await Bcard.aggregate([
//             {
//                 $match: match
//             }, {
//                 $sample: { size: 1 }
//             }
//         ], (err: Error, doc: BlackCard) => {
//             if (err) { console.error(err) }
//             return doc
//         })
//         return [blackCard[0], blackCard[0].id]
//     }

//     //White Card Function
//     async WCardDraw() {
//         const whiteCard = await Wcard.findOne({}, (err: Error, doc: any) => {
//             if (err) { console.error(err) }
//             return doc
//         }).clone()
//         return whiteCard
//     }
//     async WCardDrawCards(cardsNeeded: number, packIDArray: number[], usedWCards: number[]) {
//         //db.wcards.aggregate([{$match: {pack: {$in: [1]}}}, { $sample: { size: 3 } }])
//         /* 
//         db.wcards.aggregate(
//             [
//                 {
//                     $match: {
//                         pack: {
//                             $in: [1]
//                         },
//                         id: {
//                             $nin: usedWCards
//                         }
//                     }
//                 }, 
//                 { 
//                     $sample: { 
//                         size: 3 
//                     } 
//                 }
//             ]
//             )
//         */
//         const whiteCards = await Wcard.aggregate([
//             {
//                 $match: {
//                     pack: { $in: packIDArray },
//                     id: { $nin: usedWCards }
//                 }
//             }, {
//                 $sample: { size: cardsNeeded }
//             }
//         ], (err: Error, doc: any) => {
//             if (err) { console.error(err) }
//             return doc
//         })

//         //[1,2,3,4,5,6]
//         //[[1,2,3], [4,5,6]]
//         //[[1,3,5],[2,4,6]]
//         const usedIDs = whiteCards.map((card: WCardType) => card.id)
//         return [whiteCards, usedIDs]
//     }
//     async WCardDrawHands(playerCount: number, cardsPerHand: number, packIDArray: number[], usedWCards: number[]) {
//         //db.wcards.aggregate([{$match: {pack: {$in: [1]}}}, { $sample: { size: 3 } }])
//         /* 
//         db.wcards.aggregate(
//             [
//                 {
//                     $match: {
//                         pack: {
//                             $in: [1]
//                         },
//                         id: {
//                             $nin: usedWCards
//                         }
//                     }
//                 }, 
//                 { 
//                     $sample: { 
//                         size: 3 
//                     } 
//                 }
//             ]
//             )
//         */
//         const cardsNeeded = playerCount * cardsPerHand
//         const whiteCards = await Wcard.aggregate([
//             {
//                 $match: {
//                     pack: { $in: packIDArray },
//                     id: { $nin: usedWCards }
//                 }
//             }, {
//                 $sample: { size: cardsNeeded }
//             }
//         ], (err: Error, doc: any) => {
//             if (err) { console.error(err) }
//             return doc
//         })

//         //[1,2,3,4,5,6]
//         //[[1,2,3], [4,5,6]]
//         //[[1,3,5],[2,4,6]]
//         const hands: Array<WCardType[]> = []
//         for (let index = 0; index < playerCount; index++) {
//             hands.push([])
//         }
//         for (let index = 0; index < whiteCards.length; index++) {
//             const card = whiteCards[index];
//             const handIDX = index % playerCount

//             hands[handIDX].push(card as never)
//         }
//         const usedIDs = whiteCards.map((card: WCardType) => card.id)
//         return [hands, usedIDs]
//     }
// }
// const DB = new DatabaseClass
// export default DB