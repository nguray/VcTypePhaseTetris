import Phaser from 'phaser'
import GameGlobals from './GameGlobals'
import GameScene from './GameScene'
import Tetromino from './Tetromino'


export default class TitleScene extends Phaser.Scene {

	  private graphics!: Phaser.GameObjects.Graphics;

    private keySpace: Phaser.Input.Keyboard.Key | undefined;
    private textLine1!: Phaser.GameObjects.Text;
    private textLine2!: Phaser.GameObjects.Text;
    private textLine3!: Phaser.GameObjects.Text;

    startTime:  number = 0;
    startTimeR: number = 0;
    startTimeT: number = 0;
  
    constructor() {
      super("scene-title");
    }

    preload() {
    
    }
  
    create() {
      
      this.graphics = this.add.graphics({ lineStyle: { width: 2, color: 0x00ff00 }, fillStyle: { color: 0xff0000 }});
      //const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
      const boardCenterX = GameGlobals.BOARD_LEFT + Math.trunc(GameGlobals.NB_COLUMNS/2)*GameGlobals.CELL_SIZE;

      let y = GameGlobals.BOARD_TOP+5*GameGlobals.CELL_SIZE;

      this.textLine1 = this.add.text(boardCenterX, y, '--', {
        fontFamily: 'sansation',
        fontSize : 22,
        fontStyle : 'bold',
        color: '#ffff00'
      }).setOrigin(0.5,0.5);

      y += 1.5*GameGlobals.CELL_SIZE;
      this.textLine2 = this.add.text(boardCenterX, y, '--', {
        fontFamily: 'sansation',
        fontSize : 20,
        fontStyle : 'bold',
        color: '#ffff00'
      }).setOrigin(0.5,0.5);

      y += 1.5*GameGlobals.CELL_SIZE;
      this.textLine3 = this.add.text(boardCenterX, y, '--', {
        fontFamily: 'sansation',
        fontSize : 20,
        fontStyle : 'bold',
        color: '#ffff00'
      }).setOrigin(0.5,0.5);
      

      if (this.input.keyboard){
        this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
        this.keySpace.on('down', (event: KeyboardEvent)=>{
            console.log("SPACE press");
            this.scene.start('scene-game', GameScene);
        });
      }

    }
  
    update(timestep: number, dt: number){
  
      const curTime = Math.trunc(timestep);
      if (this.startTime==0){
        this.startTime = curTime;

      }else if ((curTime-this.startTime)>100){

        //-- Rotate nextTetromino 
        if ((curTime-this.startTimeR)>750){
          this.startTimeR = curTime;
          GameGlobals.nextTetromino.rotateRight();
      
        }

        //-- Change Tetromino Shape
        if ((curTime-this.startTimeT)>10000){
          this.startTimeT = curTime;
          GameGlobals.nextTetromino.initShape(Tetromino.tetrisRandomizer());
        }

        //-----------------------------------
        this.graphics.clear();

        this.graphics.fillStyle(0x000030);
        this.graphics.fillRect( GameGlobals.BOARD_LEFT, GameGlobals.BOARD_TOP,
           GameGlobals.NB_COLUMNS*GameGlobals.CELL_SIZE, GameGlobals.NB_ROWS*GameGlobals.CELL_SIZE);  
    
        this.textLine1.setText('Tetris in Typescript');
        this.textLine2.setText('using Phaser 3');  
        this.textLine3.setText('Press SPACE to Play');

        GameGlobals.nextTetromino.draw(this.graphics);
        

      }
  
    }
  
  }
  