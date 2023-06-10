class PlayerGroundedState {
    constructor() { }
    enter() {
    }
    update() {
        if (this.machine.owner.currentInputState.jumpFrames == 1) {
            this.machine.changeState(PlayerStates.Jump);
        }
        else if (this.machine.owner.currentInputState.downFrames == 1) {
            this.machine.changeState(PlayerStates.Crouch);
        }
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (!this.hasGroundUnderneath(result.tiles)) {
            this.machine.changeState(PlayerStates.Fall);
        }
    }
    hasGroundUnderneath(tiles) {
        for (let i = 0; i < tiles.length; i++) {
            if (!tiles[i].canStandOn) {
                continue;
            }
            if (this.isStandingOnTile(tiles[i])) {
                return true;
            }
        }
        return false;
    }
    isStandingOnTile(tile) {
        return CollisionUtil.hitboxVerticallyAligned(this.machine.owner.hitbox, tile.hitbox);
    }
}