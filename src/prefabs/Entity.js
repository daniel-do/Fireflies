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