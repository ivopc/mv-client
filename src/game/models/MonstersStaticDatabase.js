class MonstersStaticDatabase {
    static create (monsters) {
        this.data = monsters; 
    }

    static get (monsterpediaId) {
        return this.data[monsterpediaId];
    }
};

export default MonstersStaticDatabase;