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