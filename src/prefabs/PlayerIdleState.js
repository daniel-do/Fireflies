class PlayerIdleState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x != 0) {
            this.machine.changeState(PlayerStates.Walk);
        }
        super.update();
    }
    leave() {
    }
}