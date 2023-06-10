class InputManager {
    constructor() { }
    // private playerInputStates:PlayerInputsState[] = [];
    // private maxStoredInputs:number = 1*60 + 4;
    get defaultPlayerInputsState() {
        return {
            leftFrames: 0,
            rightFrames: 0,
            jumpFrames: 0,
            downFrames: 0
        };
    }
    static get instance() {
        if (!InputManager._instance) {
            InputManager._instance = new InputManager();
        }
        return InputManager._instance;
    }
    initialize(scene) {
        this.left = new Input(scene.input.keyboard.addKey('left'));
        this.right = new Input(scene.input.keyboard.addKey('right'));
        this.jump = new Input(scene.input.keyboard.addKey('up'));
        this.down = new Input(scene.input.keyboard.addKey('down'));
    }
    update() {
        this.left.update();
        this.right.update();
        this.jump.update();
        this.down.update();
        // this.playerInputStates.push(this.createPlayerState());
        // if (this.playerInputStates.length > this.maxStoredInputs) {
        //     this.playerInputStates.splice(0, 1);
        // }
        this.playerInputState = this.createPlayerState();
    }
    // public getPlayerInputState(/*framesBehind:number = 0*/):PlayerInputsState {
    //     // let index = this.playerInputStates.length - 1 - framesBehind;
    //     // if (index < 0) {
    //     //     return this.defaultPlayerInputsState;
    //     // }
    //     // return this.playerInputStates[index];
    // }
    createPlayerState() {
        return {
            leftFrames: this.left.heldDownFrames,
            rightFrames: this.right.heldDownFrames,
            jumpFrames: this.jump.heldDownFrames,
            downFrames: this.down.heldDownFrames
        };
    }
}