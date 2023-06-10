class PlayerFallState extends PlayerAirborneState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        this.updateGravity();
    }
    leave() {
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
    }
}