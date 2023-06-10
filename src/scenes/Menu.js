class Menu extends Phaser.Scene {
    constructor() {
        super("menuScene");
    }

    preload()
    {
    }

    create() 
    {
        let menuKeyConfig = 
        {
            fontFamily: 'Courier',
            fontSize: '50px',
            backgroundColor: '#CC000000',
            color: '#FFD700',
            align: 'center',
            padding:
            {
                top: 5,
                bottom: 5,
            },
            fixedWidth: 0
        }
        // show menu title text
        this.add.text(game.config.width/2, 40, 'FIREFLIES', menuKeyConfig).setOrigin(0.5);

        // show instructions text
        menuKeyConfig.fontSize = '15px';
        menuKeyConfig.color = '#FFFFFF';
        this.add.text(game.config.width/2, 100, 'Try to get to the golden torch\nwith both flames for each level', menuKeyConfig).setOrigin(0.5);

        // show menu key text
        menuKeyConfig.align = 'left';
        menuKeyConfig.color = '#A9A9A9';
        this.add.text(game.config.width/2, game.config.height/2 + 40, 'Controls\n\n↑     - Jump\n← / → - Move\n↓     - Crouch / Swap character\n\t\t\t\t\t\t\t\t(if you\'re on a torch)\nR     - Reset the level', menuKeyConfig).setOrigin(0.5);

        menuKeyConfig.align = 'center';
        menuKeyConfig.color = '#FFD700';
        this.add.text(game.config.height/2, game.config.height/2 + 130, 'Press SPACE to start', menuKeyConfig).setOrigin(0.5);

        // define keys
        keySPACE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    }

    update()
    {
        if(keySPACE.isDown)
        {
            this.scene.start('GameScene');
        }
    }
}