import Overworld from "./index";

// gerar mapa: layes, overlay e layer de colisão
Overworld.generateMap = function () {
    // layers e tilesets
    for (let i = 0, l = this.map.layers.length; i < l; i++) {
        // checando propriedade do layer
        switch (+this.map.layers[i].properties.type) {

            case 0: {  // se for layer comum
                
                // se a layer n estiver visivel
                if (!this.map.layers[i].visible) {
                    continue;
                };

                this.layer[i] = this.map.createDynamicLayer(this.map.layers[i].name, this.tile);
                //this.layer[i].resizeWorld();
                this.containers.map.add(this.layer[i]);
                break;
            };

            case 1: { // se for overlay
                this.overlay = this.map.createDynamicLayer(this.map.layers[i].name, this.tile);
                this.containers.overlay.add(this.overlay);
                break;
            };

            case 2: { // se for layer de colisão
                this.collisionLayer = this.map.layers[i];
                break;
            };
        };
    };
};

// gerar iluminação do mapa
Overworld.generateIllumination = function () {

    this.lamps = [];

    for (let i = 0; i < this.map.objects.length; i ++) {
        switch (this.map.objects[i].name) {
            case "Illumination": {
                let objs = this.map.objects[i].objects;
                for (let j = 0; j < objs.length; j ++) {
                    //console.log("oi", i, j);
                    this.lamps[j] = this.illuminated.createLamp(
                    objs[j].x - 55, 
                    objs[j].y - 80, 
                        {
                            distance: 70,
                            diffuse: 0.8,
                            color: "rgba(255, 255, 255, 0.2)",
                            radius: 0,
                            samples: 1,
                            angle: 0,
                            roughness: 0
                        }
                    );
                };
                break;
            };
        }
    };
};

// mudar de mapa
Overworld.changeMap = function (data) {
    // mudando id do mapa atyal
    this.Data.CurrentMap = data.mid;
    // desinscrevendo do mapa
    this.unsubscribeToMap();
    // mudando música do mapa
    if (this.database.maps[data.mid].music.name !== this.manager.audio)
        this.music.stop();
    // parando cena
    this.scene.stop();
    // remove eventos de keyboard
    this.key.unbind.bind(this)();

    // reiniciando scene
    this.scene.start("overworld", {
        data: this.Data,
        socket: this.Socket,
        switchingMap: true,

        auth: this.auth,
        player: this.player._data,

        wild: null,
        flag: data.flag,
        tamers: data.tamers,
        notify: this.notify,
        
        manager: this.manager,

        tid: this.tid
    });
};

export default Overworld;