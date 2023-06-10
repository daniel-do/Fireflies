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