function Pin_generator (){
    let generatedPin = ""
    
    for(let i = 1; i <= 5; i++){
        let rnd = Math.floor(Math.random() * 9) + 1
        generatedPin += rnd.toString();
    }

    return generatedPin
}

module.exports = {Pin_generator}
