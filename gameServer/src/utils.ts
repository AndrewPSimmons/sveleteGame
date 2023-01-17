export function genereateAlphaCode(length: number = 8): string{
    //Make a 8 letter code with random letters 
    let code = "";
    for (let i = 0; i < length; i++) {
        code += String.fromCharCode(Math.floor(Math.random() * 26) + 97);
    }
    return code;
}

export function generateNumericCode(length: number = 8): string{
    //Make a 8 letter code with random numbers
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 10);
    }
    return code;
}

export function generateAlphaNumericCode(length: number = 8){
    //Make a 8 letter code with random numbers and letters
    let code = "";
    for (let i = 0; i < length; i++) {
        code += Math.floor(Math.random() * 36).toString(36);
    }
    return code;
}