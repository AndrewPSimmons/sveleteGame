"use strict";
// export const socket_domain = process.env["GAME_SERVER_IP"]+':5173'
Object.defineProperty(exports, "__esModule", { value: true });
exports.api_domain = exports.socket_domain = void 0;
// export const api_domain = process.env["GAME_SERVER_IP"]+':3000'
//If node env is production, use the production server, if its dev use localhost
let socket_domain;
exports.socket_domain = socket_domain;
let api_domain;
exports.api_domain = api_domain;
if (process.env.NODE_ENV === 'production') {
    exports.socket_domain = socket_domain = '34.206.157.48:5173';
    exports.api_domain = api_domain = '34.206.157.48';
}
else {
    exports.socket_domain = socket_domain = 'localhost:5173';
    exports.api_domain = api_domain = 'localhost:3000';
}
