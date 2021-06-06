class LevelObjectsMap {

    constructor () {
        this.data = {};
    }

    get ({x, y}) {
        return this.data[`${x}|${y}`] || null;
    }

    add (gameObject, {x, y}) {
        this.data[`${x}|${y}`] = gameObject;
    }

    switch (gameObject, oldPosition, newPosition) {
        this.removeFrom(oldPosition);
        this.add(gameObject, newPosition);
    }

    removeFrom ({x, y}) {
        delete this.data[`${x}|${y}`];
    }

    exists ({x, y}) {
        return !!this.data[`${x}|${y}`];
    }

    clear () {
        this.data = {};
    }
};

export default LevelObjectsMap;