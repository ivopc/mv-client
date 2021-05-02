import { timedEvent } from "@/newgame/utils/scene.promisify";

const behaviors = {
    empty () {},
    call () {},
    callFunction () {},
    callLevelBehaviorFunction () {},
    delay () {},
    random () {},
    async walk (params) {
        console.log("walk params", params);
        await timedEvent(2000, this.scene);
    },
    face (gameObject) {},
    dialog (gameObject) {},
    show (gameObject) {},
    hide (gameObject) {},
    stop (gameObject) {},
    async requestFlag () {},
    setMapFlag () {},
    getInput () {}
};

export default behaviors;