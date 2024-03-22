import Phaser from 'phaser'
import GameGlobals from './GameGlobals'
import TitleScene from './TitleScene'


export default class HighScoreScene extends Phaser.Scene {

    private textTitle!: Phaser.GameObjects.Text;
  
    userNames?: Array<Phaser.GameObjects.Text>;

    userScores?: Array<Phaser.GameObjects.Text>;
  
    iSelectColor = 0;
    startTimeColor = 0;
    startTime = 0;
    fUpdateText: boolean = false;
  
    constructor() {
      super("high-score");
    }

    preload() {
    
    }
  
    create() {
      
      this.startTime = 0;
      this.startTimeColor = 0;

      // Phaser.GameObjects.Text
      //console.log("<<< CREATE HIGHSCORES >>>");
      //console.log(GameGlobals.highScores);

      const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
      this.textTitle = this.add.text(screenCenterX, GameGlobals.BOARD_TOP + GameGlobals.CELL_SIZE, 'HIGH SCORES', {
        fontFamily: 'sansation',
        fontSize : 22,
        fontStyle : 'bold',
        color: '#ffff00'
      }).setOrigin(0.5,0.5);
  
      this.userNames = Array(
          this.add.text( 0, 0, "sss1"),
          this.add.text( 0, 0, "sss2"),
          this.add.text( 0, 0, "sss3"),
          this.add.text( 0, 0, "sss4"),
          this.add.text( 0, 0, "sss5"),
          this.add.text( 0, 0, "sss6"),
          this.add.text( 0, 0, "sss7"),
          this.add.text( 0, 0, "sss8"),
          this.add.text( 0, 0, "sss9"),
          this.add.text( 0, 0, "sss10")
      );

      this.userScores = Array(
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000"),
        this.add.text( 0, 0, "000000")
    );

      let y = GameGlobals.BOARD_TOP + 4*GameGlobals.CELL_SIZE;
      let x1 = 2*this.cameras.main.width / 8;
      let x2 = 4.5*this.cameras.main.width / 8;
      let s1: string;
      let s2: string;
      for (let i=0;i<10;i++){

        this.userNames[i].setFontFamily('sansation');
        this.userNames[i].setFontSize(20);
        this.userNames[i].setFontStyle('normal');
        this.userNames[i].setColor('#ffff00');
        this.userNames[i].setOrigin(0.0,0.5);
        this.userNames[i].setPosition(x1,y);
        this.userNames[i].setText(GameGlobals.highScores[i].player);

        this.userScores[i].setFontFamily('sansation');
        this.userScores[i].setFontSize(20);
        this.userScores[i].setFontStyle('normal');
        this.userScores[i].setColor('#ffff00');
        this.userScores[i].setOrigin(0.0,0.5);
        this.userScores[i].setPosition(x2,y);
        s1 = "00000" + GameGlobals.highScores[i].score;
        s2 = s1.substring(s1.length-6);
        this.userScores[i].setText(s2);

        y += GameGlobals.CELL_SIZE;
  
      }
  
      if (this.input.keyboard){
          this.input.keyboard.on("keydown", (event:KeyboardEvent) => {
            
            if (event.code=='Backspace'){
                  //--
                  if (GameGlobals.playerName.length){
                    GameGlobals.playerName = GameGlobals.playerName.substr(0, GameGlobals.playerName.length - 1);
                    GameGlobals.highScores[GameGlobals.idHighScore].player = GameGlobals.playerName;
                    this.fUpdateText = true;
                  }

              }else if (event.code=='Escape'){
                  console.log(event.code);
                  this.scene.start('scene-title', TitleScene);

              }else if ((event.code=='Enter')||(event.code=='NumpadEnter')){
                localStorage.setItem('TetrisHighScores', JSON.stringify(GameGlobals.highScores));
                this.scene.start('scene-title', TitleScene);

              }else if (GameGlobals.playerName.length<6){
                  let k = event.key.toUpperCase();
                  if (((k.length==1)&&(k>='A') && (k<='Z'))||((k.length==1)&&(k>='0') && (k<='9'))){
                    GameGlobals.playerName = GameGlobals.playerName.concat(k);
                    GameGlobals.highScores[GameGlobals.idHighScore].player = GameGlobals.playerName;
                    this.fUpdateText = true;
                  }

              }
          });
      }
  
    }
  
    update(timestep: number, dt: number){
  
        const currTime = Math.trunc(timestep);

        if ((currTime-this.startTimeColor)>500){
          this.startTimeColor = currTime;
          this.iSelectColor++;
          let color;
          if ((this.iSelectColor%2)!=0){
            color = '#ffff00';
          }else{
            color = '#cccc00';
          }

          if (this.userNames){
              this.userNames[GameGlobals.idHighScore].setColor(color);
          }
          if (this.userScores){
              this.userScores[GameGlobals.idHighScore].setColor(color);
          }
        }

        if (this.startTime==0){
            this.startTime = currTime;

        }else if ((currTime-this.startTime)>100){
          this.startTime = currTime;

          if (this.fUpdateText) {
            this.fUpdateText = false;
            if (this.userNames){
              this.userNames[GameGlobals.idHighScore].setText(GameGlobals.playerName);
            }
          }

        }
  
    }

  
  }
  