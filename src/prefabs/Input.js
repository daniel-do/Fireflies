class Input {
    constructor(key) {
        this.key = key;
    }
    get heldDownFrames() {
        return this._heldDownFrames;
    }
    get isDown() {
        return this._heldDownFrames > 0;
    }
    get justDown() {
        return this._heldDownFrames == 1;
    }
    get justReleased() {
        return this.prevHeldDownFrames > 0 && this._heldDownFrames == 0;
    }
    update() {
        this.prevHeldDownFrames = this._heldDownFrames;
        if (this.key.isDown) {
            this._heldDownFrames++;
        }
        else {
            this._heldDownFrames = 0;
        }
    }
}