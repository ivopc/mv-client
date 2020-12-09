const ReplacePhrase = (phrase, attr) => {
    const obj = Object.getOwnPropertyNames(attr);
    for (let i = 0; i < obj.length; i ++) {
        phrase = phrase.replace(
            new RegExp("{" + obj[i] + "}", "gi"), 
            attr[obj[i]]
        );
    };
    return phrase;
};

export default ReplacePhrase;