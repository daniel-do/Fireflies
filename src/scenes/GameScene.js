class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene', active: true });
        this.isGameOver = false;
        this.currentLevelNumber = 1;
        this.maxLevelNumber = 9;
        GameScene.instance = this;
    }
    init() {
        this.levelLoader = new LevelLoader(this);
        TimeManager.initialize();
    }
    preload() {
        this.load.atlas('player_sheet', 'assets/player_sheet.png', 'assets/player_sheet.json');
        this.load.atlas('tutorial_sheet', 'assets/tutorial_sheet.png', 'assets/tutorial_sheet.json');
        this.load.atlas('particles_sheet', 'assets/particles_sheet.png', 'assets/particles_sheet.json');
        this.load.atlas('splash_sheet', 'assets/splash_sheet.png', 'assets/splash_sheet.json');
        this.levelLoader.preloadLevelJson();
        this.levelLoader.preloadSpritesheets();
        AudioManager.preload(this);
    }
    create() {
        InputManager.instance.initialize(this);
        this.levelLoader.init();
        this.screenTransition = new ScreenTransition(this);
        new SplashScreen(this, () => {
            this.cameras.main.setBackgroundColor('#333333');
            AudioManager.createAllSounds(this);
            AudioManager.playMusic(this);
            this.startLevel(this.currentLevelNumber);
        }, this);
        //Reset level
        this.input.keyboard.on('keyup-R', () => {
            if (this.isGameOver || this.screenTransition.isActive) {
                return;
            }
            if (this.icePlayer) {
                this.icePlayer.die();
            }
            if (this.firePlayer) {
                this.firePlayer.die();
            }
        });
    }
    update() {
        InputManager.instance.update();
        if (this.currentLevel) {
            this.currentLevel.update();
        }
    }
    startLevel(levelNum) {
        if (ParticleManager) {
            ParticleManager.destroy();
        }
        ParticleManager = this.add.particles('particles_sheet');
        ParticleManager.setDepth(1);
        if (this.currentLevel) {
            this.currentLevel.destroy();
        }
        this.isGameOver = false;
        this.startingPlayers = [];
        if (levelNum != undefined) {
            this.currentLevelNumber = Math.min(levelNum, this.maxLevelNumber);
        }
        this.currentLevel = this.levelLoader.create("level_" + this.currentLevelNumber);
        if (this.currentLevelNumber > 2) {
            ShouldExplainCrouch = false;
        }
        this.icePlayer.getStateMachine().addStateChangedListener(this.icePlayerStateChanged, this);
        this.firePlayer.getStateMachine().addStateChangedListener(this.firePlayerStateChanged, this);
        this.screenTransition.onLevelEnter(() => {
            this.startingPlayers.forEach((player) => {
                player.wakeUp();
            });
        }, this);
    }
    firePlayerStateChanged(state) {
        switch (state) {
            case PlayerStates.Sleep:
                if (this.icePlayer.isAtGoal && this.firePlayer.isAtGoal) {
                    this.gameOver(true);
                }
                else {
                    this.icePlayer.wakeUp();
                }
                break;
            case PlayerStates.Dead:
                this.gameOver(false);
                break;
        }
    }
    icePlayerStateChanged(state) {
        switch (state) {
            case PlayerStates.Sleep:
                if (this.icePlayer.isAtGoal && this.firePlayer.isAtGoal) {
                    this.gameOver(true);
                }
                else {
                    this.firePlayer.wakeUp();
                }
                break;
            case PlayerStates.Dead:
                this.gameOver(false);
                break;
        }
    }
    gameOver(won) {
        if (!this.isGameOver) {
            this.isGameOver = true;
            this.screenTransition.onLevelClose(() => {
                if (won && this.currentLevelNumber == this.maxLevelNumber) {
                    TimeManager.endTime = new Date();
                    new EndScreen(this);
                }
                else
                    this.startLevel(won ? this.currentLevelNumber + 1 : this.currentLevelNumber);
            }, this);
        }
    }
}