class Text {
    constructor () {
        this.lang;
    }

    setLang (lang) {
        this.lang = lang;
    }

    merge (texts) {
        Object.keys(texts).forEach(text => this[text] = texts[text]);
    }

    static ref
};

export default Text;