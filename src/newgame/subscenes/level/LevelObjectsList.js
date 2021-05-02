class LevelObjectsList extends Array {

    get ({x, y}) {
        return this
            .find(gameObject => 
                gameObject._data.position.x === x && 
                gameObject._data.position.y === y
            );
    }

    set (gameObject) {
        this.push(gameObject);
    }

    removeFrom ({x, y}) {
        const index = this
            .findIndex(gameObject => 
                gameObject._data.position.x === x && 
                gameObject._data.position.y === y
            );
        this.splice(index, 1);
    }
    
    exists ({x, y}) {
        return this
            .some(gameObject => 
                gameObject._data.position.x === x && 
                gameObject._data.position.y === y
            );
    }
};

export default LevelObjectsList;

