class PlayerDeadState {
    constructor() {
    }
    enter() {
        AudioManager.sounds.dead.play({ volume: 0.1 });
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
    }
}