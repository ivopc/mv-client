class Layout {

    constructor ({ resolution, data }) {
        this.resolution = resolution;
        this.data = data;
    }

    get (layout) {
        return this.data[layout];
    }

    static ref
};

export default Layout;