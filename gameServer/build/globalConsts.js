"use strict";
// export const socket_domain = process.env["GAME_SERVER_IP"]+':5173'
Object.defineProperty(exports, "__esModule", { value: true });
exports.clientDomainLong = exports.clientDomain = exports.api_domain = exports.socket_domain = void 0;
// export const api_domain = process.env["GAME_SERVER_IP"]+':3000'
//If node env is production, use the production server, if its dev use localhost
let socket_domain;
exports.socket_domain = socket_domain;
let api_domain;
exports.api_domain = api_domain;
let clientDomain;
exports.clientDomain = clientDomain;
let clientDomainLong;
exports.clientDomainLong = clientDomainLong;
if (process.env.NODE_ENV === 'production') {
    exports.socket_domain = socket_domain = '34.206.157.48';
    exports.api_domain = api_domain = '34.206.157.48';
    exports.clientDomain = clientDomain = "playcah.com";
    exports.clientDomainLong = clientDomainLong = 'https://play-cahs-velte-8s3z0890n-andrewpsimmons.vercel.app/';
}
else {
    exports.socket_domain = socket_domain = 'localhost:5174';
    exports.api_domain = api_domain = 'localhost:3000';
    exports.clientDomain = clientDomain = "playcah.com";
}
