import PlayerModel from "@/game/models/PlayerModel";
import Player from "@/game/prefabs/Player";

class PlayerCharacterController {
    constructor (scene) {
        this.scene = scene; // $playerController
        this.player;
    }

    create () {
        const { character } = PlayerModel;
        const player = new Player(this.scene, {
            position: {
                x: character.position.x,
                y: character.position.y,
                facing: character.position.facing
            },
            sprite: character.sprite
        });
        this.scene.add.existing(player);
        this.scene.$cameraController.followGameObject(player);
        this.scene.$containers.main.add(player);
        this.player = player;
    }

    setStop (enabled) {
        this.player._data.setStop(enabled);
    }

    getPlayerGameObject () {
        return this.player;
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

    getFullPosition () {
        return this.player._data.position;
    }

    setOverworldPosition ({ x, y }) {
        this.player.setOverworldPositionRaw(x, y);
    }

    lookAt (direction) {
        this.player.face(direction);
    }
};

export default PlayerCharacterController;