import axios from "axios";

export default async function () {
    let payload;
    try {
        payload = await axios.get("/static/database/maps.json");
    } catch (err) {
        throw new Error("Cannot get the level");
    };
    return Object.values(payload.data);//.map(el => payload.data[el]);
};