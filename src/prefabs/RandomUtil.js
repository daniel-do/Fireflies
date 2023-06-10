class RandomUtil {
    constructor() { }
    static randomInt(min, max) {
        return Math.round(this.randomFloat(Math.ceil(min), Math.floor(max)));
    }
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
}