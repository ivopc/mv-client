import ReplaceStringToken from "@/newgame/utils/ReplaceStringToken";

class Text {
    constructor (texts, lang) {
    	this.texts = text;
        this.lang = lang;
    }

    get (category, textKey, templateString) {
    	const text = this.texts[category][textKey][this.lang];
    	if (templateString)
    		return ReplaceStringToken.replace(text, templateString);
    	return text;
    }

    setLang (lang) {
        this.lang = lang;
    }
    
    static ref
};

export default Text;