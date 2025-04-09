import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Home extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    constructor ()
    {
        super('Game');
    }   

    messageHandler(message: any) {
        console.log('Message from NATS:', message.json().content);
        if (!this.sys.isActive()) {
            return;
        }
        this.gameText = this.add.text(512, 384, message.json().content, {
            fontFamily: 'Arial Black',
            fontSize: 38,
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);
    };

    create ()
    {
        this.camera = this.cameras.main;
        this.camera.setBackgroundColor(0x00ff00);

        this.background = this.add.image(512, 384, 'background');
        this.background.setAlpha(0.5);

        this.gameText = this.add.text(512, 384, '', {
            fontFamily: 'Arial Black', fontSize: 38, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5).setDepth(100);

        EventBus.emit('current-scene-ready', this);
        
    
        EventBus.on('message', this.messageHandler, this)
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}