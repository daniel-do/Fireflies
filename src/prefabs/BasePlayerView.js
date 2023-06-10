class BasePlayerView {
    constructor(playerName, color) {
        this.flamePosOffset = 0;
        this.animationNames = new Map([
            [PlayerStates.Idle, 'idle'],
            [PlayerStates.Walk, 'walk'],
            [PlayerStates.Jump, 'jump'],
            [PlayerStates.Fall, 'fall'],
            [PlayerStates.Crouch, 'crouch'],
            [PlayerStates.Sleep, 'sleep'],
            [PlayerStates.Dead, 'dead'],
        ]);
        this.textureKey = 'player_sheet';
        this.playerName = playerName;
        this.color = color;
    }
    createAnimator(scene, player) {
        this.player = player;
        this.sprite = scene.add.sprite(0, 0, this.textureKey, this.playerName + '-idle_00.png');
        this.sprite.setOrigin(0.5, 1);
        this.animator = new Animator(scene, this.sprite, this.player);
        this.createStateAnimation(PlayerStates.Idle);
        this.createStateAnimation(PlayerStates.Walk);
        this.createStateAnimation(PlayerStates.Jump);
        this.createStateAnimation(PlayerStates.Fall);
        this.createStateAnimation(PlayerStates.Crouch);
        this.createStateAnimation(PlayerStates.Sleep);
        this.createStateAnimation(PlayerStates.Dead, 5, 10, 0);
        // Win animation
        let key = 'goal';
        this.animator.createAnimation(this.playerName + key, this.textureKey, this.playerName + '-' + key + '_', 4);
        this.changeStateAnimation(player.getStateMachine().currentStateKey);
        this.player.getStateMachine().addStateChangedListener(this.changeStateAnimation, this);
        let keyDownSprite = scene.add.sprite(0, 0, 'tutorial_sheet', 'key-down_00.png');
        keyDownSprite.setAlpha(0);
        let playerIndicatorSprite = scene.add.sprite(0, 0, 'tutorial_sheet', 'player-pointer_00.png');
        this.playerIndicatorAnimator = new Animator(scene, playerIndicatorSprite, null);
        this.playerIndicatorAnimator.createAnimation('indicator', 'tutorial_sheet', 'player-pointer_', 2, 8, 4);
        this.playerIndicatorAnimator.sprite.setAlpha(0);
        this.playerIndicatorAnimator.sprite.on('animationcomplete', () => {
            this.playerIndicatorAnimator.sprite.setAlpha(0);
        });
        this.playerIndicatorAnimator.sprite.setTint(this.color);
        this.keyDownAnimator = new Animator(scene, keyDownSprite, null);
        this.keyDownAnimator.createAnimation('keydown', 'tutorial_sheet', 'key-down_', 2, 4, -1);
    }
    createParticlesSystems(scene) {
        let dustFrameNames = scene.anims.generateFrameNames('particles_sheet', {
            prefix: 'dust_',
            suffix: '.png',
            end: 4,
            zeroPad: 2
        });
        let dustFrames = [];
        dustFrameNames.forEach((e) => { dustFrames.push(e.frame.toString()); });
        this.dustEmitter = ParticleManager.createEmitter({
            x: 0,
            y: 0,
            lifespan: { min: 300, max: 340 },
            speed: { min: 4, max: 6 },
            angle: 270,
            frequency: -1,
            emitZone: { source: new Phaser.Geom.Rectangle(-2, -2, 4, 0) },
            frame: dustFrames,
        });
        this.dustEmitter.setTint(this.color);
        this.flameEmitter = ParticleManager.createEmitter({
            x: this.player.hitbox.centerX,
            y: this.player.hitbox.top,
            lifespan: { min: 260, max: 310 },
            speed: { min: 7, max: 12 },
            angle: { min: 270 - 10, max: 270 + 10 },
            scale: { start: 1, end: 0, ease: 'Power3' },
            frequency: 48,
            emitZone: { source: new Phaser.Geom.Rectangle(-2, 0, 4, -3) },
            frame: 'flame-particle_00.png',
        });
        this.flameEmitter.setTint(this.color);
    }
    playLandParticles() {
        this.dustEmitter.explode(7, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
    playJumpParticles() {
        this.dustEmitter.explode(5, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
    playWalkParticles() {
        this.dustEmitter.explode(2, this.player.hitbox.centerX, this.player.hitbox.bottom);
    }
    update() {
        if (this.player.speed.x > 0) {
            this.animator.facingDirection = 1;
        }
        else if (this.player.speed.x < 0) {
            this.animator.facingDirection = -1;
        }
        this.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.bottom);
        this.flameEmitter.setPosition(this.player.hitbox.centerX, this.player.hitbox.top + this.flamePosOffset);
        this.animator.update();
        if (this.keyDownAnimator.sprite.anims.isPlaying) {
            this.keyDownAnimator.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.top - 16);
        }
        if (this.playerIndicatorAnimator.sprite.anims.isPlaying) {
            this.playerIndicatorAnimator.sprite.setPosition(this.player.hitbox.centerX, this.player.hitbox.top - 16);
        }
    }
    showIndicator() {
        if (!this.keyDownAnimator.sprite.anims.isPlaying) {
            this.playerIndicatorAnimator.sprite.setAlpha(1);
            this.playerIndicatorAnimator.sprite.play('indicator');
        }
    }
    playKeyDownTutorial() {
        if (!this.keyDownAnimator.sprite.anims.isPlaying) {
            this.keyDownAnimator.sprite.play('keydown');
            this.keyDownAnimator.sprite.setAlpha(1);
        }
    }
    stopKeyDownTutorial() {
        if (this.keyDownAnimator.sprite.anims.isPlaying) {
            this.keyDownAnimator.sprite.stop();
            this.keyDownAnimator.sprite.setAlpha(0);
        }
    }
    createStateAnimation(state, length = 4, frameRate, repeat) {
        let key = this.animationNames.get(state);
        this.animator.createAnimation(this.playerName + key, this.textureKey, this.playerName + '-' + key + '_', length, frameRate, repeat);
    }
    changeStateAnimation(state) {
        switch (state) {
            case PlayerStates.Sleep:
                this.sprite.alpha = 0.75;
                if (this.playerIndicatorAnimator && this.playerIndicatorAnimator.sprite)
                    this.playerIndicatorAnimator.sprite.setAlpha(0);
            case PlayerStates.Sleep:
            case PlayerStates.Crouch:
                this.flamePosOffset = 2;
                break;
            case PlayerStates.Dead:
                this.flameEmitter.setVisible(false);
                break;
            default:
                this.flamePosOffset = 0;
                break;
        }
        if (state != PlayerStates.Sleep) {
            this.sprite.alpha = 1;
        }
        if (state == PlayerStates.Sleep && this.player.isAtGoal) {
            this.animator.changeAnimation(this.playerName + 'goal');
        }
        else {
            this.animator.changeAnimation(this.playerName + this.animationNames.get(state));
        }
    }
    destroy() {
        this.animator.destroy();
        this.playerIndicatorAnimator.destroy();
        this.keyDownAnimator.destroy();
    }
}