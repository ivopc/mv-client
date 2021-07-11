async function request () {
    let response;
    try {
        response = await Promise.resolccllve("test");
    } catch (err) {
        throw new Error("Se fuder");
    };
    console.log("teste se continua");
    return response;
};

async function behavior () {
    let response;
    try {
        response = await request();
    } catch (err) {
        const { $errorWindow } = SceneManager.getOverworld();
        $errorWindow.show({ type: NETWORK_ERRORS.WILD });
        ErrorManager.registerLog({ type: NETWORK_ERRORS.WILD, params: err });
        throw new Error(err.message);
    };
    //runMechanic(response);
    return response;
};

behavior()
    .then(payload => {
        console.log(payload);
    })
    .catch(err => {
        console.error(err);
    });