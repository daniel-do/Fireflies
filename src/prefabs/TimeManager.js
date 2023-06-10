class TimeManager {
    constructor() { }
    static initialize() {
        this.startTime = new Date();
        this.globalAnimationUpdateInterval = setInterval(this.globalAnimationUpdate.bind(this), 200);
    }
    static getTimeSinceStartup() {
        return Date.now() - this.startTime.getTime();
    }
    static globalAnimationUpdate() {
        this.animationFrame++;
        this.tileAnimations.forEach((anim, key) => {
            anim.setCurrentFrame(anim.currentAnim.frames[this.animationFrame % 4]);
        });
    }
}
TimeManager.tileAnimations = new Map();
TimeManager.animationFrame = 0;