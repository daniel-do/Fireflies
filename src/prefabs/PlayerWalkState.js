class PlayerWalkState extends PlayerGroundedState {
    constructor() {
        super();
        this.particleTimer = 0;
    }
    enter() {
        this.particleTimer = 0;
    }
    update() {
        this.particleTimer++;
        if (this.particleTimer == 12) {
            this.particleTimer = 0;
            this.machine.owner.view.playWalkParticles();
        }
        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }
        super.update();
    }
    leave() {
    }
}