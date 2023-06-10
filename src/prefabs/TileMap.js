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