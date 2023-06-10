class PlayerCrouchState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
        this.machine.owner.speed.x = 0;
        this.machine.owner.view.animator.squish(1, 0.65, 170);
    }
    update() {
        if (this.machine.owner.currentInputState.downFrames == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype != TileTypes.Torch && result.tiles[i].tiletype != TileTypes.GoldTorch) {
                continue;
            }
            if (this.isStandingOnTile(result.tiles[i])) {
                if (result.tiles[i].tiletype == TileTypes.GoldTorch) {
                    this.machine.owner.isAtGoal = true;
                }
                AudioManager.sounds.torch.play({ volume: 0.3 });
                this.machine.changeState(PlayerStates.Sleep);
                break;
            }
        }
    }
}