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
    scene: [Menu, GameScene, Credits],
};
var game = new Phaser.Game(config);
let keySPACE;
let keyP;
let keyC;
let keyB;