class Credits extends Phaser.Scene {
    constructor() {
        super("creditsScene");
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
        this.add.text(game.config.width/2, 40, 'CREDITS', menuKeyConfig).setOrigin(0.5);

        // show instructions text
        menuKeyConfig.align = 'left';
        menuKeyConfig.fontSize = '15px';
        menuKeyConfig.color = '#FFFFFF';
        this.add.text(game.config.width/2, 100, 'Programming\n\nArt\n\nSound Effects\n\nMusic', menuKeyConfig).setOrigin(0.5);
        menuKeyConfig.align = 'right';
        menuKeyConfig.color = '#A9A9A9';
        this.add.text(game.config.width/2, 100, '\nDaniel Do\n\nDaniel Do\n\nPixabay.com\n\n"Ancient Dragon - Classic JRPG Music Pack" by Rest!', menuKeyConfig).setOrigin(0.5);
        menuKeyConfig.align = 'center';
        menuKeyConfig.color = '#FFD700';
        this.add.text(game.config.height/2, game.config.height/2 + 130, 'Press B to go back', menuKeyConfig).setOrigin(0.5);

        // define keys
        keyB = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.B);
    }

    update()
    {
        if(keyB.isDown)
        {
            this.scene.start('menuScene');
        }
    }
}