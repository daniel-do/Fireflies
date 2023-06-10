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