import PlayerData from "@/newgame/managers/PlayerData";
import Player from "@/newgame/prefabs/Player";

class PlayerCharacterController {

    constructor (scene) {
        this.scene = scene;
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

    move (direction, callback) {
        this.player.move(direction, callback);
    }

    face (direction) {
        this.player.face(direction);
    }

    getFacing () {
        return this.player._data.position.facing;
    }

    getPosition () {
        const { x, y } = this.player._data.position;
        return { x, y };
    }
};

export default PlayerCharacterController;