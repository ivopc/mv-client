class ReplaceStringToken {
    static replace (text, attr) {
        const obj = Object.getOwnPropertyNames(attr);
        for (let i = 0; i < obj.length; i ++) {
            text = text.replace(
                new RegExp("{" + obj[i] + "}", "gi"), 
                attr[obj[i]]
            );
        };
        return text;
    }
};

export default ReplaceStringToken;