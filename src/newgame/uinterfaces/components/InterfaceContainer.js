class InterfaceContainer extends Phaser.GameObjects.Container {

    constructor (scene, layout) {
        super(scene);
        this.setLayout(layout);
        this.setName(this.layout.mainContainer.name);
        this.normalizePosition();
        this.originalSize = {};
    }

    setLayout (layoutData) {
        this.layout = layoutData;
    }

    setOriginalBaseSize ({ displayWidth, displayHeight }) {
        this.setSize(displayWidth, displayHeight);
        this.originalSize.width = displayWidth;
        this.originalSize.height = displayHeight;
    }

    normalizePosition () {
        this.setPosition(
            this.layout.mainContainer.basePosition.x, 
            this.layout.mainContainer.basePosition.y
        );
    }

    resize () {}

};

export default InterfaceContainer;