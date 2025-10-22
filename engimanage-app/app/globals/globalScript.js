let ipaddress = "192.168.254.112"
let port = "7001"
let api_url = "https://engimanage-api-backend-production.up.railway.app"
const serverLink= `http://${ipaddress}:${port}`;//`${api_url}`; //local(debug) `http://${ipaddress}:${port}`//
const api_link =  `${serverLink}/api`;

export default {serverLink,api_link,ipaddress,port}
