const config = {
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
    scene: [GameScene],
};
const game = new Phaser.Game(config);

let TILE_WIDTH = 16;
let TILE_HEIGHT = 16;

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

var PlayerStats;
(function (PlayerStats) {
    PlayerStats.JumpPower = 15;
    PlayerStats.InitialJumpPower = 198;
    PlayerStats.RunAcceleration = 20;
    PlayerStats.RunSpeed = 100;
    PlayerStats.Gravity = 16;
    PlayerStats.MaxFallSpeed = 220;
})(PlayerStats || (PlayerStats = {}));

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

TimeUtil.currentElapsedMS = (1 / 60) * 1000;