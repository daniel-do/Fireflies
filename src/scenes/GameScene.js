class GameScene extends Phaser.Scene {
    constructor() {
        super({ key: 'GameScene'});
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
        this.cameras.main.setBackgroundColor('#333333');
        AudioManager.createAllSounds(this);
        AudioManager.playMusic(this);
        this.startLevel(this.currentLevelNumber);
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
    draw() {
    }
}
var config = {
    type: Phaser.AUTO,
    width: 320,
    height: 320,
    scaleMode: 3,
    pixelArt: true,
    backgroundColor: '#000000',
    parent: 'Fireflies',
    title: "Fireflies",
    version: "0.0.1",
    disableContextMenu: true,
    scene: [Menu, GameScene],
};
var game = new Phaser.Game(config);
let keySPACE;
class TimeManager {
    constructor() { }
    static initialize() {
        this.startTime = new Date();
        this.globalAnimationUpdateInterval = setInterval(this.globalAnimationUpdate.bind(this), 200);
    }
    static getTimeSinceStartup() {
        return Date.now() - this.startTime.getTime();
    }
    static globalAnimationUpdate() {
        this.animationFrame++;
        this.tileAnimations.forEach((anim, key) => {
            anim.setCurrentFrame(anim.currentAnim.frames[this.animationFrame % 4]);
        });
    }
}
TimeManager.tileAnimations = new Map();
TimeManager.animationFrame = 0;
class AudioManager {
    constructor() { }
    ;
    static preload(scene) {
        scene.load.audio('jump', 'audio/jump.wav');
        scene.load.audio('fire', 'audio/fire.wav');
        scene.load.audio('ice', 'audio/ice.wav');
        scene.load.audio('dead', 'audio/dead.wav');
        scene.load.audio('torch', 'audio/torch.wav');
        scene.load.audio('melt', 'audio/melt.wav');
        scene.load.audio('background_music', 'audio/6_Town_2_Master.ogg');
    }
    static createAllSounds(scene) {
        this.sounds = {
            jump: scene.sound.add('jump', this.defaultConfig),
            fire: scene.sound.add('fire', this.defaultConfig),
            freeze: scene.sound.add('ice', this.defaultConfig),
            dead: scene.sound.add('dead', this.defaultConfig),
            torch: scene.sound.add('torch', this.defaultConfig),
            melt: scene.sound.add('melt', this.defaultConfig),
        };
        // let test:Phaser.Sound.BaseSound;
        // test.play()
    }
    static playMusic(scene) {
        if (!scene.sound.locked) {
            this.startMusic(scene);
        }
        else {
            scene.sound.once(Phaser.Sound.Events.UNLOCKED, () => {
                this.startMusic(scene);
            });
        }
    }
    static startMusic(scene) {
        let music = scene.sound.add('background_music', {
            mute: false,
            volume: 0.13,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        music.play();
    }
}
AudioManager.defaultConfig = {
    mute: false,
    volume: 1,
    rate: 1,
    detune: 0,
    seek: 0,
    loop: false,
    delay: 0
};
class CollisionResult {
    constructor() {
        this.onTop = false;
        this.onLeft = false;
        this.onRight = false;
        this.onBottom = false;
        this.tiles = [];
        this.prevTop = 0;
        this.prevLeft = 0;
        this.prevRight = 0;
        this.prevBottom = 0;
        this.isDamaged = false;
    }
}
class CollisionManager {
    constructor(level) {
        this.currentLevel = level;
    }
    moveCollidable(collidable) {
        let result = new CollisionResult();
        let tiles = this.currentLevel.map.getTilesFromRect(collidable.nextHitbox, 2);
        result.tiles = tiles;
        result.prevTop = collidable.hitbox.top;
        result.prevLeft = collidable.hitbox.left;
        result.prevRight = collidable.hitbox.right;
        result.prevBottom = collidable.hitbox.bottom;
        collidable.moveX();
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], collidable)) {
                continue;
            }
            if (tiles[i].isSolid || collidable.solidTileTypes.indexOf(tiles[i].tiletype) >= 0) {
                this.solveHorizontalCollision(tiles[i], collidable, result);
            }
            else if (!result.isDamaged && collidable.damageTileTypes.indexOf(tiles[i].tiletype) >= 0) {
                result.isDamaged = true;
            }
        }
        collidable.moveY();
        for (let i = 0; i < tiles.length; i++) {
            if (!this.overlapsNonEmptyTile(tiles[i], collidable)) {
                continue;
            }
            if (tiles[i].isSemisolid) {
                if (this.isFallingThroughSemisolid(tiles[i], result.prevBottom, collidable.hitbox.bottom)) {
                    result.onBottom = true;
                    collidable.hitbox.y = tiles[i].hitbox.y - collidable.hitbox.height;
                }
            }
            else if (tiles[i].isSolid || collidable.solidTileTypes.indexOf(tiles[i].tiletype) >= 0) {
                this.solveVerticalCollision(tiles[i], collidable, result);
            }
            else if (!result.isDamaged && collidable.damageTileTypes.indexOf(tiles[i].tiletype) >= 0) {
                result.isDamaged = true;
            }
        }
        collidable.onCollisionSolved(result);
        return result;
    }
    overlapsNonEmptyTile(tile, collidable) {
        return tile.tiletype != TileTypes.Empty && Phaser.Geom.Rectangle.Overlaps(tile.hitbox, collidable.hitbox);
    }
    solveHorizontalCollision(tile, collidable, result) {
        if (collidable.speed.x > 0) {
            result.onRight = true;
            collidable.hitbox.x = tile.hitbox.x - collidable.hitbox.width;
        }
        else if (collidable.speed.x < 0) {
            result.onLeft = true;
            collidable.hitbox.x = tile.hitbox.right;
        }
    }
    solveVerticalCollision(tile, collidable, result) {
        if (collidable.speed.y > 0) {
            result.onBottom = true;
            collidable.hitbox.y = tile.hitbox.y - collidable.hitbox.height;
        }
        else if (collidable.speed.y < 0) {
            result.onTop = true;
            collidable.hitbox.y = tile.hitbox.bottom;
        }
    }
    isFallingThroughSemisolid(semisolidTile, prevBottom, currentBottom) {
        return prevBottom <= semisolidTile.hitbox.top && currentBottom >= semisolidTile.hitbox.top;
    }
}
class CollisionUtil {
    constructor() { }
    static hitboxVerticallyAligned(topHitbox, bottomHitbox, margin = 0) {
        if (bottomHitbox.top == topHitbox.bottom) {
            return topHitbox.right > bottomHitbox.left && topHitbox.left < bottomHitbox.right;
        }
        return false;
    }
    static hitboxHorizontallyAligned(leftHitbox, rightHitbox, margin = 0) {
        if (leftHitbox.right == rightHitbox.left) {
            return leftHitbox.bottom > rightHitbox.top && leftHitbox.top < rightHitbox.bottom;
        }
        return false;
    }
    static hitboxesAligned(hitbox1, hitbox2) {
        return CollisionUtil.hitboxVerticallyAligned(hitbox1, hitbox2) ||
            CollisionUtil.hitboxVerticallyAligned(hitbox2, hitbox1) ||
            CollisionUtil.hitboxHorizontallyAligned(hitbox1, hitbox2) ||
            CollisionUtil.hitboxHorizontallyAligned(hitbox2, hitbox1);
    }
}
let TILE_WIDTH = 16;
let TILE_HEIGHT = 16;
class EndScreen {
    constructor(scene) {
        let time = TimeUtil.getTimeDifferenceMSMM(TimeManager.startTime, TimeManager.endTime);
        let timeString = '';
        if (time.minutes > 0) {
            timeString += time.minutes.toString() + 'm ';
        }
        timeString += time.seconds.toString() + 's ';
        timeString += time.milliseconds.toString() + 'ms';
        this.topText = scene.add.text(320 / 2, 100, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '32px',
        });
        this.bottomText = scene.add.text(320 / 2, 160, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '16px',
        });
        this.timeText = scene.add.text(320 / 2, 300, 'text', {
            fontFamily: 'Arial',
            align: 'center',
            fontSize: '10px',
        });
        this.timeText.text = timeString;
        this.topText.text = "The End!";
        this.bottomText.text = "Thank you for playing :)";
        this.timeText.depth = 69 + 1;
        this.topText.depth = 69 + 1;
        this.bottomText.depth = 69 + 1;
        this.timeText.setOrigin(0.5, 0.5);
        this.topText.setOrigin(0.5, 0.5);
        this.bottomText.setOrigin(0.5, 0.5);
    }
}
class ScreenTransition {
    constructor(scene) {
        this.scene = scene;
        this.createGraphics();
    }
    get isActive() { return this.graphics.visible; }
    ;
    createGraphics() {
        this.graphics = this.scene.add.graphics({
            lineStyle: { width: 2, color: 0x0 },
            fillStyle: { color: 0x0, alpha: 1 }
        });
        this.graphics.depth = 7;
        this.graphics.clear();
        let left = -20;
        let right = 380;
        let points = [{ x: left, y: 0 }];
        for (let y = 320 / 8; y <= 320; y += 320 / 8) {
            points.push({ x: left + 18, y });
            left -= 20;
            points.push({ x: left, y });
        }
        for (let y = 320; y >= 0; y -= 320 / 8) {
            points.push({ x: right, y });
            right += 20;
            points.push({ x: right + 18, y });
        }
        this.graphics.fillPoints(points);
        this.graphics.x = 0;
    }
    onLevelEnter(onDone, context) {
        this.scene.tweens.add({
            targets: this.graphics,
            props: {
                x: { value: -560, duration: 750, ease: 'Linear' },
            },
            onComplete: () => {
                this.graphics.x = 560;
                this.graphics.setVisible(false);
                onDone.call(context);
            }
        });
    }
    onLevelClose(onDone, context) {
        this.graphics.setVisible(true);
        this.scene.tweens.add({
            targets: this.graphics,
            props: {
                x: { value: 0, duration: 750, ease: 'Linear', delay: 250 },
            },
            onComplete: onDone.bind(context)
        });
    }
}
class SplashScreen {
    constructor(scene, onDone, context) {
        let gtmkSprite = scene.add.sprite(320 / 2, 320 / 2, 'splash_sheet');
        let gmtkAnimation = new Animator(scene, gtmkSprite, null);
        gmtkAnimation.createAnimation('splash', 'splash_sheet', 'gmtk-intro_', 65, 30, 0);
        gtmkSprite.play('splash');
        gtmkSprite.once('animationcomplete', () => {
            gmtkAnimation.destroy();
            onDone.call(context);
        });
        gtmkSprite.setDepth(12);
    }
}
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
class Entity {
    constructor(hitbox) {
        this._hitbox = hitbox;
        this.speed = new Phaser.Math.Vector2();
        this.solidTileTypes = [];
        this.damageTileTypes = [];
    }
    get hitbox() {
        return this._hitbox;
    }
    get nextHitbox() {
        return new Phaser.Geom.Rectangle(this.x + this.speed.x * TimeUtil.getElapsed(), this.y + this.speed.y * TimeUtil.getElapsed(), this.hitbox.width, this.hitbox.height);
    }
    get x() { return this._hitbox.x; }
    get y() { return this._hitbox.y; }
    set x(x) { this._hitbox.x = x; }
    set y(y) { this._hitbox.y = y; }
    get position() {
        return new Phaser.Math.Vector2(this.hitbox.x, this.hitbox.y);
    }
    moveX() {
        this._hitbox.x += this.speed.x * TimeUtil.getElapsed();
    }
    moveY() {
        this._hitbox.y += this.speed.y * TimeUtil.getElapsed();
    }
}
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
class Level {
    constructor(scene, map) {
        this.entities = [];
        this.collidables = [];
        this.map = map;
        this.scene = scene;
        this.collisionManager = new CollisionManager(this);
    }
    update() {
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].update();
        }
        for (let i = 0; i < this.collidables.length; i++) {
            this.collisionManager.moveCollidable(this.collidables[i]);
        }
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].lateUpdate();
        }
    }
    addCollidable(collidable) {
        this.collidables.push(collidable);
    }
    addEntity(entity) {
        this.entities.push(entity);
    }
    destroy() {
        this.map.destroy();
        TimeManager.tileAnimations.clear();
        for (let i = 0; i < this.entities.length; i++) {
            this.entities[i].destroy();
        }
        this.entities.splice(0, this.entities.length);
        this.collidables.splice(0, this.collidables.length);
    }
}
const FLIPPED_HORIZONTALLY_FLAG = 0x80000000;
const FLIPPED_VERTICALLY_FLAG = 0x40000000;
const FLIPPED_DIAGONALLY_FLAG = 0x20000000;
class LevelLoader {
    constructor(scene) {
        this.scene = scene;
    }
    preloadLevelJson() {
        this.scene.load.json('levels', 'assets/levels.json');
    }
    preloadSpritesheets() {
        this.scene.load.spritesheet('main_tileset', 'assets/tileset.png', { frameWidth: TILE_WIDTH, frameHeight: TILE_HEIGHT });
    }
    init() {
        this.jsonData = this.scene.cache.json.get('levels');
    }
    exists(name) {
        return this.jsonData[name] != undefined;
    }
    getName(num) {
        let levelNumString = num < 10 ? '0' + num : num.toString();
        return 'level' + levelNumString;
    }
    create(name) {
        let levelJson = this.jsonData[name];
        let tilesetJson = this.jsonData['tilesets_data'][levelJson['tileset_name']];
        TilesetManager.tilesetJson = tilesetJson;
        TilesetManager.tilesetName = levelJson['tileset_name'];
        let iceSpawn = levelJson['ice_spawn'];
        let fireSpawn = levelJson['fire_spawn'];
        let fireCharState = PlayerStates.Sleep; //fireSpawn.sleep ? PlayerStates.Sleep : PlayerStates.Idle;
        let iceCharState = PlayerStates.Sleep; //iceSpawn.sleep ? PlayerStates.Sleep : PlayerStates.Idle;
        let level = new Level(this.scene, this.createTilemap(levelJson, tilesetJson));
        let firePlayer = new FirePlayer(this.scene, new Phaser.Math.Vector2(fireSpawn.x, fireSpawn.y + 16), fireCharState);
        level.addEntity(firePlayer);
        level.addCollidable(firePlayer);
        let icePlayer = new IcePlayer(this.scene, new Phaser.Math.Vector2(iceSpawn.x, iceSpawn.y + 16), iceCharState);
        level.addEntity(icePlayer);
        level.addCollidable(icePlayer);
        this.scene.icePlayer = icePlayer;
        this.scene.firePlayer = firePlayer;
        if (!fireSpawn.sleep)
            this.scene.startingPlayers.push(firePlayer);
        if (!iceSpawn.sleep)
            this.scene.startingPlayers.push(icePlayer);
        return level;
    }
    createTilemap(levelJson, tilesetJson) {
        let gridCellsX = levelJson['gridCellsX'];
        let gridCellsY = levelJson['gridCellsY'];
        let tilesData = levelJson['tiles'];
        let tiles = [];
        for (let i = 0; i < tilesData.length; i++) {
            let tileId = tilesData[i];
            let rotation = 0;
            if (tileId >= FLIPPED_DIAGONALLY_FLAG) {
                rotation = this.getRotation(tileId);
                tileId &= ~(FLIPPED_HORIZONTALLY_FLAG | FLIPPED_VERTICALLY_FLAG | FLIPPED_DIAGONALLY_FLAG);
            }
            let cellX = i % gridCellsX;
            let cellY = Math.floor(i / gridCellsX);
            let posX = cellX * TILE_WIDTH;
            let posY = cellY * TILE_HEIGHT;
            let sprite = null;
            if (tileId >= 0) {
                sprite = this.makeSprite(tileId, posX, posY, rotation, levelJson['tileset_name']);
            }
            let tileType = TilesetManager.getTileTypeFromID(tileId);
            let hitbox = TilesetManager.getTileHitbox(tileId, posX, posY, rotation);
            tiles.push(new Tile(sprite, tileType, tileId, cellX, cellY, posX, posY, hitbox));
        }
        return new Tilemap(tiles, gridCellsX, gridCellsY, TILE_WIDTH, TILE_HEIGHT);
    }
    getLayers(levelJson) {
        return {
            default: levelJson['layers'][0],
            entities: levelJson['entities'][0]
        };
    }
    makeSprite(tileId, posX, posY, rotation, tilesetName) {
        let sprite = this.scene.add.sprite(posX + TILE_WIDTH / 2, posY + TILE_WIDTH / 2, tilesetName, tileId);
        sprite.setOrigin(0.5, 0.5);
        sprite.setRotation(rotation);
        return sprite;
    }
    getRotation(tileId) {
        let flippedH = (tileId & FLIPPED_HORIZONTALLY_FLAG) > 0;
        let flippedV = (tileId & FLIPPED_VERTICALLY_FLAG) > 0;
        let flippedD = (tileId & FLIPPED_DIAGONALLY_FLAG) > 0;
        if (!flippedH && flippedV && flippedD) {
            return 1.5 * Math.PI; //270
        }
        else if (!flippedH && !flippedV && flippedD) {
            return 0.5 * Math.PI; // 90
        }
        else if (flippedV && !flippedD) {
            return Math.PI;
        }
        console.error("the tileId is stored as if it has been rotated/flipped, but the code does not recognize it");
        return 0;
    }
}
var TileTypes;
(function (TileTypes) {
    TileTypes[TileTypes["Empty"] = 0] = "Empty";
    TileTypes[TileTypes["Solid"] = 1] = "Solid";
    TileTypes[TileTypes["SemiSolid"] = 2] = "SemiSolid";
    TileTypes[TileTypes["Grass"] = 3] = "Grass";
    TileTypes[TileTypes["Ice"] = 4] = "Ice";
    TileTypes[TileTypes["Fire"] = 5] = "Fire";
    TileTypes[TileTypes["Water"] = 6] = "Water";
    TileTypes[TileTypes["Torch"] = 7] = "Torch";
    TileTypes[TileTypes["GoldTorch"] = 8] = "GoldTorch";
})(TileTypes || (TileTypes = {}));
const MappedTileTypes = new Map([
    [TileTypes.Ice, 9],
    [TileTypes.Grass, 23],
    [TileTypes.Fire, 25],
    [TileTypes.Water, 36],
]);
class Tile {
    //private debug:Phaser.GameObjects.Graphics;
    constructor(sprite, tiletype, tileId, cellX, cellY, posX, posY, hitbox) {
        this.position = new Phaser.Geom.Point(posX, posY);
        this.cellX = cellX;
        this.cellY = cellY;
        this.hitbox = hitbox;
        this.sprite = sprite;
        this.originalTiletype = tiletype;
        this.changeTileId(tileId, tiletype);
        if (tileId > 0) {
            TilesetManager.startTileAnimation(this, tileId);
        }
        // if (this.sprite) {
        //     this.debug = elroy.add.graphics({ fillStyle: { color: 0xFF, alpha: 1 } });
        //     this.debug.fillRectShape(hitbox);
        // }
    }
    get id() { return 'tile' + this.cellX.toString() + '-' + this.cellY.toString(); }
    get isSemisolid() { return this.tiletype == TileTypes.SemiSolid || this.tiletype == TileTypes.Torch || this.tiletype == TileTypes.GoldTorch; }
    get isSolid() { return this.tiletype == TileTypes.Solid || this.tiletype == TileTypes.Ice; }
    get canStandOn() { return this.isSolid || this.isSemisolid; }
    makeEmpty() {
        this.tiletype = TileTypes.Empty;
        this.sprite.destroy();
        if (this.particleEmitter) {
            this.particleEmitter.stop();
        }
    }
    changeTileId(newTileId, tiletype) {
        if (tiletype != TileTypes.Empty) {
            this.sprite.setFrame(newTileId);
        }
        this.tileId = newTileId;
        this.tiletype = tiletype;
        if (this.particleEmitter && this.originalTiletype != TileTypes.Water) {
            ParticleManager.removeEmitter(this.particleEmitter);
            this.particleEmitter = null;
        }
        else if (this.particleEmitter) {
            this.particleEmitter.stop();
        }
        switch (tiletype) {
            case TileTypes.Fire:
                this.particleEmitter = ParticleManager.createEmitter({
                    x: this.hitbox.centerX,
                    y: this.hitbox.top,
                    lifespan: { min: 260, max: 310 },
                    speed: { min: 8, max: 12 },
                    angle: { min: 270 - 10, max: 270 + 10 },
                    scale: { start: 1, end: 0, ease: 'Power3' },
                    frequency: 48,
                    emitZone: { source: new Phaser.Geom.Rectangle(-2, -3, 4, -1) },
                    frame: 'flame-particle_00.png',
                });
                this.particleEmitter.setTint(0xFF0000);
                break;
            case TileTypes.GoldTorch:
                this.particleEmitter = ParticleManager.createEmitter({
                    x: this.hitbox.centerX,
                    y: this.hitbox.top,
                    lifespan: { min: 300, max: 400 },
                    speed: { min: 32, max: 48 },
                    angle: { min: 270 - 28, max: 270 + 28 },
                    scale: { start: 0.1, end: 1, ease: 'Cubic' },
                    alpha: { start: 1, end: 0.12, ease: 'Quint' },
                    frequency: 32,
                    emitZone: { source: new Phaser.Geom.Rectangle(-6, 0, 12, 1) },
                    frame: 'sparkle_00.png',
                });
                this.particleEmitter.setTint(0xf7ec8a);
                break;
            case TileTypes.Ice:
                this.particleEmitter = ParticleManager.createEmitter({
                    x: this.hitbox.x,
                    y: this.hitbox.y,
                    lifespan: { min: 300, max: 400 },
                    speed: { min: 1, max: 7 },
                    angle: { min: 0, max: 360 },
                    //scale: { start: 1, end: 0.12, ease: '' },
                    alpha: { start: 1, end: 0.5, ease: 'Linear' },
                    frequency: 6,
                    emitZone: { source: new Phaser.Geom.Rectangle(0, 0, this.hitbox.width, this.hitbox.height) },
                    frame: 'melt_00.png',
                });
                this.particleEmitter.setTint(0xFFFFFF);
                this.particleEmitter.stop();
                if (this.originalTiletype == TileTypes.Water) {
                    this.particleEmitter.explode(10, this.hitbox.x, //RandomUtil.randomFloat(this.hitbox.x, this.hitbox.x + this.hitbox.width),
                    this.hitbox.y);
                    AudioManager.sounds.freeze.play({ volume: 0.24 });
                }
                break;
        }
    }
    destroy() {
        if (this.sprite) {
            this.sprite.destroy();
        }
        if (this.particleEmitter) {
            ParticleManager.removeEmitter(this.particleEmitter);
        }
    }
}
class Tilemap {
    constructor(tiles, gridCellsX, gridCellsY, tileWidth, tileHeight) {
        this.tiles = tiles;
        this.gridCellsX = gridCellsX;
        this.gridCellsY = gridCellsY;
        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }
    getTile(cellX, cellY) {
        return this.tiles[cellX + (cellY * this.gridCellsX)];
    }
    getTilesFromRect(rect, margin = 0) {
        return this.getTilesFromTo(this.toGridLocation(rect.x - margin, rect.y - margin), this.toGridLocation(rect.right + margin, rect.bottom + margin));
    }
    getTilesFromCircle(circle, margin = 0) {
        return this.getTilesFromTo(this.toGridLocation(circle.left - margin, circle.top - margin), this.toGridLocation(circle.right + margin, circle.bottom + margin));
    }
    getTilesFromTo(from, to) {
        let tiles = [];
        for (let x = from.x; x <= to.x; x++) {
            for (let y = from.y; y <= to.y; y++) {
                let tile = this.getTile(x, y);
                if (tile) {
                    tiles.push(tile);
                }
            }
        }
        return tiles;
    }
    getTileNextTo(tile, x, y) {
        return this.getTile(tile.cellX + x, tile.cellY + y);
    }
    worldToTile(x, y) {
        return this.getTile(this.tocellXumn(x), this.tocellY(y));
    }
    tocellXumn(xPos) {
        return Math.floor(xPos / this.tileWidth);
    }
    tocellY(yPos) {
        return Math.floor(yPos / this.tileHeight);
    }
    toGridLocation(x, y) {
        return new Phaser.Geom.Point(this.tocellXumn(x), this.tocellY(y));
    }
    toWorldX(cellXumn) {
        return cellXumn * this.tileWidth;
    }
    toWorldY(cellY) {
        return cellY * this.tileHeight;
    }
    toWorldPosition(cellX, cellY) {
        return new Phaser.Geom.Point(this.toWorldX(cellX), this.toWorldY(cellY));
    }
    destroy() {
        while (this.tiles.length > 0) {
            this.tiles[0].destroy();
            this.tiles.splice(0, 1);
        }
    }
}
class TilesetManager {
    constructor() { }
    static getTileTypeFromID(tileId) {
        if (tileId < 0) {
            return TileTypes.Empty;
        }
        let tiletypes = this.tilesetJson['tiletypes'];
        if (tiletypes['solid'].indexOf(tileId) >= 0) {
            return TileTypes.Solid;
        }
        if (tiletypes['semisolid'].indexOf(tileId) >= 0) {
            return TileTypes.SemiSolid;
        }
        if (tiletypes['ice'].indexOf(tileId) >= 0) {
            return TileTypes.Ice;
        }
        if (tiletypes['water'].indexOf(tileId) >= 0) {
            return TileTypes.Water;
        }
        if (tiletypes['grass'].indexOf(tileId) >= 0) {
            return TileTypes.Grass;
        }
        if (tiletypes['fire'].indexOf(tileId) >= 0) {
            return TileTypes.Fire;
        }
        if (tiletypes['torch'].indexOf(tileId) >= 0) {
            return TileTypes.Torch;
        }
        if (tiletypes['goldtorch'].indexOf(tileId) >= 0) {
            return TileTypes.GoldTorch;
        }
        return TileTypes.Empty;
    }
    /**
     * Start a repeating tile animation
     * @param sprite
     * @param tileId
     * @returns
     */
    static startTileAnimation(tile, tileId) {
        if (this.tilesetJson['animations'][tileId] === undefined) {
            if (tile.sprite.anims.isPlaying) {
                tile.sprite.stop();
            }
            if (TimeManager.tileAnimations.has(tile.id)) {
                TimeManager.tileAnimations.delete(tile.id);
            }
            return;
        }
        let amountOfFrames = this.tilesetJson['animations'][tileId];
        let key = 'tile' + tileId;
        let frames = tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tileId, end: tileId + amountOfFrames - 1 });
        tile.sprite.anims.create({
            key: key,
            frames: frames,
            frameRate: 0,
            repeat: -1
        });
        tile.sprite.play(key);
        TimeManager.tileAnimations.set(tile.id, tile.sprite.anims);
    }
    static changeTileType(tile, tileType) {
        let tileId = MappedTileTypes.get(tileType);
        tile.hitbox = this.getTileHitbox(tileId, tile.position.x, tile.position.y, 0); //TODO: rotation not taken into account
        tile.changeTileId(tileId, tileType);
        this.startTileAnimation(tile, tileId);
    }
    /**
     * Play single tile animation
     * @param sprite
     * @param tileId
     * @returns
     */
    static playAnimationOnTile(tile, frames, onDone) {
        if (tile.sprite.anims.isPlaying) {
            tile.sprite.stop();
            tile.sprite.anims.remove('tile' + tile.tileId);
        }
        let key = 'tile' + tile.tileId;
        tile.sprite.anims.create({
            key: key,
            frames: tile.sprite.anims.generateFrameNumbers(this.tilesetName, { start: tile.tileId, end: tile.tileId + frames - 1 }),
            frameRate: 10,
            repeat: 0
        });
        tile.sprite.play(key);
        tile.sprite.once('animationcomplete', onDone);
        if (tile.particleEmitter) {
            tile.particleEmitter.frequency = 6;
            tile.particleEmitter.start();
        }
    }
    static getTileHitbox(tileId, posX, posY, rotation) {
        let hitboxData = this.tilesetJson['customHitboxes'][tileId.toString()];
        let width = TILE_WIDTH;
        let height = TILE_HEIGHT;
        let hitbox = new Phaser.Geom.Rectangle(posX, posY, width, height);
        if (!hitboxData)
            return hitbox;
        if (hitboxData['x'])
            hitbox.x += hitboxData['x'];
        if (hitboxData['y'])
            hitbox.y += hitboxData['y'];
        if (hitboxData['width'])
            hitbox.width = hitboxData['width'];
        if (hitboxData['height'])
            hitbox.height = hitboxData['height'];
        return this.rotateTileHitbox(hitbox, rotation);
    }
    static rotateTileHitbox(hitbox, rotation) {
        if (rotation == 0)
            return hitbox;
        let offsetY = TILE_HEIGHT - hitbox.height;
        let degree = Phaser.Math.RadToDeg(rotation);
        switch (degree) {
            case -90:
            case 270:
                hitbox.x += offsetY;
                hitbox.width = TILE_HEIGHT - offsetY;
                hitbox.y -= offsetY;
                hitbox.height = TILE_HEIGHT;
                break;
            case 90:
            case -270:
                hitbox.width = TILE_HEIGHT - offsetY;
                hitbox.y -= offsetY;
                hitbox.height = TILE_HEIGHT;
                break;
            case 180:
            case -180:
                hitbox.y -= offsetY;
                break;
        }
        return hitbox;
    }
}
var PlayerStates;
(function (PlayerStates) {
    PlayerStates[PlayerStates["Idle"] = 0] = "Idle";
    PlayerStates[PlayerStates["Walk"] = 1] = "Walk";
    PlayerStates[PlayerStates["Fall"] = 2] = "Fall";
    PlayerStates[PlayerStates["Jump"] = 3] = "Jump";
    PlayerStates[PlayerStates["Crouch"] = 4] = "Crouch";
    PlayerStates[PlayerStates["Sleep"] = 5] = "Sleep";
    PlayerStates[PlayerStates["Dead"] = 6] = "Dead";
})(PlayerStates || (PlayerStates = {}));
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
class FirePlayer extends BasePlayer {
    constructor(scene, spawnPosition, startingState) {
        super(scene, spawnPosition, startingState, new BasePlayerView('firechar', 0xFF0000));
        //this.damageTileTypes.push(TileTypes.Water);
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Ice) {
                if (CollisionUtil.hitboxesAligned(result.tiles[i].hitbox, this.hitbox)) {
                    if (!result.tiles[i].sprite.anims.isPlaying) {
                        AudioManager.sounds.melt.play({ volume: 0.2 });
                        TilesetManager.playAnimationOnTile(result.tiles[i], 5, () => {
                            if (result.tiles[i].originalTiletype == TileTypes.Ice) {
                                result.tiles[i].makeEmpty();
                            }
                            else {
                                TilesetManager.changeTileType(result.tiles[i], result.tiles[i].originalTiletype);
                            }
                        });
                    }
                }
            }
            else if (result.tiles[i].tiletype == TileTypes.Grass) {
                if (Phaser.Geom.Rectangle.Overlaps(result.tiles[i].hitbox, this.hitbox)) {
                    TilesetManager.changeTileType(result.tiles[i], TileTypes.Fire);
                    AudioManager.sounds.fire.play({ volume: 0.24 });
                }
            }
            else if (result.tiles[i].tiletype == TileTypes.Water && this.stateMachine.currentStateKey != PlayerStates.Dead) {
                if (Phaser.Geom.Rectangle.Overlaps(result.tiles[i].hitbox, this.hitbox)) {
                    this.die();
                }
            }
        }
    }
}
class IcePlayer extends BasePlayer {
    constructor(scene, spawnPosition, startingState) {
        super(scene, spawnPosition, startingState, new BasePlayerView('icechar', 0x8be1eb));
        this.solidTileTypes.push(TileTypes.Water);
        this.damageTileTypes.push(TileTypes.Fire);
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
        for (let i = 0; i < result.tiles.length; i++) {
            if (result.tiles[i].tiletype == TileTypes.Water) {
                if (CollisionUtil.hitboxVerticallyAligned(this.hitbox, result.tiles[i].hitbox)) {
                    TilesetManager.changeTileType(result.tiles[i], TileTypes.Ice);
                }
            }
        }
        let firePlayerState = GameScene.instance.firePlayer.getStateMachine().currentStateKey;
        if (firePlayerState != PlayerStates.Sleep && firePlayerState != PlayerStates.Dead &&
            this.stateMachine.currentStateKey != PlayerStates.Sleep && this.stateMachine.currentStateKey != PlayerStates.Dead) {
            if (Phaser.Geom.Rectangle.Overlaps(GameScene.instance.firePlayer.hitbox, this.hitbox)) {
                this.die();
            }
        }
    }
}
class IcePlayerView {
}
var PlayerStats;
(function (PlayerStats) {
    PlayerStats.JumpPower = 15;
    PlayerStats.InitialJumpPower = 198;
    PlayerStats.RunAcceleration = 20;
    PlayerStats.RunSpeed = 100;
    PlayerStats.Gravity = 16;
    PlayerStats.MaxFallSpeed = 220;
})(PlayerStats || (PlayerStats = {}));
class PlayerAirborneState {
    constructor() { }
    enter() {
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
        if (result.onBottom) {
            this.onLand();
        }
        else if (result.onTop) {
            this.headbonk();
        }
    }
    updateGravity(gravity = PlayerStats.Gravity, maxFallSpeed = PlayerStats.MaxFallSpeed) {
        if (this.machine.owner.speed.y < maxFallSpeed) {
            this.machine.owner.speed.y = Math.min(this.machine.owner.speed.y + gravity, maxFallSpeed);
        }
    }
    onLand() {
        this.machine.owner.speed.y = 0;
        let state = this.machine.owner.speed.x == 0 ? PlayerStates.Idle : PlayerStates.Walk;
        this.machine.changeState(state);
        this.machine.owner.view.playLandParticles();
        this.machine.owner.view.animator.squish(1.1, 0.6, 200);
    }
    headbonk() {
        this.machine.owner.speed.y = 0;
    }
}
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
class PlayerDeadState {
    constructor() {
    }
    enter() {
        AudioManager.sounds.dead.play({ volume: 0.1 });
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
    }
}
class PlayerFallState extends PlayerAirborneState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        this.updateGravity();
    }
    leave() {
    }
    onCollisionSolved(result) {
        super.onCollisionSolved(result);
    }
}
class PlayerIdleState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x != 0) {
            this.machine.changeState(PlayerStates.Walk);
        }
        super.update();
    }
    leave() {
    }
}
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
class PlayerSleepState extends PlayerGroundedState {
    constructor() {
        super();
    }
    enter() {
    }
    update() {
    }
    leave() {
    }
    onCollisionSolved(result) {
    }
}
class PlayerWalkState extends PlayerGroundedState {
    constructor() {
        super();
        this.particleTimer = 0;
    }
    enter() {
        this.particleTimer = 0;
    }
    update() {
        this.particleTimer++;
        if (this.particleTimer == 12) {
            this.particleTimer = 0;
            this.machine.owner.view.playWalkParticles();
        }
        this.machine.owner.updateMovementControls();
        if (this.machine.owner.speed.x == 0) {
            this.machine.changeState(PlayerStates.Idle);
        }
        super.update();
    }
    leave() {
    }
}
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
let ParticleManager;
let ShouldExplainCrouch = true;
var NumberUtil;
(function (NumberUtil) {
    /**
     * Returns an integer that indicates the sign of a number.
     */
    function sign(value) {
        return value == 0 ? 0 : value > 0 ? 1 : -1;
    }
    NumberUtil.sign = sign;
    function lerp(start, stop, amount) {
        if (amount > 1) {
            amount = 1;
        }
        else if (amount < 0) {
            amount = 0;
        }
        return start + (stop - start) * amount;
    }
    NumberUtil.lerp = lerp;
})(NumberUtil || (NumberUtil = {}));
class RandomUtil {
    constructor() { }
    static randomInt(min, max) {
        return Math.round(this.randomFloat(Math.ceil(min), Math.floor(max)));
    }
    static randomFloat(min, max) {
        return Math.random() * (max - min) + min;
    }
}
class TimeUtil {
    constructor() {
    }
    static getElapsed() {
        return this.currentElapsedMS / 1000;
    }
    static getElapsedMS() {
        return this.currentElapsedMS;
    }
    static getTimeDifferenceMSMM(firstDate, secondDate) {
        var millisecondsDifference = Math.floor(this.getMillisecondsDifference(firstDate, secondDate));
        var secondsDifference = Math.floor(this.getSecondsDifference(firstDate, secondDate));
        var minutesDifference = Math.floor(this.getMinutesDifference(firstDate, secondDate));
        millisecondsDifference -= secondsDifference * 1000;
        secondsDifference -= minutesDifference * 60;
        return {
            minutes: minutesDifference,
            seconds: secondsDifference,
            milliseconds: millisecondsDifference
        };
    }
    static getSecondsDifference(firstDate, secondDate) {
        return (secondDate.getTime() / 1000) - (firstDate.getTime() / 1000);
    }
    static getMillisecondsDifference(firstDate, secondDate) {
        return secondDate.getTime() - firstDate.getTime();
    }
    static getMinutesDifference(firstDate, secondDate) {
        return this.getSecondsDifference(firstDate, secondDate) / 60;
    }
}
TimeUtil.currentElapsedMS = (1 / 60) * 1000;