import async from "async";
import _ from "underscore";

import Overworld from "./index";


// pegar estastísticas do EXP
Overworld.getExpStatistics = function (exp, level) {

    const expDatabase = this.cache.json.get("experience");

    var levelTotalCurrent = _.findWhere(expDatabase, {level: level}),
        levelTotalNext = _.findWhere(expDatabase, {level: level + 1});

    var total = levelTotalNext.exp - levelTotalCurrent.exp,
        current = exp - levelTotalCurrent.exp;

    console.log({total, current});

    // 1253/1261

    console.log("EXP ", (current / total) * 100, "%");

    return {
        current,
        total,
        nextTotal: levelTotalNext.exp,
        percentage: (current / total) * 100
    };
};

// converter número para a pedia
Overworld.numberToPedia = function (num) {
    
    num = String(num);

    if (num.length == 1)
        return "00" + num;

    if (num.length == 2)
        return "0" + num;

    return num;
};

// pegar itens
Overworld.getItems = function () {

    var items = {},
        i = 0,
        arr = [];

    for (let i = 0; i < this.Data.CurrentItems.length; i ++) {
        if ( !(this.Data.CurrentItems[i].item_id in items) ) {
            items[this.Data.CurrentItems[i].item_id] = {
                item_id: this.Data.CurrentItems[i].item_id,
                amount: this.Data.CurrentItems[i].amount
            };
        } else {
            items[this.Data.CurrentItems[i].item_id].amount += this.Data.CurrentItems[i].amount;
        };
    };

    _.each(items, data => {
        arr[i++] = data;
    });

    return arr;
};

Overworld.removeItem = function (id) {
    // descontar item
    for (let i = 0, l = this.Data.CurrentItems.length; i < l; i ++)
        if (this.Data.CurrentItems[i].item_id == id)
            --this.Data.CurrentItems[i].amount;
};

// fazer ação do item
Overworld.setItemAction = function () {

    this.removeLoader();
    this.removeItem(this.selectedItem);

    // ver tipo de ação do item
    switch (this.itemActionType) {
        // usar
        case 0: {
            switch (this.database.items[this.selectedItem].type) {
                // caso seja poção healer
                case "health_potion": {
                    async.series([
                        next => {
                            this.addHp(
                                this.currentPartyTooltipOpened,
                                this.database.items[this.selectedItem].effect.heal,
                                true,
                                next
                            );
                        },
                        next => this.time.addEvent({delay: 800, callback: next}),
                        next => {
                            this.interfacesHandler.party.clear(true);
                            this.enableDisableButtonsInterface(true);
                        }
                    ]);
                    break;
                };

                // caso seja poção de mana
                case "mana_potion": {
                    this.addMp(
                        this.currentPartyTooltipOpened,
                        this.database.items[this.selectedItem].effect.heal
                    );
                    this.interfacesHandler.party.clear(true);
                    this.enableDisableButtonsInterface(true);
                    break;
                };

                // vitamina
                case "vitamin": {break;};

                // pergaminho de move
                case "parchment": {

                    console.log("lol vai se fuder fdp");

                    this.successToast.show(ReplacePhrase(this.cache.json.get("language").item["learnmove"][this.lang], {i: 1}));
                    
                    this.interfacesHandler.party.clear(true);
                    this.enableDisableButtonsInterface(true);
                    this.clearLearnMove();

                    break;
                };
            };


            break;
        };
        // equipar
        case 1: {break;};
    };
};

Overworld.moveLearnedByNotify = function () {

    console.log("FOI FDP");
    this.successToast.show(ReplacePhrase(this.cache.json.get("language").item["learnmove"][this.lang], {i: 1}));
    this.clearLearnMove();
};

Overworld.dontLearnMoveByNotify = function () {
    this.clearMoveNotification();
};

Overworld.evolveByNotify = function () {
    this.clearEvolveNotification();
    this.successToast.show(this.cache.json.get("language").notify["evolveaction"][this.lang]);
};

// adicionar HP
Overworld.addHp = function (index, hp, hasAnimation, callback) {
    const monster = this.Data.CurrentMonsters["monster" + index];
    this.Data.CurrentMonsters["monster" + index].current_HP = hp + monster.current_HP > monster.stats_HP ? monster.stats_HP : hp + monster.current_HP;

    if (hasAnimation) {
        this.interfacesHandler.party.clearPartyTooltip();
        this.slots[index].elements.hpText.setText(monster.current_HP + "/" + monster.stats_HP);
        this.slots[index].elements.healthBar.setPercent((monster.current_HP / monster.stats_HP) * 100, callback);
    };
};

// adicionar HP
Overworld.addMp = function (index, mp) {
    const monster = this.Data.CurrentMonsters["monster" + index];
    this.Data.CurrentMonsters["monster" + index].current_MP = mp + monster.current_MP > monster.stats_MP ? monster.stats_MP : mp + monster.current_MP;
};

// converter milisegundos para data
Overworld.convertMsToDate = function (miliseconds, format) {

    let days, hours, minutes, seconds, total_hours, total_minutes, total_seconds;

    total_seconds = parseInt(Math.floor(miliseconds / 1000));
    total_minutes = parseInt(Math.floor(total_seconds / 60));
    total_hours = parseInt(Math.floor(total_minutes / 60));
    days = parseInt(Math.floor(total_hours / 24));

    seconds = parseInt(total_seconds % 60);
    minutes = parseInt(total_minutes % 60);
    hours = parseInt(total_hours % 24);

    switch(format) {
    case "s":
        return total_seconds;
    case "m":
        return total_minutes;
    case "h":
        return total_hours;
    case "d":
        return days;
    default:
        return { d: days, h: hours, m: minutes, s: seconds };
    };
};

// tratar data do vip
Overworld.treatVipDate = function (vip_date) {

    const time = this.convertMsToDate(vip_date - Date.now());

    console.log(time);

    if (time.d > 0) {
        return ReplacePhrase(this.cache.json.get("language").profile.vipdays[this.lang], {
            time: time.d
        });
    };

    if (time.h > 0) {
        return ReplacePhrase(this.cache.json.get("language").profile.viphours[this.lang], {
            time: time.h
        });
    };

    if (time.m > 0) {
        return ReplacePhrase(this.cache.json.get("language").profile.vipminutes[this.lang], {
            time: time.m
        });
    };

    return this.cache.json.get("language").profile.viplessthanonemin[this.lang];
};

export default Overworld;