class MovesStaticDatabase {
    static create (moves) {
        this.moves = moves;
    }

    static getById (id) {
        return this.moves[id];
    }
};

export default MovesStaticDatabase;