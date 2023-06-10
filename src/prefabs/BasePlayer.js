class BasePlayer extends Entity {
    constructor(scene, spawnPosition, startingState, view) {
        super(new Phaser.Geom.Rectangle(spawnPosition.x + 3, spawnPosition.y - 14, 10, 14));
        this.isAtGoal = false;
        this.stateMachine = new StateMachine(this);
        this.stateMachine.addState(PlayerStates.Idle, new PlayerIdleState());
        this.stateMachine.addState(PlayerStates.Walk, new PlayerWalkState());
        this.stateMachine.addState(PlayerStates.Fall, new PlayerFallState());
        this.stateMachine.addState(PlayerStates.Jump, new PlayerJumpState());
        this.stateMachine.addState(PlayerStates.Crouch, new PlayerCrouchState());
        this.stateMachine.addState(PlayerStates.Sleep, new PlayerSleepState());
        this.stateMachine.addState(PlayerStates.Dead, new PlayerDeadState());
        this.stateMachine.start(startingState);
        this.view = view;
        this.view.createAnimator(scene, this);
        this.view.createParticlesSystems(scene);
        this.view.animator.updateSpritePosition();
    }
    update() {
        this.currentInputState = InputManager.instance.playerInputState;
        this.stateMachine.update();
    }
    wakeUp() {
        if (this.stateMachine.currentStateKey == PlayerStates.Sleep) {
            this.isAtGoal = false;
            this.stateMachine.changeState(PlayerStates.Idle);
            this.view.showIndicator();
        }
    }
    lateUpdate() {
        this.view.update();
    }
    onCollisionSolved(result) {
        if (result.isDamaged && this.stateMachine.currentStateKey != PlayerStates.Dead) {
            this.die();
        }
        this.stateMachine.currentState.onCollisionSolved(result);
        if (ShouldExplainCrouch) {
            if (this.stateMachine.currentStateKey != PlayerStates.Sleep) {
                for (let i = 0; i < result.tiles.length; i++) {
                    if (result.tiles[i].tiletype != TileTypes.GoldTorch) {
                        continue;
                    }
                    if (CollisionUtil.hitboxVerticallyAligned(this.hitbox, result.tiles[i].hitbox)) {
                        this.view.playKeyDownTutorial();
                        return;
                    }
                }
            }
            this.view.stopKeyDownTutorial();
        }
    }
    die() {
        this.speed.x = 0;
        this.speed.y = Math.max(0, this.speed.y);
        this.stateMachine.changeState(PlayerStates.Dead);
    }
    updateMovementControls(maxRunSpeed = PlayerStats.RunSpeed, runAcceleration = PlayerStats.RunAcceleration) {
        if (this.currentInputState.leftFrames > 0) {
            if (this.speed.x > -maxRunSpeed) {
                this.speed.x = Math.max(this.speed.x - runAcceleration, -maxRunSpeed);
            }
            else if (this.speed.x < -maxRunSpeed) {
                this.speed.x = Math.min(this.speed.x + runAcceleration, -maxRunSpeed);
            }
        }
        else if (this.currentInputState.rightFrames > 0) {
            if (this.speed.x < maxRunSpeed) {
                this.speed.x = Math.min(this.speed.x + runAcceleration, maxRunSpeed);
            }
            else if (this.speed.x > maxRunSpeed) {
                this.speed.x = Math.max(this.speed.x - runAcceleration, maxRunSpeed);
            }
        }
        else {
            this.decelerate(runAcceleration);
        }
    }
    decelerate(deceleration) {
        if (Math.abs(this.speed.x) < deceleration) {
            this.speed.x = 0;
        }
        else {
            this.speed.x -= deceleration * NumberUtil.sign(this.speed.x);
        }
    }
    getStateMachine() {
        return this.stateMachine;
    }
    destroy() {
        this.stateMachine.destroy();
        this.view.destroy();
    }
}