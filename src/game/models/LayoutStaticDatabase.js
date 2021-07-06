class LayoutModel {
    static create ({ resolution, data }) {
        this.resolution = resolution;
        this.data = data;
    }

    static get (layout) {
        return this.data[layout];
    }
};

export default LayoutModel;