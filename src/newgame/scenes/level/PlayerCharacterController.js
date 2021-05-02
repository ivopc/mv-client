import PlayerData from "@/newgame/managers/PlayerData";
import Player from "@/newgame/prefabs/Player";

import { positionToRealWorld } from "@/newgame/utils";

class PlayerCharacterController {

    constructor (scene) {
        this.scene = scene; // $playerController
        this.player;
    }

    create () {
        const { character } = PlayerData.ref;
        const player = new Player(this.scene, {
            position: {
                x: character.position.x,
                y: character.position.y,
                facing: character.position.facing
            },
            sprite: character.sprite
        });
        this.scene.$cameraController.followGameObject(player);
        this.scene.$containers.main.add(player);
        this.player = player;
    }

    async move (direction) {
        await this.player.move(direction);
    }

    face (direction) {
        this.player.face(direction);
    }

    interact () {
        this.player.interact();
    }

    getFacing () {
        return this.player._data.position.facing;
    }

    getPosition () {
        const { x, y } = this.player._data.position;
        return { x, y };
    }

    rawSetPosition (position) {
        this.player.rawSetPosition(position.x, position.y);
    }
};

export default PlayerCharacterController;