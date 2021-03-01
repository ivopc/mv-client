import api from "../api";

export const async function () {
    let payload;
    try {
        payload = await api.get("/init");
    } catch (err) {
        throw new Error("Cannot get the levels list from server");
    };
    return payload;
};