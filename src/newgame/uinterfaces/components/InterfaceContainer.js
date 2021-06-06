class InterfaceContainer extends Phaser.GameObjects.Container {

    constructor (scene, layout) {
        super(scene);
        this.originalSize = {
            width: 0,
            height: 0
        };
        this.setLayout(layout);
        this.setName(this.layout.mainContainer.name);
        this.normalizePosition();
    }

    setLayout (layoutData) {
        this.layout = layoutData;
    }

    setOriginalBaseSize ({ displayWidth, displayHeight }) {
        this.setSize(displayWidth, displayHeight);
        this.originalSize.width = displayWidth;
        this.originalSize.height = displayHeight;
        Object.freeze(this.originalSize);
    }

    normalizePosition () {
        this.setPosition(
            this.layout.mainContainer.basePosition.x, 
            this.layout.mainContainer.basePosition.y
        );
    }

    // #abstract method is called when the game change resolution, this is for responsivity
    // purpouses
    resize () {}

};

export default InterfaceContainer;