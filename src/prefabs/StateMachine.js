class StateMachine {
    constructor(owner) {
        this.currentStateKey = -1;
        this.onStateChanged = new Phaser.Events.EventEmitter();
        this.owner = owner;
        this.states = new Map();
    }
    get currentState() { return this.states.get(this.currentStateKey); }
    start(firstState) {
        this.currentStateKey = firstState;
    }
    update() {
        this.currentState.update();
    }
    addState(key, state) {
        state.machine = this;
        this.states.set(key, state);
    }
    changeState(key) {
        this.currentState.leave();
        this.currentStateKey = key;
        this.currentState.enter();
        this.onStateChanged.emit('state-changed', key);
    }
    addStateChangedListener(event, context) {
        this.onStateChanged.addListener('state-changed', event, context);
    }
    destroy() {
        this.onStateChanged.destroy();
        this.states.clear();
    }
}