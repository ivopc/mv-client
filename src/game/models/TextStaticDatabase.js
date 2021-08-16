import PlayerModel from "./PlayerModel";

import ReplaceStringToken from "@/game/utils/ReplaceStringToken";

class TextStaticDatabase {
    static create (texts) {
        this.texts = texts;
    }

    static get (category, textKey, templateString) {
    	const text = this.texts[category][textKey][this.lang];
    	if (templateString)
    		return ReplaceStringToken.replace(text, templateString);
    	return text;
    }

    static get lang () {
        return  "br"; // {placeholder}
        // PlayerModel.lang;
    }
};

export default TextStaticDatabase;