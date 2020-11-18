export const ExtendModelInstance = function (model, extensor) {
    Object.keys(extensor).forEach(attr => model[attr] = extensor[attr]);
};