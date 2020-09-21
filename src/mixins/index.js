import Vue from "vue";
import wordlist from "@/lang";


Vue.mixin({
    data: () => ({
        lang: $Authentication.lang,
        wordlist
    }),
    methods: {
        injectWords (phrase, attr) {
            const obj = Object.getOwnPropertyNames(attr);
            for (let i = 0; i < obj.length; i ++) {
                phrase = phrase.replace(
                    new RegExp("{" + obj[i] + "}", "gi"), 
                    attr[obj[i]]
                );
            };
            return phrase;
        }
    }
});