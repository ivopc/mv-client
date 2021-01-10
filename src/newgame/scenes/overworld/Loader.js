import PlayerData from "@/newgame/managers/PlayerData";
import RawLoader from "@/newgame/managers/RawLoader";

class Loader extends RawLoader {

    fetchAssets () {
        const scene = this.scene;
        return;
        // user interface
        scene.load.atlas("icons", "assets/img/interface/icons.png", "assets/res/icons.json");
        scene.load.atlas("types", "assets/img/interface/types.png", "assets/res/types.json");
        scene.load.atlas("status-problem", "assets/img/interface/status_problem.png", "assets/res/status_problem.json");
        scene.load.image("dialog", "assets/img/interface/dialog.png");
        scene.load.atlas("d-pad", "assets/img/interface/dpad/dpad.png", "assets/res/d-pad.json");
        scene.load.spritesheet("button_new", "assets/img/battle/button_spritesheet.png", {frameWidth: 105, frameHeight: 38});
        scene.load.image("loading", "assets/img/interface/loading.png");
        scene.load.image("blue-background", "assets/img/interface/blue_background.png");
        scene.load.image("tile-background", "assets/img/interface/tile_background.png");
        scene.load.spritesheet("chat-balloon", "assets/img/interface/balloonsheet.png", {frameWidth: 39, frameHeight: 36});
        // pre-battle
        scene.load.image("wild-box", "assets/img/prebattle/box.png");
        scene.load.spritesheet("battle-button", "assets/img/prebattle/battle_sheet2.png", {frameWidth: 105, frameHeight: 38});
        scene.load.spritesheet("run-button", "assets/img/prebattle/run_sheet.png", {frameWidth: 105, frameHeight: 38});
        scene.load.spritesheet("info-button", "assets/img/prebattle/info_sheet.png", {frameWidth: 40, frameHeight: 40});
        scene.load.image("wild-tooltip", "assets/img/prebattle/tooltip-normal.png");
        scene.load.image("wild-tooltip-special", "assets/img/prebattle/tooltip-special.png");
        scene.load.spritesheet("rating", "assets/img/prebattle/rating.png", {frameWidth: 86, frameHeight: 20});
        // party
        scene.load.image("party-background", "assets/img/party/background.png");
        scene.load.spritesheet("party-slot", "assets/img/party/slotsheet.png", {frameWidth: 148, frameHeight: 39});
        scene.load.spritesheet("party-tooltip", "assets/img/party/tooltip_spritesheet.png", {frameWidth: 220, frameHeight: 50});
        scene.load.image("tab-party-button", "assets/img/party/tabpartybutton.png");
        //scene.load.image("party-return-button", "assets/img/party/return-button.png");
        scene.load.spritesheet("gender", "assets/img/party/gen.png", {frameWidth: 11, frameHeight: 11});
        scene.load.spritesheet("button_back", "assets/img/battle/back_spritesheet.png", {frameWidth: 38, frameHeight: 40});
        // specific-party
        scene.load.image("party-info", "assets/img/party/info2.png");
        scene.load.image("party-stats", "assets/img/party/statistics.png");
        scene.load.image("party-moves", "assets/img/party/moves2.png");
        scene.load.image("party-hud", "assets/img/party/hud.png");
        scene.load.image("party-move-button", "assets/img/party/move-btn.png");
        scene.load.image("party-move-window", "assets/img/party/move-window.png");
        // itens
        scene.load.image("items-background", "assets/img/items/itens/background.png");
        scene.load.image("items-window-box", "assets/img/items/itens/ui-itens-box.png");
        scene.load.spritesheet("items-button", "assets/img/items/itens/ui-itens-btn.png", {frameWidth: 113, frameHeight: 42});
        scene.load.image("items-close-btn", "assets/img/items/itens/ui-itens-close-btn.png");
        //selfie-profile
        scene.load.image("selfprofile-background", "assets/img/selfprofile/bg.png");
        scene.load.image("selfprofile-info1", "assets/img/selfprofile/ui-info1.png");
        scene.load.image("selfprofile-info2", "assets/img/selfprofile/ui-info2.png");
        scene.load.image("selfprofile-earns", "assets/img/selfprofile/ui-earns.png");
        scene.load.image("selfprofile-special-box", "assets/img/selfprofile/special-box.png");
        scene.load.image("selfprofile-boxskin", "assets/img/selfprofile/box-skin.png");
        scene.load.spritesheet("selfprofile-slotskin", "assets/img/selfprofile/slot-skin.png", {frameWidth: 39, frameHeight: 50});
        scene.load.image("selfprofile-skin-tab-pagination", "assets/img/selfprofile/skin-tab-pagination.png");
        // profile
        scene.load.image("profile-background", "assets/img/profile/bg.png");
        scene.load.image("profile-info", "assets/img/profile/infos.png");
        scene.load.image("profile-monster-slot", "assets/img/profile/monster-slot.png");
        scene.load.image("profile-achievements", "assets/img/profile/achievements.png");
        scene.load.image("profile-invite-box", "assets/img/profile/ui-invite-box.png");
        scene.load.spritesheet("profile-close-btn", "assets/img/profile/close-btn.png", {frameWidth: 14, frameHeight: 14});
        scene.load.image("profile-empty", "assets/img/profile/emptyhelper.png");
        // quests
        scene.load.image("quest-base", "assets/img/quest/base.png");
        scene.load.image("quest-accept-base", "assets/img/quest/accept-base.png");
        scene.load.image("quest-div", "assets/img/quest/div.png");
        scene.load.image("quest-item-slot", "assets/img/quest/item-slot.png");
        scene.load.image("quest-amount-bg", "assets/img/quest/amount-bg.png");
        scene.load.spritesheet("quest-pagination-btn", "assets/img/quest/pagination-btn.png", {frameWidth: 7, frameHeight: 9});
        scene.load.spritesheet("quest-btn-accept", "assets/img/quest/btn-accept.png", {frameWidth: 263, frameHeight: 35});
        // box
        scene.load.image("box-background", "assets/img/box/background.png");
        scene.load.image("box-in-party", "assets/img/box/ui-inparty.png");
        scene.load.spritesheet("box-pagination", "assets/img/box/ui-pagination.png", {frameWidth: 7, frameHeight: 12});
        scene.load.image("box-info", "assets/img/box/ui-info.png");
        scene.load.spritesheet("box-btn-slot", "assets/img/box/ui-slot-button.png", {frameWidth: 37, frameHeight: 34});
        // market
        scene.load.image("market-background", "assets/img/market/bg.png");
        scene.load.image("market-tab1", "assets/img/market/tab1.png");
        scene.load.image("market-tab2", "assets/img/market/tab2.png");
        scene.load.image("market-tab3", "assets/img/market/tab3.png");
        scene.load.image("market-tab4", "assets/img/market/tab4.png");
        scene.load.image("market-tab5", "assets/img/market/tab5.png");
        scene.load.spritesheet("market-select-pagination", "assets/img/market/select-pagination.png", {frameWidth: 7, frameHeight: 11});
        scene.load.spritesheet("market-slot-btn", "assets/img/market/slot-btn.png", {frameWidth: 109, frameHeight: 52});
        scene.load.image("market-confirm-window", "assets/img/market/window-bg.png");
        scene.load.image("market-amount-bg", "assets/img/market/amount-bg.png");
        scene.load.spritesheet("market-select-amount", "assets/img/market/select-amount.png", {frameWidth: 12, frameHeight: 6});
        scene.load.spritesheet("market-btn-confirm", "assets/img/market/btn-confirm.png", {frameWidth: 98, frameHeight: 43});
        scene.load.spritesheet("market-btn-reject", "assets/img/market/btn-reject.png", {frameWidth: 98, frameHeight: 43});
        // notify
        scene.load.image("notify-popover", "assets/img/notify/popover.png");
        scene.load.image("notify-div", "assets/img/notify/ui-div.png");
        scene.load.image("notify-background", "assets/img/notify/background.png");
        scene.load.spritesheet("notify-pagination", "assets/img/notify/ui-pagination.png", {frameWidth: 9, frameHeight: 17});
        // learn-move
        scene.load.spritesheet("learn-btn", "assets/img/notify/newmove/ui-btn.png", {frameWidth: 139, frameHeight: 39});
    }
};

export default Loader;