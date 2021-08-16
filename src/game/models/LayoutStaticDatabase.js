class LayoutStaticDatabase {
    static create ({ resolution, data }) {
        this.resolution = resolution;
        this.data = data;
    }

    static get (layout) {
        return this.data[layout];
    }

    static getIdle (layout) {
        return this.data.IDLE[layout];
    }

    static setData (layoutData) {
        this.data = layoutData;
    }
};

export default LayoutStaticDatabase;