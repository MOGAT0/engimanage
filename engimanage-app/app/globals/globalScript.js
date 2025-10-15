let ipaddress = "192.168.1.3"
let port = "6001"
let api_url = "https://engimanage-api-backend-production.up.railway.app"
const serverLink= `${api_url}`;//`${api_url}`; //local(debug) `http://${ipaddress}:${port}`//
const api_link =  `${serverLink}/api`;

export default {serverLink,api_link,ipaddress,port}
