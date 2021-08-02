class Layout {

    constructor ({ resolution, data }) {
        this.resolution = resolution;
        this.data = data;
    }

    get (layout) {
        return this.data[layout];
    }

    setData (layoutData) {
        this.data = layoutData;
    }

    static ref
};

export default Layout;