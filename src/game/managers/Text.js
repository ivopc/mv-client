import PlayerData from "@/game/managers/PlayerData";

import ReplaceStringToken from "@/game/utils/ReplaceStringToken";

class Text {
    constructor (texts) {
    	this.texts = text;
    }

    get (category, textKey, templateString) {
    	const text = this.texts[category][textKey][this.lang];
    	if (templateString)
    		return ReplaceStringToken.replace(text, templateString);
    	return text;
    }

    get lang () {
        return PlayerData.ref.lang;
    }
    
    static ref
};

export default Text;