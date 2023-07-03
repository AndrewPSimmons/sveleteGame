// export const socket_domain = process.env["GAME_SERVER_IP"]+':5173'

// export const api_domain = process.env["GAME_SERVER_IP"]+':3000'


//If node env is production, use the production server, if its dev use localhost

let socket_domain: string;
let api_domain: string;
let clientDomain: string;
let clientDomainLong: string;
if(process.env.NODE_ENV === 'production'){
    socket_domain = 'api.playcah.com'
    api_domain = 'api.playcah.com'
    clientDomain = "playcah.com"
    clientDomainLong = 'play-cahs-velte-kit.vercel.app'
}else{
    socket_domain = 'localhost:3001'
    api_domain = 'localhost:3000'
    clientDomain = "playcah.com"
    clientDomainLong = 'play-cahs-velte-kit.vercel.app'
}

export {socket_domain, api_domain, clientDomain, clientDomainLong}
