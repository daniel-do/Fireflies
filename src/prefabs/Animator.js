class Animator {
    constructor(scene, sprite, entity) {
        this.currentSquish = { timer: 0, startTime: 0, reverseTime: 0, scaleX: 1, scaleY: 1 };
        this.currentAnimKey = '';
        this.scene = scene;
        this.sprite = sprite;
        this.entity = entity;
    }
    get facingDirection() { return this.sprite.flipX ? -1 : 1; }
    set facingDirection(dir) { this.sprite.flipX = dir < 0; }
    get isSquishing() { return this.currentSquish.timer > 0; }
    update() {
        if (this.isSquishing) {
            this.updateSquish();
        }
    }
    updateSpritePosition() {
        this.sprite.setPosition(this.entity.x, this.entity.y);
    }
    changeAnimation(key, isSingleFrame = false) {
        this.currentAnimKey = key;
        if (isSingleFrame) {
            this.sprite.anims.stop();
            this.sprite.setFrame(key);
        }
        else {
            this.sprite.play(key);
        }
    }
    createAnimation(key, texture, prefix, length, frameRate = 16, repeat = -1) {
        let frameNames = this.scene.anims.generateFrameNames(texture, {
            prefix: prefix,
            suffix: '.png',
            end: length - 1,
            zeroPad: 2
        });
        this.scene.anims.create({
            key: key,
            frames: frameNames,
            frameRate: frameRate,
            repeat: repeat,
        });
    }
    squish(scaleX, scaleY, duration, reverseTime) {
        this.currentSquish = {
            timer: duration,
            reverseTime: reverseTime == undefined ? duration / 2 : reverseTime,
            startTime: duration,
            scaleX: scaleX,
            scaleY: scaleY
        };
    }
    updateSquish() {
        this.currentSquish.timer = Math.max(this.currentSquish.timer - TimeUtil.getElapsedMS(), 0);
        let timeToReverse = this.currentSquish.startTime - this.currentSquish.reverseTime;
        if (this.currentSquish.timer > timeToReverse) {
            let t = 1 - (this.currentSquish.timer - timeToReverse) / this.currentSquish.reverseTime;
            this.sprite.scaleX = Phaser.Math.Linear(1, this.currentSquish.scaleX, t);
            this.sprite.scaleY = Phaser.Math.Linear(1, this.currentSquish.scaleY, t);
        }
        else {
            let t = 1 - this.currentSquish.timer / timeToReverse;
            this.sprite.scaleX = Phaser.Math.Linear(this.currentSquish.scaleX, 1, t);
            this.sprite.scaleY = Phaser.Math.Linear(this.currentSquish.scaleY, 1, t);
        }
    }
    destroy() {
        this.sprite.destroy();
    }
}