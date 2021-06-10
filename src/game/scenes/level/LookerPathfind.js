import LevelData from "@/game/managers/LevelData";

class LookerPathfind {
    constructor (scene) {
        this.scene = scene;
        this.enabled = false;
    }

    checkPosition () {
        if (!LevelData.ref.hasTamers)
            return;
        return Object.values(LevelData.ref.script.elements.config)
            .find(staticGameObjectData => 
                staticGameObjectData.isTamer === true &&
                !LevelData.ref.tamers[staticGameObjectData.tamerId].alreadyFaced &&
                this.isInViewRange(
                    this.scene.$playerController.getPlayerGameObject(),
                    this.scene.$charactersController.getStaticCharacter(staticGameObjectData.name)
                )
            );
    }

    isInViewRange (target, looker) {}

    calcRange () {}

    setEnabled (isEnabled) {
        this.enabled = isEnabled;
    }
};

/*
// Percorrer todos os domadores do mapa 
Overworld.checkPlayerPositionTamer = function (events) {
    if (events.map.hasTamers) {
        _.each(events.elements.config, element => {

            if (element.isTamer && this.tamers && this.tamers[element.tamer_id] && !this.tamers[element.tamer_id].value) {

                const DIRECTIONS = this.database.overworld.directions_hash;

                switch (this.object_data[element.name]._data.position.facing) {
                    // up
                    case DIRECTIONS.UP: {
                        this.checkPlayerTamerRange(
                            "y", 
                            "x",
                            DIRECTIONS.UP,
                            DIRECTIONS.DOWN, 
                            element, 
                            events
                        );
                        break;
                    };
                    // right
                    case DIRECTIONS.RIGHT: {
                        this.checkPlayerTamerRange(
                            "x", 
                            "y",
                            DIRECTIONS.RIGHT,
                            DIRECTIONS.LEFT, 
                            element, 
                            events
                        );
                        break;
                    };
                    // down
                    case DIRECTIONS.DOWN: {
                        this.checkPlayerTamerRange(
                            "y", 
                            "x",
                            DIRECTIONS.DOWN,
                            DIRECTIONS.UP, 
                            element, 
                            events
                        );
                        break;
                    };
                    // left
                    case DIRECTIONS.LEFT: {
                        this.checkPlayerTamerRange(
                            "x", 
                            "y",
                            DIRECTIONS.LEFT,
                            DIRECTIONS.RIGHT, 
                            element, 
                            events
                        );
                        break;
                    };
                };
            };
        });
    };
};

// Ver distancia dos domadores
Overworld.checkPlayerTamerRange = function (axis, equalAxis, viewDirection, walkDirection, element, events) {

    const DIRECTIONS = this.database.overworld.directions_hash;
    let canWalk;

    // verificando se o player está ao alcance do domador com sua variantes
    switch (viewDirection) {
        case DIRECTIONS.RIGHT:
        case DIRECTIONS.DOWN:
        {
            canWalk = this.player._data.position[axis] > this.object_data[element.name]._data.position[axis] && this.player._data.position[axis] <= this.object_data[element.name]._data.position[axis] + element.maxview && this.player._data.position[equalAxis] == this.object_data[element.name]._data.position[equalAxis];
            break;
        };

        case DIRECTIONS.UP:
        case DIRECTIONS.LEFT:
        {
            canWalk = this.player._data.position[axis] < this.object_data[element.name]._data.position[axis] && this.player._data.position[axis] >= this.object_data[element.name]._data.position[axis] - element.maxview && this.player._data.position[equalAxis] == this.object_data[element.name]._data.position[equalAxis];
            break;
        };
    };

    // se estiver, chama batalha
    if (canWalk) {
        let pos = (this.player._data.position[axis] - this.object_data[element.name]._data.position[axis]) - 1,
            script = [];

        // corrigindo se for UP ou LEFT
        if (pos < 0) {
            pos *= -1;
            pos -= 2;
        };
        
        for (let i = 0; i < pos; i++) {
            script.push([
                "walk", 
                this.database.overworld.directions[this.object_data[element.name]._data.position.facing]
            ]);
        };

        this.player._data.stop = true;

        if (!script.length) {
            this.player.face(walkDirection);
            this.automatizeAction(
                {
                    type: events.elements.config[element.name].type,
                    name: element.name
                }, 
                events.elements.screenplay[element.name]["battle"],
                () => {
                    this.player._data.stop = false;
                }
            );

            return;
        };

        async.series([
            next => {
                this.automatizeAction({
                    type: events.elements.config[element.name].type,
                    name: element.name
                }, script, next);
            },
            next => {
                this.player.face(walkDirection);

                this.automatizeAction(
                    {
                        type: events.elements.config[element.name].type,
                        name: element.name
                    }, 
                    events.elements.screenplay[element.name]["battle"],
                    next
                );
            },
            () => {
                this.player._data.stop = false;
            }
        ]);
    };
};*/

export default LookerPathfind;