class LayoutStaticDatabase {
    static create ({ resolution, data }) {
        this.resolution = resolution;
        this.data = data;
    }

    static get (layout) {
        return this.data[layout];
    }

    static setData (layoutData) {
        this.data = layoutData;
    }
};

export default LayoutStaticDatabase;