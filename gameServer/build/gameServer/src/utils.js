"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateAlphaNumericCode = exports.generateNumericCode = exports.genereateAlphaCode = void 0;
function genereateAlphaCode(length = 8) {
    //Make a 8 letter code with random letters 
    let code = "";
    for (let i = 0; i < length; i++) {
        code += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }
    return code;
}
exports.genereateAlphaCode = genereateAlphaCode;
function generateNumericCode(length = 8) {
    //Make a 8 letter code with random numbers
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}
exports.generateNumericCode = generateNumericCode;
function generateAlphaNumericCode(length = 8) {
    //Make a 8 letter code with random numbers and letters
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 36).toString(36);
    }
    return code;
}
exports.generateAlphaNumericCode = generateAlphaNumericCode;
