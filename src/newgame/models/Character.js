import Database from "@/newgame/managers/Database";

import { CHAR_TYPES } from "@/newgame/constants/Character";

class Character {

    constructor (data) {
        // treat the data coming from another class method
        const normalizedData = this.normalize(data);
        this.type = normalizedData.type;
        this.name = normalizedData.name;
        this.sprite = normalizedData.sprite;
        this.atlas = Database.ref.character[this.sprite].atlas;
        this.position = normalizedData.position;
        this.follower = {
            has: normalizedData.follower.has,
            id: normalizedData.follower.name
        };
        this.isPlayer = false;
        this.stop = false;
        this.stepFlag = 0;
        this.moveInProgress = false;
        if (normalizedData.isTamer) {
            this.isTamer = true;
            this.maxView = normalizedData.maxView;
        };
        if (normalizedData.type === CHAR_TYPES.ONLINE_PLAYER) {
            this.nickname = normalizedData.nickname;
        };
    }

    normalize (data) {
        data = data || {};
        data.position = data.position || {};
        data.position.x = data.position.x || 0;
        data.position.y = data.position.y || 0;
        data.position.facing = data.position.facing || 0;
        data.follower = data.follower || {};
        data.follower.has = data.follower.has || false;
        data.follower.id = data.follower.id || null;
        return data;
    }

    setType (type) {
        this.type = type;
    }

    setFollower (id) {
        this.follower = { has: true, id };
    }

    removeFollower (id) {
        this.follower = { has: false, id: null };
    }

    setX (x) {
        this.position.x = x;
    }

    setY (y) {
        this.position.y = y;
    }

    setPosition (x, y) {
        this.setX(x);
        this.setY(y);
    }

    setFacing (direction) {
        this.position.facing = direction;
    }

    setSprite (sprite) {
        this.sprite = sprite;
    }

    setMoveInProgress (inProgress) {
        this.moveInProgress = inProgress;
    }

    get hasFollower () {
        return this.follower.has;
    }
};

export default Character;