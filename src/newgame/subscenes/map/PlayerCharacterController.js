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
        player.cameraFollow();
        this.scene.$containers.main.add(player);
        this.scene.$player = player;
    }
};

export default PlayerCharacterController;