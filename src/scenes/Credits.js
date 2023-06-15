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
        menuKeyConfig.fontSize = '15px';
        menuKeyConfig.color = '#FFFFFF';
        this.add.text(game.config.width/2, 150, 'Programming\n\n\nArt & Design\n\n\nSound Effects\n\n\nMusic', menuKeyConfig).setOrigin(0.5);
        menuKeyConfig.color = '#A9A9A9';
        this.add.text(game.config.width/2, 150, '\n\n\nDaniel Do\n\n\nDaniel Do\n\n\nPixabay.com\n\n\n"Ancient Dragon -\nClassic JRPG Music Pack" by Rest!', menuKeyConfig).setOrigin(0.5);
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