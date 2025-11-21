let ipaddress = "10.74.46.11"
let port = "7001"
let api_url = "https://engimanagerestapi-production.up.railway.app"
const serverLink= `${api_url}`; //local(debug) `http://${ipaddress}:${port}`//
const api_link =  `${serverLink}/api`;

export default {serverLink,api_link,ipaddress,port}
