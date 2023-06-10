class PlayerAirborneState {
    constructor() { }
    enter() {
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (result.onBottom) {
            this.onLand();
        }
        else if (result.onTop) {
            this.headbonk();
        }
    }
    updateGravity(gravity = PlayerStats.Gravity, maxFallSpeed = PlayerStats.MaxFallSpeed) {
        if (this.machine.owner.speed.y < maxFallSpeed) {
            this.machine.owner.speed.y = Math.min(this.machine.owner.speed.y + gravity, maxFallSpeed);
        }
    }
    onLand() {
        this.machine.owner.speed.y = 0;
        let state = this.machine.owner.speed.x == 0 ? PlayerStates.Idle : PlayerStates.Walk;
        this.machine.changeState(state);
        this.machine.owner.view.playLandParticles();
        this.machine.owner.view.animator.squish(1.1, 0.6, 200);
    }
    headbonk() {
        this.machine.owner.speed.y = 0;
    }
}