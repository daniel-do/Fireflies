class PlayerJumpState extends PlayerAirborneState {
    constructor() {
        super();
    }
    //private startJumpHeldDownFrames:number;
    get jumpHeldDownFrames() { return this.machine.owner.currentInputState.jumpFrames /* - this.startJumpHeldDownFrames*/; }
    enter() {
        this.isHoldingJump = true;
        this.machine.owner.speed.y -= PlayerStats.InitialJumpPower;
        this.machine.owner.view.playJumpParticles();
        AudioManager.sounds.jump.play();
        this.machine.owner.view.animator.squish(1, 1.3, 180);
    }
    update() {
        //TODO: Change air accel?
        this.machine.owner.updateMovementControls();
        if (this.isHoldingJump && this.jumpHeldDownFrames > 1 && this.jumpHeldDownFrames < 12) {
            this.machine.owner.speed.y -= PlayerStats.JumpPower;
        }
        else if (this.machine.owner.currentInputState.jumpFrames == 0) {
            this.isHoldingJump = false;
        }
        this.updateGravity();
        if (this.machine.owner.speed.y >= 0) {
            this.machine.changeState(PlayerStates.Fall);
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
    }
}